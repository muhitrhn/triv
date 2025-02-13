const request = require('node-superfetch');
const { formatNumber } = require('../util/Util');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
  try {
    if (!process.env.alphavantage_key) return message.reply('The bot owner has not set up this command yet.');
    if (args.length < 1) return message.reply(`Usage: ${client.getPrefix(message)}${exports.help.usage}`);
    const query = args.join(' ');
    const company = await search(query);
    if (!company) return message.channel.send('Could not find any results.');
    const stocks = await fetchStocks(company.symbol);
    if (!stocks) return message.channel.send('Could not find any results.');
    return message.reply({embeds: [
      new MessageEmbed()
        .setTitle(`Stocks for ${company.name} (${stocks.symbol.toUpperCase()})`)
        .setColor(0x9797FF)
        .setFooter('Last Updated')
        .setTimestamp(stocks.lastRefresh)
        .addField('❯ Open', `$${formatNumber(stocks.open)}`, true)
        .addField('❯ Close', `$${formatNumber(stocks.close)}`, true)
        .addField('❯ Volume', formatNumber(stocks.volume), true)
        .addField('❯ High', `$${formatNumber(stocks.high)}`, true)
        .addField('❯ Low', `$${formatNumber(stocks.low)}`, true)
        .addField('\u200B', '\u200B', true)
    ]});
  } catch (err) {
    return message.channel.send({embeds: [
      new MessageEmbed()
        .setColor('#FF0000')
        .setTimestamp()
        .setTitle('Please report this on GitHub')
        .setURL('https://github.com/william5553/triv/issues')
        .setDescription(`**Stack Trace:**\n\`\`\`${err.stack || err}\`\`\``)
        .addField('**Command:**', message.content)
    ]});
  }
};

async function fetchStocks(symbol) {
  const { body } = await request
    .get('https://www.alphavantage.co/query')
    .query({
      function: 'TIME_SERIES_INTRADAY',
      symbol,
      interval: '1min',
      apikey: process.env.alphavantage_key
    });
  if (body['Error Message'] || !body['Time Series (1min)']) return null;
  const data = Object.values(body['Time Series (1min)'])[0];
  return {
    symbol,
    open: data['1. open'],
    high: data['2. high'],
    low: data['3. low'],
    close: data['4. close'],
    volume: data['5. volume'],
    lastRefresh: new Date(body['Meta Data']['3. Last Refreshed'])
  };
}

async function search(query) {
  const { body } = await request
    .get('http://d.yimg.com/autoc.finance.yahoo.com/autoc')
    .query({
      query,
      region: 1,
      lang: 'en'
    });
  if (!body.ResultSet.Result.length) return null;
  return body.ResultSet.Result[0];
}

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['stock', 'stonk', 'stonks'],
  permLevel: 0,
  cooldown: 5000
};

exports.help = {
  name: 'stocks',
  description: 'Responds with the current stocks for a company',
  usage: 'stocks [company]',
  example: 'stocks TSLA'
};
