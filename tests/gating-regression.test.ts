import test from 'node:test';
import assert from 'node:assert/strict';
import {StrokeGate,isPointing,INPUT_VERSION} from '../lib/game/gating.ts';
import {RUNES} from '../lib/game/runes.ts';
import {recognize} from '../lib/game/recognition.ts';
import {createStudy} from '../lib/game/study.ts';
import type {Landmark,TrackingSample} from '../lib/game/types.ts';
function frame(t:number,curled=false):TrackingSample{
 const l:Landmark[]=Array.from({length:21},()=>({x:.5,y:.7,z:0}));
 l[0]={x:.5,y:.9,z:0};l[5]={x:.4,y:.65,z:0};l[6]={x:.4,y:.5,z:0};l[8]={x:.4,y:curled?.68:.25,z:0};
 for(const [a,b,c] of [[9,10,12],[13,14,16],[17,18,20]]){l[a]={x:.5,y:.65,z:0};l[b]={x:.5,y:.5,z:0};l[c]={x:.5,y:.7,z:0};}
 return {t,landmarks:l,inferenceMs:20,frameStartedAt:t,receivedAt:t+20,handedness:'Right',aspect:1};
}
function started(){const g=new StrokeGate();g.feed(frame(0,true));g.feed(frame(160,true));g.feed(frame(200));g.feed(frame(330));assert.equal(g.state,'drawing');return g;}
test('loosening other fingers for a full second does not release an active stroke',()=>{
 const g=started();for(let t=400;t<=1400;t+=100){const f=frame(t);for(const i of [12,16,20])f.landmarks[i].y=.25;f.landmarks[8].x+=.01*(t-400)/100;assert.equal(isPointing(f.landmarks),false);assert.equal(g.feed(f),null);assert.equal(g.state,'drawing');}assert.ok(g.points.length>2);assert.equal(g.startedAt,330);
});
test('a 200ms accidental finger curl does not cast',()=>{const g=started();g.feed(frame(400,true));g.feed(frame(500,true));g.feed(frame(600,true));assert.equal(g.feed(frame(640)),null);assert.equal(g.state,'drawing');assert.equal(g.startedAt,330);});
test('a brief missed detection preserves and resumes the same stroke',()=>{const g=started();g.feed(frame(400));const count=g.points.length;assert.equal(g.feed({...frame(450),landmarks:[]}),null);assert.equal(g.state,'recovering');assert.equal(g.cursor,null);assert.equal(g.points.length,count);assert.equal(g.feed(frame(700)),null);assert.equal(g.state,'drawing');assert.equal(g.startedAt,330);});
test('handedness label flicker alone never cancels',()=>{const g=started();for(let t=400;t<=1200;t+=100){assert.equal(g.feed({...frame(t),handedness:t%200?'Right':'Left'}),null);assert.equal(g.state,'drawing');}});
test('300ms frame intervals can draw and deliberately release',()=>{const g=started();for(let t=630;t<=1830;t+=300)assert.equal(g.feed(frame(t)),null);assert.equal(g.feed(frame(2130,true)),null);assert.equal(g.feed(frame(2430,true)),null);const stroke=g.feed(frame(2730,true));assert.ok(stroke);assert.equal(stroke.cancelled,undefined);});
test('recovery cannot bridge to a distant replacement hand',()=>{const g=started();g.feed({...frame(400),landmarks:[]});const far=frame(500);far.landmarks=far.landmarks.map(p=>({...p,x:p.x+.6}));assert.equal(g.feed(far)?.cancelled,'tracking-lost');assert.equal(g.state,'rearm');});
test('tracking gaps do not count toward release confirmation',()=>{const g=started();g.feed(frame(400,true));g.feed({...frame(500),landmarks:[]});assert.equal(g.feed(frame(800,true)),null);assert.equal(g.feed(frame(1000,true)),null);const stroke=g.feed(frame(1160,true));assert.ok(stroke);assert.equal(stroke.releasedAt,800);});
test('slow twelve-second strokes no longer hit the old eight-second cutoff',()=>{const g=started();for(let t=500;t<=12500;t+=200)assert.equal(g.feed(frame(t)),null);assert.equal(g.state,'drawing');const result=recognize({points:RUNES[0].points,startedAt:0,releasedAt:12000,endedAt:12350});assert.equal(result.rune,'ward');});
test('the twenty-second limit still cancels and requires rearming',()=>{const g=started();for(let t=500;t<=20300;t+=200)assert.equal(g.feed(frame(t)),null);assert.equal(g.feed(frame(20500))?.cancelled,'too-long');assert.equal(g.state,'rearm');});
test('study exports identify the changed input rules',()=>{assert.equal(createStudy(1,'test','test').inputVersion,INPUT_VERSION);});
