/**
 * ðŸŽµ Discord Music Bot â€” Lavalink v4
 * ---------------------------------------------------------------
 * Cháº¡y Ä‘Æ°á»£c trÃªn GitHub Actions, VPS, Docker, Fly.io, Railway...
 *
 * Biáº¿n mÃ´i trÆ°á»ng:
 *   DISCORD_TOKEN        (báº¯t buá»™c)  Token bot
 *   TOKEN_ENV            (tuá»³ chá»n)  TÃªn biáº¿n chá»©a token, vd: DISCORD_TOKEN_2
 *   LAVALINK_PASSWORD    (tuá»³ chá»n)  Máº­t kháº©u Lavalink cá»¥c bá»™
 *   LAVALINK_HOST        (máº·c Ä‘á»‹nh 127.0.0.1)
 *   LAVALINK_PORT        (máº·c Ä‘á»‹nh 2333)
 *   USE_LOCAL_LAVALINK   (1/0)       Æ¯u tiÃªn node cá»¥c bá»™
 *   BOT_NODE_INDEX       (tuá»³ chá»n)  Xoay vÃ²ng thá»© tá»± node dá»± phÃ²ng
 *   PORT                 (máº·c Ä‘á»‹nh 8080) cá»•ng health-check
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

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    console.error(`âŒ Thiáº¿u token (biáº¿n ${TOKEN_ENV} hoáº·c DISCORD_TOKEN)`);
    process.exit(1);
}

// â”€â”€â”€ Health-check server (cho Fly.io / Railway / uptime monitor) â”€
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

// â”€â”€â”€ Discord client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
    ],
});

// â”€â”€â”€ Lavalink nodes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Node cá»¥c bá»™ (do workflow/docker khá»Ÿi Ä‘á»™ng) â€” á»•n Ä‘á»‹nh nháº¥t.
// CÃ¡c node cÃ´ng khai chá»‰ lÃ  dá»± phÃ²ng khi node cá»¥c bá»™ cháº¿t.
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
    // Tá»± Ä‘á»™ng chuyá»ƒn player sang node khÃ¡c náº¿u node hiá»‡n táº¡i cháº¿t
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

// â”€â”€â”€ Tráº¡ng thÃ¡i má»Ÿ rá»™ng â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const stay247 = new Set();      // guild luÃ´n á»Ÿ láº¡i voice
const autoplay = new Set();     // guild tá»± phÃ¡t bÃ i liÃªn quan
const emptyTimers = new Map();  // guild -> timeout rá»i voice
const searchCache = new Map();  // userId -> { tracks, ts }
const nowPlayingMsgs = new Map(); // guildId -> { channelId, messageId }

// â”€â”€â”€ Slash commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const commands = [
    new SlashCommandBuilder()
        .setName("play").setDescription("ðŸŽµ PhÃ¡t nháº¡c tá»« YouTube/SoundCloud hoáº·c URL")
        .addStringOption((o) => o.setName("query").setDescription("TÃªn bÃ i hÃ¡t, playlist hoáº·c URL").setRequired(true)),
    new SlashCommandBuilder()
        .setName("search").setDescription("ðŸ”Ž TÃ¬m 10 káº¿t quáº£ vÃ  chá»n bÃ i Ä‘á»ƒ phÃ¡t")
        .addStringOption((o) => o.setName("query").setDescription("Tá»« khoÃ¡ tÃ¬m kiáº¿m").setRequired(true)),
    new SlashCommandBuilder()
        .setName("skip").setDescription("â­ Bá» qua bÃ i hiá»‡n táº¡i")
        .addIntegerOption((o) => o.setName("amount").setDescription("Sá»‘ bÃ i muá»‘n bá» qua").setMinValue(1).setMaxValue(20)),
    new SlashCommandBuilder().setName("stop").setDescription("â¹ Dá»«ng phÃ¡t vÃ  rá»i voice channel"),
    new SlashCommandBuilder().setName("pause").setDescription("â¸ Táº¡m dá»«ng"),
    new SlashCommandBuilder().setName("resume").setDescription("â–¶ Tiáº¿p tá»¥c phÃ¡t"),
    new SlashCommandBuilder().setName("queue").setDescription("ðŸ“œ Xem hÃ ng Ä‘á»£i")
        .addIntegerOption((o) => o.setName("page").setDescription("Trang").setMinValue(1)),
    new SlashCommandBuilder().setName("nowplaying").setDescription("ðŸŽ¶ BÃ i Ä‘ang phÃ¡t (kÃ¨m nÃºt Ä‘iá»u khiá»ƒn)"),
    new SlashCommandBuilder().setName("volume").setDescription("ðŸ”Š Chá»‰nh Ã¢m lÆ°á»£ng")
        .addIntegerOption((o) => o.setName("level").setDescription("1â€“200").setRequired(true).setMinValue(1).setMaxValue(200)),
    new SlashCommandBuilder().setName("loop").setDescription("ðŸ” Cháº¿ Ä‘á»™ láº·p")
        .addStringOption((o) => o.setName("mode").setDescription("Cháº¿ Ä‘á»™").setRequired(true)
            .addChoices(
                { name: "âŒ Táº¯t", value: "off" },
                { name: "ðŸ”‚ BÃ i hiá»‡n táº¡i", value: "track" },
                { name: "ðŸ” Cáº£ hÃ ng Ä‘á»£i", value: "queue" },
            )),
    new SlashCommandBuilder().setName("shuffle").setDescription("ðŸ”€ XÃ¡o trá»™n hÃ ng Ä‘á»£i"),
    new SlashCommandBuilder().setName("seek").setDescription("â© Tua tá»›i vá»‹ trÃ­")
        .addStringOption((o) => o.setName("time").setDescription("mm:ss hoáº·c ss (vd 1:30)").setRequired(true)),
    new SlashCommandBuilder().setName("remove").setDescription("ðŸ—‘ XoÃ¡ má»™t bÃ i khá»i hÃ ng Ä‘á»£i")
        .addIntegerOption((o) => o.setName("index").setDescription("Vá»‹ trÃ­ (xem /queue)").setRequired(true).setMinValue(1)),
    new SlashCommandBuilder().setName("move").setDescription("â†• Äá»•i vá»‹ trÃ­ bÃ i trong hÃ ng Ä‘á»£i")
        .addIntegerOption((o) => o.setName("from").setDescription("Tá»« vá»‹ trÃ­").setRequired(true).setMinValue(1))
        .addIntegerOption((o) => o.setName("to").setDescription("Tá»›i vá»‹ trÃ­").setRequired(true).setMinValue(1)),
    new SlashCommandBuilder().setName("clear").setDescription("ðŸ§¹ XoÃ¡ toÃ n bá»™ hÃ ng Ä‘á»£i (giá»¯ bÃ i Ä‘ang phÃ¡t)"),
    new SlashCommandBuilder().setName("replay").setDescription("âª PhÃ¡t láº¡i bÃ i hiá»‡n táº¡i tá»« Ä‘áº§u"),
    new SlashCommandBuilder().setName("filter").setDescription("ðŸŽ› Bá»™ lá»c Ã¢m thanh")
        .addStringOption((o) => o.setName("preset").setDescription("Chá»n bá»™ lá»c").setRequired(true)
            .addChoices(
                { name: "âŒ Táº¯t háº¿t", value: "off" },
                { name: "ðŸ”Š Bassboost", value: "bass" },
                { name: "ðŸŒ™ Nightcore", value: "nightcore" },
                { name: "ðŸŒŠ Vaporwave", value: "vaporwave" },
                { name: "ðŸŽ§ 8D Audio", value: "8d" },
                { name: "ðŸŽ¸ Rock", value: "rock" },
                { name: "ðŸŽ¹ Pop", value: "pop" },
                { name: "ðŸŽ» Classic", value: "classic" },
            )),
    new SlashCommandBuilder().setName("247").setDescription("ðŸ“Œ Giá»¯ bot á»Ÿ láº¡i voice channel 24/7"),
    new SlashCommandBuilder().setName("autoplay").setDescription("â™¾ Tá»± phÃ¡t bÃ i liÃªn quan khi háº¿t hÃ ng Ä‘á»£i"),
    new SlashCommandBuilder().setName("lyrics").setDescription("ðŸ“ Lá»i bÃ i hÃ¡t Ä‘ang phÃ¡t"),
    new SlashCommandBuilder().setName("ping").setDescription("ðŸ“¡ Kiá»ƒm tra Ä‘á»™ trá»… bot vÃ  node nháº¡c"),
    new SlashCommandBuilder().setName("debug").setDescription("ðŸ” ThÃ´ng tin ká»¹ thuáº­t"),
    new SlashCommandBuilder().setName("help").setDescription("â“ Danh sÃ¡ch lá»‡nh"),
].map((c) => c.toJSON());

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatDuration(ms) {
    if (!ms || ms === 0 || !Number.isFinite(ms)) return "ðŸ”´ LIVE";
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
    if (!total || total <= 0) return "â–¬".repeat(length);
    const ratio = Math.min(1, Math.max(0, current / total));
    const idx = Math.round(ratio * (length - 1));
    return "â–¬".repeat(idx) + "ðŸ”˜" + "â–¬".repeat(Math.max(0, length - idx - 1));
}

function requesterOf(track) {
    return track?.userData?.requester || track?.requester || null;
}

function trackEmbed(track, title = "ðŸŽµ Äang phÃ¡t", player = null) {
    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: title })
        .setTitle(track.info.title.slice(0, 250))
        .setURL(track.info.uri || null);

    const fields = [
        { name: "ðŸ‘¤ Nghá»‡ sÄ©", value: (track.info.author || "KhÃ´ng rÃµ").slice(0, 100), inline: true },
        { name: "â± Thá»i lÆ°á»£ng", value: formatDuration(track.info.duration), inline: true },
        { name: "ðŸ“¡ Nguá»“n", value: track.info.sourceName || "unknown", inline: true },
    ];
    if (player?.queue?.current === track) {
        fields.push({
            name: "ðŸŽš Tiáº¿n trÃ¬nh",
            value: `${formatDuration(player.position)} ${progressBar(player.position, track.info.duration)} ${formatDuration(track.info.duration)}`,
            inline: false,
        });
    }
    embed.addFields(fields);

    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    const req = requesterOf(track);
    if (req) embed.setFooter({ text: `YÃªu cáº§u bá»Ÿi ${req.username || req.tag || "ai Ä‘Ã³"}` });
    return embed;
}

function controlRow(player) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("np:toggle")
            .setEmoji(player.paused ? "â–¶ï¸" : "â¸ï¸")
            .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("np:skip").setEmoji("â­ï¸").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("np:shuffle").setEmoji("ðŸ”€").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("np:loop")
            .setEmoji("ðŸ”")
            .setStyle(player.repeatMode === "off" ? ButtonStyle.Secondary : ButtonStyle.Success),
        new ButtonBuilder().setCustomId("np:stop").setEmoji("â¹ï¸").setStyle(ButtonStyle.Danger),
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
        console.log(`âœ… ÄÃ£ Ä‘Äƒng kÃ½ ${commands.length} slash commands`);
    } catch (err) {
        console.error("âŒ ÄÄƒng kÃ½ commands tháº¥t báº¡i:", err.message);
    }
}

function getPlayer(guildId) {
    return client.lavalink.getPlayer(guildId);
}

async function ensureVoice(interaction) {
    const guild = interaction.guild ?? (await client.guilds.fetch(interaction.guildId).catch(() => null));
    if (!guild) return { error: "âŒ KhÃ´ng tÃ¬m tháº¥y server." };

    let member = interaction.member;
    if (!member?.voice) {
        member = await guild.members.fetch(interaction.user.id).catch(() => null);
    }
    const channel = member?.voice?.channel;
    if (!channel) return { error: "âŒ Báº¡n cáº§n vÃ o má»™t voice channel trÆ°á»›c!" };
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
 * TÃ¬m nháº¡c vá»›i chuá»—i nguá»“n dá»± phÃ²ng.
 * YouTube trÆ°á»›c, rá»“i SoundCloud, rá»“i Deezer (náº¿u node cÃ³ LavaSrc).
 */
