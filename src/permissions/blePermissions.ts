import { PermissionsAndroid, Platform } from 'react-native';
import { describeError } from '../utils/errors';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

/**
 * Request the runtime permissions required for BLE.
 *
 * Android 12+ (API 31+): BLUETOOTH_SCAN + BLUETOOTH_CONNECT. Because the manifest
 *   declares BLUETOOTH_SCAN with usesPermissionFlags="neverForLocation"
 *   (via the react-native-ble-plx config plugin), NO location permission is needed.
 * Android 6..11 (API 23..30): BLE scanning requires ACCESS_FINE_LOCATION.
 * iOS: nothing to request at runtime here (declared in Info.plist).
 */
export async function requestBlePermissions(): Promise<PermissionResult> {
  if (Platform.OS !== 'android') {
    return { granted: true };
  }

  const apiLevel =
    typeof Platform.Version === 'number'
      ? Platform.Version
      : parseInt(String(Platform.Version), 10);

  try {
    if (apiLevel >= 31) {
      const res = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const scan = res[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN];
      const connect = res[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT];
      const granted =
        scan === PermissionsAndroid.RESULTS.GRANTED &&
        connect === PermissionsAndroid.RESULTS.GRANTED;
      return granted
        ? { granted: true }
        : { granted: false, message: 'Bluetooth permissions were denied.' };
    }

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission',
        message:
          'Bluetooth scanning on this Android version requires location permission.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    return result === PermissionsAndroid.RESULTS.GRANTED
      ? { granted: true }
      : {
          granted: false,
          message: 'Location permission (required for BLE scan) was denied.',
        };
  } catch (e) {
    return { granted: false, message: describeError(e) };
  }
}
