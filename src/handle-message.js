const sendMessageAsIdentity = require("./send-message-as-identity");

function buildMessageHandler(mirrorServer, sourceServers, identities) {
    const allServers = [mirrorServer, ...sourceServers];
    const allServersById = new Map(allServers.map(s => [s.guild.id, s]));

    return message => {
        const server = allServersById.get(message.guild.id);

        if (message.author.bot) {
            // Ignore bot messages, especially our own. We don't expect our
            // messages to, like, start with shortcodes or anything... but it
            // removes a class of bug and reduces log noise!
            return;
        } else if (server.isMirrorServer) {
            handleMessageFromMirrorServer(message, sourceServers, identities);
        } else if (server.isSourceServer) {
            console.log("😴  TODO: Handle message from source server");
        } else {
            console.warn(
                `⚠️  Received message from unexpected server ${
                    message.guild.name
                }.`
            );
        }
    };
}

async function handleMessageFromMirrorServer(
    message,
    sourceServers,
    identities
) {
    // Simple for now! Let's just always forward to the first source's
    // #general.
    const serverToSendTo = sourceServers[0];
    const channelToSendTo = serverToSendTo.guild.defaultChannel;

    const parsedMessage = parseMessageContentFromMirrorServer(
        message.content,
        identities
    );
    if (!parsedMessage) {
        console.warn(
            `⚠️  Message from mirror server did not start with an identity shortcode.`
        );
        return;
    }

    const { body, identity } = parsedMessage;

    console.log(
        `✉️  [${channelToSendTo.guild.name} #${channelToSendTo.name}] ${
            identity.name
        }: ${body}.`
    );

    try {
        await sendMessageAsIdentity(body, channelToSendTo, identity);
    } catch (e) {
        console.error(`⛔️  Error sending message.`, e);
        message.react("⛔");
        message.reply("⛔️ " + e);
        return;
    }

    message.react("✅");
}

function parseMessageContentFromMirrorServer(content, identities) {
    const match = content.match(/(.+?) (.+)/);
    if (!match) {
        return null;
    }

    const [_, shortcode, body] = match;

    const identity = identities.find(i => i.shortcode === shortcode);
    if (!identity) {
        return null;
    }

    return { body, identity };
}

module.exports = buildMessageHandler;
