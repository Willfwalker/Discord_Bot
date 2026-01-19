require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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
async function distributePods(guild) {
  try {
    // Fetch all members
    await guild.members.fetch();

    // Find Pod Lead role
    const podLeadRole = guild.roles.cache.find(role => role.name === 'Pod Lead');
    if (!podLeadRole) {
      return {
        success: false,
        message: 'Pod Lead role not found. Please create a role named "Pod Lead" first.'
      };
    }

    // Get all Pod Leads
    const podLeads = guild.members.cache.filter(member =>
      member.roles.cache.has(podLeadRole.id) && !member.user.bot
    );

    if (podLeads.size === 0) {
      return {
        success: false,
        message: 'No Pod Leads found. Please assign the "Pod Lead" role to at least one member.'
      };
    }

    // Get all real people (exclude bots and Pod Leads)
    const realPeople = guild.members.cache.filter(member =>
      !member.user.bot && !member.roles.cache.has(podLeadRole.id)
    );

    if (realPeople.size === 0) {
      return {
        success: false,
        message: 'No members to distribute into pods.'
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
      podLeadCount: podLeads.size
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
  if (message.content === '!distribute' || message.content === '!distributepods') {
    // Check if user has administrator permissions
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('You need Administrator permissions to use this command.');
    }

    await message.reply('Distributing members into pods... Please wait.');

    const result = await distributePods(message.guild);

    if (!result.success) {
      return message.channel.send(`❌ ${result.message}`);
    }

    // Create embed with pod distribution
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('🎯 Pod Distribution Complete')
      .setDescription(`Successfully distributed **${result.totalMembers}** members among **${result.podLeadCount}** pods.`)
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
      .setDescription('Commands for managing pod distribution')
      .addFields(
        {
          name: '!distribute (or !distributepods)',
          value: 'Randomly distributes all server members into pods based on the number of Pod Leads. Requires Administrator permissions.',
          inline: false
        },
        {
          name: 'Setup',
          value: '1. Create a role named "Pod Lead"\n2. Assign the role to members who will lead pods\n3. Run !distribute to create pods',
          inline: false
        }
      )
      .setTimestamp();

    await message.channel.send({ embeds: [helpEmbed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
