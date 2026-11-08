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

ATTEMPT=0
while true; do
  ATTEMPT=$((ATTEMPT + 1))
  log "chạy bot (lần $ATTEMPT)..."
  node --max-old-space-size=1024 bot.js
  CODE=$?
  log "bot thoát với mã $CODE — khởi động lại sau 5s"
  sleep 5
done
