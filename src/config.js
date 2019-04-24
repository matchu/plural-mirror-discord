const clientToken = process.env["pm.discord_client_token"];
const mirrorServerId = process.env["pm.mirror_server_id"];

const sourceServerShortcodes = Object.keys(process.env)
    .map(e => e.match(/^pm\.source_servers\.(.+?)\.server_id/))
    .filter(m => m)
    .map(m => m[1]);

const sourceServerConfigs = sourceServerShortcodes.map(shortcode => ({
    shortcode,
    serverId: process.env[`pm.source_servers.${shortcode}.server_id`],
}));

const identityShortcodes = Object.keys(process.env)
    .map(e => e.match(/^pm\.identities\.(.+?)\.name/))
    .filter(m => m)
    .map(m => m[1]);

const identities = identityShortcodes.map(shortcode => ({
    shortcode,
    name: process.env[`pm.identities.${shortcode}.name`],
    avatarUrl: process.env[`pm.identities.${shortcode}.avatar_url`],
}));

module.exports = {
    clientToken,
    mirrorServerId,
    sourceServerConfigs,
    identities,
};
