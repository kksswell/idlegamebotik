const { Telegraf } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Токен бота берется из настроек Render (Environment Variables)
const bot = new Telegraf(process.env.BOT_TOKEN);

// Твоя ссылка на MongoDB Atlas
const MONGO_URI = "mongodb+srv://admin:dapo2026@cluster0.myy3hno.mongodb.net/?appName=Cluster0";

// Подключение к базе данных
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Подключено к MongoDB Atlas'))
    .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Схема данных пользователя для MongoDB
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    crystals: { type: Number, default: 0 },
    pickaxeLevel: { type: Number, default: 1 },
    hasPet: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

// Раздача статических файлов (дизайн, картинки)
app.use(express.static(__dirname));

/** * API ЭНДПОИНТЫ 
 */

// 1. Получение статистики игрока из MongoDB
app.get('/get-stats', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'ID пользователя не указан' });

    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            // Если игрока нет, создаем новую запись
            user = new User({ id: userId });
            await user.save();
            console.log(`Зарегистрирован новый игрок: ${userId}`);
        }
        res.json(user);
    } catch (e) {
        console.error("Ошибка при получении данных:", e);
        res.status(500).json({ error: "Ошибка базы данных" });
    }
});

// 2. Сохранение прогресса в MongoDB
app.post('/save-stats', async (req, res) => {
    const { userId, crystals, pickaxeLevel, hasPet } = req.body;
    if (!userId) return res.status(400).json({ error: 'ID пользователя не указан' });

    try {
        await User.findOneAndUpdate(
            { id: userId },
            { 
                crystals: Math.floor(crystals), 
                pickaxeLevel: pickaxeLevel, 
                hasPet: hasPet 
            },
            { upsert: true }
        );
        res.json({ status: 'ok' });
    } catch (e) {
        console.error("Ошибка при сохранении:", e);
        res.status(500).json({ error: "Ошибка сохранения" });
    }
});

// 3. Таблица лидеров (Топ-10)
app.get('/leaderboard', async (req, res) => {
    try {
        const topPlayers = await User.find().sort({ crystals: -1 }).limit(10);
        res.json(topPlayers);
    } catch (e) {
        res.status(500).json({ error: "Ошибка загрузки лидеров" });
    }
});

// Маршрут для самой игры
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Настройка Telegram-бота
bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать в Жидкое Стекло!\nТвой прогресс теперь сохраняется вечно в MongoDB.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Начать добычу 🎮", web_app: { url: process.env.WEBAPP_URL } }]
            ]
        }
    });
});

bot.launch().catch(err => console.error("Ошибка запуска бота:", err));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});