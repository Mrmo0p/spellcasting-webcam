import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombat,castSpell,tickCombat} from '../lib/game/combat.ts';
import {blankAccuracy} from '../lib/game/types.ts';
import {createStudy,finishDuel,studyCsv} from '../lib/game/study.ts';
test('summary counts burn health lost and successful extinguishes without mutating previous states',()=>{
 const a=blankAccuracy(),start=createCombat('fixed',a);
 const fire=castSpell(start,{rune:'fireball',at:0}).state;
 const after=tickCombat(fire,3000,a);assert.equal(after.stats.burnDealt,12);assert.equal(after.stats.opponentWaterCasts,1);
 assert.equal(fire.stats.burnDealt,0);assert.equal(start.stats.opponentWaterCasts,0);
 const hurt=tickCombat(after,5000,a);assert.equal(hurt.stats.burnTaken,4);
 const water=castSpell(hurt,{rune:'water',at:hurt.elapsed}).state;assert.equal(water.stats.waterCasts,1);assert.equal(hurt.stats.waterCasts,0);
 assert.equal(castSpell(water,{rune:'water',at:water.elapsed}).state.stats.waterCasts,1);
 const lethal=tickCombat({...start,player:2,playerBurn:true,playerBurnTick:1000},1000,a);assert.equal(lethal.stats.burnTaken,2);
 const study=finishDuel(createStudy(1,'test','test'),water);assert.deepEqual(study.duels[0].stats,water.stats);assert.match(studyCsv(study),/burnDealt/);
});
