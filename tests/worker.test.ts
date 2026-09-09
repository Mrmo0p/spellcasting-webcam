import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../public/hand-worker.js',import.meta.url),'utf8');
test('worker closes transferred frames on success and failure',async()=>{
 const messages: any[]=[],closed:number[]=[];let fail=false;
 const self: any={postMessage:(m:unknown)=>messages.push(m)};
 const context=vm.createContext({self,performance,importScripts:()=>{},FilesetResolver:{forVisionTasks:async()=>({})},HandLandmarker:{createFromOptions:async(_:unknown,config:any)=>{assert.equal(config.runningMode,'VIDEO');assert.equal(config.numHands,1);return {detectForVideo:()=>{if(fail)throw new Error('test failure');return {landmarks:[],handedness:[]};}};}}});
 context.Vision={FilesetResolver:context.FilesetResolver,HandLandmarker:context.HandLandmarker};
 vm.runInContext(source,context);await self.onmessage({data:{type:'init'}});assert.equal(messages[0].type,'ready');
 await self.onmessage({data:{type:'frame',t:10,frameStartedAt:10,bitmap:{close:()=>closed.push(1)}}});assert.equal(messages[1].type,'result');assert.equal(closed.length,1);
 fail=true;await self.onmessage({data:{type:'frame',t:20,bitmap:{close:()=>closed.push(1)}}});assert.equal(messages[2].type,'error');assert.equal(closed.length,2);
});
test('real MediaPipe classic bundle exports worker entry points',async()=>{
 const code=await readFile(new URL('../node_modules/@mediapipe/tasks-vision/vision_bundle.js',import.meta.url),'utf8');
 const scope: any={console,performance,TextDecoder,TextEncoder,Uint8Array,ArrayBuffer,WebAssembly,setTimeout,clearTimeout};scope.self=scope;scope.globalThis=scope;
 vm.runInContext(code,vm.createContext(scope));assert.equal(typeof scope.Vision.HandLandmarker?.createFromOptions,'function');assert.equal(typeof scope.Vision.FilesetResolver?.forVisionTasks,'function');
});
