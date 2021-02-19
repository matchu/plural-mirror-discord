# PluralMirror for Discord

Hi! PluralMirror is a Discord bot for plural folks, to help you post messages
as each of your selves, with custom names and avatars 😊

This tool is _deeply_ inspired by [PluralKit][pk], which is dramatically more
popular and probably a better starting point! It's easy to just invite the
public PluralKit bot to your server and get started quickly, we highly
recommend it 👍🏻

We built PluralMirror because, while PluralKit's UI is very easy to get started
on, its command system involves _replacing_ messages in your conversation,
which can feel a bit disruptive. I want it to be as easy and low-stress as
possible to talk with my headmates, just like talking with anyone else! 💖

**PluralMirror connects your Discord channels to a special "mirror server"**,
which serves as your personal command center. You'll see a realtime copy of
each of your servers' channels, and you can use special commands to reply as
your headmates - and they'll appear on the original server as normal messages
(from "bot" users), with custom names and avatars!

## Screenshots

Here's a screenshot of my "mirror server", my personal command center 😊 I want
to talk in the #demo-time channel of "Matchu Bots", so I open the #mb-demo-time
channel in my mirror server.

I've configured PluralMirror with two special identity prefixes, "e" and "n".
Here, I send a message as both, and the bot replies with "✅" to let me know it
worked 😊

