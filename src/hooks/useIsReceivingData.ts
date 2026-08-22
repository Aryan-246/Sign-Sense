import { useEffect, useState } from 'react';
import { RECEIVING_DATA_TIMEOUT_MS } from '../ble/constants';
import { useGloveStore } from '../state/useGloveStore';

/**
 * Derived "Receiving Data" vs "Waiting for Data": true when a gesture arrived
 * within RECEIVING_DATA_TIMEOUT_MS. Ticks every second so the UI flips back to
 * "waiting" on its own when the stream goes quiet.
 */
export function useIsReceivingData(): boolean {
  const lastMessageAt = useGloveStore((s) => s.lastMessageAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (lastMessageAt === null) return false;
  return now - lastMessageAt < RECEIVING_DATA_TIMEOUT_MS;
}
