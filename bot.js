/**
 * 🎵 Discord Music Bot — Lavalink v4
 * ---------------------------------------------------------------
 * Chạy được trên GitHub Actions, VPS, Docker, Fly.io, Railway...
 *
 * Biến môi trường:
 *   DISCORD_TOKEN        (bắt buộc)  Token bot
 *   TOKEN_ENV            (tuỳ chọn)  Tên biến chứa token, vd: DISCORD_TOKEN_2
 *   LAVALINK_PASSWORD    (tuỳ chọn)  Mật khẩu Lavalink cục bộ
 *   LAVALINK_HOST        (mặc định 127.0.0.1)
 *   LAVALINK_PORT        (mặc định 2333)
 *   USE_LOCAL_LAVALINK   (1/0)       Ưu tiên node cục bộ
 *   BOT_NODE_INDEX       (tuỳ chọn)  Xoay vòng thứ tự node dự phòng
 *   PORT                 (mặc định 8080) cổng health-check
 */

const http = require("http");
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    REST,
    Routes,
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
} = require("discord.js");
const { LavalinkManager } = require("lavalink-client");

// ─── Config ─────────────────────────────────────────────────────
const TOKEN_ENV = process.env.TOKEN_ENV || "DISCORD_TOKEN";
const DISCORD_TOKEN = process.env[TOKEN_ENV] || process.env.DISCORD_TOKEN;
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD || "youshallnotpass";
const LAVALINK_HOST = process.env.LAVALINK_HOST || "127.0.0.1";
const LAVALINK_PORT = Number(process.env.LAVALINK_PORT || 2333);
const USE_LOCAL_LAVALINK = String(process.env.USE_LOCAL_LAVALINK ?? "1") === "1";
const INSTANCE_ID = Math.random().toString(36).slice(2, 8).toUpperCase();
const STARTED_AT = Date.now();

console.log(`[BOT] Instance ${INSTANCE_ID} | token env: ${TOKEN_ENV} | local Lavalink: ${USE_LOCAL_LAVALINK}`);

if (!DISCORD_TOKEN) {
    console.error(`❌ Thiếu token (biến ${TOKEN_ENV} hoặc DISCORD_TOKEN)`);
    process.exit(1);
}

// ─── Health-check server (cho Fly.io / Railway / uptime monitor) ─
const HEALTH_PORT = Number(process.env.PORT || 8080);
const health = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
        const up = Math.floor((Date.now() - STARTED_AT) / 1000);
        const body = JSON.stringify({
            ok: true,
            instance: INSTANCE_ID,
            uptime: up,
            guilds: client?.guilds?.cache?.size ?? 0,
            players: client?.lavalink?.players?.size ?? 0,
            nodes: [...(client?.lavalink?.nodeManager?.nodes?.values?.() ?? [])]
                .map((n) => ({ id: n.id, connected: n.connected, ping: n.ping })),
        });
        res.writeHead(200, { "content-type": "application/json" });
        return res.end(body);
    }
    res.writeHead(404).end("not found");
});
health.listen(HEALTH_PORT, () => console.log(`[BOT] Health-check: http://0.0.0.0:${HEALTH_PORT}/health`));

// ─── Discord client ─────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

// ─── Lavalink nodes ─────────────────────────────────────────────
// Node cục bộ (do workflow/docker khởi động) — ổn định nhất.
// Các node công khai chỉ là dự phòng khi node cục bộ chết.
const nodes = [];
if (USE_LOCAL_LAVALINK) {
    nodes.push({
        id: "local",
        host: LAVALINK_HOST,
        port: LAVALINK_PORT,
        authorization: LAVALINK_PASSWORD,
        secure: false,
        retryAmount: 50,
        retryDelay: 3000,
    });
}

const PUBLIC_NODES = [
    {
        id: "serenetia",
        host: "lavalinkv4.serenetia.com",
        port: 80,
        secure: false,
        authorization: "https://seretia.link/discord",
        retryAmount: 10,
        retryDelay: 8000,
    },
    {
        id: "millohost",
        host: "lava-v4.millohost.my.id",
        port: 443,
        secure: true,
        authorization: "https://discord.gg/mjS5J2K3ep",
        retryAmount: 10,
        retryDelay: 8000,
    },
];

const offset = (Number(process.env.BOT_NODE_INDEX) || 0) % PUBLIC_NODES.length;
nodes.push(...PUBLIC_NODES.slice(offset), ...PUBLIC_NODES.slice(0, offset));

client.lavalink = new LavalinkManager({
    nodes,
    sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
    autoSkip: true,
    client: { id: null, username: null },
    // Tự động chuyển player sang node khác nếu node hiện tại chết
    playerOptions: {
        applyVolumeAsFilter: false,
        defaultSearchPlatform: "ytsearch",
        onDisconnect: {
            autoReconnect: true,
            destroyPlayer: false,
        },
        onEmptyQueue: {
            destroyAfterMs: 120_000,
        },
    },
    queueOptions: {
        maxPreviousTracks: 20,
    },
});

client.on("raw", (d) => client.lavalink.sendRawData(d));

