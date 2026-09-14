import type {Point,RecognitionResult,Stroke} from './types.ts';
import {RUNES} from './runes.ts';
import {INPUT_TIMING} from './gating.ts';
export const RECOGNIZER_VERSION='templates-v3-star-stun';
export const THRESHOLDS={maxDistance:.18,minMargin:.035,minLength:.12,minExtent:.06,maxDuration:INPUT_TIMING.maxStroke};
export const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const pathLength=(p:Point[])=>p.slice(1).reduce((s,v,i)=>s+distance(p[i],v),0);
export function resample(points:Point[],n=64):Point[]{
 if(!points.length)return [];const total=pathLength(points);if(total<1e-8)return Array.from({length:n},()=>({...points[0]}));
 const cumulative=[0];for(let i=1;i<points.length;i++)cumulative.push(cumulative[i-1]+distance(points[i-1],points[i]));
 let j=1;return Array.from({length:n},(_,i)=>{const at=total*i/(n-1);while(j<points.length-1&&cumulative[j]<at)j++;const a=points[j-1],b=points[j],f=(at-cumulative[j-1])/(cumulative[j]-cumulative[j-1]||1);return {x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f,t:a.t+(b.t-a.t)*f}});
}
export function normalize(points:Point[]):Point[]{
 const p=resample(points);if(!p.length)return [];const size=Math.max(Math.max(...p.map(v=>v.x))-Math.min(...p.map(v=>v.x)),Math.max(...p.map(v=>v.y))-Math.min(...p.map(v=>v.y)),1e-8);const cx=p.reduce((s,v)=>s+v.x,0)/p.length,cy=p.reduce((s,v)=>s+v.y,0)/p.length;
 return p.map(v=>({...v,x:(v.x-cx)/size,y:(v.y-cy)/size}));
}
function bestDistance(a:Point[],b:Point[],closed:boolean):number{
 let best=Infinity;
 for(const direction of [b,[...b].reverse()])for(let deg=-15;deg<=15;deg+=5){
 const angle=deg*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),rot=direction.map(p=>({...p,x:p.x*c-p.y*s,y:p.x*s+p.y*c}));
 const count=closed?63:64;for(let shift=0;shift<(closed?63:1);shift++){let d=0;for(let i=0;i<count;i++)d+=distance(a[i],rot[(i+shift)%count]);best=Math.min(best,d/count);}
 }return best;
}
const templates=RUNES.map(r=>({...r,normalized:normalize(r.points)}));
export function recognize(stroke:Stroke):RecognitionResult{
 const begin=performance.now();const reject=(reason:string):RecognitionResult=>({rune:null,candidate:null,score:0,distance:1,runnerUpDistance:1,reason,recognitionMs:performance.now()-begin});
 if(stroke.cancelled)return reject(stroke.cancelled);
 if(stroke.points.length<4)return reject('too-short');
 if(stroke.endedAt-stroke.startedAt>THRESHOLDS.maxDuration)return reject('too-long');
 if(stroke.points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return reject('invalid-path');
 const extent=Math.max(Math.max(...stroke.points.map(p=>p.x))-Math.min(...stroke.points.map(p=>p.x)),Math.max(...stroke.points.map(p=>p.y))-Math.min(...stroke.points.map(p=>p.y)));
 if(pathLength(stroke.points)<THRESHOLDS.minLength||extent<THRESHOLDS.minExtent)return reject('too-small');
 const straight=pathLength(stroke.points)/(distance(stroke.points[0],stroke.points.at(-1)!)||1e-8)<1.15;
 const p=normalize(stroke.points),scores=templates.map(t=>({id:t.id,d:straight&&t.id!=='dispel'?1:bestDistance(p,t.normalized,t.closed)})).sort((a,b)=>a.d-b.d);
 const [best,next]=scores;const reason=best.d>THRESHOLDS.maxDistance?'unknown-shape':next.d-best.d<THRESHOLDS.minMargin?'ambiguous':null;
 return {rune:reason?null:best.id,candidate:best.id,score:Math.max(0,1-best.d/.5),distance:best.d,runnerUpDistance:next.d,reason,recognitionMs:performance.now()-begin};
}
