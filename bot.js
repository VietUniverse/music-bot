const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { LavalinkManager } = require("lavalink-client");

// â”€â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD || "youshallnotpass";
const INSTANCE_ID = Math.random().toString(36).substring(7).toUpperCase();

console.log(`[BOT] Instance ID: ${INSTANCE_ID}`);

if (!DISCORD_TOKEN) {
    console.error("âŒ DISCORD_TOKEN is required!");
    process.exit(1);
}

// â”€â”€â”€ Discord Client â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

// â”€â”€â”€ Lavalink Manager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const publicNodes = [
    { authorization: "https://discord.gg/mjS5J2K3ep", host: "lava-v4.millohost.my.id", port: 443, secure: true, id: "millohost", retryDelay: 5000, retryAmount: Infinity },

    { authorization: "https://seretia.link/discord", host: "lavalinkv4.serenetia.com", port: 80, secure: false, id: "serenetia", retryDelay: 5000, retryAmount: Infinity }
];
const nodeIndex = parseInt(process.env.BOT_NODE_INDEX) || 0;
// We'll filter out the 502 node from being first if possible, but keep the list as fallbacks
const sortedNodes = [...publicNodes];
const priorityNodes = [...sortedNodes.slice(nodeIndex % sortedNodes.length), ...sortedNodes.slice(0, nodeIndex % sortedNodes.length)];

console.log(`[BOT] Prioritizing node ${priorityNodes[0].id} with ${priorityNodes.length - 1} fallbacks.`);

client.lavalink = new LavalinkManager({
    nodes: priorityNodes,
    // ... rest of config
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
    new SlashCommandBuilder().setName("play").setDescription("ðŸŽµ PhÃ¡t nháº¡c tá»« YouTube/SoundCloud/URL")
        .addStringOption(o => o.setName("query").setDescription("TÃªn bÃ i hÃ¡t hoáº·c URL").setRequired(true)),
    new SlashCommandBuilder().setName("skip").setDescription("â­ Bá» qua bÃ i hiá»‡n táº¡i"),
    new SlashCommandBuilder().setName("stop").setDescription("â¹ Dá»«ng phÃ¡t & rá»i voice channel"),
    new SlashCommandBuilder().setName("queue").setDescription("ðŸ“œ Xem danh sÃ¡ch phÃ¡t"),
    new SlashCommandBuilder().setName("nowplaying").setDescription("ðŸŽ¶ BÃ i Ä‘ang phÃ¡t"),
    new SlashCommandBuilder().setName("pause").setDescription("â¸ Táº¡m dá»«ng"),
    new SlashCommandBuilder().setName("resume").setDescription("â–¶ Tiáº¿p tá»¥c phÃ¡t"),
    new SlashCommandBuilder().setName("volume").setDescription("ðŸ”Š Chá»‰nh Ã¢m lÆ°á»£ng")
        .addIntegerOption(o => o.setName("level").setDescription("Ã‚m lÆ°á»£ng (1-150)").setRequired(true).setMinValue(1).setMaxValue(150)),
    new SlashCommandBuilder().setName("loop").setDescription("ðŸ” Láº·p láº¡i bÃ i hÃ¡t / queue")
        .addStringOption(o => o.setName("mode").setDescription("Cháº¿ Ä‘á»™ láº·p").setRequired(true)
            .addChoices(
                { name: "âŒ Táº¯t láº·p", value: "off" },
                { name: "ðŸ”‚ Láº·p bÃ i hiá»‡n táº¡i", value: "track" },
                { name: "ðŸ” Láº·p cáº£ queue", value: "queue" },
            )),
    new SlashCommandBuilder().setName("replay").setDescription("âª PhÃ¡t láº¡i bÃ i hiá»‡n táº¡i tá»« Ä‘áº§u"),
    new SlashCommandBuilder().setName("debug").setDescription("ðŸ” Kiá»ƒm tra tráº¡ng thÃ¡i káº¿t ná»‘i & Node"),
];

// â”€â”€â”€ Helper Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function formatDuration(ms) {
    if (!ms || ms === 0) return "ðŸ”´ LIVE";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function trackEmbed(track, title = "ðŸŽµ Äang phÃ¡t") {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(title)
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .addFields(
            { name: "ðŸ‘¤ Nghá»‡ sÄ©", value: track.info.author || "Unknown", inline: true },
            { name: "â± Thá»i lÆ°á»£ng", value: formatDuration(track.info.duration), inline: true },
        );
    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    if (track.requester) embed.setFooter({ text: `YÃªu cáº§u bá»Ÿi ${track.requester.username}` });
    return embed;
}

// â”€â”€â”€ Register Slash Commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    try {
        console.log("ðŸ“ Äang Ä‘Äƒng kÃ½ slash commands...");
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands.map(c => c.toJSON()),
        });
        console.log("âœ… ÄÃ£ Ä‘Äƒng kÃ½ slash commands!");
    } catch (err) {
        console.error("âŒ Lá»—i Ä‘Äƒng kÃ½ commands:", err);
    }
}

