# 🎵 VietUniverse Music Bot

**Bot phát nhạc Discord cho cộng đồng Việt** — discord.js v14 + Lavalink v4, chạy 24/7 trên GitHub Actions, VPS, Docker hoặc Fly.io.

<p>
  <img alt="Node" src="https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white">
  <img alt="discord.js" src="https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white">
  <img alt="Lavalink" src="https://img.shields.io/badge/Lavalink-v4-FF6600">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green">
</p>

---

## ✨ Giới thiệu

Một bot nhạc "đủ dùng cho cộng đồng" nhưng được xử lý đến nơi đến chốn:

- **23 lệnh slash** đầy đủ: phát, tìm kiếm, hàng đợi, tua, bộ lọc, lời bài hát…
- **Bảng điều khiển ngay trong chat voice channel** — bấm nút không cần gõ lệnh
- **Không chết khi lỗi nguồn**: tự chuyển YouTube → SoundCloud → Deezer
- **Sống sót qua restart**: nhớ 247, bài đang phát và vị trí, tự vào lại kênh
- **Tự phục hồi**: bot crash tự chạy lại, Lavalink chết tự bật lại, workflow bị tắt tự bật lại
- **Chạy đa bot**: một workflow, nhiều token, mỗi bot một concurrency group riêng

---

## 🚀 Tính năng nổi bật

### 🎧 Phát nhạc

| Tính năng | Mô tả |
|---|---|
| Đa nguồn | YouTube, SoundCloud, Deezer, link trực tiếp, playlist |
| Fallback thông minh | Nguồn lỗi → tự tìm nguồn khác và phát tiếp, không dừng nhạc |
| Playlist | Tôn trọng đúng thứ tự, tối đa 200 bài/lần, không tự xáo |
| Chống kẹt | Bài stuck/lỗi → tự skip sau ngưỡng 15 giây |
| Autoplay | Hết hàng đợi → tự tìm bài liên quan và phát tiếp |

### 🎛 Điều khiển

- **Bảng điều khiển trong voice chat** (2 hàng nút): ⏯ ⏭ ⏹ 🔀 🔁 · `-10s` `+10s` ⏱️ Tua · 📜 Hàng đợi
- **Tua chính xác**: bấm ⏱️ → nhập `1:30` hoặc `90` → nhảy đúng vị trí
- **Thanh tiến trình realtime**: cập nhật mỗi 3 giây, kèm trạng thái pause/loop
- **Tự rời kênh** sau 60 giây nếu phòng trống (trừ khi bật 247)

### ♾ 24/7 thực sự

- `/247` giữ bot trong kênh dù không còn ai
- Trạng thái được lưu vào `state/<bot>.json` **qua GitHub API**
- Restart xong → tự vào lại voice, phát tiếp từ đúng giây đang dở, khôi phục 10 bài kế

### 🛡 Độ bền vận hành

| Cơ chế | Tác dụng |
|---|---|
| Supervisor (`scripts/run.sh`) | Bot thoát → tự chạy lại sau 5 giây |
| Watchdog Lavalink | Node nhạc chết → tự khởi động lại |
| Health-check `/health` | Trả JSON trạng thái cho uptime monitor |
| Keepalive workflow | Bật lại workflow bị GitHub tắt, commit nhịp tim, tự dispatch khi bot chết |
| Fallback node | Node chính lỗi → tự chuyển node dự phòng |

---

## 📜 Danh sách lệnh (23)

### Phát nhạc
| Lệnh | Chức năng |
|---|---|
| `/play <từ khoá \| URL>` | Phát hoặc thêm vào hàng đợi |
| `/search <từ khoá>` | Tìm 10 kết quả, chọn bằng menu |
| `/lyrics` | Lời bài hát đang phát |

### Điều khiển
| Lệnh | Chức năng |
|---|---|
| `/pause` · `/resume` | Tạm dừng / tiếp tục |
| `/skip [số]` | Bỏ qua 1 hoặc nhiều bài |
| `/stop` | Dừng và rời voice |
| `/seek <mm:ss>` | Tua tới vị trí |
| `/replay` | Phát lại từ đầu |
| `/volume <1-200>` | Chỉnh âm lượng |

### Hàng đợi
| Lệnh | Chức năng |
|---|---|
| `/queue [trang]` | Xem hàng đợi (10 bài/trang) |
| `/shuffle` | Xáo trộn |
| `/remove <vị trí>` | Xoá một bài |
| `/move <từ> <tới>` | Đổi vị trí |
| `/clear` | Xoá toàn bộ hàng đợi |

### Chế độ
| Lệnh | Chức năng |
|---|---|
| `/loop <off\|track\|queue>` | Lặp bài / cả hàng đợi |
| `/filter <preset>` | Bassboost · Nightcore · Vaporwave · 8D · Rock · Pop · Classic |
| `/247` | Giữ bot trong kênh 24/7 |
| `/autoplay` | Tự phát bài liên quan |

### Hệ thống
| Lệnh | Chức năng |
|---|---|
| `/nowplaying` | Bài đang phát + bảng điều khiển |
| `/ping` | Độ trễ bot và node nhạc |
| `/debug` | Thông tin kỹ thuật chi tiết |
| `/help` | Danh sách lệnh |

---

