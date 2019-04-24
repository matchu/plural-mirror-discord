class ServerSet {
    constructor(mirrorServer, sourceServers) {
        this.mirrorServer = mirrorServer;
        this.sourceServers = sourceServers;

        const allServers = [mirrorServer, ...sourceServers];
        this._allServersById = new Map(allServers.map(s => [s.guild.id, s]));
    }

    getById(serverId) {
        return this._allServersById.get(serverId);
    }
}

function connectToMirrorServer(client, serverId) {
    const guild = client.guilds.get(serverId);
    if (!guild) {
        return null;
    }

    return { guild, isMirrorServer: true };
}

function connectToSourceServer(client, shortcode, serverId) {
    const guild = client.guilds.get(serverId);
    if (!guild) {
        return null;
    }

    return { shortcode, guild, isSourceServer: true };
}

function initializeServers(client, mirrorServerId, sourceServerConfigs) {
    const mirrorServer = connectToMirrorServer(client, mirrorServerId);

    const sourceServers = [];
    const missingSourceServers = [];

    // Look up the guild data for each source server, and build a "source
    // server" object that includes the guild data, and our shortcode for it.
    for (const { shortcode, serverId } of sourceServerConfigs) {
        const sourceServer = connectToSourceServer(
            client,
            shortcode,
            serverId
        );

        // If we can't find the guild data for this server, then we're probably
        // not invited, or maybe there's a network issue. Track this server in
        // a separate list, so we can surface a warning.
        if (!sourceServer) {
            missingSourceServers.push({ shortcode, serverId });
            continue;
        }

        sourceServers.push(sourceServer);
    }

    const serverSet = new ServerSet(mirrorServer, sourceServers);

    return { serverSet, missingSourceServers };
}

module.exports = initializeServers;