// â”€â”€â”€ Bot Ready â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
client.once("ready", async () => {
    console.log(`ðŸ¤– Bot online: ${client.user.tag}`);
    client.lavalink.options.client.id = client.user.id;
    try {
        await client.lavalink.init({ id: client.user.id, username: client.user.username });
    } catch (e) {
        console.error("âŒ Lá»—i khá»Ÿi táº¡o Lavalink:", e);
    }
    await registerCommands();
});

// â”€â”€â”€ Auto-leave when voice channel is empty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                if (ch) ch.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("ðŸ‘‹ KhÃ´ng cÃ²n ai trong voice channel \u2014 Ä‘Ã£ rá»i!")] }).catch(() => { });
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

// â”€â”€â”€ Lavalink Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
client.lavalink.nodeManager.on("error", (node, error) => {
    console.error(`âŒ Lavalink Node ${node.id} Error: ${error.message}`);
});

client.lavalink.nodeManager.on("connect", (node) => {
    console.log(`âœ… Lavalink Node ${node.id} Connected!`);
});

client.lavalink.nodeManager.on("disconnect", (node, reason) => {
    console.log(`âŒ Lavalink Node ${node.id} Disconnected:`, reason);
});

client.lavalink.on("playerCreate", (player) => {
    console.log(`ðŸŸ¡ Player Created for ${player.guildId} on node: ${player.node?.id || "unknown"}`);
});
client.lavalink.on("playerDestroy", (player) => console.log(`ðŸ”´ Player Destroyed for ${player.guildId}`));

client.lavalink.on("playerUpdate", (player) => {
    // In v2, player.node exists but might be accessed differently in updates
    const nodeId = player.node?.id || player.nodeId || "unknown";
    const isConnected = !!player.voiceChannelId;
    console.log(`ðŸ”¹ [${INSTANCE_ID}] Player Update for ${player.guildId}: Node: ${nodeId}, Connected: ${isConnected}, Playing: ${player.playing}, Volume: ${player.volume}%`);
    if (isConnected && !player.playing && player.queue.current) {
        console.log(`âš ï¸ [${INSTANCE_ID}] Player STUCK on ${player.guildId} - State:`, player.state);
        
        // Failsafe: If player gets stuck in an undefined/zombie state due to node drops, destroy it.
        if (player.state === "DISCONNECTED") {
            console.log(`ðŸ§¨ [${INSTANCE_ID}] Destroying zombie player for ${player.guildId}`);
            const channel = client.channels.cache.get(player.textChannelId);
            if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("âš ï¸ Máº¥t káº¿t ná»‘i tá»›i mÃ¡y chá»§ nháº¡c (Zombie Player). Äang dá»n dáº¹p... Vui lÃ²ng gá»i láº¡i bot!")] }).catch(() => { });
            const realPlayer = client.lavalink.getPlayer(player.guildId);
            if (realPlayer) realPlayer.destroy();

        }
    }
});

process.on("unhandledRejection", (reason) => console.error("âŒ Unhandled Rejection:", reason));
process.on("uncaughtException", (err) => console.error("âŒ Uncaught Exception:", err));
client.lavalink.on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    console.log(`ðŸ”Š [${INSTANCE_ID}] Track Start: ${track.info.title} on node: ${player.node?.id || "unknown"}`);
    
    // Force audio state to ensure it's not silent
    player.setVolume(100);
    if (player.paused) player.resume();

    if (channel) {
        channel.send({ embeds: [trackEmbed(track, "ðŸŽµ Äang phÃ¡t")] }).catch(() => { });
    }
});

