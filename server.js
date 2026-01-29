const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// База данных
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// Раздача статики
app.use(express.static(__dirname));

// Маршрут для игры с проверкой пути
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    console.log("Попытка найти index.html по пути:", indexPath);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Ошибка: Файл index.html не найден в корне проекта!");
            res.status(404).send("Файл игры не найден на сервере. Проверь структуру папок.");
        }
    });
});

bot.start((ctx) => {
    ctx.reply('💎 Твоя империя ждет!', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]
            ]
        }
    });
});

// Запуск бота с обработкой ошибок (чтобы не падал при конфликтах)
bot.launch()
    .then(() => console.log('✅ Бот успешно запущен'))
    .catch((err) => console.error('❌ Ошибка запуска бота:', err.message));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер активен на порту ${PORT}`);
});