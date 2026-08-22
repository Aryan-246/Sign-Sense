import { ConnectionStatus } from '../../models/ConnectionState';
import { GloveDevice } from '../../models/GloveDevice';

/**
 * Callbacks the transport uses to push events up to the app. The transport never
 * touches UI, speech, or history directly — it only reports through these.
 */
export interface CommunicationCallbacks {
  onStatusChange: (status: ConnectionStatus, detail?: string) => void;
  onDeviceDiscovered: (device: GloveDevice) => void;
  /** A raw, decoded payload string from the transport (NOT yet parsed). */
  onRawMessage: (raw: string) => void;
  onError: (message: string) => void;
}

/**
 * Transport-agnostic link to the glove.
 *
 * BLE is the only implementation for this milestone. A future
 * WifiCommunicationProvider can implement this same interface, and the
 * recognition-message format stays identical regardless of transport (spec §23),
 * so the display / speech / history layers never need to change.
 */
export interface GloveCommunicationProvider {
  readonly kind: 'ble' | 'wifi';

  /** Register event callbacks. Must be called once before any other method. */
  init(callbacks: CommunicationCallbacks): void;

  /** Ensure the transport is usable: permissions granted and radio ready. */
  ensureReady(): Promise<{ ok: boolean; message?: string }>;

  startScan(): Promise<void>;
  stopScan(): void;

  /** `reconnect: true` surfaces the Reconnecting status instead of Connecting. */
  connect(deviceId: string, options?: { reconnect?: boolean }): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  /** Release transport resources held by this provider. */
  destroy(): void;
}
