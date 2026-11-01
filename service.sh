#!/system/bin/sh
# HowAppCoded? by HmnDev-Tech — Background Session Hook for Shizuku ADB Modules API
MODDIR="${MODDIR:-$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)}"
mkdir -p "$MODDIR/logs" "$MODDIR/cache"

echo "[HowAppCoded by HmnDev-Tech] Service started at $(date)"
echo "Module=${SHIZUKU_MODULE_ID:-how-app-coded} Mode=${SHIZUKU_MODULE_MODE:-unknown}"

cmd package list packages -3 -f 2>/dev/null > "$MODDIR/cache/packages_3p.txt"
COUNT=$(wc -l < "$MODDIR/cache/packages_3p.txt" 2>/dev/null | tr -d ' ')
echo "[HowAppCoded] Cached ${COUNT:-0} third-party package paths in $MODDIR/cache/packages_3p.txt"
