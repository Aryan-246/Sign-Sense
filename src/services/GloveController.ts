import { ConnectionStatus } from '../models/ConnectionState';
import { GestureMessage } from '../models/GestureMessage';
import { useGloveStore } from '../state/useGloveStore';
import { useHistoryStore } from '../state/useHistoryStore';
import { nextId } from '../utils/id';
import { BleCommunicationProvider } from './communication/BleCommunicationProvider';
import { GloveCommunicationProvider } from './communication/GloveCommunicationProvider';
import { parseGestureMessage } from './parser/parseGestureMessage';

/**
 * Coordinator between the transport and app state — the seam that keeps the
 * layers decoupled (spec §18/§19):
 *
 *   transport (BLE) --raw--> [parser] --> glove store (+ history)
 *
 * It reads raw payloads from the provider, parses them safely, and writes results
 * into the stores. It deliberately does NOT call the speech engine or touch any
 * UI — speech reacts to store state via useAutoSpeak, and screens read the stores.
 */
class GloveController {
  private readonly provider: GloveCommunicationProvider;
  private initialized = false;

  constructor(provider: GloveCommunicationProvider) {
    this.provider = provider;
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.provider.init({
      onStatusChange: (status, detail) =>
        useGloveStore.getState().setStatus(status, detail),
      onDeviceDiscovered: (device) =>
        useGloveStore.getState().addDevice(device),
      onRawMessage: (raw) => this.handleRaw(raw),
      onError: (message) => useGloveStore.getState().setError(message),
    });
  }

  private handleRaw(raw: string): void {
    const result = parseGestureMessage(raw);
    if (result.ok) {
      useGloveStore.getState().recordGesture(result.message, raw);
      this.appendHistory(result.message);
    } else {
      // Malformed input must never crash the app — it is logged into state only.
      useGloveStore.getState().recordMalformed(raw, result.error);
    }
  }

  private appendHistory(message: GestureMessage): void {
    useHistoryStore.getState().addEntry({
      id: nextId('gesture'),
      text: message.text,
      confidence: message.confidence,
      language: message.language,
      // App receipt time — reliable for ordering regardless of the device clock.
      receivedAt: Date.now(),
    });
  }

  ensureReady(): Promise<{ ok: boolean; message?: string }> {
    return this.provider.ensureReady();
  }

  async startScan(): Promise<void> {
    useGloveStore.getState().clearDevices();
    await this.provider.startScan();
  }

  stopScan(): void {
    this.provider.stopScan();
    const store = useGloveStore.getState();
    // Only a user-cancelled scan resets to Disconnected; an active connection
    // or in-flight connect must not be clobbered.
    if (store.status === ConnectionStatus.Scanning) {
      store.setStatus(ConnectionStatus.Disconnected);
    }
  }

  connect(deviceId: string): Promise<void> {
    useGloveStore.getState().setLastDeviceId(deviceId);
    return this.provider.connect(deviceId);
  }

  /** Reconnect to the most recently used device (e.g. after Connection Lost). */
  async reconnect(): Promise<void> {
    const deviceId = useGloveStore.getState().lastDeviceId;
    if (deviceId === null) return;
    await this.provider.connect(deviceId, { reconnect: true });
  }

  disconnect(): Promise<void> {
    return this.provider.disconnect();
  }

  isConnected(): boolean {
    return this.provider.isConnected();
  }

  get transportKind(): 'ble' | 'wifi' {
    return this.provider.kind;
  }
}

/** App-wide singleton. Swap the provider here to change transport (e.g. Wi-Fi). */
export const gloveController = new GloveController(new BleCommunicationProvider());
