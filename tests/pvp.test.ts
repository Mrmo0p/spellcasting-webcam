import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advancePvp,
  castPvp,
  connectPvp,
  createPvpMatch,
  disconnectPvp,
  joinPvpMatch,
  leavePvp,
  PVP,
  PVP_COOLDOWNS,
  requestRematch,
  setPvpReady,
} from '../lib/pvp/engine.ts';
import {
  MAX_MESSAGE_BYTES,
  parseClientMessage,
  validGuestName,
  validRoomCode,
} from '../lib/pvp/protocol.ts';
import {
  appendTrailPoints,
  encodeTrailPoints,
  trailBezierSegments,
  trailViewport,
} from '../lib/pvp/trail.ts';

function active() {
  let s = createPvpMatch('ABC234', 'Alice', 0);
  s = joinPvpMatch(s, 'Bob', 1);
  s = connectPvp(s, 'player1', 2);
  s = connectPvp(s, 'player2', 3);
  s = setPvpReady(s, 'player1', 4);
  s = setPvpReady(s, 'player2', 5);
  return advancePvp(s, 3005);
}
void test('rooms validate names and codes', () => {
  assert.equal(validGuestName(' Alice '), 'Alice');
  assert.equal(validGuestName(''), null);
  assert.equal(validGuestName('x'.repeat(25)), null);
  assert.equal(validRoomCode('abc234'), 'ABC234');
  assert.equal(validRoomCode('ABC01I'), null);
});
void test('two ready connected players start after a three second countdown', () => {
  const s = active();
  assert.equal(s.status, 'active');
  assert.equal(s.players.player1?.health, 100);
  assert.equal(s.players.player2?.health, 100);
});
void test('attacks warn for four seconds and simultaneous lethal damage draws', () => {
  let s = active();
  s.players.player1!.health = 16;
  s.players.player2!.health = 16;
  s = castPvp(s, 'player1', 'lightning', 4000).state;
  s = castPvp(s, 'player2', 'lightning', 4000).state;
  assert.equal(advancePvp(s, 7999).outcome, null);
  s = advancePvp(s, 8000);
  assert.equal(s.outcome, 'draw');
  assert.equal(s.players.player1?.health, 0);
});
void test('ward blocks one attack while frost delays and dispel cancels the earliest', () => {
  let s = active();
  s = castPvp(s, 'player2', 'ward', 4000).state;
  s = castPvp(s, 'player1', 'lightning', 4100).state;
  s = advancePvp(s, 8100);
  assert.equal(s.players.player2?.health, 100);
  assert.equal(s.players.player2?.shield, false);
  s = castPvp(s, 'player1', 'fireball', 9000).state;
  const landing = s.incoming[0].landsAt;
  s = castPvp(s, 'player2', 'frost', 9100).state;
  assert.equal(s.incoming[0].landsAt, landing + 3000);
  s = advancePvp(s, 17100);
  s = castPvp(s, 'player1', 'lightning', 17200).state;
  s = castPvp(s, 'player2', 'dispel', 17201).state;
  assert.equal(s.incoming.length, 0);
});
void test('fire burns until Water and Mend does not extinguish', () => {
  let s = active();
  s = castPvp(s, 'player1', 'fireball', 4000).state;
  s = advancePvp(s, 8000);
  assert.equal(s.players.player2?.health, 92);
  assert.equal(s.players.player2?.burning, true);
  s = advancePvp(s, 9000);
  assert.equal(s.players.player2?.health, 88);
  s = castPvp(s, 'player2', 'mend', 9001).state;
  assert.equal(s.players.player2?.health, 100);
  assert.equal(s.players.player2?.burning, true);
  s = castPvp(s, 'player2', 'water', 9601).state;
  s = advancePvp(s, 12000);
  assert.equal(s.players.player2?.health, 100);
  assert.equal(s.players.player2?.burning, false);
});
void test('cooldowns and contextual casts are server enforced', () => {
  const s = active();
  let cast = castPvp(s, 'player1', 'lightning', 4000);
  assert.equal(cast.accepted, true);
  cast = castPvp(cast.state, 'player1', 'lightning', 4001);
  assert.equal(cast.reason, 'cooldown');
  assert.equal(
    castPvp(cast.state, 'player1', 'ward', 4500).reason,
    'global-cooldown',
  );
  assert.equal(castPvp(cast.state, 'player1', 'ward', 4600).accepted, true);
  assert.equal(cast.state.players.player1?.cooldowns.lightning, 9000);
  assert.deepEqual(PVP_COOLDOWNS, {
    ward: 8000,
    fireball: 7000,
    lightning: 5000,
    frost: 10000,
    mend: 13000,
    dispel: 11000,
    water: 3000,
    star: 15000,
  });
  assert.equal(castPvp(s, 'player1', 'water', 4000).reason, 'not-burning');
  assert.equal(
    castPvp(s, 'player1', 'dispel', 4000).reason,
    'no-incoming-attack',
  );
});
void test('star prevents the opponent from casting for three server-authoritative seconds', () => {
  let s = active();
  const star = castPvp(s, 'player1', 'star', 4000);
  assert.equal(star.accepted, true);
  s = star.state;
  assert.equal(s.players.player2?.stunnedUntil, 7000);
  assert.equal(castPvp(s, 'player2', 'ward', 6999).reason, 'stunned');
  const recovered = castPvp(s, 'player2', 'ward', 7000);
  assert.equal(recovered.accepted, true);
  assert.equal(recovered.state.players.player2?.stunnedUntil, null);
});
void test('disconnect pauses deadlines, reconnect shifts them, and grace expiry forfeits', () => {
  let s = active();
  s = castPvp(s, 'player1', 'lightning', 4000).state;
  const before = s.incoming[0].landsAt;
  const globalBefore = s.players.player1!.globalCooldownUntil;
  s = disconnectPvp(s, 'player2', 5000);
  assert.equal(s.status, 'paused');
  s = connectPvp(s, 'player2', 10000);
  assert.equal(s.status, 'active');
  assert.equal(s.incoming[0].landsAt, before + 5000);
  assert.equal(s.players.player1?.globalCooldownUntil, globalBefore + 5000);
  s = disconnectPvp(s, 'player2', 11000);
  s = advancePvp(s, 11000 + PVP.repeatReconnectGrace);
  assert.equal(s.outcome, 'player1');
});
void test('leave finishes and mutual rematch creates a fresh versioned countdown', () => {
  let s = leavePvp(active(), 'player1', 4000);
  assert.equal(s.outcome, 'player2');
  s = requestRematch(s, 'player1', 5000);
  const previousVersion = s.version;
  s = requestRematch(s, 'player2', 5001);
  assert.equal(s.status, 'countdown');
  assert.equal(s.players.player1?.health, 100);
  assert.ok(s.version > previousVersion);
});
void test('protocol rejects malformed, oversized and extra-field messages', () => {
  assert.ok(
    parseClientMessage(
      JSON.stringify({
        type: 'cast',
        sequence: 1,
        requestId: 'request_1',
        rune: 'ward',
        clientAt: 1,
      }),
    ),
  );
  assert.equal(
    parseClientMessage(
      JSON.stringify({
        type: 'cast',
        sequence: 1,
        requestId: 'x',
        rune: 'ward',
        clientAt: 1,
      }),
    ),
    null,
  );
  assert.equal(
    parseClientMessage(
      JSON.stringify({ type: 'ready', sequence: 1, landmarks: [] }),
    ),
    null,
  );
  assert.equal(parseClientMessage('x'.repeat(MAX_MESSAGE_BYTES + 1)), null);
  assert.equal(
    JSON.stringify(
      parseClientMessage(JSON.stringify({ type: 'ready', sequence: 1 })),
    ).includes('landmarks'),
    false,
  );
});
void test('trail protocol accepts bounded fixed-point batches and rejects private or malformed data', () => {
  const start = parseClientMessage(
    JSON.stringify({
      type: 'trail_start',
      sequence: 1,
      strokeId: 'stroke_123',
      sourceAspectQ: 1778,
      resume: false,
    }),
  );
  assert.equal(start?.type, 'trail_start');
  const points = parseClientMessage(
    JSON.stringify({
      type: 'trail_points',
      sequence: 2,
      strokeId: 'stroke_123',
      batch: 0,
      points: [
        [0, 10000, 0],
        [5000, 5000, 16],
      ],
    }),
  );
  assert.equal(points?.type, 'trail_points');
  assert.equal(
    parseClientMessage(
      JSON.stringify({
        type: 'trail_points',
        sequence: 2,
        strokeId: 'stroke_123',
        batch: 0,
        points: [[10001, 0, 0]],
      }),
    ),
    null,
  );
  assert.equal(
    parseClientMessage(
      JSON.stringify({
        type: 'trail_start',
        sequence: 1,
        strokeId: 'stroke_123',
        sourceAspectQ: 1778,
        resume: false,
        landmarks: [],
      }),
    ),
    null,
  );
  assert.equal(JSON.stringify(points).includes('landmarks'), false);
  assert.equal(JSON.stringify(points).includes('frame'), false);
});
void test('trail coordinates preserve aspect with uniform letterboxing and exact endpoints', () => {
  const source = [
      { x: 0, y: 0, t: 10 },
      { x: 16 / 9, y: 1, t: 26 },
      { x: 8 / 9, y: 0.5, t: 42 },
    ],
    encoded = encodeTrailPoints(source, 16 / 9),
    decoded = appendTrailPoints([], encoded, 16 / 9);
  assert.ok(Math.abs(decoded[1].x - 16 / 9) < 0.001);
  assert.equal(decoded[1].y, 1);
  const wide = trailViewport(16 / 9, 200, 200),
    portrait = trailViewport(16 / 9, 120, 240);
  assert.equal(wide.drawWidth, 200);
  assert.ok(wide.offsetY > 0);
  assert.equal(portrait.drawWidth, 120);
  assert.ok(portrait.offsetY > 0);
});
void test('remote curve interpolation passes through every transmitted point', () => {
  const points = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 4 },
    ],
    segments = trailBezierSegments(points);
  assert.equal(segments.length, 3);
  for (let i = 0; i < segments.length; i++) {
    assert.deepEqual(segments[i].from, points[i]);
    assert.deepEqual(segments[i].to, points[i + 1]);
  }
});
