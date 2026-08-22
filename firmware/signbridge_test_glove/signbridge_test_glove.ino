/*
 * SignBridge — ESP32-S3 BLE test firmware
 * -----------------------------------------------------------------------------
 * This is a TEST peripheral for bringing up the SignBridge mobile app. It does
 * NOT do gesture recognition — the real glove firmware will replace loop() with
 * on-device inference. For now it advertises the SignBridge GATT service and
 * notifies the app with the test recognition strings from the spec, as JSON.
 *
 * Data contract (must match the app's GestureMessage):
 *   {"type":"gesture","text":"HELLO","confidence":0.95,"timestamp":12345}
 * Only "type" and "text" are required.
 *
 * UUIDs MUST match src/ble/constants.ts in the app:
 *   SERVICE_UUID                    a1b2c3d4-0001-4a5b-8c6d-0e1f2a3b4c5d
 *   RECOGNITION_CHARACTERISTIC_UUID a1b2c3d4-0002-4a5b-8c6d-0e1f2a3b4c5d
 *
 * Board:   any ESP32-S3 dev board (Arduino / ESP32 board package).
 * Library: none beyond the ESP32 board package (uses the built-in BLEDevice).
 *
 * NOTE ON MTU: the app requests an MTU of 185 on connect, so full JSON messages
 * fit in a single notification. With the default MTU (23) only ~20 bytes fit and
 * longer messages would be truncated — that is why the app negotiates a larger MTU.
 *
 * NOTE ON ESP32 ARDUINO CORE VERSION:
 *   - Core 3.x (current): the NOTIFY property auto-creates the CCCD (0x2902).
 *     This sketch works as-is.
 *   - Core 2.x: also #include <BLE2902.h> and, after createCharacteristic(...),
 *     call: pCharacteristic->addDescriptor(new BLE2902());
 * -----------------------------------------------------------------------------
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

#define DEVICE_NAME "SignBridge Glove"
#define SERVICE_UUID "a1b2c3d4-0001-4a5b-8c6d-0e1f2a3b4c5d"
#define CHAR_UUID "a1b2c3d4-0002-4a5b-8c6d-0e1f2a3b4c5d"

// Test recognition strings (spec §5). Real firmware replaces these with the
// output of the on-device model.
static const char *MESSAGES[] = {"HELLO", "THANK YOU", "YES",
                                 "NO",    "HELP",      "GOOD MORNING"};
static const int NUM_MESSAGES = sizeof(MESSAGES) / sizeof(MESSAGES[0]);

static BLECharacteristic *pCharacteristic = nullptr;
static bool deviceConnected = false;
static int messageIndex = 0;

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    deviceConnected = true;
    Serial.println("Central connected");
  }
  void onDisconnect(BLEServer *pServer) override {
    deviceConnected = false;
    Serial.println("Central disconnected — re-advertising");
    pServer->startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);
  delay(200);
  Serial.println("SignBridge test glove starting...");

  BLEDevice::init(DEVICE_NAME);

  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
      CHAR_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  // Core 2.x only: pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID); // lets the app scan-filter by UUID
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("Advertising as \"" DEVICE_NAME "\"");
}

void loop() {
  if (deviceConnected) {
    const char *text = MESSAGES[messageIndex];
    messageIndex = (messageIndex + 1) % NUM_MESSAGES;

    char json[160];
    snprintf(json, sizeof(json),
             "{\"type\":\"gesture\",\"text\":\"%s\",\"confidence\":0.95,"
             "\"timestamp\":%lu}",
             text, (unsigned long)millis());

    pCharacteristic->setValue((uint8_t *)json, strlen(json));
    pCharacteristic->notify();
    Serial.print("Notified: ");
    Serial.println(json);

    delay(3000); // one test gesture every 3 seconds
  } else {
    delay(200);
  }
}
