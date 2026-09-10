import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceElementLesson} from '../lib/game/element-lesson.ts';
import {RUNE_IDS} from '../lib/game/types.ts';
test('Fire-Water lesson requires the correct rune for each step',()=>{
 assert.equal(advanceElementLesson('fire','fireball'),'water');
 assert.equal(advanceElementLesson('water','water'),'done');
 for(const rune of [...RUNE_IDS,null]){
  if(rune!=='fireball')assert.equal(advanceElementLesson('fire',rune),'fire');
  if(rune!=='water')assert.equal(advanceElementLesson('water',rune),'water');
  assert.equal(advanceElementLesson('done',rune),'done');
 }
});
