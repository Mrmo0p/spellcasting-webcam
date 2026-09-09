import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonAfterSample,recognitionHint,blockedSpellHint} from '../lib/game/coaching.ts';

test('lesson advances only on observed preparation and drawing',()=>{
 assert.equal(lessonAfterSample('arm','rearm'),'arm');
 assert.equal(lessonAfterSample('arm','idle'),'draw');
 assert.equal(lessonAfterSample('draw','arming'),'draw');
 assert.equal(lessonAfterSample('draw','drawing'),'cast');
 assert.equal(lessonAfterSample('cast','releasing'),'cast');
 assert.equal(lessonAfterSample('cast','idle'),'cast');
});
test('lesson retains progress through brief gaps and rearms after cancellation',()=>{
 assert.equal(lessonAfterSample('cast','recovering'),'cast');
 assert.equal(lessonAfterSample('cast','rearm'),'arm');
 assert.equal(lessonAfterSample('draw','rearm'),'arm');
 assert.equal(lessonAfterSample('done','rearm'),'done');
});
test('feedback separates recognition failures from recognized blocked spells',()=>{
 assert.match(recognitionHint('too-short'),/Not enough movement/);
 assert.match(recognitionHint('ambiguous'),/more than one rune/);
 assert.match(recognitionHint('tracking-lost'),/whole hand/);
 assert.match(blockedSpellHint('ward','cooldown',1250),/Ward recognized.*2 seconds/);
 assert.match(blockedSpellHint('ward','cooldown',50),/1 seconds/);
 assert.match(blockedSpellHint('mend','health-full'),/health is full/);
 assert.match(blockedSpellHint('dispel','no-incoming-attack'),/incoming attack warning/);
});
