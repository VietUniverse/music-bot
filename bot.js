const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { LavalinkManager } = require("lavalink-client");

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Config ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LAVALINK_PASSWORD = process.env.LAVALINK_PASSWORD || "youshallnotpass";
const INSTANCE_ID = Math.random().toString(36).substring(7).toUpperCase();

console.log(`[BOT] Instance ID: ${INSTANCE_ID}`);

if (!DISCORD_TOKEN) {
    console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ DISCORD_TOKEN is required!");
    process.exit(1);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Discord Client ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
    ],
});

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Lavalink Manager ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const publicNodes = [
    { authorization: "https://seretia.link/discord", host: "lavalinkv4.serenetia.com", port: 80, secure: false, id: "serenetia", retryDelay: 5000, retryAmount: Infinity },
    { authorization: "https://discord.gg/mjS5J2K3ep", host: "lava-v4.millohost.my.id", port: 443, secure: true, id: "millohost", retryDelay: 5000, retryAmount: Infinity }
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
    new SlashCommandBuilder().setName("play").setDescription("ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ PhÃƒÆ’Ã‚Â¡t nhÃƒÂ¡Ã‚ÂºÃ‚Â¡c tÃƒÂ¡Ã‚Â»Ã‚Â« YouTube/SoundCloud/URL")
        .addStringOption(o => o.setName("query").setDescription("TÃƒÆ’Ã‚Âªn bÃƒÆ’Ã‚Â i hÃƒÆ’Ã‚Â¡t hoÃƒÂ¡Ã‚ÂºÃ‚Â·c URL").setRequired(true)),
    new SlashCommandBuilder().setName("skip").setDescription("ÃƒÂ¢Ã‚ÂÃ‚Â­ BÃƒÂ¡Ã‚Â»Ã‚Â qua bÃƒÆ’Ã‚Â i hiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i"),
    new SlashCommandBuilder().setName("stop").setDescription("ÃƒÂ¢Ã‚ÂÃ‚Â¹ DÃƒÂ¡Ã‚Â»Ã‚Â«ng phÃƒÆ’Ã‚Â¡t & rÃƒÂ¡Ã‚Â»Ã‚Âi voice channel"),
    new SlashCommandBuilder().setName("queue").setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…â€œ Xem danh sÃƒÆ’Ã‚Â¡ch phÃƒÆ’Ã‚Â¡t"),
    new SlashCommandBuilder().setName("nowplaying").setDescription("ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¶ BÃƒÆ’Ã‚Â i Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t"),
    new SlashCommandBuilder().setName("pause").setDescription("ÃƒÂ¢Ã‚ÂÃ‚Â¸ TÃƒÂ¡Ã‚ÂºÃ‚Â¡m dÃƒÂ¡Ã‚Â»Ã‚Â«ng"),
    new SlashCommandBuilder().setName("resume").setDescription("ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ TiÃƒÂ¡Ã‚ÂºÃ‚Â¿p tÃƒÂ¡Ã‚Â»Ã‚Â¥c phÃƒÆ’Ã‚Â¡t"),
    new SlashCommandBuilder().setName("volume").setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…Â  ChÃƒÂ¡Ã‚Â»Ã¢â‚¬Â°nh ÃƒÆ’Ã‚Â¢m lÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£ng")
        .addIntegerOption(o => o.setName("level").setDescription("ÃƒÆ’Ã¢â‚¬Å¡m lÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£ng (1-150)").setRequired(true).setMinValue(1).setMaxValue(150)),
    new SlashCommandBuilder().setName("loop").setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â LÃƒÂ¡Ã‚ÂºÃ‚Â·p lÃƒÂ¡Ã‚ÂºÃ‚Â¡i bÃƒÆ’Ã‚Â i hÃƒÆ’Ã‚Â¡t / queue")
        .addStringOption(o => o.setName("mode").setDescription("ChÃƒÂ¡Ã‚ÂºÃ‚Â¿ Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢ lÃƒÂ¡Ã‚ÂºÃ‚Â·p").setRequired(true)
            .addChoices(
                { name: "ÃƒÂ¢Ã‚ÂÃ…â€™ TÃƒÂ¡Ã‚ÂºÃ‚Â¯t lÃƒÂ¡Ã‚ÂºÃ‚Â·p", value: "off" },
                { name: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¡ LÃƒÂ¡Ã‚ÂºÃ‚Â·p bÃƒÆ’Ã‚Â i hiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i", value: "track" },
                { name: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â LÃƒÂ¡Ã‚ÂºÃ‚Â·p cÃƒÂ¡Ã‚ÂºÃ‚Â£ queue", value: "queue" },
            )),
    new SlashCommandBuilder().setName("replay").setDescription("ÃƒÂ¢Ã‚ÂÃ‚Âª PhÃƒÆ’Ã‚Â¡t lÃƒÂ¡Ã‚ÂºÃ‚Â¡i bÃƒÆ’Ã‚Â i hiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i tÃƒÂ¡Ã‚Â»Ã‚Â« Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â§u"),
    new SlashCommandBuilder().setName("debug").setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â KiÃƒÂ¡Ã‚Â»Ã†â€™m tra trÃƒÂ¡Ã‚ÂºÃ‚Â¡ng thÃƒÆ’Ã‚Â¡i kÃƒÂ¡Ã‚ÂºÃ‚Â¿t nÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœi & Node"),
];

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Helper Functions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function formatDuration(ms) {
    if (!ms || ms === 0) return "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ LIVE";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function trackEmbed(track, title = "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ Ãƒâ€žÃ‚Âang phÃƒÆ’Ã‚Â¡t") {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(title)
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .addFields(
            { name: "ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤ NghÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡ sÃƒâ€žÃ‚Â©", value: track.info.author || "Unknown", inline: true },
            { name: "ÃƒÂ¢Ã‚ÂÃ‚Â± ThÃƒÂ¡Ã‚Â»Ã‚Âi lÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£ng", value: formatDuration(track.info.duration), inline: true },
        );
    if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl);
    if (track.requester) embed.setFooter({ text: `YÃƒÆ’Ã‚Âªu cÃƒÂ¡Ã‚ÂºÃ‚Â§u bÃƒÂ¡Ã‚Â»Ã…Â¸i ${track.requester.username}` });
    return embed;
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Register Slash Commands ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
    try {
        console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â Ãƒâ€žÃ‚Âang Ãƒâ€žÃ¢â‚¬ËœÃƒâ€žÃ†â€™ng kÃƒÆ’Ã‚Â½ slash commands...");
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands.map(c => c.toJSON()),
        });
        console.log("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ Ãƒâ€žÃ¢â‚¬ËœÃƒâ€žÃ†â€™ng kÃƒÆ’Ã‚Â½ slash commands!");
    } catch (err) {
        console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ LÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i Ãƒâ€žÃ¢â‚¬ËœÃƒâ€žÃ†â€™ng kÃƒÆ’Ã‚Â½ commands:", err);
    }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Bot Ready ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
client.once("ready", async () => {
    console.log(`ÃƒÂ°Ã…Â¸Ã‚Â¤Ã¢â‚¬â€œ Bot online: ${client.user.tag}`);
    client.lavalink.options.client.id = client.user.id;
    try {
        await client.lavalink.init({ id: client.user.id, username: client.user.username });
    } catch (e) {
        console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ LÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i khÃƒÂ¡Ã‚Â»Ã…Â¸i tÃƒÂ¡Ã‚ÂºÃ‚Â¡o Lavalink:", e);
    }
    await registerCommands();
});

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Auto-leave when voice channel is empty ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
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
                if (ch) ch.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â¹ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â²n ai trong voice channel \u2014 Ãƒâ€žÃ¢â‚¬ËœÃƒÆ’Ã‚Â£ rÃƒÂ¡Ã‚Â»Ã‚Âi!")] }).catch(() => { });
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

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Lavalink Events ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
client.lavalink.nodeManager.on("error", (node, error) => {
    console.error(`ÃƒÂ¢Ã‚ÂÃ…â€™ Lavalink Node ${node.id} Error: ${error.message}`);
});

client.lavalink.nodeManager.on("connect", (node) => {
    console.log(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Lavalink Node ${node.id} Connected!`);
});

client.lavalink.nodeManager.on("disconnect", (node, reason) => {
    console.log(`ÃƒÂ¢Ã‚ÂÃ…â€™ Lavalink Node ${node.id} Disconnected:`, reason);
});

client.lavalink.on("playerCreate", (player) => {
    console.log(`ÃƒÂ°Ã…Â¸Ã…Â¸Ã‚Â¡ Player Created for ${player.guildId} on node: ${player.node?.id || "unknown"}`);
});
client.lavalink.on("playerDestroy", (player) => console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â´ Player Destroyed for ${player.guildId}`));

client.lavalink.on("playerUpdate", (player) => {
    // In v2, player.node exists but might be accessed differently in updates
    const nodeId = player.node?.id || player.nodeId || "unknown";
    const isConnected = !!player.voiceChannelId;
    console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¹ [${INSTANCE_ID}] Player Update for ${player.guildId}: Node: ${nodeId}, Connected: ${isConnected}, Playing: ${player.playing}, Volume: ${player.volume}%`);
    if (isConnected && !player.playing && player.queue.current) {
        console.log(`ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â [${INSTANCE_ID}] Player STUCK on ${player.guildId} - State:`, player.state);
        
        // Failsafe: If player gets stuck in an undefined/zombie state due to node drops, destroy it.
        if (player.state === "DISCONNECTED") {
            console.log(`ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â¨ [${INSTANCE_ID}] Destroying zombie player for ${player.guildId}`);
            const channel = client.channels.cache.get(player.textChannelId);
            if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â MÃƒÂ¡Ã‚ÂºÃ‚Â¥t kÃƒÂ¡Ã‚ÂºÃ‚Â¿t nÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœi tÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºi mÃƒÆ’Ã‚Â¡y chÃƒÂ¡Ã‚Â»Ã‚Â§ nhÃƒÂ¡Ã‚ÂºÃ‚Â¡c (Zombie Player). Ãƒâ€žÃ‚Âang dÃƒÂ¡Ã‚Â»Ã‚Ân dÃƒÂ¡Ã‚ÂºÃ‚Â¹p... Vui lÃƒÆ’Ã‚Â²ng gÃƒÂ¡Ã‚Â»Ã‚Âi lÃƒÂ¡Ã‚ÂºÃ‚Â¡i bot!")] }).catch(() => { });
            const realPlayer = client.lavalink.getPlayer(player.guildId);
            if (realPlayer) realPlayer.destroy();

        }
    }
});

process.on("unhandledRejection", (reason) => console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ Unhandled Rejection:", reason));
process.on("uncaughtException", (err) => console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ Uncaught Exception:", err));
client.lavalink.on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannelId);
    console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…Â  [${INSTANCE_ID}] Track Start: ${track.info.title} on node: ${player.node?.id || "unknown"}`);
    
    // Force audio state to ensure it's not silent
    player.setVolume(100);
    if (player.paused) player.resume();

    if (channel) {
        channel.send({ embeds: [trackEmbed(track, "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ Ãƒâ€žÃ‚Âang phÃƒÆ’Ã‚Â¡t")] }).catch(() => { });
    }
});

client.lavalink.on("queueEnd", (player) => {
    const channel = client.channels.cache.get(player.textChannelId);
    if (channel) {
        channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â­ HÃƒÂ¡Ã‚ÂºÃ‚Â¿t nhÃƒÂ¡Ã‚ÂºÃ‚Â¡c trong queue ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â sÃƒÂ¡Ã‚ÂºÃ‚Â½ rÃƒÂ¡Ã‚Â»Ã‚Âi voice channel sau 3 phÃƒÆ’Ã‚Âºt.")] }).catch(() => { });
    }
    setTimeout(() => {
        if (!player.playing) player.destroy();
    }, 180000);
});

client.lavalink.on("trackStuck", async (player, track) => {
    console.error(`ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â [${INSTANCE_ID}] Track STUCK: ${track.info.title} (source: ${track.info.sourceName})`);
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
                        .setDescription(`ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â YouTube bÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ kÃƒÂ¡Ã‚ÂºÃ‚Â¹t luÃƒÂ¡Ã‚Â»Ã¢â‚¬Å“ng. Ãƒâ€žÃ‚Âang tÃƒÂ¡Ã‚Â»Ã‚Â± Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢ng chuyÃƒÂ¡Ã‚Â»Ã†â€™n sang **SoundCloud** dÃƒÂ¡Ã‚Â»Ã‚Â± phÃƒÆ’Ã‚Â²ng...\nÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¶ **${scTrack.info.title}**`)]
                }).catch(() => { });
                return await player.play({ track: scTrack });
            }
        } catch (e) {
            console.error(`[${INSTANCE_ID}] [STUCK-FALLBACK-CRASH] SoundCloud fallback failed:`, e.message);
        }
    }

    if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(0xED4245).setDescription(`ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Track bÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ stuck: **${track.info.title}** ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Ãƒâ€žÃ¢â‚¬Ëœang skip...`)] }).catch(() => { });
    if (player.queue.tracks.length > 0) {
        player.skip();
    } else {
        player.stopPlaying();
    }
});

