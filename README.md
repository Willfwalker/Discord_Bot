# Pod Bot

A Discord bot that randomly distributes members from a voice channel into pods based on assigned Pod Leads.

## Features

- Randomly distributes members currently in a voice channel into pods
- Each pod is led by a member with the "Pod Lead" role who is in the voice channel
- Automatically creates temporary voice channels for each pod
- Moves Pod Leads and members into their respective pod channels
- Auto-deletes pod channels when they become empty (automatic cleanup)
- Ensures equal or near-equal distribution of members across pods
- Perfect for organizing breakout rooms, team activities, or study groups
- Easy to use with simple commands
- Requires Administrator permissions to prevent misuse

## Setup

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - **Server Members Intent** (required)
   - **Message Content Intent** (required)
   - **Note:** Voice States Intent is standard and doesn't need special permission
5. Click "Reset Token" to get your bot token (save this for later)
6. Copy your Application ID from the "General Information" section

### 2. Invite the Bot to Your Server

Use this URL to invite the bot:

```
https://discord.com/api/oauth2/authorize?client_id=1462852551958593673&permissions=16796688&scope=bot
```

**Required Permissions:**
- Manage Channels (create/delete pod channels)
- Move Members (move people into pod channels)
- Send Messages & Embed Links (send results)

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
3. Have Pod Leads join a voice channel
4. Have other members join the same voice channel
5. Run the distribution command with the channel name

### Commands

- **`!distribute <ChannelName>`**
  - Randomly distributes members currently in the specified voice channel into pods
  - Creates temporary voice channels for each pod
  - Moves Pod Leads and members into their pod channels
  - Example: `!distribute Lounge`
  - Only affects members in the specified voice channel
  - Pod Leads must be in the voice channel
  - Excludes bots from distribution
  - Pod channels auto-delete when empty
  - Requires Administrator permissions

- **`!podhelp`**
  - Shows help information about available commands

## How It Works

1. Admin specifies a voice channel name in the command
2. The bot checks who is currently in that voice channel
3. It identifies Pod Leads (members with "Pod Lead" role) in the voice channel
4. It gathers other real members in the channel (excluding bots and Pod Leads)
5. Members are randomly shuffled
6. Members are evenly distributed across the available Pod Leads
7. If the division isn't perfect, extra members are distributed one per pod starting from the first pod
8. Bot creates a new voice channel for each pod (named "🎯 Pod 1", "🎯 Pod 2", etc.)
9. Bot moves each Pod Lead and their assigned members into their pod channel
10. When a pod channel becomes empty, it's automatically deleted

## Example

If you have in voice channel "Main Lounge":
- 5 Pod Leads (with "Pod Lead" role)
- 47 regular members (excluding bots and Pod Leads)

Running `!distribute Main Lounge`:
1. Creates 5 new voice channels: "🎯 Pod 1" through "🎯 Pod 5"
2. Distributes members:
   - Pods 1-2: 10 members each
   - Pods 3-5: 9 members each
3. Moves everyone into their assigned pod channels
4. Original "Main Lounge" channel is left empty

**Note:** Pod channels automatically delete when everyone leaves.

## Requirements

- Node.js 16.9.0 or higher
- Discord.js v14
- A Discord Bot Token

## Permissions Required

The bot needs the following permissions:
- **Manage Channels** (create and delete pod voice channels)
- **Move Members** (move members into pod channels)
- **Read Messages/View Channels**
- **Send Messages**
- **Embed Links** (for formatted output)

## Troubleshooting

**Bot not responding:**
- Make sure Message Content Intent is enabled in the Discord Developer Portal
- Check that the bot has permission to read and send messages in the channel

**"Voice channel not found" error:**
- Check the spelling of the channel name (case-insensitive)
- Make sure it's a voice channel, not a text channel
- If the channel name has spaces, include them in the command: `!distribute My Channel`

**"Pod Lead role not found" error:**
- Create a role named exactly "Pod Lead" (case-sensitive)

**"No Pod Leads found in the voice channel" error:**
- Make sure at least one person with the "Pod Lead" role is in the specified voice channel
- Pod Leads must be actively in the voice channel when you run the command

**"No members to distribute" error:**
- Make sure there are regular members (non-Pod Leads) in the voice channel
- Only members currently in the voice channel will be distributed

## License

ISC
