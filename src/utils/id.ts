let counter = 0;

/**
 * Generate a process-unique id. Combines the wall clock with a monotonic counter
 * so ids stay unique even when several are created within the same millisecond.
 */
export function nextId(prefix = 'id'): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return `${prefix}-${Date.now()}-${counter}`;
}
