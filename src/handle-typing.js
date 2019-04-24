function handleTypingStart(maybeSourceChannel, user, serverSet) {
    // Is this typing happening in a source channel? We'll find out by looking
    // for a corresponding mirror channel - if there is none, okay, abort!
    const mirrorChannel = serverSet.getMirrorChannelFor(maybeSourceChannel);
    if (!mirrorChannel) {
        return;
    }

    // Otherwise, let's forward the typing to our mirror channel.
    console.log(
        `▶️  [${maybeSourceChannel.guild.name} #${maybeSourceChannel.name}] ${
            user.username
        } is typing…`
    );
    mirrorChannel.startTyping();
}

function handleTypingStop(maybeSourceChannel, user, serverSet) {
    // Is this typing happening in a source channel? We'll find out by looking
    // for a corresponding mirror channel - if there is none, okay, abort!
    const mirrorChannel = serverSet.getMirrorChannelFor(maybeSourceChannel);
    if (!mirrorChannel) {
        return;
    }

    console.log(
        `⏸  [${maybeSourceChannel.guild.name} #${maybeSourceChannel.name}] ${
            user.username
        } stopped typing.`
    );

    // Otherwise, let's stop typing in our mirror channel. (Well, specifically,
    // discord.js automatically counts how many times we've called this vs
    // `startTyping`, and will hide the typing indicator when the count reaches
    // 0. This should handle multiple people typing for free, without us
    // needing to manage any state ourselves!)
    //
    // NOTE: This takes a bit of extra time to resolve: after the user stops
    //       typing, Discord waits a few seconds to send us this event; then,
    //       after we send our own stop-typing action, Discord waits a few
    //       seconds to remove the indicator in the mirror server. That is, the
    //       normal stop-typing buffer time is doubled. Oh well!
    mirrorChannel.stopTyping();
}

module.exports = { handleTypingStart, handleTypingStop };
