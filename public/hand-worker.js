/* Classic worker: MediaPipe's WASM loader uses importScripts. No camera frames leave this worker. */
importScripts('/mediapipe/vision_bundle.js');
const {FilesetResolver,HandLandmarker}=Vision;
let hand;
self.onmessage=async({data})=>{
 if(data.type==='init'){
  try{const files=await FilesetResolver.forVisionTasks('/mediapipe/wasm');hand=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:'/models/hand_landmarker.task',delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.6,minHandPresenceConfidence:.6,minTrackingConfidence:.6});self.postMessage({type:'ready'});}
  catch(error){self.postMessage({type:'error',message:String(error)});}return;
 }
 if(data.type==='frame'){
  try{const start=performance.now(),result=hand.detectForVideo(data.bitmap,data.t);self.postMessage({type:'result',t:data.t,frameStartedAt:data.frameStartedAt,inferenceMs:performance.now()-start,landmarks:result.landmarks[0]||[],handedness:result.handedness[0]?.[0]?.categoryName||''});}
  catch(error){self.postMessage({type:'error',message:String(error)});}finally{data.bitmap.close();}
 }
};
