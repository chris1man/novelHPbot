console.error('SERVER STARTING: Initializing application...');
require('dotenv').config();
const { Telegraf } = require('telegraf');

// Проверяем токен
if (!process.env.BOT_TOKEN) {
    console.error('CRITICAL: BOT_TOKEN is missing!');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Получаем порт от облака (или 3000 по умолчанию)
const PORT = process.env.PORT || 3000;
// ВАЖНО: Ваш домен, который выдал Timeweb
// Лучше вынести в переменные окружения, но оставим как вы просили для старта
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://chris1man-novelhpbot-df74.twc1.net';

bot.start((ctx) => ctx.reply('Привет! Я работаю на Webhook 🚀'));
bot.help((ctx) => ctx.reply('Отправь мне текст.'));
bot.on('text', (ctx) => ctx.reply(`Ты написал: ${ctx.message.text}`));

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error(`Error for ${ctx.updateType}`, err);
});

// Глобальные обработчики ошибок
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL ERROR: Unhandled Rejection at:', promise, 'reason:', reason);
});

// ЗАПУСК В РЕЖИМЕ WEBHOOK
console.log(`Setting up webhook on: ${WEBHOOK_URL} port: ${PORT}`);

bot.launch({
    webhook: {
        domain: WEBHOOK_URL,
        port: PORT
    }
}).then(() => {
    console.log(`Bot started on ${WEBHOOK_URL} port ${PORT}`);
}).catch((err) => {
    console.error('Failed to launch bot:', err);
});

// Корректная остановка
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