const SOURCE_CHAIN = ["ytsearch", "ytmsearch", "scsearch", "dzsearch"];

async function searchWithFallback(player, query, requester) {
    const isUrl = /^https?:\/\//i.test(query);
    if (isUrl) {
        try {
            const res = await player.search({ query }, requester);
            if (res?.tracks?.length) return res;
        } catch (e) {
            console.warn(`[SEARCH] URL lá»—i: ${e.message}`);
        }
    }

    for (const source of SOURCE_CHAIN) {
        try {
            const res = await player.search({ query: `${source}:${query}` }, requester);
            if (res?.tracks?.length) {
                console.log(`[SEARCH] "${query.slice(0, 40)}" â†’ ${source} (${res.tracks.length})`);
                return res;
            }
        } catch (e) {
            console.warn(`[SEARCH] ${source} lá»—i: ${e.message?.slice(0, 100)}`);
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
 * Nháº­n diá»‡n link playlist YouTube.
 *  - list=PL... / OLAK... / UU...  â†’ playlist tháº­t, cá»‘ Ä‘á»‹nh
 *  - list=RD...                    â†’ Mix/radio tá»± Ä‘á»™ng, YouTube Ä‘á»•i má»—i láº§n má»Ÿ
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

// â”€â”€â”€ Ready â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
client.once("ready", async () => {
    console.log(`ðŸ¤– Online: ${client.user.tag} | ${client.guilds.cache.size} server`);
    client.user.setPresence({
        activities: [{ name: "/play â€¢ nháº¡c chill 24/7", type: 2 }],
        status: "online",
    });
    try {
        await client.lavalink.init({ id: client.user.id, username: client.user.username });
    } catch (e) {
        console.error("âŒ init Lavalink:", e.message);
    }
    await registerCommands();
});

// â”€â”€â”€ Voice: tá»± rá»i khi phÃ²ng trá»‘ng â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            ch?.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription("ðŸ‘‹ KhÃ´ng cÃ²n ai trong voice â€” bot Ä‘Ã£ rá»i.")] }).catch(() => {});
            await p?.destroy().catch(() => {});
            emptyTimers.delete(guildId);
        }, 60_000);
        emptyTimers.set(guildId, timer);
    } else if (humans > 0 && emptyTimers.has(guildId)) {
        clearTimeout(emptyTimers.get(guildId));
        emptyTimers.delete(guildId);
    }
});

