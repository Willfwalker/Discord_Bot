require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Distribute members into pods
async function distributePods(guild, voiceChannel) {
  try {
    // Fetch all members
    await guild.members.fetch();

    // Get members in the voice channel
    const voiceMembers = voiceChannel.members;

    if (voiceMembers.size === 0) {
      return {
        success: false,
        message: `No one is currently in the voice channel "${voiceChannel.name}".`
      };
    }

    // Find Pod Lead role
    const podLeadRole = guild.roles.cache.find(role => role.name === 'Pod Lead');
    if (!podLeadRole) {
      return {
        success: false,
        message: 'Pod Lead role not found. Please create a role named "Pod Lead" first.'
      };
    }

    // Get all Pod Leads who are in the voice channel
    const podLeads = voiceMembers.filter(member =>
      member.roles.cache.has(podLeadRole.id) && !member.user.bot
    );

    if (podLeads.size === 0) {
      return {
        success: false,
        message: `No Pod Leads found in the voice channel "${voiceChannel.name}". Pod Leads must be in the channel.`
      };
    }

    // Get all real people in voice channel (exclude bots and Pod Leads)
    const realPeople = voiceMembers.filter(member =>
      !member.user.bot && !member.roles.cache.has(podLeadRole.id)
    );

    if (realPeople.size === 0) {
      return {
        success: false,
        message: `No members to distribute in voice channel "${voiceChannel.name}". Only Pod Leads are present.`
      };
    }

    // Shuffle the members randomly
    const shuffledMembers = shuffleArray(Array.from(realPeople.values()));

    // Calculate members per pod
    const membersPerPod = Math.floor(shuffledMembers.length / podLeads.size);
    const remainder = shuffledMembers.length % podLeads.size;

    // Create pods
    const pods = [];
    const podLeadArray = Array.from(podLeads.values());
    let currentIndex = 0;

    for (let i = 0; i < podLeadArray.length; i++) {
      const podLead = podLeadArray[i];
      const podSize = membersPerPod + (i < remainder ? 1 : 0); // Distribute remainder
      const podMembers = shuffledMembers.slice(currentIndex, currentIndex + podSize);

      pods.push({
        lead: podLead,
        members: podMembers,
        size: podSize
      });

      currentIndex += podSize;
    }

    return {
      success: true,
      pods,
      totalMembers: shuffledMembers.length,
      podLeadCount: podLeads.size,
      channelName: voiceChannel.name
    };
  } catch (error) {
    console.error('Error distributing pods:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Check if the message is the distribute command
  if (message.content.startsWith('!distribute') || message.content.startsWith('!distributepods')) {
    // Check if user has administrator permissions
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('You need Administrator permissions to use this command.');
    }

    // Parse command to get channel name
    const args = message.content.split(' ').slice(1);
    const channelName = args.join(' ');

    if (!channelName) {
      return message.reply('Please specify a voice channel name. Usage: `!distribute ChannelName`');
    }

    // Find the voice channel
    const voiceChannel = message.guild.channels.cache.find(
      channel => channel.name.toLowerCase() === channelName.toLowerCase() && channel.type === 2
    );

    if (!voiceChannel) {
      return message.reply(`Voice channel "${channelName}" not found. Please check the channel name and try again.`);
    }

    await message.reply(`Distributing members from voice channel "${voiceChannel.name}" into pods... Please wait.`);

    const result = await distributePods(message.guild, voiceChannel);

    if (!result.success) {
      return message.channel.send(`❌ ${result.message}`);
    }

    // Create embed with pod distribution
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🎯 Pod Distribution Complete')
      .setDescription(`Successfully distributed **${result.totalMembers}** members from voice channel **${result.channelName}** among **${result.podLeadCount}** pods.`)
      .setTimestamp();

    // Add fields for each pod
    result.pods.forEach((pod, index) => {
      const memberList = pod.members
        .map(m => `• ${m.user.tag}`)
        .join('\n') || 'No members assigned';

      embed.addFields({
        name: `Pod ${index + 1} - Led by ${pod.lead.user.tag} (${pod.size} members)`,
        value: memberList.length > 1024 ? memberList.substring(0, 1021) + '...' : memberList,
        inline: false
      });
    });

    await message.channel.send({ embeds: [embed] });
  }

  // Help command
  if (message.content === '!podhelp') {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Pod Bot Commands')
      .setDescription('Commands for managing pod distribution from voice channels')
      .addFields(
        {
          name: '!distribute <ChannelName>',
          value: 'Randomly distributes members currently in a voice channel into pods.\nExample: `!distribute Lounge`\n\nRequires Administrator permissions.',
          inline: false
        },
        {
          name: 'Setup',
          value: '1. Create a role named "Pod Lead"\n2. Have Pod Leads join a voice channel\n3. Have other members join the same voice channel\n4. Run `!distribute ChannelName` to create pods',
          inline: false
        },
        {
          name: 'Important Notes',
          value: '• Only distributes members currently in the specified voice channel\n• Pod Leads must be in the voice channel\n• Bots are automatically excluded',
          inline: false
        }
      )
      .setTimestamp();

    await message.channel.send({ embeds: [helpEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
