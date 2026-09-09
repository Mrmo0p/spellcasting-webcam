import type {Landmark,Point,Stroke,TrackingSample} from './types.ts';

export const INPUT_VERSION='continuous-stroke-v2';
export const INPUT_TIMING={arm:150,start:120,release:350,trackingGrace:500,maxStroke:20000};
function pose(l:Landmark[]){
 const d=(a:number,b:number)=>Math.hypot(l[a].x-l[b].x,l[a].y-l[b].y,l[a].z-l[b].z);
 const cosine=(a:number,b:number,c:number)=>{const u=[l[a].x-l[b].x,l[a].y-l[b].y,l[a].z-l[b].z],v=[l[c].x-l[b].x,l[c].y-l[b].y,l[c].z-l[b].z];return u.reduce((s,x,i)=>s+x*v[i],0)/(Math.hypot(...u)*Math.hypot(...v)||1);};
 const palm=d(0,9),angle=cosine(5,6,8),reach=d(8,0)-d(6,0);
 const curled=[[9,10,12],[13,14,16],[17,18,20]].filter(([a,b,c])=>cosine(a,b,c)>-.72||d(c,0)<d(b,0)+palm*.15).length;
 return {palm,start:palm>=.015&&angle<-.65&&reach>palm*.15&&curled>=2,
  // Failure to meet the starting pose is not evidence of release.
  release:palm>=.015&&angle>-.15&&reach<palm*.15};
}
const valid=(l:Landmark[])=>l.length===21&&l.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z));
export function isPointing(l:Landmark[]):boolean{return valid(l)&&pose(l).start;}

export class StrokeGate{
 state:'rearm'|'idle'|'arming'|'drawing'|'releasing'|'recovering'='rearm';
 points:Point[]=[];cursor:Point|null=null;since:number|null=null;startedAt=0;releasedAt=0;lastT:number|null=null;lastHand='';
 private smooth:Point|null=null;private raw:Point|null=null;private releaseSamples=0;
 reset(){this.state='rearm';this.points=[];this.cursor=null;this.smooth=null;this.raw=null;this.lastHand='';this.lastT=null;this.since=null;this.releaseSamples=0;}
 interrupt(t:number,reason:'tracking-lost'|'interrupted'='interrupted'):Stroke|null{
  const result=this.points.length?{points:[...this.points],startedAt:this.startedAt,releasedAt:t,endedAt:t,cancelled:reason}:null;this.reset();return result;
 }
 feed(sample:TrackingSample):Stroke|null{
  const t=sample.t;if(this.lastT!==null&&t<=this.lastT)return null;
  const active=this.points.length>0;
  if(active&&t-this.startedAt>INPUT_TIMING.maxStroke){const s:Stroke={points:[...this.points],startedAt:this.startedAt,releasedAt:t,endedAt:t,cancelled:'too-long'};this.reset();return s;}
  const gap=this.lastT===null?0:t-this.lastT;
  if(active&&gap>INPUT_TIMING.trackingGrace)return this.interrupt(t,'tracking-lost');
  if(!valid(sample.landmarks)){
   if(active){this.state='recovering';this.cursor=null;this.smooth=null;this.releaseSamples=0;}
   else this.reset();
   return null;
  }
  const tip=sample.landmarks[8],wrist=sample.landmarks[0],aspect=sample.aspect||4/3,p={x:(1-tip.x)*aspect,y:tip.y,t},anchor={x:(1-wrist.x)*aspect,y:wrist.y,t},hand=pose(sample.landmarks);
  const recovering=this.state==='recovering';
  const labelChanged=!!this.lastHand&&!!sample.handedness&&this.lastHand!==sample.handedness;
  // Labels can flicker when the same hand turns. Only an implausible spatial jump cancels.
  if(active&&this.raw&&(recovering||gap>200||labelChanged)){
   const jump=Math.hypot(anchor.x-this.raw.x,anchor.y-this.raw.y);
   const maxJump=Math.min(.4,Math.max(.15,hand.palm*1.75));
   if(jump>maxJump)return this.interrupt(t,'tracking-lost');
  }
  if(!active&&gap>INPUT_TIMING.trackingGrace){this.reset();}
  this.lastT=t;this.lastHand=sample.handedness;this.raw=anchor;
  const dt=this.smooth?Math.max(1,t-this.smooth.t):33,alpha=1-Math.exp(-dt/25);
  this.smooth=this.smooth?{x:this.smooth.x+alpha*(p.x-this.smooth.x),y:this.smooth.y+alpha*(p.y-this.smooth.y),t}:p;this.cursor=this.smooth;
  if(recovering){this.state='drawing';this.releaseSamples=0;}
  if(this.state==='rearm'){if(hand.release){this.since??=t;if(t-this.since>=INPUT_TIMING.arm){this.state='idle';this.since=null;}}else this.since=null;return null;}
  if(this.state==='idle'){if(hand.start){this.state='arming';this.since=t;}return null;}
  if(this.state==='arming'){if(!hand.start){this.state='idle';this.since=null;return null;}if(t-(this.since??t)>=INPUT_TIMING.start){this.state='drawing';this.startedAt=t;this.points=[{...this.smooth}];}return null;}
  if(hand.release){
   if(this.state!=='releasing'){this.state='releasing';this.releasedAt=t;this.releaseSamples=1;}
   else{this.releaseSamples++;if(t-this.releasedAt>=INPUT_TIMING.release&&this.releaseSamples>=3){const s={points:[...this.points],startedAt:this.startedAt,releasedAt:this.releasedAt,endedAt:t};this.points=[];this.state='idle';this.releaseSamples=0;return s;}}
  }else{
   this.state='drawing';this.releaseSamples=0;const prev=this.points.at(-1);
   if(!prev||Math.hypot(prev.x-this.smooth.x,prev.y-this.smooth.y)>.002)this.points.push({...this.smooth});
  }
  return null;
 }
}
