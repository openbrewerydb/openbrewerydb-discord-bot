import * as dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { Client, MessageEmbed, Message, GuildMember } from "discord.js";
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { Brewery, config } from "./config";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prefix = config.prefix;
const client = new Client();
const REPLY_MESSAGES = ["hi there! 🍻", "how's it going? 🍻", "cheers! 🍻"];

// Discord Login
client.login(process.env.DISCORD_TOKEN);

client.on("ready", readyDiscord);
client.on("message", receivedMessage);
client.on("guildMemberAdd", greetNewMember);

function readyDiscord() {
  console.log("🍻");
}

async function receivedMessage(message: Message) {
  // Ignore messages from bots & broadcast messages
  if (
    message.author.bot ||
    message.content.includes("@here") ||
    message.content.includes("@everyone")
  )
    return false;

  // Respond to mentions
  if (client?.user?.id && message.mentions.has(client.user.id)) {
    const msgContent = message.content.replace(`<@${client.user.id}> `, "");
    if (msgContent.includes("introduce")) {
      console.log("Send: 👋 Intro ");
      message.channel.send(
        "Beep boop! Hello! 👋 I am the Open Brewery DB chatbot! 🤖 I am kind of dumb right now, but I'm machine learning. 😅 If you'd like to help build me, hit up @chrisjm! 🍻"
      );
    } else {
      console.log(msgContent);
      // Respond to commands
      if (msgContent.startsWith(prefix)) {
        const args = msgContent.slice(prefix.length).trim().split(" ");
        const command = args.shift()?.toLowerCase();

        // gpt - Add OpenAI GPT3 model API interaction
        if (command === "gpt") {
          if (!args.length) {
            // Ensure there's a search argument
            return message.channel.send(
              `What would you like to search for? Try something like, '!gpt "what is the weather like today?"'`
            );
          }

          const systemRole = {
            role: ChatCompletionRequestMessageRoleEnum.System,
            content:
              "You are a friendly Southern California surfer chatbot named OBDBro with a valley boy accent and a love for craft beer. You enjoy helping people and are overly polite. And you always have a valley accent and use Gen Z slang and 'brah' excessively.",
          };
          try {
            console.log(`⚡️: Searching OpenAI API for '${args.join(" ")}'...`);
            const result = await getCompletionFromMessages(
              [
                systemRole,
                {
                  role: ChatCompletionRequestMessageRoleEnum.User,
                  content: args.join(" "),
                },
              ],
              0.7
            );
            message.reply(result ?? "No result returned.");
          } catch (error) {
            console.log(error);
            message.reply(error ?? "Unknown error returned.");
          }
        }

        // info - Brewery Search with Open Brewery DB
        if (command === "info") {
          if (!args.length) {
            // Ensure there's a search argument
            return message.reply(
              `Which brewery would you like info on? Try something like, '!info modern times'`
            );
          }

          const brewery_name = args.join(" ");
          const brewery_query = encodeURIComponent(brewery_name);

          console.log(`🔍 Searching the OBDB API for '${brewery_query}'...`);

          try {
            const result = await axios.get(
              `https://api.openbrewerydb.org/breweries?by_name=${brewery_query}`
            );
            const breweries = result.data;
            console.log(`⮑ Found '${breweries.length}' breweries.`);

            if (breweries.length == 0) {
              message.channel.send(
                `I didn't find any breweries matching '${brewery_name}'. 😓`
              );
            } else if (breweries.length == 1) {
              const brewery = breweries[0];
              message.reply(
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

                message.reply(breweryEmbed);
              }
            } else {
              let suffixMessage = "";
              if (breweries.length > 5) {
                suffixMessage = "Here are the first 5:";
              } else {
                suffixMessage = "Here they are:";
              }
              message.reply(
                `I found ${breweries.length} breweries matching '${brewery_name}'. ${suffixMessage}`
              );
              embedBreweryFields(message, breweries.slice(0, 5));
            }
          } catch (error) {
            // Fail silently and log
            console.log(error);
          }
        }
      } else {
        const replyMessage =
          REPLY_MESSAGES[Math.floor(Math.random() * REPLY_MESSAGES.length)];
        console.log(`Send: 📤 Reply: ${replyMessage}`);
        message.reply(replyMessage);
      }
    }
  }
}

async function getCompletionFromMessages(
  messages: {
    role: ChatCompletionRequestMessageRoleEnum;
    content: string;
  }[],
  temperature = 0,
  model = "gpt-3.5-turbo"
) {
  const response = await openai.createChatCompletion({
    model,
    messages,
    temperature,
  });

  return response.data.choices[0].message?.content;
}

function greetNewMember(member: GuildMember) {
  console.log(`Welcoming ${member.displayName}! 🍻`);

  // Send the message to a designated channel on a server:
  const guild = member.guild;
  const channel = guild.channels.cache.find(
    (ch) => ch.name.toLowerCase() === "introduce-yourself"
  );

  // Do nothing if the channel wasn't found on this server
  if (!channel) {
    console.log(`Can't find channel #introduce-yourself`);
    return;
  }

  // Send the message, mentioning the member
  // @ts-ignore This is of type TextChannel but cache only returns GuildChannel
  channel.send(
    `Hello and welcome to the server, ${member}! 🍻 How did you hear about OBDB?`
  );
}

function embedBreweryFields(message: Message, breweries: Brewery[]) {
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

  message.reply(breweryEmbed);
}
