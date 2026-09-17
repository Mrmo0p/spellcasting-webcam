import type { RuneId } from '../game/types.ts';
import type { PvpMatchState, PvpPlayerState, PvpSlot } from './types.ts';

export const PVP = {
  attackWarning: 4000,
  burnDamage: 4,
  burnInterval: 1000,
  countdown: 3000,
  globalCooldown: 600,
  reconnectGrace: 30000,
  repeatReconnectGrace: 5000,
  waitingTtl: 30 * 60_000,
  activeTtl: 2 * 60 * 60_000,
  finishedTtl: 15 * 60_000,
};
export const PVP_COOLDOWNS: Record<RuneId, number> = {
  ward: 8000,
  fireball: 7000,
  lightning: 5000,
  frost: 10000,
  mend: 13000,
  dispel: 11000,
  water: 3000,
  star: 15000,
};
export const otherSlot = (slot: PvpSlot): PvpSlot =>
  slot === 'player1' ? 'player2' : 'player1';
const player = (slot: PvpSlot, name: string): PvpPlayerState => ({
  slot,
  name,
  health: 100,
  shield: false,
  burning: false,
  nextBurnAt: null,
  stunnedUntil: null,
  cooldowns: {},
  globalCooldownUntil: 0,
  ready: false,
  connected: false,
  reconnectUsed: false,
  rematch: false,
});
const clone = (state: PvpMatchState): PvpMatchState => ({
  ...state,
  players: {
    player1: state.players.player1
      ? {
          ...state.players.player1,
          cooldowns: { ...state.players.player1.cooldowns },
        }
      : null,
    player2: state.players.player2
      ? {
          ...state.players.player2,
          cooldowns: { ...state.players.player2.cooldowns },
        }
      : null,
  },
  incoming: state.incoming.map((spell) => ({ ...spell })),
});
const changed = (state: PvpMatchState, now: number) => {
  state.version++;
  state.updatedAt = now;
  state.expiresAt =
    now +
    (state.status === 'finished'
      ? PVP.finishedTtl
      : state.status === 'waiting'
        ? PVP.waitingTtl
        : PVP.activeTtl);
  return state;
};
const orderedIncoming = (state: PvpMatchState, slot: PvpSlot) =>
  state.incoming
    .filter((spell) => spell.to === slot)
    .sort((a, b) => a.landsAt - b.landsAt || a.id - b.id);

export function createPvpMatch(
  code: string,
  name: string,
  now: number,
): PvpMatchState {
  return {
    code,
    version: 1,
    status: 'waiting',
    players: { player1: player('player1', name), player2: null },
    incoming: [],
    outcome: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + PVP.waitingTtl,
    countdownEndsAt: null,
    pausedAt: null,
    pausedFrom: null,
    disconnectDeadline: null,
    nextEventId: 1,
  };
}
export function joinPvpMatch(
  state: PvpMatchState,
  name: string,
  now: number,
): PvpMatchState {
  if (state.players.player2) throw new Error('room-full');
  if (state.status !== 'waiting') throw new Error('match-started');
  const next = clone(state);
  next.players.player2 = player('player2', name);
  return changed(next, now);
}

function finish(state: PvpMatchState, now: number) {
  const one = state.players.player1,
    two = state.players.player2;
  if (!one || !two) return false;
  if (one.health <= 0 || two.health <= 0) {
    state.status = 'finished';
    state.outcome =
      one.health <= 0 && two.health <= 0
        ? 'draw'
        : one.health <= 0
          ? 'player2'
          : 'player1';
    state.countdownEndsAt = null;
    state.disconnectDeadline = null;
    state.pausedAt = null;
    state.pausedFrom = null;
    state.expiresAt = now + PVP.finishedTtl;
    return true;
  }
  return false;
}

