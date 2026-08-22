import { GestureMessage, GESTURE_MESSAGE_TYPE } from '../../models/GestureMessage';

export type ParseResult =
  | { ok: true; message: GestureMessage }
  | { ok: false; error: string };

/**
 * Safely parse a raw BLE payload (already decoded to a UTF-8 string) into a
 * GestureMessage. This function NEVER throws.
 *
 * Rules (spec §7, §8, §17):
 *   - malformed JSON, empty text, wrong/unknown type  -> { ok: false }
 *   - unknown extra fields are ignored (future-compatible)
 *   - the caller is responsible for logging and for not crashing on { ok: false }
 */
export function parseGestureMessage(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Empty payload' };
  }

  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: `Malformed JSON: ${truncate(trimmed)}` };
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, error: 'Payload is not a JSON object' };
  }

  const obj = data as Record<string, unknown>;

  if (obj.type !== GESTURE_MESSAGE_TYPE) {
    return { ok: false, error: `Unknown message type: ${String(obj.type)}` };
  }

  if (typeof obj.text !== 'string' || obj.text.trim().length === 0) {
    return { ok: false, error: 'Missing or empty "text" field' };
  }

  const message: GestureMessage = {
    type: GESTURE_MESSAGE_TYPE,
    text: obj.text.trim(),
  };

  // Optional, future-compatible fields — copied only when present and valid.
  if (typeof obj.confidence === 'number' && Number.isFinite(obj.confidence)) {
    message.confidence = clamp01(obj.confidence);
  }
  if (typeof obj.timestamp === 'number' && Number.isFinite(obj.timestamp)) {
    message.timestamp = obj.timestamp;
  }
  if (typeof obj.gestureId === 'string') {
    message.gestureId = obj.gestureId;
  }
  if (typeof obj.language === 'string') {
    message.language = obj.language;
  }

  return { ok: true, message };
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function truncate(s: string, max = 80): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}
