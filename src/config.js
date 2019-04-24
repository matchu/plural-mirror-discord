function getEnv(key) {
    if (!(key in process.env)) {
        console.error(
            `⛔️  Missing required environment variable "${key}". Aborting!`
        );
        process.exit(1);
    }

    return process.env[key];
}

const clientToken = getEnv("DISCORD_CLIENT_TOKEN");
const mirrorServerId = getEnv("MIRROR_SERVER_ID");

const sourceServerShortcodes = Object.keys(process.env)
    .map(e => e.match(/^SOURCE_SERVERS__(.+?)__SERVER_ID/))
    .filter(m => m)
    .map(m => m[1]);

const sourceServerConfigs = sourceServerShortcodes.map(shortcode => ({
    shortcode,
    serverId: getEnv(`SOURCE_SERVERS__${shortcode}__SERVER_ID`),
}));

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
