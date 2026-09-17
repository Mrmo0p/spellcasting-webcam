import { runeById } from './runes.ts';
import type { RuneId } from './types.ts';

export type TrainingAttackId = 'ember' | 'nova' | 'lance';

export const TRAINING_ATTACKS: Record<
  TrainingAttackId,
  { name: string; counter: RuneId; damage: number; burns: boolean }
> = {
  ember: { name: 'Ember volley', counter: 'ward', damage: 18, burns: true },
  nova: { name: 'Charged nova', counter: 'dispel', damage: 25, burns: false },
  lance: { name: 'Glacial lance', counter: 'frost', damage: 20, burns: false },
};

export type TrainingIncoming = {
  id: TrainingAttackId;
  remaining: number;
};

export type TrainingState = {
  elapsed: number;
  player: number;
  dummy: number;
  shield: boolean;
  playerBurn: boolean;
  dummyBurn: boolean;
  playerBurnTick: number;
  dummyBurnTick: number;
  stunned: number;
  incoming: TrainingIncoming | null;
  cooldowns: Partial<Record<RuneId, number>>;
  cooldownsEnabled: boolean;
  casts: number;
  counters: number;
  resets: number;
  message: string;
};

const BURN_DAMAGE = 4;
const BURN_INTERVAL = 1000;

export function createTraining(): TrainingState {
  return {
    elapsed: 0,
    player: 100,
    dummy: 100,
    shield: false,
    playerBurn: false,
    dummyBurn: false,
    playerBurnTick: 0,
    dummyBurnTick: 0,
    stunned: 0,
    incoming: null,
    cooldowns: {},
    cooldownsEnabled: true,
    casts: 0,
    counters: 0,
    resets: 0,
    message: 'Choose a drill or draw any rune.',
  };
}

function clone(state: TrainingState): TrainingState {
  return {
    ...state,
    incoming: state.incoming ? { ...state.incoming } : null,
    cooldowns: { ...state.cooldowns },
  };
}

function restoreDummy(state: TrainingState) {
  if (state.dummy > 0) return;
  state.dummy = 100;
  state.dummyBurn = false;
  state.dummyBurnTick = 0;
  state.resets++;
  state.message = 'Dummy defeated — target restored to full health.';
}

export function tickTraining(
  state: TrainingState,
  delta: number,
): TrainingState {
  if (!Number.isFinite(delta) || delta <= 0) return state;
  const next = clone(state);
  let left = delta;
  while (left > 0) {
    const step = Math.min(
      left,
      next.incoming?.remaining || Infinity,
      next.playerBurn ? next.playerBurnTick : Infinity,
      next.dummyBurn ? next.dummyBurnTick : Infinity,
      next.stunned || Infinity,
    );
    const amount = Number.isFinite(step) ? step : left;
    next.elapsed += amount;
    left -= amount;
    next.stunned = Math.max(0, next.stunned - amount);
    for (const id of Object.keys(next.cooldowns) as RuneId[])
      next.cooldowns[id] = Math.max(0, (next.cooldowns[id] || 0) - amount);

    if (next.incoming) {
      next.incoming.remaining = Math.max(0, next.incoming.remaining - amount);
      if (next.incoming.remaining === 0) {
        const attack = TRAINING_ATTACKS[next.incoming.id];
        if (next.shield) {
          next.shield = false;
          next.counters++;
          next.message = 'Ward absorbed the training attack.';
        } else {
          next.player = Math.max(1, next.player - attack.damage);
          if (attack.burns && !next.playerBurn) {
            next.playerBurn = true;
            next.playerBurnTick = BURN_INTERVAL;
          }
          next.message = `${attack.name} landed for ${attack.damage}.`;
        }
        next.incoming = null;
      }
    }

    if (next.playerBurn) {
      next.playerBurnTick -= amount;
      if (next.playerBurnTick <= 0) {
        next.player = Math.max(1, next.player - BURN_DAMAGE);
        next.playerBurnTick = BURN_INTERVAL;
        next.message = 'You take 4 training burn damage. Draw Water.';
      }
    }
    if (next.dummyBurn) {
      next.dummyBurnTick -= amount;
      if (next.dummyBurnTick <= 0) {
        next.dummy = Math.max(0, next.dummy - BURN_DAMAGE);
        next.dummyBurnTick = BURN_INTERVAL;
        next.message = 'The dummy takes 4 burn damage.';
        restoreDummy(next);
      }
    }
  }
  return next;
}