export function advancePvp(state: PvpMatchState, now: number): PvpMatchState {
  if (
    !Number.isFinite(now) ||
    now < state.updatedAt ||
    state.status === 'finished' ||
    state.status === 'waiting'
  )
    return state;
  const next = clone(state);
  let didChange = false;
  if (next.status === 'paused') {
    if (next.disconnectDeadline !== null && now >= next.disconnectDeadline) {
      const disconnected = (['player1', 'player2'] as PvpSlot[]).filter(
        (slot) => next.players[slot] && !next.players[slot]!.connected,
      );
      next.status = 'finished';
      next.outcome =
        disconnected.length === 2 ? 'draw' : otherSlot(disconnected[0]);
      next.expiresAt = now + PVP.finishedTtl;
      didChange = true;
    }
    return didChange ? changed(next, now) : state;
  }
  if (
    next.status === 'countdown' &&
    next.countdownEndsAt !== null &&
    now >= next.countdownEndsAt
  ) {
    next.status = 'active';
    next.updatedAt = next.countdownEndsAt;
    next.countdownEndsAt = null;
    didChange = true;
  }
  if (next.status !== 'active') return didChange ? changed(next, now) : state;
  for (const slot of ['player1', 'player2'] as PvpSlot[]) {
    const target = next.players[slot];
    if (target && target.stunnedUntil !== null && target.stunnedUntil <= now) {
      target.stunnedUntil = null;
      didChange = true;
    }
  }
  while (next.status === 'active') {
    const dueTimes = [
      ...next.incoming.map((spell) => spell.landsAt),
      ...(['player1', 'player2'] as PvpSlot[]).map(
        (slot) => next.players[slot]?.nextBurnAt ?? Infinity,
      ),
    ];
    const at = Math.min(...dueTimes);
    if (!Number.isFinite(at) || at > now) break;
    const damage: Record<PvpSlot, number> = { player1: 0, player2: 0 };
    const ignitions = new Set<PvpSlot>();
    const attacks = next.incoming
      .filter((spell) => spell.landsAt === at)
      .sort((a, b) => a.id - b.id);
    for (const spell of attacks) {
      const target = next.players[spell.to];
      if (!target) continue;
      if (target.shield) target.shield = false;
      else {
        damage[spell.to] += spell.rune === 'fireball' ? 8 : 16;
        if (spell.rune === 'fireball') ignitions.add(spell.to);
      }
    }
    next.incoming = next.incoming.filter((spell) => spell.landsAt !== at);
    for (const slot of ['player1', 'player2'] as PvpSlot[]) {
      const target = next.players[slot];
      if (target?.burning && target.nextBurnAt === at) {
        damage[slot] += PVP.burnDamage;
        target.nextBurnAt = at + PVP.burnInterval;
      }
    }
    for (const slot of ['player1', 'player2'] as PvpSlot[]) {
      const target = next.players[slot];
      if (!target) continue;
      target.health = Math.max(0, target.health - damage[slot]);
      if (ignitions.has(slot) && target.health > 0 && !target.burning) {
        target.burning = true;
        target.nextBurnAt = at + PVP.burnInterval;
      }
    }
    next.updatedAt = at;
    didChange = true;
    if (finish(next, at)) break;
  }
  return didChange ? changed(next, now) : state;
}

export function setPvpReady(
  state: PvpMatchState,
  slot: PvpSlot,
  now: number,
): PvpMatchState {
  let next = advancePvp(state, now);
  if (next.status !== 'waiting' || !next.players[slot]) return next;
  next = clone(next);
  next.players[slot]!.ready = true;
  if (next.players.player1?.ready && next.players.player2?.ready) {
    next.status = 'countdown';
    next.countdownEndsAt = now + PVP.countdown;
  }
  return changed(next, now);
}

export function connectPvp(
  state: PvpMatchState,
  slot: PvpSlot,
  now: number,
): PvpMatchState {
  let next = advancePvp(state, now);
  if (!next.players[slot]) return next;
  next = clone(next);
  next.players[slot]!.connected = true;
  if (
    next.status === 'paused' &&
    next.players.player1?.connected &&
    next.players.player2?.connected &&
    next.pausedAt !== null &&
    next.pausedFrom
  ) {
    const shift = now - next.pausedAt;
    next.incoming.forEach((spell) => (spell.landsAt += shift));
    for (const key of ['player1', 'player2'] as PvpSlot[]) {
      const p = next.players[key];
      if (p?.nextBurnAt) p.nextBurnAt += shift;
      if (p?.stunnedUntil) p.stunnedUntil += shift;
      if (p?.globalCooldownUntil) p.globalCooldownUntil += shift;
      for (const rune of Object.keys(p?.cooldowns || {}) as RuneId[])
        p!.cooldowns[rune] = (p!.cooldowns[rune] || 0) + shift;
    }
    if (next.countdownEndsAt) next.countdownEndsAt += shift;
    next.status = next.pausedFrom;
    next.pausedAt = null;
    next.pausedFrom = null;
    next.disconnectDeadline = null;
  }
  return changed(next, now);
}

export function disconnectPvp(
  state: PvpMatchState,
  slot: PvpSlot,
  now: number,
): PvpMatchState {
  let next = advancePvp(state, now);
  const target = next.players[slot];
  if (!target || !target.connected || next.status === 'finished') return next;
  next = clone(next);
  next.players[slot]!.connected = false;
  if (next.status === 'active' || next.status === 'countdown') {
    const grace = next.players[slot]!.reconnectUsed
      ? PVP.repeatReconnectGrace
      : PVP.reconnectGrace;
    next.players[slot]!.reconnectUsed = true;
    next.pausedFrom = next.status;
    next.status = 'paused';
    next.pausedAt = now;
    next.disconnectDeadline = now + grace;
  }
  return changed(next, now);
}

