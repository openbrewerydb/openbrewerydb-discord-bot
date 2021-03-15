# openbrewerydb-discord-bot

Discord bot for openbrewerydb server built with Discord.js

## Getting Started

### 1. Setup

These are initial steps to get things running.

1. `npm install`
2. `echo "DISCORD_TOKEN=" >> .env`

### 2. Create a Discord Bot

Use your Discord login to access the Developers Portal (or sign up).

1. Go to the Discord Developers Portal and [create a **New Application**](https://discord.com/developers/applications).
2. Once created, click on **Settings > Bot** click on **Add Bot**.
3. Turn off **Public Bot**.
4. Under **Build-A-Bot**, copy the **Token** and paste in your `.env` file (see Getting Started)

### 3. Add Bot to OBDB Discord

In order for the bot to appear in the OBDB Discord Server, an Admin (chrisjm) will need to authorize and add it.

1. Go to **General Information** and copy **Client ID**.
2. Private message your Client ID (Application ID) to chrisjm on the OBDB Discord.

### 4. Run Bot

`npm start`
