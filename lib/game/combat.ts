import type {Accuracy,RuneId,SpellCommand} from './types.ts';
import {runeById} from './runes.ts';
export type Condition='fixed'|'adaptive';
export const PATTERNS=[{name:'Ember volley',counter:'ward' as RuneId,damage:18},{name:'Charged nova',counter:'dispel' as RuneId,damage:25},{name:'Glacial lance',counter:'frost' as RuneId,damage:20}];
export type CombatState={player:number;opponent:number;shield:boolean;phase:'telegraph'|'recovery'|'defending';remaining:number;elapsed:number;round:number;cooldowns:Partial<Record<RuneId,number>>;condition:Condition;outcome:'victory'|'defeat'|null;message:string;casts:number;blocked:number};
export function warningMs(condition:Condition,accuracy:Accuracy,rune:RuneId):number{const a=accuracy[rune];return 4000+(condition==='adaptive'&&a.attempts?2500*(1-a.correct/a.attempts):0);}
export function recoveryMs(condition:Condition,accuracy:Accuracy):number{const values=(['fireball','lightning','mend'] as RuneId[]).map(id=>accuracy[id]);const n=values.reduce((s,a)=>s+a.attempts,0),correct=values.reduce((s,a)=>s+a.correct,0);return 2200+(condition==='adaptive'&&n?2500*(1-correct/n):0);}
export function createCombat(condition:Condition,accuracy:Accuracy):CombatState{return {player:100,opponent:100,shield:false,phase:'telegraph',remaining:warningMs(condition,accuracy,'ward'),elapsed:0,round:0,cooldowns:{},condition,outcome:null,message:'The Archivist prepares an ember volley.',casts:0,blocked:0};}
export function tickCombat(state:CombatState,delta:number,accuracy:Accuracy):CombatState{
 if(state.outcome||delta<=0)return state;const s={...state,cooldowns:{...state.cooldowns},elapsed:state.elapsed+delta};for(const k of Object.keys(s.cooldowns) as RuneId[])s.cooldowns[k]=Math.max(0,(s.cooldowns[k]||0)-delta);let left=delta;
 while(left>0&&!s.outcome){const step=Math.min(left,s.remaining);s.remaining-=step;left-=step;if(s.remaining>0)break;
 if(s.phase==='telegraph'){const attack=PATTERNS[s.round%3];s.player=Math.max(0,s.player-(s.shield?0:attack.damage));if(s.shield)s.blocked++;s.message=s.shield?'Ward absorbed the attack.':attack.name+' hit for '+attack.damage+'.';s.shield=false;s.phase='recovery';s.remaining=recoveryMs(s.condition,accuracy);if(s.player===0)s.outcome='defeat';}
 else if(s.phase==='recovery'){s.phase='defending';s.remaining=1600;s.message='The Archivist raises a barrier. Damage is halved.';}
 else{s.round++;s.phase='telegraph';const attack=PATTERNS[s.round%3];s.remaining=warningMs(s.condition,accuracy,attack.counter);s.message=attack.name+' incoming.';}
 }return s;
}
export function castSpell(state:CombatState,command:SpellCommand):{state:CombatState;accepted:boolean;reason:string|null}{
 const id=command.rune;if(state.outcome)return {state,accepted:false,reason:'duel-ended'};if((state.cooldowns[id]||0)>0)return {state,accepted:false,reason:'cooldown'};
 const s={...state,cooldowns:{...state.cooldowns},casts:state.casts+1};const factor=s.phase==='defending'?.5:1;
 if(id==='ward'&&s.shield)return {state,accepted:false,reason:'ward-active'};
 if(id==='mend'&&s.player===100)return {state,accepted:false,reason:'health-full'};
 if((id==='dispel'||id==='frost')&&s.phase!=='telegraph')return {state,accepted:false,reason:'no-incoming-attack'};
 if(id==='ward')s.shield=true;if(id==='fireball')s.opponent=Math.max(0,s.opponent-28*factor);if(id==='lightning')s.opponent=Math.max(0,s.opponent-16*factor);if(id==='mend')s.player=Math.min(100,s.player+22);if(id==='frost')s.remaining+=3000;
 if(id==='dispel'){s.phase='recovery';s.remaining=2200;s.blocked++;}
 s.cooldowns[id]=runeById(id).cooldown;s.message=runeById(id).name+' cast.';if(s.opponent===0)s.outcome='victory';return {state:s,accepted:true,reason:null};
}
