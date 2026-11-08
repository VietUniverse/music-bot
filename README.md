# 🎵 Discord Music Bot — Lavalink v4

Bot phát nhạc cho Discord: **discord.js v14 + Lavalink v4**, chạy được trên GitHub Actions, VPS, Docker, Fly.io, Railway.

---

## ⚠️ Vì sao GitHub Actions của bạn cứ bị tắt

Mình đã soi 4 workflow cũ và tìm ra **4 nguyên nhân**, không phải do bạn cấu hình sai:

| # | Nguyên nhân | Chi tiết |
|---|---|---|
| 1 | **Hai workflow tự huỷ lẫn nhau** | `main.yml` và `run.yml` **cùng** `concurrency.group: music-bot` và **cùng** cron `50 */5`. Mỗi 5 giờ cả hai cùng khởi động → GitHub huỷ một cái (cancel-in-progress). Bot bị "đá" liên tục, log nhìn như bị tắt ngẫu nhiên. |
| 2 | **GitHub tự disable scheduled workflow sau 60 ngày repo không có commit** | Đây là chính sách của GitHub cho mọi repo public. Repo không commit → schedule bị tắt, không báo rõ. |
| 3 | **Giới hạn 6 giờ/job** | Job đặt `timeout: 350 phút`, cron 5h50. Nhưng GitHub hay trễ cron 10–30 phút khi tải cao → có khoảng trống bot offline. Nếu trễ hơn, job mới khởi động khi job cũ vẫn chạy → lại cancel. |
| 4 | **Vi phạm điều khoản GitHub Actions** | GitHub cấm dùng Actions để **host dịch vụ 24/7** (chỉ cho CI/CD). Bot nhạc chạy liên tục đúng vào diện này → GitHub có quyền throttle hoặc tắt workflow, thậm chí khoá tài khoản. **Đây là lý do không có cách nào "fix" triệt để trên Actions.** |

### Đã sửa gì

- ✅ Gộp 4 workflow thành **1** (`bot.yml`), mỗi bot một `concurrency` group riêng → không còn huỷ lẫn nhau.
- ✅ Thêm **`keepalive.yml`**: mỗi ngày tự bật lại workflow bị tắt + commit "nhịp tim" để GitHub không disable schedule + tự dispatch nếu bot chết.
- ✅ Thêm **supervisor** (`scripts/run.sh`): bot crash → tự chạy lại sau 5s; Lavalink chết → tự bật lại.
- ✅ Bot **dùng node Lavalink cục bộ** (trước đây workflow tải Lavalink.jar nhưng bot lại chỉ dùng node công khai → vừa phí vừa chập chờn).
- ✅ Cache `Lavalink.jar` + `npm` → khởi động nhanh hơn ~2 phút.
- ✅ Health-check HTTP (`/health`) để monitor uptime.
- ⚠️ **Khuyến nghị thật lòng:** chuyển sang VPS/Docker/Fly.io (mục bên dưới). Rẻ hơn thời gian bạn phải sửa liên tục, và không bị GitHub khoá.

---

## 🚀 Cài đặt

### GitHub Secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Bắt buộc | Ghi chú |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | token bot 1 |
| `DISCORD_TOKEN_2` | ❌ | token bot 2 (nếu dùng) |
| `DISCORD_TOKEN_3` | ❌ | token bot 3 |
| `LAVALINK_PASSWORD` | ✅ | chuỗi bất kỳ, vd `matkhaula123` |

Sau đó vào tab **Actions → Music Bot → Run workflow**.

---

## 📥 Playlist và YouTube Mix

| Loại link | Hành vi |
|---|---|
| `youtube.com/playlist?list=PL…` | Thêm **đúng toàn bộ** playlist, giữ nguyên thứ tự |
| `youtube.com/playlist?list=OLAK…`, `list=UU…` | Như trên |
| `youtube.com/watch?v=…&list=RD…&start_radio=1` | **YouTube Mix (radio)** — YouTube tự sinh và **đổi nội dung mỗi lần mở**, không có cách nào tái tạo chính xác. Bot thêm bản snapshot hiện tại và cảnh báo màu vàng |
| Link 1 video | Thêm đúng video đó |
| Từ khoá | Tìm YouTube → SoundCloud → Deezer |

Khi bạn dán **link**, bot **không bao giờ** fallback sang tìm kiếm bằng chuỗi URL nữa (đây là lỗi cũ khiến nó phát bài lung tung). Link lỗi → báo lỗi rõ ràng.

## 🎮 Lệnh
| Nhóm | Lệnh |
|---|---|
| Phát nhạc | `/play <từ khoá\|URL>` · `/search <từ khoá>` (chọn từ 10 kết quả) |
| Điều khiển | `/pause` `/resume` `/skip [số]` `/stop` `/seek <mm:ss>` `/replay` |
| Hàng đợi | `/queue [trang]` `/shuffle` `/remove <vị trí>` `/move <từ> <tới>` `/clear` |
| Âm thanh | `/volume <1-200>` `/filter <bass\|nightcore\|vaporwave\|8d\|rock\|pop\|classic\|off>` |
| Khác | `/247` (ở lại voice) · `/autoplay` · `/nowplaying` (có nút bấm) · `/lyrics` · `/ping` · `/debug` · `/help` |

**Bảng điều khiển** (gửi vào **chat của voice channel** nếu bot có quyền, không thì gửi kênh gõ lệnh):

| Hàng 1 | ⏯ pause/resume · ⏭ skip · ⏹ stop · 🔀 shuffle · 🔁 loop |
|---|---|
| Hàng 2 | `-10s` · `+10s` · ⏱️ **Tua** (mở hộp thoại nhập `1:30`) · 📜 **Hàng đợi** |

Muốn bot nhắn được vào voice channel chat, cấp quyền **View Channel · Send Messages · Embed Links** cho bot ở kênh thoại đó. Không có quyền → bot tự lùi về kênh text bạn gõ lệnh.

**Tính năng tự động:**
- Tự rời voice sau 60s nếu phòng trống (tắt bằng `/247`).
- Hết hàng đợi → tự tìm bài liên quan nếu bật `/autoplay`.
- Lỗi nguồn → tự tìm nguồn khác (YouTube → SoundCloud → Deezer) và phát tiếp.
- Treo/kẹt bài → tự skip.

---

## 🖥 Chạy ngoài GitHub Actions (khuyến nghị)

### Docker Compose (VPS)

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

### Chạy trực tiếp (cần Java 17 + Node 20+)

```bash
npm install
java -jar Lavalink.jar &     # tải jar từ release Lavalink v4
npm start
```

---

## 📁 Cấu trúc

```
bot.js                     # toàn bộ logic bot
application.yml            # cấu hình Lavalink
scripts/run.sh             # supervisor (auto-restart)
.github/workflows/bot.yml      # chạy bot
.github/workflows/keepalive.yml # chống GitHub tắt workflow
Dockerfile / docker-compose.yml / fly.toml
```

---

## 🔒 Bảo mật

- **Không commit token** vào repo. File `.env` đã nằm trong `.gitignore`.
- File `application.yml` cũ có nhúng `pot.token` YouTube — mình đã **xoá** vì token đó đã hết hạn và bị lộ công khai.
- Nếu token Discord từng bị commit, hãy **Reset Token** trong Developer Portal.

---

## 📄 Giấy phép

MIT
