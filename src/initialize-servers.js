/**
 * Set up our connections to our servers, and initialize mirroring.
 *
 * This includes creating a "mirror channel" in our mirror server,
 * corresponding to each channel on our source servers. For example, if you
 * have a source server with the shortcode "test", and it has a #general
 * channel, then we'll create a #test-general channel in the mirror server.
 * (Shortcodes are configured for each source server in `config.js`.)
 */
async function initializeServers(client, mirrorServerId, sourceServerConfigs) {
    // Find the mirror server corresponding to our config, and create a "mirror
    // server" object for it.
    const mirrorServer = findMirrorServer(client, mirrorServerId);

    const sourceServers = [];
    const missingSourceServers = [];

    // Find all the source servers corresponding to our config, and create a
    // "source server" object for each.
    for (const { shortcode, serverId } of sourceServerConfigs) {
        const sourceServer = findSourceServer(client, shortcode, serverId);

        // If we can't find the guild data for this server, then we're probably
        // not invited, or maybe there's a network issue. Track this server in
        // a separate list, so we can surface a warning.
        if (!sourceServer) {
            missingSourceServers.push({ shortcode, serverId });
            continue;
        }

        sourceServers.push(sourceServer);
    }

    // For each channel in each source server, set up a corresponding channel
    // in the mirror server, creating it if it doesn't exist. Then, combine
    // them into a "channel pair" object, so that they're easy to map to each
    // other later.
    //
    // (If we couldn't connect to the mirror server, we're still running this
    // function in order to yield troubleshooting data about source servers...
    // but we should skip this mirroring step, because we can't do it without a
    // mirror server!)
    const channelPairs = [];
    if (mirrorServer) {
        for (const sourceServer of sourceServers) {
            for (const sourceChannel of sourceServer.guild.channels.array()) {
                // Only doing text channels for now!
                if (sourceChannel.type !== "text") {
                    continue;
                }

                const mirrorChannel = await setupMirrorChannel(
                    sourceChannel,
                    sourceServer,
                    mirrorServer
                );
                channelPairs.push({ sourceChannel, mirrorChannel });
            }
        }
    }

    // Finally, combine all this data into a "server set" object, which we'll
    // use later in the app to look up information about our servers and
    // channels.
    const serverSet = new ServerSet(mirrorServer, sourceServers, channelPairs);

    return { serverSet, missingSourceServers };
}

/**
 * Find the mirror server, and build a "mirror server" object for it. Or, if we
 * can't find it, return null.
 */
function findMirrorServer(client, serverId) {
    const guild = client.guilds.get(serverId);
    if (!guild) {
        return null;
    }

    return { guild, isMirrorServer: true };
}

/**
 * Find the source server, and build a "source server" object for it. Or, if we
 * can't find it, return null.
 */
function findSourceServer(client, shortcode, serverId) {
    const guild = client.guilds.get(serverId);
    if (!guild) {
        return null;
    }

    return { shortcode, guild, isSourceServer: true };
}

/**
 * Find the mirror channel for the given source channel, creating it if
 * necessary. Additionally, ensure the channel is configured with all the right
 * metadata.
 */
async function setupMirrorChannel(sourceChannel, sourceServer, mirrorServer) {
    const mirrorChannel = await findOrCreateMirrorChannel(
        sourceChannel,
        sourceServer,
        mirrorServer
    );

    // Set the mirror channel's topic to include a "back link" to the source
    // channel, to make it easy to get back to the canonical conversation :)
    const sourceChannelUrl = `https://discordapp.com/channels/${
        sourceServer.guild.id
    }/${sourceChannel.id}`;
    mirrorChannel.setTopic(
        `🔙❓  ${sourceChannelUrl}`,
        "Automatic topic change for convenient link back to source channel"
    );

    return mirrorChannel;
}

/**
 * Find the mirror channel for the given source channel, creating it if
 * necessary.
 */
async function findOrCreateMirrorChannel(
    sourceChannel,
    sourceServer,
    mirrorServer
) {
    // Build the mirrored channel name, which contains a reference to the
    // source server *and* the channel name. That way, we can mirror multiple
    // servers without name conflicts. (For example, the #general channel in
    // server with shortcode "test" will be mirrored as #test-general.)
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

/**
 * A convenience class representing our mirror server, source servers, and the
 * channel relationships between them.
 */
class ServerSet {
    constructor(mirrorServer, sourceServers, channelPairs) {
        this.mirrorServer = mirrorServer;
        this.sourceServers = sourceServers;
        if (!mirrorServer) {
            return;
        }

        // Here, we pre-build some Map objects, to make lookups easy & fast.
        // Our instance methods just use these!
        const allServers = [mirrorServer, ...sourceServers];
        this._allServersById = new Map(allServers.map(s => [s.guild.id, s]));

        this._sourceChannelsByMirrorChannelId = new Map(
            channelPairs.map(cp => [cp.mirrorChannel.id, cp.sourceChannel])
        );

        this._mirrorChannelsBySourceChannelId = new Map(
            channelPairs.map(cp => [cp.sourceChannel.id, cp.mirrorChannel])
        );
    }

    /** Find the mirror server *or* source server with the corresponding ID. */
    getServerById(serverId) {
        return this._allServersById.get(serverId);
    }

    /** Given a source channel, return its corresponding mirror channel. */
    getMirrorChannelFor(sourceChannel) {
        return this._mirrorChannelsBySourceChannelId.get(sourceChannel.id);
    }

    /** Given a mirror channel, return its corresponding source channel. */
    getSourceChannelFor(mirrorChannel) {
        return this._sourceChannelsByMirrorChannelId.get(mirrorChannel.id);
    }
}

module.exports = initializeServers;
