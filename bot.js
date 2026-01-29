const { Telegraf } = require('telegraf');
const express = require('express');
const app = express();

const bot = new Telegraf('8203951929:AAHbgEcIP_7vzOIwis_2bt9280sQfAUqpRk');

// Ссылка на твой будущий сайт (хостинг)
const web_link = 'https://your-game-url.com'; 

bot.start((ctx) => ctx.reply('Добро пожаловать в Glass Miner!', {
    reply_markup: {
        inline_keyboard: [[
            { text: "Играть", web_app: { url: web_link } }
        ]]
    }
}));

bot.launch();
app.use(express.static('dist')); // Отдача фронтенда
app.listen(3000, () => console.log('Server running on port 3000'));