// ─── Trạng thái mở rộng ─────────────────────────────────────────
const stay247 = new Set();      // guild luôn ở lại voice
const autoplay = new Set();     // guild tự phát bài liên quan
const emptyTimers = new Map();  // guild -> timeout rời voice
const searchCache = new Map();  // userId -> { tracks, ts }
const nowPlayingMsgs = new Map(); // guildId -> { channelId, messageId }

// ─── Slash commands ─────────────────────────────────────────────
const commands = [
    new SlashCommandBuilder()
        .setName("play").setDescription("🎵 Phát nhạc từ YouTube/SoundCloud hoặc URL")
        .addStringOption((o) => o.setName("query").setDescription("Tên bài hát, playlist hoặc URL").setRequired(true)),
    new SlashCommandBuilder()
        .setName("search").setDescription("🔎 Tìm 10 kết quả và chọn bài để phát")
        .addStringOption((o) => o.setName("query").setDescription("Từ khoá tìm kiếm").setRequired(true)),
    new SlashCommandBuilder()
        .setName("skip").setDescription("⏭ Bỏ qua bài hiện tại")
        .addIntegerOption((o) => o.setName("amount").setDescription("Số bài muốn bỏ qua").setMinValue(1).setMaxValue(20)),
    new SlashCommandBuilder().setName("stop").setDescription("⏹ Dừng phát và rời voice channel"),
    new SlashCommandBuilder().setName("pause").setDescription("⏸ Tạm dừng"),
    new SlashCommandBuilder().setName("resume").setDescription("▶ Tiếp tục phát"),
    new SlashCommandBuilder().setName("queue").setDescription("📜 Xem hàng đợi")
        .addIntegerOption((o) => o.setName("page").setDescription("Trang").setMinValue(1)),
    new SlashCommandBuilder().setName("nowplaying").setDescription("🎶 Bài đang phát (kèm nút điều khiển)"),
    new SlashCommandBuilder().setName("volume").setDescription("🔊 Chỉnh âm lượng")
        .addIntegerOption((o) => o.setName("level").setDescription("1–200").setRequired(true).setMinValue(1).setMaxValue(200)),
    new SlashCommandBuilder().setName("loop").setDescription("🔁 Chế độ lặp")
        .addStringOption((o) => o.setName("mode").setDescription("Chế độ").setRequired(true)
            .addChoices(
                { name: "❌ Tắt", value: "off" },
                { name: "🔂 Bài hiện tại", value: "track" },
                { name: "🔁 Cả hàng đợi", value: "queue" },
            )),
    new SlashCommandBuilder().setName("shuffle").setDescription("🔀 Xáo trộn hàng đợi"),
    new SlashCommandBuilder().setName("seek").setDescription("⏩ Tua tới vị trí")
        .addStringOption((o) => o.setName("time").setDescription("mm:ss hoặc ss (vd 1:30)").setRequired(true)),
    new SlashCommandBuilder().setName("remove").setDescription("🗑 Xoá một bài khỏi hàng đợi")
        .addIntegerOption((o) => o.setName("index").setDescription("Vị trí (xem /queue)").setRequired(true).setMinValue(1)),
    new SlashCommandBuilder().setName("move").setDescription("↕ Đổi vị trí bài trong hàng đợi")
        .addIntegerOption((o) => o.setName("from").setDescription("Từ vị trí").setRequired(true).setMinValue(1))
        .addIntegerOption((o) => o.setName("to").setDescription("Tới vị trí").setRequired(true).setMinValue(1)),
    new SlashCommandBuilder().setName("clear").setDescription("🧹 Xoá toàn bộ hàng đợi (giữ bài đang phát)"),
    new SlashCommandBuilder().setName("replay").setDescription("⏪ Phát lại bài hiện tại từ đầu"),
    new SlashCommandBuilder().setName("filter").setDescription("🎛 Bộ lọc âm thanh")
        .addStringOption((o) => o.setName("preset").setDescription("Chọn bộ lọc").setRequired(true)
            .addChoices(
                { name: "❌ Tắt hết", value: "off" },
                { name: "🔊 Bassboost", value: "bass" },
                { name: "🌙 Nightcore", value: "nightcore" },
                { name: "🌊 Vaporwave", value: "vaporwave" },
                { name: "🎧 8D Audio", value: "8d" },
                { name: "🎸 Rock", value: "rock" },
                { name: "🎹 Pop", value: "pop" },
                { name: "🎻 Classic", value: "classic" },
            )),
    new SlashCommandBuilder().setName("247").setDescription("📌 Giữ bot ở lại voice channel 24/7"),
    new SlashCommandBuilder().setName("autoplay").setDescription("♾ Tự phát bài liên quan khi hết hàng đợi"),
    new SlashCommandBuilder().setName("lyrics").setDescription("📝 Lời bài hát đang phát"),
    new SlashCommandBuilder().setName("ping").setDescription("📡 Kiểm tra độ trễ bot và node nhạc"),
    new SlashCommandBuilder().setName("debug").setDescription("🔍 Thông tin kỹ thuật"),
    new SlashCommandBuilder().setName("help").setDescription("❓ Danh sách lệnh"),
].map((c) => c.toJSON());

