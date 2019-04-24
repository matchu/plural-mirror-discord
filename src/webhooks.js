// TODO: I'm using a specialized message here, to match my personal brand,
//       since it's public-facing-ish. This should probably be configured!
const WEBHOOK_NAME = "MoreMatchus Message Proxy";

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

module.exports = connectToWebhook;
