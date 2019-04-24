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

But I'm not sure I'm gonna document it in detail right now, since I'm not sure
there's actually interest 😅 Please let me know if you'd like help setting up!
Check out `config.js` for help with configuration 💖 And you can find me as
[@MatchuSaysHi][t] on Twitter, if you'd like to chat about setup or other
things 😊

## You are good and valid, plural friends!!

I see you and accept you, and I'm proud of the work you and your team are doing
💖 love and best wishes!! 🌻

[pk]: https://github.com/xSke/PluralKit
[t]: https://twitter.com/MatchuSaysHi
