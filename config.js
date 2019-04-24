const clientToken = process.env["pm.discord_client_token"];

const sourceServerShortcodes = Object.keys(process.env)
    .map(e => e.match(/^pm\.source_servers\.(.+?)\.server_id/))
    .filter(m => m)
    .map(m => m[1]);

const sourceServerConfigs = sourceServerShortcodes.map(shortcode => ({
    shortcode,
    serverId: process.env[`pm.source_servers.${shortcode}.server_id`],
}));

module.exports = { clientToken, sourceServerConfigs };
