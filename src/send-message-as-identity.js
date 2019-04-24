const connectToWebhook = require("./webhooks");

async function sendMessageAsIdentity(content, channelToSendTo, identity) {
    // Webhooks are the key to this whole bot! Normally, your bot speaks with
    // its fixed name and avatar - but webhook messages can be configured to
    // show arbitrary names, avatars, etc. :)
    const webhook = await connectToWebhook(channelToSendTo);
    webhook.send(content, {
        username: identity.name,
        avatarURL: identity.avatarUrl,
    });
}

module.exports = sendMessageAsIdentity;
