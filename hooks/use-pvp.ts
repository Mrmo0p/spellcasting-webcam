'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Point, RuneId } from '@/lib/game/types';
import { appendTrailPoints, encodeTrailPoints, TRAIL } from '@/lib/pvp/trail';
import type {
  PvpConnectionStatus,
  PvpMatchState,
  PvpPresentationEvent,
  PvpRemoteTrail,
  PvpSlot,
  PvpTrailEndReason,
  RoomCredentials,
  ServerMessage,
  TrailServerMessage,
} from '@/lib/pvp/types';

const SESSION_KEY = 'spellbound.pvp.room.v1',
  SEQUENCE_KEY = 'spellbound.pvp.sequence.v1';
const configuredService = (process.env.NEXT_PUBLIC_PVP_API_URL || '').replace(
  /\/$/,
  '',
);
function serviceUrl() {
  if (configuredService) return configuredService;
  if (
    typeof location !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(location.hostname)
  )
    return 'http://localhost:8787';
  return '';
}
function socketUrl(
  base: string,
  credentials: RoomCredentials,
  channel: 'control' | 'trail' = 'control',
) {
  const url = new URL(`/rooms/${credentials.code}/socket`, base);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('token', credentials.token);
  if (channel === 'trail') url.searchParams.set('channel', 'trail');
  return url.toString();
}
type LocalTrail = {
  strokeId: string;
  aspect: number;
  points: Point[];
  sent: number;
  batch: number;
  lastSendAt: number;
  lastValidAt: number;
  lastHeartbeatAt: number;
  endingReason: PvpTrailEndReason | null;
};

