const Discord = require("discord.js");

const {
    clientToken,
    mirrorServerId,
    sourceServerConfigs,
    identities,
} = require("./config");
const initializeServers = require("./initialize-servers");
const buildMessageHandler = require("./handle-message");

async function main() {
    // Cute stuff here! We're going to block on this promise (i.e., run our bot
    // forever), until we get a restart command.
    let resolveRestartPromise;
    const restartPromise = new Promise(resolve => {
        resolveRestartPromise = resolve;
    });

    const client = new Discord.Client();

    client.on("ready", async () => {
        console.log(`✅  Logged in as ${client.user.tag}!`);

        const mirrorInviteUrl =
            "https://discordapp.com/api/oauth2/authorize?client_id=" +
            client.user.id +
            "&permissions=536874064&scope=bot";
        const sourceInviteUrl =
            "https://discordapp.com/api/oauth2/authorize?client_id=" +
            client.user.id +
            "&permissions=536874048&scope=bot";
        console.log(`💌  Invite to mirror server: ${mirrorInviteUrl}`);
        console.log(`💌  Invite to source server: ${sourceInviteUrl}`);

        let serverSet, missingSourceServers;
        try {
            ({ serverSet, missingSourceServers } = await initializeServers(
                client,
                mirrorServerId,
                sourceServerConfigs
            ));
        } catch (e) {
            console.error("⛔️  Error during initialization", e);
        }

        const { mirrorServer, sourceServers } = serverSet;

        if (mirrorServer) {
            console.log(
                `🌻  Listening to mirror server: ${mirrorServer.guild.name}.`
            );
        } else {
            console.error(
                `⛔️  We can't access the mirror server (${mirrorServerId})! ` +
                    `PluralMirror won't be able to perform any of its actual ` +
                    `mirroring functionality. Please make sure you've invited ` +
                    `the bot! (This could also be a network outage? 🤔)`
            );
        }

        for (const { shortcode, guild } of sourceServers) {
            console.log(
                `🎧  Listening to source server: ${guild.name} [${shortcode}].`
            );
        }
        for (const { shortcode, serverId } of missingSourceServers) {
            console.warn(
                `⚠️  We can't access source server "${shortcode}" ` +
                    `(${serverId}). Make sure we're invited to it!`
            );
        }
        if (sourceServers.length === 0) {
            console.warn("⚠️  No source servers found.");
        }

        console.log("💞  hii I love you! 😍");

        // Tricky stuff happening here! To restart the server, we tear down
        // the client, then *resolve the promise* that this function
        // returns. This causes us to tick to the next iteration of the
        // loop in `mainForever`, which just calls `main()` again.
        const restart = () => {
            client.destroy();
            resolveRestartPromise();
        };

        client.on(
            "message",
            buildMessageHandler(serverSet, identities, restart)
        );
    });

    await client.login(clientToken);

    // Keep running the bot until we get a restart command.
    await restartPromise;
}

// This loop exists entirely for the purpose of restarting! The promise
// returned by `main()` will only resolve when the `restart()` function is
// called, in which case we call `main()` again :)
async function mainForever() {
    while (true) {
        try {
            await main();
        } catch (e) {
            // Well, if we throw an error during setup, we should probably
            // actually crash instead of running again...
            console.error("⛔️  Error during setup:", e);
            process.exit();
        }
    }
}

mainForever();