client.lavalink.on("queueEnd", (player) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
        channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("ðŸ“­ Háº¿t nháº¡c trong queue â€” sáº½ rá»i voice channel sau 3 phÃºt.")] }).catch(() => { });
    }
    setTimeout(() => {
        if (!player.playing) player.destroy();
    }, 180000);
});

client.lavalink.on("trackStuck", async (player, track) => {
    console.error(`âš ï¸ [${INSTANCE_ID}] Track STUCK: ${track.info.title} (source: ${track.info.sourceName})`);
    const channel = client.channels.cache.get(player.textChannelId);

    // Fallback: If a YouTube track gets stuck, try SoundCloud
    if (track.info.sourceName === "youtube") {
        console.log(`[${INSTANCE_ID}] [STUCK-FALLBACK] YouTube track stuck, trying SoundCloud for: ${track.info.title}`);
        try {
            const res = await player.search({ query: `scsearch:${track.info.title}` }, track.userData?.requester);
            if (res && res.tracks?.length > 0) {
                const scTrack = res.tracks[0];
                if (channel) channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setDescription(`âš ï¸ YouTube bá»‹ káº¹t luá»“ng. Äang tá»± Ä‘á»™ng chuyá»ƒn sang **SoundCloud** dá»± phÃ²ng...\nðŸŽ¶ **${scTrack.info.title}**`)]
                }).catch(() => { });
                return await player.play({ track: scTrack });
            }
        } catch (e) {
            console.error(`[${INSTANCE_ID}] [STUCK-FALLBACK-CRASH] SoundCloud fallback failed:`, e.message);
        }
    }

    if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription(`âš ï¸ Track bá»‹ stuck: **${track.info.title}** â€” Ä‘ang skip...`)] }).catch(() => { });
    if (player.queue.tracks.length > 0) {
        player.skip();
    } else {
        player.stopPlaying();
    }
});

client.lavalink.on("trackError", async (player, track, payload) => {
    console.error(`âŒ [${INSTANCE_ID}] Lavalink Track Error for ${track.info.title}:`, payload.exception?.message || payload.error || payload);
    
    const channel = client.channels.cache.get(player.textChannelId);
    
    // Fallback logic: If YouTube fails, try SoundCloud
    if (track.info.sourceName === "youtube") {
        console.log(`[${INSTANCE_ID}] [PLAYBACK-FALLBACK] YouTube failed at runtime, trying SoundCloud for: ${track.info.title}`);
        
        try {
            const res = await player.search({ query: `scsearch:${track.info.title}` }, track.userData?.requester);
            if (res && res.tracks?.length > 0) {
                const scTrack = res.tracks[0];
                if (channel) channel.send({ 
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setDescription(`âš ï¸ YouTube bá»‹ cháº·n link nÃ y. Äang tá»± Ä‘á»™ng chuyá»ƒn sang báº£n **SoundCloud** dá»± phÃ²ng...\nðŸŽ¶ **${scTrack.info.title}**`)] 
                }).catch(() => { });
                
                // Play the soundcloud version immediately
                return await player.play({ track: scTrack });
            }
        } catch (e) {
            console.error(`[${INSTANCE_ID}] [FALLBACK-CRASH] SoundCloud fallback search failed:`, e.message);
        }
    }

    if (channel) channel.send({ 
        embeds: [new EmbedBuilder()
            .setColor(0xED4245)
            .setDescription(`âŒ Lá»—i phÃ¡t: **${track.info.title}**\nChi tiáº¿t: \`${payload.exception?.message?.split("\n")[0] || payload.error || "Unknown Error"}\` â€” Ä‘ang skip...`)] 
    }).catch(() => { });

    if (player.queue.tracks.length > 0) {
        player.skip();
    } else {
        player.stopPlaying();
    }
});

