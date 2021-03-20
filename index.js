const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("./config.json"));

const client = new Discord.Client();

client.login(config.loginToken);

client.on("ready", () => {
  console.log(`${new Date().toUTCString()}: Logged in as ${client.user.tag}. Ready to begin processing feedback.`);
});

client.on("message", (msg) => {
  // Check if the message was sent in the public feedback channel.
  if (msg.channel.id === config.publicChannel) {
    console.log(`${msg.createdAt.toUTCString()}: Message from ${msg.author.tag} (${msg.author.id}) identified in the public feedback channel.`);

    // Try to get the private feedback channel from our config id.
    const privateFeedbackChannel = client.channels.cache.get(config.privateChannel);

    // If we found the private feedback channel, relay the feedback.
    if (privateFeedbackChannel) {
      // Create an embed for all of the details we want to relay to the private feedback channel.
      const feedbackEmbed = new Discord.MessageEmbed()
        .setColor("#BA55D3")
        .setTitle("Map Feedback")
        .setAuthor(msg.author.tag)
        .setDescription("If the map approval team sees this- I VON ZULUL")
        .addField("Message", msg.content)
        .setTimestamp(msg.createdTimestamp);

      // Send the embed to the private feedback channel.
      privateFeedbackChannel
        .send(feedbackEmbed)
        .then(() => {
          console.log(`${new Date().toUTCString()}: Message copied to the private feedback channel.`);
        })
        .catch((error) => {
          console.log(`${new Date().toUTCString()}: Failed to copy message to private feedback channel. ${error}`);
          return;
        });

      // Delete the original message in the public feedback channel.
      msg
        .delete()
        .then((response) => {
          console.log(`${new Date().toUTCString()}: Message from ${response.author.tag} (${response.author.id}) deleted fron the public feedback channel.`);
        })
        .catch((error) => {
          console.log(`${new Date().toUTCString()}: Failed to delete message from the public feedback channel. ${error}`);
          return;
        });
    }
  }
});
