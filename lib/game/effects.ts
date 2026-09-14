import type {RuneId} from './types.ts';
export type CastEffect={at:number;color:string;success:boolean;rune:RuneId|null};
export function paintCast(c:CanvasRenderingContext2D,w:number,h:number,e:CastEffect,now:number,reduced:boolean){
 const age=now-e.at;if(age<0||age>900)return;const t=reduced?.35:age/900,x=w*.5,y=h*.64,size=Math.min(w,h)*.16;
 c.save();c.translate(x,y);c.strokeStyle=e.color;c.fillStyle=e.color;c.lineWidth=3;c.globalAlpha=reduced?.75:1-t;c.lineCap='round';
 const circle=(r:number)=>{c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();};
 if(!e.success){c.setLineDash([5,7]);circle(size*.55);}
 else switch(e.rune){
  case 'ward':{c.beginPath();c.moveTo(0,-size);c.lineTo(size*.7,-size*.6);c.quadraticCurveTo(size*.75,size*.45,0,size);c.quadraticCurveTo(-size*.75,size*.45,-size*.7,-size*.6);c.closePath();c.stroke();circle(size*(1+t*.3));break;}
  case 'fireball':{c.translate(0,-t*h*.25);c.beginPath();c.arc(0,0,size*(.25+t*.25),0,Math.PI*2);c.fill();for(let i=0;i<9;i++){const a=i*2.4;c.beginPath();c.moveTo(Math.cos(a)*size*.3,Math.sin(a)*size*.3);c.lineTo(Math.cos(a)*size*(.7+t),Math.sin(a)*size*(.7+t));c.stroke();}break;}
  case 'lightning':{c.beginPath();c.moveTo(-size*.5,-size);c.lineTo(size*.2,-size*.25);c.lineTo(-size*.25,0);c.lineTo(size*.5,size);c.stroke();c.lineWidth=1;circle(size*(.7+t*.4));break;}
  case 'water':{for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,(i-1)*size*.45,size*(.6+t*.3),size*.18,0,0,Math.PI*2);c.stroke();}break;}
  case 'frost':{for(let i=0;i<6;i++){c.save();c.rotate(i*Math.PI/3);c.beginPath();c.moveTo(0,0);c.lineTo(0,-size);c.moveTo(-size*.25,-size*.55);c.lineTo(0,-size*.8);c.lineTo(size*.25,-size*.55);c.stroke();c.restore();}break;}
  case 'mend':{c.translate(0,-t*size*.6);c.beginPath();c.moveTo(-size*.45,0);c.lineTo(size*.45,0);c.moveTo(0,-size*.45);c.lineTo(0,size*.45);c.stroke();circle(size*(.7+t*.4));break;}
  case 'dispel':{c.setLineDash([size*.3,size*.16]);circle(size*(.4+t));c.beginPath();c.moveTo(-size,0);c.lineTo(size,0);c.stroke();break;}
  case 'star':{c.rotate(t*Math.PI);for(let i=0;i<5;i++){c.rotate(Math.PI*2/5);c.beginPath();c.moveTo(0,-size*.35);c.lineTo(0,-size*(.85+t*.25));c.stroke();}circle(size*(.45+t*.35));break;}
  default:circle(size*(.4+t));
 }
 c.restore();
}
