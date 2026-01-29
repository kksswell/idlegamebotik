const { Telegraf } = require('telegraf');
const express = require('express');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Инициализация БД
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ users: [] }).write();

const app = express();
app.use(express.json());
const bot = new Telegraf(process.env.BOT_TOKEN);

// Раздача статики
app.use(express.static(__dirname));

// Маршрут получения данных
app.get('/get-stats', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'No ID' });

    let user = db.get('users').find({ id: userId }).value();
    if (!user) {
        user = { 
            id: userId, 
            crystals: 0, 
            pickaxeLevel: 1, 
            hasPet: false 
        };
        db.get('users').push(user).write();
    }
    res.json(user);
});

// Маршрут сохранения данных
app.post('/save-stats', (req, res) => {
    const { userId, crystals, pickaxeLevel, hasPet } = req.body;
    db.get('users')
      .find({ id: userId })
      .assign({ crystals, pickaxeLevel, hasPet })
      .write();
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать в Жидкое Стекло! Твой прогресс сохранен.', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

bot.launch().catch(err => console.error("Bot error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});