require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const SECRET_PATH = '/webhook';
const PORT = process.env.PORT || 3000;
const DOMAIN = 'https://chris1man-novelhpbot-df74.twc1.net';

app.use(express.json());

app.get('/', (req, res) => res.send('Bot is running'));

app.post(SECRET_PATH, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

bot.start((ctx) => ctx.reply('Ура! Я наконец-то заработал! 🚀'));
bot.on('text', (ctx) => ctx.reply(`Эхо: ${ctx.message.text}`));

(async () => {
    await bot.telegram.setWebhook(`${DOMAIN}${SECRET_PATH}`);
    console.log('Webhook registered');
})();

app.get('*', (req, res) => {
    res.status(200).send('ALIVE');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
