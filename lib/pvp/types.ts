import type {RuneId} from '../game/types.ts';

export type PvpSlot='player1'|'player2';
export type PvpStatus='waiting'|'countdown'|'active'|'paused'|'finished';
export type PvpOutcome=PvpSlot|'draw'|null;
export type PvpConnectionStatus='idle'|'connecting'|'open'|'reconnecting'|'closed'|'error';

export type PvpPlayerState={
 slot:PvpSlot;name:string;health:number;shield:boolean;burning:boolean;nextBurnAt:number|null;
 cooldowns:Partial<Record<RuneId,number>>;ready:boolean;connected:boolean;reconnectUsed:boolean;rematch:boolean;
};

export type IncomingSpell={id:number;rune:'fireball'|'lightning';from:PvpSlot;to:PvpSlot;landsAt:number;frosted:boolean};

export type PvpMatchState={
 code:string;version:number;status:PvpStatus;players:Record<PvpSlot,PvpPlayerState|null>;incoming:IncomingSpell[];
 outcome:PvpOutcome;createdAt:number;updatedAt:number;expiresAt:number;countdownEndsAt:number|null;
 pausedAt:number|null;pausedFrom:'countdown'|'active'|null;disconnectDeadline:number|null;nextEventId:number;
};

export type ClientMessage=
 |{type:'ready';sequence:number}
 |{type:'cast';sequence:number;requestId:string;rune:RuneId;clientAt:number}
 |{type:'rematch';sequence:number}
 |{type:'leave';sequence:number}
 |{type:'ping';sequence:number;clientAt:number};

export type ServerMessage=
 |{type:'welcome';slot:PvpSlot;state:PvpMatchState;serverNow:number}
 |{type:'snapshot';state:PvpMatchState;serverNow:number}
 |{type:'event';text:string;at:number}
 |{type:'error';code:string;message:string;requestId?:string}
 |{type:'pong';clientAt:number;serverNow:number};

export type RoomCredentials={code:string;token:string;slot:PvpSlot};
