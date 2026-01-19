# Pod Bot

A Discord bot that randomly distributes server members into pods based on assigned Pod Leads.

## Features

- Randomly distributes all real members (excluding bots) into pods
- Each pod is led by a member with the "Pod Lead" role
- Ensures equal or near-equal distribution of members across pods
- Easy to use with simple commands
- Requires Administrator permissions to prevent misuse

## Setup

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - Server Members Intent
   - Message Content Intent
5. Click "Reset Token" to get your bot token (save this for later)
6. Copy your Application ID from the "General Information" section

### 2. Invite the Bot to Your Server

Use this URL, replacing `YOUR_CLIENT_ID` with your Application ID:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot
```

### 3. Configure the Bot

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your bot token and client ID:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Bot

```bash
npm start
```

## Usage

### Setting Up Pods

1. Create a role in your Discord server named **"Pod Lead"**
2. Assign this role to members who will lead pods
3. Run the distribution command (see below)

### Commands

- **`!distribute`** or **`!distributepods`**
  - Randomly distributes all server members into pods
  - Each pod is assigned to a Pod Lead
  - Excludes bots from distribution
  - Pod Leads are not included in the member pool
  - Requires Administrator permissions

- **`!podhelp`**
  - Shows help information about available commands

## How It Works

1. The bot finds all members with the "Pod Lead" role (excluding bots)
2. It gathers all other real members (excluding bots and Pod Leads)
3. Members are randomly shuffled
4. Members are evenly distributed across the available Pod Leads
5. If the division isn't perfect, extra members are distributed one per pod starting from the first pod

## Example

If you have:
- 5 Pod Leads
- 47 members (excluding bots and Pod Leads)

The distribution would be:
- Pods 1-2: 10 members each
- Pods 3-5: 9 members each
- Total: 47 members distributed

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- A Discord Bot Token

## Permissions Required

The bot needs the following permissions:
- Read Messages/View Channels
- Send Messages
- Manage Roles (optional, for future features)

## Troubleshooting

**Bot not responding:**
- Make sure Message Content Intent is enabled in the Discord Developer Portal
- Check that the bot has permission to read and send messages in the channel

**"Pod Lead role not found" error:**
- Create a role named exactly "Pod Lead" (case-sensitive)

**"No Pod Leads found" error:**
- Assign the "Pod Lead" role to at least one member

## License

ISC
