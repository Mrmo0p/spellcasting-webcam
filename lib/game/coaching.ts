import type {RuneId} from './types.ts';
import {runeById} from './runes.ts';

export type LessonStep='arm'|'draw'|'cast'|'done';
export function lessonAfterSample(step:LessonStep,gateState:string):LessonStep{
 if(step!=='done'&&gateState==='rearm')return 'arm';
 if(step==='arm'&&gateState==='idle')return 'draw';
 if(step==='draw'&&gateState==='drawing')return 'cast';
 return step;
}
export function recognitionHint(reason:string|null):string{
 switch(reason){
  case 'too-short':return 'Not enough movement to read a rune. Wait for “Drawing”, then trace the whole shape before curling your index finger.';
  case 'too-small':return 'Rune too small. Use more of the drawing area and trace one complete shape.';
  case 'too-long':return 'Stroke timed out. Finish within 20 seconds, then curl your index finger to cast.';
  case 'tracking-lost':return 'Tracking was lost. Bring your whole hand into view, curl your index finger, then redraw.';
  case 'interrupted':return 'Stroke interrupted. Curl your index finger to start fresh, then redraw.';
  case 'ambiguous':return 'The shape matched more than one rune. Make its corners or curves more distinct, then try again.';
  default:return 'Shape not recognized. Follow the rune reference in one stroke, then curl your index finger and hold briefly.';
 }
}
export function blockedSpellHint(rune:RuneId,reason:string|null,remainingMs=0):string{
 const name=runeById(rune).name;
 switch(reason){
  case 'cooldown':return `${name} recognized, but still cooling down. Wait about ${Math.max(1,Math.ceil(remainingMs/1000))} seconds, then draw it again.`;
  case 'not-burning':return 'Water recognized, but you are not burning. Save it to extinguish fire on yourself.';
  case 'health-full':return 'Mend recognized, but your health is full. Try Fireball or Lightning to attack.';
  case 'ward-active':return 'Ward recognized, but your shield is already active. Try an attack while it protects you.';
  case 'no-incoming-attack':return `${name} recognized. Save it for an incoming attack warning; try Fireball or Lightning now.`;
  default:return 'The duel has ended. Start another duel to cast again.';
 }
}
