# SignBridge

> Giving voice to every gesture.

The **mobile app** half of the Sign-Sense system. A sign-language glove
(ESP32-S3 + flex sensors + IMU) performs gesture recognition **on the device**
and streams recognized **text** over BLE. This app is the companion **BLE
Central**: it discovers the glove, connects, receives recognition results,
displays them, keeps a local history, and speaks them aloud.

The app does **no** gesture recognition and contains **no** simulated Bluetooth —
it talks to the real glove (or the [test firmware](firmware/) below).

## Stack

- React Native `0.86` + Expo SDK `57`, **strict** TypeScript
- `react-native-ble-plx` for BLE (Central / GATT client)
- `expo-speech` for text-to-speech
- `zustand` for state, AsyncStorage for local persistence
- React Navigation (native-stack)

> Requires a **custom dev client / native build** — this uses native BLE and does
> **not** run in Expo Go.

## Architecture (layered & decoupled)

```
BLE transport ──raw──▶ parser ──▶ glove store ──┬──▶ UI (screens)
(ble-plx)              (safe,      (state, the   ├──▶ speech  (useAutoSpeak)
                        never       "data layer") └──▶ history (persisted)
                        throws)
```

- The transport sits behind a `GloveCommunicationProvider` interface, so a future
  Wi-Fi transport can be dropped in without touching any other layer.
- UI never calls BLE directly; BLE never calls speech or UI. Everything flows
  through the store.

```
src/
  ble/            BLE contract (UUIDs) + shared manager singleton
  models/         GestureMessage, ConnectionState, GloveDevice, settings, history
  permissions/    Android runtime BLE permissions
  services/
    communication/  GloveCommunicationProvider + BLE implementation
    parser/         safe GestureMessage parser
    speech/         TextToSpeechService
    GloveController.ts   transport ⇄ store coordinator
  state/          zustand stores (glove, settings, history)
  hooks/          useAutoSpeak, useIsReceivingData
  components/     reusable UI
  screens/        Home, ConnectGlove, Recognition, History, Settings, BleDebug
  navigation/     root stack
```

## Data contract

The glove notifies JSON on the recognition characteristic:

```json
{ "type": "gesture", "text": "HELLO", "confidence": 0.95, "timestamp": 12345 }
```

Only `type` and `text` are required. Malformed packets are logged and ignored —
they never crash the app.

## Build & run

> **New machine or new phone?** See **[SETUP.md](SETUP.md)** for the full,
> tested walkthrough (EAS cloud build → install → run). The summary below is the
> short version.

There is no local Android SDK assumed. Two paths:

**A. EAS cloud build (no local Android SDK):**

```bash
npm install -g eas-cli
eas login
eas build --profile development --platform android   # produces an installable dev client APK
```

Install the resulting APK on the phone, then:

```bash
npm start        # expo start --dev-client
```

**B. Local Android SDK (Android Studio installed):**

```bash
npm install
npm run android  # expo run:android — prebuilds native project and installs to a device
```

Type-check anytime with:

```bash
npm run typecheck
```

## Testing without the real glove firmware

Flash the [ESP32-S3 test firmware](firmware/) to any ESP32-S3 board. It advertises
the SignBridge service and notifies the six test strings as JSON — enough to
verify the full path: scan → connect → receive → parse → display → speak → history.

## Milestone 1

Real ESP32-S3 → BLE notify → app parses → shows "HELLO" → **Speak** says "Hello"
→ optional auto-speak → event saved to history.
