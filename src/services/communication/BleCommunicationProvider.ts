import {
  BleManager,
  BleError,
  Device,
  State,
  Subscription,
} from 'react-native-ble-plx';
import { getBleManager } from '../../ble/bleManager';
import {
  GLOVE_NAME_HINTS,
  RECOGNITION_CHARACTERISTIC_UUID,
  SERVICE_UUID,
} from '../../ble/constants';
import { ConnectionStatus } from '../../models/ConnectionState';
import { requestBlePermissions } from '../../permissions/blePermissions';
import { base64ToString } from '../../utils/base64';
import { describeError } from '../../utils/errors';
import {
  CommunicationCallbacks,
  GloveCommunicationProvider,
} from './GloveCommunicationProvider';

/**
 * BLE implementation of GloveCommunicationProvider using react-native-ble-plx.
 * App = Central / GATT client; ESP32-S3 = Peripheral / GATT server exposing one
 * service (SERVICE_UUID) and one NOTIFY characteristic (RECOGNITION_CHARACTERISTIC_UUID).
 *
 * This module contains NO UI, speech, or history logic. It reports everything via
 * the CommunicationCallbacks provided to init().
 */
export class BleCommunicationProvider implements GloveCommunicationProvider {
  readonly kind = 'ble' as const;

  private manager: BleManager | null = null;
  private callbacks: CommunicationCallbacks | null = null;
  private connectedDevice: Device | null = null;
  private monitorSub: Subscription | null = null;
  private disconnectSub: Subscription | null = null;
  private scanning = false;

  init(callbacks: CommunicationCallbacks): void {
    this.callbacks = callbacks;
    this.manager = getBleManager();
  }

  async ensureReady(): Promise<{ ok: boolean; message?: string }> {
    const manager = this.requireManager();

    const perm = await requestBlePermissions();
    if (!perm.granted) {
      return { ok: false, message: perm.message ?? 'Permissions denied.' };
    }

    const state = await manager.state();
    switch (state) {
      case State.PoweredOn:
        return { ok: true };
      case State.PoweredOff:
        return { ok: false, message: 'Bluetooth is turned off. Please enable it.' };
      case State.Unauthorized:
        return { ok: false, message: 'Bluetooth permission is not authorized.' };
      case State.Unsupported:
        return { ok: false, message: 'This device does not support Bluetooth LE.' };
      default: {
        // Resetting / Unknown: give the adapter a short moment to settle.
        const ok = await this.waitForPoweredOn(manager, 4000);
        return ok
          ? { ok: true }
          : { ok: false, message: `Bluetooth is not ready (state: ${state}).` };
      }
    }
  }

  async startScan(): Promise<void> {
    const manager = this.requireManager();
    if (this.scanning) return;
    this.scanning = true;
    this.cb().onStatusChange(ConnectionStatus.Scanning);

    // Scan with no hardware UUID filter, then match in JS by advertised service
    // UUID OR name hint. This is more tolerant during hardware bring-up while
    // still hiding unrelated devices.
    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        this.scanning = false;
        const msg = describeError(error);
        this.cb().onError(msg);
        this.cb().onStatusChange(ConnectionStatus.Error, msg);
        return;
      }
      if (device && this.looksLikeGlove(device)) {
        this.cb().onDeviceDiscovered({
          id: device.id,
          name: device.name ?? device.localName ?? null,
          rssi: device.rssi ?? null,
        });
      }
    });
  }

  private looksLikeGlove(device: Device): boolean {
    const advertisedUuids = device.serviceUUIDs ?? [];
    const matchesUuid = advertisedUuids.some(
      (u) => u.toLowerCase() === SERVICE_UUID.toLowerCase(),
    );
    const name = (device.name ?? device.localName ?? '').toLowerCase();
    const matchesName =
      name.length > 0 &&
      GLOVE_NAME_HINTS.some((hint) => name.includes(hint.toLowerCase()));
    return matchesUuid || matchesName;
  }

  stopScan(): void {
    if (this.manager && this.scanning) {
      this.manager.stopDeviceScan();
    }
    this.scanning = false;
  }

  async connect(deviceId: string, options?: { reconnect?: boolean }): Promise<void> {
    const manager = this.requireManager();
    this.stopScan();
    this.cb().onStatusChange(
      options?.reconnect ? ConnectionStatus.Reconnecting : ConnectionStatus.Connecting,
    );

    try {
      // Request a larger MTU so full JSON messages fit in one notification.
      // Default MTU (23) leaves only ~20 usable bytes and would truncate them.
      const device = await manager.connectToDevice(deviceId, {
        timeout: 12000,
        requestMTU: 185,
      });
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;

      this.disconnectSub = device.onDisconnected((error) => {
        this.handleUnexpectedDisconnect(error);
      });

      this.monitorSub = device.monitorCharacteristicForService(
        SERVICE_UUID,
        RECOGNITION_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            // Monitor is cancelled during a normal disconnect; only surface the
            // error if we still believe we are connected.
            if (this.connectedDevice !== null) {
              this.cb().onError(describeError(error));
            }
            return;
          }
          const value = characteristic?.value;
          if (value == null) return;
          try {
            this.cb().onRawMessage(base64ToString(value));
          } catch (e) {
            this.cb().onError(`Failed to decode payload: ${describeError(e)}`);
          }
        },
      );

      this.cb().onStatusChange(ConnectionStatus.Connected);
    } catch (e) {
      const msg = describeError(e);
      this.cleanupConnection();
      this.cb().onStatusChange(ConnectionStatus.Error, msg);
      this.cb().onError(msg);
      throw e;
    }
  }

  async disconnect(): Promise<void> {
    const device = this.connectedDevice;
    // Tear down subscriptions first so the disconnect handler does not fire a
    // spurious "Connection Lost" for a user-initiated disconnect.
    this.cleanupConnection();
    if (device) {
      try {
        await device.cancelConnection();
      } catch {
        // Already disconnected — ignore.
      }
    }
    this.cb().onStatusChange(ConnectionStatus.Disconnected);
  }

  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  destroy(): void {
    this.stopScan();
    this.cleanupConnection();
    // The shared BleManager is intentionally NOT destroyed here; it is a
    // process-wide singleton (see ble/bleManager.ts).
  }

  private handleUnexpectedDisconnect(error: BleError | null): void {
    this.cleanupConnection();
    this.cb().onStatusChange(
      ConnectionStatus.ConnectionLost,
      error ? describeError(error) : undefined,
    );
  }

  private cleanupConnection(): void {
    this.monitorSub?.remove();
    this.monitorSub = null;
    this.disconnectSub?.remove();
    this.disconnectSub = null;
    this.connectedDevice = null;
  }

  private waitForPoweredOn(manager: BleManager, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      let done = false;
      const finish = (value: boolean) => {
        if (done) return;
        done = true;
        sub.remove();
        clearTimeout(timer);
        resolve(value);
      };
      const sub = manager.onStateChange((s) => {
        if (s === State.PoweredOn) finish(true);
      }, true);
      const timer = setTimeout(() => finish(false), timeoutMs);
    });
  }

  private requireManager(): BleManager {
    if (this.manager === null) {
      this.manager = getBleManager();
    }
    return this.manager;
  }

  private cb(): CommunicationCallbacks {
    if (this.callbacks === null) {
      throw new Error('BleCommunicationProvider.init() must be called before use.');
    }
    return this.callbacks;
  }
}
