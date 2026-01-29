const { Telegraf } = require('telegraf');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

const bot = new Telegraf(process.env.BOT_TOKEN);
const MONGO_URI = "mongodb+srv://admin:dapo2026@cluster0.myy3hno.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI).then(() => console.log('✅ DB Connected'));

// Расширенная модель игрока
const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    crystals: { type: Number, default: 0 },
    totalCrystals: { type: Number, default: 0 },
    pickaxeLevel: { type: Number, default: 1 },
    hasPet: { type: Boolean, default: false },
    multiplier: { type: Number, default: 1 }, // Буст
    boostUntil: { type: Number, default: 0 }  // Время окончания буста
});

const User = mongoose.model('User', UserSchema);

app.use(express.static(__dirname));

app.get('/get-stats', async (req, res) => {
    const userId = req.query.userId;
    try {
        let user = await User.findOne({ id: userId });
        if (!user) { user = new User({ id: userId }); await user.save(); }
        res.json(user);
    } catch (e) { res.status(500).json({ error: "DB Error" }); }
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
    } catch (e) { res.status(500).json({ error: "Save Error" }); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

bot.start((ctx) => {
    ctx.reply('💎 Добро пожаловать в Империю Алмазов!', {
        reply_markup: { inline_keyboard: [[{ text: "Играть 🎮", web_app: { url: process.env.WEBAPP_URL } }]] }
    });
});

bot.launch();
app.listen(process.env.PORT || 3000);