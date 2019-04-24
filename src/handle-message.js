const sendMessageAsIdentity = require("./send-message-as-identity");

function buildMessageHandler(serverSet, identities) {
    return async message => {
        try {
            const server = serverSet.getById(message.guild.id);

            if (message.author.bot) {
                // Ignore bot messages, especially our own. We don't expect our
                // messages to, like, start with shortcodes or anything... but it
                // removes a class of bug and reduces log noise!
                return;
            } else if (server.isMirrorServer) {
                await handleMessageFromMirrorServer(
                    message,
                    serverSet,
                    identities
                );
            } else if (server.isSourceServer) {
                console.log("😴  TODO: Handle message from source server");
            } else {
                console.warn(
                    `⚠️  Received message from unexpected server ${
                        message.guild.name
                    }.`
                );
            }
        } catch (e) {
            console.error(`⛔️  Error sending message.`, e);
            message.react("⛔");
            message.reply("⛔️ " + e);
        }
    };
}

async function handleMessageFromMirrorServer(message, serverSet, identities) {
    // Simple for now! Let's just always forward to the first source's
    // #general.
    const serverToSendTo = serverSet.sourceServers[0];
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

    await sendMessageAsIdentity(body, channelToSendTo, identity);

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
