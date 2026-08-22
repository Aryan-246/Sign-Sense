import { BleManager } from 'react-native-ble-plx';

/**
 * Single shared ble-plx BleManager for the whole app.
 *
 * Created lazily (not at module import time) so that importing BLE modules does
 * not construct the native manager before the app is ready — construction touches
 * the native module and should happen when the app actually starts using BLE.
 */
let manager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (manager === null) {
    manager = new BleManager();
  }
  return manager;
}

export function destroyBleManager(): void {
  if (manager !== null) {
    manager.destroy();
    manager = null;
  }
}
