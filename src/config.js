function getEnv(key) {
    if (!(key in process.env)) {
        console.error(
            `⛔️  Missing required environment variable "${key}". Aborting!`
        );
        process.exit(1);
    }

    return process.env[key];
}

const clientToken = getEnv("pm.discord_client_token");
const mirrorServerId = getEnv("pm.mirror_server_id");

const sourceServerShortcodes = Object.keys(process.env)
    .map(e => e.match(/^pm\.source_servers\.(.+?)\.server_id/))
    .filter(m => m)
    .map(m => m[1]);

const sourceServerConfigs = sourceServerShortcodes.map(shortcode => ({
    shortcode,
    serverId: getEnv(`pm.source_servers.${shortcode}.server_id`),
}));

const identityShortcodes = Object.keys(process.env)
    .map(e => e.match(/^pm\.identities\.(.+?)\.name/))
    .filter(m => m)
    .map(m => m[1]);

const identities = identityShortcodes.map(shortcode => ({
    shortcode,
    name: getEnv(`pm.identities.${shortcode}.name`),
    avatarUrl: getEnv(`pm.identities.${shortcode}.avatar_url`),
}));

module.exports = {
    clientToken,
    mirrorServerId,
    sourceServerConfigs,
    identities,
};
