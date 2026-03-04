# WorldSeek
<img width="1173" height="644" alt="banner" src="https://github.com/user-attachments/assets/f4c88dff-2401-4de3-814b-6d718ce6c727" />


## Features

* Play a geography guessing game directly on Telegram.
* Identify countries from their silhouette maps.
* Get distance hints after each guess to help locate the correct country.
* Multiplayer gameplay in group chats.
* Score tracking with group and global leaderboards.
* Commands to view personal scores and leaderboard rankings.
* Admin tools for managing games in groups and forum topics.

## How to Play

1. Start a game using the `/newworld` command.
2. The bot will send the silhouette of a random country.
3. Guess the country by sending its name in chat.
4. After each guess, the bot shows the distance between your guess and the correct country.
5. Use the distance hints to narrow down the location.
6. The first person to guess correctly wins 10 points.

Example:

```
Guess: India
Distance: 1,250 km
```

The closer the distance, the closer you are to the correct country.

## Commands

* **/newworld** - Start a new WorldSeek game.
* **/endworld** - End the current game (admins only in group chats).
* **/help** - Show help and game instructions.
* **/leaderboard** - View leaderboard rankings.
* **/score** - View your score or another player's score.
* **/setgametopic** - Restrict games to a specific forum topic (admins).
* **/unsetgametopic** - Remove topic restriction.
* **/worldauth** - Manage authorized users who can end games.
* **/stats** - View bot usage stats (bot owner only).

## Installation & Setup

### Requirements

* Bun.js Runtime (or Node.js)
* Telegram Bot Token (create one via BotFather)
* PostgreSQL database
* Redis server

### Steps

1. Clone the repository:

```bash
git clone https://github.com/binamralamsal/WorldSeek
cd WorldSeek
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:
   Create a `.env` file in the root directory.

```
BOT_TOKEN=your-telegram-bot-token
DATABASE_URL=your-postgresql-database-url
NODE_ENV=development
REDIS_URI=redis://127.0.0.1:6379
```

4. Set up the database:

```bash
bun run db:migrate latest
```

5. Start the bot:

Development mode:

```bash
bun run dev
```

Production mode:

```bash
bun run start
```

## Environment Variables

| Variable     | Description                  | Example                                         |
| ------------ | ---------------------------- | ----------------------------------------------- |
| BOT_TOKEN    | Telegram bot token           | 123456:ABCDEF                                   |
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/worldseek |
| NODE_ENV     | Environment mode             | development                                     |
| REDIS_URI    | Redis connection string      | redis://127.0.0.1:6379                          |

## Technologies Used

* grammy
* Kysely
* PostgreSQL
* Redis
* Bun.js
* Sharp
* Zod

## Try the Bot

WorldSeek Bot: [https://t.me/WorldSeekBot](https://t.me/WorldSeekBot)

## Community

Discussion Group: [https://t.me/wordguesser](https://t.me/wordguesser)

Updates Channel: [https://t.me/BinamraBots](https://t.me/BinamraBots)

Developer: [https://t.me/binamralamsal](https://t.me/binamralamsal)

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a branch
3. Make your changes
4. Test your changes
5. Commit
6. Open a pull request

## License

MIT License
