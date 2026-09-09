import test from 'node:test';
import assert from 'node:assert/strict';
import {framingHint} from '../lib/game/framing.ts';
const hand=(palm:number)=>Array.from({length:21},(_,i)=>({x:.5,y:i===9?.5-palm:.5,z:0}));
test('framing distinguishes missing hands, distance and clipped fingertips',()=>{
 assert.match(framingHint([]),/Show one whole hand/);
 assert.match(framingHint(hand(.04)),/closer/);
 assert.match(framingHint(hand(.34)),/farther/);
 assert.match(framingHint(hand(.15)),/Hand in frame/);
 const edge=hand(.15);edge[8].x=.98;assert.match(framingHint(edge),/center/);
 edge[8].x=NaN;assert.match(framingHint(edge),/Show one whole hand/);
});