// â”€â”€â”€ Lavalink events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
client.lavalink.nodeManager.on("connect", (node) => console.log(`âœ… Node ${node.id} connected`));
client.lavalink.nodeManager.on("disconnect", (node, reason) => console.warn(`âš ï¸ Node ${node.id} disconnected: ${reason}`));
client.lavalink.nodeManager.on("error", (node, err) => console.error(`âŒ Node ${node.id}: ${err.message}`));
client.lavalink.nodeManager.on("reconnecting", (node) => console.log(`ðŸ”„ Node ${node.id} reconnecting...`));

client.lavalink.on("trackStart", (player, track) => {
    console.log(`â–¶ [${INSTANCE_ID}] ${track.info.title} (${player.node?.id || "?"})`);
    if (player.paused) player.resume().catch(() => {});
    const ch = client.channels.cache.get(player.textChannelId);
    if (ch) {
        ch.send({ embeds: [trackEmbed(track, "ðŸŽµ Äang phÃ¡t", player)], components: [controlRow(player)] })
            .then((msg) => nowPlayingMsgs.set(player.guildId, { channelId: ch.id, messageId: msg.id }))
            .catch(() => {});
    }
});

client.lavalink.on("trackEnd", (player, track, payload) => {
    if (payload?.reason === "replaced") return;
    console.log(`â¹ Track end: ${track?.info?.title} (${payload?.reason})`);
});

