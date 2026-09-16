import {
  advancePvp,
  castPvp,
  connectPvp,
  createPvpMatch,
  disconnectPvp,
  joinPvpMatch,
  leavePvp,
  nextPvpDeadline,
  otherSlot,
  requestRematch,
  setPvpReady,
} from '../lib/pvp/engine.ts';
import {
  parseClientMessage,
  validGuestName,
  validRoomCode,
} from '../lib/pvp/protocol.ts';
import type {
  ClientMessage,
  PvpMatchState,
  PvpPresentationEvent,
  PvpSlot,
  ServerMessage,
  TrailClientMessage,
  TrailServerMessage,
} from '../lib/pvp/types.ts';

interface Env {
  MATCHES: DurableObjectNamespace;
  ALLOWED_ORIGINS?: string;
}
type StoredRoom = {
  match: PvpMatchState;
  tokens: Record<PvpSlot, string | null>;
  sequences: Record<PvpSlot, number>;
  requests: Record<PvpSlot, string[]>;
  connections: Record<PvpSlot, string | null>;
  trailConnections?: Record<PvpSlot, string | null>;
  presentationId?: number;
};
type ControlAttachment = {
  channel: 'control';
  slot: PvpSlot;
  connectionId: string;
};
type TrailAttachment = {
  channel: 'trail';
  slot: PvpSlot;
  connectionId: string;
  lastSequence: number;
  strokeId: string | null;
  nextBatch: number;
  pointCount: number;
  sourceAspectQ: number;
  startedAt: number;
  tokens: number;
  lastRefill: number;
  violations: number[];
};
type SocketAttachment = ControlAttachment | TrailAttachment;
const json = (value: unknown, status = 200, headers: HeadersInit = {}) => {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(value), {
    status,
    headers: responseHeaders,
  });
};
const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
};
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = () =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (byte) => alphabet[byte % alphabet.length],
  ).join('');
function allowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  const configured = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  try {
    const url = new URL(origin);
    if (
      configured.includes(origin) ||
      (url.protocol === 'http:' &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1'))
    )
      return origin;
  } catch {}
  return null;
}
function cors(origin: string | null): HeadersInit {
  return origin
    ? {
        'access-control-allow-origin': origin,
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type',
        vary: 'Origin',
      }
    : {};
}
function withCors(response: Response, origin: string | null) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors(origin)))
    headers.set(key, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
async function bodyName(request: Request) {
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 2048) return null;
    return validGuestName((JSON.parse(raw) as { name?: unknown }).name);
  } catch {
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = allowedOrigin(request, env);
    if (request.headers.has('origin') && !origin)
      return json({ error: 'origin-not-allowed' }, 403);
    if (request.method === 'OPTIONS')
      return new Response(null, { status: 204, headers: cors(origin) });
    const url = new URL(request.url),
      parts = url.pathname.split('/').filter(Boolean);
    if (
      request.method === 'POST' &&
      parts.length === 1 &&
      parts[0] === 'rooms'
    ) {
      const name = await bodyName(request);
      if (!name) return json({ error: 'invalid-name' }, 400, cors(origin));
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = randomCode(),
          stub = env.MATCHES.get(env.MATCHES.idFromName(code));
        const response = await stub.fetch(
          new Request(`https://room/create?code=${code}`, {
            method: 'POST',
            body: JSON.stringify({ name }),
          }),
        );
        if (response.ok) return withCors(response, origin);
      }
      return json({ error: 'room-create-failed' }, 503, cors(origin));
    }
    if (parts.length === 3 && parts[0] === 'rooms') {
      const code = validRoomCode(parts[1]);
      if (!code) return json({ error: 'invalid-room-code' }, 400, cors(origin));
      const stub = env.MATCHES.get(env.MATCHES.idFromName(code));
      if (request.method === 'POST' && parts[2] === 'join') {
        const name = await bodyName(request);
        if (!name) return json({ error: 'invalid-name' }, 400, cors(origin));
        const response = await stub.fetch(
          new Request(`https://room/join?code=${code}`, {
            method: 'POST',
            body: JSON.stringify({ name }),
          }),
        );
        return withCors(response, origin);
      }
      if (request.method === 'GET' && parts[2] === 'socket') {
        if (request.headers.get('upgrade')?.toLowerCase() !== 'websocket')
          return json({ error: 'websocket-required' }, 426, cors(origin));
        const token = url.searchParams.get('token') || '',
          channel =
            url.searchParams.get('channel') === 'trail' ? 'trail' : 'control';
        return stub.fetch(
          new Request(
            `https://room/socket?code=${code}&token=${encodeURIComponent(token)}&channel=${channel}`,
            { headers: request.headers },
          ),
        );
      }
    }
    return json({ error: 'not-found' }, 404, cors(origin));
  },
} satisfies ExportedHandler<Env>;

