/**
 * Handle when a user starts typing in the mirror server or a source server.
 *
 * We forward typing in both directions: our typing in the mirror server goes
 * to the source server, and other people's typing in the source server goes to
 * the mirror server.
 *
 * If our handling were more complex here (e.g. if we were attaching names
 * to it or w/e), we would probably want to handle those cases separately.
 * For now though, we handle them together: typing just gets proxied
 * bi-directionally, and that's all there is to it!
 */
function handleTypingStart(originalChannel, user, serverSet) {
    // Ignore when bots type. This is mainly a hacky way to prevent an infinite
    // loop where our typing indicator in one channel triggers a typing
    // indicator in the paired channel 😅
    if (user.bot) {
        return;
    }

    // Get the mirror channel corresponding to this source channel, or
    // vice-versa. Or, if this typing is happening in a non-paired channel,
    // ignore it.
    const pairedChannel = serverSet.getPairedChannelFor(originalChannel);
    if (!pairedChannel) {
        return;
    }

    console.log(
        `▶️  [${originalChannel.guild.name} #${originalChannel.name}] ${
            user.username
        } is typing…`
    );

    // Forward the typing from the original channel to the paired channel.
    pairedChannel.startTyping();
}

/** Handle when a user stops typing in the mirror server or a source server. */
function handleTypingStop(originalChannel, user, serverSet) {
    // Ignore when bots type. This is mainly a hacky way to prevent an infinite
    // loop where our typing indicator in one channel triggers a typing
    // indicator in the paired channel 😅
    if (user.bot) {
        return;
    }

    // Get the mirror channel corresponding to this source channel, or
    // vice-versa. Or, if this typing is happening in a non-paired channel,
    // ignore it.
    const pairedChannel = serverSet.getPairedChannelFor(originalChannel);
    if (!pairedChannel) {
        return;
    }

    console.log(
        `⏸  [${originalChannel.guild.name} #${originalChannel.name}] ${
            user.username
        } stopped typing.`
    );

    // Stop typing in our paired channel. (Well, specifically, discord.js
    // automatically counts how many times we've called this vs `startTyping`,
    // and will hide the typing indicator when the count reaches 0. This should
    // handle multiple people typing for free, without us needing to manage any
    // state ourselves!)
    //
    // NOTE: This takes a bit of extra time to resolve: after the user stops
    //       typing, Discord waits a few seconds to send us this event; then,
    //       after we send our own stop-typing action, Discord waits a few
    //       seconds to remove the indicator in the mirror server. That is, the
    //       normal stop-typing buffer time is doubled. Oh well!
    pairedChannel.stopTyping();
}

module.exports = { handleTypingStart, handleTypingStop };
