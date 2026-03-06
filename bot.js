const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { LavalinkManager } = require("lavalink-client");

// ─── Config ────────────────────────────────────────────────────
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD || "youshallnotpass";

if (!DISCORD_TOKEN) {
    console.error("❌ DISCORD_TOKEN is required!");
    process.exit(1);
}

// ─── Discord Client ────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

// ─── Lavalink Manager ──────────────────────────────────────────
client.lavalink = new LavalinkManager({
    nodes: [
        {
            authorization: LAVALINK_PASSWORD,
            host: "localhost",
            port: 2333,
            id: "main",
            retryDelay: 5000,
            retryAmount: Infinity,
        },
    ],
    sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    autoSkip: true,
    client: {
        id: null, // set on ready
    },
});

// ─── Slash Commands Definition ─────────────────────────────────
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
    await client.lavalink.init({ id: client.user.id, username: client.user.username });
    await registerCommands();
});

// ─── Forward voice state updates to Lavalink ───────────────────
client.on("raw", (d) => client.lavalink.sendRawData(d));

// ─── Lavalink Events ──────────────────────────────────────────
client.lavalink.on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
        channel.send({ embeds: [trackEmbed(track, "🎵 Đang phát")] }).catch(() => { });
    }
});

client.lavalink.on("queueEnd", (player) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
        channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("📭 Hết nhạc trong queue — rời voice channel.")] }).catch(() => { });
    }
    setTimeout(() => {
        player.destroy();
    }, 3000);
});

client.lavalink.on("trackStuck", (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription(`⚠️ Track bị stuck: **${track.info.title}** — đang skip...`)] }).catch(() => { });
    player.skip();
});

client.lavalink.on("trackError", (player, track, payload) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription(`❌ Lỗi phát: **${track.info.title}** — đang skip...`)] }).catch(() => { });
    player.skip();
});

// ─── Interaction Handler ───────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guild, member, channel } = interaction;

    if (!guild) {
        return interaction.reply({ content: "❌ Các lệnh nhạc chỉ có thể dùng trong server!", ephemeral: true });
    }

    const voiceChannel = member?.voice?.channel;

    // ── /play ──
    if (commandName === "play") {
        const voiceState = guild.voiceStates.cache.get(interaction.user.id);
        const voiceChannel = voiceState?.channel;

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

        const result = await player.search({ query }, interaction.user);

        if (!result || !result.tracks?.length) {
            return interaction.editReply({ content: "❌ Không tìm thấy bài hát!" });
        }

        if (result.loadType === "playlist") {
            for (const track of result.tracks) {
                player.queue.add(track);
            }
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`📋 Đã thêm **${result.tracks.length}** bài từ playlist: **${result.playlist?.name || "Unknown"}**`)],
            });
        } else {
            const track = result.tracks[0];
            player.queue.add(track);
            if (player.playing) {
                await interaction.editReply({ embeds: [trackEmbed(track, "📥 Đã thêm vào queue")] });
            } else {
                await interaction.editReply({ embeds: [trackEmbed(track, "🎵 Đang phát")] });
            }
        }

        if (!player.playing) {
            await player.play();
        }
    }

    // ── /skip ──
    else if (commandName === "skip") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: "❌ Không có bài nào đang phát!", ephemeral: true });
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
