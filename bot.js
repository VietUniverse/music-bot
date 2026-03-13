const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { LavalinkManager } = require("lavalink-client");

// ─── Config ────────────────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD || "youshallnotpass";
const INSTANCE_ID = Math.random().toString(36).substring(7).toUpperCase();

console.log(`[BOT] Instance ID: ${INSTANCE_ID}`);

if (!DISCORD_TOKEN) {
    console.error("❌ DISCORD_TOKEN is required!");
    process.exit(1);
}

// ─── Discord Client ────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

// ─── Lavalink Manager ──────────────────────────────────────────
const priorityNodes = [
    { authorization: "youshallnotpass", host: "127.0.0.1", port: 2333, secure: false, id: "localhost-action", retryDelay: 5000, retryAmount: Infinity },
    { authorization: "https://discord.gg/mjS5J2K3ep", host: "lava-v4.millohost.my.id", port: 443, secure: true, id: "millohost", retryDelay: 5000, retryAmount: Infinity }
];
console.log(`[BOT] Assigned to priority node ${priorityNodes[0].id} with ${priorityNodes.length - 1} fallbacks.`);

client.lavalink = new LavalinkManager({
    nodes: priorityNodes,
    sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    autoSkip: true,
    client: {
        id: null // set on ready
    }
});

client.on("raw", (d) => client.lavalink.sendRawData(d));

const commands = [
    new SlashCommandBuilder().setName("play").setDescription("🎵 Phát nhạc từ YouTube/SoundCloud/URL")
        .addStringOption(o => o.setName("query").setDescription("Tên bài hát hoặc URL").setRequired(true)),
    new SlashCommandBuilder().setName("skip").setDescription("⏭ Bỏ qua bài hiện tại"),
    new SlashCommandBuilder().setName("stop").setDescription("⏹ Dừng phát & rời voice channel"),
    new SlashCommandBuilder().setName("queue").setDescription("📜 Xem danh sách phát"),
    new SlashCommandBuilder().setName("nowplaying").setDescription("🎶 Bài đang phát"),
    new SlashCommandBuilder().setName("pause").setDescription("⏸ Tạm dừng"),
    new SlashCommandBuilder().setName("resume").setDescription("▶ Tiếp tục phát"),
    new SlashCommandBuilder().setName("volume").setDescription("🔊 Chỉnh âm lượng")
        .addIntegerOption(o => o.setName("level").setDescription("Âm lượng (1-150)").setRequired(true).setMinValue(1).setMaxValue(150)),
    new SlashCommandBuilder().setName("loop").setDescription("🔁 Lặp lại bài hát / queue")
        .addStringOption(o => o.setName("mode").setDescription("Chế độ lặp").setRequired(true)
            .addChoices(
                { name: "❌ Tắt lặp", value: "off" },
                { name: "🔂 Lặp bài hiện tại", value: "track" },
                { name: "🔁 Lặp cả queue", value: "queue" },
            )),
    new SlashCommandBuilder().setName("replay").setDescription("⏪ Phát lại bài hiện tại từ đầu"),
];

// ─── Helper Functions ──────────────────────────────────────────
function formatDuration(ms) {
    if (!ms || ms === 0) return "🔴 LIVE";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function trackEmbed(track, title = "🎵 Đang phát") {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(title)
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .addFields(
            { name: "👤 Nghệ sĩ", value: track.info.author || "Unknown", inline: true },
            { name: "⏱ Thời lượng", value: formatDuration(track.info.duration), inline: true },
        );
    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    if (track.requester) embed.setFooter({ text: `Yêu cầu bởi ${track.requester.username}` });
    return embed;
}

// ─── Register Slash Commands ───────────────────────────────────
async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    try {
        console.log("📝 Đang đăng ký slash commands...");
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands.map(c => c.toJSON()),
        });
        console.log("✅ Đã đăng ký slash commands!");
    } catch (err) {
        console.error("❌ Lỗi đăng ký commands:", err);
    }
}

// ─── Bot Ready ─────────────────────────────────────────────────
client.once("ready", async () => {
    console.log(`🤖 Bot online: ${client.user.tag}`);
    client.lavalink.options.client.id = client.user.id;
    try {
        await client.lavalink.init({ id: client.user.id, username: client.user.username });
    } catch (e) {
        console.error("❌ Lỗi khởi tạo Lavalink:", e);
    }
    await registerCommands();
});

// ─── Auto-leave when voice channel is empty ─────────────────
const emptyTimers = new Map();

