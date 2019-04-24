/**
 * This application is configured via environment variables.
 *
 * Locally, you can use a `.env` file to specify these values - or, if you
 * deploy to a service like Heroku, you can specify them in your application's
 * "config vars" control panel.
 *
 * Some of these values are simple:
 *
 * - `DISCORD_CLIENT_TOKEN`: Your Discord bot's secret login token.
 * - `MIRROR_SERVER_ID`: The Discord server ID for your "mirror server", your
 *   private command-center server just for this bot. In the web app, this is
 *   the first big number in the server's URL.
 *
 * The values for specifying your set of source servers and plural identities
 * are a bit more complex, because you can have more than one of each. In each
 * case, replace `{shortcode}` with an alphanumeric "shortcode" for the server
 * or identity. Note the double underscores around shortcodes.
 *
 * - `SOURCE_SERVERS__{shortcode}__SERVER_ID`: The Discord server ID for this
 *   "source server", a public-ish server where the canonical conversations
 *   happen. In the web app, this is the first big number in the server's URL.
 * - `IDENTITIES__{shortcode}__NAME`: The display name for this plural
 *   identity. Will appear on each message this headmate sends. (This can use
 *   cute Unicode or emoji or whatever - in the app, you'll always this
 *   identity by its shortcode anyway, so it's okay if this string is fancy and
 *   hard to type!)
 * - `IDENTITIES__{shortcode}__AVATAR_URL`: The avatar URL for this plural
 *   identity. Will appear as the avatar for each message this headmate sends.
 *   (If you want to use a file from your computer, consider uploading it to
 *   imgur and copying the .png URL to here!)
 *
 * For your source server, the "shortcode" will be used when creating mirror
 * channels. For example, if you have `SOURCE_SERVERS__test__SERVER_ID`
 * configured, and the corresponding source server has a #general channel, then
 * we'll create a #test-general channel in your mirror server. This enables you
 * to mirror channels from multiple servers, without worrying about naming
 * conflicts.
 *
 * For your identities, the "shortcode" will be used to type messages as this
 * identity. For example, if you have `IDENTITIES__e__NAME` configured, then
 * you can type "e Hello!" in a mirror channel, it will send a message as
 * identity "e".
 */

/** Get an environment variable, or abort if it's missing. */
function getEnv(key) {
    if (!(key in process.env)) {
        console.error(
            `⛔️  Missing required environment variable "${key}". Aborting!`
        );
        process.exit(1);
    }

    return process.env[key];
}

// These ones are easy to fetch!
const clientToken = getEnv("DISCORD_CLIENT_TOKEN");
const mirrorServerId = getEnv("MIRROR_SERVER_ID");

// For source servers, we first get all the shortcodes, then iterate over them
// to build the source server config objects.
const sourceServerShortcodes = Object.keys(process.env)
    .map(e => e.match(/^SOURCE_SERVERS__(.+?)__SERVER_ID/))
    .filter(m => m)
    .map(m => m[1]);
const sourceServerConfigs = sourceServerShortcodes.map(shortcode => ({
    shortcode,
    serverId: getEnv(`SOURCE_SERVERS__${shortcode}__SERVER_ID`),
}));

// For identities, we first get all the shortcodes, then iterate over them to
// build the identity config objects.
const identityShortcodes = Object.keys(process.env)
    .map(e => e.match(/^IDENTITIES__(.+?)__NAME/))
    .filter(m => m)
    .map(m => m[1]);
const identities = identityShortcodes.map(shortcode => ({
    shortcode,
    name: getEnv(`IDENTITIES__${shortcode}__NAME`),
    avatarUrl: getEnv(`IDENTITIES__${shortcode}__AVATAR_URL`),
}));

module.exports = {
    clientToken,
    mirrorServerId,
    sourceServerConfigs,
    identities,
};
