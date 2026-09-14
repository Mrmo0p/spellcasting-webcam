'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {RuneId} from '@/lib/game/types';
import type {PvpConnectionStatus,PvpMatchState,PvpSlot,RoomCredentials,ServerMessage} from '@/lib/pvp/types';

const SESSION_KEY='spellbound.pvp.room.v1',SEQUENCE_KEY='spellbound.pvp.sequence.v1';
const configuredService=(process.env.NEXT_PUBLIC_PVP_API_URL||'').replace(/\/$/,'');
function serviceUrl(){if(configuredService)return configuredService;if(typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname))return 'http://localhost:8787';return '';}
function socketUrl(base:string,credentials:RoomCredentials){const url=new URL(`/rooms/${credentials.code}/socket`,base);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.searchParams.set('token',credentials.token);return url.toString();}

export function usePvp(){
 const [credentials,setCredentials]=useState<RoomCredentials|null>(null),[state,setState]=useState<PvpMatchState|null>(null),[slot,setSlot]=useState<PvpSlot|null>(null),[connection,setConnection]=useState<PvpConnectionStatus>('idle'),[error,setError]=useState(''),[events,setEvents]=useState<{text:string;at:number}[]>([]),[clockOffset,setClockOffset]=useState(0);
 const sequence=useRef(0),socket=useRef<WebSocket|null>(null),manualClose=useRef(false);
 useEffect(()=>{let active=true;queueMicrotask(()=>{if(!active)return;try{const saved=sessionStorage.getItem(SESSION_KEY),n=Number(sessionStorage.getItem(SEQUENCE_KEY)||0);if(saved){const parsed=JSON.parse(saved) as RoomCredentials;if(parsed.code&&parsed.token&&parsed.slot)setCredentials(parsed);}if(Number.isSafeInteger(n)&&n>=0)sequence.current=n;}catch{}});return()=>{active=false;};},[]);
 useEffect(()=>{
  if(!credentials)return;const base=serviceUrl();if(!base){queueMicrotask(()=>{setConnection('error');setError('PvP service is not configured for this deployment.');});return;}let stopped=false,retry:ReturnType<typeof setTimeout>|null=null,attempt=0;manualClose.current=false;
  const open=()=>{if(stopped)return;setConnection(attempt?'reconnecting':'connecting');const ws=new WebSocket(socketUrl(base,credentials));socket.current=ws;
   ws.onopen=()=>{attempt=0;setConnection('open');setError('');};
   ws.onmessage=event=>{let message:ServerMessage;try{message=JSON.parse(String(event.data)) as ServerMessage;}catch{return;}if(message.type==='welcome'||message.type==='snapshot'){setClockOffset(message.serverNow-Date.now());setState(current=>!current||message.state.version>=current.version?message.state:current);if(message.type==='welcome')setSlot(message.slot);}else if(message.type==='event')setEvents(items=>[...items,{text:message.text,at:message.at}].slice(-8));else if(message.type==='error')setError(message.message);else setClockOffset(message.serverNow-Date.now());};
   ws.onclose=()=>{if(stopped||manualClose.current)return;setConnection('reconnecting');attempt++;retry=setTimeout(open,Math.min(5000,500*Math.pow(2,Math.min(attempt,4))));};
   ws.onerror=()=>setError('The PvP connection was interrupted. Reconnecting…');
  };queueMicrotask(open);const ping=setInterval(()=>{if(socket.current?.readyState===WebSocket.OPEN){const next=++sequence.current;try{sessionStorage.setItem(SEQUENCE_KEY,String(next));}catch{}socket.current.send(JSON.stringify({type:'ping',sequence:next,clientAt:Date.now()}));}},10000);
  return()=>{stopped=true;if(retry)clearTimeout(retry);clearInterval(ping);socket.current?.close();socket.current=null;};
 },[credentials]);
 const remember=useCallback((value:RoomCredentials)=>{try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(value));sessionStorage.setItem(SEQUENCE_KEY,'0');}catch{}sequence.current=0;setCredentials(value);setSlot(value.slot);},[]);
 const requestRoom=useCallback(async(path:string,name:string)=>{const base=serviceUrl();if(!base)throw new Error('PvP service is not configured for this deployment.');const response=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name})});const data=await response.json() as RoomCredentials&{error?:string};if(!response.ok)throw new Error(data.error==='room-full'?'That room already has two players.':data.error==='room-not-found'?'Room not found. Check the code and try again.':data.error==='invalid-name'?'Enter a name between 1 and 24 characters.':'Could not open that room.');remember(data);return data;},[remember]);
 const createRoom=useCallback((name:string)=>requestRoom('/rooms',name),[requestRoom]);
 const joinRoom=useCallback((code:string,name:string)=>requestRoom(`/rooms/${code.trim().toUpperCase()}/join`,name),[requestRoom]);
 const send=useCallback((message:Record<string,unknown>)=>{if(socket.current?.readyState!==WebSocket.OPEN){setError('Not connected to the match service yet.');return false;}const next=++sequence.current;try{sessionStorage.setItem(SEQUENCE_KEY,String(next));}catch{}socket.current.send(JSON.stringify({...message,sequence:next}));return true;},[]);
 const cast=useCallback((rune:RuneId)=>send({type:'cast',requestId:crypto.randomUUID(),rune,clientAt:Date.now()}),[send]);
 const ready=useCallback(()=>send({type:'ready'}),[send]);
 const rematch=useCallback(()=>send({type:'rematch'}),[send]);
 const leave=useCallback(()=>{send({type:'leave'});manualClose.current=true;socket.current?.close();socket.current=null;try{sessionStorage.removeItem(SESSION_KEY);sessionStorage.removeItem(SEQUENCE_KEY);}catch{}setCredentials(null);setState(null);setSlot(null);setConnection('idle');setEvents([]);setError('');},[send]);
 return {state,slot,connection,error,events,clockOffset,roomCode:credentials?.code||'',createRoom,joinRoom,cast,ready,rematch,leave,clearError:()=>setError('')};
}
export type PvpController=ReturnType<typeof usePvp>;
