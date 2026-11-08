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

## 🎧 Node nhạc — cách hết lag

Âm thanh đi theo đường: **Bot → Lavalink → Discord Voice**. Lag gần như luôn đến từ Lavalink, không phải từ code.

### Vì sao node công khai bị giật

| Vấn đề | Giải thích |
|---|---|
| Dùng chung IP | Hàng trăm bot khác dùng chung một node → YouTube trả `429` liên tục |
| Quá tải CPU | Node miễn phí chạy quá số player thiết kế → buffer tràn |
| Khoảng cách | Node ở châu Âu/Mỹ, voice server ở Singapore → 200–300ms |
| Không kiểm soát | Node chết/đổi địa chỉ bất cứ lúc nào |

### So sánh lựa chọn

| Phương án | Chi phí | Độ ổn định | Ghi chú |
|---|---|---|---|
| Node công khai (đang dùng) | 0đ | ⭐ | Giật khi đông, không kiểm soát |
| **Oracle Cloud Always Free** | **0đ** | ⭐⭐⭐⭐ | 2 OCPU / 12 GB ARM, chọn region **Singapore** |
| VPS Singapore giá rẻ | ~50–120k/tháng | ⭐⭐⭐⭐⭐ | 1 GB RAM là đủ cho Lavalink |
| Nhà cung cấp Lavalink | từ ~₹29/tháng | ⭐⭐⭐⭐ | VisiHost, Altivora… có node Singapore |

> **Khuyến nghị:** Oracle Cloud Always Free, region Singapore. Miễn phí vĩnh viễn, 2 OCPU/12 GB là quá thừa cho Lavalink (thực tế chỉ cần ~300 MB RAM).

### Sinh viên — không có thẻ tín dụng?

**Azure for Students** là lựa chọn duy nhất đáp ứng cả 2 điều kiện: **miễn phí** và **không cần thẻ**.

| Điều kiện | Chi tiết |
|---|---|
| Credit | **$100** dùng trong 12 tháng |
| Thẻ tín dụng | **Không cần** |
| Xác minh | Email trường (.edu / email đại học) hoặc thẻ sinh viên |
| Gia hạn | Mỗi năm 1 lần khi còn là sinh viên |
| Region | **Southeast Asia (Singapore)** |

VM nhỏ nhất (B1s: 1 vCPU, 1 GB RAM) ≈ **$7,6/tháng** → $100 dùng được **~13 tháng**.

**Các bước:**

1. Vào `azure.microsoft.com/en-us/free/students` → **Start free**
2. Đăng nhập tài khoản Microsoft, xác minh bằng email trường
3. **Create a resource → Virtual machine**:
   - Image: **Ubuntu 22.04 LTS**
   - Size: **B1s** (1 vCPU, 1 GB) — quá đủ cho Lavalink
   - Region: **Southeast Asia**
   - Authentication: SSH public key (tạo mới, tải về)
4. Vào **Networking → Add inbound port rule**: port `2333`, protocol TCP, source Any
5. SSH vào máy và chạy 1 lệnh:

```bash
curl -fsSL https://raw.githubusercontent.com/VietUniverse/music-bot/master/scripts/deploy-lavalink.sh -o deploy.sh
bash deploy.sh MatKhauCuaBan
```

Script sẽ in ra 4 giá trị → dán vào GitHub Secrets là xong.

> Không có email trường? Dùng **GitHub Student Developer Pack** (`education.github.com/pack`) để xác minh bằng ảnh thẻ sinh viên, sau đó lấy Azure for Students.

### Trỏ bot sang node riêng

Chỉ cần thêm 4 secret (Settings → Secrets → Actions):

| Secret | Ví dụ |
|---|---|
| `LAVALINK_HOST` | `140.xx.xx.xx` (IP VPS) hoặc domain |
| `LAVALINK_PORT` | `2333` |
| `LAVALINK_PASSWORD` | mật khẩu bạn đặt trong `application.yml` |
| `LAVALINK_SECURE` | `0` nếu không có SSL, `1` nếu có |

Bot tự dùng node này **trước**, node công khai chỉ còn là dự phòng khi node riêng chết.
Bỏ trống 4 secret → quay lại dùng node công khai như hiện tại.

### Dựng Lavalink trên Oracle (5 phút)

```bash
# 1. Tạo VM: Shape Ampere A1 (2 OCPU / 12 GB), Image Ubuntu 22.04, Region Singapore
# 2. Mở port 2333 trong Security List / NSG
# 3. SSH vào máy
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
git clone https://github.com/VietUniverse/music-bot.git
cd music-bot
nano application.yml          # đổi password trong lavalink.server.password
sudo docker compose up -d lavalink
curl -H "Authorization: <password>" http://localhost:2333/version
```

Sau đó điền 4 secret ở trên và chạy lại workflow.



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
