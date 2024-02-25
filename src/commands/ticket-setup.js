const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ActionRowBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("Setup the ticket system for your server!")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to create the tickets in!")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addStringOption((option) =>
      option
        .setName("message-channel")
        .setDescription("Message appearing in the ticket creation channel!")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("The category to create the tickets in!")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send when a ticket is created!")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to ping when a ticket is created!")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("The emoji to react with to create a ticket!")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("ticket-name")
        .setDescription("The name of the ticket channel!")
        .setRequired(true)
        .addChoices(
          {
            name: "Number",
            value: "number",
          },
          {
            name: "Username",
            value: "username",
          }
        )
    )
    .addChannelOption((option) =>
      option
        .setName("transcript-channel")
        .setDescription("Transcript channel!")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const category = interaction.options.getChannel("category");
    const message = interaction.options.getString("message");
    const role = interaction.options.getRole("role");
    const emoji = interaction.options.getString("emoji");
    const ticketName = interaction.options.getString("ticket-name");

    const db = require("orio.db");

    if (db.get(`ticket-setup_${interaction.guild.id}`)) {
      return interaction.reply({
        content: "> ❌ **Unsuccessful!** Ticket System already setup!",
        ephemeral: true,
      });
    } else {
      db.set(`ticket-setup_${interaction.guild.id}`, {
        channel: interaction.options.getChannel("channel").id,
        messageChannel: interaction.options.getString("message-channel"),
        category: category.id,
        message: message,
        role: role.id,
        emoji: emoji,
        ticketName: ticketName,
        transcriptChannel: interaction.options.getChannel("transcript-channel"),
      });

      if (ticketName === "number") {
        db.set(`ticket-number_${interaction.guild.id}`, 0);
      }

      interaction.options.getChannel("channel").send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket System")
            .setDescription(
              `> Click the button to create a ticket!\n\n${interaction.options.getString(
                "message-channel"
              )}`
            )
            .setColor(Colors.Blurple)
            .setFooter({
              text: "Ticket System",
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            }),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("createTicket")
              .setLabel("Create Ticket")
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emoji)
          ),
        ],
      });
      interaction.reply({
        content: "> ✅ **Successful!** Ticket System setup!",
        ephemeral: true,
      });
    }
  },
};
