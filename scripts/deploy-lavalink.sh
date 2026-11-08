#!/usr/bin/env bash
# ============================================================
#  Dựng Lavalink v4 trên VPS Ubuntu (Azure for Students / Oracle / VPS rẻ)
#
#  Dùng:  bash deploy-lavalink.sh <mat-khau>
#  Ví dụ: bash deploy-lavalink.sh MatKhau123
#
#  Sau khi chạy, lấy IP in ra và điền 4 secret vào GitHub:
#    LAVALINK_HOST     = IP
#    LAVALINK_PORT     = 2333
#    LAVALINK_PASSWORD = mat-khau
#    LAVALINK_SECURE   = 0
# ============================================================
set -euo pipefail

PASSWORD="${1:-}"
if [ -z "$PASSWORD" ]; then
  echo "Thiếu mật khẩu. Dùng: bash deploy-lavalink.sh <mat-khau>"
  exit 1
fi

echo "==> Cài Docker..."
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin curl git

echo "==> Tạo thư mục ~/lavalink"
mkdir -p "$HOME/lavalink/plugins"
cd "$HOME/lavalink"

echo "==> Tải application.yml từ repo"
curl -fsSL -o application.yml \
  https://raw.githubusercontent.com/VietUniverse/music-bot/master/application.yml

echo "==> Đặt mật khẩu"
python3 - "$PASSWORD" <<'PY'
import re, sys, pathlib
pw = sys.argv[1]
p = pathlib.Path("application.yml")
t = p.read_text(encoding="utf-8")
t = re.sub(r'password:\s*\$\{LAVALINK_SERVER_PASSWORD:[^}]*\}', f'password: "{pw}"', t)
p.write_text(t, encoding="utf-8")
print("   ok")
PY

echo "==> docker-compose.yml"
cat > docker-compose.yml <<EOF
services:
  lavalink:
    image: ghcr.io/lavalink-devs/lavalink:4
    container_name: lavalink
    restart: unless-stopped
    environment:
      - _JAVA_OPTIONS=-Xmx1g
      - LAVALINK_SERVER_PASSWORD=${PASSWORD}
    ports:
      - "2333:2333"
    volumes:
      - ./application.yml:/opt/Lavalink/application.yml:ro
      - ./plugins:/opt/Lavalink/plugins
EOF

echo "==> Mở firewall (nếu có ufw)"
sudo ufw allow 2333/tcp 2>/dev/null || true

echo "==> Khởi động"
sudo docker compose up -d

echo "==> Chờ Lavalink..."
for i in $(seq 1 40); do
  if curl -fsS -H "Authorization: $PASSWORD" http://127.0.0.1:2333/version >/dev/null 2>&1; then
    echo "    Lavalink sẵn sàng sau ${i}s"
    break
  fi
  sleep 1
done

IP=$(curl -s --max-time 5 https://ifconfig.me || echo "<IP-VPS>")
echo
echo "================= XONG ================="
echo "LAVALINK_HOST     = $IP"
echo "LAVALINK_PORT     = 2333"
echo "LAVALINK_PASSWORD = $PASSWORD"
echo "LAVALINK_SECURE   = 0"
echo
echo "Kiểm tra từ máy khác:"
echo "  curl -H \"Authorization: $PASSWORD\" http://$IP:2333/version"
echo
echo "Nhớ mở port 2333 ở firewall của cloud (Azure NSG / Oracle Security List)."
