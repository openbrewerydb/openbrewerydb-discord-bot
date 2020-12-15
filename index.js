require("dotenv").config();
const axios = require("axios");
const GphApiClient = require("giphy-js-sdk-core");
const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const { prefix } = require("./config.json");

const REPLY_MESSAGES = ["hi there! 🍻", "how's it going? 🍻", "cheers! 🍻"];

// GIPHY API Client
const gf = GphApiClient(process.env.GIPHY_TOKEN);

// Discord Login
client.login(process.env.DISCORD_TOKEN);

client.on("ready", readyDiscord);
client.on("message", receivedMessage);
client.on("guildMemberAdd", greetNewMember);

function readyDiscord() {
  console.log("🍻");
}

async function receivedMessage(message) {
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
          `Which brewery would you like info on? Try something like, '!info modern times'`
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
    } else if (command === "gif") {
      if (!args.length) {
        console.log(`🔍 Searching GIPHY for random GIF`);
        gf.random("gifs", { tag: "beer" })
          .then((response) => {
            // console.log(response);
            return message.channel.send(response.data.url);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        let query = args.join(" ");
        console.log(`🔍 Searching GIPHY for '${query}'...`);
        gf.search("gifs", { q: query, limit: 1 })
          .then((response) => {
            response.data.forEach((gif) => {
              // console.log(gif);
              return message.channel.send(gif.url);
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }
}

function greetNewMember(member) {
  console.log(`Welcoming ${member.displayName}! 🍻`);

  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "introduce-yourself"
  );
  // Do nothing if the channel wasn't found on this server
  if (!channel) {
    console.log(`Can't find channel #introduce-yourself`);
    return;
  }

  // Send the message, mentioning the member
  channel.send(`Hello and welcome to the server, ${member}! 🍻`);
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
