# Setting up SignBridge on another device

A tested, start-to-finish guide for getting the app building and running on a
**new computer** and a **new Android phone**. This is the detailed version of
the quick notes in the [README](README.md).

> **Why a build at all?** SignBridge talks to the glove over **Bluetooth LE**
> with custom native code, so it does **not** run in Expo Go, and it **cannot**
> run on an emulator (emulators have no real Bluetooth). You build an app and
> install it on a **physical Android phone**.

---

## Prerequisites

| Need | Notes |
|---|---|
| **Node.js 20 LTS or newer** | Check with `node -v`. |
| **Git** | To clone the repo. |
| **A free Expo account** | Sign up at [expo.dev](https://expo.dev). |
| **An Android phone** | Bluetooth on. The glove pipeline can only be tested here. |
| **The ESP32-S3** | Flashed with the [test firmware](firmware/), advertising as `SignBridge Glove` (or the real glove). |

You do **not** need Android Studio or the Android SDK — builds happen in the
cloud on EAS.

---

## 1. Get the code

```bash
git clone https://github.com/Aryan-246/Sign-Sense.git
cd Sign-Sense
npm install
```

## 2. Install the EAS CLI and sign in

```bash
npm install -g eas-cli
eas login
```

> **About the linked project:** this repo is already linked to an EAS project
> (`expo.extra.eas.projectId` in `app.json`).
> - **Same Expo account, new computer** → nothing to do; builds just work.
> - **A different Expo account** → run `eas init` once to create/link your own
>   project (it rewrites `projectId`), then continue.

## 3. Build the app — pick one profile

Both profiles are already defined in [`eas.json`](eas.json).

### A) Development build — best while coding (live reload)

```bash
eas build --profile development --platform android
```

- On the **first** build, accept the prompts: *create/link project* → **Yes**,
  *generate Android keystore* → **Yes**.
- The cloud build takes ~10–20 min and ends with a **URL + QR code**.
- On the phone, open that link and **install the APK** (allow "install from
  unknown sources" if asked).
- Start the dev server on the computer:
  ```bash
  npm start
  ```
- Open the installed **SignBridge** app → tap your computer's dev server in the
  list (or scan the Metro QR from the terminal). First JS load takes 30–60s.
- Phone and computer must be on the **same Wi-Fi**. If the app reports *"no
  development servers found,"* run `npx expo start --tunnel` instead.

### B) Standalone build — no computer needed at runtime

```bash
eas build --profile preview --platform android
```

- The JavaScript is **bundled into the APK**. Install it and just open it — no
  Metro, no Wi-Fi tether.
- Trade-off: **rebuild** to pick up code changes (no live reload). Use this once
  things work and you just want to carry the phone around with the glove.

## 4. Grant permissions on the phone

The first time you scan, Android asks for **Nearby devices / Bluetooth** (and on
older versions, **Location**). **Allow it** — otherwise the scan finds nothing.
Make sure **Bluetooth is ON**.

## 5. Connect to the glove

Power the ESP32 (test firmware advertises as **SignBridge Glove**). In the app:

**Connect Glove → Scan → Connect** → recognized gestures appear on the
**Recognition** screen, and **Speak** reads them aloud. The **BLE Debug** screen
shows raw packets, parsed/malformed counts, and the GATT UUIDs if you need to
diagnose anything.

---

## Handy commands

```bash
npm run typecheck   # strict TypeScript check (tsc --noEmit)
npm start           # Metro dev server (for the development build)
npm run android     # local build — only if you DO install Android Studio/SDK
```

## Gotchas

- **Not Expo Go.** Custom native BLE means you always need a dev client or a
  standalone build — never scan into the Expo Go app.
- **Emulators can't do BLE.** Always test the glove on a physical phone.
- **iOS** local builds require macOS; Android is the primary target for now.
