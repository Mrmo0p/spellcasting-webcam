'use client';
import { useEffect, useRef } from 'react';
import { otherSlot } from '@/lib/pvp/engine';
import { TRAIL, trailBezierSegments, trailViewport } from '@/lib/pvp/trail';
import type {
  PvpMatchState,
  PvpPresentationEvent,
  PvpRemoteTrail,
  PvpSlot,
} from '@/lib/pvp/types';

export function PvpArena({
  state,
  slot,
  clockOffset,
  trail,
  events,
}: {
  state: PvpMatchState;
  slot: PvpSlot;
  clockOffset: number;
  trail: PvpRemoteTrail | null;
  events: PvpPresentationEvent[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null),
    quality = useRef<'high' | 'low'>('high');
  useEffect(() => {
    const connection = (
        navigator as Navigator & { connection?: { saveData?: boolean } }
      ).connection,
      memory = (navigator as Navigator & { deviceMemory?: number })
        .deviceMemory;
    if (
      connection?.saveData ||
      (memory !== undefined && memory <= 4) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      quality.current = 'low';
  }, []);
  useEffect(() => {
    let raf = 0,
      last = performance.now();
    const samples: number[] = [];
    const paint = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect(),
        dpr = Math.min(
          devicePixelRatio || 1,
          quality.current === 'low' ? 1 : 2,
        ),
        w = rect.width,
        h = rect.height;
      if (
        canvas.width !== Math.round(w * dpr) ||
        canvas.height !== Math.round(h * dpr)
      ) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const c = canvas.getContext('2d');
      if (!c) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, w, h);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
        serverNow = Date.now() + clockOffset;
      if (trail?.points.length) {
        const age = Date.now() - trail.lastAt,
          fade =
            trail.endedAt === null
              ? age > TRAIL.dimMs
                ? 0.58
                : 1
              : Math.max(0, 1 - (Date.now() - trail.endedAt) / 700);
        if (age < TRAIL.timeoutMs || trail.endedAt !== null) {
          const area = {
              x: w * 0.05,
              y: h * 0.12,
              width: w * 0.48,
              height: h * 0.38,
            },
            view = trailViewport(trail.sourceAspect, area.width, area.height),
            wand = { x: w * 0.27, y: h * 0.52 },
            collapse =
              trail.status === 'accepted' && trail.endedAt && !reduced
                ? Math.min(1, (Date.now() - trail.endedAt) / 430)
                : 0;
          const mapped = trail.points.map((point) => {
            const x = area.x + view.offsetX + point.x * view.scale,
              y = area.y + view.offsetY + point.y * view.scale;
            return {
              x: x + (wand.x - x) * collapse,
              y: y + (wand.y - y) * collapse,
            };
          });
          c.save();
          c.globalAlpha = fade;
          c.strokeStyle =
            trail.status === 'rejected' || trail.status === 'cancelled'
              ? '#9c8d82'
              : trail.status === 'accepted'
                ? '#fff1a2'
                : '#d3ffb3';
          c.lineWidth = quality.current === 'low' ? 2.5 : 3.5;
          c.lineCap = 'round';
          c.lineJoin = 'round';
          if (quality.current === 'high') {
            c.shadowColor = c.strokeStyle;
            c.shadowBlur = trail.status === 'accepted' ? 22 : 13;
          }
          c.beginPath();
          c.moveTo(mapped[0].x, mapped[0].y);
          for (const segment of trailBezierSegments(mapped))
            c.bezierCurveTo(
              segment.c1.x,
              segment.c1.y,
              segment.c2.x,
              segment.c2.y,
              segment.to.x,
              segment.to.y,
            );
          if (mapped.length === 1)
            c.lineTo(mapped[0].x + 0.01, mapped[0].y + 0.01);
          c.stroke();
          c.restore();
        }
      }
      const opponent = otherSlot(slot);
      for (const spell of state.incoming) {
        const fromEnemy = spell.from === opponent,
          remaining = spell.landsAt - serverNow,
          progress = Math.max(0, Math.min(1, 1 - remaining / 4000)),
          start = fromEnemy
            ? { x: w * 0.27, y: h * 0.52 }
            : { x: w * 0.76, y: h * 0.84 },
          end = fromEnemy
            ? { x: w * 0.76, y: h * 0.84 }
            : { x: w * 0.27, y: h * 0.52 },
          x = start.x + (end.x - start.x) * progress,
          y = start.y + (end.y - start.y) * progress;
        if (reduced && remaining > 180) continue;
        c.save();
        c.fillStyle = spell.rune === 'fireball' ? '#ff9c5c' : '#dfc8ff';
        c.shadowColor = c.fillStyle;
        c.shadowBlur = quality.current === 'high' ? 24 : 8;
        c.beginPath();
        c.arc(x, y, spell.rune === 'fireball' ? 8 : 5, 0, Math.PI * 2);
        c.fill();
        if (spell.frosted) {
          c.strokeStyle = '#95dff2';
          c.lineWidth = 2;
          c.beginPath();
          c.arc(x, y, 14 + Math.sin(now / 150) * 3, 0, Math.PI * 2);
          c.stroke();
        }
        c.restore();
      }
      for (const event of events.slice(-6)) {
        const age = serverNow - event.at;
        if (age < 0 || age > 950) continue;
        const alpha = 1 - age / 950;
        if (event.kind === 'cast_accepted' && event.rune) {
          const enemyCast = event.source === opponent,
            origin = enemyCast
              ? { x: w * 0.27, y: h * 0.52 }
              : { x: w * 0.76, y: h * 0.84 },
            pulse = reduced ? 1 : Math.min(1, age / 480);
          c.save();
          c.globalAlpha = alpha;
          c.lineWidth = quality.current === 'low' ? 2 : 3;
          if (event.rune === 'ward') {
            c.strokeStyle = '#c6ef9e';
            c.beginPath();
            c.arc(origin.x, origin.y, 24 + pulse * 38, 0, Math.PI * 2);
            c.stroke();
          } else if (event.rune === 'frost') {
            c.strokeStyle = '#95dff2';
            for (let ring = 0; ring < 3; ring++) {
              c.beginPath();
              c.arc(
                origin.x,
                origin.y,
                18 + pulse * 55 + ring * 10,
                Math.PI * 1.08,
                Math.PI * 1.92,
              );
              c.stroke();
            }
          } else if (event.rune === 'dispel') {
            c.strokeStyle = '#ecd290';
            for (let shard = -2; shard <= 2; shard++) {
              c.beginPath();
              c.moveTo(origin.x + shard * 8, origin.y - pulse * 20);
              c.lineTo(origin.x + shard * 18, origin.y - 18 - pulse * 45);
              c.stroke();
            }
          } else if (event.rune === 'mend') {
            c.fillStyle = '#f2c4da';
            for (
              let mote = 0;
              mote < (quality.current === 'low' ? 4 : 8);
              mote++
            ) {
              const angle = mote * 2.4;
              c.beginPath();
              c.arc(
                origin.x + Math.sin(angle) * 28,
                origin.y - pulse * 65 + (mote % 3) * 12,
                3,
                0,
                Math.PI * 2,
              );
              c.fill();
            }
          } else if (event.rune === 'water') {
            c.strokeStyle = '#75d8ff';
            c.beginPath();
            for (let step = 0; step < 28; step++) {
              const angle = step * 0.42 + pulse * 4,
                radius = step * 1.5;
              const x = origin.x + Math.cos(angle) * radius,
                y = origin.y + Math.sin(angle) * radius;
              if (step) c.lineTo(x, y);
              else c.moveTo(x, y);
            }
            c.stroke();
          } else if (event.rune === 'star') {
            c.strokeStyle = '#ffe47a';
            for (let ray = 0; ray < 8; ray++) {
              const angle = (ray * Math.PI) / 4;
              c.beginPath();
              c.moveTo(
                origin.x + Math.cos(angle) * 12,
                origin.y + Math.sin(angle) * 12,
              );
              c.lineTo(
                origin.x + Math.cos(angle) * (22 + pulse * 45),
                origin.y + Math.sin(angle) * (22 + pulse * 45),
              );
              c.stroke();
            }
          }
          c.restore();
        }
        if (event.kind === 'health_changed' && event.target) {
          const enemy = event.target === opponent;
          c.save();
          c.globalAlpha = alpha;
          c.fillStyle =
            (event.healthAfter || 0) < (event.healthBefore || 0)
              ? '#ffb08a'
              : '#bff2a2';
          c.font = '700 16px monospace';
          c.textAlign = 'center';
          const amount = Math.abs(
            (event.healthAfter || 0) - (event.healthBefore || 0),
          );
          c.fillText(
            `${(event.healthAfter || 0) < (event.healthBefore || 0) ? '−' : '+'}${amount}`,
            enemy ? w * 0.28 : w * 0.74,
            (enemy ? h * 0.48 : h * 0.76) - age * 0.035,
          );
          c.restore();
        }
      }
      const delta = now - last;
      last = now;
      samples.push(delta);
      if (samples.length > 90) samples.shift();
      if (
        samples.length === 90 &&
        samples.reduce((a, b) => a + b, 0) / samples.length > 22
      )
        quality.current = 'low';
      raf = requestAnimationFrame(paint);
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [clockOffset, events, slot, state, trail]);
  const enemy = state.players[otherSlot(slot)],
    stunned = Boolean(enemy?.stunnedUntil);
  return (
    <div className="pvp-cinematic" aria-hidden="true">
      <canvas ref={canvasRef} />
      <svg
        className={`pvp-enemy ${enemy?.burning ? 'burning' : ''} ${stunned ? 'stunned' : ''}`}
        viewBox="0 0 180 210"
      >
        <ellipse className="pvp-shadow" cx="90" cy="194" rx="60" ry="12" />
        <path
          className="pvp-robe"
          d="M52 184 Q58 100 90 82 Q122 100 132 184 Z"
        />
        <path
          className="pvp-hood"
          d="M58 87 Q58 26 90 18 Q126 28 122 89 Q90 106 58 87Z"
        />
        <path className="pvp-face" d="M70 75 Q90 88 110 75" />
        <path className="pvp-staff" d="M42 176 L65 94" />
        <circle className="pvp-orb" cx="68" cy="82" r="10" />
        {stunned && (
          <g className="pvp-stars">
            <text x="46" y="28">
              ★
            </text>
            <text x="115" y="52">
              ★
            </text>
            <text x="82" y="7">
              ★
            </text>
          </g>
        )}
      </svg>
      <svg className="pvp-local-wand" viewBox="0 0 210 210">
        <path
          className="pvp-hand"
          d="M204 202 Q164 176 142 144 L114 116 Q104 104 111 95 Q117 87 129 96 L149 112 L122 73 Q115 61 124 54 Q133 50 141 63 L164 99 L146 50 Q141 35 152 30 Q164 29 170 45 L190 100 L206 116Z"
        />
        <path className="pvp-wand" d="M119 105 L42 30" />
        <circle className="pvp-wand-tip" cx="39" cy="27" r="8" />
      </svg>
    </div>
  );
}
