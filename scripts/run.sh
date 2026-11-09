#!/usr/bin/env bash
# Supervisor: giữ Lavalink + bot luôn sống trong suốt thời gian job chạy.
# Bot thoát → tự khởi động lại. Lavalink chết → tự bật lại.
set -uo pipefail

LAVALINK_PID=""
LOCAL="${USE_LOCAL_LAVALINK:-0}"

log() { echo "[supervisor] $*"; }

start_lavalink() {
  [ "$LOCAL" = "1" ] || return 0
  if [ ! -f Lavalink.jar ]; then
    log "không có Lavalink.jar — bỏ qua node cục bộ"
    return 1
  fi
  log "khởi động Lavalink..."
  java -jar Lavalink.jar > lavalink.log 2>&1 &
  LAVALINK_PID=$!
  for i in $(seq 1 120); do
    if curl -fsS "http://127.0.0.1:${LAVALINK_PORT:-2333}/version" >/dev/null 2>&1; then
      log "Lavalink sẵn sàng sau ${i}s (pid $LAVALINK_PID)"
      return 0
    fi
    if ! kill -0 "$LAVALINK_PID" 2>/dev/null; then
      log "Lavalink thoát sớm — xem lavalink.log"
      tail -n 40 lavalink.log || true
      LAVALINK_PID=""
      return 1
    fi
    sleep 1
  done
  log "Lavalink quá 120s chưa sẵn sàng — dùng node công khai"
  return 1
}

watch_lavalink() {
  while true; do
    sleep 30
    if [ -n "$LAVALINK_PID" ] && ! kill -0 "$LAVALINK_PID" 2>/dev/null; then
      log "Lavalink đã chết → khởi động lại"
      start_lavalink || true
    fi
  done
}

start_lavalink || true
[ "$LOCAL" = "1" ] && watch_lavalink &

# ─── Tự dispatch chính mình trước khi hết 6 giờ ─────────────────
# GitHub cron rất hay bị delay/bỏ khi tải cao → job chết mà không ai bật lại.
# Cứ ~5h20m job tự gọi workflow_dispatch để run kế tiếp khởi động và cancel run này.
if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ]; then
  (
    sleep $((5 * 3600 + 20 * 60))
    echo "[supervisor] tự dispatch run kế tiếp..."
    curl -fsS -X POST \
      -H "Authorization: Bearer ${GITHUB_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/${GITHUB_REPOSITORY}/actions/workflows/bot.yml/dispatches" \
      -d '{"ref":"master"}' \
      && echo "[supervisor] đã dispatch" \
      || echo "[supervisor] dispatch thất bại"
  ) &
fi


ATTEMPT=0
while true; do
  ATTEMPT=$((ATTEMPT + 1))
  log "chạy bot (lần $ATTEMPT)..."
  node --max-old-space-size=1024 bot.js
  CODE=$?
  log "bot thoát với mã $CODE — khởi động lại sau 5s"
  sleep 5
done
