const sendMessageWithCustomAuthor = require("./send-message-with-custom-author");

async function handleMessage(message, serverSet, identities, restart) {
    try {
        const server = serverSet.getServerById(message.guild.id);

        if (message.author.bot) {
            // Ignore bot messages, especially our own. We don't expect our
            // messages to, like, start with shortcodes or anything... but it
            // removes a class of bug and reduces log noise!
            return;
        } else if (server.isMirrorServer) {
            try {
                await handleMessageFromMirrorServer(
                    message,
                    serverSet,
                    identities,
                    restart
                );
            } catch (e) {
                // Notify the user of the error, then bubble up to the
                // main error handler. (We only do this for the mirror
                // server, to avoid disrupting people on the source
                // server!)
                message.reply("⛔️ " + e);
                throw e;
            }
        } else if (server.isSourceServer) {
            await handleMessageFromSourceServer(message, serverSet);
        } else {
            console.warn(
                `⚠️  Received message from unexpected server ${
                    message.guild.name
                }.`
            );
        }
    } catch (e) {
        console.error(`⛔️  Error handling message.`, e);
    }
}

async function handleMessageFromMirrorServer(
    message,
    serverSet,
    identities,
    restart
) {
    if (message.content === "ping") {
        console.log("⭐️  Ping!");
        message.reply("Pong! 💖");
        return;
    }

    if (message.content === "restart") {
        console.log("❗️  Restarting!");
        await message.reply("❗️  Restarting!");
        restart();
        return;
    }

    const mirrorChannel = message.channel;
    const sourceChannel = serverSet.getSourceChannelFor(mirrorChannel);

    const parsedMessage = parseMessageContentFromMirrorServer(
        message.content,
        identities
    );
    if (!parsedMessage) {
        console.warn(
            `⚠️  Message from mirror server did not start with an identity shortcode.`
        );
        message.reply(`⚠️  Didn't understand that message 😓`);
        return;
    }

    const { body, identity } = parsedMessage;

    console.log(
        `✉️  [${sourceChannel.guild.name} #${sourceChannel.name}] ${
            identity.name
        }: ${body}`
    );

    await sendMessageWithCustomAuthor(body, sourceChannel, {
        username: identity.name,
        avatarURL: identity.avatarURL,
    });

    message.react("✅");
}

async function handleMessageFromSourceServer(message, serverSet) {
    const sourceChannel = message.channel;
    const mirrorChannel = serverSet.getMirrorChannelFor(sourceChannel);

    const body = message.content;

    console.log(
        `📬  [${sourceChannel.guild.name} #${sourceChannel.name}] ${
            message.author.username
        }: ${body}`
    );

    await sendMessageWithCustomAuthor(message.content, mirrorChannel, {
        username: message.author.username,
        avatarURL: message.author.avatarURL,
    });
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

module.exports = handleMessage;