## 🏗 Kiến trúc

```
┌──────────┐   slash command    ┌──────────────────┐
│ Discord  │ ─────────────────► │  Bot (discord.js)│
│  User    │ ◄───────────────── │   Node 22        │
└──────────┘   embed + button   └────────┬─────────┘
                                          │ Lavalink protocol (WS)
                                          ▼
                                 ┌──────────────────┐
                                 │ Lavalink v4 node │
                                 │  (công khai)     │
                                 └────────┬─────────┘
                                          │ Opus audio
                                          ▼
                                   Discord Voice

          Bot ──► GitHub Contents API ──► state/<bot>.json
                 (lưu 247 + bài đang phát + vị trí)
```

---

## ⚙️ Cài đặt

### 1. Tạo bot Discord

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. **Bot** → **Reset Token** → copy
3. **OAuth2 → URL Generator**: scopes `bot` + `applications.commands`
   Permissions: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Use Slash Commands`
4. Mời bot vào server

### 2. Thêm Secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Trạng thái | Ghi chú |
|---|---|---|
| `DISCORD_TOKEN_2` | ✅ bắt buộc | token bot 2 |
| `DISCORD_TOKEN_3` | ✅ bắt buộc | token bot 3 |
| `LAVALINK_PASSWORD` | ⚪ tuỳ chọn | chỉ dùng khi tự host Lavalink |
| `DISCORD_TOKEN` | ⛔ không dùng | bot 1 đã tắt |

### 3. Chạy

**Actions → Music Bot → Run workflow**

---

## 🖥 Triển khai

### GitHub Actions (miễn phí, đang dùng)

- Cron mỗi 5 giờ, job tối đa 5h50
- Không dùng chung concurrency group giữa các bot
- `state/` được commit lại sau mỗi lần lưu

### Docker Compose (VPS — khuyến nghị nếu cần ổn định)

```bash
cp .env.example .env      # điền DISCORD_TOKEN + LAVALINK_PASSWORD
docker compose up -d --build
docker compose logs -f bot
```

### Docker đơn lẻ

```bash
docker build -t music-bot .
docker run -d --restart unless-stopped \
  -e DISCORD_TOKEN=xxx -e LAVALINK_PASSWORD=yyy \
  -p 8080:8080 music-bot
```

### Fly.io

```bash
fly launch --no-deploy
fly secrets set DISCORD_TOKEN=xxx LAVALINK_PASSWORD=yyy
fly deploy
```

### Chạy trực tiếp (Java 17 + Node 20+)

```bash
npm install
java -jar Lavalink.jar &
npm start
```

---

## 🔧 Xử lý sự cố

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| **"Lệnh đã hết hạn"** | Interaction quá 3 giây (bot restart/chậm) | Đã sửa: defer ngay đầu lệnh. Vẫn gặp khi đúng lúc restart |
| **Bật 247 mà bot vẫn out** | Timer rời treo + thư viện auto-destroy | Đã sửa: huỷ timer + bỏ `destroyAfterMs` |
| **Phát khác playlist** | Link là YouTube Mix (`list=RD`) — YouTube đổi mỗi lần mở | Bấm **Lưu** trong Mix để tạo `list=PL…` rồi dùng link đó |
| **Nhạc lag, rè** | Node công khai quá tải + runner ở US/EU | Dùng VPS gần VN, hoặc đổi node |
| **Actions tự tắt** | 60 ngày không commit / vi phạm ToS | `keepalive.yml` bật lại mỗi ngày; lâu dài nên chuyển VPS |
| **Bot không vào lại kênh sau restart** | Chưa bật `/247` hoặc chưa có state | Bật `/247` một lần, kiểm tra `state/*.json` |

---

## 📁 Cấu trúc dự án

```
bot.js                      # toàn bộ logic bot (23 lệnh, panel, state)
application.yml             # cấu hình Lavalink
scripts/run.sh              # supervisor: auto-restart bot + Lavalink
state/                      # trạng thái bền (bot tự commit)
.github/workflows/
  ├── bot.yml               # chạy bot (matrix nhiều token)
  └── keepalive.yml         # chống GitHub tắt workflow
Dockerfile
docker-compose.yml
fly.toml
.env.example
```

---

## ⚠️ Giới hạn đã biết

- **GitHub Actions**: job tối đa 6 giờ, cron có thể trễ 10–30 phút; host dịch vụ 24/7 **không nằm trong mục đích của Actions** nên có rủi ro bị tắt.
- **Node công khai**: miễn phí nhưng chất lượng phụ thuộc bên thứ ba, có thể quá tải hoặc chết bất cứ lúc nào.
- **Voice chất lượng cao** cần node riêng (VPS) ở gần khu vực người dùng.

---

## 🔒 Bảo mật

- Không commit token. `.env` đã nằm trong `.gitignore`.
- `GITHUB_TOKEN` chỉ có hiệu lực trong job đang chạy, dùng để ghi `state/`.
- Token YouTube POT từng bị lộ trong repo cũ đã được xoá — nếu token Discord từng bị commit, hãy **Reset Token** ngay.

---

## 📄 Giấy phép

MIT — dùng, sửa, chia sẻ tự do.

> Dự án tham khảo ý tưởng từ cộng đồng Lavalink và lavalink-client.
