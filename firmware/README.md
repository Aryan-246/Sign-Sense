# SignBridge — ESP32-S3 test firmware

A **test** BLE peripheral for bringing up the SignBridge mobile app. It does not
run gesture recognition; it advertises the SignBridge GATT service and notifies
the app with the spec's test strings (`HELLO`, `THANK YOU`, `YES`, `NO`, `HELP`,
`GOOD MORNING`) as JSON, one every 3 seconds. The real glove firmware will keep
the same service/characteristic/JSON contract and replace the test loop with
on-device inference.

## What it exposes

| | UUID |
|---|---|
| Service | `a1b2c3d4-0001-4a5b-8c6d-0e1f2a3b4c5d` |
| Recognition characteristic (Notify) | `a1b2c3d4-0002-4a5b-8c6d-0e1f2a3b4c5d` |

Advertised name: **SignBridge Glove**. Payload example:

```json
{"type":"gesture","text":"HELLO","confidence":0.95,"timestamp":12345}
```

These UUIDs **must** stay in sync with [`src/ble/constants.ts`](../../src/ble/constants.ts).

## Flashing (Arduino IDE)

1. Install the **ESP32 board package** (Boards Manager → "esp32" by Espressif).
2. Open `signbridge_test_glove/signbridge_test_glove.ino`.
3. Select your ESP32-S3 board and port.
4. Upload. Open Serial Monitor at **115200** baud to watch notifications.

No extra libraries are required — it uses the built-in `BLEDevice`.

> **ESP32 Arduino core 2.x:** also `#include <BLE2902.h>` and, right after
> `createCharacteristic(...)`, add `pCharacteristic->addDescriptor(new BLE2902());`.
> On core 3.x the CCCD is created automatically.

## Notes

- The app negotiates an MTU of 185 on connect, so full JSON messages fit in one
  notification (the default MTU of 23 would truncate them).
- The device re-advertises automatically after a disconnect.
