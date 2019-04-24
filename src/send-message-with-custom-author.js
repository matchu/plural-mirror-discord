// TODO: I'm using a specialized string here, to match my personal brand,
//       since it's public-facing-ish. This should probably be configured!
const WEBHOOK_NAME = "MoreMatchus Message Proxy";

/**
 * Send a message with a custom author! The key to the whole bot :)
 *
 * We hack out this feature using webhooks, which, unlike normal bot messages,
 * enable you to specify a custom username & avatar every time you send it a
 * message.
 *
 * First, we ensure that this channel has our custom webhook installed,
 * creating it if not. Then, we send a message to that webhook.
 */
async function sendMessageWithCustomAuthor(
    content,
    channelToSendTo,
    customAuthor
) {
    const webhook = await findOrCreateWebhook(channelToSendTo);
    webhook.send(content, {
        username: customAuthor.username,
        avatarURL: customAuthor.avatarURL,
    });
}

/**
 * Find our custom webhook for this channel, or create it if it doesn't exist.
 */
async function findOrCreateWebhook(channel) {
    // First, look for an existing webhook, and return it if it exists.
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
