# Ticket Bot README

## Introduction

This README provides an overview of the ticket bot setup and usage instructions. The ticket bot is designed to streamline ticket management within Discord servers. Users can set up the bot, add and remove members to ticket channels, and utilize a web-based transcript system.

## Installation and Setup

1. Clone or download the ticket bot repository to your local machine.
2. Navigate to the project directory.
3. Install dependencies by running `npm install`.
4. Fill out the `config.js` file with the required information:
   - `prefix`: The prefix used to invoke bot commands (default: "/").
   - `owner`: Discord ID of the bot owner.
   - `token`: Your Discord bot token.
   - `guildID`: ID of the Discord server where the bot will operate.
   - `url`: URL of the website where transcripts will be stored.
5. Save the `config.js` file.

## Start

- Start the bot by typing `npm start`

## Usage

### Setting Up the Bot

- Run the command `/ticket-setup` to initialize the bot within your Discord server.

### Adding Members to Ticket Channels

- Use the `/add` command followed by the user's mention to add them to the ticket channel.

### Removing Members from Ticket Channels

- Apply the `/remove` command followed by the user's mention to remove them from the ticket channel.

### Transcript System

- The bot is equipped with a web-based transcript system.
- Transcripts can be accessed via the provided URL in the `config.js` file.
- Don't forget to add http://localhost:80/callback (your website url) to the redirects section on the oauth page of the bot panel.

## Contributing

Contributions to the ticket bot project are welcome. If you encounter any issues or have suggestions for improvements, feel free to submit a pull request or open an issue on the GitHub repository.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

Special thanks to all contributors and developers who have contributed to the development of this ticket bot.

For more information, refer to the project's GitHub repository.
