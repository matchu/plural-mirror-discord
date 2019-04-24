const Discord = require("discord.js");

const { clientToken, sourceServerConfigs } = require("./config");
const initializeServers = require("./initialize-servers");

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`✅  Logged in as ${client.user.tag}!`);

    const inviteUrl =
        "https://discordapp.com/api/oauth2/authorize?client_id=" +
        client.user.id +
        "&permissions=536874048&scope=bot";
    console.log(`💌  Invite: ${inviteUrl}`);

    const { sourceServers, missingSourceServers } = initializeServers(
        client,
        sourceServerConfigs
    );

    for (const { shortcode, guild } of sourceServers) {
        console.log(
            `🎧  Listening to source server "${shortcode}" (${guild.name}).`
        );
    }
    for (const { shortcode, serverId } of missingSourceServers) {
        console.warn(
            `⚠️  We can't access source server "${shortcode}" ` +
                `(${serverId}). Make sure we're invited to it!`
        );
    }
    if (sourceServers.length === 0) {
        console.warn("⚠️  No source servers found.");
    }

    console.log("💞  hii I love you! 😍");
});

client.on("message", msg => {
    if (msg.content === "ping") {
        msg.reply("Pong!");
    }
});

client.login(clientToken);
