import type {Landmark} from './types.ts';

// These are framing hints, not recognition confidence or lighting measurements.
export function framingHint(points:Landmark[]):string{
 if(points.length!==21||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return 'Show one whole hand in even light.';
 if(points.some(p=>p.x<.04||p.x>.96||p.y<.04||p.y>.96))return 'Move your hand toward the center. Keep every fingertip in view.';
 const palm=Math.hypot(points[0].x-points[9].x,points[0].y-points[9].y);
 if(palm<.065)return 'Try moving your hand a little closer to the camera.';
 if(palm>.32)return 'Move your hand a little farther away to leave room to draw.';
 return 'Hand in frame. Leave room around your fingertips to draw.';
}
