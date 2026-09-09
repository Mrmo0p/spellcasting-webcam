'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {TrackingSample} from '@/lib/game/types';
export function useTracking(onSample:(sample:TrackingSample)=>void){
 const videoRef=useRef<HTMLVideoElement>(null),workerRef=useRef<Worker|null>(null),streamRef=useRef<MediaStream|null>(null),callback=useRef(onSample),raf=useRef(0),generation=useRef(0),busy=useRef(false),watchdog=useRef<ReturnType<typeof setTimeout>|null>(null);
 callback.current=onSample;
 const [status,setStatus]=useState<'off'|'loading'|'ready'|'error'>('off'),[error,setError]=useState('');
 const stop=useCallback(()=>{generation.current++;cancelAnimationFrame(raf.current);if(watchdog.current)clearTimeout(watchdog.current);workerRef.current?.terminate();workerRef.current=null;streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;if(videoRef.current)videoRef.current.srcObject=null;busy.current=false;setStatus('off');},[]);
 const start=useCallback(async()=>{
 stop();const gen=generation.current;setStatus('loading');setError('');
 const fail=(message:string)=>{if(gen!==generation.current)return;stop();setError(message);setStatus('error');};
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access requires HTTPS or localhost in desktop Chrome or Edge.');
  const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:30,max:30}},audio:false});
  if(gen!==generation.current){stream.getTracks().forEach(t=>t.stop());return;}streamRef.current=stream;
  stream.getVideoTracks()[0].onended=()=>fail('The camera disconnected. Reconnect it and try again.');
  const video=videoRef.current;if(!video)throw new Error('Camera preview is unavailable.');
  video.srcObject=stream;await video.play();if(gen!==generation.current)return;
  const worker=new Worker('/hand-worker.js');workerRef.current=worker;let previous=-1;
  const pump=()=>{if(gen!==generation.current)return;raf.current=requestAnimationFrame(pump);if(busy.current||document.hidden||video.readyState<2||video.currentTime===previous)return;previous=video.currentTime;busy.current=true;const t=performance.now();
   watchdog.current=setTimeout(()=>fail('Tracking stopped responding. Restart the camera.'),5000);
   createImageBitmap(video).then(bitmap=>{if(gen!==generation.current){bitmap.close();return;}worker.postMessage({type:'frame',bitmap,t,frameStartedAt:t},[bitmap]);}).catch(()=>fail('Could not read a camera frame. Try restarting the camera.'));
  };
  worker.onerror=()=>fail('The tracking worker could not start. Reload the page and try again.');
  worker.onmessage=({data})=>{if(gen!==generation.current)return;if(watchdog.current)clearTimeout(watchdog.current);if(data.type==='ready'){setStatus('ready');pump();}else if(data.type==='error'){fail('Hand tracking could not load. Check your connection and restart the camera.');}else if(data.type==='result'){busy.current=false;callback.current({...data,receivedAt:performance.now(),aspect:video.videoWidth/video.videoHeight});}};
  watchdog.current=setTimeout(()=>fail('Loading hand tracking took too long. Check your connection and retry.'),45000);worker.postMessage({type:'init'});
 }catch(e){const name=(e as Error).name;fail(name==='NotAllowedError'?'Camera permission was denied. Allow camera access in your browser, then try again.':name==='NotFoundError'?'No webcam was found. Connect a camera and retry.':name==='NotReadableError'?'The camera is busy. Close other apps using it and retry.':(e as Error).message);}
 },[stop]);
 useEffect(()=>()=>{generation.current++;cancelAnimationFrame(raf.current);if(watchdog.current)clearTimeout(watchdog.current);workerRef.current?.terminate();streamRef.current?.getTracks().forEach(t=>t.stop());},[]);
 return {videoRef,start,stop,status,error};
}
