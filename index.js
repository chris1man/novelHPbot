console.error('SERVER STARTING: Initializing application...'); // Using console.error to bypass potential stdout buffering
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR: Unhandled Rejection at:', promise, 'reason:', reason);
});

require('dotenv').config();
const { Telegraf } = require('telegraf');
const connectDB = require('./db');
const Test = require('./models/Test');

// Connect to database
connectDB();

// Check for BOT_TOKEN
if (!process.env.BOT_TOKEN) {
    console.error('Error: BOT_TOKEN is not defined in environment variables.');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Basic commands
bot.use(async (ctx, next) => {
    console.log('Update received:', ctx.update);
    await next();
}); // Debug logging

bot.start((ctx) => {
    ctx.reply(`Привет, ${ctx.from.first_name}! Я простой бот на Node.js.\nЯ готов к работе на Timeweb Cloud 🚀`);
});

bot.help((ctx) => ctx.reply('Отправь мне любое сообщение, и я отвечу тебе.'));

// Echo handler
bot.on('text', (ctx) => {
    ctx.reply(`Ты написал: ${ctx.message.text}`);
});

// Error handling
bot.catch((err, ctx) => {
    console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// Launch bot
bot.launch().then(async () => {
    console.log('Bot started successfully');

    // Create a test document to verify DB connection
    try {
        await Test.create({ message: 'Hello MongoDB from Bot init!' });
        console.log('Test document created in MongoDB');
    } catch (err) {
        console.error('Error creating test document:', err.message);
    }
}).catch((err) => {
    console.error('Failed to start bot', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Start a dummy HTTP server to satisfy cloud providers that require port binding
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Bot is running!');
    res.end();
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Health check server running on port ${PORT}`);
});
