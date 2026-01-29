const { Telegraf } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Токен бота (должен быть в Environment Variables на Render)
const bot = new Telegraf(process.env.BOT_TOKEN);

// Твоя ссылка на MongoDB Atlas
const MONGO_URI = "mongodb+srv://admin:dapo2026@cluster0.myy3hno.mongodb.net/?appName=Cluster0";

// Подключение к БД
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Подключено к MongoDB Atlas'))
    .catch(err => console.error('❌ Ошибка MongoDB:', err));

// РАСШИРЕННАЯ СХЕМА ИГРОКА (сохраняем всё)
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    crystals: { type: Number, default: 0 },
    pickaxeLevel: { type: Number, default: 1 },
    hasPet: { type: Boolean, default: false },
    lastUpdate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

app.use(express.static(__dirname));

/**
 * API ДЛЯ ПОЛНОЙ СИНХРОНИЗАЦИИ
 */

// Получить абсолютно все данные игрока
app.get('/get-stats', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'No ID' });

    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            user = new User({ id: userId });
            await user.save();
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: "Ошибка загрузки" });
    }
});

// Сохранить абсолютно всё (кристаллы, кирку, питомца)
app.post('/save-stats', async (req, res) => {
    const { userId, crystals, pickaxeLevel, hasPet } = req.body;
    if (!userId) return res.status(400).json({ error: 'No ID' });

    try {
        await User.findOneAndUpdate(
            { id: userId },
            { 
                crystals: Math.floor(crystals), 
                pickaxeLevel, 
                hasPet,
                lastUpdate: Date.now()
            },
            { upsert: true }
        );
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ error: "Ошибка сохранения" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать! Твой прогресс теперь под надежной защитой MongoDB.', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Сервер на порту ${PORT}`));