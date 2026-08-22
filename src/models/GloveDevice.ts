/**
 * A BLE peripheral discovered during scanning. `id` is the platform peripheral
 * identifier (a MAC-derived address on Android) and is what we reconnect with.
 */
export interface GloveDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}