// â”€â”€â”€ Cáº­p nháº­t thanh tiáº¿n trÃ¬nh má»—i 3 giÃ¢y â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Lavalink gá»­i playerUpdate má»—i 2s (application.yml) â†’ 3s cho thanh cháº¡y mÆ°á»£t.
// Váº«n dÆ°á»›i giá»›i háº¡n 5 láº§n sá»­a/5 giÃ¢y cá»§a Discord (3s â‰ˆ 1,7 láº§n/5s).
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
                embeds: [trackEmbed(track, player.paused ? "â¸ Äang táº¡m dá»«ng" : "ðŸŽ¶ Äang phÃ¡t", player)],
                components: [controlRow(player)],
            });
        } catch (e) {
            if (e?.code === 10008 || e?.status === 404) nowPlayingMsgs.delete(guildId);
        }
    }
}
setInterval(refreshNowPlaying, 3_000);

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
                    ch?.send({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription(`â™¾ **Autoplay:** ${next.info.title}`)] }).catch(() => {});
                    return;
                }
            }
        } catch (e) {
            console.warn("[AUTOPLAY]", e.message);
        }
    }

    if (stay247.has(guildId)) {
        ch?.send({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription("ðŸ“­ Háº¿t hÃ ng Ä‘á»£i. Bot váº«n á»Ÿ láº¡i vÃ¬ **24/7** Ä‘ang báº­t.")] }).catch(() => {});
        return;
    }

    ch?.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription("ðŸ“­ Háº¿t hÃ ng Ä‘á»£i â€” rá»i voice sau 2 phÃºt.")] }).catch(() => {});
    setTimeout(() => {
        if (!player.playing && !stay247.has(guildId)) player.destroy().catch(() => {});
    }, 120_000);
});

client.lavalink.on("trackError", async (player, track, payload) => {
    console.error(`âŒ Track error: ${track?.info?.title} â€” ${payload?.exception?.message || payload?.error}`);
    const ch = client.channels.cache.get(player.textChannelId);

    const res = await searchWithFallback(player, track.info.title, requesterOf(track)).catch(() => null);
    const alt = res?.tracks?.find((t) => t.info.uri !== track.info.uri);

    if (alt) {
        tagRequester([alt], requesterOf(track));
        player.queue.add(alt, 0);
        ch?.send({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`âš ï¸ Lá»—i nguá»“n, thá»­ nguá»“n khÃ¡c: **${alt.info.title}**`)] }).catch(() => {});
    } else {
        ch?.send({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription(`âŒ KhÃ´ng phÃ¡t Ä‘Æ°á»£c: **${track?.info?.title}**`)] }).catch(() => {});
        if (player.queue.tracks.length) player.skip().catch(() => {});
        else player.stopPlaying().catch(() => {});
    }
});

client.lavalink.on("trackStuck", async (player, track) => {
    console.warn(`âš ï¸ Track stuck: ${track.info.title}`);
    const ch = client.channels.cache.get(player.textChannelId);
    ch?.send({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`âš ï¸ BÃ i bá»‹ káº¹t: **${track.info.title}** â€” bá» qua.`)] }).catch(() => {});
    if (player.queue.tracks.length) player.skip().catch(() => {});
    else player.stopPlaying().catch(() => {});
});

