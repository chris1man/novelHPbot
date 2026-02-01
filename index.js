require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Жестко заданный путь, чтобы мы могли его легко прописать
const SECRET_PATH = '/webhook';
const PORT = process.env.PORT || 3000;

// Разрешаем JSON
app.use(express.json());

// Главная страница
app.get('/', (req, res) => res.send('Bot is running. Waiting for Telegram...'));

// Слушаем обновления от Телеграм
app.post(SECRET_PATH, (req, res) => {
    bot.handleUpdate(req.body, res);
});

bot.start((ctx) => ctx.reply('Ура! Я наконец-то заработал! 🚀'));
bot.on('text', (ctx) => ctx.reply(`Эхо: ${ctx.message.text}`));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