export function usePvp() {
  const [credentials, setCredentials] = useState<RoomCredentials | null>(null),
    [state, setState] = useState<PvpMatchState | null>(null),
    [slot, setSlot] = useState<PvpSlot | null>(null),
    [connection, setConnection] = useState<PvpConnectionStatus>('idle'),
    [trailConnection, setTrailConnection] =
      useState<PvpConnectionStatus>('idle'),
    [error, setError] = useState(''),
    [events, setEvents] = useState<PvpPresentationEvent[]>([]),
    [clockOffset, setClockOffset] = useState(0),
    [remoteTrail, setRemoteTrail] = useState<PvpRemoteTrail | null>(null);
  const sequence = useRef(0),
    socket = useRef<WebSocket | null>(null),
    trailSocket = useRef<WebSocket | null>(null),
    trailSequence = useRef(0),
    manualClose = useRef(false),
    localTrail = useRef<LocalTrail | null>(null),
    stateRef = useRef<PvpMatchState | null>(null),
    slotRef = useRef<PvpSlot | null>(null),
    pendingResults = useRef(new Map<string, 'accepted' | 'rejected'>());
  const sendTrail = useCallback((message: Record<string, unknown>) => {
    if (trailSocket.current?.readyState !== WebSocket.OPEN) return false;
    trailSocket.current.send(
      JSON.stringify({ ...message, sequence: ++trailSequence.current }),
    );
    return true;
  }, []);
  const flushTrail = useCallback(
    (force = false) => {
      const active = localTrail.current;
      if (!active || trailSocket.current?.readyState !== WebSocket.OPEN) return;
      const now = performance.now();
      if (!force && now - active.lastSendAt < TRAIL.batchMs) return;
      while (active.sent < active.points.length) {
        const end = Math.min(
            active.sent + TRAIL.maxBatch,
            active.points.length,
          ),
          points = encodeTrailPoints(
            active.points.slice(0, end),
            active.aspect,
            active.sent,
          );
        if (
          !sendTrail({
            type: 'trail_points',
            strokeId: active.strokeId,
            batch: active.batch,
            points,
          })
        )
          break;
        active.sent = end;
        active.batch++;
        active.lastSendAt = now;
        if (!force) break;
      }
      if (
        active.endingReason &&
        active.sent >= active.points.length &&
        sendTrail({
          type: 'trail_end',
          strokeId: active.strokeId,
          reason: active.endingReason,
        })
      )
        localTrail.current = null;
    },
    [sendTrail],
  );
  const finishTrail = useCallback(
    (reason: PvpTrailEndReason) => {
      const active = localTrail.current;
      if (!active) return undefined;
      active.endingReason = reason;
      flushTrail(false);
      return active.strokeId;
    },
    [flushTrail],
  );
  const syncTrail = useCallback(
    (points: Point[], gateState: string, aspect: number, hasHand: boolean) => {
      const match = stateRef.current,
        me = match && slotRef.current ? match.players[slotRef.current] : null;
      if (
        match?.status !== 'active' ||
        !me ||
        !me.connected ||
        (me.stunnedUntil || 0) > Date.now()
      )
        return;
      if (!localTrail.current && points.length && gateState === 'drawing') {
        const strokeId = crypto.randomUUID(),
          safeAspect = Math.max(0.5, Math.min(3, aspect || 4 / 3));
        localTrail.current = {
          strokeId,
          aspect: safeAspect,
          points: [],
          sent: 0,
          batch: 0,
          lastSendAt: 0,
          lastValidAt: performance.now(),
          lastHeartbeatAt: 0,
          endingReason: null,
        };
        sendTrail({
          type: 'trail_start',
          strokeId,
          sourceAspectQ: Math.round(safeAspect * 1000),
          resume: false,
        });
      }
      const active = localTrail.current;
      if (!active) return;
      if (active.endingReason) {
        flushTrail(false);
        return;
      }
      if (hasHand) active.lastValidAt = performance.now();
      if (points.length > active.points.length)
        active.points = points
          .slice(0, TRAIL.maxPoints)
          .map((point) => ({ ...point }));
      flushTrail(false);
    },
    [flushTrail, sendTrail],
  );
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const saved = sessionStorage.getItem(SESSION_KEY),
          n = Number(sessionStorage.getItem(SEQUENCE_KEY) || 0);
        if (saved) {
          const parsed = JSON.parse(saved) as RoomCredentials;
          if (parsed.code && parsed.token && parsed.slot)
            setCredentials(parsed);
        }
        if (Number.isSafeInteger(n) && n >= 0) sequence.current = n;
      } catch {}
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    stateRef.current = state;
    slotRef.current = slot;
  }, [state, slot]);
  useEffect(() => {
    if (!credentials) return;
    const base = serviceUrl();
    if (!base) {
      queueMicrotask(() => {
        setConnection('error');
        setError('PvP service is not configured for this deployment.');
      });
      return;
    }
    let stopped = false,
      retry: ReturnType<typeof setTimeout> | null = null,
      attempt = 0;
    manualClose.current = false;
    const open = () => {
      if (stopped) return;
      setConnection(attempt ? 'reconnecting' : 'connecting');
      const ws = new WebSocket(socketUrl(base, credentials));
      socket.current = ws;
      ws.onopen = () => {
        attempt = 0;
        setConnection('open');
        setError('');
      };
      ws.onmessage = (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }
        if (message.type === 'welcome' || message.type === 'snapshot') {
          setClockOffset(message.serverNow - Date.now());
          setState((current) =>
            !current || message.state.version >= current.version
              ? message.state
              : current,
          );
          if (message.type === 'welcome') setSlot(message.slot);
        } else if (message.type === 'event') {
          const presentation = message.event;
          setEvents((items) => [...items, presentation].slice(-12));
          if (
            presentation.strokeId &&
            presentation.source !== credentials.slot &&
            (presentation.kind === 'cast_accepted' ||
              presentation.kind === 'cast_rejected')
          ) {
            const status =
              presentation.kind === 'cast_accepted' ? 'accepted' : 'rejected';
            pendingResults.current.set(presentation.strokeId, status);
            setRemoteTrail((current) =>
              current && current.strokeId === presentation.strokeId
                ? { ...current, status, endedAt: Date.now() }
                : current,
            );
          }
        } else if (message.type === 'error') setError(message.message);
        else setClockOffset(message.serverNow - Date.now());
      };
      ws.onclose = () => {
        if (stopped || manualClose.current) return;
        setConnection('reconnecting');
        attempt++;
        retry = setTimeout(
          open,
          Math.min(5000, 500 * Math.pow(2, Math.min(attempt, 4))),
        );
      };
      ws.onerror = () =>
        setError('The PvP connection was interrupted. Reconnecting…');
    };
    queueMicrotask(open);
    const ping = setInterval(() => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        const next = ++sequence.current;
        try {
          sessionStorage.setItem(SEQUENCE_KEY, String(next));
        } catch {}
        socket.current.send(
          JSON.stringify({
            type: 'ping',
            sequence: next,
            clientAt: Date.now(),
          }),
        );
      }
    }, 10000);
    return () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      clearInterval(ping);
      socket.current?.close();
      socket.current = null;
    };
  }, [credentials]);
  useEffect(() => {
    if (!credentials) return;
    const base = serviceUrl();
    if (!base) return;
    let stopped = false,
      retry: ReturnType<typeof setTimeout> | null = null,
      attempt = 0;
    const open = () => {
      if (stopped) return;
      setTrailConnection(attempt ? 'reconnecting' : 'connecting');
      const ws = new WebSocket(socketUrl(base, credentials, 'trail'));
      trailSocket.current = ws;
      ws.onopen = () => {
        attempt = 0;
        trailSequence.current = 0;
        setTrailConnection('open');
        const active = localTrail.current;
        if (active) {
          active.sent = 0;
          active.batch = 0;
          sendTrail({
            type: 'trail_start',
            strokeId: active.strokeId,
            sourceAspectQ: Math.round(active.aspect * 1000),
            resume: true,
          });
          flushTrail(false);
        }
      };
      ws.onmessage = (event) => {
        let message: TrailServerMessage;
        try {
          message = JSON.parse(String(event.data)) as TrailServerMessage;
        } catch {
          return;
        }
        if (message.type === 'trail_ready' || message.type === 'trail_error')
          return;
        if (message.slot === credentials.slot) return;
        const received = Date.now();
        if (message.type === 'trail_start') {
          const pending = pendingResults.current.get(message.strokeId);
          setRemoteTrail({
            slot: message.slot,
            strokeId: message.strokeId,
            sourceAspect: message.sourceAspectQ / 1000,
            points: [],
            status: pending || 'drawing',
            lastAt: received,
            endedAt: pending ? received : null,
          });
        } else if (message.type === 'trail_points')
          setRemoteTrail((current) => {
            if (!current || current.strokeId !== message.strokeId)
              return current;
            return {
              ...current,
              points: appendTrailPoints(
                [...current.points],
                message.points,
                current.sourceAspect,
              ),
              lastAt: received,
            };
          });
        else if (message.type === 'trail_heartbeat')
          setRemoteTrail((current) =>
            current?.strokeId === message.strokeId
              ? { ...current, lastAt: received }
              : current,
          );
        else if (message.type === 'trail_end')
          setRemoteTrail((current) =>
            current?.strokeId === message.strokeId
              ? {
                  ...current,
                  status:
                    current.status === 'accepted' ||
                    current.status === 'rejected'
                      ? current.status
                      : message.reason === 'completed'
                        ? 'completed'
                        : message.reason === 'unrecognized'
                          ? 'rejected'
                          : 'cancelled',
                  lastAt: received,
                  endedAt: current.endedAt || received,
                }
              : current,
          );
        else
          setRemoteTrail((current) =>
            current?.strokeId === message.strokeId
              ? {
                  ...current,
                  status: 'cancelled',
                  lastAt: received,
                  endedAt: received,
                }
              : current,
          );
      };
      ws.onclose = () => {
        if (stopped) return;
        setTrailConnection('reconnecting');
        attempt++;
        retry = setTimeout(
          open,
          Math.min(5000, 500 * Math.pow(2, Math.min(attempt, 4))),
        );
      };
      ws.onerror = () => setTrailConnection('error');
    };
    queueMicrotask(open);
    return () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      trailSocket.current?.close();
      trailSocket.current = null;
    };
  }, [credentials, flushTrail, sendTrail]);
  useEffect(() => {
    const timer = setInterval(() => {
      const active = localTrail.current;
      if (!active) return;
      const now = performance.now();
      if (!active.endingReason && now - active.lastValidAt > 550) {
        finishTrail('tracking-lost');
        return;
      }
      flushTrail(false);
      if (
        !active.endingReason &&
        now - active.lastHeartbeatAt >= TRAIL.heartbeatMs
      ) {
        sendTrail({ type: 'trail_heartbeat', strokeId: active.strokeId });
        active.lastHeartbeatAt = now;
      }
    }, TRAIL.batchMs);
    return () => clearInterval(timer);
  }, [finishTrail, flushTrail, sendTrail]);
  const remember = useCallback((value: RoomCredentials) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
      sessionStorage.setItem(SEQUENCE_KEY, '0');
    } catch {}
    sequence.current = 0;
    setCredentials(value);
    setSlot(value.slot);
  }, []);
  const requestRoom = useCallback(
    async (path: string, name: string) => {
      const base = serviceUrl();
      if (!base)
        throw new Error('PvP service is not configured for this deployment.');
      const response = await fetch(base + path, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = (await response.json()) as RoomCredentials & {
        error?: string;
      };
      if (!response.ok)
        throw new Error(
          data.error === 'room-full'
            ? 'That room already has two players.'
            : data.error === 'room-not-found'
              ? 'Room not found. Check the code and try again.'
              : data.error === 'invalid-name'
                ? 'Enter a name between 1 and 24 characters.'
                : 'Could not open that room.',
        );
      remember(data);
      return data;
    },
    [remember],
  );
  const createRoom = useCallback(
    (name: string) => requestRoom('/rooms', name),
    [requestRoom],
  );
  const joinRoom = useCallback(
    (code: string, name: string) =>
      requestRoom(`/rooms/${code.trim().toUpperCase()}/join`, name),
    [requestRoom],
  );
  const send = useCallback((message: Record<string, unknown>) => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      setError('Not connected to the match service yet.');
      return false;
    }
    const next = ++sequence.current;
    try {
      sessionStorage.setItem(SEQUENCE_KEY, String(next));
    } catch {}
    socket.current.send(JSON.stringify({ ...message, sequence: next }));
    return true;
  }, []);
  const cast = useCallback(
    (rune: RuneId, strokeId?: string) =>
      send({
        type: 'cast',
        requestId: crypto.randomUUID(),
        rune,
        clientAt: Date.now(),
        ...(strokeId ? { strokeId } : {}),
      }),
    [send],
  );
  const ready = useCallback(() => send({ type: 'ready' }), [send]);
  const rematch = useCallback(() => send({ type: 'rematch' }), [send]);
  const leave = useCallback(() => {
    finishTrail('interrupted');
    send({ type: 'leave' });
    manualClose.current = true;
    socket.current?.close();
    trailSocket.current?.close();
    socket.current = null;
    trailSocket.current = null;
    localTrail.current = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SEQUENCE_KEY);
    } catch {}
    setCredentials(null);
    setState(null);
    setSlot(null);
    setConnection('idle');
    setTrailConnection('idle');
    setEvents([]);
    setRemoteTrail(null);
    setError('');
  }, [finishTrail, send]);
  return {
    state,
    slot,
    connection,
    trailConnection,
    error,
    events,
    clockOffset,
    remoteTrail,
    roomCode: credentials?.code || '',
    createRoom,
    joinRoom,
    cast,
    ready,
    rematch,
    leave,
    syncTrail,
    finishTrail,
    clearError: () => setError(''),
  };
}
export type PvpController = ReturnType<typeof usePvp>;