// â”€â”€â”€ Interaction handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            content: "âŒ CÃ³ lá»—i xáº£y ra: `" + (err.message || "unknown").slice(0, 120) + "`",
            ephemeral: true,
        });
    }
});

async function handleButton(interaction) {
    const player = getPlayer(interaction.guildId);
    if (!player) {
        return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ player nÃ o Ä‘ang hoáº¡t Ä‘á»™ng.", ephemeral: true });
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
        embeds: [trackEmbed(current, player.paused ? "â¸ Äang táº¡m dá»«ng" : "ðŸŽ¶ Äang phÃ¡t", player)],
        components: [controlRow(player)],
    });
}

async function handleSearchPick(interaction) {
    const cached = searchCache.get(interaction.user.id);
    if (!cached || Date.now() - cached.ts > 5 * 60_000) {
        return interaction.update({ content: "âŒ› Káº¿t quáº£ Ä‘Ã£ háº¿t háº¡n, hÃ£y dÃ¹ng `/search` láº¡i.", embeds: [], components: [] });
    }
    const idx = Number(interaction.values[0]);
    const track = cached.tracks[idx];
    if (!track) return interaction.update({ content: "âŒ KhÃ´ng tÃ¬m tháº¥y bÃ i.", embeds: [], components: [] });

    const v = await ensureVoice(interaction);
    if (v.error) return interaction.update({ content: v.error, embeds: [], components: [] });

    const player = await getOrCreatePlayer(v.guild, v.channel, interaction.channelId);
    tagRequester([track], interaction.user);
    player.queue.add(track);
    if (!player.playing) await player.play();

    return interaction.update({
        content: `âœ… ÄÃ£ thÃªm: **${track.info.title}**`,
        embeds: [],
        components: [],
    });
}

