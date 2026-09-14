import {RUNE_IDS} from '../game/types.ts';
import type {ClientMessage} from './types.ts';

export const MAX_MESSAGE_BYTES=2048;
export function validGuestName(input:unknown):string|null{if(typeof input!=='string')return null;const name=input.trim();return name.length>=1&&name.length<=24?name:null;}
export function validRoomCode(input:string):string|null{const code=input.trim().toUpperCase();return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code)?code:null;}
export function parseClientMessage(raw:string|ArrayBuffer):ClientMessage|null{
 if(typeof raw!=='string'||new TextEncoder().encode(raw).byteLength>MAX_MESSAGE_BYTES)return null;
 let value:unknown;try{value=JSON.parse(raw);}catch{return null;}if(!value||typeof value!=='object')return null;
 const input=value as Record<string,unknown>,sequence=input.sequence;if(!Number.isSafeInteger(sequence)||Number(sequence)<1)return null;
 if(input.type==='ready'||input.type==='rematch'||input.type==='leave')return Object.keys(input).every(key=>key==='type'||key==='sequence')?input as ClientMessage:null;
 if(input.type==='ping'&&typeof input.clientAt==='number'&&Number.isFinite(input.clientAt)&&Object.keys(input).every(key=>['type','sequence','clientAt'].includes(key)))return input as ClientMessage;
 if(input.type==='cast'&&typeof input.requestId==='string'&&/^[A-Za-z0-9_-]{8,64}$/.test(input.requestId)&&typeof input.rune==='string'&&RUNE_IDS.includes(input.rune as never)&&typeof input.clientAt==='number'&&Number.isFinite(input.clientAt)&&Object.keys(input).every(key=>['type','sequence','requestId','rune','clientAt'].includes(key)))return input as ClientMessage;
 return null;
}
