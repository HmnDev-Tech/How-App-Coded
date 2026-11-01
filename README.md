<p align="center">
  <img src="banner.png" alt="HowAppCoded? Banner" width="100%">
</p>

# HowAppCoded?

**HowAppCoded?** is a Shizuku ADB Module with a smartphone-tuned **Material 3 Expressive** WebUI (built with BeerCSS v4.0.21) that inspects installed Android applications directly on-device. It analyzes APK central directories, DEX bytecode headers, native `.so` binaries, and `dumpsys package` telemetry to determine what an application is built with, whether its build configuration is modern and secure, and how its functional utility compares to its permission and tracker footprint.

* **Author:** HmnDev-Tech
* **Module ID:** `how-app-coded`
* **Version:** ...
* **Target Runtime:** Shizuku ADB Modules API (`usesShellBridge=true`)
* **License:** MIT

## Features

* **Tech Stack & Language Detection ("What Is It Made Of?")**
  * Inspects `base.apk` and split APKs (`split_config.*.apk`) via `unzip -l` without extracting archives to disk.
  * Detects **Kotlin** (`kotlin/*.kotlin_builtins`, `.kotlin_module`), **Java / ART DEX** (`classes*.dex`), **C/C++ NDK** (`lib/<abi>/*.so`), **Jetpack Compose** (`META-INF/androidx.compose.*`), **Flutter / Dart** (`libflutter.so`, `flutter_assets`), **React Native & Hermes** (`libreactnativejni.so`, `libhermes.so`, `index.android.bundle`), **Unity / IL2CPP** (`libunity.so`, `libil2cpp.so`), **Capacitor / Cordova** (`capacitor.config.json`, `cordova.js`), and **Kotlin Multiplatform (KMP)**.
  * Visualizes APK payload distribution across DEX bytecode, native `.so` libraries, `res/` resources, `assets/`, and `META-INF/` signatures.
* **Engineering & Build Quality Audit ("Is It Well-Coded?", 0–100 Score)**
  * Checks `targetSdk` and `minSdk` modernity against Android 14/15 (API 34/35) baselines.
  * Verifies 64-bit ABI compliance (`arm64-v8a`) when native libraries are bundled.
  * Audits release hygiene (`DEBUGGABLE` flag absence, `USES_CLEARTEXT_TRAFFIC`, `LARGE_HEAP`, and APK Signature Scheme `v2`/`v3`/`v4` vs legacy JAR `v1`).
  * Evaluates Multidex sprawl (`classes*.dex` count) and R8/ProGuard shrinking markers.
