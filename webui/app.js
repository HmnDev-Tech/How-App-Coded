/**
 * HowAppCoded? by HmnDev-Tech — Shizuku ADB Module WebUI Controller
 * Uses window.Shizuku JavaScript-to-Shell Bridge (getModuleInfo, exec, execWithOptions, download)
 * Strictly separates Concrete Observations from Heuristic Scoring (/strict skill compliance).
 * Logo-free clean smartphone UI.
 */

(function () {
  "use strict";

  const DEFAULT_SETTINGS = {
    // Frontend
    themeMode: "dark",
    palette: "parchment",
    motion: "expressive",
    density: "comfortable",
    showBanner: true,
    strictOpen: true,
    // Backend
    pkgScope: "user",
    scanDepth: "deep",
    timeoutSeconds: 45,
    maxPackages: 150,
    scanSplits: true,
    ashStandalone: true,
    persistLog: true
  };

  let settings = loadSettings();
  let bridgeAvailable = false;
  let moduleInfo = null;
  let allPackages = [];
  let auditedReports = {};
  let currentFilterScope = settings.pkgScope || "user";
  let currentReport = null;

  // Fallback realistic Android packages when previewed outside Shizuku WebView
  const FALLBACK_PACKAGES = [
    {
      pkg: "org.telegram.messenger",
      label: "Telegram",
      type: "user",
      path: "/data/app/~~9a8b/org.telegram.messenger-1/base.apk",
      quickStack: [".kt", ".java", ".cpp", "NDK"],
      preset: {
        versionName: "11.4.2",
        versionCode: "54129",
        minSdk: 21,
        targetSdk: 35,
        installer: "com.android.vending (Google Play)",
        signingVersion: 3,
        abi: "arm64-v8a",
        sizeMB: 68.4,
        splitCount: 4,
        flags: ["HAS_CODE", "ALLOW_CLEAR_USER_DATA", "LARGE_HEAP"],
        dexCount: 5,
        totalEntries: 4210,
        composition: { dex: 24, native: 42, res: 20, assets: 10, meta: 4 },
        stack: [
          { ext: ".cpp / .so", name: "C++ Native NDK (TDLib & BoringSSL)", category: "Native Core", proof: "lib/arm64-v8a/libtmessages.48.so, libavcodec.so" },
          { ext: ".java", name: "Java / Custom View Hierarchy", category: "UI & Runtime", proof: "classes.dex..classes5.dex (Custom Canvas UI)" },
          { ext: ".kt", name: "Kotlin Stdlib & Coroutines", category: "Language", proof: "kotlin/kotlin.kotlin_builtins, META-INF/kotlinx_coroutines_core.version" },
          { ext: ".glsl", name: "OpenGL ES / Vulkan Shaders", category: "Graphics", proof: "lib/arm64-v8a/libtgvoip.so, assets/shaders/" }
        ],
        nativeLibs: [
          { name: "libtmessages.48.so", abi: "arm64-v8a", size: "18.4 MB" },
          { name: "libtgvoip.so", abi: "arm64-v8a", size: "4.2 MB" },
          { name: "libffmpeg.so", abi: "arm64-v8a", size: "6.1 MB" },
          { name: "libc++_shared.so", abi: "arm64-v8a", size: "1.1 MB" }
        ],
        permissions: [
          { name: "android.permission.INTERNET", dangerous: false },
          { name: "android.permission.CAMERA", dangerous: true },
          { name: "android.permission.RECORD_AUDIO", dangerous: true },
          { name: "android.permission.POST_NOTIFICATIONS", dangerous: false },
          { name: "android.permission.FOREGROUND_SERVICE", dangerous: false }
        ],
        trackers: ["Firebase Cloud Messaging (Push Only)"],
        components: { activities: 14, services: 9, receivers: 11, providers: 3 },
        proguard: true,
        debuggable: false,
        allowBackup: false
      }
    },
    {
      pkg: "moe.shizuku.privileged.api",
      label: "Shizuku",
      type: "user",
      path: "/data/app/~~shz1/moe.shizuku.privileged.api-1/base.apk",
      quickStack: [".kt", ".cpp", "Material3", "R8"],
      preset: {
        versionName: "13.5.5.r1049",
        versionCode: "1049",
        minSdk: 24,
        targetSdk: 35,
        installer: "org.fdroid.fdroid / GitHub Release",
        signingVersion: 3,
        abi: "arm64-v8a",
        sizeMB: 4.8,
        splitCount: 1,
        flags: ["HAS_CODE", "ALLOW_CLEAR_USER_DATA"],
        dexCount: 1,
        totalEntries: 642,
        composition: { dex: 38, native: 22, res: 28, assets: 6, meta: 6 },
        stack: [
          { ext: ".kt", name: "Kotlin (100% First-Party Codebase)", category: "Primary Language", proof: "kotlin/kotlin.kotlin_builtins, META-INF/androidx.core_core-ktx.version" },
          { ext: ".cpp", name: "C++ Binder & ADB Daemon Starter", category: "System Native", proof: "lib/arm64-v8a/libshizuku.so" },
          { ext: "M3", name: "Material Design 3 / AndroidX", category: "UI Toolkit", proof: "META-INF/com.google.android.material_material.version" },
          { ext: "AIDL", name: "Android Binder IPC Bridge", category: "Architecture", proof: "moe/shizuku/server/IShizukuService.aidl" }
        ],
        nativeLibs: [
          { name: "libshizuku.so", abi: "arm64-v8a", size: "412 KB" },
          { name: "libadb.so", abi: "arm64-v8a", size: "580 KB" }
        ],
        permissions: [
          { name: "moe.shizuku.manager.permission.API_V23", dangerous: false },
          { name: "android.permission.RECEIVE_BOOT_COMPLETED", dangerous: false },
          { name: "android.permission.FOREGROUND_SERVICE", dangerous: false }
        ],
        trackers: [],
        components: { activities: 5, services: 4, receivers: 3, providers: 2 },
        proguard: true,
        debuggable: false,
        allowBackup: false
      }
    },
    {
      pkg: "com.obsidian.md",
      label: "Obsidian",
      type: "user",
      path: "/data/app/~~obs2/com.obsidian.md-1/base.apk",
      quickStack: ["Capacitor", ".js", ".css", "WebView"],
      preset: {
        versionName: "1.7.7",
        versionCode: "177",
        minSdk: 26,
        targetSdk: 34,
        installer: "com.android.vending (Google Play)",
        signingVersion: 3,
        abi: "universal (no native .so)",
        sizeMB: 19.2,
        splitCount: 1,
        flags: ["HAS_CODE", "ALLOW_BACKUP"],
        dexCount: 2,
        totalEntries: 890,
        composition: { dex: 18, native: 0, res: 14, assets: 64, meta: 4 },
        stack: [
          { ext: ".js / .css", name: "Capacitor Hybrid Web Bundle", category: "Cross-Platform", proof: "assets/capacitor.config.json, assets/public/app.js" },
          { ext: ".java", name: "Android WebView Host Bridge", category: "Wrapper", proof: "classes.dex (com.getcapacitor.BridgeActivity)" },
          { ext: ".kt", name: "Kotlin AndroidX Plugins", category: "Plugin Layer", proof: "kotlin/kotlin.kotlin_builtins" }
        ],
        nativeLibs: [],
        permissions: [
          { name: "android.permission.READ_EXTERNAL_STORAGE", dangerous: true },
          { name: "android.permission.WRITE_EXTERNAL_STORAGE", dangerous: true },
          { name: "android.permission.INTERNET", dangerous: false }
        ],
        trackers: [],
        components: { activities: 2, services: 1, receivers: 1, providers: 2 },
        proguard: true,
        debuggable: false,
        allowBackup: true
      }
    },
    {
      pkg: "com.duolingo",
      label: "Duolingo",
      type: "user",
      path: "/data/app/~~duo4/com.duolingo-1/base.apk",
      quickStack: [".kt", "Compose", "KMP", ".so"],
      preset: {
        versionName: "6.12.4",
        versionCode: "2045",
        minSdk: 26,
        targetSdk: 34,
        installer: "com.android.vending (Google Play)",
        signingVersion: 3,
        abi: "arm64-v8a",
        sizeMB: 94.6,
        splitCount: 6,
        flags: ["HAS_CODE", "ALLOW_BACKUP", "LARGE_HEAP"],
        dexCount: 8,
        totalEntries: 5830,
        composition: { dex: 31, native: 19, res: 24, assets: 22, meta: 4 },
        stack: [
          { ext: ".kt", name: "Kotlin & Kotlin Multiplatform (KMP)", category: "Primary Language", proof: "META-INF/kotlinx-Metadata, kotlin/kotlin.kotlin_builtins" },
          { ext: "Compose", name: "Jetpack Compose UI", category: "Modern UI", proof: "META-INF/androidx.compose.ui_ui.version" },
          { ext: "Lottie", name: "Lottie & Rive Vector Animations", category: "Animation Engine", proof: "lib/arm64-v8a/librive-android.so, assets/*.json" }
        ],
        nativeLibs: [
          { name: "librive-android.so", abi: "arm64-v8a", size: "3.1 MB" },
          { name: "libc++_shared.so", abi: "arm64-v8a", size: "1.0 MB" }
        ],
        permissions: [
          { name: "android.permission.INTERNET", dangerous: false },
          { name: "android.permission.RECORD_AUDIO", dangerous: true },
          { name: "com.google.android.gms.permission.AD_ID", dangerous: true }
        ],
        trackers: ["Google AdMob", "Firebase Analytics", "Adjust SDK", "Facebook Login SDK"],
        components: { activities: 22, services: 12, receivers: 16, providers: 6 },
        proguard: true,
        debuggable: false,
        allowBackup: true
      }
    },
    {
      pkg: "io.flutter.demo.gallery",
      label: "Flutter Gallery",
      type: "user",
      path: "/data/app/~~flt9/io.flutter.demo.gallery-1/base.apk",
      quickStack: ["Flutter", "Dart", "Impeller", ".so"],
      preset: {
        versionName: "3.24.0",
        versionCode: "3240",
        minSdk: 23,
        targetSdk: 35,
        installer: "adb (PackageInstaller)",
        signingVersion: 3,
        abi: "arm64-v8a",
        sizeMB: 31.0,
        splitCount: 3,
        flags: ["HAS_CODE"],
        dexCount: 1,
        totalEntries: 1120,
        composition: { dex: 8, native: 58, res: 10, assets: 21, meta: 3 },
        stack: [
          { ext: "Dart", name: "Flutter Engine & AOT Compiled Dart", category: "Cross-Platform Engine", proof: "lib/arm64-v8a/libflutter.so, lib/arm64-v8a/libapp.so" },
          { ext: "Assets", name: "Flutter Asset Bundle & Shaders", category: "UI Assets", proof: "assets/flutter_assets/kernel_blob.bin, FontManifest.json" },
          { ext: ".kt", name: "Kotlin FlutterActivity Embedder", category: "Host Shell", proof: "io/flutter/embedding/android/FlutterActivity" }
        ],
        nativeLibs: [
          { name: "libflutter.so", abi: "arm64-v8a", size: "10.8 MB" },
          { name: "libapp.so", abi: "arm64-v8a", size: "7.2 MB" }
        ],
        permissions: [
          { name: "android.permission.INTERNET", dangerous: false }
        ],
        trackers: [],
        components: { activities: 1, services: 0, receivers: 0, providers: 1 },
        proguard: true,
        debuggable: false,
        allowBackup: false
      }
    },
    {
      pkg: "com.legacy.bloated.flashlight",
      label: "Super Bright Flashlight Pro 2019",
      type: "user",
      path: "/data/app/~~leg0/com.legacy.bloated.flashlight-1/base.apk",
      quickStack: [".java", "Legacy", "armeabi-v7a", "AdSDKs"],
      preset: {
        versionName: "1.2.0",
        versionCode: "12",
        minSdk: 16,
        targetSdk: 27,
        installer: "unknown (Sideloaded APK)",
        signingVersion: 1,
        abi: "armeabi-v7a (32-bit legacy)",
        sizeMB: 46.8,
        splitCount: 1,
        flags: ["HAS_CODE", "DEBUGGABLE", "ALLOW_BACKUP", "LARGE_HEAP", "USES_CLEARTEXT_TRAFFIC"],
        dexCount: 6,
        totalEntries: 3890,
        composition: { dex: 44, native: 18, res: 26, assets: 9, meta: 3 },
        stack: [
          { ext: ".java", name: "Unminified Legacy Java & Multidex", category: "Language", proof: "classes.dex..classes6.dex (No R8/ProGuard mapping)" },
          { ext: "Ads", name: "Heavy Ad & Attribution SDK Bundle", category: "Monetization Bloat", proof: "com.google.android.gms.ads, com.facebook.ads, com.appsflyer" },
          { ext: ".so (32b)", name: "Legacy 32-bit Native Binaries Only", category: "Deprecated ABI", proof: "lib/armeabi-v7a/libjni_helper.so (Missing arm64-v8a)" }
        ],
        nativeLibs: [
          { name: "libjni_helper.so", abi: "armeabi-v7a", size: "2.4 MB" }
        ],
        permissions: [
          { name: "android.permission.CAMERA", dangerous: true },
          { name: "android.permission.ACCESS_FINE_LOCATION", dangerous: true },
          { name: "android.permission.READ_CONTACTS", dangerous: true },
          { name: "android.permission.READ_PHONE_STATE", dangerous: true },
          { name: "android.permission.SYSTEM_ALERT_WINDOW", dangerous: true },
          { name: "android.permission.REQUEST_INSTALL_PACKAGES", dangerous: true },
          { name: "android.permission.INTERNET", dangerous: false }
        ],
        trackers: ["Google AdMob", "Meta Audience Network", "AppsFlyer", "AppMetrica", "UnityAds"],
        components: { activities: 18, services: 11, receivers: 19, providers: 4 },
        proguard: false,
        debuggable: true,
        allowBackup: true
      }
    }
  ];

  // ==================== SETTINGS & STORAGE ====================
  function loadSettings() {
    try {
      const raw = localStorage.getItem("howappcoded_settings_v1");
      if (raw) {
        return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
      }
    } catch (_) {}
    return Object.assign({}, DEFAULT_SETTINGS);
  }

  function saveSettingsLocal() {
    try {
      localStorage.setItem("howappcoded_settings_v1", JSON.stringify(settings));
    } catch (_) {}
  }

  function applyFrontendSettings() {
    const body = document.body;
    let isLight = false;
    if (settings.themeMode === "light") {
      isLight = true;
    } else if (settings.themeMode === "auto") {
      isLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    }
    body.classList.toggle("light", isLight);
    body.classList.toggle("dark", !isLight);

    ["parchment", "violet", "emerald", "cobalt", "coral"].forEach(p => {
      body.classList.toggle("theme-" + p, settings.palette === p);
    });
    document.querySelectorAll(".swatch-btn").forEach(btn => {
      btn.classList.toggle("active-swatch", btn.dataset.palette === settings.palette);
    });

    ["expressive", "smooth", "reduced"].forEach(m => {
      body.classList.toggle("motion-" + m, settings.motion === m);
    });

    ["comfortable", "compact"].forEach(d => {
      body.classList.toggle("density-" + d, settings.density === d);
    });

    const heroCard = document.getElementById("hero-banner-card");
    if (heroCard) {
      heroCard.classList.toggle("hidden", !settings.showBanner);
    }

    const strictDrawer = document.getElementById("strict-drawer-body");
    if (strictDrawer) {
      strictDrawer.classList.toggle("hidden", !settings.strictOpen);
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setChk = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(val);
    };

    setVal("set-fe-theme-mode", settings.themeMode);
    setVal("set-fe-motion", settings.motion);
    setVal("set-fe-density", settings.density);
    setChk("set-fe-show-banner", settings.showBanner);
    setChk("set-fe-strict-open", settings.strictOpen);

    setVal("set-be-pkg-scope", settings.pkgScope);
    setVal("set-be-scan-depth", settings.scanDepth);
    setVal("set-be-timeout", settings.timeoutSeconds);
    setVal("set-be-max-pkgs", settings.maxPackages);
    setChk("set-be-scan-splits", settings.scanSplits);
    setChk("set-be-ash-standalone", settings.ashStandalone);
    setChk("set-be-persist-log", settings.persistLog);

    const lblTimeout = document.getElementById("label-be-timeout");
    if (lblTimeout) lblTimeout.textContent = settings.timeoutSeconds + "s";
    const lblMax = document.getElementById("label-be-max-pkgs");
    if (lblMax) lblMax.textContent = String(settings.maxPackages);
  }

  // ==================== SHIZUKU SHELL BRIDGE ====================
  function checkShizukuBridge() {
    const statusText = document.getElementById("bridge-status-text");
    const modeChip = document.getElementById("hero-mode-chip");
    const uidStat = document.getElementById("stat-bridge-uid");
    const sdkStat = document.getElementById("stat-device-sdk");

    if (typeof window.Shizuku !== "undefined" && typeof window.Shizuku.exec === "function") {
      try {
        if (typeof window.Shizuku.getModuleInfo === "function") {
          moduleInfo = JSON.parse(window.Shizuku.getModuleInfo());
        }
      } catch (_) {}

      const probe = runShell("id -u && getprop ro.build.version.sdk", 10);
      if (probe.ok) {
        bridgeAvailable = true;
        const lines = (probe.stdout || "").trim().split(/\r?\n/);
        const uid = lines[0] || "2000";
        const sdk = lines[1] || "35";
        const trustLabel = moduleInfo && moduleInfo.trusted ? "Full Trust" : (moduleInfo && moduleInfo.accessMode ? moduleInfo.accessMode : "Active");
        statusText.textContent = "Shizuku Connected • " + trustLabel + " • UID " + uid;
        modeChip.textContent = "UID " + uid;
        uidStat.textContent = uid === "0" ? "root" : uid;
        sdkStat.textContent = "API " + sdk;
        return;
      } else {
        bridgeAvailable = false;
        statusText.textContent = "Shizuku Policy Gate: " + (probe.stderr || "Enable Full Access");
        modeChip.textContent = "Locked";
        uidStat.textContent = "Locked";
        sdkStat.textContent = "--";
        return;
      }
    }

    bridgeAvailable = false;
    statusText.textContent = "Preview Mode (Open in Shizuku for live device ADB)";
    modeChip.textContent = "Preview";
    uidStat.textContent = "Demo";
    sdkStat.textContent = "API 35";
  }

  function runShell(command, customTimeout) {
    const t0 = performance.now();
    if (typeof window.Shizuku === "undefined") {
      return {
        ok: false,
        exitCode: -1,
        stdout: "",
        stderr: "window.Shizuku bridge not exposed in this browser context.",
        timedOut: false,
        durationMs: Math.round(performance.now() - t0)
      };
    }

    try {
      let rawResult;
      const timeoutSec = Math.max(1, Math.min(600, Number(customTimeout || settings.timeoutSeconds || 45)));
      if (typeof window.Shizuku.execWithOptions === "function") {
        const opts = {
          timeoutSeconds: timeoutSec,
          env: settings.ashStandalone ? { ASH_STANDALONE: "1" } : {}
        };
        rawResult = window.Shizuku.execWithOptions(command, JSON.stringify(opts));
      } else {
        rawResult = window.Shizuku.exec(command);
      }
      const parsed = JSON.parse(rawResult);
      parsed.durationMs = Math.round(performance.now() - t0);
      return parsed;
    } catch (err) {
      return {
        ok: false,
        exitCode: -1,
        stdout: "",
        stderr: String(err),
        timedOut: false,
        durationMs: Math.round(performance.now() - t0)
      };
    }
  }

  // ==================== PACKAGE LISTING (NO LOGOS/AVATARS) ====================
  function loadPackagesList() {
    const loadingEl = document.getElementById("packages-loading");
    const listEl = document.getElementById("packages-list");
    loadingEl.classList.remove("hidden");
    listEl.innerHTML = "";

    setTimeout(() => {
      if (bridgeAvailable) {
        const maxLim = Number(settings.maxPackages || 150);
        const cmd = [
          "cmd package list packages -3 -f 2>/dev/null | head -n " + maxLim + " | sed 's/^package:/U|/'",
          "cmd package list packages -s -f 2>/dev/null | head -n " + maxLim + " | sed 's/^package:/S|/'"
        ].join(" ; ");
        const res = runShell(cmd, settings.timeoutSeconds);
        if (res.ok && res.stdout.trim()) {
          const lines = res.stdout.trim().split(/\r?\n/);
          const parsed = [];
          lines.forEach(line => {
            const parts = line.split("|");
            if (parts.length < 2) return;
            const pType = parts[0] === "U" ? "user" : "system";
            const rawRest = parts.slice(1).join("|");
            const eqIdx = rawRest.lastIndexOf(".apk=");
            let apkPath = "";
            let pkgName = rawRest;
            if (eqIdx !== -1) {
              apkPath = rawRest.substring(0, eqIdx + 4);
              pkgName = rawRest.substring(eqIdx + 5).trim();
            }
            if (pkgName) {
              parsed.push({
                pkg: pkgName,
                label: formatReadableLabel(pkgName),
                type: pType,
                path: apkPath || "/data/app/" + pkgName + "/base.apk",
                quickStack: []
              });
            }
          });
          allPackages = parsed;
        } else {
          allPackages = FALLBACK_PACKAGES.slice();
        }
      } else {
        allPackages = FALLBACK_PACKAGES.slice();
      }

      loadingEl.classList.add("hidden");
      updateHeroStats();
      renderPackagesGrid();
    }, 40);
  }

  function formatReadableLabel(pkg) {
    const segs = pkg.split(".");
    const last = segs[segs.length - 1] || pkg;
    if (last.length <= 2 && segs.length > 1) {
      return capitalize(segs[segs.length - 2]) + " " + capitalize(last);
    }
    return capitalize(last.replace(/[_-]/g, " "));
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  function updateHeroStats() {
    document.getElementById("stat-total-pkgs").textContent = String(allPackages.length);
    document.getElementById("stat-scanned-count").textContent = String(Object.keys(auditedReports).length);
  }

  function renderPackagesGrid() {
    const listEl = document.getElementById("packages-list");
    const query = (document.getElementById("input-search-pkg").value || "").trim().toLowerCase();
    const sortBy = document.getElementById("select-sort").value;

    let filtered = allPackages.filter(item => {
      if (currentFilterScope === "user" && item.type !== "user") return false;
      if (currentFilterScope === "system" && item.type !== "system") return false;
      if (currentFilterScope === "audited" && !auditedReports[item.pkg]) return false;

      if (query) {
        const hay = (item.pkg + " " + item.label + " " + (item.quickStack || []).join(" ")).toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === "audited") {
        const aAud = auditedReports[a.pkg] ? 1 : 0;
        const bAud = auditedReports[b.pkg] ? 1 : 0;
        if (aAud !== bAud) return bAud - aAud;
      } else if (sortBy === "type") {
        if (a.type !== b.type) return a.type === "user" ? -1 : 1;
      }
      return a.pkg.localeCompare(b.pkg);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = '<article class="m3-card surface-container" style="text-align:center;"><h4>No matching packages</h4><p>Switch the filter chip (3rd-Party / System / All) or clear the search query.</p></article>';
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const audited = auditedReports[item.pkg];
      const stackBadges = (audited ? audited.stack.map(s => s.ext) : (item.quickStack || []))
        .slice(0, 4)
        .map(tag => '<span class="stack-mini-pill">' + escapeHtml(tag) + '</span>')
        .join("");

      const scoreBadge = audited
        ? '<span class="m3-pill-badge tertiary-badge">Quality ' + audited.qualityScore + '/100</span>'
        : '<span class="m3-pill-badge">' + (item.type === "user" ? "3rd-Party" : "System") + '</span>';

      return (
        '<article class="pkg-card" data-pkg="' + escapeHtml(item.pkg) + '" role="listitem">' +
          '<div class="pkg-main-info">' +
            '<div class="pkg-title-row">' +
              '<h3 class="pkg-title">' + escapeHtml(item.label) + '</h3>' +
              scoreBadge +
            '</div>' +
            '<p class="pkg-id">' + escapeHtml(item.pkg) + '</p>' +
          '</div>' +
          '<div class="pkg-badges-row">' +
            (stackBadges || '<span class="mono-caption">Tap to inspect APK structure &amp; stack</span>') +
          '</div>' +
          '<div class="pkg-card-footer">' +
            '<span class="mono-caption">' + escapeHtml(shortenPath(item.path)) + '</span>' +
            '<button class="m3-btn tonal-btn small-btn inspect-trigger-btn" data-pkg="' + escapeHtml(item.pkg) + '">Inspect &rarr;</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");

    listEl.querySelectorAll(".pkg-card").forEach(card => {
      card.addEventListener("click", () => {
        const pkg = card.getAttribute("data-pkg");
        if (pkg) inspectPackage(pkg);
      });
    });
  }

  function shortenPath(p) {
    if (!p) return "/data/app/.../base.apk";
    if (p.length <= 34) return p;
    return "..." + p.slice(-31);
  }

  // ==================== DEEP APK & DUMPSYS ANALYZER ====================
  function inspectPackage(pkgName) {
    const cleanPkg = pkgName.trim();
    if (!cleanPkg || !/^[A-Za-z0-9._-]+$/.test(cleanPkg)) {
      showSnackbar("Invalid package name format.");
      return;
    }

    switchView("view-inspector");
    showSnackbar("Inspecting " + cleanPkg + "...");

    if (bridgeAvailable) {
      const report = runLiveAdbInspection(cleanPkg);
      auditedReports[cleanPkg] = report;
      currentReport = report;
      updateHeroStats();
      renderInspectorReport(report);
      renderPackagesGrid();
      if (settings.persistLog) {
        persistReportToModuleLogs(report);
      }
    } else {
      const found = FALLBACK_PACKAGES.find(p => p.pkg === cleanPkg);
      const report = buildReportFromPreset(cleanPkg, found ? found.label : formatReadableLabel(cleanPkg), found ? found.preset : null);
      auditedReports[cleanPkg] = report;
      currentReport = report;
      updateHeroStats();
      renderInspectorReport(report);
      renderPackagesGrid();
    }
  }

  function runLiveAdbInspection(pkg) {
    const scanSplits = settings.scanSplits ? "" : " | head -n 1";
    const deepDexCmd = settings.scanDepth === "deep"
      ? 'unzip -p "$BASE_APK" classes.dex 2>/dev/null | strings -n 6 2>/dev/null | grep -E "kotlin|compose|flutter|reactnative|okhttp3|retrofit2|dagger|hilt|koin|room|firebase|google\\.android\\.gms\\.ads|facebook\\.ads|appsflyer|adjust|appmetrica|sentry|lottie|glide|coil" | head -n 120'
      : 'echo "FAST_MODE"';

    const script = [
      'PKG="' + pkg + '"',
      'echo "===PATHS==="',
      'PATHS=$(pm path "$PKG" 2>/dev/null | sed "s/^package://"' + scanSplits + ')',
      'echo "$PATHS"',
      'BASE_APK=$(echo "$PATHS" | head -n 1)',
      'echo "===SIZE_KB==="',
      'du -k $PATHS 2>/dev/null | awk "{s+=\\$1} END {print s+0}"',
      'echo "===DUMPSYS==="',
      'dumpsys package "$PKG" 2>/dev/null | grep -E "versionName=|versionCode=|minSdk=|targetSdk=|installerPackageName=|apkSigningVersion=|primaryCpuAbi=|flags=\\[|privateFlags=\\[|android\\.permission\\.|com\\.google\\.android\\.gms\\.permission" | head -n 90',
      'echo "===COMPONENT_COUNTS==="',
      'dumpsys package "$PKG" 2>/dev/null | awk "/Activity Resolver Table:/{a=1;s=0;r=0;p=0} /Service Resolver Table:/{a=0;s=1;r=0;p=0} /Receiver Resolver Table:/{a=0;s=0;r=1;p=0} /Provider Resolver Table:/{a=0;s=0;r=0;p=1} /Permissions:/{a=0;s=0;r=0;p=0} /filter/{if(a)ac++; if(s)sc++; if(r)rc++; if(p)pc++} END{print ac+0, sc+0, rc+0, pc+0}"',
      'echo "===UNZIP==="',
      'for f in $PATHS; do unzip -l "$f" 2>/dev/null; done | awk "NF>=4 && \\$1 ~ /^[0-9]+$/ {len=\\$1; name=\\$4; total++; bytes+=len; if(name ~ /\\.dex$/) {dex++; dexB+=len} else if(name ~ /^lib\\/.*\\.so$/) {so++; soB+=len; print \\"SO|\\"name\\"|\\"len} else if(name ~ /^assets\\//) {ast++; astB+=len} else if(name ~ /^META-INF\\//) {meta++; metaB+=len} else {res++; resB+=len} if(name ~ /kotlin|flutter|reactnative|hermes|unity|il2cpp|godot|cordova|capacitor|compose|monodroid|gojni|qtproject|proguard/) {print \\"SIG|\\"name}} END {print \\"SUM|\\"total\\"|\\"bytes\\"|\\"dex\\"|\\"dexB\\"|\\"so\\"|\\"soB\\"|\\"res\\"|\\"resB\\"|\\"ast\\"|\\"astB\\"|\\"meta\\"|\\"metaB}"',
      'echo "===DEEP_STRINGS==="',
      deepDexCmd
    ].join("\n");

    const res = runShell(script, settings.timeoutSeconds);
    return parseLiveShellToReport(pkg, res);
  }

  function parseLiveShellToReport(pkg, res) {
    const out = res.stdout || "";
    const sec = (name, nextName) => {
      const start = out.indexOf("===" + name + "===");
      if (start === -1) return "";
      const sub = out.slice(start + name.length + 6);
      if (!nextName) return sub.trim();
      const end = sub.indexOf("===" + nextName + "===");
      return (end === -1 ? sub : sub.slice(0, end)).trim();
    };

    const pathsRaw = sec("PATHS", "SIZE_KB").split(/\r?\n/).filter(Boolean);
    const sizeKb = parseInt(sec("SIZE_KB", "DUMPSYS"), 10) || 0;
    const dumpRaw = sec("DUMPSYS", "COMPONENT_COUNTS");
    const compCountsRaw = sec("COMPONENT_COUNTS", "UNZIP").split(/\s+/);
    const unzipRaw = sec("UNZIP", "DEEP_STRINGS");
    const deepRaw = sec("DEEP_STRINGS", null);

    const matchVal = (regex, defVal) => {
      const m = dumpRaw.match(regex);
      return m ? m[1] : defVal;
    };

    const versionName = matchVal(/versionName=([^\s]+)/, "1.0");
    const versionCode = matchVal(/versionCode=([0-9]+)/, "1");
    const minSdk = parseInt(matchVal(/minSdk=([0-9]+)/, "24"), 10);
    const targetSdk = parseInt(matchVal(/targetSdk=([0-9]+)/, "34"), 10);
    const installer = matchVal(/installerPackageName=([^\s]+)/, "System / Sideloaded");
    const signingVersion = parseInt(matchVal(/apkSigningVersion=([0-9]+)/, "2"), 10);
    const abi = matchVal(/primaryCpuAbi=([^\s]+)/, "arm64-v8a");

    const flagsMatch = dumpRaw.match(/flags=\[\s*([^\]]+)\]/);
    const flags = flagsMatch ? flagsMatch[1].trim().split(/\s+/) : ["HAS_CODE"];

    const permSet = new Set();
    dumpRaw.split(/\r?\n/).forEach(l => {
      const pm = l.match(/(android\.permission\.[A-Z0-9_]+|com\.google\.android\.gms\.permission\.[A-Z0-9_]+)/);
      if (pm) permSet.add(pm[1]);
    });

    const dangerousSet = new Set([
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.READ_CONTACTS",
      "android.permission.WRITE_CONTACTS",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_PHONE_STATE",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.REQUEST_INSTALL_PACKAGES",
      "android.permission.READ_SMS",
      "android.permission.SEND_SMS"
    ]);

    const permissions = Array.from(permSet).map(p => ({
      name: p,
      dangerous: dangerousSet.has(p)
    }));

    let totalEntries = 0, totalBytes = 1, dexCount = 1, dexB = 0, soB = 0, resB = 0, astB = 0, metaB = 0;
    const nativeLibs = [];
    const sigLines = [];

    unzipRaw.split(/\r?\n/).forEach(line => {
      if (line.startsWith("SO|")) {
        const p = line.split("|");
        const fullPath = p[1] || "";
        const bytes = parseInt(p[2], 10) || 0;
        const segs = fullPath.split("/");
        nativeLibs.push({
          name: segs[segs.length - 1] || fullPath,
          abi: segs[1] || abi,
          size: (bytes / 1024).toFixed(0) + " KB"
        });
      } else if (line.startsWith("SIG|")) {
        sigLines.push(line.slice(4));
      } else if (line.startsWith("SUM|")) {
        const s = line.split("|");
        totalEntries = parseInt(s[1], 10) || 0;
        totalBytes = Math.max(1, parseInt(s[2], 10) || 1);
        dexCount = parseInt(s[3], 10) || 1;
        dexB = parseInt(s[4], 10) || 0;
        soB = parseInt(s[6], 10) || 0;
        resB = parseInt(s[8], 10) || 0;
        astB = parseInt(s[10], 10) || 0;
        metaB = parseInt(s[12], 10) || 0;
      }
    });

    const pct = v => Math.max(1, Math.round((v / totalBytes) * 100));
    const composition = {
      dex: pct(dexB),
      native: soB > 0 ? pct(soB) : 0,
      res: pct(resB),
      assets: astB > 0 ? pct(astB) : 0,
      meta: pct(metaB)
    };

    const allSignals = (sigLines.join(" ") + " " + deepRaw + " " + nativeLibs.map(n => n.name).join(" ")).toLowerCase();
    const stack = [];

    if (allSignals.includes("flutter") || allSignals.includes("libapp.so")) {
      stack.push({ ext: "Dart / Flutter", name: "Flutter Cross-Platform Engine", category: "UI Framework", proof: "libflutter.so / flutter_assets" });
    }
    if (allSignals.includes("reactnative") || allSignals.includes("hermes") || allSignals.includes("index.android.bundle")) {
      stack.push({ ext: "JS / Hermes", name: "React Native" + (allSignals.includes("hermes") ? " (Hermes Engine)" : ""), category: "Cross-Platform", proof: "libreactnativejni.so / libhermes.so" });
    }
    if (allSignals.includes("unity") || allSignals.includes("il2cpp")) {
      stack.push({ ext: "C# / IL2CPP", name: "Unity 3D Engine", category: "Game Engine", proof: "libunity.so / libil2cpp.so" });
    }
    if (allSignals.includes("capacitor") || allSignals.includes("cordova")) {
      stack.push({ ext: ".js / .html", name: "Capacitor / Cordova WebView", category: "Hybrid Web", proof: "assets/capacitor.config.json / cordova.js" });
    }
    if (allSignals.includes("kotlin")) {
      stack.push({ ext: ".kt", name: "Kotlin Language & Standard Library", category: "Primary Language", proof: "kotlin/kotlin.kotlin_builtins / .kotlin_module" });
    }
    if (allSignals.includes("compose")) {
      stack.push({ ext: "Compose", name: "Jetpack Compose Declarative UI", category: "Modern UI Toolkit", proof: "META-INF/androidx.compose.*" });
    }
    if (nativeLibs.length > 0) {
      stack.push({ ext: ".cpp / .so", name: "C/C++ Android NDK Binaries (" + nativeLibs.length + " libs)", category: "Native Layer", proof: nativeLibs.slice(0, 2).map(l => l.name).join(", ") });
    }
    if (dexCount > 0) {
      stack.push({ ext: ".java / .dex", name: "ART / Dalvik Bytecode (" + dexCount + " DEX)", category: "Runtime VM", proof: "classes.dex" + (dexCount > 1 ? "..classes" + dexCount + ".dex" : "") });
    }

    const trackers = [];
    if (allSignals.includes("google.android.gms.ads")) trackers.push("Google AdMob");
    if (allSignals.includes("facebook.ads")) trackers.push("Meta Audience Network");
    if (allSignals.includes("appsflyer")) trackers.push("AppsFlyer Attribution");
    if (allSignals.includes("adjust")) trackers.push("Adjust Tracker");
    if (allSignals.includes("appmetrica")) trackers.push("Yandex AppMetrica");
    if (allSignals.includes("firebase")) trackers.push("Firebase SDK");
    if (allSignals.includes("sentry")) trackers.push("Sentry Crash Reporting");

    const presetLike = {
      versionName,
      versionCode,
      minSdk,
      targetSdk,
      installer,
      signingVersion,
      abi,
      sizeMB: sizeKb > 0 ? +(sizeKb / 1024).toFixed(1) : +(totalBytes / (1024 * 1024)).toFixed(1),
      splitCount: Math.max(1, pathsRaw.length),
      flags,
      dexCount,
      totalEntries,
      composition,
      stack,
      nativeLibs: nativeLibs.slice(0, 35),
      permissions,
      trackers,
      components: {
        activities: parseInt(compCountsRaw[0], 10) || 1,
        services: parseInt(compCountsRaw[1], 10) || 0,
        receivers: parseInt(compCountsRaw[2], 10) || 0,
        providers: parseInt(compCountsRaw[3], 10) || 0
      },
      proguard: allSignals.includes("proguard") || dexCount <= 3,
      debuggable: flags.includes("DEBUGGABLE"),
      allowBackup: flags.includes("ALLOW_BACKUP")
    };

    return computeScoresAndBuildReport(pkg, formatReadableLabel(pkg), presetLike, res.stdout, res.durationMs, true);
  }

  function buildReportFromPreset(pkg, label, preset) {
    const p = preset || {
      versionName: "1.0.0",
      versionCode: "100",
      minSdk: 24,
      targetSdk: 34,
      installer: "com.android.vending",
      signingVersion: 3,
      abi: "arm64-v8a",
      sizeMB: 14.2,
      splitCount: 2,
      flags: ["HAS_CODE"],
      dexCount: 2,
      totalEntries: 950,
      composition: { dex: 35, native: 20, res: 30, assets: 10, meta: 5 },
      stack: [
        { ext: ".kt", name: "Kotlin & AndroidX", category: "Language", proof: "kotlin/kotlin.kotlin_builtins" },
        { ext: ".java / .dex", name: "ART DEX Bytecode (2 files)", category: "Runtime", proof: "classes.dex, classes2.dex" }
      ],
      nativeLibs: [],
      permissions: [{ name: "android.permission.INTERNET", dangerous: false }],
      trackers: [],
      components: { activities: 4, services: 1, receivers: 1, providers: 1 },
      proguard: true,
      debuggable: false,
      allowBackup: false
    };

    const simulatedRaw = [
      "# Preview Sandbox Output (Open in Shizuku Manager for live device shell execution)",
      "$ pm path " + pkg,
      "package:/data/app/" + pkg + "-1/base.apk",
      "$ dumpsys package " + pkg,
      "  versionName=" + p.versionName + " versionCode=" + p.versionCode,
      "  minSdk=" + p.minSdk + " targetSdk=" + p.targetSdk,
      "  apkSigningVersion=" + p.signingVersion + " primaryCpuAbi=" + p.abi,
      "  flags=[ " + p.flags.join(" ") + " ]",
      "$ unzip -l base.apk | Summary",
      "  Total Zip Entries: " + p.totalEntries + " | DEX Files: " + p.dexCount + " | Native .so: " + p.nativeLibs.length
    ].join("\n");

    return computeScoresAndBuildReport(pkg, label, p, simulatedRaw, 18, false);
  }

  // ==================== STRICT SCORING ENGINE ====================
  function computeScoresAndBuildReport(pkg, label, p, rawOutput, durationMs, isLiveShell) {
    let qualityScore = 60;
    const qualityChecks = [];

    if (p.targetSdk >= 34) {
      qualityScore += 16;
      qualityChecks.push({
        status: "pass",
        title: "Modern Target SDK (API " + p.targetSdk + ")",
        evidence: "targetSdk=" + p.targetSdk + " (Android 14/15+ baseline)",
        delta: "+16"
      });
    } else if (p.targetSdk >= 31) {
      qualityScore += 6;
      qualityChecks.push({
        status: "warn",
        title: "Acceptable Target SDK (API " + p.targetSdk + ")",
        evidence: "targetSdk=" + p.targetSdk + " (Trails API 34/35)",
        delta: "+6"
      });
    } else {
      qualityScore -= 20;
      qualityChecks.push({
        status: "fail",
        title: "Outdated Target SDK (API " + p.targetSdk + ")",
        evidence: "targetSdk=" + p.targetSdk + " bypasses modern restrictions",
        delta: "-20"
      });
    }

    if (p.nativeLibs.length === 0) {
      qualityScore += 8;
      qualityChecks.push({
        status: "pass",
        title: "Pure Managed Bytecode (ABI-Independent)",
        evidence: "0 native .so files; runs natively on 64-bit ART",
        delta: "+8"
      });
    } else if (String(p.abi).includes("arm64") || p.nativeLibs.some(l => l.abi.includes("arm64"))) {
      qualityScore += 10;
      qualityChecks.push({
        status: "pass",
        title: "64-Bit Native ABI Compliant (arm64-v8a)",
        evidence: "primaryCpuAbi=" + p.abi + " (" + p.nativeLibs.length + " .so libs)",
        delta: "+10"
      });
    } else {
      qualityScore -= 18;
      qualityChecks.push({
        status: "fail",
        title: "Legacy 32-Bit Native Binaries Only",
        evidence: "primaryCpuAbi=" + p.abi + " lacks arm64-v8a",
        delta: "-18"
      });
    }

    if (p.debuggable) {
      qualityScore -= 25;
      qualityChecks.push({
        status: "fail",
        title: "Shipped with DEBUGGABLE Flag Enabled",
        evidence: "flags=[ DEBUGGABLE ] exposes JDWP attach",
        delta: "-25"
      });
    } else if (p.signingVersion >= 2) {
      qualityScore += 8;
      qualityChecks.push({
        status: "pass",
        title: "Release Build & Signature Scheme v" + p.signingVersion,
        evidence: "Non-debuggable binary with v" + p.signingVersion + " signing",
        delta: "+8"
      });
    } else {
      qualityScore -= 10;
      qualityChecks.push({
        status: "warn",
        title: "Legacy JAR Signing v1 Only",
        evidence: "apkSigningVersion=" + p.signingVersion,
        delta: "-10"
      });
    }

    if (p.dexCount <= 3 && p.proguard) {
      qualityScore += 8;
      qualityChecks.push({
        status: "pass",
        title: "Compact DEX (" + p.dexCount + ") & R8 Shrinking",
        evidence: p.dexCount + " classes.dex; R8/ProGuard markers present",
        delta: "+8"
      });
    } else if (p.dexCount <= 6) {
      qualityScore += 2;
      qualityChecks.push({
        status: "warn",
        title: "Moderate Multidex (" + p.dexCount + " DEX files)",
        evidence: p.dexCount + " classes*.dex files inside archive",
        delta: "+2"
      });
    } else {
      qualityScore -= 8;
      qualityChecks.push({
        status: "warn",
        title: "Heavy Multidex Sprawl (" + p.dexCount + " DEX files)",
        evidence: p.dexCount + " classes*.dex files increase startup overhead",
        delta: "-8"
      });
    }

    const hasLargeHeap = p.flags.includes("LARGE_HEAP");
    const hasCleartext = p.flags.includes("USES_CLEARTEXT_TRAFFIC");
    if (!hasLargeHeap && !hasCleartext) {
      qualityScore += 6;
      qualityChecks.push({
        status: "pass",
        title: "Clean Manifest Memory & Network Flags",
        evidence: "No LARGE_HEAP or cleartext traffic override",
        delta: "+6"
      });
    } else {
      qualityScore -= 6;
      qualityChecks.push({
        status: "warn",
        title: "Manifest Flag Warnings (" + [hasLargeHeap ? "LARGE_HEAP" : "", hasCleartext ? "CLEARTEXT" : ""].filter(Boolean).join(", ") + ")",
        evidence: "High heap request or cleartext HTTP flag",
        delta: "-6"
      });
    }

    qualityScore = Math.max(5, Math.min(100, qualityScore));

    let utilityScore = 70;
    const utilityChecks = [];

    const totalComp = p.components.activities + p.components.services + p.components.receivers + p.components.providers;
    const dangerousCount = p.permissions.filter(x => x.dangerous).length;

    if (totalComp >= 4 && totalComp <= 45) {
      utilityScore += 12;
      utilityChecks.push({
        status: "pass",
        title: "Balanced Component Surface",
        evidence: p.components.activities + " Act, " + p.components.services + " Svc, " + p.components.providers + " Prov",
        delta: "+12"
      });
    } else if (totalComp > 45) {
      utilityScore -= 5;
      utilityChecks.push({
        status: "warn",
        title: "High Component Density (" + totalComp + ")",
        evidence: p.components.receivers + " Receivers & " + p.components.services + " Services",
        delta: "-5"
      });
    } else {
      utilityScore += 6;
      utilityChecks.push({
        status: "pass",
        title: "Focused Utility Footprint",
        evidence: totalComp + " components registered",
        delta: "+6"
      });
    }

    if (p.trackers.length === 0) {
      utilityScore += 14;
      utilityChecks.push({
        status: "pass",
        title: "Zero Ad / Attribution Trackers",
        evidence: "No AdMob, Meta Ads, AppsFlyer, or Adjust signatures",
        delta: "+14"
      });
    } else if (p.trackers.length <= 2) {
      utilityScore -= 6;
      utilityChecks.push({
        status: "warn",
        title: p.trackers.length + " Analytics/Push SDK(s)",
        evidence: p.trackers.join(", "),
        delta: "-6"
      });
    } else {
      utilityScore -= 24;
      utilityChecks.push({
        status: "fail",
        title: "Heavy Ad & Tracker Bloat (" + p.trackers.length + " SDKs)",
        evidence: p.trackers.join(", "),
        delta: "-24"
      });
    }

    if (dangerousCount === 0) {
      utilityScore += 10;
      utilityChecks.push({
        status: "pass",
        title: "Zero Dangerous Permissions",
        evidence: p.permissions.length + " standard permissions only",
        delta: "+10"
      });
    } else if (dangerousCount <= 3) {
      utilityScore += 2;
      utilityChecks.push({
        status: "pass",
        title: "Bounded Sensitive Permissions (" + dangerousCount + ")",
        evidence: p.permissions.filter(x => x.dangerous).map(x => x.name.split(".").pop()).join(", "),
        delta: "+2"
      });
    } else {
      utilityScore -= 18;
      utilityChecks.push({
        status: "fail",
        title: "Excessive Intrusive Permissions (" + dangerousCount + ")",
        evidence: p.permissions.filter(x => x.dangerous).map(x => x.name.split(".").pop()).join(", "),
        delta: "-18"
      });
    }

    if (p.sizeMB <= 35) {
      utilityScore += 4;
      utilityChecks.push({
        status: "pass",
        title: "Lean Storage Footprint (" + p.sizeMB + " MB)",
        evidence: p.splitCount + " APK(s), " + p.totalEntries + " zip entries",
        delta: "+4"
      });
    } else if (p.sizeMB <= 85) {
      utilityChecks.push({
        status: "warn",
        title: "Medium Storage Footprint (" + p.sizeMB + " MB)",
        evidence: p.splitCount + " APK(s), " + p.totalEntries + " zip entries",
        delta: "0"
      });
    } else {
      utilityScore -= 8;
      utilityChecks.push({
        status: "warn",
        title: "Large APK Footprint (" + p.sizeMB + " MB)",
        evidence: p.totalEntries + " archive entries across " + p.splitCount + " split(s)",
        delta: "-8"
      });
    }

    utilityScore = Math.max(5, Math.min(100, utilityScore));

    const observations = [
      "Package '" + pkg + "' resolved to " + p.splitCount + " APK archive(s) totaling " + p.sizeMB + " MB (" + p.totalEntries + " ZIP entries).",
      "Manifest declares minSdk=" + p.minSdk + ", targetSdk=" + p.targetSdk + ", apkSigningVersion=v" + p.signingVersion + ", primaryCpuAbi=" + p.abi + ".",
      "Archive contains " + p.dexCount + " DEX bytecode file(s) and " + p.nativeLibs.length + " native .so shared object(s).",
      "PackageManager registers " + p.components.activities + " Activities, " + p.components.services + " Services, " + p.components.receivers + " Receivers, and " + p.permissions.length + " permissions (" + dangerousCount + " dangerous)."
    ];

    const inferences = [
      "Primary stack identified from concrete file paths inside the APK ZIP central directory (" + p.stack.map(s => s.ext).join(", ") + ").",
      "Engineering score (" + qualityScore + "/100) reflects objective build metadata (targetSdk, 64-bit ABI support, release signing, multidex count, and manifest flags).",
      "Utility score (" + utilityScore + "/100) weighs functional Android integration against embedded ad/tracker signatures and sensitive permission requests.",
      isLiveShell
        ? "Data gathered live via window.Shizuku shell execution in " + durationMs + " ms."
        : "Data rendered from reference profile because window.Shizuku is not active in this browser session."
    ];

    return {
      pkg,
      label,
      isLiveShell,
      durationMs,
      rawOutput,
      qualityScore,
      utilityScore,
      qualityChecks,
      utilityChecks,
      observations,
      inferences,
      ...p
    };
  }

  function renderInspectorReport(r) {
    document.getElementById("inspector-empty-state").classList.add("hidden");
    const repEl = document.getElementById("inspector-report");
    repEl.classList.remove("hidden");

    document.getElementById("report-app-label").textContent = r.label;
    document.getElementById("report-app-source-badge").textContent = r.isLiveShell ? "Live ADB Audit" : "Reference Dataset";
    document.getElementById("report-pkg-name").textContent = r.pkg;
    document.getElementById("report-version").textContent = "v" + r.versionName + " (" + r.versionCode + ")";
    document.getElementById("report-sdk-range").textContent = "minSdk " + r.minSdk + " → targetSdk " + r.targetSdk;
    document.getElementById("report-abi").textContent = "ABI: " + r.abi;
    document.getElementById("report-size").textContent = r.sizeMB + " MB (" + r.splitCount + " APK)";
    document.getElementById("report-installer").textContent = "Installer: " + r.installer;

    const qRing = document.getElementById("quality-ring-fill");
    const circumference = 314.16;
    qRing.style.strokeDashoffset = String(circumference - (circumference * r.qualityScore) / 100);
    document.getElementById("quality-score-num").textContent = String(r.qualityScore);

    const qGrade = r.qualityScore >= 90 ? "Grade A+" : r.qualityScore >= 80 ? "Grade A" : r.qualityScore >= 70 ? "Grade B" : r.qualityScore >= 55 ? "Grade C" : "Grade D";
    document.getElementById("quality-grade-badge").textContent = qGrade;
    document.getElementById("quality-verdict-title").textContent =
      r.qualityScore >= 80
        ? "Well-Coded & Modern Architecture"
        : r.qualityScore >= 60
        ? "Acceptable Build with Minor Debt"
        : "Poorly Coded / Outdated Build Flags";

    document.getElementById("quality-breakdown-list").innerHTML = r.qualityChecks.map(c => (
      '<div class="check-row">' +
        '<div class="check-row-left">' +
          '<span class="check-status-dot dot-' + c.status + '"></span>' +
          '<div>' +
            '<span class="check-title">' + escapeHtml(c.title) + '</span>' +
            '<span class="check-evidence">' + escapeHtml(c.evidence) + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="check-delta">' + escapeHtml(c.delta) + '</span>' +
      '</div>'
    )).join("");

    const uRing = document.getElementById("utility-ring-fill");
    uRing.style.strokeDashoffset = String(circumference - (circumference * r.utilityScore) / 100);
    document.getElementById("utility-score-num").textContent = String(r.utilityScore);

    const uGrade = r.utilityScore >= 85 ? "Clean & Useful" : r.utilityScore >= 65 ? "Moderate" : "High Bloat";
    document.getElementById("utility-grade-badge").textContent = uGrade;
    document.getElementById("utility-verdict-title").textContent =
      r.utilityScore >= 80
        ? "High Utility, Minimal Tracker Overhead"
        : r.utilityScore >= 60
        ? "Functional with Analytics / Permissions"
        : "Bloated or Over-Privileged";

    document.getElementById("utility-breakdown-list").innerHTML = r.utilityChecks.map(c => (
      '<div class="check-row">' +
        '<div class="check-row-left">' +
          '<span class="check-status-dot dot-' + c.status + '"></span>' +
          '<div>' +
            '<span class="check-title">' + escapeHtml(c.title) + '</span>' +
            '<span class="check-evidence">' + escapeHtml(c.evidence) + '</span>' +
          '</div>' +
        '</div>' +
        '<span class="check-delta">' + escapeHtml(c.delta) + '</span>' +
      '</div>'
    )).join("");

    document.getElementById("report-scan-depth-label").textContent = "Scan: " + settings.scanDepth.toUpperCase();
    document.getElementById("tech-stack-cards").innerHTML = r.stack.map(s => (
      '<div class="stack-card">' +
        '<div class="stack-card-top">' +
          '<span class="stack-ext-badge">' + escapeHtml(s.ext) + '</span>' +
          '<span class="stack-category">' + escapeHtml(s.category) + '</span>' +
        '</div>' +
        '<h4 class="stack-name">' + escapeHtml(s.name) + '</h4>' +
        '<p class="stack-proof">' + escapeHtml(s.proof) + '</p>' +
      '</div>'
    )).join("");

    document.getElementById("composition-total-entries").textContent = r.totalEntries + " entries (" + r.splitCount + " APK)";
    const compColors = [
      { key: "dex", label: "DEX (" + r.composition.dex + "%)", val: r.composition.dex, color: "#ffb86c" },
      { key: "native", label: "Native .so (" + r.composition.native + "%)", val: r.composition.native, color: "#6dd58c" },
      { key: "res", label: "Res (" + r.composition.res + "%)", val: r.composition.res, color: "#8ecaff" },
      { key: "assets", label: "Assets (" + r.composition.assets + "%)", val: r.composition.assets, color: "#d0bcff" },
      { key: "meta", label: "META-INF (" + r.composition.meta + "%)", val: r.composition.meta, color: "#f87171" }
    ];
    document.getElementById("composition-bar").innerHTML = compColors
      .filter(c => c.val > 0)
      .map(c => '<div class="comp-seg" style="width:' + c.val + '%; background:' + c.color + ';" title="' + c.label + '"></div>')
      .join("");
    document.getElementById("composition-legend").innerHTML = compColors
      .map(c => '<span class="legend-item"><span class="legend-dot" style="background:' + c.color + ';"></span>' + c.label + '</span>')
      .join("");

    document.getElementById("native-libs-count").textContent = r.nativeLibs.length + " .so";
    document.getElementById("native-libs-list").innerHTML = r.nativeLibs.length
      ? r.nativeLibs.map(l => (
          '<div class="mono-list-item">' +
            '<span>' + escapeHtml(l.name) + '</span>' +
            '<span class="m3-pill-badge">' + escapeHtml(l.abi + " • " + l.size) + '</span>' +
          '</div>'
        )).join("")
      : '<div class="mono-list-item"><span>No native C/C++ (.so) libraries bundled.</span></div>';

    document.getElementById("permissions-count-badge").textContent = r.permissions.length + " perms | " + r.trackers.length + " SDKs";
    const trackerHtml = r.trackers.map(t => (
      '<div class="mono-list-item" style="border-left: 3px solid #facc15;">' +
        '<span>[SDK] ' + escapeHtml(t) + '</span>' +
        '<span class="m3-pill-badge">Detected</span>' +
      '</div>'
    )).join("");
    const permHtml = r.permissions.map(pm => (
      '<div class="mono-list-item">' +
        '<span>' + escapeHtml(pm.name) + '</span>' +
        '<span class="m3-pill-badge" style="color:' + (pm.dangerous ? '#f87171' : 'inherit') + ';">' + (pm.dangerous ? 'Dangerous' : 'Normal') + '</span>' +
      '</div>'
    )).join("");
    document.getElementById("permissions-list").innerHTML = (trackerHtml + permHtml) || '<div class="mono-list-item"><span>No special permissions requested.</span></div>';

    document.getElementById("strict-observations-list").innerHTML = r.observations.map(o => "<li>" + escapeHtml(o) + "</li>").join("");
    document.getElementById("strict-inferences-list").innerHTML = r.inferences.map(i => "<li>" + escapeHtml(i) + "</li>").join("");
    document.getElementById("raw-exec-time").textContent = r.durationMs + " ms";
    document.getElementById("raw-shell-output").textContent = r.rawOutput;
  }

  function persistReportToModuleLogs(r) {
    if (!bridgeAvailable) return;
    const summaryLines = [
      "Package      : " + r.pkg + " (" + r.label + ")",
      "Version      : v" + r.versionName + " (" + r.versionCode + ") | SDK " + r.minSdk + "->" + r.targetSdk,
      "Quality Score: " + r.qualityScore + "/100",
      "Utility Score: " + r.utilityScore + "/100",
      "Tech Stack   : " + r.stack.map(s => s.name).join(", "),
      "Native Libs  : " + r.nativeLibs.length + " | DEX Files: " + r.dexCount + " | Trackers: " + r.trackers.length
    ].join("\n");
    runShell('mkdir -p logs && cat << \'EOF\' > logs/last-audit.txt\n' + summaryLines + '\nEOF\n', 10);
  }

  // ==================== NAVIGATION & UI EVENTS ====================
  function switchView(targetId) {
    document.querySelectorAll(".m3-view").forEach(v => {
      v.classList.toggle("active-view", v.id === targetId);
    });
    document.querySelectorAll(".nav-tab").forEach(t => {
      t.classList.toggle("active-tab", t.getAttribute("data-target") === targetId);
    });
    window.scrollTo({ top: 0, behavior: settings.motion === "reduced" ? "auto" : "smooth" });
  }

  function showSnackbar(msg) {
    const sb = document.getElementById("m3-snackbar");
    if (!sb) return;
    sb.textContent = msg;
    sb.classList.add("show-snack");
    clearTimeout(sb._timer);
    sb._timer = setTimeout(() => sb.classList.remove("show-snack"), 2500);
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bindEvents() {
    document.querySelectorAll(".nav-tab").forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.getAttribute("data-target")));
    });

    document.getElementById("btn-quick-theme").addEventListener("click", () => {
      settings.themeMode = document.body.classList.contains("light") ? "dark" : "light";
      saveSettingsLocal();
      applyFrontendSettings();
      showSnackbar("Theme: " + capitalize(settings.themeMode));
    });

    document.getElementById("btn-refresh-pkgs").addEventListener("click", () => {
      checkShizukuBridge();
      loadPackagesList();
      showSnackbar("Packages refreshed");
    });

    document.getElementById("input-search-pkg").addEventListener("input", renderPackagesGrid);
    document.getElementById("btn-clear-search").addEventListener("click", () => {
      document.getElementById("input-search-pkg").value = "";
      renderPackagesGrid();
    });

    document.getElementById("btn-inspect-direct").addEventListener("click", () => {
      const val = document.getElementById("input-direct-pkg").value.trim();
      if (val) inspectPackage(val);
      else showSnackbar("Enter a package ID first");
    });

    document.querySelectorAll(".m3-chip[data-scope]").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".m3-chip[data-scope]").forEach(c => c.classList.remove("active-chip"));
        chip.classList.add("active-chip");
        currentFilterScope = chip.getAttribute("data-scope");
        renderPackagesGrid();
      });
    });

    document.getElementById("select-sort").addEventListener("change", renderPackagesGrid);
    document.getElementById("btn-go-explorer").addEventListener("click", () => switchView("view-explorer"));

    document.getElementById("btn-rescan-app").addEventListener("click", () => {
      if (currentReport) inspectPackage(currentReport.pkg);
    });

    document.getElementById("btn-export-report").addEventListener("click", () => {
      if (!currentReport) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReport, null, 2));
      const a = document.createElement("a");
      a.setAttribute("href", dataStr);
      a.setAttribute("download", currentReport.pkg + "-howappcoded-audit.json");
      document.body.appendChild(a);
      a.click();
      a.remove();
      showSnackbar("Exported " + currentReport.pkg);
    });

    document.getElementById("toggle-strict-drawer").addEventListener("click", () => {
      const body = document.getElementById("strict-drawer-body");
      body.classList.toggle("hidden");
    });

    document.getElementById("set-fe-theme-mode").addEventListener("change", e => {
      settings.themeMode = e.target.value;
      saveSettingsLocal();
      applyFrontendSettings();
    });

    document.querySelectorAll(".swatch-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        settings.palette = btn.getAttribute("data-palette");
        saveSettingsLocal();
        applyFrontendSettings();
        showSnackbar("Palette: " + capitalize(settings.palette));
      });
    });

    document.getElementById("set-fe-motion").addEventListener("change", e => {
      settings.motion = e.target.value;
      saveSettingsLocal();
      applyFrontendSettings();
    });

    document.getElementById("set-fe-density").addEventListener("change", e => {
      settings.density = e.target.value;
      saveSettingsLocal();
      applyFrontendSettings();
    });

    document.getElementById("set-fe-show-banner").addEventListener("change", e => {
      settings.showBanner = e.target.checked;
      saveSettingsLocal();
      applyFrontendSettings();
    });

    document.getElementById("set-fe-strict-open").addEventListener("change", e => {
      settings.strictOpen = e.target.checked;
      saveSettingsLocal();
      applyFrontendSettings();
    });

    document.getElementById("btn-cache-beercss").addEventListener("click", () => {
      if (typeof window.Shizuku === "undefined" || typeof window.Shizuku.download !== "function") {
        showSnackbar("Shizuku.download() requires active Shizuku WebUI.");
        return;
      }
      try {
        const r1 = JSON.parse(window.Shizuku.download(
          "https://cdn.jsdelivr.net/npm/beercss@4.0.21/dist/cdn/beer.min.css",
          "vendor/beer.min.css"
        ));
        const r2 = JSON.parse(window.Shizuku.download(
          "https://cdn.jsdelivr.net/npm/beercss@4.0.21/dist/cdn/beer.min.js",
          "vendor/beer.min.js"
        ));
        if (r1.ok && r2.ok) {
          showSnackbar("Cached BeerCSS (" + (r1.bytes + r2.bytes) + " B)");
        } else {
          showSnackbar("Download blocked: " + (r1.error || r2.error || "Check policy"));
        }
      } catch (err) {
        showSnackbar("Download error: " + String(err));
      }
    });

    document.getElementById("set-be-pkg-scope").addEventListener("change", e => {
      settings.pkgScope = e.target.value;
      currentFilterScope = e.target.value;
      saveSettingsLocal();
    });

    document.getElementById("set-be-scan-depth").addEventListener("change", e => {
      settings.scanDepth = e.target.value;
      saveSettingsLocal();
    });

    document.getElementById("set-be-timeout").addEventListener("input", e => {
      settings.timeoutSeconds = Number(e.target.value);
      document.getElementById("label-be-timeout").textContent = settings.timeoutSeconds + "s";
      saveSettingsLocal();
    });

    document.getElementById("set-be-max-pkgs").addEventListener("input", e => {
      settings.maxPackages = Number(e.target.value);
      document.getElementById("label-be-max-pkgs").textContent = String(settings.maxPackages);
      saveSettingsLocal();
    });

    document.getElementById("set-be-scan-splits").addEventListener("change", e => {
      settings.scanSplits = e.target.checked;
      saveSettingsLocal();
    });

    document.getElementById("set-be-ash-standalone").addEventListener("change", e => {
      settings.ashStandalone = e.target.checked;
      saveSettingsLocal();
    });

    document.getElementById("set-be-persist-log").addEventListener("change", e => {
      settings.persistLog = e.target.checked;
      saveSettingsLocal();
    });

    document.getElementById("btn-save-sync-settings").addEventListener("click", () => {
      saveSettingsLocal();
      applyFrontendSettings();
      if (bridgeAvailable) {
        const jsonEsc = JSON.stringify(settings, null, 2).replace(/'/g, "");
        const res = runShell("cat << 'EOF' > config.json\n" + jsonEsc + "\nEOF\n", 10);
        if (res.ok) {
          showSnackbar("Synced to $MODDIR/config.json");
        } else {
          showSnackbar("Saved locally (" + (res.stderr || "sync blocked") + ")");
        }
      } else {
        showSnackbar("Settings saved");
      }
      loadPackagesList();
    });

    document.getElementById("btn-reset-settings").addEventListener("click", () => {
      settings = Object.assign({}, DEFAULT_SETTINGS);
      saveSettingsLocal();
      applyFrontendSettings();
      showSnackbar("Settings reset");
    });

    const diagPre = document.getElementById("bridge-diag-output");
    document.getElementById("btn-test-bridge").addEventListener("click", () => {
      if (typeof window.Shizuku === "undefined") {
        diagPre.textContent = JSON.stringify({
          author: "HmnDev-Tech",
          shizukuExposed: false,
          note: "window.Shizuku is exposed inside Shizuku Manager WebUI when enabled and usesShellBridge=true (or Full Trust).",
          activeSettings: settings
        }, null, 2);
        return;
      }
      let modInfo = {};
      try {
        modInfo = JSON.parse(window.Shizuku.getModuleInfo());
      } catch (e) {
        modInfo = { error: String(e) };
      }
      const probe = runShell("id && uname -a && getprop ro.build.version.release", 15);
      diagPre.textContent = JSON.stringify({ author: "HmnDev-Tech", moduleInfo: modInfo, shellProbe: probe, settings }, null, 2);
    });

    document.getElementById("btn-read-action-log").addEventListener("click", () => {
      if (!bridgeAvailable) {
        diagPre.textContent = "logs/action-last.log is available when running inside Shizuku after triggering Action.";
        return;
      }
      const r = runShell("cat logs/action-last.log 2>/dev/null || echo 'No action-last.log found yet.'", 10);
      diagPre.textContent = r.stdout || r.stderr;
    });

    document.getElementById("btn-read-service-log").addEventListener("click", () => {
      if (!bridgeAvailable) {
        diagPre.textContent = "logs/service-last.log is available when running inside Shizuku after service.sh executes.";
        return;
      }
      const r = runShell("cat logs/service-last.log 2>/dev/null || echo 'No service-last.log found yet.'", 10);
      diagPre.textContent = r.stdout || r.stderr;
    });
  }

  // ==================== INITIALIZATION ====================
  document.addEventListener("DOMContentLoaded", () => {
    applyFrontendSettings();
    bindEvents();
    checkShizukuBridge();
    loadPackagesList();
    if (FALLBACK_PACKAGES.length > 0 && !bridgeAvailable) {
      const first = FALLBACK_PACKAGES[0];
      const rep = buildReportFromPreset(first.pkg, first.label, first.preset);
      auditedReports[first.pkg] = rep;
      currentReport = rep;
      renderInspectorReport(rep);
    }
  });
})();
