import type {Point,RuneId} from './types.ts';
const path=(coords:number[][]):Point[]=>coords.map(([x,y],i)=>({x,y,t:i*40}));
const circle=Array.from({length:65},(_,i)=>[.5+.4*Math.cos(-Math.PI/2+i*Math.PI*2/64),.5+.4*Math.sin(-Math.PI/2+i*Math.PI*2/64)]);
const spiral=Array.from({length:97},(_,i)=>{const a=i/96*Math.PI*3.5-Math.PI/2;const r=.06+i/96*.38;return [.5+r*Math.cos(a),.5+r*Math.sin(a)]});
const water=[...[ [.15,.12],[.15,.55] ],...Array.from({length:33},(_,i)=>{const a=Math.PI-i/32*Math.PI;return [.5+.35*Math.cos(a),.55+.33*Math.sin(a)]}),[.85,.12]];
export const RUNES:{id:RuneId;name:string;shape:string;effect:string;color:string;cooldown:number;closed:boolean;points:Point[]}[]=[
{id:'ward',name:'Ward',shape:'Circle',effect:'Block the next attack',color:'#c6ef9e',cooldown:9000,closed:true,points:path(circle)},
{id:'fireball',name:'Fireball',shape:'Triangle',effect:'Deal 8 damage and ignite a lasting burn',color:'#ffad85',cooldown:4500,closed:true,points:path([[.5,.1],[.9,.9],[.1,.9],[.5,.1]])},
{id:'lightning',name:'Lightning',shape:'Zigzag',effect:'Deal 16 damage',color:'#dac0ff',cooldown:2200,closed:false,points:path([[.7,.1],[.3,.45],[.7,.55],[.3,.9]])},
{id:'frost',name:'Frost',shape:'V shape',effect:'Delay an attack by 3 seconds',color:'#95dff2',cooldown:8000,closed:false,points:path([[.1,.1],[.5,.9],[.9,.1]])},
{id:'mend',name:'Mend',shape:'Spiral',effect:'Restore 22 health',color:'#f2c4da',cooldown:14000,closed:false,points:path(spiral)},
{id:'dispel',name:'Dispel',shape:'Horizontal line',effect:'Cancel a charged attack',color:'#ecd290',cooldown:9000,closed:false,points:path([[.1,.5],[.9,.5]])},
{id:'water',name:'Water',shape:'U shape',effect:'Extinguish your burn',color:'#75d8ff',cooldown:4000,closed:false,points:path(water)}
];
export const runeById=(id:RuneId)=>RUNES.find(r=>r.id===id)!;
