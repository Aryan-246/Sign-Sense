/** A single recognized gesture as stored in local history. */
export interface HistoryEntry {
  id: string;
  text: string;
  confidence?: number;
  language?: string;
  /** Epoch milliseconds when the app received this gesture. */
  receivedAt: number;
}
