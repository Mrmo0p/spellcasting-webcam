import {advancePvp,castPvp,connectPvp,createPvpMatch,disconnectPvp,joinPvpMatch,leavePvp,nextPvpDeadline,requestRematch,setPvpReady} from '../lib/pvp/engine.ts';
import {parseClientMessage,validGuestName,validRoomCode} from '../lib/pvp/protocol.ts';
import type {PvpMatchState,PvpSlot,ServerMessage} from '../lib/pvp/types.ts';

interface Env{MATCHES:DurableObjectNamespace;ALLOWED_ORIGINS?:string}
type StoredRoom={match:PvpMatchState;tokens:Record<PvpSlot,string|null>;sequences:Record<PvpSlot,number>;requests:Record<PvpSlot,string[]>;connections:Record<PvpSlot,string|null>};
const json=(value:unknown,status=200,headers:HeadersInit={})=>{const responseHeaders=new Headers(headers);responseHeaders.set('content-type','application/json; charset=utf-8');return new Response(JSON.stringify(value),{status,headers:responseHeaders});};
const randomToken=()=>{const bytes=crypto.getRandomValues(new Uint8Array(16));return Array.from(bytes,byte=>byte.toString(16).padStart(2,'0')).join('');};
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode=()=>Array.from(crypto.getRandomValues(new Uint8Array(6)),byte=>alphabet[byte%alphabet.length]).join('');
function allowedOrigin(request:Request,env:Env){const origin=request.headers.get('origin');if(!origin)return null;const configured=(env.ALLOWED_ORIGINS||'').split(',').map(value=>value.trim()).filter(Boolean);try{const url=new URL(origin);if(configured.includes(origin)||(url.protocol==='http:'&&(url.hostname==='localhost'||url.hostname==='127.0.0.1')))return origin;}catch{}return null;}
function cors(origin:string|null):HeadersInit{return origin?{'access-control-allow-origin':origin,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type','vary':'Origin'}:{}};
function withCors(response:Response,origin:string|null){const headers=new Headers(response.headers);for(const [key,value] of Object.entries(cors(origin)))headers.set(key,value);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
async function bodyName(request:Request){try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>2048)return null;return validGuestName((JSON.parse(raw) as {name?:unknown}).name);}catch{return null;}}

export default {async fetch(request:Request,env:Env):Promise<Response>{
 const origin=allowedOrigin(request,env);if(request.headers.has('origin')&&!origin)return json({error:'origin-not-allowed'},403);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:cors(origin)});
 const url=new URL(request.url),parts=url.pathname.split('/').filter(Boolean);
 if(request.method==='POST'&&parts.length===1&&parts[0]==='rooms'){
  const name=await bodyName(request);if(!name)return json({error:'invalid-name'},400,cors(origin));
  for(let attempt=0;attempt<5;attempt++){const code=randomCode(),stub=env.MATCHES.get(env.MATCHES.idFromName(code));const response=await stub.fetch(new Request(`https://room/create?code=${code}`,{method:'POST',body:JSON.stringify({name})}));if(response.ok)return withCors(response,origin);}
  return json({error:'room-create-failed'},503,cors(origin));
 }
 if(parts.length===3&&parts[0]==='rooms'){
  const code=validRoomCode(parts[1]);if(!code)return json({error:'invalid-room-code'},400,cors(origin));const stub=env.MATCHES.get(env.MATCHES.idFromName(code));
   if(request.method==='POST'&&parts[2]==='join'){const name=await bodyName(request);if(!name)return json({error:'invalid-name'},400,cors(origin));const response=await stub.fetch(new Request(`https://room/join?code=${code}`,{method:'POST',body:JSON.stringify({name})}));return withCors(response,origin);}
  if(request.method==='GET'&&parts[2]==='socket'){if(request.headers.get('upgrade')?.toLowerCase()!=='websocket')return json({error:'websocket-required'},426,cors(origin));const token=url.searchParams.get('token')||'';return stub.fetch(new Request(`https://room/socket?code=${code}&token=${encodeURIComponent(token)}`,{headers:request.headers}));}
 }
 return json({error:'not-found'},404,cors(origin));
}} satisfies ExportedHandler<Env>;

