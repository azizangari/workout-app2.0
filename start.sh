#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
PORT="${PORT:-8080}"

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
if [[ -z "$IP" ]]; then
  IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
fi
if [[ -z "$IP" ]]; then
  IP="127.0.0.1"
  echo "Warning: could not detect Wi‑Fi IP. Phone access may not work until you connect to Wi‑Fi."
fi

echo ""
echo "Workout Tracker"
echo "==============="
echo "On this Mac:    http://127.0.0.1:${PORT}"
echo "On your phone:  http://${IP}:${PORT}"
echo ""
echo "• Phone must be on the same Wi‑Fi as this Mac"
echo "• If the page won't load, allow incoming connections in"
echo "  System Settings → Network → Firewall"
echo ""
echo "Press Ctrl+C to stop"
echo ""

if python3 -c "import http.server" 2>/dev/null; then
  exec python3 -m http.server "$PORT" --bind 0.0.0.0
fi

exec ruby -run -ehttpd . -p"$PORT" -b0.0.0.0
