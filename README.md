# 🎵 Discord Music Bot on GitHub Actions

Bot Discord phát nhạc chạy **24/7 miễn phí** trên GitHub Actions.

## Stack

- **discord.js** v14 — Discord API
- **Lavalink** v4 — Audio server
- **lavalink-client** — Lavalink wrapper
- **GitHub Actions** — Runtime (unlimited minutes trên public repo)

## 🚀 Setup

### 1. Tạo Discord Bot

1. Vào [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → đặt tên → **Bot** tab → **Reset Token** → copy token
3. **Bot** tab → enable **Message Content Intent** (nếu cần)
4. **OAuth2** → **URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Use Slash Commands`
5. Copy URL → mời bot vào server

### 2. Cấu hình GitHub Secrets

Vào repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Giá trị |
|--------|---------|
| `DISCORD_TOKEN` | Token bot Discord |
| `LAVALINK_PASSWORD` | Mật khẩu bất kỳ (ví dụ: `mypassword123`) |

### 3. Enable GitHub Actions

- Vào tab **Actions** → Enable workflows
- Hoặc trigger thủ công: **Actions** → **Run Music Bot** → **Run workflow**

## 🎮 Commands

| Command | Mô tả |
|---------|--------|
| `/play <query>` | Phát nhạc (YouTube, SoundCloud, URL) |
| `/skip` | Skip bài hiện tại |
| `/stop` | Dừng & rời voice channel |
| `/queue` | Xem danh sách phát |
| `/nowplaying` | Bài đang phát + progress bar |
| `/pause` | Tạm dừng |
| `/resume` | Tiếp tục |
| `/volume <1-150>` | Chỉnh âm lượng |

## ⚙️ Cách hoạt động

```
Cron trigger (mỗi 5h50m)
    ↓
Cancel run cũ (concurrency)
    ↓
Download Lavalink.jar
    ↓
Start Lavalink (chờ ready)
    ↓
Start Bot
    ↓
Cron trigger lại → restart
```

- **Downtime**: ~1-2 phút mỗi lần restart
- **Public repo**: unlimited minutes
- **Private repo**: 2000 phút/tháng

## 📝 Lưu ý

- `Lavalink.jar` **không commit** vào repo — workflow tự download
- Java RAM giới hạn **512MB** (`JAVA_TOOL_OPTIONS`)
- Bot tự reconnect Lavalink nếu bị mất kết nối
- Graceful shutdown khi workflow bị cancel
