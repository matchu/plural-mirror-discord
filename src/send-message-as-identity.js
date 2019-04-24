function sendMessageAsIdentity(content, channelToSendTo, identity) {
    channelToSendTo.send(`${identity.name}: ${content}`);
}

module.exports = sendMessageAsIdentity;
