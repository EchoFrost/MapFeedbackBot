const Discord = require("discord.js");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json"));
const client = new Discord.Client();

// Check our config data before proceeding.
if (!config.loginToken) {
  console.error(`${new Date().toUTCString()}: Invalid login token. Please check your config.`);
  process.exit(9);
}

if (!config.publicChannel) {
  console.error(`${new Date().toUTCString()}: Invalid public channel id. Please check your config.`);
  process.exit(9);
}

if (!config.privateChannel) {
  console.error(`${new Date().toUTCString()}: Invalid private channel id. Please check your config.`);
  process.exit(9);
}

// Logs the client in, establishing a websocket connection to Discord.
client.login(config.loginToken);

// Emitted when the client becomes ready to start working.
client.on("ready", () => {
  console.log(`${new Date().toUTCString()}: Logged in as ${client.user.tag}. Ready to begin processing feedback.`);
});

// Emitted whenever the client tries to reconnect to the WebSocket.
client.on("reconnecting", () => {
  console.log(`${new Date().toUTCString()}: Client attempting to reconnect to the WebSocket.`);
});

// Emitted whenever a WebSocket resumes.
client.on("resume", (replayed) => {
  console.log(`${new Date().toUTCString()}: WebSocket resumed, ${replayed} replays.`);
});

// Emitted for general debugging information.
client.on("debug", (info) => {
  console.log(`${new Date().toUTCString()}: Info: ${info}`);
});

// Emitted for general warnings.
client.on("warn", (info) => {
  console.log(`${new Date().toUTCString()}: Warn: ${info}`);
});

// Emitted when the client encounters an error.
client.on("error", (error) => {
  console.error(`${new Date().toUTCString()}: Client's WebSocket encountered a connection error. ${error}`);
});

// Emitted when the client hits a rate limit while making a request.
client.on("rateLimit", (rateLimitInfo) => {
  console.log(`${new Date().toUTCString()}: Client is rate limited. Timeout: ${rateLimitInfo.timeout}`);
});

// Emitted whenever a message is created.
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
        .setAuthor(msg.author.tag, msg.author.avatarURL())
        .setDescription("If the map approval team sees this- I VON ZULUL")
        .setThumbnail(msg.author.avatarURL())
        .addField("Message", msg.content)
        .setTimestamp(msg.createdTimestamp);

      // Send the embed to the private feedback channel.
      privateFeedbackChannel
        .send(feedbackEmbed)
        .then(() => {
          console.log(`${new Date().toUTCString()}: Message copied to the private feedback channel.`);

          // Let the message author know that we have successfully relayed their feedback to the private channel.
          msg.author
            .send("Thanks for your feedback! Your message has been relayed to the map approval team.")
            .then(() => {
              console.log(`${new Date().toUTCString()}: Confirmation message sent to ${msg.author.tag} (${msg.author.id}).`);
            })
            .catch((error) => {
              console.error(`${new Date().toUTCString()}: Failed to send confirmation message to ${msg.author.tag}. ${error}`);
              return;
            });

          // Delete the original message in the public feedback channel. We only do this if we copied successfully.
          msg
            .delete()
            .then((response) => {
              console.log(`${new Date().toUTCString()}: Message from ${response.author.tag} (${response.author.id}) deleted fron the public feedback channel.`);
            })
            .catch((error) => {
              console.error(`${new Date().toUTCString()}: Failed to delete message from the public feedback channel. ${error}`);
              return;
            });
        })
        .catch((error) => {
          console.error(`${new Date().toUTCString()}: Failed to copy message to private feedback channel. ${error}`);
          return;
        });
    } else {
      console.error(`${new Date().toUTCString()}: Failed to get the private channel. No further action will be taken.`);
    }
  }
});
