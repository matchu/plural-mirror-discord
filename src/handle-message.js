const sendMessageAsIdentity = require("./send-message-as-identity");

function buildMessageHandler(
    message,
    mirrorServer,
    sourceServers,
    identities
) {
    const allServers = [mirrorServer, ...sourceServers];
    const allServersById = new Map(allServers.map(s => [s.guild.id, s]));

    return message => {
        const server = allServersById.get(message.guild.id);

        if (server.isMirrorServer) {
            handleMessageFromMirrorServer(message, sourceServers, identities);
        } else if (server.isSourceServer) {
            console.log("message from source server");
        } else {
            console.warn(
                `⚠️  Received message from unexpected server ${
                    message.guild.name
                }.`
            );
        }
    };
}

function handleMessageFromMirrorServer(message, sourceServers, identities) {
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
    sendMessageAsIdentity(body, channelToSendTo, identity);
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
