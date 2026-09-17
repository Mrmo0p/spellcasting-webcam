import assert from 'node:assert/strict';
import test from 'node:test';
import {
  castTraining,
  createTraining,
  damageTrainingPlayer,
  igniteTrainingPlayer,
  queueTrainingAttack,
  tickTraining,
} from '../lib/game/training.ts';

void test('training attacks exercise Ward, Frost, and Dispel', () => {
  let state = createTraining();
  state = castTraining(state, 'ward').state;
  state = tickTraining(queueTrainingAttack(state, 'ember'), 4000);
  assert.equal(state.player, 100);
  assert.equal(state.shield, false);

  state = queueTrainingAttack(state, 'lance');
  state = { ...state, cooldowns: {} };
  state = castTraining(state, 'frost').state;
  assert.equal(state.incoming?.remaining, 7000);
  state = { ...state, cooldowns: {} };
  state = castTraining(state, 'dispel').state;
  assert.equal(state.incoming, null);
  assert.equal(state.counters, 3);
});

void test('training supports attack, healing, burn, Water, and Star drills', () => {
  let state = createTraining();
  state = castTraining(state, 'fireball').state;
  assert.equal(state.dummy, 92);
  assert.equal(tickTraining(state, 1000).dummy, 88);
  state = { ...damageTrainingPlayer(state), cooldowns: {} };
  assert.equal(castTraining(state, 'mend').state.player, 92);
  state = igniteTrainingPlayer(state);
  assert.equal(castTraining(state, 'water').state.playerBurn, false);
  state = { ...state, cooldowns: {} };
  state = castTraining(state, 'star').state;
  assert.equal(state.stunned, 3000);
  assert.equal(tickTraining(state, 3000).stunned, 0);
});

void test('training is nonlethal and restores a defeated dummy', () => {
  let state = { ...createTraining(), player: 5, dummy: 8 };
  state = tickTraining(igniteTrainingPlayer(state), 1000);
  assert.equal(state.player, 1);
  state = castTraining(state, 'lightning').state;
  assert.equal(state.dummy, 100);
  assert.equal(state.resets, 1);
});
