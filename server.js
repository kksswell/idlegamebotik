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

// Указываем серверу, что файлы лежат в той же папке, что и этот скрипт
app.use(express.static(__dirname));

// Главный маршрут, который отдаёт твою игру
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка команды /start в Telegram
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
bot.launch().then(() => console.log('Бот запущен!'));

// ВАЖНО: Порт для Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер работает на порту ${PORT}`);
});