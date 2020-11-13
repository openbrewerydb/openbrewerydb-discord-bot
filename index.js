require("dotenv").config();
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();

const REPLY_MESSAGES = ["hi there! 🍻", "how's it going? 🍻", "cheers! 🍻"];

client.login(process.env.DISCORD_TOKEN);

client.on("ready", readyDiscord);
client.on("message", receivedMessage);

function readyDiscord() {
  console.log("🍻");
}

function receivedMessage(message) {
  // Prevents spamming
  // Ignore messages from bots
  if (message.author.bot) return false;
  // Ignore broadcast messages
  if (
    message.content.includes("@here") ||
    message.content.includes("@everyone")
  )
    return false;

  // Respond to mentions
  if (message.mentions.has(client.user.id)) {
    if (message.content.includes("introduce")) {
      console.log("Send: 👋 Intro ");
      message.channel.send(
        "Beep boop! Hello! 👋 I am the Open Brewery DB chatbot! 🤖 I am kind of dumb right now, but I'm machine learning. 😅 If you'd like to help build me, hit up @chrisjm! 🍻"
      );
    } else {
      const replyMessage =
        REPLY_MESSAGES[Math.floor(Math.random() * REPLY_MESSAGES.length)];
      console.log(`Send: 📤 Reply: ${replyMessage}`);
      message.reply(replyMessage);
    }
  }
}
