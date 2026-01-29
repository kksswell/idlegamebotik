const { Telegraf } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// Токен бота и URL берем из переменных окружения Render
const bot = new Telegraf(process.env.BOT_TOKEN);
const MONGO_URI = "mongodb+srv://admin:dapo2026@cluster0.myy3hno.mongodb.net/?appName=Cluster0";

// Подключение к MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ База MongoDB подключена успешно'))
    .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Определение схемы игрока
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    crystals: { type: Number, default: 0 },
    pickaxeLevel: { type: Number, default: 1 },
    hasPet: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

app.use(express.static(__dirname));

// API: Получение данных игрока
app.get('/get-stats', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'No ID provided' });

    try {
        let user = await User.findOne({ id: userId });
        if (!user) {
            user = new User({ id: userId });
            await user.save();
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'Database read error' });
    }
});

// API: Сохранение данных игрока
app.post('/save-stats', async (req, res) => {
    const { userId, crystals, pickaxeLevel, hasPet } = req.body;
    if (!userId) return res.status(400).json({ error: 'No ID provided' });

    try {
        await User.findOneAndUpdate(
            { id: userId },
            { 
                crystals: Math.floor(crystals), 
                pickaxeLevel, 
                hasPet 
            },
            { upsert: true }
        );
        res.json({ status: 'ok' });
    } catch (e) {
        res.status(500).json({ error: 'Database write error' });
    }
});

// Главная страница игры
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Команда старт в боте
bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать! Твой прогресс теперь сохраняется в облаке MongoDB.', {
        reply_markup: {
            inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]]
        }
    });
});

bot.launch();

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});