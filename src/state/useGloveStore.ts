import { create } from 'zustand';
import { ConnectionStatus } from '../models/ConnectionState';
import { GestureMessage } from '../models/GestureMessage';
import { GloveDevice } from '../models/GloveDevice';

/**
 * The central recognition/connection state — the "clean data layer" between the
 * transport and everything else. The communication provider writes here through
 * the controller; screens, the speak hook, and the history recorder all READ from
 * here. Nothing in the UI talks to BLE directly.
 */
export interface GloveState {
  status: ConnectionStatus;
  statusDetail: string | null;

  /** Devices discovered during the current/most-recent scan. */
  devices: GloveDevice[];

  /** Id of the last device we attempted to connect to (enables reconnect). */
  lastDeviceId: string | null;

  /** Most recent successfully-parsed gesture. */
  latestGesture: GestureMessage | null;
  /** Increments once per accepted gesture — even if the text repeats. Consumers
   *  (speak hook, history recorder) watch this to detect a genuinely new event. */
  gestureSeq: number;

  totalMessages: number;
  malformedCount: number;
  lastRawMessage: string | null;
  lastError: string | null;
  /** Epoch ms of the last accepted gesture (for "Receiving" vs "Waiting"). */
  lastMessageAt: number | null;

  setStatus: (status: ConnectionStatus, detail?: string) => void;
  addDevice: (device: GloveDevice) => void;
  clearDevices: () => void;
  setLastDeviceId: (deviceId: string) => void;
  recordGesture: (message: GestureMessage, raw: string) => void;
  recordMalformed: (raw: string, error: string) => void;
  setError: (message: string) => void;
  resetSession: () => void;
}

function byRssiDesc(a: GloveDevice, b: GloveDevice): number {
  const ra = a.rssi ?? -Infinity;
  const rb = b.rssi ?? -Infinity;
  return rb - ra;
}

export const useGloveStore = create<GloveState>((set) => ({
  status: ConnectionStatus.Disconnected,
  statusDetail: null,
  devices: [],
  lastDeviceId: null,
  latestGesture: null,
  gestureSeq: 0,
  totalMessages: 0,
  malformedCount: 0,
  lastRawMessage: null,
  lastError: null,
  lastMessageAt: null,

  setStatus: (status, detail) =>
    set({ status, statusDetail: detail ?? null }),

  addDevice: (device) =>
    set((state) => {
      const existingIndex = state.devices.findIndex((d) => d.id === device.id);
      let devices: GloveDevice[];
      if (existingIndex >= 0) {
        devices = state.devices.slice();
        devices[existingIndex] = { ...devices[existingIndex], ...device };
      } else {
        devices = [...state.devices, device];
      }
      devices.sort(byRssiDesc);
      return { devices };
    }),

  clearDevices: () => set({ devices: [] }),

  setLastDeviceId: (lastDeviceId) => set({ lastDeviceId }),

  recordGesture: (message, raw) =>
    set((state) => ({
      latestGesture: message,
      gestureSeq: state.gestureSeq + 1,
      totalMessages: state.totalMessages + 1,
      lastRawMessage: raw,
      lastMessageAt: Date.now(),
      lastError: null,
    })),

  recordMalformed: (raw, error) =>
    set((state) => ({
      malformedCount: state.malformedCount + 1,
      lastRawMessage: raw,
      lastError: error,
    })),

  setError: (message) => set({ lastError: message }),

  resetSession: () =>
    set({
      latestGesture: null,
      gestureSeq: 0,
      totalMessages: 0,
      malformedCount: 0,
      lastRawMessage: null,
      lastError: null,
      lastMessageAt: null,
    }),
}));
