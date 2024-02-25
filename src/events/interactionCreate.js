const {
  EmbedBuilder,
  InteractionType,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ActionRowBuilder,
} = require("discord.js");
const { readdirSync } = require("fs");
const db = require("orio.db");
module.exports = {
  name: "interactionCreate",
  execute: async (interaction) => {
    let client = interaction.client;
    if (interaction.type == InteractionType.ApplicationCommand) {
      if (interaction.user.bot) return;

      readdirSync("./src/commands").forEach((file) => {
        const command = require(`../../src/commands/${file}`);
        if (
          interaction.commandName.toLowerCase() ===
          command.data.name.toLowerCase()
        ) {
          command.run(client, interaction);
        }
      });
    }
    const closeButton = new ButtonBuilder({
      style: ButtonStyle.Danger,
      label: "Close Ticket",
      customId: "closeTicket",
      emoji: "🔒",
    });
    const transcriptButton = new ButtonBuilder({
      style: ButtonStyle.Secondary,
      label: "Transcript",
      customId: "transcript",
      emoji: "📜",
    });
    const deleteButton = new ButtonBuilder({
      style: ButtonStyle.Danger,
      label: "Delete Ticket",
      customId: "deleteTicket",
      emoji: "🗑️",
    });
    if (interaction.customId === "createTicket") {
      const guildDB = db.get(`ticket-setup_${interaction.guild.id}`);
      if (!guildDB) {
        interaction.reply({
          content: "> ❌ **Unsuccessful!** Ticket System not setup!",
          ephemeral: true,
        });
        interaction.message.delete();
      } else {
        const member = interaction.member;
        const ticketName = guildDB.ticketName;
        const ticketRole = guildDB.role;
        let ticketR;
        if (ticketName === "number") {
          ticketR = db.get(`ticket-number_${interaction.guild.id}`);
        }
        if (ticketName === "username") {
          ticketR = member.user.username;
        }
        if (db.get(`ticket-check-user_${interaction.user.id}`)) {
          interaction.reply({
            content: "> ❌ **Unsuccessful!** You already have a ticket!",
            ephemeral: true,
          });
          return;
        }
        const ticketChannel = await interaction.guild.channels
          .create({
            name: `ticket-${ticketR}`,
            type: ChannelType.GuildText,
            parent: guildDB.category,
            permissionOverwrites: [
              {
                id: interaction.guild.id,
                deny: PermissionsBitField.Flags.ViewChannel,
              },
              {
                id: member.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              },
              {
                id: guildDB.role,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              },
            ],
          })
          .then((x) => {
            if (guildDB.ticketName === "number") {
              db.add(`ticket-number_${interaction.guild.id}`, 1);
            }

            db.set(
              `ticket-check-user_${interaction.user.id}`,
              interaction.channel.id
            );

            db.set(`ticket-check-channel_${x.id}`, interaction.user.id);
            x.send({
              content: `<@&${ticketRole}>`,
              embeds: [
                new EmbedBuilder()
                  .setTitle("Ticket")
                  .setDescription(
                    `> Ticket created by ${member}! Staff will be with you shortly!\n\n${guildDB.message}`
                  )
                  .setColor(Colors.Blurple)
                  .setFooter({
                    text: "Ticket System",
                    iconURL: client.user.displayAvatarURL({ dynamic: true }),
                  }),
              ],
              components: [new ActionRowBuilder().addComponents([closeButton])],
            }).then((x) => x.pin());
            interaction.reply({
              content: `> ✅ **Successful!** Your ticket has been created ${x}!`,
              ephemeral: true,
            });
          });
      }
    } else if (interaction.customId === "closeTicket") {
      const user = db.get(`ticket-check-channel_${interaction.channel.id}`);
      await db.delete(`ticket-check-user_${user}`);
      interaction.deferReply();
      interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket")
            .setDescription(
              `> Ticket closed by ${interaction.user}! Staff control buttons are below.`
            )
            .setColor(Colors.Blurple)
            .setFooter({
              text: "Ticket System",
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            }),
        ],
        components: [
          new ActionRowBuilder().addComponents(deleteButton, transcriptButton),
        ],
      });
      interaction.channel.permissionOverwrites.edit(
        db.get(`ticket-check-channel_${interaction.channel.id}`),
        { ViewChannel: false, SendMessages: null }
      );
      interaction.deleteReply();
    } else if (interaction.customId === "deleteTicket") {
      await db.delete(`ticket-check-channel_${interaction.channel.id}`);

      interaction.deferReply();
      interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket")
            .setDescription(
              `> Ticket deleted by ${interaction.user}! This ticket will be deleted in 5 seconds.`
            )
            .setColor(Colors.Blurple)
            .setFooter({
              text: "Ticket System",
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            }),
        ],
      });

      interaction.deleteReply();
      setTimeout(() => {
        interaction.channel.delete();
      }, 5000);
    } else if (interaction.customId === "transcript") {
      interaction.deferReply();
      interaction.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ticket")
            .setDescription(`> Transcript requested by ${interaction.user}!`)
            .setColor(Colors.Blurple)
            .setFooter({
              text: "Ticket System",
              iconURL: client.user.displayAvatarURL({ dynamic: true }),
            }),
        ],
      });

      const userID = db.get(`ticket-check-channel_${interaction.channel.id}`);

      interaction.deleteReply();
      const discordTranscripts = require("discord-html-transcripts");
      const fs = require("fs");
      let dt = new Date();

      let tarih = `${dt.getFullYear().toString().padStart(4, "0")}-${(
        dt.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${dt.getDate().toString().padStart(2, "0")}-${dt
        .getHours()
        .toString()
        .padStart(2, "0")}_${dt.getMinutes().toString().padStart(2, "0")}`;

      const attachment2 = await discordTranscripts.createTranscript(
        interaction.channel,
        {
          favicon: interaction.guild.iconURL(),
          limit: -1, // Max amount of messages to fetch. `-1` recursively fetches.
          returnType: "string", // Valid options: 'buffer' | 'string' | 'attachment' Default: 'attachment' OR use the enum ExportReturnType
          filename: userID + "-" + tarih + "_transcript.ejs", // Only valid with returnType is 'attachment'. Name of attachment.
          saveImages: false, // Download all images and include the image data in the HTML (allows viewing the image even after it has been deleted) (! WILL INCREASE FILE SIZE !)
          poweredBy: false,
        }
      );

      const files2 = `./src/transcripts/ejs/${
        userID + "-" + tarih + "_transcript.ejs"
      }`;
      const content2 = "\u200B";

      fs.writeFileSync(files2, content2);

      const cs2 = fs.readFileSync(
        `./src/transcripts/ejs/${userID + "-" + tarih + "_transcript.ejs"}`,
        "utf-8"
      );
      fs.writeFileSync(
        `./src/transcripts/ejs/${userID + "-" + tarih + "_transcript.ejs"}`,
        attachment2 + cs2
      );

      const config = require("../config");
      const userEmbed = new EmbedBuilder()
        .setTitle("Transcript")
        .setDescription(
          `> [Your ticket transcript](${config.url}${userID}/${
            userID + "-" + tarih + "_transcript"
          })\n\nNote: After logging in, click the link again.`
        )
        .setColor(Colors.Blurple)
        .setFooter({
          text: "Ticket System",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });

      const user = client.users.cache.get(userID);
      user.send({ embeds: [userEmbed] });

      const guildEmbed = new EmbedBuilder()
        .setTitle("Transcript")
        .setDescription(
          `Ticket Closed: <t:${Math.floor(
            interaction.message.createdTimestamp / 1000
          )}:R>\n\n> [${user.username} Ticket transcript](${
            config.url
          }${userID}/${
            userID + "-" + tarih + "_transcript"
          })\n\nNote: After logging in, click the link again.`
        )
        .setColor(Colors.Blurple)
        .setFooter({
          text: "Ticket System",
          iconURL: client.user.displayAvatarURL({ dynamic: true }),
        });
      interaction.guild.channels.cache
        .get(db.get(`ticket-setup_${interaction.guild.id}`).transcriptChannel)
        .send({ embeds: [guildEmbed] });
    }
  },
};
