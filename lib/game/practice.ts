import {RUNE_IDS,type Accuracy,type RuneId} from './types.ts';

export const DRAWING_TIPS:Record<RuneId,string>={
 water:'Draw down, round the bottom, then go up to make a wide U. Keep the top open and the bottom curved.',
 ward:'Make one round loop and return to where you started. Leave the center empty.',
 fireball:'Draw three straight sides with three clear corners, then close the triangle.',
 lightning:'Draw a tall zigzag with two sharp bends. Keep its top and bottom well apart.',
 frost:'Draw down to one sharp point, then back up. Leave the top open.',
 mend:'Start near the center and spiral outward for almost two turns. Keep space between the coils.',
 dispel:'Draw one straight line from side to side. Keep it roughly level.',
};

// Recommendations use known practice targets only. Free-play guesses are never evidence of intent.
export function recommendPractice(accuracy:Accuracy):RuneId{
 const attempted=RUNE_IDS.filter(id=>accuracy[id].attempts>0);
 const struggling=attempted.filter(id=>accuracy[id].correct<accuracy[id].attempts);
 if(struggling.length)return struggling.sort((a,b)=>{
  const x=accuracy[a],y=accuracy[b];
  return x.correct/x.attempts-y.correct/y.attempts||x.attempts-y.attempts||RUNE_IDS.indexOf(a)-RUNE_IDS.indexOf(b);
 })[0];
 return RUNE_IDS.find(id=>!accuracy[id].attempts)||[...RUNE_IDS].sort((a,b)=>accuracy[a].attempts-accuracy[b].attempts)[0];
}