export function queueTrainingAttack(
  state: TrainingState,
  id: TrainingAttackId,
): TrainingState {
  const next = clone(state);
  next.incoming = { id, remaining: 4000 };
  const attack = TRAINING_ATTACKS[id];
  next.message = `${attack.name} incoming — try ${runeById(attack.counter).name}.`;
  return next;
}

export function damageTrainingPlayer(state: TrainingState): TrainingState {
  const next = clone(state);
  next.player = Math.max(1, next.player - 30);
  next.message = 'Training damage applied — draw Mend.';
  return next;
}

export function igniteTrainingPlayer(state: TrainingState): TrainingState {
  const next = clone(state);
  next.playerBurn = true;
  next.playerBurnTick = BURN_INTERVAL;
  next.message = 'Training burn applied — draw Water.';
  return next;
}

export function castTraining(
  state: TrainingState,
  rune: RuneId,
): { state: TrainingState; accepted: boolean; reason: string | null } {
  if (state.cooldownsEnabled && (state.cooldowns[rune] || 0) > 0)
    return { state, accepted: false, reason: 'cooldown' };
  if (rune === 'ward' && state.shield)
    return { state, accepted: false, reason: 'ward-active' };
  if (rune === 'mend' && state.player === 100)
    return { state, accepted: false, reason: 'health-full' };
  if (rune === 'water' && !state.playerBurn)
    return { state, accepted: false, reason: 'not-burning' };
  if ((rune === 'frost' || rune === 'dispel') && !state.incoming)
    return { state, accepted: false, reason: 'no-incoming-attack' };

  const next = clone(state);
  next.casts++;
  if (rune === 'ward') {
    next.shield = true;
    next.message = 'Ward prepared. It will block the next training attack.';
  } else if (rune === 'fireball') {
    next.dummy = Math.max(0, next.dummy - 8);
    next.dummyBurn = true;
    next.dummyBurnTick ||= BURN_INTERVAL;
    next.message = 'Fireball hit for 8 and ignited the dummy.';
  } else if (rune === 'lightning') {
    next.dummy = Math.max(0, next.dummy - 16);
    next.message = 'Lightning hit the dummy for 16.';
  } else if (rune === 'frost') {
    next.incoming!.remaining += 3000;
    next.counters++;
    next.message = 'Frost delayed the training attack by 3 seconds.';
  } else if (rune === 'dispel') {
    next.incoming = null;
    next.counters++;
    next.message = 'Dispel cancelled the training attack.';
  } else if (rune === 'mend') {
    next.player = Math.min(100, next.player + 22);
    next.message = 'Mend restored up to 22 health.';
  } else if (rune === 'water') {
    next.playerBurn = false;
    next.playerBurnTick = 0;
    next.message = 'Water extinguished your training burn.';
  } else {
    next.stunned = 3000;
    next.message = 'Star stunned the dummy for 3 seconds.';
  }
  if (next.cooldownsEnabled) next.cooldowns[rune] = runeById(rune).cooldown;
  restoreDummy(next);
  return { state: next, accepted: true, reason: null };
}

export function setTrainingCooldowns(
  state: TrainingState,
  enabled: boolean,
): TrainingState {
  const next = clone(state);
  next.cooldownsEnabled = enabled;
  if (!enabled) next.cooldowns = {};
  next.message = enabled
    ? 'Training cooldowns enabled.'
    : 'Training cooldowns disabled — cast freely.';
  return next;
}