![](https://i.imgur.com/Lru1Eer.png)

And, over in the "Matchu Bots" server, we see the two messages from my
headmates! The messages are decorated with their custom names "Ellie-chu" and
"Nora-chu", and their custom avatars, just as if they were real Discord users!
(Aside from the "bot" tag 😅)

![](https://i.imgur.com/LDjAAW7.png)

You'll also see a third message, which I sent to the #demo-time channel
normally. If you look back at the previous screenshot, you'll see this message
was copied into the mirror server's #mb-demo-time channel in real time. This
makes it feel easy and natural to have normal back-and-forth conversation with
your friends, without having to switch screens!

## Setup

Unlike PluralKit, this tool is currently built to support one user at a time.
To use it, you'll need to register your own "bot" record with Discord, and
deploy this code to a platform like Heroku. It was surprisingly not-so-bad to
deploy, I found!

### 1. Register a new Discord application

Go to the [Discord Developer Portal](https://discord.com/developers/applications/), and click "New Application". Enter whatever name you like! (Its name and avatar won't appear very often, because we'll mostly show the headmate names and avatars.) No other configuration should be necessary.

Open the "Bot" section of your application's page, click "Add bot", then find the secret "token". We'll use this later, when deploying the code!

### 2. Create your "mirror server" on Discord

This is where you'll send and receive messages, in a mirror version of the conversations on other servers! You don't need to set up very much yet, no channels or permissions needed yet—the bot code will set them up automatically.

Once you've created your mirror server, find its "Server ID", by [enabling Developer Mode and right-clicking the server name][discord-help-server-id]. We'll use this later, when deploying the code!

### 3. Find your "source server" on Discord

This is the server where most people are having conversations, that you'd like to mirror into. Note that, to use PluralMirror on a source server, you need permission to add bots, or help from someone who has permission.

We'll invite the bot to this server later! But for now, just find the server's "Server ID", [enabling Developer Mode and right-clicking the server name][discord-help-server-id]. We'll use this later, when deploying the code!

You can also configure PluralMirror to use more than one source server. We'll add a short prefix to each channel name, so you know which server they're coming from.

### 4. Deploy this bot to Heroku

We'll run this code on Heroku. They offer a free usage tier, and this bot should run just fine within those limits!

To start, click the button below, and it should bring you to a setup page for PluralMirror. (If you needed to log in first, you might have to click the button again.)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Next, fill in the config fields. To start, the page will offer you the ability to set up two identities (i.e. probably headmates!) with prefix codes `p1` and `p2`. You can fill these in as a starting point for testing, or leave them blank—you'll be able to edit, add more, and change the prefix codes later.

Then, click "Deploy app", and Heroku should get your bot up and running!! 😁 Once it's done, click "Manage app" to see your app's new dashboard page.

**NOTE: You should disable the web dyno!** There's not a way for us to configure this process to _not_ include a web "dyno" for your bot during deployment. The website will just show an error page, and the web process will go to sleep for most of the time… but disabling it is the best way to ensure that it doesn't consume your free tier resources or do anything surprising. You can do this from your app dashboard, by clicking "Resources", then clicking the pencil in the "Web" row, then disabling the toggle slider.

### 5. Invite your bot to your servers

On your Heroku app dashboard, click "More", then "View logs". You should see an error message near the bottom of the logs, because the bot isn't invited to your servers yet. But you should also see two invite links near the top of the logs, labeled "💌  Invite to mirror server", and "💌  Invite to source server". (If you don't see these messages, they might have expired from the logs. Try restarting the worker dyno, by using the "Resources" page to disable it, save, then re-enable it, and save again.)

Open the "💌  Invite to mirror server" link, then choose your mirror server from the dropdown. Review the requested permissions, and finish adding the bot.

Then, open the "💌  Invite to source server" link, then choose your source server from the dropdown. Review the requested permissions, and finish adding the bot. (If you don't have permission to add bots to your source server, send the link to a server admin, and ask them to help. If you have multiple source servers, repeat this step for each of them.)

Once you've done this, restart the worker dyno, by using the "Resources" page to disable it, save, then re-enable it, and save again. Now, in the logs, you should see messages that say "🌻  Listening to mirror server", and "🎧  Listening to source server", with the correct server names next to each. Hooray!

### 6. Test it out!

You should now see new channels in your mirror server: a mirror channel for each channel of the source server, with the prefix `s1-`. Nice! Each mirror channel has a "🔙" link to the source channel in its channel topic.

Try sending a message in your source server. You should see it copied over to the mirror server!

But if you just type a plain message into the mirror server, you should get back a response from the bot: "⚠ Didn't understand that message 😓". In a mirror channel, you need to use your identity prefixes!

If you filled in the optional identity fields during deployment, you should be able to test them now, by typing a message like "p1 Hello!". The bot should react "✅" to your message, and you should see a corresponding message appear in the source server, with the name and avatar you assigned to `p1`. Neat! You can try testing `p2`, too.

### 7. Finish setting up your headmate identities

To add more identities, or change their prefix codes, or add more source servers, or change _their_ prefix codes… you'll edit the config variables! It's a lot like the form we used to deploy the app the first time, but a bit more of a "power user" interface.

In your Heroku app dashboard, go to Settings, then look in the "Config Vars" section. You should see all of the settings you specified during deployment, like `DISCORD_CLIENT_TOKEN`, `MIRROR_SERVER_ID`, and some variables that start with `SOURCE_SERVERS__` and `IDENTITIES__`.

To change an identity's prefix code, rename the config variables to use something else in place of `p1`. (To do this, you'll need to create a new variable with a new name, copy-paste the value from the old variable, and delete the old variable.) It doesn't need to start with `p`, it can be whatever you want to type! For example, I might set `IDENTITIES__e__NAME` to `Ellie`, so that typing `e Hello` sends "Hello" as "Ellie".

To add more identities, create new config variables following the same naming pattern, but with a different prefix code.

To change a source server's prefix code, first, **manually rename the channels on the mirror server to use the new prefix code**. Then, rename the config variable to use something else in place of `s1`. (To do this, you'll need to create a new variable with a new name, copy-paste the value from the old variable, and delete the old variable.) It doesn't need to start with `s`, it can be whatever you want to type! For example, I might rename `SOURCE_SERVERS__s1__SERVER_ID` to `SOURCE_SERVERS__streaming__SERVER_ID`, to create channels like `#streaming-general` instead of `#s1-general`.

To add more source servers, create new config variables following the same naming pattern, but with a different prefix code.

After you make any changes in Config Vars, Heroku should automatically restart your worker. But you can always manually restart it in the Resources tab if you're not seeing the changes, and check the logs for error messages!

## You are good and valid, plural friends!!

I see you and accept you, and I'm proud of the work you and your team are doing
💖 love and best wishes!! 🌻

[pk]: https://github.com/xSke/PluralKit
[t]: https://twitter.com/MatchuSaysHi
[discord-help-server-id]: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-
