const Discord = require("discord.js");

const {
    clientToken,
    mirrorServerId,
    sourceServerConfigs,
    identities,
} = require("./config");
const initializeServers = require("./initialize-servers");
const buildMessageHandler = require("./handle-message");

function main(restart) {
    const client = new Discord.Client();

    client.on("ready", async () => {
        console.log(`✅  Logged in as ${client.user.tag}!`);

        // Print some invite links, so that they're always easy to find :)
        //
        // The "mirror server" is the private command-center server just for
        // us. It mirrors the conversations in the source servers, and enables
        // us to speak as our headmates and send other commands.
        //
        // The "source servers" are the public-ish servers where the canonical
        // conversations happen! Our friends will be talking in these servers,
        // and our bot will sometimes speak there on our headmates' behalf.
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

        // Set up our connections to these servers, and initialize mirroring.
        // See `initialize-servers.js`.
        //
        // This includes creating a "mirror channel" in our mirror server,
        // corresponding to each channel on our source servers. For example,
        // if you have a source server with the shortcode "test", and it has a
        // #general channel, then we'll create a #test-general channel in the
        // mirror server. (Shortcodes are configured for each source server in
        // `config.js`.)
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

        // Log status information for our mirror server, to help the user
        // confirm setup and troubleshoot issues.
        if (mirrorServer) {
            console.log(
                `🌻  Listening to mirror server: ${mirrorServer.guild.name}.`
            );
        } else {
            console.error(
                `⛔️  We can't access the mirror server (${mirrorServerId})! ` +
                    `Please make sure you've invited the bot! (This could ` +
                    `also be a network outage? 🤔)`
            );
        }

        // Log status information for our source servers, to help the user
        // confirm setup and troubleshoot issues.
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

        // If there's no mirror server, we *do* want to abort. We do this now
        // instead of earlier, because we want to also print source server info
        // in this case - we figure more troubleshooting info is probably
        // better, especially when diagnosing e.g. whether it's an invite issue
        // or network issue.
        if (!mirrorServer) {
            console.error("⛔️  Aborting because mirror server is missing 😓");
            process.exit(1);
        }

        console.log("💞  hii I love you! 😍");

        // Okay, let's start listening for messages! In addition to the message
        // itself, we provide server information, our headmate identities, and
        // a callback for the "restart" command. See `handle-message.js`!
        client.on("message", () =>
            handleMessage(message, serverSet, identities, () =>
                restart(client)
            )
        );
    });

    client.login(clientToken);
}

// This loop exists entirely for the purpose of restarting! We run `main()`
// until it calls `restart()`, at which point we tear down the client, continue
// the loop, and call `main()` again. (This is mainly to enable us to quickly
// re-sync the server, e.g. to detect new channels or server invites, by
// issuing a "restart" command from the Discord client.)
async function mainForever() {
    while (true) {
        try {
            // Create and block on a promise, which only resolves once `main()`
            // calls the `restart()` callback. We don't expect this promise to
            // resolve any time soon, it'll probably block for a very very long
            // time!
            await new Promise(resolve => {
                const restart = client => {
                    client.destroy();
                    resolve();
                };
                main(restart);
            });
        } catch (e) {
            // Well, if we throw an error during setup, we should probably
            // actually crash instead of running again...
            console.error("⛔️  Error during setup:", e);
            process.exit();
        }
    }
}

mainForever();
