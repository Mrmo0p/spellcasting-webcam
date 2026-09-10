import type {RuneId} from './types.ts';
export type ElementLesson='fire'|'water'|'done';
export function advanceElementLesson(step:ElementLesson,rune:RuneId|null):ElementLesson{
 if(step==='fire'&&rune==='fireball')return 'water';
 if(step==='water'&&rune==='water')return 'done';
 return step;
}