export function leavePvp(
  state: PvpMatchState,
  slot: PvpSlot,
  now: number,
): PvpMatchState {
  let next = advancePvp(state, now);
  if (next.status === 'finished') return next;
  next = clone(next);
  const opponent = next.players[otherSlot(slot)];
  next.status = 'finished';
  next.outcome = opponent ? otherSlot(slot) : 'draw';
  return changed(next, now);
}

export function castPvp(
  state: PvpMatchState,
  slot: PvpSlot,
  rune: RuneId,
  now: number,
): { state: PvpMatchState; accepted: boolean; reason: string | null } {
  let next = advancePvp(state, now);
  const source = next.players[slot],
    target = next.players[otherSlot(slot)];
  if (next.status !== 'active' || !source || !target)
    return { state: next, accepted: false, reason: 'match-not-active' };
  if (!source.connected)
    return { state: next, accepted: false, reason: 'player-disconnected' };
  if (source.stunnedUntil !== null && source.stunnedUntil > now)
    return { state: next, accepted: false, reason: 'stunned' };
  if ((source.cooldowns[rune] || 0) > now)
    return { state: next, accepted: false, reason: 'cooldown' };
  if ((source.globalCooldownUntil || 0) > now)
    return { state: next, accepted: false, reason: 'global-cooldown' };
  if (rune === 'ward' && source.shield)
    return { state: next, accepted: false, reason: 'ward-active' };
  if (rune === 'mend' && source.health === 100)
    return { state: next, accepted: false, reason: 'health-full' };
  if (rune === 'water' && !source.burning)
    return { state: next, accepted: false, reason: 'not-burning' };
  const incoming = orderedIncoming(next, slot);
  if ((rune === 'frost' || rune === 'dispel') && !incoming.length)
    return { state: next, accepted: false, reason: 'no-incoming-attack' };
  next = clone(next);
  const me = next.players[slot]!;
  if (rune === 'fireball' || rune === 'lightning')
    next.incoming.push({
      id: next.nextEventId++,
      rune,
      from: slot,
      to: otherSlot(slot),
      landsAt: now + PVP.attackWarning,
      frosted: false,
    });
  else if (rune === 'ward') me.shield = true;
  else if (rune === 'mend') me.health = Math.min(100, me.health + 22);
  else if (rune === 'water') {
    me.burning = false;
    me.nextBurnAt = null;
  } else if (rune === 'star')
    next.players[otherSlot(slot)]!.stunnedUntil = now + 3000;
  else {
    const chosen = orderedIncoming(next, slot)[0];
    if (rune === 'frost') {
      next.incoming.find((spell) => spell.id === chosen.id)!.landsAt += 3000;
      next.incoming.find((spell) => spell.id === chosen.id)!.frosted = true;
    } else
      next.incoming = next.incoming.filter((spell) => spell.id !== chosen.id);
  }
  me.cooldowns[rune] = now + PVP_COOLDOWNS[rune];
  me.globalCooldownUntil = now + PVP.globalCooldown;
  return { state: changed(next, now), accepted: true, reason: null };
}

export function requestRematch(
  state: PvpMatchState,
  slot: PvpSlot,
  now: number,
): PvpMatchState {
  if (state.status !== 'finished' || !state.players[slot]) return state;
  let next = clone(state);
  next.players[slot]!.rematch = true;
  if (next.players.player1?.rematch && next.players.player2?.rematch) {
    const names = {
      player1: next.players.player1.name,
      player2: next.players.player2.name,
    };
    next = createPvpMatch(state.code, names.player1, now);
    next.version = state.version;
    next.players.player2 = player('player2', names.player2);
    next.players.player1!.connected = state.players.player1!.connected;
    next.players.player2.connected = state.players.player2!.connected;
    next.players.player1!.ready = true;
    next.players.player2.ready = true;
    next.status = 'countdown';
    next.countdownEndsAt = now + PVP.countdown;
  }
  return changed(next, now);
}

export function nextPvpDeadline(state: PvpMatchState): number | null {
  const deadlines = [
    state.expiresAt,
    state.countdownEndsAt ?? Infinity,
    state.disconnectDeadline ?? Infinity,
    ...state.incoming.map((spell) => spell.landsAt),
    ...(['player1', 'player2'] as PvpSlot[]).map(
      (slot) => state.players[slot]?.nextBurnAt ?? Infinity,
    ),
    ...(['player1', 'player2'] as PvpSlot[]).map(
      (slot) => state.players[slot]?.stunnedUntil ?? Infinity,
    ),
  ];
  const next = Math.min(...deadlines);
  return Number.isFinite(next) ? next : null;
}
