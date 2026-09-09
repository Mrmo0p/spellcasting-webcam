import type {Landmark,Point,Stroke,TrackingSample} from './types.ts';
export function isPointing(l:Landmark[]):boolean{
 if(l.length!==21)return false;
 const d=(a:number,b:number)=>Math.hypot(l[a].x-l[b].x,l[a].y-l[b].y,l[a].z-l[b].z);
 const palm=d(0,9);if(palm<.015)return false;
 const straight=(a:number,b:number,c:number)=>{const u=[l[a].x-l[b].x,l[a].y-l[b].y,l[a].z-l[b].z],v=[l[c].x-l[b].x,l[c].y-l[b].y,l[c].z-l[b].z];return u.reduce((s,x,i)=>s+x*v[i],0)/(Math.hypot(...u)*Math.hypot(...v)||1)<-.72;};
 const index=straight(5,6,8)&&d(8,0)>d(6,0)+palm*.22;
 const curled=[[9,10,12],[13,14,16],[17,18,20]].filter(([a,b,c])=>!straight(a,b,c)||d(c,0)<d(b,0)+palm*.15).length;
 return index&&curled>=2;
}
export class StrokeGate{
 state:'rearm'|'idle'|'arming'|'drawing'|'releasing'='rearm';
 points:Point[]=[];cursor:Point|null=null;since=0;startedAt=0;releasedAt=0;lastT=0;lastHand='';private smooth:Point|null=null;
 reset(){this.state='rearm';this.points=[];this.cursor=null;this.smooth=null;this.lastHand='';this.lastT=0;this.since=0;}
 interrupt(t:number,reason:'tracking-lost'|'interrupted'='interrupted'):Stroke|null{
 const result=this.points.length?{points:[...this.points],startedAt:this.startedAt,releasedAt:t,endedAt:t,cancelled:reason}:null;this.reset();return result;
 }
 feed(sample:TrackingSample):Stroke|null{
 const t=sample.t;
 if(!sample.landmarks.length)return this.interrupt(t,'tracking-lost');
 if((this.lastT&&t-this.lastT>250)||(this.lastHand&&sample.handedness&&this.lastHand!==sample.handedness))return this.interrupt(t,'tracking-lost');
 this.lastT=t;this.lastHand=sample.handedness;
 const tip=sample.landmarks[8],p={x:(1-tip.x)*(sample.aspect||4/3),y:tip.y,t};
 const dt=this.smooth?Math.max(1,t-this.smooth.t):33,alpha=1-Math.exp(-dt/25);
 this.smooth=this.smooth?{x:this.smooth.x+alpha*(p.x-this.smooth.x),y:this.smooth.y+alpha*(p.y-this.smooth.y),t}:p;this.cursor=this.smooth;
 const pointing=isPointing(sample.landmarks);
 if(this.state==='rearm'){if(!pointing){if(!this.since)this.since=t;if(t-this.since>=150){this.state='idle';this.since=0;}}else this.since=0;return null;}
 if(this.state==='idle'){if(pointing){this.state='arming';this.since=t;}return null;}
 if(this.state==='arming'){if(!pointing){this.state='idle';return null;}if(t-this.since>=120){this.state='drawing';this.startedAt=t;this.points=[{...this.smooth}];}return null;}
 if(t-this.startedAt>8000){const s:Stroke={points:[...this.points],startedAt:this.startedAt,releasedAt:t,endedAt:t,cancelled:'too-long'};this.reset();return s;}
 if(pointing){this.state='drawing';const prev=this.points.at(-1);if(!prev||Math.hypot(prev.x-this.smooth.x,prev.y-this.smooth.y)>.002)this.points.push({...this.smooth});}
 else if(this.state==='drawing'){this.state='releasing';this.releasedAt=t;}
 else if(t-this.releasedAt>=150){const s={points:[...this.points],startedAt:this.startedAt,releasedAt:this.releasedAt,endedAt:t};this.points=[];this.state='idle';return s;}
 return null;
 }
}
