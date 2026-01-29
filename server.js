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
app.use(express.json()); 
const bot = new Telegraf(process.env.BOT_TOKEN);

// Раздача файлов игры
app.use(express.static(__dirname));

/**
 * ЛОГИКА БАЗЫ ДАННЫХ
 */

// Получить данные игрока (по ID из Telegram)
app.get('/get-stats', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'No userId' });

    let user = db.get('users').find({ id: userId }).value();
    
    if (!user) {
        user = { id: userId, crystals: 0 };
        db.get('users').push(user).write();
    }
    res.json(user);
});

// Сохранить прогресс
app.post('/save-stats', (req, res) => {
    const { userId, crystals } = req.body;
    if (!userId) return res.status(400).json({ error: 'No userId' });

    db.get('users')
      .find({ id: userId })
      .assign({ crystals: crystals })
      .write();
    
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

bot.start((ctx) => {
    ctx.reply('💎 Прогресс синхронизирован!', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

bot.launch().catch(err => console.error("Ошибка:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});