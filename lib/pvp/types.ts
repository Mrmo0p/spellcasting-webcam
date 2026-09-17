import type { RuneId } from '../game/types.ts';

export type PvpSlot = 'player1' | 'player2';
export type PvpStatus =
  | 'waiting'
  | 'countdown'
  | 'active'
  | 'paused'
  | 'finished';
export type PvpOutcome = PvpSlot | 'draw' | null;
export type PvpConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'
  | 'error';
export type PvpTrailEndReason =
  | 'completed'
  | 'unrecognized'
  | 'tracking-lost'
  | 'interrupted'
  | 'timeout';
export type PvpTrailPoint = [x: number, y: number, dt: number];
export type PvpTrailStatus =
  | 'drawing'
  | 'completed'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

export type PvpPlayerState = {
  slot: PvpSlot;
  name: string;
  health: number;
  shield: boolean;
  burning: boolean;
  nextBurnAt: number | null;
  stunnedUntil: number | null;
  cooldowns: Partial<Record<RuneId, number>>;
  globalCooldownUntil: number;
  ready: boolean;
  connected: boolean;
  reconnectUsed: boolean;
  rematch: boolean;
};

export type IncomingSpell = {
  id: number;
  rune: 'fireball' | 'lightning';
  from: PvpSlot;
  to: PvpSlot;
  landsAt: number;
  frosted: boolean;
};

export type PvpMatchState = {
  code: string;
  version: number;
  status: PvpStatus;
  players: Record<PvpSlot, PvpPlayerState | null>;
  incoming: IncomingSpell[];
  outcome: PvpOutcome;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  countdownEndsAt: number | null;
  pausedAt: number | null;
  pausedFrom: 'countdown' | 'active' | null;
  disconnectDeadline: number | null;
  nextEventId: number;
};

export type ClientMessage =
  | { type: 'ready'; sequence: number }
  | {
      type: 'cast';
      sequence: number;
      requestId: string;
      rune: RuneId;
      clientAt: number;
      strokeId?: string;
    }
  | { type: 'rematch'; sequence: number }
  | { type: 'leave'; sequence: number }
  | { type: 'ping'; sequence: number; clientAt: number };

export type TrailClientMessage =
  | {
      type: 'trail_start';
      sequence: number;
      strokeId: string;
      sourceAspectQ: number;
      resume: boolean;
    }
  | {
      type: 'trail_points';
      sequence: number;
      strokeId: string;
      batch: number;
      points: PvpTrailPoint[];
    }
  | { type: 'trail_heartbeat'; sequence: number; strokeId: string }
  | {
      type: 'trail_end';
      sequence: number;
      strokeId: string;
      reason: PvpTrailEndReason;
    };

export type PvpPresentationKind =
  | 'cast_accepted'
  | 'cast_rejected'
  | 'attack_resolved'
  | 'health_changed'
  | 'status_applied'
  | 'status_cleared';
export type PvpPresentationEvent = {
  id: number;
  kind: PvpPresentationKind;
  text: string;
  at: number;
  source?: PvpSlot;
  target?: PvpSlot;
  rune?: RuneId;
  strokeId?: string;
  healthBefore?: number;
  healthAfter?: number;
  status?: 'burn' | 'stun' | 'ward';
};

export type ServerMessage =
  | { type: 'welcome'; slot: PvpSlot; state: PvpMatchState; serverNow: number }
  | { type: 'snapshot'; state: PvpMatchState; serverNow: number }
  | { type: 'event'; event: PvpPresentationEvent }
  | { type: 'error'; code: string; message: string; requestId?: string }
  | { type: 'pong'; clientAt: number; serverNow: number };

export type TrailServerMessage =
  | { type: 'trail_ready'; serverNow: number }
  | {
      type: 'trail_start';
      slot: PvpSlot;
      strokeId: string;
      sourceAspectQ: number;
      resume: boolean;
      serverNow: number;
    }
  | {
      type: 'trail_points';
      slot: PvpSlot;
      strokeId: string;
      batch: number;
      points: PvpTrailPoint[];
      serverNow: number;
    }
  | {
      type: 'trail_heartbeat';
      slot: PvpSlot;
      strokeId: string;
      serverNow: number;
    }
  | {
      type: 'trail_end';
      slot: PvpSlot;
      strokeId: string;
      reason: PvpTrailEndReason;
      serverNow: number;
    }
  | {
      type: 'trail_cancel';
      slot: PvpSlot;
      strokeId: string;
      reason: 'stunned' | 'disconnected' | 'finished' | 'replaced';
      serverNow: number;
    }
  | { type: 'trail_error'; code: string; message: string };

export type PvpRemoteTrail = {
  slot: PvpSlot;
  strokeId: string;
  sourceAspect: number;
  points: { x: number; y: number; t: number }[];
  status: PvpTrailStatus;
  lastAt: number;
  endedAt: number | null;
};

export type RoomCredentials = { code: string; token: string; slot: PvpSlot };
