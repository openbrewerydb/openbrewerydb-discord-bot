require("dotenv").config();
const axios = require("axios");
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const { prefix } = require("./config.json");

const REPLY_MESSAGES = ["hi there! 🍻", "how's it going? 🍻", "cheers! 🍻"];

client.login(process.env.DISCORD_TOKEN);

client.on("ready", readyDiscord);
client.on("message", receivedMessage);

function readyDiscord() {
  console.log("🍻");
}

function receivedMessage(message) {
  // Ignore messages from bots & broadcast messages
  if (
    message.author.bot ||
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

  // Respond to commands
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift().toLowerCase();

    // info - Brewery Search with Open Brewery DB
    if (command === "info") {
      if (!args.length) {
        // Ensure there's a search argument
        return message.channel.send(
          `Sorry, I need to search for something. Try something like, '!info modern times'`
        );
      } else {
        brewery_name = args.join(" ");
        brewery_query = encodeURIComponent(brewery_name);

        console.log(`🔍 Searching OBDB for '${brewery_query}'...`);

        // Promise request to OBDB
        return axios
          .get(
            `https://api.openbrewerydb.org/breweries?by_name=${brewery_query}`
          )
          .then((res) => {
            breweries = res.data;
            console.log(`⮑ Found '${breweries.length}' breweries.`);

            if (breweries.length == 0) {
              // No breweries returned
              message.channel.send(
                `I didn't find any breweries matching '${brewery_name}'. 😓`
              );
            } else if (breweries.length == 1) {
              // Only 1 brewery returned
              brewery = breweries[0];
              message.channel.send(
                `I found ${brewery.name} in ${brewery.city}, ${brewery.state}!`
              );

              if (brewery.website_url) {
                const breweryEmbed = new MessageEmbed()
                  .setColor("#FBBF24")
                  .setTitle(brewery.name)
                  .setURL(brewery.website_url)
                  .setDescription(
                    `${brewery.name} - ${brewery.street}, ${brewery.city}, ${brewery.state} ${brewery.postal_code}`
                  );

                message.channel.send(breweryEmbed);
              }
            } else {
              // More than 1 brewery returned
              if (breweries.length > 5) {
                $suffixMessage = "Here are the first 5:";
              } else {
                $suffixMessage = "Here they are:";
              }
              message.channel.send(
                `I found ${breweries.length} breweries matching '${brewery_name}'. ${$suffixMessage}`
              );
              embedBreweryFields(message, breweries.slice(0, 5));
            }
          })
          .catch((err) => {
            // Fail silently and log
            console.log(err);
          });
      }
    }
  }
}

function embedBreweryFields(message, breweries) {
  let fields = [];

  for (let i = 0; i < breweries.length; i++) {
    const b = breweries[i];
    const field = {
      name: b.name,
      value: `${b.city}, ${b.state}`,
    };
    fields.push(field);
  }

  const breweryEmbed = new MessageEmbed().setColor("#FBBF24").addFields(fields);

  message.channel.send(breweryEmbed);
}
