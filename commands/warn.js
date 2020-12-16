const { MessageEmbed } = require('discord.js');
exports.run = (client, message, args) => {
  const reason = args.slice(1).join(' '),
    userr = message.mentions.members.first() || message.guild.members.fetch(args[0]),
    botlog = message.guild.channels.cache.find(channel => channel.name === 'bot-logs');
  if (message.guild.me.hasPermission('MANAGE_CHANNELS') && !botlog) {
    message.guild.channels.create('bot-logs', { type: 'text' });
  } else if (!botlog) return message.reply('I cannot find a bot-logs channel');
  if (reason.length < 1) return message.reply('supply a reason for the warning');
  if (!userr) return message.reply('tell me who to warn, idiot').catch(client.logger.error);
  return botlog.send(new MessageEmbed()
    .setColor(0x00ae86)
    .setTimestamp()
    .setDescription(
      `**Action:** Warning\n**Target:** ${userr.user.tag}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}\n**User ID:** ${userr.user.id}`
    )
  ).catch(client.logger.error);
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 2
};

exports.help = {
  name: 'warn',
  description: 'Issues a warning to the mentioned user.',
  usage: 'warn [mention] [reason]'
};