// â”€â”€â”€ Interaction Handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channel, guildId } = interaction;

    if (!guildId) {
        return interaction.reply({ content: "âŒ CÃ¡c lá»‡nh nháº¡c chá»‰ cÃ³ thá»ƒ dÃ¹ng trong server!", ephemeral: true });
    }

    let guild = interaction.guild;

    // Náº¿u khÃ´ng láº¥y Ä‘Æ°á»£c guild (bot chÆ°a Ä‘Æ°á»£c add vÃ o server mÃ  dÃ¹ng báº±ng User App)
    if (!guild) {
        try {
            guild = await client.guilds.fetch(guildId);
        } catch (e) {
            console.error("âŒ Error fetching guild:", e);
            return interaction.reply({
                content: "âŒ **Lá»—i:** Bot chÆ°a tham gia Server nÃ y!\n\nBáº¡n Ä‘ang dÃ¹ng lá»‡nh qua tÃ­nh nÄƒng User App (á»©ng dá»¥ng cÃ i vÃ o cÃ¡ nhÃ¢n), nhÆ°ng Ä‘á»ƒ bot vÃ o **Voice Channel** hÃ¡t thÃ¬ bot Báº®T BUá»˜C pháº£i Ä‘Æ°á»£c Add trá»±c tiáº¿p vÃ o Server nÃ y.\n\nðŸ‘‰ Vui lÃ²ng gá»­i link má»i bot cho Admin Server Ä‘á»ƒ há» thÃªm vÃ o nhÃ©!",
                ephemeral: true
            });
        }
    }

    let member = interaction.member;
    if (!member || !member.voice) {
        try {
            member = await guild.members.fetch(interaction.user.id);
        } catch (e) {
            console.error("âŒ Error fetching member:", e);
            return interaction.reply({ content: "âŒ Lá»—i: KhÃ´ng thá»ƒ láº¥y thÃ´ng tin Voice cá»§a báº¡n (thá»­ gÃµ láº¡i lá»‡nh nhÃ©)!", ephemeral: true });
        }
    }

    // â”€â”€ /play â”€â”€
    if (commandName === "play") {
        let voiceChannel = member?.voice?.channel;

        // Báº¯t buá»™c fetch member náº¿u cache rá»—ng (hay gáº·p á»Ÿ Text-in-Voice)
        if (!voiceChannel) {
            try {
                const fetchedMember = await guild.members.fetch(interaction.user.id);
                voiceChannel = fetchedMember?.voice?.channel;
            } catch (e) {
                // Ignore fetch errors
            }
        }

        if (!voiceChannel) {
            return interaction.reply({ content: "âŒ Báº¡n cáº§n vÃ o voice channel trÆ°á»›c!", ephemeral: true });
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
        try {
            const url = new URL(query);
            if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
                // Try to fetch title for YouTube links to check for blocks
                const res = await player.search({ query: query }, interaction.user);
                if (res && res.tracks?.length > 0) {
                    // If we can get a title, it's likely not blocked or we found a workaround
                    finalQuery = query;
                } else {
                    // Cannot fetch title, ignore link entirely to prevent proxy-close loop
                    return interaction.editReply({ content: "âŒ Do chá»‘ng bot YouTube gáº¯t gao, hÃ£y tá»± gÃµ **TÃªn BÃ i HÃ¡t** thay vÃ¬ gá»­i link nhÃ©!" });
                }
            } else if (!query.startsWith("http")) { 
                // Any normal text search bypasses YouTube and goes directly to SoundCloud
                finalQuery = `scsearch:${query}`;
            }
        } catch (e) {
            console.error("URL parsing failed:", e);
            finalQuery = `scsearch:${query}`;
        }

        // YouTube-First with SoundCloud Fallback logic
        async function robustSearch(q, type = "youtube") {
            try {
                const searchType = type === "youtube" ? "ytsearch:" : "scsearch:";
                // If it's a URL, search exactly as is, otherwise prefix with search type
                const searchParams = q.startsWith("http") ? q : `${searchType}${q}`;
                
                console.log(`[${INSTANCE_ID}] [SEARCH] Trying ${type} for: ${q}`);
                const res = await player.search({ query: searchParams }, interaction.user);
                
                if (res && res.tracks?.length > 0) {
                    console.log(`[${INSTANCE_ID}] [SEARCH] Found ${res.tracks.length} tracks on ${type}`);
                    return res;
                }
                
                // Fallback to SoundCloud if YouTube failed
                if (type === "youtube") {
                    console.log(`[FALLBACK] YouTube failed or empty, trying SoundCloud for: ${q}`);
                    return await robustSearch(q, "soundcloud");
                }
                
                return null;
            } catch (err) {
                console.error(`[SEARCH ERROR] ${type} failed:`, err.message);
                if (type === "youtube") {
                    return await robustSearch(q, "soundcloud");
                }
                return null;
            }
        }

        const result = await robustSearch(query);

        if (!result || !result.tracks?.length) {
            return interaction.editReply({ content: "âŒ KhÃ´ng tÃ¬m tháº¥y bÃ i hÃ¡t trÃªn há»‡ thá»‘ng dá»± phÃ²ng!" });
        }

        // We don't overwrite metadata anymore, the SoundCloud metadata is perfectly valid.
        if (result.loadType === "playlist") {
            for (const track of result.tracks) {
                player.queue.add(track);
            }
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`âœ… ÄÃ£ thÃªm playlist **${result.playlist?.name || "Unknown"}** vá»›i **${result.tracks.length}** bÃ i hÃ¡t.`)]
            });
        } else {
            const track = result.tracks[0];
            player.queue.add(track);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`âœ… ÄÃ£ thÃªm vÃ o hÃ ng Ä‘á»£i: [**${track.info.title}**](${track.info.uri})`)]
            });
        }

        // Start playing if not already playing. 
        if (!player.playing) {
            console.log(`â–¶ [${INSTANCE_ID}] Starting playback for: ${player.queue.current?.info?.title || "Unknown Track"}`);
            await player.play();
        } else {
            console.log(`â³ [${INSTANCE_ID}] Track queued: ${player.queue.current?.info?.title || "Unknown Track"}`);
        }
    }

    // â”€â”€ /skip â”€â”€
    else if (commandName === "skip") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i nÃ o trong hÃ ng Ä‘á»£i!", ephemeral: true });
        }
        const current = player.queue.current;
        await player.skip();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xFEE75C).setDescription(`â­ ÄÃ£ skip: **${current?.info?.title || "Unknown"}**`)],
        });
    }

    // â”€â”€ /stop â”€â”€
    else if (commandName === "stop") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ gÃ¬ Ä‘ang phÃ¡t!", ephemeral: true });
        }
        await player.destroy();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("â¹ ÄÃ£ dá»«ng phÃ¡t nháº¡c vÃ  rá»i voice channel.")],
        });
    }

    // â”€â”€ /debug â”€â”€
    else if (commandName === "debug") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ player nÃ o Ä‘ang hoáº¡t Ä‘á»™ng trong server nÃ y!", ephemeral: true });
        }

        const node = player.node;
        const msg = [
            `ðŸ” **Bot Debug Info**`,
            `ðŸ†” **Instance:** \`${INSTANCE_ID}\``,
            `ðŸŒ **Node:** \`${node?.id || "Unknown"}\` (${node?.host})`,
            `ðŸ“¡ **Node Status:** ${node?.connected ? "âœ… Connected" : "âŒ Disconnected"}`,
            `ðŸ“Š **Node Ping:** \`${node?.ping}ms\``,
            `ðŸŽµ **Playing:** ${player.playing ? "â–¶ Yes" : "â¸ No"} (Paused: ${player.paused})`,
            `ðŸ”Š **Volume:** \`${player.volume}%\``,
            `ðŸ”— **Connected to Voice:** ${player.voiceChannelId ? "âœ… <#" + player.voiceChannelId + ">" : "âŒ No"}`,
            `ðŸ“ **Text Channel:** <#${player.textChannelId}>`,
            player.queue.current ? `ðŸŽ¶ **Current Track:** [${player.queue.current.info.title}](${player.queue.current.info.uri})` : `ðŸ“­ **Queue:** Empty`,
        ].join("\n");

        await interaction.reply({ content: msg, ephemeral: true });
    }

    // â”€â”€ /queue â”€â”€
    else if (commandName === "queue") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "âŒ Queue trá»‘ng!", ephemeral: true });
        }

        const current = player.queue.current;
        const tracks = player.queue.tracks.slice(0, 15);
        let desc = `**Äang phÃ¡t:** [${current.info.title}](${current.info.uri}) \`${formatDuration(current.info.duration)}\`\n\n`;

        if (tracks.length > 0) {
            desc += tracks.map((t, i) => `**${i + 1}.** [${t.info.title}](${t.info.uri}) \`${formatDuration(t.info.duration)}\``).join("\n");
            if (player.queue.tracks.length > 15) {
                desc += `\n\n... vÃ  **${player.queue.tracks.length - 15}** bÃ i khÃ¡c`;
            }
        } else {
            desc += "*KhÃ´ng cÃ³ bÃ i tiáº¿p theo trong queue.*";
        }

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle("ðŸ“œ Queue").setDescription(desc)
                .setFooter({ text: `Tá»•ng: ${player.queue.tracks.length + 1} bÃ i` })],
        });
    }

    // â”€â”€ /nowplaying â”€â”€
    else if (commandName === "nowplaying") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i Ä‘ang phÃ¡t!", ephemeral: true });
        }
        const track = player.queue.current;
        const pos = player.position;
        const dur = track.info.duration;
        const bar = createProgressBar(pos, dur);

        const embed = trackEmbed(track, "ðŸŽ¶ Äang phÃ¡t")
            .addFields({ name: "â± Tiáº¿n trÃ¬nh", value: `${formatDuration(pos)} ${bar} ${formatDuration(dur)}`, inline: false });

        await interaction.reply({ embeds: [embed] });
    }

    // â”€â”€ /pause â”€â”€
    else if (commandName === "pause") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i Ä‘ang phÃ¡t!", ephemeral: true });
        }
        await player.pause();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xFEE75C).setDescription("â¸ ÄÃ£ táº¡m dá»«ng.")],
        });
    }

    // â”€â”€ /resume â”€â”€
    else if (commandName === "resume") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i Ä‘ang phÃ¡t!", ephemeral: true });
        }
        await player.resume();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("â–¶ ÄÃ£ tiáº¿p tá»¥c phÃ¡t.")],
        });
    }

    // â”€â”€ /volume â”€â”€
    else if (commandName === "volume") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ player Ä‘ang hoáº¡t Ä‘á»™ng!", ephemeral: true });
        }
        const level = interaction.options.getInteger("level");
        await player.setVolume(level);
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57F287).setDescription(`ðŸ”Š Ã‚m lÆ°á»£ng: **${level}%**`)],
        });
    }

    // â”€â”€ /replay â”€â”€
    else if (commandName === "replay") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i Ä‘ang phÃ¡t!", ephemeral: true });
        }
        await player.seek(0);
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setDescription("âª ÄÃ£ phÃ¡t láº¡i bÃ i hÃ¡t tá»« Ä‘áº§u.")],
        });
    }

    // â”€â”€ /loop â”€â”€
    else if (commandName === "loop") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "âŒ KhÃ´ng cÃ³ bÃ i Ä‘ang phÃ¡t!", ephemeral: true });
        }
        const mode = interaction.options.getString("mode");
        if (mode === "off") {
            player.setRepeatMode("off");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("âŒ ÄÃ£ táº¯t láº·p láº¡i.")] });
        } else if (mode === "track") {
            player.setRepeatMode("track");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("ðŸ”‚ Láº·p láº¡i **bÃ i hiá»‡n táº¡i** vÃ´ háº¡n.")] });
        } else if (mode === "queue") {
            player.setRepeatMode("queue");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("ðŸ” Láº·p láº¡i **cáº£ queue** vÃ´ háº¡n.")] });
        }
    }
});

