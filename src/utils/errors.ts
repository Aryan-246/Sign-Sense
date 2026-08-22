/** Normalize any thrown value (Error, BleError, string, unknown) into a message. */
export function describeError(e: unknown): string {
  if (e == null) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e instanceof Error && e.message) return e.message;
  const anyE = e as { message?: unknown; reason?: unknown };
  if (typeof anyE.message === 'string' && anyE.message.length > 0) return anyE.message;
  if (typeof anyE.reason === 'string' && anyE.reason.length > 0) return anyE.reason;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}
