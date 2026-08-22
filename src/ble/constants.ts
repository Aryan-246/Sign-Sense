/**
 * BLE contract shared between the SignBridge app (Central / GATT client) and the
 * ESP32-S3 glove (Peripheral / GATT server).
 *
 * The ESP32-S3 MUST:
 *   - advertise SERVICE_UUID, and
 *   - expose RECOGNITION_CHARACTERISTIC_UUID with the NOTIFY property.
 *
 * The identical UUIDs are used by the companion ESP32-S3 test sketch. Change them
 * in both places together, never in only one.
 */
export const SERVICE_UUID = 'a1b2c3d4-0001-4a5b-8c6d-0e1f2a3b4c5d';

/** Outgoing recognition-result characteristic (glove -> app, via notifications). */
export const RECOGNITION_CHARACTERISTIC_UUID = 'a1b2c3d4-0002-4a5b-8c6d-0e1f2a3b4c5d';

/**
 * Optional advertised-name hints. Scanning filters primarily by SERVICE_UUID (robust),
 * but these help a user visually recognize the glove in the device list.
 */
export const GLOVE_NAME_HINTS = ['SignBridge', 'ESP32-S3 Glove', 'ESP32'] as const;

/**
 * If no BLE notification has arrived within this window, the UI reports
 * "Connected · Waiting for Data" instead of "Receiving Data".
 */
export const RECEIVING_DATA_TIMEOUT_MS = 8000;
