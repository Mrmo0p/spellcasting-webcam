import type { Point } from '../game/types.ts';
import type { PvpTrailPoint } from './types.ts';

export const TRAIL = {
  batchMs: 50,
  maxBatch: 32,
  maxPoints: 1500,
  heartbeatMs: 200,
  dimMs: 300,
  timeoutMs: 750,
};
export function encodeTrailPoints(
  points: Point[],
  aspect: number,
  start = 0,
): PvpTrailPoint[] {
  const safeAspect = Math.max(0.5, Math.min(3, aspect || 4 / 3));
  let previous = start > 0 ? points[start - 1]?.t : points[0]?.t;
  return points.slice(start).map((point) => {
    const encoded: PvpTrailPoint = [
      Math.round(Math.max(0, Math.min(1, point.x / safeAspect)) * 10000),
      Math.round(Math.max(0, Math.min(1, point.y)) * 10000),
      Math.round(
        Math.max(
          0,
          Math.min(65535, previous === undefined ? 0 : point.t - previous),
        ),
      ),
    ];
    previous = point.t;
    return encoded;
  });
}
export function appendTrailPoints(
  current: { x: number; y: number; t: number }[],
  encoded: PvpTrailPoint[],
  aspect: number,
) {
  let time = current.at(-1)?.t || 0;
  for (const [x, y, dt] of encoded) {
    time += dt;
    current.push({
      x: (x / 10000) * Math.max(0.5, Math.min(3, aspect)),
      y: y / 10000,
      t: time,
    });
  }
  return current;
}
export function trailViewport(
  sourceAspect: number,
  width: number,
  height: number,
) {
  const scale = Math.min(width / sourceAspect, height),
    drawWidth = sourceAspect * scale,
    drawHeight = scale;
  return {
    scale,
    offsetX: (width - drawWidth) / 2,
    offsetY: (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
}
export type BezierSegment = {
  from: { x: number; y: number };
  c1: { x: number; y: number };
  c2: { x: number; y: number };
  to: { x: number; y: number };
};
export function trailBezierSegments(
  points: { x: number; y: number }[],
): BezierSegment[] {
  if (points.length < 2) return [];
  const segments: BezierSegment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)],
      p1 = points[i],
      p2 = points[i + 1],
      p3 = points[Math.min(points.length - 1, i + 2)];
    const d01 = Math.max(1e-4, Math.sqrt(Math.hypot(p1.x - p0.x, p1.y - p0.y))),
      d12 = Math.max(1e-4, Math.sqrt(Math.hypot(p2.x - p1.x, p2.y - p1.y))),
      d23 = Math.max(1e-4, Math.sqrt(Math.hypot(p3.x - p2.x, p3.y - p2.y)));
    const c1 = {
        x: p1.x + ((p2.x - p0.x) * d12) / (3 * (d01 + d12)),
        y: p1.y + ((p2.y - p0.y) * d12) / (3 * (d01 + d12)),
      },
      c2 = {
        x: p2.x - ((p3.x - p1.x) * d12) / (3 * (d12 + d23)),
        y: p2.y - ((p3.y - p1.y) * d12) / (3 * (d12 + d23)),
      };
    segments.push({ from: p1, c1, c2, to: p2 });
  }
  return segments;
}
