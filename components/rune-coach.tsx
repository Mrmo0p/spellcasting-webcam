'use client';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {runeById} from '@/lib/game/runes';
import {DRAWING_TIPS,recommendPractice} from '@/lib/game/practice';
import type {Accuracy,RuneId} from '@/lib/game/types';

export function RuneCoach({runeId,accuracy,onSelect}:{runeId:RuneId;accuracy:Accuracy;onSelect:(id:RuneId)=>void}){
 const [replay,setReplay]=useState(0);
 const rune=runeById(runeId),record=accuracy[runeId],suggested=recommendPractice(accuracy);
 const points=rune.points.map(p=>`${p.x*100},${p.y*100}`).join(' '),start=rune.points[0];
 return <section className="rune-coach" aria-label="Rune drawing guide">
  <div className="rune-demo" style={{color:rune.color}}>
   <svg key={runeId+':'+replay} viewBox="0 0 100 100" role="img" aria-label={`${rune.shape} example. The dot marks one possible starting point.`}>
    <polyline points={points} className="demo-reference"/>
    <polyline points={points} pathLength="1" className={replay?'demo-stroke playing':'demo-stroke'}/>
    <circle cx={start.x*100} cy={start.y*100} r="3"/>
   </svg><span>DOT = START</span>
  </div>
  <div className="coach-copy"><p className="eyebrow">TRACE {rune.shape.toUpperCase()}</p><h2>{rune.name}</h2><p>{DRAWING_TIPS[runeId]}</p><small>Either drawing direction works. Curl your index finger and hold briefly when finished.</small>
   <p className="practice-record">{record.attempts?`${record.correct} of ${record.attempts} prompted attempts correct (${Math.round(record.correct/record.attempts*100)}%).`:'No prompted attempts for this rune yet.'}</p>
   <div className="row"><Button variant="outline" onClick={()=>setReplay(n=>n+1)}>Watch the stroke</Button><Button variant="outline" onClick={()=>{setReplay(0);onSelect(suggested);}}>Practice {runeById(suggested).name} next</Button></div>
   <small className="suggestion-note">Next-rune suggestions use your practice results on this device.</small>
  </div>
 </section>;
}
