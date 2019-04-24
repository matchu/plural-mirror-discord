const Discord = require("discord.js");

const {
    clientToken,
    mirrorServerId,
    sourceServerConfigs,
    identities,
} = require("./config");
const initializeServers = require("./initialize-servers");
const buildMessageHandler = require("./handle-message");

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`✅  Logged in as ${client.user.tag}!`);

    const inviteUrl =
        "https://discordapp.com/api/oauth2/authorize?client_id=" +
        client.user.id +
        "&permissions=536874048&scope=bot";
    console.log(`💌  Invite: ${inviteUrl}`);

    const {
        mirrorServer,
        sourceServers,
        missingSourceServers,
    } = initializeServers(client, mirrorServerId, sourceServerConfigs);

    if (mirrorServer) {
        console.log(
            `🌻  Listening to mirror server: ${mirrorServer.guild.name}.`
        );
    } else {
        console.error(
            `⛔️  We can't access the mirror server (${mirrorServerId})! ` +
                `PluralMirror won't be able to perform any of its actual ` +
                `mirroring functionality. Please make sure you've invited ` +
                `the bot! (This could also be a network outage? 🤔)`
        );
    }

    for (const { shortcode, guild } of sourceServers) {
        console.log(
            `🎧  Listening to source server: ${guild.name} [${shortcode}].`
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

    client.on(
        "message",
        buildMessageHandler(client, mirrorServer, sourceServers, identities)
    );
});

client.login(clientToken);