// ─── Helpers ────────────────────────────────────────────────────
function formatDuration(ms) {
    if (!ms || ms === 0 || !Number.isFinite(ms)) return "🔴 LIVE";
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
}

function parseTime(input) {
    const s = String(input).trim();
    if (/^\d+$/.test(s)) return Number(s) * 1000;
    const parts = s.split(":").map(Number);
    if (parts.some(Number.isNaN)) return null;
    if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
    if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    return null;
}

function progressBar(current, total, length = 14) {
    if (!total || total <= 0) return "▬".repeat(length);
    const ratio = Math.min(1, Math.max(0, current / total));
    const idx = Math.round(ratio * (length - 1));
    return "▬".repeat(idx) + "🔘" + "▬".repeat(Math.max(0, length - idx - 1));
}

function requesterOf(track) {
    return track?.userData?.requester || track?.requester || null;
}

function trackEmbed(track, title = "🎵 Đang phát", player = null) {
    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: title })
        .setTitle(track.info.title.slice(0, 250))
        .setURL(track.info.uri || null);

    const fields = [
        { name: "👤 Nghệ sĩ", value: (track.info.author || "Không rõ").slice(0, 100), inline: true },
        { name: "⏱ Thời lượng", value: formatDuration(track.info.duration), inline: true },
        { name: "📡 Nguồn", value: track.info.sourceName || "unknown", inline: true },
    ];
    if (player?.queue?.current === track) {
        fields.push({
            name: "🎚 Tiến trình",
            value: `${formatDuration(player.position)} ${progressBar(player.position, track.info.duration)} ${formatDuration(track.info.duration)}`,
            inline: false,
        });
    }
    embed.addFields(fields);

    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    const req = requesterOf(track);
    if (req) embed.setFooter({ text: `Yêu cầu bởi ${req.username || req.tag || "ai đó"}` });
    return embed;
}

function controlRow(player) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("np:toggle")
            .setEmoji(player.paused ? "▶️" : "⏸️")
            .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("np:skip").setEmoji("⏭️").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("np:shuffle").setEmoji("🔀").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("np:loop")
            .setEmoji("🔁")
            .setStyle(player.repeatMode === "off" ? ButtonStyle.Secondary : ButtonStyle.Success),
        new ButtonBuilder().setCustomId("np:stop").setEmoji("⏹️").setStyle(ButtonStyle.Danger),
    );
}

async function safeReply(interaction, payload) {
    try {
        if (interaction.deferred || interaction.replied) return await interaction.editReply(payload);
        return await interaction.reply(payload);
    } catch (e) {
        console.error("[INTERACTION] reply failed:", e.message);
    }
}

async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log(`✅ Đã đăng ký ${commands.length} slash commands`);
    } catch (err) {
        console.error("❌ Đăng ký commands thất bại:", err.message);
    }
}

function getPlayer(guildId) {
    return client.lavalink.getPlayer(guildId);
}

async function ensureVoice(interaction) {
    const guild = interaction.guild ?? (await client.guilds.fetch(interaction.guildId).catch(() => null));
    if (!guild) return { error: "❌ Không tìm thấy server." };

    let member = interaction.member;
    if (!member?.voice) {
        member = await guild.members.fetch(interaction.user.id).catch(() => null);
    }
    const channel = member?.voice?.channel;
    if (!channel) return { error: "❌ Bạn cần vào một voice channel trước!" };
    return { guild, channel, member };
}

async function getOrCreatePlayer(guild, voiceChannel, textChannelId) {
    let player = getPlayer(guild.id);
    if (!player) {
        player = client.lavalink.createPlayer({
            guildId: guild.id,
            voiceChannelId: voiceChannel.id,
            textChannelId,
            selfDeaf: true,
            selfMute: false,
            volume: 80,
        });
    }
    if (player.connected && player.voiceChannelId !== voiceChannel.id) {
        await player.changeVoiceState({ voiceChannelId: voiceChannel.id });
    } else if (!player.connected) {
        await player.connect();
    }
    return player;
}

/**
 * Tìm nhạc với chuỗi nguồn dự phòng.
 * YouTube trước, rồi SoundCloud, rồi Deezer (nếu node có LavaSrc).
 */
const SOURCE_CHAIN = ["ytsearch", "ytmsearch", "scsearch", "dzsearch"];

async function searchWithFallback(player, query, requester) {
    const isUrl = /^https?:\/\//i.test(query);
    if (isUrl) {
        try {
            const res = await player.search({ query }, requester);
            if (res?.tracks?.length) return res;
        } catch (e) {
            console.warn(`[SEARCH] URL lỗi: ${e.message}`);
        }
    }

    for (const source of SOURCE_CHAIN) {
        try {
            const res = await player.search({ query: `${source}:${query}` }, requester);
            if (res?.tracks?.length) {
                console.log(`[SEARCH] "${query.slice(0, 40)}" → ${source} (${res.tracks.length})`);
                return res;
            }
        } catch (e) {
            console.warn(`[SEARCH] ${source} lỗi: ${e.message?.slice(0, 100)}`);
        }
    }
    return null;
}

