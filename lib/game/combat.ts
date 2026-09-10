import type {Accuracy,RuneId,SpellCommand} from './types.ts';
import {runeById} from './runes.ts';
export type Condition='fixed'|'adaptive';
export const COMBAT_VERSION='burn-water-v1';
export const BURN={damage:4,interval:1000,fireImpact:8,opponentWaterCast:3000,opponentWaterCooldown:6000};
export const PATTERNS=[{name:'Ember volley',counter:'ward' as RuneId,damage:18},{name:'Charged nova',counter:'dispel' as RuneId,damage:25},{name:'Glacial lance',counter:'frost' as RuneId,damage:20}];
export type DuelStats={burnDealt:number;burnTaken:number;waterCasts:number;opponentWaterCasts:number};
export type CombatState={stats:DuelStats;player:number;opponent:number;shield:boolean;phase:'telegraph'|'recovery'|'defending';remaining:number;elapsed:number;round:number;cooldowns:Partial<Record<RuneId,number>>;condition:Condition;outcome:'victory'|'defeat'|null;message:string;casts:number;blocked:number;playerBurn:boolean;opponentBurn:boolean;playerBurnTick:number;opponentBurnTick:number;opponentWaterCast:number;opponentWaterCooldown:number};
export function warningMs(condition:Condition,accuracy:Accuracy,rune:RuneId):number{const a=accuracy[rune];return 4000+(condition==='adaptive'&&a.attempts?2500*(1-a.correct/a.attempts):0);}
export function recoveryMs(condition:Condition,accuracy:Accuracy):number{const values=(['fireball','lightning','mend'] as RuneId[]).map(id=>accuracy[id]);const n=values.reduce((s,a)=>s+a.attempts,0),correct=values.reduce((s,a)=>s+a.correct,0);return 2200+(condition==='adaptive'&&n?2500*(1-correct/n):0);}
export function createCombat(condition:Condition,accuracy:Accuracy):CombatState{return {stats:{burnDealt:0,burnTaken:0,waterCasts:0,opponentWaterCasts:0},player:100,opponent:100,shield:false,phase:'telegraph',remaining:warningMs(condition,accuracy,'ward'),elapsed:0,round:0,cooldowns:{},condition,outcome:null,message:'The Archivist prepares an ember volley.',casts:0,blocked:0,playerBurn:false,opponentBurn:false,playerBurnTick:0,opponentBurnTick:0,opponentWaterCast:0,opponentWaterCooldown:0};}
function finish(s:CombatState){if(s.player<=0)s.outcome='defeat';else if(s.opponent<=0)s.outcome='victory';}
export function tickCombat(state:CombatState,delta:number,accuracy:Accuracy):CombatState{
 if(state.outcome||!Number.isFinite(delta)||delta<=0)return state;
 const s={...state,stats:{...state.stats},cooldowns:{...state.cooldowns}};let left=delta;
 // Advance to the next event, so burn/Water timing is independent of frame rate.
 while(left>0&&!s.outcome){
  if(s.opponentBurn&&s.opponentWaterCooldown===0&&s.opponentWaterCast===0)s.opponentWaterCast=BURN.opponentWaterCast;
  const waterCasting=s.opponentWaterCast>0;
  const step=Math.min(left,waterCasting?s.opponentWaterCast:s.remaining,s.playerBurn?s.playerBurnTick:Infinity,s.opponentBurn?s.opponentBurnTick:Infinity,s.opponentBurn&&!waterCasting&&s.opponentWaterCooldown>0?s.opponentWaterCooldown:Infinity);
  s.elapsed+=step;left-=step;
  for(const id of Object.keys(s.cooldowns) as RuneId[])s.cooldowns[id]=Math.max(0,(s.cooldowns[id]||0)-step);
  s.opponentWaterCooldown=Math.max(0,s.opponentWaterCooldown-step);
  if(waterCasting)s.opponentWaterCast=Math.max(0,s.opponentWaterCast-step);else s.remaining=Math.max(0,s.remaining-step);
  if(s.playerBurn){s.playerBurnTick-=step;if(s.playerBurnTick<=0){s.stats.burnTaken+=Math.min(s.player,BURN.damage);s.player=Math.max(0,s.player-BURN.damage);s.playerBurnTick=BURN.interval;s.message='You take 4 burn damage. Cast Water on yourself.';}}
  if(s.opponentBurn){s.opponentBurnTick-=step;if(s.opponentBurnTick<=0){s.stats.burnDealt+=Math.min(s.opponent,BURN.damage);s.opponent=Math.max(0,s.opponent-BURN.damage);s.opponentBurnTick=BURN.interval;s.message='The Archivist takes 4 burn damage.';}}
  // Burn ticks at the same timestamp as extinguishing resolve first.
  finish(s);if(s.outcome)break;
  if(waterCasting&&s.opponentWaterCast===0){s.stats.opponentWaterCasts++;s.opponentBurn=false;s.opponentBurnTick=0;s.opponentWaterCooldown=BURN.opponentWaterCooldown;s.message='The Archivist casts Water on itself. Burn extinguished.';}
  if(!waterCasting&&s.remaining===0){
   if(s.phase==='telegraph'){
    const attack=PATTERNS[s.round%3];s.player=Math.max(0,s.player-(s.shield?0:attack.damage));
    if(s.shield){s.blocked++;s.message='Ward absorbed the attack.';}
    else if(s.round%3===0){if(!s.playerBurn)s.playerBurnTick=BURN.interval;s.playerBurn=true;s.message='Ember volley hit for 18. You are burning — cast Water on yourself.';}
    else s.message=attack.name+' hit for '+attack.damage+'.';
    s.shield=false;s.phase='recovery';s.remaining=recoveryMs(s.condition,accuracy);finish(s);
   }else if(s.phase==='recovery'){s.phase='defending';s.remaining=1600;s.message='The Archivist raises a barrier. Damage is halved.';}
   else{s.round++;s.phase='telegraph';const attack=PATTERNS[s.round%3];s.remaining=warningMs(s.condition,accuracy,attack.counter);s.message=attack.name+' incoming.';}
  }
 }
 return s;
}
export function castSpell(state:CombatState,command:SpellCommand):{state:CombatState;accepted:boolean;reason:string|null}{
 const id=command.rune;if(state.outcome)return {state,accepted:false,reason:'duel-ended'};if((state.cooldowns[id]||0)>0)return {state,accepted:false,reason:'cooldown'};
 if(id==='ward'&&state.shield)return {state,accepted:false,reason:'ward-active'};
 if(id==='mend'&&state.player===100)return {state,accepted:false,reason:'health-full'};
 if(id==='water'&&!state.playerBurn)return {state,accepted:false,reason:'not-burning'};
 if((id==='dispel'||id==='frost')&&(state.phase!=='telegraph'||state.opponentWaterCast>0))return {state,accepted:false,reason:'no-incoming-attack'};
 const s={...state,stats:{...state.stats},cooldowns:{...state.cooldowns},casts:state.casts+1};const factor=s.phase==='defending'?.5:1;
 if(id==='ward')s.shield=true;
 if(id==='fireball'){s.opponent=Math.max(0,s.opponent-BURN.fireImpact*factor);if(!s.opponentBurn)s.opponentBurnTick=BURN.interval;s.opponentBurn=true;if(!s.opponentWaterCast&&!s.opponentWaterCooldown)s.opponentWaterCast=BURN.opponentWaterCast;}
 if(id==='lightning')s.opponent=Math.max(0,s.opponent-16*factor);
 if(id==='mend')s.player=Math.min(100,s.player+22);
 if(id==='water'){s.stats.waterCasts++;s.playerBurn=false;s.playerBurnTick=0;}
 if(id==='frost')s.remaining+=3000;
 if(id==='dispel'){s.phase='recovery';s.remaining=2200;s.blocked++;}
 s.cooldowns[id]=runeById(id).cooldown;
 s.message=id==='fireball'?'Fireball ignites the Archivist. Burn deals 4 damage each second.':id==='water'?'Water cast on yourself. Burn extinguished.':runeById(id).name+' cast.';
 finish(s);return {state:s,accepted:true,reason:null};
}
