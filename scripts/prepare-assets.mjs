import {mkdir,copyFile,access,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('public/mediapipe/wasm',{recursive:true});await mkdir('public/models',{recursive:true});
await copyFile('node_modules/@mediapipe/tasks-vision/vision_bundle.js','public/mediapipe/vision_bundle.js');
for(const name of ['vision_wasm_internal.js','vision_wasm_internal.wasm','vision_wasm_nosimd_internal.js','vision_wasm_nosimd_internal.wasm','vision_wasm_module_internal.js','vision_wasm_module_internal.wasm'])await copyFile('node_modules/@mediapipe/tasks-vision/wasm/'+name,'public/mediapipe/wasm/'+name);
try{await access('public/models/hand_landmarker.task');}catch{
 const response=await fetch('https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task');if(!response.ok)throw new Error('Model download failed: '+response.status);
 const data=Buffer.from(await response.arrayBuffer());if(data.length<1000000)throw new Error('Incomplete model download');await writeFile('public/models/hand_landmarker.task',data);console.log('Model SHA-256:',createHash('sha256').update(data).digest('hex'));
}console.log('Local MediaPipe assets ready.');

const model=await readFile('public/models/hand_landmarker.task');if(createHash('sha256').update(model).digest('hex')!=='fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1')throw new Error('Hand model checksum mismatch. Remove the local model and retry.');