function tagRequester(tracks, user) {
    for (const t of tracks) {
        t.userData = { ...(t.userData || {}), requester: user };
    }
}

/**
 * Nhận diện link playlist YouTube.
 *  - list=PL... / OLAK... / UU...  → playlist thật, cố định
 *  - list=RD...                    → Mix/radio tự động, YouTube đổi mỗi lần mở
 */
function parsePlaylistUrl(input) {
    if (!/^https?:\/\//i.test(input)) return null;
    try {
        const u = new URL(input);
        const list = u.searchParams.get("list");
        if (!list) return null;
        return {
            listId: list,
            isRadio: list.startsWith("RD"),
            url: `https://www.youtube.com/playlist?list=${list}`,
        };
    } catch {
        return null;
    }
}

// ─── Ready ──────────────────────────────────────────────────────
client.once("ready", async () => {
    console.log(`🤖 Online: ${client.user.tag} | ${client.guilds.cache.size} server`);
    client.user.setPresence({
        activities: [{ name: "/play • nhạc chill 24/7", type: 2 }],
        status: "online",
    });
    try {
        await client.lavalink.init({ id: client.user.id, username: client.user.username });
    } catch (e) {
        console.error("❌ init Lavalink:", e.message);
    }
    await registerCommands();
});

// ─── Voice: tự rời khi phòng trống ──────────────────────────────
client.on("voiceStateUpdate", (oldState, newState) => {
    const guildId = oldState.guild.id;
    const player = getPlayer(guildId);
    if (!player?.voiceChannelId) return;

    const vc = oldState.guild.channels.cache.get(player.voiceChannelId);
    if (!vc) return;

    const humans = vc.members.filter((m) => !m.user.bot).size;

    if (humans === 0 && !stay247.has(guildId)) {
        if (emptyTimers.has(guildId)) return;
        const timer = setTimeout(async () => {
            const p = getPlayer(guildId);
            const ch = p && client.channels.cache.get(p.textChannelId);
            ch?.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription("👋 Không còn ai trong voice — bot đã rời.")] }).catch(() => {});
            await p?.destroy().catch(() => {});
            emptyTimers.delete(guildId);
        }, 60_000);
        emptyTimers.set(guildId, timer);
    } else if (humans > 0 && emptyTimers.has(guildId)) {
        clearTimeout(emptyTimers.get(guildId));
        emptyTimers.delete(guildId);
    }
});

// ─── Lavalink events ────────────────────────────────────────────
client.lavalink.nodeManager.on("connect", (node) => console.log(`✅ Node ${node.id} connected`));
client.lavalink.nodeManager.on("disconnect", (node, reason) => console.warn(`⚠️ Node ${node.id} disconnected: ${reason}`));
client.lavalink.nodeManager.on("error", (node, err) => console.error(`❌ Node ${node.id}: ${err.message}`));
client.lavalink.nodeManager.on("reconnecting", (node) => console.log(`🔄 Node ${node.id} reconnecting...`));

client.lavalink.on("trackStart", (player, track) => {
    console.log(`▶ [${INSTANCE_ID}] ${track.info.title} (${player.node?.id || "?"})`);
    if (player.paused) player.resume().catch(() => {});
    const ch = client.channels.cache.get(player.textChannelId);
    if (ch) {
        ch.send({ embeds: [trackEmbed(track, "🎵 Đang phát", player)], components: [controlRow(player)] })
            .then((msg) => nowPlayingMsgs.set(player.guildId, { channelId: ch.id, messageId: msg.id }))
            .catch(() => {});
    }
});

client.lavalink.on("trackEnd", (player, track, payload) => {
    if (payload?.reason === "replaced") return;
    console.log(`⏹ Track end: ${track?.info?.title} (${payload?.reason})`);
});

// ─── Cập nhật thanh tiến trình mỗi 10 giây ─────────────────────
async function refreshNowPlaying() {
    for (const [guildId, info] of nowPlayingMsgs) {
        const player = getPlayer(guildId);
        const track = player?.queue?.current;
        if (!player || !track || !player.connected) {
            nowPlayingMsgs.delete(guildId);
            continue;
        }
        try {
            const ch =
                client.channels.cache.get(info.channelId) ||
                (await client.channels.fetch(info.channelId).catch(() => null));
            if (!ch?.isTextBased()) {
                nowPlayingMsgs.delete(guildId);
                continue;
            }
            const msg =
                ch.messages.cache.get(info.messageId) ||
                (await ch.messages.fetch(info.messageId).catch(() => null));
            if (!msg) {
                nowPlayingMsgs.delete(guildId);
                continue;
            }
            await msg.edit({
                embeds: [trackEmbed(track, player.paused ? "⏸ Đang tạm dừng" : "🎶 Đang phát", player)],
                components: [controlRow(player)],
            });
        } catch (e) {
            if (e?.code === 10008 || e?.status === 404) nowPlayingMsgs.delete(guildId);
        }
    }
}
setInterval(refreshNowPlaying, 10_000);

