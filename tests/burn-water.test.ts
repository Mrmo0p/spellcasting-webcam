import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombat,castSpell,tickCombat,BURN,COMBAT_VERSION} from '../lib/game/combat.ts';
import {blankAccuracy} from '../lib/game/types.ts';
import {spellAvailability} from '../lib/game/availability.ts';
import {createStudy,isCurrentStudy} from '../lib/game/study.ts';
import {loadAccuracy,loadStudy} from '../lib/game/storage.ts';
const accuracy=blankAccuracy();
const base=()=>createCombat('fixed',accuracy);
test('Fireball ignites; opponent spends three seconds casting Water on itself',()=>{
 const original=base(),fire=castSpell(original,{rune:'fireball',at:0}).state;
 assert.equal(original.opponentBurn,false);assert.equal(fire.opponent,92);assert.equal(fire.opponentBurn,true);
 assert.equal(fire.opponentWaterCast,3000);
 const midway=tickCombat(fire,1000,accuracy);assert.equal(midway.opponent,88);assert.equal(midway.remaining,4000);
 const out=tickCombat(midway,2000,accuracy);assert.equal(out.opponent,80);assert.equal(out.opponentBurn,false);assert.equal(out.opponentWaterCooldown,6000);
 assert.match(out.message,/casts Water on itself/);assert.equal(tickCombat(out,500,accuracy).opponent,80);
});
test('player must cast Water to end a burn; Water does not heal',()=>{
 const burning=tickCombat(base(),4000,accuracy);assert.equal(burning.player,82);assert.equal(burning.playerBurn,true);
 const damaged=tickCombat(burning,1000,accuracy);assert.equal(damaged.player,78);
 const water=castSpell(damaged,{rune:'water',at:damaged.elapsed});assert.equal(water.accepted,true);assert.equal(water.state.player,78);assert.equal(water.state.playerBurn,false);
 assert.equal(tickCombat(water.state,1000,accuracy).player,78);
 assert.equal(castSpell(water.state,{rune:'water',at:5000}).reason,'cooldown');
 assert.equal(castSpell(base(),{rune:'water',at:0}).reason,'not-burning');
 assert.equal(spellAvailability(base(),'water'),'Not burning');
});
test('Ward prevents ignition but an existing burn survives Ward and Mend',()=>{
 const ward=castSpell(base(),{rune:'ward',at:0}).state;
 assert.equal(tickCombat(ward,4000,accuracy).playerBurn,false);
 const burning=tickCombat(base(),4000,accuracy);
 const protectedState=castSpell(burning,{rune:'ward',at:4000}).state;
 assert.equal(protectedState.playerBurn,true);assert.equal(tickCombat(protectedState,1000,accuracy).player,78);
 assert.equal(castSpell(burning,{rune:'mend',at:4000}).state.playerBurn,true);
});
test('repeated fire neither stacks burn nor restarts Water preparation',()=>{
 const burning=tickCombat(castSpell(base(),{rune:'fireball',at:0}).state,500,accuracy);
 const again=castSpell({...burning,cooldowns:{}},{rune:'fireball',at:500}).state;
 assert.equal(again.opponentBurnTick,500);assert.equal(again.opponentWaterCast,2500);
 const next=tickCombat(again,500,accuracy);assert.equal(next.opponent,80);
});
test('opponent Water cooldown survives re-ignition and expires without extinguishing for free',()=>{
 const first=castSpell(base(),{rune:'fireball',at:0}).state;
 const later=tickCombat(first,4500,accuracy);
 const again=castSpell(later,{rune:'fireball',at:4500}).state;
 assert.equal(again.opponentWaterCast,0);assert.equal(again.opponentWaterCooldown,4500);
 const waiting=tickCombat(again,4000,accuracy);assert.equal(waiting.opponentBurn,true);assert.equal(waiting.opponentWaterCooldown,500);
 const casting=tickCombat(waiting,1000,accuracy);assert.equal(casting.opponentBurn,true);assert.equal(casting.opponentWaterCast,2500);
 const out=tickCombat(casting,2500,accuracy);assert.equal(out.opponentBurn,false);
});
test('burn and opponent actions produce identical results across frame partitions',()=>{
 const start=castSpell(base(),{rune:'fireball',at:0}).state;
 const single=tickCombat(start,10000,accuracy);let stepped=start;
 for(let i=0;i<80;i++)stepped=tickCombat(stepped,125,accuracy);
 assert.deepEqual(stepped,single);
 assert.equal(tickCombat(start,0,accuracy),start);
});
test('lethal burn ends combat at the damage tick and finished states cannot change',()=>{
 const dying={...base(),player:4,playerBurn:true,playerBurnTick:1000};
 const dead=tickCombat(dying,5000,accuracy);assert.equal(dead.outcome,'defeat');assert.equal(dead.elapsed,1000);
 assert.equal(castSpell(dead,{rune:'water',at:1000}).accepted,false);
 assert.equal(tickCombat(dead,1000,accuracy),dead);
 const opponent={...base(),opponent:4,opponentBurn:true,opponentBurnTick:BURN.interval};
 assert.equal(tickCombat(opponent,2000,accuracy).outcome,'victory');
});
test('Water preparation cannot be countered as an incoming damaging attack',()=>{
 const state=castSpell(base(),{rune:'fireball',at:0}).state;
 for(const rune of ['frost','dispel'] as const){assert.equal(castSpell(state,{rune,at:0}).reason,'no-incoming-attack');assert.equal(spellAvailability(state,rune),'Needs incoming attack');}
});
test('older six-rune progress remains exportable and new studies have seven runes',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');const values=new Map<string,string>();
 Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)}});
 try{
  const {water,...oldAccuracy}=blankAccuracy();oldAccuracy.ward={attempts:7,correct:4};values.set('spellbound.accuracy.v1',JSON.stringify(oldAccuracy));
  const migrated=loadAccuracy();assert.deepEqual(migrated.ward,oldAccuracy.ward);assert.deepEqual(migrated.water,{attempts:0,correct:0});
  const s=createStudy(1,'test','test');assert.equal(s.combatVersion,COMBAT_VERSION);assert.equal(s.practiceOrder.length,14);assert.equal(s.order.length,70);assert.equal(isCurrentStudy(s),true);
  values.set('spellbound.study.v1',JSON.stringify({...s,recognizerVersion:'templates-v1-pilot',combatVersion:undefined,accuracy:oldAccuracy,practiceOrder:s.practiceOrder.filter(r=>r!=='water'),order:s.order.filter(r=>r!=='water')}));
  const previous=loadStudy();assert.ok(previous);assert.equal(previous.id,s.id);assert.equal(previous.order.length,60);assert.equal(isCurrentStudy(previous),false);assert.deepEqual(previous.accuracy.ward,oldAccuracy.ward);
 }finally{if(descriptor)Object.defineProperty(globalThis,'localStorage',descriptor);else Reflect.deleteProperty(globalThis,'localStorage');}
});
