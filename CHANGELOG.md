# Release v1.1.0

## What's New
- Added Shizuku ADB Module package (`module.prop`, `action.sh`, `service.sh`, `banner.png`) with `usesShellBridge=true`.
- Built Material 3 Expressive smartphone-tuned WebUI (`webui/index.html`, `styles.css`, `app.js`) powered by BeerCSS v4.0.21 with full offline fallback.
- Implemented APK central directory (`unzip -l`), `dumpsys package`, and optional DEX string signature scanner to detect Kotlin, Java/DEX, C/C++ NDK `.so` libraries, Jetpack Compose, Flutter, React Native (Hermes), Unity (IL2CPP), Capacitor/Cordova, and KMP.
- Added `/strict` evidence-first dual scoring engine for Engineering & Build Quality (0–100) and Practical Utility vs. Bloat (0–100).
- Added Frontend and Backend Settings screen with `$MODDIR/config.json` synchronization and `window.Shizuku.download()` asset caching.

## Fixed
- Scaled typography, cards, rings, and navigation bars specifically for 360px–430px smartphone viewports.
- Removed placeholder letter-square avatars/logos from application cards and inspector headers.

## Breaking Changes
- None
