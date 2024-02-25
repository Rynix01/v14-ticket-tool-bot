const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const db = require("orio.db");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("add")
    .setDescription("You add a member to the ticket channel!")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to add to the ticket")
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const guildDB = db.get(`ticket-setup_${interaction.guild.id}`);
    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);
    if (!interaction.member.roles.cache.has(guildDB.role)) {
      interaction.reply({
        content:
          "> ❌ **Unsuccessful!** You are not allowed to use this command!",
        ephemeral: true,
      });
      return;
    }
    if (!member) {
      interaction.reply({
        content: "> ❌ **Unsuccessful!** The user is not in the server!",
        ephemeral: true,
      });
      return;
    }
    if (!interaction.channel.name.startsWith("ticket-")) {
      interaction.reply({
        content:
          "> ❌ **Unsuccessful!** You can only use this command in a ticket channel!",
        ephemeral: true,
      });
      return;
    }
    interaction.channel.permissionOverwrites.edit(member, {
      ViewChannel: true,
      SendMessages: true,
    });
    interaction.reply({
      content: `> ✅ **Successful!** ${member} has been added to the ticket!`,
      ephemeral: true,
    });
  },
};