client.lavalink.on("queueEnd", async (player) => {
    const ch = client.channels.cache.get(player.textChannelId);
    const guildId = player.guildId;

    if (autoplay.has(guildId)) {
        try {
            const last = player.queue.previous?.at(-1) || player.queue.current;
            const query = [last?.info?.title, last?.info?.author].filter(Boolean).join(" ");
            if (query) {
                const res = await searchWithFallback(player, query, null);
                const next = res?.tracks?.find((t) => t.info.uri !== last?.info?.uri) || res?.tracks?.[0];
                if (next) {
                    player.queue.add(next);
                    await player.play();
                    ch?.send({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription(`♾ **Autoplay:** ${next.info.title}`)] }).catch(() => {});
                    return;
                }
            }
        } catch (e) {
            console.warn("[AUTOPLAY]", e.message);
        }
    }

    if (stay247.has(guildId)) {
        ch?.send({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription("📭 Hết hàng đợi. Bot vẫn ở lại vì **24/7** đang bật.")] }).catch(() => {});
        return;
    }

    ch?.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription("📭 Hết hàng đợi — rời voice sau 2 phút.")] }).catch(() => {});
    setTimeout(() => {
        if (!player.playing && !stay247.has(guildId)) player.destroy().catch(() => {});
    }, 120_000);
});

client.lavalink.on("trackError", async (player, track, payload) => {
    console.error(`❌ Track error: ${track?.info?.title} — ${payload?.exception?.message || payload?.error}`);
    const ch = client.channels.cache.get(player.textChannelId);

    const res = await searchWithFallback(player, track.info.title, requesterOf(track)).catch(() => null);
    const alt = res?.tracks?.find((t) => t.info.uri !== track.info.uri);

    if (alt) {
        tagRequester([alt], requesterOf(track));
        player.queue.add(alt, 0);
        ch?.send({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`⚠️ Lỗi nguồn, thử nguồn khác: **${alt.info.title}**`)] }).catch(() => {});
    } else {
        ch?.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription(`❌ Không phát được: **${track?.info?.title}**`)] }).catch(() => {});
        if (player.queue.tracks.length) player.skip().catch(() => {});
        else player.stopPlaying().catch(() => {});
    }
});

client.lavalink.on("trackStuck", async (player, track) => {
    console.warn(`⚠️ Track stuck: ${track.info.title}`);
    const ch = client.channels.cache.get(player.textChannelId);
    ch?.send({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`⚠️ Bài bị kẹt: **${track.info.title}** — bỏ qua.`)] }).catch(() => {});
    if (player.queue.tracks.length) player.skip().catch(() => {});
    else player.stopPlaying().catch(() => {});
});

// ─── Interaction handler ────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isButton()) return await handleButton(interaction);
        if (interaction.isStringSelectMenu() && interaction.customId === "search:pick") {
            return await handleSearchPick(interaction);
        }
        if (!interaction.isChatInputCommand()) return;
        await handleCommand(interaction);
    } catch (err) {
        console.error(`[${INSTANCE_ID}] interaction error:`, err);
        await safeReply(interaction, {
            content: "❌ Có lỗi xảy ra: `" + (err.message || "unknown").slice(0, 120) + "`",
            ephemeral: true,
        });
    }
});

async function handleButton(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
        return interaction.reply({ content: "❌ Không có player nào đang hoạt động.", ephemeral: true });
    }

    switch (interaction.customId) {
        case "np:toggle":
            player.paused ? await player.resume() : await player.pause();
            break;
        case "np:skip":
            await player.skip();
            break;
        case "np:stop":
            await player.destroy();
            return interaction.update({ components: [] });
        case "np:shuffle":
            await player.queue.shuffle();
            break;
        case "np:loop": {
            const next = player.repeatMode === "off" ? "queue" : player.repeatMode === "queue" ? "track" : "off";
            await player.setRepeatMode(next);
            break;
        }
    }

    const current = player.queue.current;
    if (!current) return interaction.update({ components: [] });

    return interaction.update({
        embeds: [trackEmbed(current, player.paused ? "⏸ Đang tạm dừng" : "🎶 Đang phát", player)],
        components: [controlRow(player)],
    });
}

async function handleSearchPick(interaction) {
    const cached = searchCache.get(interaction.user.id);
    if (!cached || Date.now() - cached.ts > 5 * 60_000) {
        return interaction.update({ content: "⌛ Kết quả đã hết hạn, hãy dùng `/search` lại.", embeds: [], components: [] });
    }
    const idx = Number(interaction.values[0]);
    const track = cached.tracks[idx];
    if (!track) return interaction.update({ content: "❌ Không tìm thấy bài.", embeds: [], components: [] });

    const v = await ensureVoice(interaction);
    if (v.error) return interaction.update({ content: v.error, embeds: [], components: [] });

    const player = await getOrCreatePlayer(v.guild, v.channel, interaction.channelId);
    tagRequester([track], interaction.user);
    player.queue.add(track);
    if (!player.playing) await player.play();

    return interaction.update({
        content: `✅ Đã thêm: **${track.info.title}**`,
        embeds: [],
        components: [],
    });
}

