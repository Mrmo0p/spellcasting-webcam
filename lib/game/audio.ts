export class SpellAudio{context:AudioContext|null=null;enabled=true;
 async unlock(){try{this.context??=new AudioContext();await this.context.resume();}catch{}}
 play(success:boolean,index=0){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=success?'sine':'triangle';o.frequency.setValueAtTime(success?330+index*70:150,c.currentTime);o.frequency.exponentialRampToValueAtTime(success?660+index*70:70,c.currentTime+.18);g.gain.setValueAtTime(.06,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.3);o.start();o.stop(c.currentTime+.32);}
}
