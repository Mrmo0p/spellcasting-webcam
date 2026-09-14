import {blankAccuracy,RUNE_IDS,type Accuracy} from './types.ts';
import type {Study} from './study.ts';
export const STORAGE_VERSION=1;
export function loadAccuracy():Accuracy{try{const data=JSON.parse(localStorage.getItem('spellbound.accuracy.v1')||'null');if(data&&data.water===undefined)data.water={attempts:0,correct:0};if(data&&data.star===undefined)data.star={attempts:0,correct:0};if(data&&RUNE_IDS.every(id=>Number.isInteger(data[id]?.attempts)&&data[id].attempts>=0&&Number.isInteger(data[id]?.correct)&&data[id].correct>=0&&data[id].correct<=data[id].attempts))return data;}catch{}return blankAccuracy();}
export function saveLocal(key:string,value:unknown):boolean{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
export function loadStudy():Study|null{
 try{
  const s=JSON.parse(localStorage.getItem('spellbound.study.v1')||'null') as Study|null;
  if(!s||s.version!==1||typeof s.id!=='string'||!Array.isArray(s.trials)||!Array.isArray(s.duels)||!Array.isArray(s.conditions)||s.conditions.length!==2||s.conditions.some(c=>!['fixed','adaptive'].includes(c))||!Array.isArray(s.order)||![60,70,80].includes(s.order.length)||!Array.isArray(s.practiceOrder)||![12,14,16].includes(s.practiceOrder.length)||[...s.order,...s.practiceOrder].some(r=>!RUNE_IDS.includes(r))||!['practice','measured','duel-ready','duel','rating','complete'].includes(s.status))return null;
  if(s.accuracy&&s.accuracy.water===undefined)s.accuracy.water={attempts:0,correct:0};
  if(s.accuracy&&s.accuracy.star===undefined)s.accuracy.star={attempts:0,correct:0};
  if(!s.accuracy||!RUNE_IDS.every(id=>Number.isInteger(s.accuracy[id]?.attempts)&&s.accuracy[id].attempts>=0&&Number.isInteger(s.accuracy[id]?.correct)&&s.accuracy[id].correct>=0&&s.accuracy[id].correct<=s.accuracy[id].attempts))return null;
  if(s.trials.some(t=>!RUNE_IDS.includes(t.target)||(t.predicted!==null&&!RUNE_IDS.includes(t.predicted))||!['practice','measured'].includes(t.phase))||s.duels.length>2)return null;
  if(s.status==='rating'&&!s.duels.length)return null;
  if((s.status==='duel'||s.status==='duel-ready')&&s.duels.length>=2)return null;
  if(s.status==='duel'){s.status='duel-ready';s.interruptions=(s.interruptions||0)+1;saveLocal('spellbound.study.v1',s);}return s;
 }catch{return null;}
}
