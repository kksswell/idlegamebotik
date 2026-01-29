const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Настройка базы данных
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Раздача статики (твоей игры)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Команда старт
bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать в Glass Empire!', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]
            ]
        }
    });
});

// Запуск бота
bot.launch().then(() => console.log('Бот успешно запущен'));

// ВАЖНО: Привязка порта для Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер слушает порт ${PORT}`);
});