client.on("voiceStateUpdate", (oldState, newState) => {
    // Only care about the guild where bot is playing
    const guildId = oldState.guild.id || newState.guild.id;
    const player = client.lavalink.getPlayer(guildId);
    if (!player) return;

    const voiceChannel = oldState.guild.channels.cache.get(player.voiceChannelId);
    if (!voiceChannel) return;

    // Count non-bot members in the voice channel
    const humans = voiceChannel.members.filter(m => !m.user.bot).size;

    if (humans === 0) {
        // No humans left, start 30s timer
        if (!emptyTimers.has(guildId)) {
            const timer = setTimeout(() => {
                const ch = client.channels.cache.get(player.textChannelId);
                if (ch) ch.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("👋 Không còn ai trong voice channel \u2014 đã rời!")] }).catch(() => { });
                player.destroy();
                emptyTimers.delete(guildId);
            }, 30000);
            emptyTimers.set(guildId, timer);
        }
    } else {
        // Someone joined back, cancel timer
        if (emptyTimers.has(guildId)) {
            clearTimeout(emptyTimers.get(guildId));
            emptyTimers.delete(guildId);
        }
    }
});

// ─── Lavalink Events ──────────────────────────────────────────
client.lavalink.nodeManager.on("error", (node, error) => {
    console.error(`❌ Lavalink Node ${node.id} Error: ${error.message}`);
});

client.lavalink.nodeManager.on("connect", (node) => {
    console.log(`✅ Lavalink Node ${node.id} Connected!`);
});

client.lavalink.nodeManager.on("disconnect", (node, reason) => {
    console.log(`❌ Lavalink Node ${node.id} Disconnected:`, reason);
});

client.lavalink.on("playerCreate", (player) => {
    console.log(`🟡 Player Created for ${player.guildId} on node: ${player.node?.id || "unknown"}`);
});
client.lavalink.on("playerDestroy", (player) => console.log(`🔴 Player Destroyed for ${player.guildId}`));

client.lavalink.on("playerUpdate", (player) => {
    console.log(`🔹 [${INSTANCE_ID}] Player Update for ${player.guildId}: Node: ${player.node?.id || "unknown"}, Connected: ${player.connected}, Playing: ${player.playing}, Volume: ${player.volume}%`);
    if (player.connected && !player.playing && player.queue.current) {
        console.log(`⚠️ [${INSTANCE_ID}] Player STUCK on ${player.guildId} - State:`, player.state);
    }
});

process.on("unhandledRejection", (reason) => console.error("❌ Unhandled Rejection:", reason));
process.on("uncaughtException", (err) => console.error("❌ Uncaught Exception:", err));
client.lavalink.on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    console.log(`🔊 [${INSTANCE_ID}] Track Start: ${track.info.title} on node: ${player.node?.id || "unknown"}`);
    
    // Force audio state to ensure it's not silent
    player.setVolume(100);
    if (player.paused) player.resume();

    if (channel) {
        channel.send({ embeds: [trackEmbed(track, "🎵 Đang phát")] }).catch(() => { });
    }
});

client.lavalink.on("queueEnd", (player) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
        channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("📭 Hết nhạc trong queue — sẽ rời voice channel sau 3 phút.")] }).catch(() => { });
    }
    setTimeout(() => {
        if (!player.playing) player.destroy();
    }, 180000);
});

client.lavalink.on("trackStuck", (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription(`⚠️ Track bị stuck: **${track.info.title}** — đang skip...`)] }).catch(() => { });
    if (player.queue.tracks.length > 0) {
        player.skip();
    } else {
        player.stopPlaying();
    }
});

client.lavalink.on("trackError", (player, track, payload) => {
    console.error("❌ Lavalink Track Error:", payload.error || payload);
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription(`❌ Lỗi phát: **${track.info.title}**\nChi tiết: \`${payload.error || "Unknown Error"}\` — đang skip...`)] }).catch(() => { });
    if (player.queue.tracks.length > 0) {
        player.skip();
    } else {
        player.stopPlaying();
    }
});

