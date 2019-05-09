/**
 * Attempt to parse a message as a "message forwarding command": an identity
 * shortcode followed by the message body. For example, a message like "e hi"
 * could be an attempt to send the message "hi" as the identity with shortcode
 * "e" from the mirror server.
 *
 * Return null if the message string doesn't match this format, or if the first
 * word in the message doesn't match any of our identity shortcodes.
 */
function parseMessageForwardingCommand(content, identities) {
    const match = content.match(/(.+?) (.+)/s);
    if (!match) {
        return null;
    }

    const [_, parsedShortcode, body] = match;

    const identity = identities.find(i =>
        shortcodesMatch(i.shortcode, parsedShortcode)
    );
    if (!identity) {
        return null;
    }

    return { body, identity };
}

/**
 * Return whether two shortcodes are equal. Case-insensitive, generous.
 *
 * Specifically, we compare whether the shortcodes' *base* characters match.
 * The codes "a", "A", and "Á" are all considered equal. We assume that users
 * are unlikely to choose shortcodes that are identical except for case or
 * accent, and that the generous matching is more useful - but we don't have
 * accents in our names, so we wonder whether this is actually true! If users
 * run into issues with this, please send feedback - we would like this bot to
 * be accessible for people of all names!!
 */
function shortcodesMatch(a, b) {
    return a.localeCompare(b, "en", { sensitivity: "base" }) === 0;
}

module.exports = parseMessageForwardingCommand;
