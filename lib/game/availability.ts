import type {CombatState} from './combat.ts';
import type {RuneId} from './types.ts';
export function spellAvailability(s:CombatState,id:RuneId):string{
 if(s.outcome)return 'Duel ended';
 if((s.cooldowns[id]||0)>0)return ((s.cooldowns[id]||0)/1000).toFixed(1)+'s cooldown';
 if(id==='ward'&&s.shield)return 'Shield active';
 if(id==='mend'&&s.player===100)return 'Health full';
 if((id==='frost'||id==='dispel')&&s.phase!=='telegraph')return 'Needs incoming attack';
 return 'Ready';
}