async function handleCommand(interaction) {
    const { commandName, guildId } = interaction;
    if (!guildId) {
        return interaction.reply({ content: "❌ Chỉ dùng được trong server.", ephemeral: true });
    }

    // ── /help ──
    if (commandName === "help") {
        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("🎵 Music Bot — Danh sách lệnh")
            .setDescription(
                [
                    "**Phát nhạc**",
                    "`/play <từ khoá|URL>` — phát hoặc thêm vào hàng đợi",
                    "`/search <từ khoá>` — chọn từ 10 kết quả",
                    "**Điều khiển**",
                    "`/pause` `/resume` `/skip [số]` `/stop` `/seek <mm:ss>` `/replay`",
                    "**Hàng đợi**",
                    "`/queue [trang]` `/shuffle` `/remove <vị trí>` `/move <từ> <tới>` `/clear`",
                    "**Âm thanh**",
                    "`/volume <1-200>` `/filter <preset>`",
                    "**Khác**",
                    "`/247` `/autoplay` `/nowplaying` `/lyrics` `/ping` `/debug`",
                ].join("\n")
            )
            .setFooter({ text: `Instance ${INSTANCE_ID}` });
        return interaction.reply({ embeds: [embed] });
    }

    // ── /ping ──
    if (commandName === "ping") {
        const node = [...client.lavalink.nodeManager.nodes.values()].find((n) => n.connected);
        const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setDescription(
                [
                    `📡 **WebSocket:** ${client.ws.ping}ms`,
                    `🎧 **Node:** ${node ? `${node.id} — ${node.ping}ms` : "❌ không có node"}`,
                    `⏱ **Uptime:** ${formatDuration(Date.now() - STARTED_AT)}`,
                ].join("\n")
            );
        return interaction.reply({ embeds: [embed] });
    }

    // ── /debug ──
    if (commandName === "debug") {
        const player = getPlayer(guildId);
        const nodes = [...client.lavalink.nodeManager.nodes.values()].map(
            (n) => `• \`${n.id}\` — ${n.connected ? "✅" : "❌"} ${n.ping ?? "?"}ms`
        );
        return interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle("🔍 Debug")
                    .addFields(
                        { name: "Instance", value: `\`${INSTANCE_ID}\``, inline: true },
                        { name: "Guilds", value: `${client.guilds.cache.size}`, inline: true },
                        { name: "Players", value: `${client.lavalink.players.size}`, inline: true },
                        { name: "Nodes", value: nodes.join("\n") || "—" },
                        {
                            name: "Player",
                            value: player
                                ? `Node: \`${player.node?.id}\`\nPlaying: ${player.playing}\nPaused: ${player.paused}\nVolume: ${player.volume}\nQueue: ${player.queue.tracks.length}`
                                : "—",
                        }
                    ),
            ],
        });
    }

    // ── /play ──
    if (commandName === "play") {
        const v = await ensureVoice(interaction);
        if (v.error) return interaction.reply({ content: v.error, ephemeral: true });

        await interaction.deferReply();
        const raw = interaction.options.getString("query", true);
        const player = await getOrCreatePlayer(v.guild, v.channel, interaction.channelId);

        const isUrl = /^https?:\/\//i.test(raw);
        const playlistInfo = parsePlaylistUrl(raw);
        let res = null;

        if (isUrl) {
            // ── LINK: mở đúng playlist, TUYỆT ĐỐI không fallback sang tìm kiếm ──
            const target = playlistInfo?.url || raw;
            res = await player.search({ query: target }, interaction.user).catch(() => null);

            // Một số node chỉ trả 1 bài khi link có &list= → thử lại bằng playlist URL
            if ((!res?.tracks?.length || res.loadType === "track") && playlistInfo) {
                const retry = await player.search({ query: playlistInfo.url }, interaction.user).catch(() => null);
                if (retry?.tracks?.length) res = retry;
            }

            if (!res?.tracks?.length) {
                return interaction.editReply({
                    content:
                        "❌ Không mở được link này.\n" +
                        "• Link có thể bị YouTube chặn / video riêng tư / đã xoá\n" +
                        "• Thử lại bằng tên bài hát (bot sẽ tìm trên YouTube)",
                });
            }
        } else {
            res = await searchWithFallback(player, raw, interaction.user);
            if (!res?.tracks?.length) {
                return interaction.editReply({ content: "❌ Không tìm thấy bài nào. Thử từ khoá khác nhé!" });
            }
        }

        const MAX_TRACKS = 200;
        let tracks = res.loadType === "playlist" ? res.tracks.slice(0, MAX_TRACKS) : [res.tracks[0]];
        if (res.loadType === "playlist" && res.tracks.length > MAX_TRACKS) {
            console.warn(`[PLAY] playlist ${res.tracks.length} bài, chỉ thêm ${MAX_TRACKS}`);
        }

        tagRequester(tracks, interaction.user);
        player.queue.add(tracks);
        if (player.paused) await player.resume();
        if (!player.playing) await player.play();

        if (res.loadType === "playlist") {
            const radioNote = playlistInfo?.isRadio
                ? "\n\n⚠️ **Đây là YouTube Mix (radio)** — danh sách do YouTube tự tạo và **thay đổi mỗi lần mở**, nên không thể giống 100% cái bạn đang xem. Muốn cố định, dùng link playlist thật (`list=PL…`)."
                : "";
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(playlistInfo?.isRadio ? 0xfee75c : 0x57f287)
                        .setTitle(`📥 Playlist: ${res.playlist?.name || "không tên"}`)
                        .setDescription(
                            `✅ Đã thêm **${tracks.length}** bài theo đúng thứ tự.\n\n` +
                                tracks.slice(0, 5).map((t, i) => `**${i + 1}.** ${t.info.title}`).join("\n") +
                                (tracks.length > 5 ? `\n… và **${tracks.length - 5}** bài nữa` : "") +
                                radioNote
                        ),
                ],
            });
        }
        return interaction.editReply({
            embeds: [trackEmbed(tracks[0], player.playing ? "➕ Đã thêm vào hàng đợi" : "🎵 Đang phát", player)],
        });
    }

    // ── /search ──
    if (commandName === "search") {
        const v = await ensureVoice(interaction);
        if (v.error) return interaction.reply({ content: v.error, ephemeral: true });

        await interaction.deferReply();
        const query = interaction.options.getString("query", true);
        const player = await getOrCreatePlayer(v.guild, v.channel, interaction.channelId);
        const res = await searchWithFallback(player, query, interaction.user);

        if (!res?.tracks?.length) return interaction.editReply({ content: "❌ Không có kết quả." });

        const tracks = res.tracks.slice(0, 10);
        searchCache.set(interaction.user.id, { tracks, ts: Date.now() });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("search:pick")
            .setPlaceholder("Chọn bài để phát")
            .addOptions(
                tracks.map((t, i) => ({
                    label: t.info.title.slice(0, 90),
                    description: `${t.info.author || "?"} • ${formatDuration(t.info.duration)}`.slice(0, 90),
                    value: String(i),
                }))
            );

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle(`🔎 Kết quả cho: ${query}`)
                    .setDescription(tracks.map((t, i) => `**${i + 1}.** ${t.info.title} \`${formatDuration(t.info.duration)}\``).join("\n")),
            ],
            components: [new ActionRowBuilder().addComponents(menu)],
        });
    }

    // ── /lyrics ──
    if (commandName === "lyrics") {
        const p = getPlayer(guildId);
        if (!p?.queue?.current) {
            return interaction.reply({ content: "❌ Không có bài nào đang phát.", ephemeral: true });
        }
        await interaction.deferReply();
        try {
            const res = await p.getCurrentLyrics();
            const text = res?.lyrics || res?.plainLyrics;
            if (!text) return interaction.editReply({ content: "❌ Không tìm thấy lời bài hát cho bài này." });
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle(`📝 ${p.queue.current.info.title}`.slice(0, 250))
                        .setDescription(text.slice(0, 4000)),
                ],
            });
        } catch {
            return interaction.editReply({ content: "❌ Node nhạc không hỗ trợ lời bài hát." });
        }
    }

    // Các lệnh cần player
    const player = getPlayer(guildId);
    const needPlayer = ["skip", "stop", "pause", "resume", "queue", "nowplaying", "volume", "loop",
        "shuffle", "seek", "remove", "move", "clear", "replay", "filter", "247", "autoplay"];
    if (needPlayer.includes(commandName) && !player) {
        return interaction.reply({ content: "❌ Chưa có nhạc nào đang phát. Dùng `/play` trước nhé!", ephemeral: true });
    }

    switch (commandName) {
        case "skip": {
            const amount = interaction.options.getInteger("amount") || 1;
            const title = player.queue.current?.info?.title || "?";
            await player.skip(amount > 1 ? amount : undefined).catch(() => {});
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`⏭ Đã bỏ qua **${title}**`)] });
        }
        case "stop": {
            await player.destroy();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription("⏹ Đã dừng và rời voice.")] });
        }
        case "pause":
            if (player.paused) return interaction.reply({ content: "⏸ Đang tạm dừng rồi.", ephemeral: true });
            await player.pause();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription("⏸ Đã tạm dừng.")] });
        case "resume":
            await player.resume();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription("▶ Tiếp tục phát.")] });
        case "queue": {
            const perPage = 10;
            const pages = Math.max(1, Math.ceil(player.queue.tracks.length / perPage));
            const page = Math.min(pages, Math.max(1, interaction.options.getInteger("page") || 1));
            const slice = player.queue.tracks.slice((page - 1) * perPage, page * perPage);
            const totalMs = player.queue.tracks.reduce((a, t) => a + (t.info.duration || 0), 0);

            const desc = [
                `**Đang phát:** [${player.queue.current?.info?.title}](${player.queue.current?.info?.uri}) \`${formatDuration(player.queue.current?.info?.duration)}\``,
                "",
                ...slice.map((t, i) => `**${(page - 1) * perPage + i + 1}.** ${t.info.title} \`${formatDuration(t.info.duration)}\``),
            ].join("\n");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle(`📜 Hàng đợi — trang ${page}/${pages}`)
                        .setDescription(desc.slice(0, 4000))
                        .setFooter({ text: `${player.queue.tracks.length} bài • tổng ${formatDuration(totalMs)}` }),
                ],
            });
        }
        case "nowplaying": {
            const cur = player.queue.current;
            if (!cur) return interaction.reply({ content: "❌ Không có bài nào đang phát.", ephemeral: true });
            return interaction.reply({
                embeds: [trackEmbed(cur, player.paused ? "⏸ Đang tạm dừng" : "🎶 Đang phát", player)],
                components: [controlRow(player)],
            });
        }
        case "volume": {
            const level = interaction.options.getInteger("level", true);
            await player.setVolume(level);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`🔊 Âm lượng: **${level}%**`)] });
        }
        case "loop": {
            const mode = interaction.options.getString("mode", true);
            await player.setRepeatMode(mode);
            const label = { off: "❌ Tắt lặp", track: "🔂 Lặp bài hiện tại", queue: "🔁 Lặp cả hàng đợi" }[mode];
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(label)] });
        }
        case "shuffle": {
            const n = await player.queue.shuffle();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`🔀 Đã xáo trộn **${n ?? player.queue.tracks.length}** bài.`)] });
        }
        case "seek": {
            const ms = parseTime(interaction.options.getString("time", true));
            if (ms === null) return interaction.reply({ content: "❌ Định dạng thời gian không hợp lệ (vd `1:30`).", ephemeral: true });
            await player.seek(ms);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`⏩ Tua tới **${formatDuration(ms)}**`)] });
        }
        case "remove": {
            const idx = interaction.options.getInteger("index", true) - 1;
            if (idx < 0 || idx >= player.queue.tracks.length) {
                return interaction.reply({ content: "❌ Vị trí không hợp lệ.", ephemeral: true });
            }
            const [removed] = player.queue.splice(idx, 1);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`🗑 Đã xoá: **${removed?.info?.title ?? "?"}**`)] });
        }
        case "move": {
            const from = interaction.options.getInteger("from", true) - 1;
            const to = interaction.options.getInteger("to", true) - 1;
            if (from < 0 || from >= player.queue.tracks.length || to < 0 || to >= player.queue.tracks.length) {
                return interaction.reply({ content: "❌ Vị trí không hợp lệ.", ephemeral: true });
            }
            const [moved] = player.queue.splice(from, 1);
            player.queue.add(moved, to);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`↕ Đã chuyển **${moved.info.title}** tới vị trí **${to + 1}**.`)] });
        }
        case "clear": {
            const n = player.queue.tracks.length;
            player.queue.splice(0, n);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`🧹 Đã xoá **${n}** bài khỏi hàng đợi.`)] });
        }
        case "replay": {
            await player.seek(0);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription("⏪ Phát lại từ đầu.")] });
        }
        case "filter": {
            const preset = interaction.options.getString("preset", true);
            const fm = player.filterManager;
            await fm.resetFilters().catch(() => {});
            switch (preset) {
                case "bass": await fm.setEQPreset("BassboostHigh"); break;
                case "nightcore": await fm.toggleNightcore(1.2, 1.2, 1.0); break;
                case "vaporwave": await fm.toggleVaporwave(0.85, 0.85, 1.0); break;
                case "8d": await fm.toggleRotation(0.2); break;
                case "rock": await fm.setEQPreset("Rock"); break;
                case "pop": await fm.setEQPreset("Pop"); break;
                case "classic": await fm.setEQPreset("Classic"); break;
                default: break;
            }
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`🎛 Bộ lọc: **${preset}**`)] });
        }
        case "247": {
            if (stay247.has(guildId)) {
                stay247.delete(guildId);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription("📌 Đã **tắt** chế độ 24/7.")] });
            }
            stay247.add(guildId);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription("📌 Đã **bật** 24/7 — bot sẽ không rời voice khi phòng trống.")] });
        }
        case "autoplay": {
            if (autoplay.has(guildId)) {
                autoplay.delete(guildId);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription("♾ Đã **tắt** autoplay.")] });
            }
            autoplay.add(guildId);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription("♾ Đã **bật** autoplay — tự tìm bài liên quan khi hết hàng đợi.")] });
        }
        default:
            return interaction.reply({ content: "❓ Lệnh chưa hỗ trợ.", ephemeral: true });
    }
}

// ─── Error handling ─────────────────────────────────────────────
client.on("error", (e) => console.error("❌ Discord client error:", e.message));
client.on("warn", (m) => console.warn("⚠️", m));

process.on("unhandledRejection", (reason) => {
    console.error(`[${INSTANCE_ID}] 🧨 Unhandled rejection:`, reason?.message || reason);
});
process.on("uncaughtException", (err) => {
    console.error(`[${INSTANCE_ID}] 🧨 Uncaught exception:`, err);
});

// ─── Graceful shutdown ──────────────────────────────────────────
let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`🛑 ${signal} — đang tắt...`);
    try {
        for (const player of client.lavalink.players.values()) {
            await player.destroy().catch(() => {});
        }
        client.destroy();
    } catch { /* ignore */ }
    health.close();
    setTimeout(() => process.exit(0), 500);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Login ──────────────────────────────────────────────────────
console.log("🚀 Đang đăng nhập...");
client.login(DISCORD_TOKEN).catch((e) => {
    console.error("❌ Đăng nhập thất bại:", e.message);
    process.exit(1);
});