export class MatchRoom implements DurableObject {
  private room: StoredRoom | null = null;
  constructor(
    private ctx: DurableObjectState,
    private env: Env,
  ) {
    void env;
    void this.ctx.blockConcurrencyWhile(async () => {
      this.room = (await this.ctx.storage.get<StoredRoom>('room')) || null;
    });
  }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url),
      now = Date.now();
    if (url.pathname === '/create' && request.method === 'POST') {
      if (this.room) return json({ error: 'room-exists' }, 409);
      const name = await bodyName(request);
      if (!name) return json({ error: 'invalid-name' }, 400);
      const code = url.searchParams.get('code') || '';
      const token = randomToken();
      this.room = {
        match: createPvpMatch(code, name, now),
        tokens: { player1: token, player2: null },
        sequences: { player1: 0, player2: 0 },
        requests: { player1: [], player2: [] },
        connections: { player1: null, player2: null },
        trailConnections: { player1: null, player2: null },
      };
      await this.persist();
      return json({ code, token, slot: 'player1' });
    }
    if (url.pathname === '/join' && request.method === 'POST') {
      if (!this.room) return json({ error: 'room-not-found' }, 404);
      const name = await bodyName(request);
      if (!name) return json({ error: 'invalid-name' }, 400);
      try {
        this.room.match = joinPvpMatch(this.room.match, name, now);
      } catch (error) {
        return json({ error: (error as Error).message }, 409);
      }
      const token = randomToken();
      this.room.tokens.player2 = token;
      await this.persist();
      this.broadcastSnapshot();
      return json({ code: this.room.match.code, token, slot: 'player2' });
    }
    if (
      url.pathname === '/socket' &&
      request.headers.get('upgrade')?.toLowerCase() === 'websocket'
    ) {
      if (!this.room) return json({ error: 'room-not-found' }, 404);
      const token = url.searchParams.get('token'),
        slot = this.slotForToken(token);
      if (!slot) return json({ error: 'invalid-token' }, 401);
      const channel =
          url.searchParams.get('channel') === 'trail' ? 'trail' : 'control',
        pair = new WebSocketPair(),
        client = pair[0],
        server = pair[1],
        connectionId = randomToken();
      for (const old of this.ctx.getWebSockets(`${channel}:${slot}`))
        old.close(4001, 'Replaced by a newer connection');
      if (channel === 'trail') {
        const attachment: TrailAttachment = {
          channel,
          slot,
          connectionId,
          lastSequence: 0,
          strokeId: null,
          nextBatch: 0,
          pointCount: 0,
          sourceAspectQ: 1333,
          startedAt: 0,
          tokens: 8,
          lastRefill: now,
          violations: [],
        };
        server.serializeAttachment(attachment);
        this.ctx.acceptWebSocket(server, [`${channel}:${slot}`]);
        this.room.trailConnections ||= { player1: null, player2: null };
        this.room.trailConnections[slot] = connectionId;
        await this.persist();
        this.sendTrail(server, { type: 'trail_ready', serverNow: now });
        return new Response(null, { status: 101, webSocket: client });
      }
      this.room.connections[slot] = connectionId;
      const attachment: ControlAttachment = { channel, slot, connectionId };
      server.serializeAttachment(attachment);
      this.ctx.acceptWebSocket(server, [`${channel}:${slot}`]);
      this.room.match = connectPvp(this.room.match, slot, now);
      await this.persist();
      this.send(server, {
        type: 'welcome',
        slot,
        state: this.room.match,
        serverNow: now,
      });
      this.broadcastSnapshot(server);
      return new Response(null, { status: 101, webSocket: client });
    }
    return json({ error: 'not-found' }, 404);
  }
  async webSocketMessage(socket: WebSocket, message: string | ArrayBuffer) {
    if (!this.room) return socket.close(1011, 'Room unavailable');
    const attachment =
      socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment) return socket.close(4001, 'Missing connection state');
    if (
      attachment.channel === 'trail' &&
      this.room.trailConnections?.[attachment.slot] !== attachment.connectionId
    )
      return socket.close(4001, 'Stale trail connection');
    const parsed = parseClientMessage(message);
    if (!parsed)
      return attachment.channel === 'trail'
        ? this.sendTrail(socket, {
            type: 'trail_error',
            code: 'invalid-message',
            message: 'The trail message was malformed or too large.',
          })
        : this.send(socket, {
            type: 'error',
            code: 'invalid-message',
            message: 'The message was malformed or too large.',
          });
    if (attachment.channel === 'trail') {
      if (!parsed.type.startsWith('trail_'))
        return this.sendTrail(socket, {
          type: 'trail_error',
          code: 'wrong-channel',
          message: 'Only trail messages are accepted on this connection.',
        });
      return this.handleTrail(socket, attachment, parsed as TrailClientMessage);
    }
    if (parsed.type.startsWith('trail_'))
      return this.send(socket, {
        type: 'error',
        code: 'wrong-channel',
        message: 'Trail messages require the cosmetic connection.',
      });
    if (this.room.connections[attachment.slot] !== attachment.connectionId)
      return socket.close(4001, 'Stale connection');
    const slot = attachment.slot;
    if (parsed.sequence <= this.room.sequences[slot])
      return this.send(socket, {
        type: 'error',
        code: 'stale-sequence',
        message: 'The message sequence was already processed.',
      });
    this.room.sequences[slot] = parsed.sequence;
    const now = Date.now(),
      control = parsed as ClientMessage;
    if (control.type === 'ping') {
      this.send(socket, {
        type: 'pong',
        clientAt: control.clientAt,
        serverNow: now,
      });
      return;
    }
    if (control.type === 'cast') {
      if (this.room.requests[slot].includes(control.requestId))
        return this.send(socket, {
          type: 'error',
          code: 'duplicate-request',
          message: 'That cast was already processed.',
          requestId: control.requestId,
        });
      this.room.requests[slot] = [
        ...this.room.requests[slot],
        control.requestId,
      ].slice(-100);
      const before = structuredClone(this.room.match),
        result = castPvp(this.room.match, slot, control.rune, now);
      this.room.match = result.state;
      if (!result.accepted) {
        this.send(socket, {
          type: 'error',
          code: result.reason || 'cast-rejected',
          message: this.castError(result.reason),
          requestId: control.requestId,
        });
        this.present({
          kind: 'cast_rejected',
          text: `${before.players[slot]?.name || 'Player'}'s ${control.rune} fizzled.`,
          at: now,
          source: slot,
          target: otherSlot(slot),
          rune: control.rune,
          strokeId: control.strokeId,
        });
      } else {
        this.present({
          kind: 'cast_accepted',
          text: `${this.room.match.players[slot]?.name || 'Player'} cast ${control.rune}.`,
          at: now,
          source: slot,
          target: otherSlot(slot),
          rune: control.rune,
          strokeId: control.strokeId,
        });
        this.presentTransitions(before, this.room.match, now);
        if (control.rune === 'star')
          this.cancelTrail(otherSlot(slot), 'stunned', now);
      }
    } else if (control.type === 'ready')
      this.room.match = setPvpReady(this.room.match, slot, now);
    else if (control.type === 'rematch')
      this.room.match = requestRematch(this.room.match, slot, now);
    else {
      this.room.match = leavePvp(this.room.match, slot, now);
      this.cancelTrail('player1', 'finished', now);
      this.cancelTrail('player2', 'finished', now);
    }
    await this.persist();
    this.broadcastSnapshot();
  }
  async webSocketClose(socket: WebSocket) {
    await this.closed(socket);
  }
  async webSocketError(socket: WebSocket) {
    await this.closed(socket);
  }
  async alarm() {
    if (!this.room) return;
    const now = Date.now();
    if (now >= this.room.match.expiresAt) {
      for (const socket of this.ctx.getWebSockets())
        socket.close(4004, 'Room expired');
      await this.ctx.storage.deleteAll();
      this.room = null;
      return;
    }
    const before = structuredClone(this.room.match);
    this.room.match = advancePvp(this.room.match, now);
    this.presentTransitions(before, this.room.match, now);
    if (this.room.match.status === 'finished') {
      this.cancelTrail('player1', 'finished', now);
      this.cancelTrail('player2', 'finished', now);
    }
    await this.persist();
    this.broadcastSnapshot();
  }
  private async closed(socket: WebSocket) {
    if (!this.room) return;
    const attachment =
      socket.deserializeAttachment() as SocketAttachment | null;
    if (!attachment) return;
    if (attachment.channel === 'trail') {
      if (
        this.room.trailConnections?.[attachment.slot] ===
        attachment.connectionId
      ) {
        this.room.trailConnections[attachment.slot] = null;
        await this.persist();
      }
      return;
    }
    if (this.room.connections[attachment.slot] !== attachment.connectionId)
      return;
    this.room.connections[attachment.slot] = null;
    this.cancelTrail('player1', 'disconnected', Date.now());
    this.cancelTrail('player2', 'disconnected', Date.now());
    this.room.match = disconnectPvp(
      this.room.match,
      attachment.slot,
      Date.now(),
    );
    await this.persist();
    this.broadcastSnapshot();
  }
  private slotForToken(token: string | null): PvpSlot | null {
    return token && token === this.room?.tokens.player1
      ? 'player1'
      : token && token === this.room?.tokens.player2
        ? 'player2'
        : null;
  }
  private castError(reason: string | null) {
    return reason === 'stunned'
      ? 'You are stunned and cannot cast yet.'
      : reason === 'cooldown'
        ? 'That rune is still cooling down.'
        : reason === 'health-full'
          ? 'Your health is already full.'
          : reason === 'not-burning'
            ? 'Water can only be cast while burning.'
            : reason === 'no-incoming-attack'
              ? 'That counter requires an incoming attack.'
              : reason === 'ward-active'
                ? 'Your Ward is already active.'
                : 'That spell cannot be cast right now.';
  }
  private send(socket: WebSocket, message: ServerMessage) {
    try {
      socket.send(JSON.stringify(message));
    } catch {}
  }
  private sendTrail(socket: WebSocket, message: TrailServerMessage) {
    try {
      socket.send(JSON.stringify(message));
    } catch {}
  }
  private broadcast(message: ServerMessage, except?: WebSocket) {
    for (const socket of this.ctx
      .getWebSockets('control:player1')
      .concat(this.ctx.getWebSockets('control:player2')))
      if (socket !== except) this.send(socket, message);
  }
  private broadcastSnapshot(except?: WebSocket) {
    if (this.room)
      this.broadcast(
        { type: 'snapshot', state: this.room.match, serverNow: Date.now() },
        except,
      );
  }
  private present(event: Omit<PvpPresentationEvent, 'id'>) {
    if (!this.room) return;
    const id = (this.room.presentationId || 0) + 1;
    this.room.presentationId = id;
    this.broadcast({ type: 'event', event: { id, ...event } });
  }
  private presentTransitions(
    before: PvpMatchState,
    after: PvpMatchState,
    now: number,
  ) {
    for (const slot of ['player1', 'player2'] as PvpSlot[]) {
      const old = before.players[slot],
        next = after.players[slot];
      if (!old || !next) continue;
      if (old.health !== next.health)
        this.present({
          kind: 'health_changed',
          text: `${next.name} ${next.health < old.health ? 'lost' : 'restored'} ${Math.abs(next.health - old.health)} health.`,
          at: now,
          target: slot,
          healthBefore: old.health,
          healthAfter: next.health,
        });
      if (old.burning !== next.burning)
        this.present({
          kind: next.burning ? 'status_applied' : 'status_cleared',
          text: `${next.name} is ${next.burning ? 'burning' : 'no longer burning'}.`,
          at: now,
          target: slot,
          status: 'burn',
        });
      if ((old.stunnedUntil || 0) !== (next.stunnedUntil || 0))
        this.present({
          kind: next.stunnedUntil ? 'status_applied' : 'status_cleared',
          text: `${next.name} is ${next.stunnedUntil ? 'stunned' : 'no longer stunned'}.`,
          at: now,
          target: slot,
          status: 'stun',
          rune: 'star',
        });
      if (old.shield !== next.shield)
        this.present({
          kind: next.shield ? 'status_applied' : 'status_cleared',
          text: `${next.name}'s Ward ${next.shield ? 'formed' : 'was consumed'}.`,
          at: now,
          target: slot,
          status: 'ward',
          rune: 'ward',
        });
    }
    for (const spell of before.incoming)
      if (
        !after.incoming.some((next) => next.id === spell.id) &&
        spell.landsAt <= now
      )
        this.present({
          kind: 'attack_resolved',
          text: `${spell.rune} resolved.`,
          at: now,
          source: spell.from,
          target: spell.to,
          rune: spell.rune,
        });
  }
  private async handleTrail(
    socket: WebSocket,
    attachment: TrailAttachment,
    message: TrailClientMessage,
  ) {
    if (!this.room) return;
    const now = Date.now(),
      player = this.room.match.players[attachment.slot];
    if (message.sequence <= attachment.lastSequence)
      return this.sendTrail(socket, {
        type: 'trail_error',
        code: 'stale-sequence',
        message: 'That trail message was already processed.',
      });
    attachment.lastSequence = message.sequence;
    attachment.tokens = Math.min(
      8,
      attachment.tokens + ((now - attachment.lastRefill) * 22) / 1000,
    );
    attachment.lastRefill = now;
    const cost = message.type === 'trail_heartbeat' ? 0.25 : 1;
    if (attachment.tokens < cost) {
      attachment.violations = [
        ...attachment.violations.filter((at) => now - at < 10000),
        now,
      ];
      socket.serializeAttachment(attachment);
      if (attachment.violations.length >= 3)
        socket.close(4008, 'Trail rate exceeded');
      return;
    }
    attachment.tokens -= cost;
    if (
      this.room.match.status !== 'active' ||
      !player?.connected ||
      (player.stunnedUntil || 0) > now
    ) {
      socket.serializeAttachment(attachment);
      return;
    }
    if (message.type === 'trail_start') {
      if (attachment.strokeId)
        this.cancelTrail(attachment.slot, 'replaced', now);
      attachment.strokeId = message.strokeId;
      attachment.nextBatch = 0;
      attachment.pointCount = 0;
      attachment.sourceAspectQ = message.sourceAspectQ;
      attachment.startedAt = now;
      this.relayTrail(attachment.slot, {
        type: 'trail_start',
        slot: attachment.slot,
        strokeId: message.strokeId,
        sourceAspectQ: message.sourceAspectQ,
        resume: message.resume,
        serverNow: now,
      });
    } else if (!attachment.strokeId || message.strokeId !== attachment.strokeId)
      this.sendTrail(socket, {
        type: 'trail_error',
        code: 'orphan-stroke',
        message: 'Start the stroke before sending points.',
      });
    else if (now - attachment.startedAt > 20500) {
      this.cancelTrail(attachment.slot, 'replaced', now);
    } else if (message.type === 'trail_points') {
      if (message.batch !== attachment.nextBatch) {
        socket.serializeAttachment(attachment);
        this.sendTrail(socket, {
          type: 'trail_error',
          code: 'batch-order',
          message: 'Trail batches must be consecutive.',
        });
        return;
      }
      if (attachment.pointCount + message.points.length > 1500) {
        this.cancelTrail(attachment.slot, 'replaced', now);
        return;
      }
      attachment.nextBatch++;
      attachment.pointCount += message.points.length;
      this.relayTrail(attachment.slot, {
        type: 'trail_points',
        slot: attachment.slot,
        strokeId: message.strokeId,
        batch: message.batch,
        points: message.points,
        serverNow: now,
      });
    } else if (message.type === 'trail_heartbeat')
      this.relayTrail(attachment.slot, {
        type: 'trail_heartbeat',
        slot: attachment.slot,
        strokeId: message.strokeId,
        serverNow: now,
      });
    else {
      this.relayTrail(attachment.slot, {
        type: 'trail_end',
        slot: attachment.slot,
        strokeId: message.strokeId,
        reason: message.reason,
        serverNow: now,
      });
      attachment.strokeId = null;
      attachment.nextBatch = 0;
      attachment.pointCount = 0;
    }
    socket.serializeAttachment(attachment);
  }
  private relayTrail(source: PvpSlot, message: TrailServerMessage) {
    for (const socket of this.ctx.getWebSockets(`trail:${otherSlot(source)}`))
      this.sendTrail(socket, message);
  }
  private cancelTrail(
    slot: PvpSlot,
    reason: 'stunned' | 'disconnected' | 'finished' | 'replaced',
    now: number,
  ) {
    for (const socket of this.ctx.getWebSockets(`trail:${slot}`)) {
      const attachment =
        socket.deserializeAttachment() as TrailAttachment | null;
      if (!attachment?.strokeId) continue;
      this.relayTrail(slot, {
        type: 'trail_cancel',
        slot,
        strokeId: attachment.strokeId,
        reason,
        serverNow: now,
      });
      attachment.strokeId = null;
      attachment.nextBatch = 0;
      attachment.pointCount = 0;
      socket.serializeAttachment(attachment);
    }
  }
  private async persist() {
    if (!this.room) return;
    await this.ctx.storage.put('room', this.room);
    const deadline = nextPvpDeadline(this.room.match);
    if (deadline !== null) await this.ctx.storage.setAlarm(deadline);
  }
}