// â”€â”€â”€ Progress Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function createProgressBar(current, total, length = 12) {
    if (!total || total === 0) return "â–¬".repeat(length);
    const progress = Math.round((current / total) * length);
    return "â–¬".repeat(Math.max(0, progress)) + "ðŸ”˜" + "â–¬".repeat(Math.max(0, length - progress - 1));
}

// â”€â”€â”€ Graceful Shutdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function shutdown(signal) {
    console.log(`\nðŸ›‘ ${signal} received â€” shutting down...`);
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

// â”€â”€â”€ Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log("ðŸš€ Starting bot...");
client.login(DISCORD_TOKEN);

// â”€â”€â”€ Global Error Handlers (Anti-Crash) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${INSTANCE_ID}] ðŸ§¨ Unhandled Rejection:`, reason);
    // Specifically catch Lavalink JSON parsing errors resulting from 429/502 HTML pages
    if (reason instanceof SyntaxError && reason.message.includes("is not valid JSON")) {
        console.error(`[${INSTANCE_ID}] ðŸ›¡ï¸ Caught Lavalink Node HTML/JSON Parsing Error. Preventing crash.`);
    }
});

process.on('uncaughtException', (err) => {
    console.error(`[${INSTANCE_ID}] ðŸ§¨ Uncaught Exception:`, err);
});
