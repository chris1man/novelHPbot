require('dotenv').config();
const { Telegraf } = require('telegraf');

// Check for BOT_TOKEN
if (!process.env.BOT_TOKEN) {
    console.error('Error: BOT_TOKEN is not defined in environment variables.');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Basic commands
bot.start((ctx) => {
    ctx.reply(`Привет, ${ctx.from.first_name}! Я простой бот на Node.js.\nЯ готов к работе на Timeweb Cloud 🚀`);
});

bot.help((ctx) => ctx.reply('Отправь мне любое сообщение, и я отвечу тебе.'));

// Echo handler
bot.on('text', (ctx) => {
    ctx.reply(`Ты написал: ${ctx.message.text}`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Launch bot
bot.launch().then(() => {
    console.log('Bot started successfully');
}).catch((err) => {
    console.error('Failed to start bot', err);
});