client.lavalink.on("trackError", async (player, track, payload) => {
    console.error(`ÃƒÂ¢Ã‚ÂÃ…â€™ [${INSTANCE_ID}] Lavalink Track Error for ${track.info.title}:`, payload.exception?.message || payload.error || payload);
    
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
                        .setDescription(`ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â YouTube bÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¹ chÃƒÂ¡Ã‚ÂºÃ‚Â·n link nÃƒÆ’Ã‚Â y. Ãƒâ€žÃ‚Âang tÃƒÂ¡Ã‚Â»Ã‚Â± Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢ng chuyÃƒÂ¡Ã‚Â»Ã†â€™n sang bÃƒÂ¡Ã‚ÂºÃ‚Â£n **SoundCloud** dÃƒÂ¡Ã‚Â»Ã‚Â± phÃƒÆ’Ã‚Â²ng...\nÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¶ **${scTrack.info.title}**`)] 
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
            .setDescription(`ÃƒÂ¢Ã‚ÂÃ…â€™ LÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i phÃƒÆ’Ã‚Â¡t: **${track.info.title}**\nChi tiÃƒÂ¡Ã‚ÂºÃ‚Â¿t: \`${payload.exception?.message?.split("\n")[0] || payload.error || "Unknown Error"}\` ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Ãƒâ€žÃ¢â‚¬Ëœang skip...`)] 
    }).catch(() => { });

    if (player.queue.tracks.length > 0) {
        player.skip();
    } else {
        player.stopPlaying();
    }
});

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Interaction Handler ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, channel, guildId } = interaction;

    if (!guildId) {
        return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ CÃƒÆ’Ã‚Â¡c lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡nh nhÃƒÂ¡Ã‚ÂºÃ‚Â¡c chÃƒÂ¡Ã‚Â»Ã¢â‚¬Â° cÃƒÆ’Ã‚Â³ thÃƒÂ¡Ã‚Â»Ã†â€™ dÃƒÆ’Ã‚Â¹ng trong server!", ephemeral: true });
    }

    let guild = interaction.guild;

    // NÃƒÂ¡Ã‚ÂºÃ‚Â¿u khÃƒÆ’Ã‚Â´ng lÃƒÂ¡Ã‚ÂºÃ‚Â¥y Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c guild (bot chÃƒâ€ Ã‚Â°a Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c add vÃƒÆ’Ã‚Â o server mÃƒÆ’Ã‚Â  dÃƒÆ’Ã‚Â¹ng bÃƒÂ¡Ã‚ÂºÃ‚Â±ng User App)
    if (!guild) {
        try {
            guild = await client.guilds.fetch(guildId);
        } catch (e) {
            console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ Error fetching guild:", e);
            return interaction.reply({
                content: "ÃƒÂ¢Ã‚ÂÃ…â€™ **LÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i:** Bot chÃƒâ€ Ã‚Â°a tham gia Server nÃƒÆ’Ã‚Â y!\n\nBÃƒÂ¡Ã‚ÂºÃ‚Â¡n Ãƒâ€žÃ¢â‚¬Ëœang dÃƒÆ’Ã‚Â¹ng lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡nh qua tÃƒÆ’Ã‚Â­nh nÃƒâ€žÃ†â€™ng User App (ÃƒÂ¡Ã‚Â»Ã‚Â©ng dÃƒÂ¡Ã‚Â»Ã‚Â¥ng cÃƒÆ’Ã‚Â i vÃƒÆ’Ã‚Â o cÃƒÆ’Ã‚Â¡ nhÃƒÆ’Ã‚Â¢n), nhÃƒâ€ Ã‚Â°ng Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã†â€™ bot vÃƒÆ’Ã‚Â o **Voice Channel** hÃƒÆ’Ã‚Â¡t thÃƒÆ’Ã‚Â¬ bot BÃƒÂ¡Ã‚ÂºÃ‚Â®T BUÃƒÂ¡Ã‚Â»Ã‹Å“C phÃƒÂ¡Ã‚ÂºÃ‚Â£i Ãƒâ€žÃ¢â‚¬ËœÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£c Add trÃƒÂ¡Ã‚Â»Ã‚Â±c tiÃƒÂ¡Ã‚ÂºÃ‚Â¿p vÃƒÆ’Ã‚Â o Server nÃƒÆ’Ã‚Â y.\n\nÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ¢â‚¬Â° Vui lÃƒÆ’Ã‚Â²ng gÃƒÂ¡Ã‚Â»Ã‚Â­i link mÃƒÂ¡Ã‚Â»Ã‚Âi bot cho Admin Server Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã†â€™ hÃƒÂ¡Ã‚Â»Ã‚Â thÃƒÆ’Ã‚Âªm vÃƒÆ’Ã‚Â o nhÃƒÆ’Ã‚Â©!",
                ephemeral: true
            });
        }
    }

    let member = interaction.member;
    if (!member || !member.voice) {
        try {
            member = await guild.members.fetch(interaction.user.id);
        } catch (e) {
            console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ Error fetching member:", e);
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ LÃƒÂ¡Ã‚Â»Ã¢â‚¬â€i: KhÃƒÆ’Ã‚Â´ng thÃƒÂ¡Ã‚Â»Ã†â€™ lÃƒÂ¡Ã‚ÂºÃ‚Â¥y thÃƒÆ’Ã‚Â´ng tin Voice cÃƒÂ¡Ã‚Â»Ã‚Â§a bÃƒÂ¡Ã‚ÂºÃ‚Â¡n (thÃƒÂ¡Ã‚Â»Ã‚Â­ gÃƒÆ’Ã‚Âµ lÃƒÂ¡Ã‚ÂºÃ‚Â¡i lÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡nh nhÃƒÆ’Ã‚Â©)!", ephemeral: true });
        }
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /play ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    if (commandName === "play") {
        let voiceChannel = member?.voice?.channel;

        // BÃƒÂ¡Ã‚ÂºÃ‚Â¯t buÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢c fetch member nÃƒÂ¡Ã‚ÂºÃ‚Â¿u cache rÃƒÂ¡Ã‚Â»Ã¢â‚¬â€ng (hay gÃƒÂ¡Ã‚ÂºÃ‚Â·p ÃƒÂ¡Ã‚Â»Ã…Â¸ Text-in-Voice)
        if (!voiceChannel) {
            try {
                const fetchedMember = await guild.members.fetch(interaction.user.id);
                voiceChannel = fetchedMember?.voice?.channel;
            } catch (e) {
                // Ignore fetch errors
            }
        }

        if (!voiceChannel) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ BÃƒÂ¡Ã‚ÂºÃ‚Â¡n cÃƒÂ¡Ã‚ÂºÃ‚Â§n vÃƒÆ’Ã‚Â o voice channel trÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºc!", ephemeral: true });
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
                    return interaction.editReply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ Do chÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœng bot YouTube gÃƒÂ¡Ã‚ÂºÃ‚Â¯t gao, hÃƒÆ’Ã‚Â£y tÃƒÂ¡Ã‚Â»Ã‚Â± gÃƒÆ’Ã‚Âµ **TÃƒÆ’Ã‚Âªn BÃƒÆ’Ã‚Â i HÃƒÆ’Ã‚Â¡t** thay vÃƒÆ’Ã‚Â¬ gÃƒÂ¡Ã‚Â»Ã‚Â­i link nhÃƒÆ’Ã‚Â©!" });
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
            return interaction.editReply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng tÃƒÆ’Ã‚Â¬m thÃƒÂ¡Ã‚ÂºÃ‚Â¥y bÃƒÆ’Ã‚Â i hÃƒÆ’Ã‚Â¡t trÃƒÆ’Ã‚Âªn hÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡ thÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœng dÃƒÂ¡Ã‚Â»Ã‚Â± phÃƒÆ’Ã‚Â²ng!" });
        }

        // We don't overwrite metadata anymore, the SoundCloud metadata is perfectly valid.
        if (result.loadType === "playlist") {
            for (const track of result.tracks) {
                player.queue.add(track);
            }
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ thÃƒÆ’Ã‚Âªm playlist **${result.playlist?.name || "Unknown"}** vÃƒÂ¡Ã‚Â»Ã¢â‚¬Âºi **${result.tracks.length}** bÃƒÆ’Ã‚Â i hÃƒÆ’Ã‚Â¡t.`)]
            });
        } else {
            const track = result.tracks[0];
            player.queue.add(track);
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setColor(0x57F287)
                    .setDescription(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ thÃƒÆ’Ã‚Âªm vÃƒÆ’Ã‚Â o hÃƒÆ’Ã‚Â ng Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã‚Â£i: [**${track.info.title}**](${track.info.uri})`)]
            });
        }

        // Start playing if not already playing. 
        if (!player.playing) {
            console.log(`ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ [${INSTANCE_ID}] Starting playback for: ${player.queue.current?.info?.title || "Unknown Track"}`);
            await player.play();
        } else {
            console.log(`ÃƒÂ¢Ã‚ÂÃ‚Â³ [${INSTANCE_ID}] Track queued: ${player.queue.current?.info?.title || "Unknown Track"}`);
        }
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /skip ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "skip") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i nÃƒÆ’Ã‚Â o trong hÃƒÆ’Ã‚Â ng Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã‚Â£i!", ephemeral: true });
        }
        const current = player.queue.current;
        await player.skip();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xFEE75C).setDescription(`ÃƒÂ¢Ã‚ÂÃ‚Â­ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ skip: **${current?.info?.title || "Unknown"}**`)],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /stop ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "stop") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ gÃƒÆ’Ã‚Â¬ Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t!", ephemeral: true });
        }
        await player.destroy();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xED4245).setDescription("ÃƒÂ¢Ã‚ÂÃ‚Â¹ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ dÃƒÂ¡Ã‚Â»Ã‚Â«ng phÃƒÆ’Ã‚Â¡t nhÃƒÂ¡Ã‚ÂºÃ‚Â¡c vÃƒÆ’Ã‚Â  rÃƒÂ¡Ã‚Â»Ã‚Âi voice channel.")],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /debug ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "debug") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ player nÃƒÆ’Ã‚Â o Ãƒâ€žÃ¢â‚¬Ëœang hoÃƒÂ¡Ã‚ÂºÃ‚Â¡t Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢ng trong server nÃƒÆ’Ã‚Â y!", ephemeral: true });
        }

        const node = player.node;
        const msg = [
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â **Bot Debug Info**`,
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã¢â‚¬Â **Instance:** \`${INSTANCE_ID}\``,
            `ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â **Node:** \`${node?.id || "Unknown"}\` (${node?.host})`,
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¡ **Node Status:** ${node?.connected ? "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Connected" : "ÃƒÂ¢Ã‚ÂÃ…â€™ Disconnected"}`,
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  **Node Ping:** \`${node?.ping}ms\``,
            `ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Âµ **Playing:** ${player.playing ? "ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Yes" : "ÃƒÂ¢Ã‚ÂÃ‚Â¸ No"} (Paused: ${player.paused})`,
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…Â  **Volume:** \`${player.volume}%\``,
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â€ **Connected to Voice:** ${player.voiceChannelId ? "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ <#" + player.voiceChannelId + ">" : "ÃƒÂ¢Ã‚ÂÃ…â€™ No"}`,
            `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â **Text Channel:** <#${player.textChannelId}>`,
            player.queue.current ? `ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¶ **Current Track:** [${player.queue.current.info.title}](${player.queue.current.info.uri})` : `ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â­ **Queue:** Empty`,
        ].join("\n");

        await interaction.reply({ content: msg, ephemeral: true });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /queue ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "queue") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ Queue trÃƒÂ¡Ã‚Â»Ã¢â‚¬Ëœng!", ephemeral: true });
        }

        const current = player.queue.current;
        const tracks = player.queue.tracks.slice(0, 15);
        let desc = `**Ãƒâ€žÃ‚Âang phÃƒÆ’Ã‚Â¡t:** [${current.info.title}](${current.info.uri}) \`${formatDuration(current.info.duration)}\`\n\n`;

        if (tracks.length > 0) {
            desc += tracks.map((t, i) => `**${i + 1}.** [${t.info.title}](${t.info.uri}) \`${formatDuration(t.info.duration)}\``).join("\n");
            if (player.queue.tracks.length > 15) {
                desc += `\n\n... vÃƒÆ’Ã‚Â  **${player.queue.tracks.length - 15}** bÃƒÆ’Ã‚Â i khÃƒÆ’Ã‚Â¡c`;
            }
        } else {
            desc += "*KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i tiÃƒÂ¡Ã‚ÂºÃ‚Â¿p theo trong queue.*";
        }

        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setTitle("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…â€œ Queue").setDescription(desc)
                .setFooter({ text: `TÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¢ng: ${player.queue.tracks.length + 1} bÃƒÆ’Ã‚Â i` })],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /nowplaying ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "nowplaying") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t!", ephemeral: true });
        }
        const track = player.queue.current;
        const pos = player.position;
        const dur = track.info.duration;
        const bar = createProgressBar(pos, dur);

        const embed = trackEmbed(track, "ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â¶ Ãƒâ€žÃ‚Âang phÃƒÆ’Ã‚Â¡t")
            .addFields({ name: "ÃƒÂ¢Ã‚ÂÃ‚Â± TiÃƒÂ¡Ã‚ÂºÃ‚Â¿n trÃƒÆ’Ã‚Â¬nh", value: `${formatDuration(pos)} ${bar} ${formatDuration(dur)}`, inline: false });

        await interaction.reply({ embeds: [embed] });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /pause ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "pause") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.playing) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t!", ephemeral: true });
        }
        await player.pause();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0xFEE75C).setDescription("ÃƒÂ¢Ã‚ÂÃ‚Â¸ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ tÃƒÂ¡Ã‚ÂºÃ‚Â¡m dÃƒÂ¡Ã‚Â»Ã‚Â«ng.")],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /resume ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "resume") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t!", ephemeral: true });
        }
        await player.resume();
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¶ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ tiÃƒÂ¡Ã‚ÂºÃ‚Â¿p tÃƒÂ¡Ã‚Â»Ã‚Â¥c phÃƒÆ’Ã‚Â¡t.")],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /volume ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "volume") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ player Ãƒâ€žÃ¢â‚¬Ëœang hoÃƒÂ¡Ã‚ÂºÃ‚Â¡t Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢ng!", ephemeral: true });
        }
        const level = interaction.options.getInteger("level");
        await player.setVolume(level);
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x57F287).setDescription(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ…Â  ÃƒÆ’Ã¢â‚¬Å¡m lÃƒâ€ Ã‚Â°ÃƒÂ¡Ã‚Â»Ã‚Â£ng: **${level}%**`)],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /replay ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "replay") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t!", ephemeral: true });
        }
        await player.seek(0);
        await interaction.reply({
            embeds: [new EmbedBuilder().setColor(0x5865F2).setDescription("ÃƒÂ¢Ã‚ÂÃ‚Âª Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ phÃƒÆ’Ã‚Â¡t lÃƒÂ¡Ã‚ÂºÃ‚Â¡i bÃƒÆ’Ã‚Â i hÃƒÆ’Ã‚Â¡t tÃƒÂ¡Ã‚Â»Ã‚Â« Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â§u.")],
        });
    }

    // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ /loop ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
    else if (commandName === "loop") {
        const player = client.lavalink.getPlayer(guild.id);
        if (!player || !player.queue.current) {
            return interaction.reply({ content: "ÃƒÂ¢Ã‚ÂÃ…â€™ KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ bÃƒÆ’Ã‚Â i Ãƒâ€žÃ¢â‚¬Ëœang phÃƒÆ’Ã‚Â¡t!", ephemeral: true });
        }
        const mode = interaction.options.getString("mode");
        if (mode === "off") {
            player.setRepeatMode("off");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("ÃƒÂ¢Ã‚ÂÃ…â€™ Ãƒâ€žÃ‚ÂÃƒÆ’Ã‚Â£ tÃƒÂ¡Ã‚ÂºÃ‚Â¯t lÃƒÂ¡Ã‚ÂºÃ‚Â·p lÃƒÂ¡Ã‚ÂºÃ‚Â¡i.")] });
        } else if (mode === "track") {
            player.setRepeatMode("track");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬Å¡ LÃƒÂ¡Ã‚ÂºÃ‚Â·p lÃƒÂ¡Ã‚ÂºÃ‚Â¡i **bÃƒÆ’Ã‚Â i hiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡n tÃƒÂ¡Ã‚ÂºÃ‚Â¡i** vÃƒÆ’Ã‚Â´ hÃƒÂ¡Ã‚ÂºÃ‚Â¡n.")] });
        } else if (mode === "queue") {
            player.setRepeatMode("queue");
            await interaction.reply({ embeds: [new EmbedBuilder().setColor(0x57F287).setDescription("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â LÃƒÂ¡Ã‚ÂºÃ‚Â·p lÃƒÂ¡Ã‚ÂºÃ‚Â¡i **cÃƒÂ¡Ã‚ÂºÃ‚Â£ queue** vÃƒÆ’Ã‚Â´ hÃƒÂ¡Ã‚ÂºÃ‚Â¡n.")] });
        }
    }
});

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Progress Bar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function createProgressBar(current, total, length = 12) {
    if (!total || total === 0) return "ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¬".repeat(length);
    const progress = Math.round((current / total) * length);
    return "ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¬".repeat(Math.max(0, progress)) + "ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‹Å“" + "ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¬".repeat(Math.max(0, length - progress - 1));
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Graceful Shutdown ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
async function shutdown(signal) {
    console.log(`\nÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ¢â‚¬Ëœ ${signal} received ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â shutting down...`);
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

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Login ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
console.log("ÃƒÂ°Ã…Â¸Ã…Â¡Ã¢â€šÂ¬ Starting bot...");
client.login(DISCORD_TOKEN);

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Global Error Handlers (Anti-Crash) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${INSTANCE_ID}] ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â¨ Unhandled Rejection:`, reason);
    // Specifically catch Lavalink JSON parsing errors resulting from 429/502 HTML pages
    if (reason instanceof SyntaxError && reason.message.includes("is not valid JSON")) {
        console.error(`[${INSTANCE_ID}] ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚Â¡ÃƒÂ¯Ã‚Â¸Ã‚Â Caught Lavalink Node HTML/JSON Parsing Error. Preventing crash.`);
    }
});

process.on('uncaughtException', (err) => {
    console.error(`[${INSTANCE_ID}] ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â¨ Uncaught Exception:`, err);
});
