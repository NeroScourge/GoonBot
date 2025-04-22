const express = require("express");
const { Client, GatewayIntentBits, Routes, REST, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("GoonBot is alive!");
});
app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const exclamations = [
  "Boom",
  "Oh snap",
  "AYO",
  "Woohoo",
  "Kaboom",
  "Let's go nigga",
  "Sheesh",
  "Damn",
  "Welp",
  "Heck yeah",
];

const names = ["Olivia", "James", "Rico", "Kaylee", "Justin", "Chris"];
const channelName = "general-chat";
const postInterval = 6 * 60 * 60 * 1000; // 6 hours

client.once("ready", async () => {
  console.log(`GoonBot is online as ${client.user.tag}`);

  // Register slash command
  const commands = [
    new SlashCommandBuilder()
      .setName("goon")
      .setDescription("Summon the goon message manually"),
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("Slash command registered!");
  } catch (err) {
    console.error("Failed to register slash command:", err);
  }

  // Scheduled message logic
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channel = guild.channels.cache.find(
    (ch) => ch.name === channelName && ch.isTextBased()
  );

  if (!channel) {
    console.error(`Channel "${channelName}" not found`);
    return;
  }

  setInterval(() => {
    const exclamation =
      exclamations[Math.floor(Math.random() * exclamations.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const message = `${exclamation}, it's goon time, ${name}!`;
    channel.send(message).catch(console.error);
  }, postInterval);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "goon") {
    const exclamation =
      exclamations[Math.floor(Math.random() * exclamations.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const message = `${exclamation}, it's goon time, ${name}!`;
    await interaction.reply(message);
  }
});

client.login(process.env.TOKEN);
