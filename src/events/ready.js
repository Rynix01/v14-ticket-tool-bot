const { ActivityType } = require("discord.js");
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    let activities = [
        `Developed by rynixelchavo`,
        `${client.user.username} Ticket`,
      ],
      i = 0;
    setInterval(
      () =>
        client.user.setActivity({
          name: `${activities[i++ % activities.length]}`,
          type: ActivityType.Custom,
        }),
      22000
    );
  },
};