async function handleCommand(interaction) {
    const { commandName, guildId } = interaction;
    if (!guildId) {
        return interaction.reply({ content: "âŒ Chá»‰ dÃ¹ng Ä‘Æ°á»£c trong server.", ephemeral: true });
    }

    // â”€â”€ /help â”€â”€
    if (commandName === "help") {
        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("ðŸŽµ Music Bot â€” Danh sÃ¡ch lá»‡nh")
            .setDescription(
                [
                    "**PhÃ¡t nháº¡c**",
                    "`/play <tá»« khoÃ¡|URL>` â€” phÃ¡t hoáº·c thÃªm vÃ o hÃ ng Ä‘á»£i",
                    "`/search <tá»« khoÃ¡>` â€” chá»n tá»« 10 káº¿t quáº£",
                    "**Äiá»u khiá»ƒn**",
                    "`/pause` `/resume` `/skip [sá»‘]` `/stop` `/seek <mm:ss>` `/replay`",
                    "**HÃ ng Ä‘á»£i**",
                    "`/queue [trang]` `/shuffle` `/remove <vá»‹ trÃ­>` `/move <tá»«> <tá»›i>` `/clear`",
                    "**Ã‚m thanh**",
                    "`/volume <1-200>` `/filter <preset>`",
                    "**KhÃ¡c**",
                    "`/247` `/autoplay` `/nowplaying` `/lyrics` `/ping` `/debug`",
                ].join("\n")
            )
            .setFooter({ text: `Instance ${INSTANCE_ID}` });
        return interaction.reply({ embeds: [embed] });
    }

    // â”€â”€ /ping â”€â”€
    if (commandName === "ping") {
        const node = [...client.lavalink.nodeManager.nodes.values()].find((n) => n.connected);
        const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setDescription(
                [
                    `ðŸ“¡ **WebSocket:** ${client.ws.ping}ms`,
                    `ðŸŽ§ **Node:** ${node ? `${node.id} â€” ${node.ping}ms` : "âŒ khÃ´ng cÃ³ node"}`,
                    `â± **Uptime:** ${formatDuration(Date.now() - STARTED_AT)}`,
                ].join("\n")
            );
        return interaction.reply({ embeds: [embed] });
    }

    // â”€â”€ /debug â”€â”€
    if (commandName === "debug") {
        const player = getPlayer(guildId);
        const nodes = [...client.lavalink.nodeManager.nodes.values()].map(
            (n) => `â€¢ \`${n.id}\` â€” ${n.connected ? "âœ…" : "âŒ"} ${n.ping ?? "?"}ms`
        );
        return interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle("ðŸ” Debug")
                    .addFields(
                        { name: "Instance", value: `\`${INSTANCE_ID}\``, inline: true },
                        { name: "Guilds", value: `${client.guilds.cache.size}`, inline: true },
                        { name: "Players", value: `${client.lavalink.players.size}`, inline: true },
                        { name: "Nodes", value: nodes.join("\n") || "â€”" },
                        {
                            name: "Player",
                            value: player
                                ? `Node: \`${player.node?.id}\`\nPlaying: ${player.playing}\nPaused: ${player.paused}\nVolume: ${player.volume}\nQueue: ${player.queue.tracks.length}`
                                : "â€”",
                        }
                    ),
            ],
        });
    }

    // â”€â”€ /play â”€â”€
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
            // â”€â”€ LINK: má»Ÿ Ä‘Ãºng playlist, TUYá»†T Äá»I khÃ´ng fallback sang tÃ¬m kiáº¿m â”€â”€
            const target = playlistInfo?.url || raw;
            res = await player.search({ query: target }, interaction.user).catch(() => null);

            // Má»™t sá»‘ node chá»‰ tráº£ 1 bÃ i khi link cÃ³ &list= â†’ thá»­ láº¡i báº±ng playlist URL
            if ((!res?.tracks?.length || res.loadType === "track") && playlistInfo) {
                const retry = await player.search({ query: playlistInfo.url }, interaction.user).catch(() => null);
                if (retry?.tracks?.length) res = retry;
            }

            if (!res?.tracks?.length) {
                return interaction.editReply({
                    content:
                        "âŒ KhÃ´ng má»Ÿ Ä‘Æ°á»£c link nÃ y.\n" +
                        "â€¢ Link cÃ³ thá»ƒ bá»‹ YouTube cháº·n / video riÃªng tÆ° / Ä‘Ã£ xoÃ¡\n" +
                        "â€¢ Thá»­ láº¡i báº±ng tÃªn bÃ i hÃ¡t (bot sáº½ tÃ¬m trÃªn YouTube)",
                });
            }
        } else {
            res = await searchWithFallback(player, raw, interaction.user);
            if (!res?.tracks?.length) {
                return interaction.editReply({ content: "âŒ KhÃ´ng tÃ¬m tháº¥y bÃ i nÃ o. Thá»­ tá»« khoÃ¡ khÃ¡c nhÃ©!" });
            }
        }

        const MAX_TRACKS = 200;
        let tracks = res.loadType === "playlist" ? res.tracks.slice(0, MAX_TRACKS) : [res.tracks[0]];
        if (res.loadType === "playlist" && res.tracks.length > MAX_TRACKS) {
            console.warn(`[PLAY] playlist ${res.tracks.length} bÃ i, chá»‰ thÃªm ${MAX_TRACKS}`);
        }

        tagRequester(tracks, interaction.user);
        player.queue.add(tracks);
        if (player.paused) await player.resume();
        if (!player.playing) await player.play();

        if (res.loadType === "playlist") {
            const radioNote = playlistInfo?.isRadio
                ? "\n\nâš ï¸ **ÄÃ¢y lÃ  YouTube Mix (radio)** â€” danh sÃ¡ch do YouTube tá»± táº¡o vÃ  **thay Ä‘á»•i má»—i láº§n má»Ÿ**, nÃªn khÃ´ng thá»ƒ giá»‘ng 100% cÃ¡i báº¡n Ä‘ang xem. Muá»‘n cá»‘ Ä‘á»‹nh, dÃ¹ng link playlist tháº­t (`list=PLâ€¦`)."
                : "";
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(playlistInfo?.isRadio ? 0xfee75c : 0x57f287)
                        .setTitle(`ðŸ“¥ Playlist: ${res.playlist?.name || "khÃ´ng tÃªn"}`)
                        .setDescription(
                            `âœ… ÄÃ£ thÃªm **${tracks.length}** bÃ i theo Ä‘Ãºng thá»© tá»±.\n\n` +
                                tracks.slice(0, 5).map((t, i) => `**${i + 1}.** ${t.info.title}`).join("\n") +
                                (tracks.length > 5 ? `\nâ€¦ vÃ  **${tracks.length - 5}** bÃ i ná»¯a` : "") +
                                radioNote
                        ),
                ],
            });
        }
        return interaction.editReply({
            embeds: [trackEmbed(tracks[0], player.playing ? "âž• ÄÃ£ thÃªm vÃ o hÃ ng Ä‘á»£i" : "ðŸŽµ Äang phÃ¡t", player)],
        });
    }

    // â”€â”€ /search â”€â”€
    if (commandName === "search") {
        const v = await ensureVoice(interaction);
        if (v.error) return interaction.reply({ content: v.error, ephemeral: true });

        await interaction.deferReply();
        const query = interaction.options.getString("query", true);
        const player = await getOrCreatePlayer(v.guild, v.channel, interaction.channelId);
        const res = await searchWithFallback(player, query, interaction.user);

        if (!res?.tracks?.length) return interaction.editReply({ content: "âŒ KhÃ´ng cÃ³ káº¿t quáº£." });

        const tracks = res.tracks.slice(0, 10);
        searchCache.set(interaction.user.id, { tracks, ts: Date.now() });

        const menu = new StringSelectMenuBuilder()
            .setCustomId("search:pick")
            .setPlaceholder("Chá»n bÃ i Ä‘á»ƒ phÃ¡t")
            .addOptions(
                tracks.map((t, i) => ({
                    label: t.info.title.slice(0, 90),
                    description: `${t.info.author || "?"} â€¢ ${formatDuration(t.info.duration)}`.slice(0, 90),
                    value: String(i),
                }))
            );

        return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865f2)
                    .setTitle(`ðŸ”Ž Káº¿t quáº£ cho: ${query}`)
                    .setDescription(tracks.map((t, i) => `**${i + 1}.** ${t.info.title} \`${formatDuration(t.info.duration)}\``).join("\n")),
            ],
            components: [new ActionRowBuilder().addComponents(menu)],
        });
    }

    // â”€â”€ /lyrics â”€â”€
    if (commandName === "lyrics") {
        const p = getPlayer(guildId);
        if (!p?.queue?.current) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i nÃ o Ä‘ang phÃ¡t.", ephemeral: true });
        }
        await interaction.deferReply();
        try {
            const res = await p.getCurrentLyrics();
            const text = res?.lyrics || res?.plainLyrics;
            if (!text) return interaction.editReply({ content: "âŒ KhÃ´ng tÃ¬m tháº¥y lá»i bÃ i hÃ¡t cho bÃ i nÃ y." });
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle(`ðŸ“ ${p.queue.current.info.title}`.slice(0, 250))
                        .setDescription(text.slice(0, 4000)),
                ],
            });
        } catch {
            return interaction.editReply({ content: "âŒ Node nháº¡c khÃ´ng há»— trá»£ lá»i bÃ i hÃ¡t." });
        }
    }

    // CÃ¡c lá»‡nh cáº§n player
    const player = getPlayer(guildId);
    const needPlayer = ["skip", "stop", "pause", "resume", "queue", "nowplaying", "volume", "loop",
        "shuffle", "seek", "remove", "move", "clear", "replay", "filter", "247", "autoplay"];
    if (needPlayer.includes(commandName) && !player) {
        return interaction.reply({ content: "âŒ ChÆ°a cÃ³ nháº¡c nÃ o Ä‘ang phÃ¡t. DÃ¹ng `/play` trÆ°á»›c nhÃ©!", ephemeral: true });
    }

    switch (commandName) {
        case "skip": {
            const amount = interaction.options.getInteger("amount") || 1;
            const title = player.queue.current?.info?.title || "?";
            await player.skip(amount > 1 ? amount : undefined).catch(() => {});
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`â­ ÄÃ£ bá» qua **${title}**`)] });
        }
        case "stop": {
            await player.destroy();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xed4245).setDescription("â¹ ÄÃ£ dá»«ng vÃ  rá»i voice.")] });
        }
        case "pause":
            if (player.paused) return interaction.reply({ content: "â¸ Äang táº¡m dá»«ng rá»“i.", ephemeral: true });
            await player.pause();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription("â¸ ÄÃ£ táº¡m dá»«ng.")] });
        case "resume":
            await player.resume();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription("â–¶ Tiáº¿p tá»¥c phÃ¡t.")] });
        case "queue": {
            const perPage = 10;
            const pages = Math.max(1, Math.ceil(player.queue.tracks.length / perPage));
            const page = Math.min(pages, Math.max(1, interaction.options.getInteger("page") || 1));
            const slice = player.queue.tracks.slice((page - 1) * perPage, page * perPage);
            const totalMs = player.queue.tracks.reduce((a, t) => a + (t.info.duration || 0), 0);

            const desc = [
                `**Äang phÃ¡t:** [${player.queue.current?.info?.title}](${player.queue.current?.info?.uri}) \`${formatDuration(player.queue.current?.info?.duration)}\``,
                "",
                ...slice.map((t, i) => `**${(page - 1) * perPage + i + 1}.** ${t.info.title} \`${formatDuration(t.info.duration)}\``),
            ].join("\n");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x5865f2)
                        .setTitle(`ðŸ“œ HÃ ng Ä‘á»£i â€” trang ${page}/${pages}`)
                        .setDescription(desc.slice(0, 4000))
                        .setFooter({ text: `${player.queue.tracks.length} bÃ i â€¢ tá»•ng ${formatDuration(totalMs)}` }),
                ],
            });
        }
        case "nowplaying": {
            const cur = player.queue.current;
            if (!cur) return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i nÃ o Ä‘ang phÃ¡t.", ephemeral: true });
            return interaction.reply({
                embeds: [trackEmbed(cur, player.paused ? "â¸ Äang táº¡m dá»«ng" : "ðŸŽ¶ Äang phÃ¡t", player)],
                components: [controlRow(player)],
            });
        }
        case "volume": {
            const level = interaction.options.getInteger("level", true);
            await player.setVolume(level);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`ðŸ”Š Ã‚m lÆ°á»£ng: **${level}%**`)] });
        }
        case "loop": {
            const mode = interaction.options.getString("mode", true);
            await player.setRepeatMode(mode);
            const label = { off: "âŒ Táº¯t láº·p", track: "ðŸ”‚ Láº·p bÃ i hiá»‡n táº¡i", queue: "ðŸ” Láº·p cáº£ hÃ ng Ä‘á»£i" }[mode];
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(label)] });
        }
        case "shuffle": {
            const n = await player.queue.shuffle();
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`ðŸ”€ ÄÃ£ xÃ¡o trá»™n **${n ?? player.queue.tracks.length}** bÃ i.`)] });
        }
        case "seek": {
            const ms = parseTime(interaction.options.getString("time", true));
            if (ms === null) return interaction.reply({ content: "âŒ Äá»‹nh dáº¡ng thá»i gian khÃ´ng há»£p lá»‡ (vd `1:30`).", ephemeral: true });
            await player.seek(ms);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`â© Tua tá»›i **${formatDuration(ms)}**`)] });
        }
        case "remove": {
            const idx = interaction.options.getInteger("index", true) - 1;
            if (idx < 0 || idx >= player.queue.tracks.length) {
                return interaction.reply({ content: "âŒ Vá»‹ trÃ­ khÃ´ng há»£p lá»‡.", ephemeral: true });
            }
            const [removed] = player.queue.splice(idx, 1);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`ðŸ—‘ ÄÃ£ xoÃ¡: **${removed?.info?.title ?? "?"}**`)] });
        }
        case "move": {
            const from = interaction.options.getInteger("from", true) - 1;
            const to = interaction.options.getInteger("to", true) - 1;
            if (from < 0 || from >= player.queue.tracks.length || to < 0 || to >= player.queue.tracks.length) {
                return interaction.reply({ content: "âŒ Vá»‹ trÃ­ khÃ´ng há»£p lá»‡.", ephemeral: true });
            }
            const [moved] = player.queue.splice(from, 1);
            player.queue.add(moved, to);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`â†• ÄÃ£ chuyá»ƒn **${moved.info.title}** tá»›i vá»‹ trÃ­ **${to + 1}**.`)] });
        }
        case "clear": {
            const n = player.queue.tracks.length;
            player.queue.splice(0, n);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription(`ðŸ§¹ ÄÃ£ xoÃ¡ **${n}** bÃ i khá»i hÃ ng Ä‘á»£i.`)] });
        }
        case "replay": {
            await player.seek(0);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x5865f2).setDescription("âª PhÃ¡t láº¡i tá»« Ä‘áº§u.")] });
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
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription(`ðŸŽ› Bá»™ lá»c: **${preset}**`)] });
        }
        case "247": {
            if (stay247.has(guildId)) {
                stay247.delete(guildId);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription("ðŸ“Œ ÄÃ£ **táº¯t** cháº¿ Ä‘á»™ 24/7.")] });
            }
            stay247.add(guildId);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription("ðŸ“Œ ÄÃ£ **báº­t** 24/7 â€” bot sáº½ khÃ´ng rá»i voice khi phÃ²ng trá»‘ng.")] });
        }
        case "autoplay": {
            if (autoplay.has(guildId)) {
                autoplay.delete(guildId);
                return interaction.reply({ embeds: [new EmbedBuilder().setColor(0xfee75c).setDescription("â™¾ ÄÃ£ **táº¯t** autoplay.")] });
            }
            autoplay.add(guildId);
            return interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57f287).setDescription("â™¾ ÄÃ£ **báº­t** autoplay â€” tá»± tÃ¬m bÃ i liÃªn quan khi háº¿t hÃ ng Ä‘á»£i.")] });
        }
        default:
            return interaction.reply({ content: "â“ Lá»‡nh chÆ°a há»— trá»£.", ephemeral: true });
    }
}

// â”€â”€â”€ Error handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
client.on("error", (e) => console.error("âŒ Discord client error:", e.message));
client.on("warn", (m) => console.warn("âš ï¸", m));

process.on("unhandledRejection", (reason) => {
    console.error(`[${INSTANCE_ID}] ðŸ§¨ Unhandled rejection:`, reason?.message || reason);
});
process.on("uncaughtException", (err) => {
    console.error(`[${INSTANCE_ID}] ðŸ§¨ Uncaught exception:`, err);
});

// â”€â”€â”€ Graceful shutdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let shuttingDown = false;
async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`ðŸ›‘ ${signal} â€” Ä‘ang táº¯t...`);
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

// â”€â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log("ðŸš€ Äang Ä‘Äƒng nháº­p...");
client.login(DISCORD_TOKEN).catch((e) => {
    console.error("âŒ ÄÄƒng nháº­p tháº¥t báº¡i:", e.message);
    process.exit(1);
});
