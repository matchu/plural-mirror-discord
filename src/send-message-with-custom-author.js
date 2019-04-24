// TODO: I'm using a specialized string here, to match my personal brand,
//       since it's public-facing-ish. This should probably be configured!
const WEBHOOK_NAME = "MoreMatchus Message Proxy";

async function sendMessageWithCustomAuthor(
    content,
    channelToSendTo,
    customAuthor
) {
    // Webhooks are the key to this whole bot! Normally, your bot speaks with
    // its fixed name and avatar - but webhook messages can be configured to
    // show arbitrary names, avatars, etc. :)
    const webhook = await connectToWebhook(channelToSendTo);
    webhook.send(content, {
        username: customAuthor.username,
        avatarURL: customAuthor.avatarURL,
    });
}

async function connectToWebhook(channel) {
    // First, look for an existing webhook.
    // TODO: This adds an extra net round-trip, we should probably cache this?
    const allExistingWebhooks = await channel.fetchWebhooks();
    const existingWebhook = allExistingWebhooks.find(
        wh => wh.name === WEBHOOK_NAME
    );
    if (existingWebhook) {
        return existingWebhook;
    }

    // Okay, let's create one instead!
    const newWebhook = await channel.createWebhook(
        WEBHOOK_NAME,
        null,
        "Automatically created in order to proxy a message"
    );
    return newWebhook;
}

module.exports = sendMessageWithCustomAuthor;
