import test from 'node:test';
import assert from 'node:assert/strict';
import {recommendPractice} from '../lib/game/practice.ts';
import {blankAccuracy} from '../lib/game/types.ts';
test('practice suggestions start with an untried rune and prioritize the lowest prompted accuracy',()=>{
 const a=blankAccuracy();assert.equal(recommendPractice(a),'ward');
 a.ward={attempts:3,correct:3};assert.equal(recommendPractice(a),'fireball');
 a.fireball={attempts:4,correct:2};a.mend={attempts:3,correct:1};assert.equal(recommendPractice(a),'mend');
 assert.deepEqual(a.mend,{attempts:3,correct:1});
});
test('ties are reproducible and fully successful practice rotates to the least attempted rune',()=>{
 const a=blankAccuracy();a.ward={attempts:4,correct:2};a.frost={attempts:2,correct:1};
 assert.equal(recommendPractice(a),'frost');assert.equal(recommendPractice(a),'frost');
 for(const id of Object.keys(a) as (keyof typeof a)[])a[id]={attempts:3,correct:3};
 a.mend={attempts:1,correct:1};assert.equal(recommendPractice(a),'mend');
});