// ─── Interaction Handler ───────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channel, guildId } = interaction;

    if (!guildId) {
        return interaction.reply({ content: "❌ Các lệnh nhạc chỉ có thể dùng trong server!", ephemeral: true });
    }

    let guild = interaction.guild;

    // Nếu không lấy được guild (bot chưa được add vào server mà dùng bằng User App)
    if (!guild) {
        try {
            guild = await client.guilds.fetch(guildId);
        } catch (e) {
            console.error("❌ Error fetching guild:", e);
            return interaction.reply({
                content: "❌ **Lỗi:** Bot chưa tham gia Server này!\n\nBạn đang dùng lệnh qua tính năng User App (ứng dụng cài vào cá nhân), nhưng để bot vào **Voice Channel** hát thì bot BẮT BUỘC phải được Add trực tiếp vào Server này.\n\n👉 Vui lòng gửi link mời bot cho Admin Server để họ thêm vào nhé!",
                ephemeral: true
            });
        }
    }

    let member = interaction.member;
    if (!member || !member.voice) {
        try {
            member = await guild.members.fetch(interaction.user.id);
        } catch (e) {
            console.error("❌ Error fetching member:", e);
            return interaction.reply({ content: "❌ Lỗi: Không thể lấy thông tin Voice của bạn (thử gõ lại lệnh nhé)!", ephemeral: true });
        }
    }

    // ── /play ──
    if (commandName === "play") {
        let voiceChannel = member?.voice?.channel;

        // Bắt buộc fetch member nếu cache rỗng (hay gặp ở Text-in-Voice)
        if (!voiceChannel) {
            try {
                const fetchedMember = await guild.members.fetch(interaction.user.id);
                voiceChannel = fetchedMember?.voice?.channel;
            } catch (e) {
                // Ignore fetch errors
            }
        }

        if (!voiceChannel) {
            return interaction.reply({ content: "❌ Bạn cần vào voice channel trước!", ephemeral: true });
        }

        await interaction.deferReply();

        const query = interaction.options.getString("query");
        let player = client.lavalink.getPlayer(guild.id);

        if (!player) {
            player = client.lavalink.createPlayer({
                guildId: guild.id,
                voiceChannelId: voiceChannel.id,
                textChannelId: channel.id,
                selfDeaf: true,
                volume: 80,
            });
        }

        if (!player.connected) {
            await player.connect();
        }

        // Move to user's channel if different
        if (player.voiceChannelId !== voiceChannel.id) {
            await player.connect({ channelId: voiceChannel.id });
        }

        let finalQuery = query;

        // Bypass IP-blocking by routing ALL YouTube queries to SoundCloud.
        try {
            if (query.includes("youtube.com") || query.includes("youtu.be")) {
                // If the user pasted a direct YouTube link, we extract the title via oEmbed
                // and search for that title natively purely on SoundCloud.
                const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(query)}&format=json`;
                const res = await fetch(oembedUrl);
                if (res.ok) {
                    const data = await res.json();
                    if (data.title) {
                        finalQuery = `scsearch:${data.title}`;
                    } else {
                        finalQuery = `scsearch:${query}`;
                    }
                } else {
                    // Cannot fetch title, ignore link entirely to prevent proxy-close loop
                    return interaction.editReply({ content: "❌ Do chống bot YouTube gắt gao, hãy tự gõ **Tên Bài Hát** thay vì gửi link nhé!" });
                }
            } else if (!query.startsWith("http")) { 
                // Any normal text search bypasses YouTube and goes directly to SoundCloud
                finalQuery = `scsearch:${query}`;
            }
        } catch (e) {
            console.error("URL parsing failed:", e);
            finalQuery = `scsearch:${query}`;
        }

        const result = await player.search({ query: finalQuery }, interaction.user);

        if (!result || !result.tracks?.length) {
            return interaction.editReply({ content: "❌ Không tìm thấy bài hát trên hệ thống dự phòng!" });
        }

        // We don't overwrite metadata anymore, the SoundCloud metadata is perfectly valid.
        if (result.loadType === "playlist") {
            for (const track of result.tracks) {
                player.queue.add(track);
            }
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`✅ Đã thêm playlist **${result.playlist?.name || "Unknown"}** với **${result.tracks.length}** bài hát.`)]
            });
        } else {
            const track = result.tracks[0];
            player.queue.add(track);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`✅ Đã thêm vào hàng đợi: [**${track.info.title}**](${track.info.uri})`)]
            });
        }

        // Start playing if not already playing. 
        if (!player.playing) {
            console.log(`▶ [${INSTANCE_ID}] Starting playback for: ${player.queue.current?.info?.title || "Unknown Track"}`);
            await player.play();
        } else {
            console.log(`⏳ [${INSTANCE_ID}] Track queued: ${player.queue.current?.info?.title || "Unknown Track"}`);
        }
    }

    // ── /skip ──
    else if (commandName === "skip") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "❌ Không có bài nào trong hàng đợi!", ephemeral: true });
        }
        const current = player.queue.current;
        await player.skip();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xFEE75C).setDescription(`⏭ Đã skip: **${current?.info?.title || "Unknown"}**`)],
        });
    }

    // ── /stop ──
    else if (commandName === "stop") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "❌ Không có gì đang phát!", ephemeral: true });
        }
        await player.destroy();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("⏹ Đã dừng phát nhạc và rời voice channel.")],
        });
    }

    // ── /queue ──
    else if (commandName === "queue") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "❌ Queue trống!", ephemeral: true });
        }

        const current = player.queue.current;
        const tracks = player.queue.tracks.slice(0, 15);
        let desc = `**Đang phát:** [${current.info.title}](${current.info.uri}) \`${formatDuration(current.info.duration)}\`\n\n`;

        if (tracks.length > 0) {
            desc += tracks.map((t, i) => `**${i + 1}.** [${t.info.title}](${t.info.uri}) \`${formatDuration(t.info.duration)}\``).join("\n");
            if (player.queue.tracks.length > 15) {
                desc += `\n\n... và **${player.queue.tracks.length - 15}** bài khác`;
            }
        } else {
            desc += "*Không có bài tiếp theo trong queue.*";
        }

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle("📜 Queue").setDescription(desc)
                .setFooter({ text: `Tổng: ${player.queue.tracks.length + 1} bài` })],
        });
    }

    // ── /nowplaying ──
    else if (commandName === "nowplaying") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "❌ Không có bài đang phát!", ephemeral: true });
        }
        const track = player.queue.current;
        const pos = player.position;
        const dur = track.info.duration;
        const bar = createProgressBar(pos, dur);

        const embed = trackEmbed(track, "🎶 Đang phát")
            .addFields({ name: "⏱ Tiến trình", value: `${formatDuration(pos)} ${bar} ${formatDuration(dur)}`, inline: false });

        await interaction.reply({ embeds: [embed] });
    }

    // ── /pause ──
    else if (commandName === "pause") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: "❌ Không có bài đang phát!", ephemeral: true });
        }
        await player.pause();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xFEE75C).setDescription("⏸ Đã tạm dừng.")],
        });
    }

    // ── /resume ──
    else if (commandName === "resume") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "❌ Không có bài đang phát!", ephemeral: true });
        }
        await player.resume();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("▶ Đã tiếp tục phát.")],
        });
    }

    // ── /volume ──
    else if (commandName === "volume") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "❌ Không có player đang hoạt động!", ephemeral: true });
        }
        const level = interaction.options.getInteger("level");
        await player.setVolume(level);
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57F287).setDescription(`🔊 Âm lượng: **${level}%**`)],
        });
    }

    // ── /replay ──
    else if (commandName === "replay") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "❌ Không có bài đang phát!", ephemeral: true });
        }
        await player.seek(0);
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setDescription("⏪ Đã phát lại bài hát từ đầu.")],
        });
    }

    // ── /loop ──
    else if (commandName === "loop") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "❌ Không có bài đang phát!", ephemeral: true });
        }
        const mode = interaction.options.getString("mode");
        if (mode === "off") {
            player.setRepeatMode("off");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("❌ Đã tắt lặp lại.")] });
        } else if (mode === "track") {
            player.setRepeatMode("track");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("🔂 Lặp lại **bài hiện tại** vô hạn.")] });
        } else if (mode === "queue") {
            player.setRepeatMode("queue");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("🔁 Lặp lại **cả queue** vô hạn.")] });
        }
    }
});

// ─── Progress Bar ──────────────────────────────────────────────
function createProgressBar(current, total, length = 12) {
    if (!total || total === 0) return "▬".repeat(length);
    const progress = Math.round((current / total) * length);
    return "▬".repeat(Math.max(0, progress)) + "🔘" + "▬".repeat(Math.max(0, length - progress - 1));
}

// ─── Graceful Shutdown ─────────────────────────────────────────
async function shutdown(signal) {
    console.log(`\n🛑 ${signal} received — shutting down...`);
    try {
        // Destroy all players
        for (const [, player] of client.lavalink.players) {
            await player.destroy().catch(() => { });
        }
        client.destroy();
    } catch (e) {
        // ignore
    }
    process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ─── Login ─────────────────────────────────────────────────────
console.log("🚀 Starting bot...");
client.login(DISCORD_TOKEN);
