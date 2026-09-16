import { RUNE_IDS } from '../game/types.ts';
import type {
  ClientMessage,
  PvpTrailEndReason,
  TrailClientMessage,
} from './types.ts';

export const MAX_MESSAGE_BYTES = 2048;
export function validGuestName(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const name = input.trim();
  return name.length >= 1 && name.length <= 24 ? name : null;
}
export function validRoomCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code) ? code : null;
}
const strokeId = (value: unknown) =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(value);
const exactKeys = (input: Record<string, unknown>, keys: string[]) =>
  Object.keys(input).every((key) => keys.includes(key));
export function parseClientMessage(
  raw: string | ArrayBuffer,
): ClientMessage | TrailClientMessage | null {
  if (
    typeof raw !== 'string' ||
    new TextEncoder().encode(raw).byteLength > MAX_MESSAGE_BYTES
  )
    return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>,
    sequence = input.sequence;
  if (!Number.isSafeInteger(sequence) || Number(sequence) < 1) return null;
  if (
    input.type === 'ready' ||
    input.type === 'rematch' ||
    input.type === 'leave'
  )
    return Object.keys(input).every(
      (key) => key === 'type' || key === 'sequence',
    )
      ? (input as ClientMessage)
      : null;
  if (
    input.type === 'ping' &&
    typeof input.clientAt === 'number' &&
    Number.isFinite(input.clientAt) &&
    Object.keys(input).every((key) =>
      ['type', 'sequence', 'clientAt'].includes(key),
    )
  )
    return input as ClientMessage;
  if (
    input.type === 'cast' &&
    typeof input.requestId === 'string' &&
    /^[A-Za-z0-9_-]{8,64}$/.test(input.requestId) &&
    typeof input.rune === 'string' &&
    RUNE_IDS.includes(input.rune as never) &&
    typeof input.clientAt === 'number' &&
    Number.isFinite(input.clientAt) &&
    (input.strokeId === undefined || strokeId(input.strokeId)) &&
    exactKeys(input, [
      'type',
      'sequence',
      'requestId',
      'rune',
      'clientAt',
      'strokeId',
    ])
  )
    return input as ClientMessage;
  if (
    input.type === 'trail_start' &&
    strokeId(input.strokeId) &&
    Number.isInteger(input.sourceAspectQ) &&
    Number(input.sourceAspectQ) >= 500 &&
    Number(input.sourceAspectQ) <= 3000 &&
    typeof input.resume === 'boolean' &&
    exactKeys(input, [
      'type',
      'sequence',
      'strokeId',
      'sourceAspectQ',
      'resume',
    ])
  )
    return input as TrailClientMessage;
  if (
    input.type === 'trail_points' &&
    strokeId(input.strokeId) &&
    Number.isSafeInteger(input.batch) &&
    Number(input.batch) >= 0 &&
    Array.isArray(input.points) &&
    input.points.length >= 1 &&
    input.points.length <= 32 &&
    input.points.every(
      (point) =>
        Array.isArray(point) &&
        point.length === 3 &&
        point.every(Number.isInteger) &&
        point[0] >= 0 &&
        point[0] <= 10000 &&
        point[1] >= 0 &&
        point[1] <= 10000 &&
        point[2] >= 0 &&
        point[2] <= 65535,
    ) &&
    exactKeys(input, ['type', 'sequence', 'strokeId', 'batch', 'points'])
  )
    return input as TrailClientMessage;
  if (
    input.type === 'trail_heartbeat' &&
    strokeId(input.strokeId) &&
    exactKeys(input, ['type', 'sequence', 'strokeId'])
  )
    return input as TrailClientMessage;
  if (
    input.type === 'trail_end' &&
    strokeId(input.strokeId) &&
    [
      'completed',
      'unrecognized',
      'tracking-lost',
      'interrupted',
      'timeout',
    ].includes(String(input.reason) as PvpTrailEndReason) &&
    exactKeys(input, ['type', 'sequence', 'strokeId', 'reason'])
  )
    return input as TrailClientMessage;
  return null;
}
