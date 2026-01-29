const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Настройка базы данных
const adapter = new FileSync('db.json');
const db = low(adapter);

// Создаем структуру, если файл пустой
db.defaults({ users: [] }).write();

const app = express();
app.use(express.json()); // Позволяет серверу принимать JSON
const bot = new Telegraf(process.env.BOT_TOKEN);

// Раздача статических файлов (HTML, JS, CSS)
app.use(express.static(__dirname));

/**
 * МАРШРУТЫ ДЛЯ СИНХРОНИЗАЦИИ ИГРОКОВ
 */

// 1. Получить данные конкретного игрока
app.get('/get-stats', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'No userId provided' });

    let user = db.get('users').find({ id: userId }).value();
    
    // Если игрока еще нет в базе, создаем его с 0 кристаллов
    if (!user) {
        user = { id: userId, crystals: 0 };
        db.get('users').push(user).write();
        console.log(`Новый игрок зарегистрирован: ${userId}`);
    }
    res.json(user);
});

// 2. Сохранить прогресс конкретного игрока
app.post('/save-stats', (req, res) => {
    const { userId, crystals } = req.body;
    if (!userId) return res.status(400).json({ error: 'No userId' });

    db.get('users')
      .find({ id: userId })
      .assign({ crystals: crystals })
      .write();
    
    res.json({ status: 'success' });
});

// Главная страница игры
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Настройка бота
bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать! Твой прогресс сохраняется автоматически.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]
            ]
        }
    });
});

bot.launch().catch(err => console.error("Ошибка бота:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});