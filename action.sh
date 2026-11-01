#!/system/bin/sh
# HowAppCoded? by HmnDev-Tech — Manual Action Script for Shizuku ADB Modules API
MODDIR="${MODDIR:-$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)}"
mkdir -p "$MODDIR/logs" "$MODDIR/cache"

echo "================================================"
echo "  HowAppCoded? v1.1.0 by HmnDev-Tech"
echo "================================================"
echo "Module ID   : ${SHIZUKU_MODULE_ID:-how-app-coded}"
echo "Access Mode : ${SHIZUKU_MODULE_MODE:-unknown}"
echo "Background  : ${SHIZUKU_MODULE_BACKGROUND:-0}"
echo "Identity    : $(id)"
echo "Android SDK : $(getprop ro.build.version.sdk 2>/dev/null || echo unknown) (Release $(getprop ro.build.version.release 2>/dev/null || echo unknown))"
echo "Device ABI  : $(getprop ro.product.cpu.abi 2>/dev/null || echo unknown)"
echo "------------------------------------------------"

USER_COUNT=$(cmd package list packages -3 2>/dev/null | wc -l | tr -d ' ')
SYS_COUNT=$(cmd package list packages -s 2>/dev/null | wc -l | tr -d ' ')
echo "Installed Packages: ${USER_COUNT} user (3rd-party) | ${SYS_COUNT} system"
echo ""

if [ -f "$MODDIR/logs/last-audit.txt" ]; then
  echo ">>> Latest WebUI Inspected App Report <<<"
  cat "$MODDIR/logs/last-audit.txt"
  echo "------------------------------------------------"
fi

echo ">>> Quick CLI Tech-Stack Spot Check (Top 5 User Apps) <<<"
cmd package list packages -3 2>/dev/null | sed 's/^package://' | sort | head -n 5 | while read -r pkg; do
  [ -z "$pkg" ] && continue
  APK_PATH=$(pm path "$pkg" 2>/dev/null | head -n 1 | sed 's/^package://')
  DUMP=$(dumpsys package "$pkg" 2>/dev/null)
  TSDK=$(echo "$DUMP" | grep -m1 "targetSdk=" | sed 's/.*targetSdk=\([0-9]*\).*/\1/')
  VNAME=$(echo "$DUMP" | grep -m1 "versionName=" | sed 's/.*versionName=\([^ ]*\).*/\1/')
  STACK=""
  if [ -n "$APK_PATH" ] && [ -r "$APK_PATH" ]; then
    LIST=$(unzip -l "$APK_PATH" 2>/dev/null)
    echo "$LIST" | grep -q "libflutter.so\|flutter_assets" && STACK="${STACK}Flutter "
    echo "$LIST" | grep -q "libreactnativejni.so\|libhermes.so\|index.android.bundle" && STACK="${STACK}ReactNative "
    echo "$LIST" | grep -q "libunity.so\|libil2cpp.so" && STACK="${STACK}Unity "
    echo "$LIST" | grep -q "kotlin/\|\\.kotlin_module" && STACK="${STACK}Kotlin "
    echo "$LIST" | grep -q "androidx\\.compose" && STACK="${STACK}Compose "
    echo "$LIST" | grep -q "lib/.*/.*\\.so" && STACK="${STACK}NativeNDK(.so) "
    echo "$LIST" | grep -q "classes\\.dex" && STACK="${STACK}Java/DEX "
  fi
  [ -z "$STACK" ] && STACK="Standard Android APK"
  echo "• $pkg (v${VNAME:-?}, targetSdk=${TSDK:-?})"
  echo "  Stack: $STACK"
done

echo "------------------------------------------------"
echo "Created by HmnDev-Tech • Open WebUI for full analysis."