* **Utility vs. Bloat Evaluation ("Is It Useful & Clean?", 0–100 Score)**
  * Weighs registered Android OS components (`Activities`, `Services`, `BroadcastReceivers`, `ContentProviders`) against requested dangerous permissions (`CAMERA`, `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `READ_CONTACTS`, `SYSTEM_ALERT_WINDOW`, `REQUEST_INSTALL_PACKAGES`) and embedded ad/attribution SDKs (`AdMob`, `Meta Audience Network`, `AppsFlyer`, `Adjust`, `AppMetrica`, `Firebase`, `Sentry`).
* **Evidence-First Telemetry (`/strict` Mode)**
  * Separates **Concrete Observations** (exact archive entry counts, manifest flags, ABI, SDK versions, and raw shell output with execution latency in milliseconds) from **Heuristic Interpretation** (weighted score deductions and bonuses).
* **Material 3 Expressive Smartphone WebUI**
  * Compact mobile ergonomics (`360px–430px` viewports) with logo-free typography cards, spring animations, SVG circular score gauges, and offline-ready styling.
  * Full **Frontend Settings** (Dark/Light/Auto theme, 5 M3 tonal palettes, spring physics toggle, layout density, banner toggle, and one-tap local BeerCSS caching via `window.Shizuku.download()`).
  * Full **Backend Settings** (package scope `-3` / `-s` / all, Fast vs Deep DEX string scan, shell timeout `10s–180s` for `window.Shizuku.execWithOptions()`, split APK toggle, `ASH_STANDALONE=1` toggle, `$MODDIR/config.json` sync, and live bridge diagnostics).

## Package Structure

```text
how-app-coded-module.zip
├── module.prop          # Shizuku ADB Module metadata (usesShellBridge=true)
├── banner.png           # Module card banner (870x300)
├── action.sh            # Manual CLI action script (outputs to dialog & logs/action-last.log)
├── service.sh           # Binder session startup hook (caches package index to cache/packages_3p.txt)
├── README.md            # Module & repository documentation
├── CHANGELOG.md         # Release notes (v1.1.0)
├── LICENSE              # MIT License (HmnDev-Tech)
├── .gitignore           # Git ignore rules for logs, cache, and vendor downloads
└── webui/
    ├── index.html       # Material 3 Expressive WebUI entry point
    ├── styles.css       # Smartphone-proportioned M3 Expressive stylesheet & palette tokens
    ├── app.js           # Shizuku bridge controller, APK parser & /strict scoring engine
    ├── banner.jpg       # Local WebUI hero banner asset
    └── vendor/          # Target directory for optional offline BeerCSS caching
```

## Requirements & Permissions

| Requirement | Details |
| :--- | :--- |
| **Shizuku Manager** | Version supporting the **Shizuku ADB Modules API** (`window.Shizuku` WebUI bridge) |
| **Privileged Mode** | ADB shell (`uid=2000`) or Root (`uid=0`) active in Shizuku |
| **Module Access Policy** | **Full access** (with WebView internet off) or **Full Trust** (long-press the module card and select **Trust** to enable `window.Shizuku` and WebView internet simultaneously) |

## Installation

1. Download `how-app-coded-module.zip` from the latest release.
2. Open the **Shizuku Manager** app and navigate to the **Modules** screen.
3. Tap **Install from storage** and select `how-app-coded-module.zip`.
4. Enable the **HowAppCoded?** module card.
5. Long-press the **HowAppCoded?** card and tap **Trust** (Full Trust) or set the global module policy to **Full access** so `window.Shizuku.execWithOptions` is permitted.
6. Tap **WebUI** on the module card to launch the inspector, or tap **Action** to run `action.sh` directly in a dialog.

## How the Analysis Works

| Stage | Shell Command Executed via `window.Shizuku.execWithOptions` | Extracted Evidence |
| :--- | :--- | :--- |
| **1. Package Resolution** | `pm path <package>` and `du -k` | Resolves `base.apk` and all `split_config.*.apk` paths and calculates total disk footprint. |
| **2. Manifest & Package Telemetry** | `dumpsys package <package>` | Extracts `versionName`, `versionCode`, `minSdk`, `targetSdk`, `installerPackageName`, `apkSigningVersion`, `primaryCpuAbi`, `flags=[...]`, component resolver counts, and requested permissions. |
| **3. Archive Central Directory Scan** | `unzip -l <apk_paths>` | Counts `.dex` files, enumerates `lib/<abi>/*.so` binaries with sizes, measures payload distribution (`dex`, `lib`, `res`, `assets`, `META-INF`), and matches framework file markers. |
| **4. Deep DEX Signature Scan (Optional)** | `unzip -p base.apk classes.dex \| strings -n 6 \| grep -E ...` | Identifies obfuscated/embedded SDKs, DI frameworks, coroutines, Compose, and ad/analytics trackers inside `classes.dex`. |

## Publishing to GitHub (Quick Guide for HmnDev-Tech)

To publish this repository and release on GitHub under `HmnDev-Tech`:

```bash
# 1. Unpack the archive into a new repository folder
mkdir how-app-coded && cd how-app-coded
unzip ../how-app-coded-module.zip

# 2. Initialize Git and verify your private GitHub noreply identity
git init
git branch -M main
git config user.name "HmnDev-Tech"
# Replace <id> with your GitHub numeric user ID from: gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"'
git config user.email "<id>+HmnDev-Tech@users.noreply.github.com"

# 3. Stage module files explicitly and create the initial commit
git add module.prop banner.png action.sh service.sh README.md CHANGELOG.md LICENSE .gitignore webui/index.html webui/styles.css webui/app.js webui/banner.jpg
git commit -m "feat(module): initial release of HowAppCoded v1.1.0"

# 4. Create the GitHub repository and push
gh repo create HmnDev-Tech/how-app-coded --public --source=. --remote=origin --push

# 5. Publish v1.1.0 release with the installable module ZIP attached
gh release create v1.1.0 ../how-app-coded-module.zip \
  --title "HowAppCoded? v1.1.0" \
  --notes-file CHANGELOG.md
```

## License

Released under the MIT License. Copyright (c) 2026 HmnDev-Tech.
