class ServerSet {
    constructor(mirrorServer, sourceServers, channelPairs) {
        this.mirrorServer = mirrorServer;
        this.sourceServers = sourceServers;

        const allServers = [mirrorServer, ...sourceServers];
        this._allServersById = new Map(allServers.map(s => [s.guild.id, s]));

        this._sourceChannelsByMirrorChannelId = new Map(
            channelPairs.map(cp => [cp.mirrorChannel.id, cp.sourceChannel])
        );
    }

    getServerById(serverId) {
        return this._allServersById.get(serverId);
    }

    getSourceChannelFor(mirrorChannel) {
        return this._sourceChannelsByMirrorChannelId.get(mirrorChannel.id);
    }
}

async function initializeServers(client, mirrorServerId, sourceServerConfigs) {
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

    // For each channel in each source server, find the corresponding channel
    // in the mirror server, and create one if it doesn't exist. (Skip this if
    // we couldn't connect to the mirror server.)
    const channelPairs = [];
    if (mirrorServer) {
        for (const sourceServer of sourceServers) {
            for (const sourceChannel of sourceServer.guild.channels.array()) {
                // Only doing text channels for now!
                if (sourceChannel.type !== "text") {
                    continue;
                }

                const mirrorChannel = await findOrCreateMirrorChannel(
                    sourceChannel,
                    sourceServer,
                    mirrorServer
                );
                channelPairs.push({ sourceChannel, mirrorChannel });
            }
        }
    }

    const serverSet = new ServerSet(mirrorServer, sourceServers, channelPairs);

    return { serverSet, missingSourceServers };
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

async function findOrCreateMirrorChannel(
    sourceChannel,
    sourceServer,
    mirrorServer
) {
    // Build the mirrored channel name, which contains a reference to the
    // source server *and* the channel name. That way, we can mirror multiple
    // servers without name conflicts. (For example, the #general channel in
    // server with shortcode "nya" will be mirrored as #nya-general.)
    const mirrorChannelName =
        sourceServer.shortcode + "-" + sourceChannel.name;

    // Look for an existing channel with this name in the mirror server. If we
    // have one, use it!
    const existingMirrorChannel = mirrorServer.guild.channels.find(
        c => c.name === mirrorChannelName
    );
    if (existingMirrorChannel) {
        return existingMirrorChannel;
    }

    // Otherwise, create a new channel with this name in the mirror server.
    //
    // TODO: Might be nice to copy the channel's position in the source
    //       server... for now, I'll just re-order them manually in the UI.
    const newMirrorChannel = mirrorServer.guild.createChannel(
        mirrorChannelName,
        "text"
    );
    return newMirrorChannel;
}

module.exports = initializeServers;
