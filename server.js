const { Telegraf } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Токен бота (убедись, что он добавлен в Environment Variables на Render)
const bot = new Telegraf(process.env.BOT_TOKEN);

// ТВОЯ ССЫЛКА (Пароль: dapo2026)
const MONGO_URI = "mongodb+srv://admin:dapo2026@cluster0.myy3hno.mongodb.net/diamond_game?retryWrites=true&w=majority";

// Подключение с защитой от падения сервера
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Успешное подключение к MongoDB Atlas'))
    .catch(err => {
        console.error('❌ ОШИБКА АВТОРИЗАЦИИ В MONGODB: Проверь логин и пароль!');
        console.error(err.message);
    });

const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    crystals: { type: Number, default: 0 },
    totalCrystals: { type: Number, default: 0 },
    pickaxeLevel: { type: Number, default: 1 },
    hasPet: { type: Boolean, default: false },
    multiplier: { type: Number, default: 1 },
    boostUntil: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);

app.use(express.static(__dirname));

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
        res.status(500).json({ error: "DB Read Error" });
    }
});

app.post('/save-stats', async (req, res) => {
    const { userId, crystals, totalCrystals, pickaxeLevel, hasPet, multiplier, boostUntil } = req.body;
    try {
        await User.findOneAndUpdate(
            { id: userId },
            { crystals, totalCrystals, pickaxeLevel, hasPet, multiplier, boostUntil },
            { upsert: true }
        );
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(500).json({ error: "DB Write Error" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать! Нажми "Играть", чтобы начать.', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

bot.launch().catch(err => console.error("Bot launch error:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});