require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

const PORT = process.env.PORT;
if (!PORT) {
    console.error('PORT is not defined');
    process.exit(1);
}

app.use(express.json());

app.get('/', (req, res) => {
    res.send('APP IS ALIVE');
});

app.post('/', (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

bot.start((ctx) => ctx.reply('Ура! Я наконец-то заработал! 🚀'));
bot.on('text', (ctx) => ctx.reply(`Эхо: ${ctx.message.text}`));

(async () => {
    await bot.telegram.setWebhook(`https://chris1man-novelhpbot-df74.twc1.net/`);
    console.log('Webhook set');
})();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on ${PORT}`);
});