export class MatchRoom implements DurableObject{
 private room:StoredRoom|null=null;
 constructor(private ctx:DurableObjectState,private env:Env){void env;void this.ctx.blockConcurrencyWhile(async()=>{this.room=await this.ctx.storage.get<StoredRoom>('room')||null;});}
 async fetch(request:Request):Promise<Response>{
  const url=new URL(request.url),now=Date.now();
  if(url.pathname==='/create'&&request.method==='POST'){
   if(this.room)return json({error:'room-exists'},409);const name=await bodyName(request);if(!name)return json({error:'invalid-name'},400);const code=url.searchParams.get('code')||'';const token=randomToken();this.room={match:createPvpMatch(code,name,now),tokens:{player1:token,player2:null},sequences:{player1:0,player2:0},requests:{player1:[],player2:[]},connections:{player1:null,player2:null}};await this.persist();return json({code,token,slot:'player1'});
  }
  if(url.pathname==='/join'&&request.method==='POST'){
   if(!this.room)return json({error:'room-not-found'},404);const name=await bodyName(request);if(!name)return json({error:'invalid-name'},400);try{this.room.match=joinPvpMatch(this.room.match,name,now);}catch(error){return json({error:(error as Error).message},409);}const token=randomToken();this.room.tokens.player2=token;await this.persist();this.broadcastSnapshot();return json({code:this.room.match.code,token,slot:'player2'});
  }
  if(url.pathname==='/socket'&&request.headers.get('upgrade')?.toLowerCase()==='websocket'){
   if(!this.room)return json({error:'room-not-found'},404);const token=url.searchParams.get('token'),slot=this.slotForToken(token);if(!slot)return json({error:'invalid-token'},401);
   const pair=new WebSocketPair(),client=pair[0],server=pair[1],connectionId=randomToken();for(const old of this.ctx.getWebSockets(slot))old.close(4001,'Replaced by a newer connection');this.room.connections[slot]=connectionId;server.serializeAttachment({slot,connectionId});this.ctx.acceptWebSocket(server,[slot]);this.room.match=connectPvp(this.room.match,slot,now);await this.persist();this.send(server,{type:'welcome',slot,state:this.room.match,serverNow:now});this.broadcastSnapshot(server);return new Response(null,{status:101,webSocket:client});
  }
  return json({error:'not-found'},404);
 }
 async webSocketMessage(socket:WebSocket,message:string|ArrayBuffer){
  if(!this.room)return socket.close(1011,'Room unavailable');const attachment=socket.deserializeAttachment() as {slot:PvpSlot;connectionId:string}|null;if(!attachment||this.room.connections[attachment.slot]!==attachment.connectionId)return socket.close(4001,'Stale connection');const parsed=parseClientMessage(message);if(!parsed)return this.send(socket,{type:'error',code:'invalid-message',message:'The message was malformed or too large.'});const slot=attachment.slot;if(parsed.sequence<=this.room.sequences[slot])return this.send(socket,{type:'error',code:'stale-sequence',message:'The message sequence was already processed.'});this.room.sequences[slot]=parsed.sequence;const now=Date.now();
  if(parsed.type==='ping'){this.send(socket,{type:'pong',clientAt:parsed.clientAt,serverNow:now});return;}
  if(parsed.type==='cast'){
   if(this.room.requests[slot].includes(parsed.requestId))return this.send(socket,{type:'error',code:'duplicate-request',message:'That cast was already processed.',requestId:parsed.requestId});this.room.requests[slot]=[...this.room.requests[slot],parsed.requestId].slice(-100);const result=castPvp(this.room.match,slot,parsed.rune,now);this.room.match=result.state;if(!result.accepted)this.send(socket,{type:'error',code:result.reason||'cast-rejected',message:this.castError(result.reason),requestId:parsed.requestId});else this.broadcast({type:'event',text:`${this.room.match.players[slot]?.name||'Player'} cast ${parsed.rune}.`,at:now});
  }else if(parsed.type==='ready')this.room.match=setPvpReady(this.room.match,slot,now);else if(parsed.type==='rematch')this.room.match=requestRematch(this.room.match,slot,now);else this.room.match=leavePvp(this.room.match,slot,now);
  await this.persist();this.broadcastSnapshot();
 }
 async webSocketClose(socket:WebSocket){await this.closed(socket);}
 async webSocketError(socket:WebSocket){await this.closed(socket);}
 async alarm(){if(!this.room)return;const now=Date.now();if(now>=this.room.match.expiresAt){for(const socket of this.ctx.getWebSockets())socket.close(4004,'Room expired');await this.ctx.storage.deleteAll();this.room=null;return;}this.room.match=advancePvp(this.room.match,now);await this.persist();this.broadcastSnapshot();}
 private async closed(socket:WebSocket){if(!this.room)return;const attachment=socket.deserializeAttachment() as {slot:PvpSlot;connectionId:string}|null;if(!attachment||this.room.connections[attachment.slot]!==attachment.connectionId)return;this.room.connections[attachment.slot]=null;this.room.match=disconnectPvp(this.room.match,attachment.slot,Date.now());await this.persist();this.broadcastSnapshot();}
 private slotForToken(token:string|null):PvpSlot|null{return token&&token===this.room?.tokens.player1?'player1':token&&token===this.room?.tokens.player2?'player2':null;}
 private castError(reason:string|null){return reason==='cooldown'?'That rune is still cooling down.':reason==='health-full'?'Your health is already full.':reason==='not-burning'?'Water can only be cast while burning.':reason==='no-incoming-attack'?'That counter requires an incoming attack.':reason==='ward-active'?'Your Ward is already active.':'That spell cannot be cast right now.';}
 private send(socket:WebSocket,message:ServerMessage){try{socket.send(JSON.stringify(message));}catch{}}
 private broadcast(message:ServerMessage,except?:WebSocket){for(const socket of this.ctx.getWebSockets())if(socket!==except)this.send(socket,message);}
 private broadcastSnapshot(except?:WebSocket){if(this.room)this.broadcast({type:'snapshot',state:this.room.match,serverNow:Date.now()},except);}
 private async persist(){if(!this.room)return;await this.ctx.storage.put('room',this.room);const deadline=nextPvpDeadline(this.room.match);if(deadline!==null)await this.ctx.storage.setAlarm(deadline);}
}
