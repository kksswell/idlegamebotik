const { Telegraf } = require('telegraf');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Создаем "карманную" базу данных в файле db.json
const adapter = new FileSync('db.json');
const db = low(adapter);

// Настройки базы по умолчанию
db.defaults({ users: [] }).write();

const bot = new Telegraf('8203951929:AAHbgEcIP_7vzOIwis_2bt9280sQfAUqpRk');

bot.start((ctx) => {
  const userId = ctx.from.id;
  
  // Проверяем, есть ли игрок в базе
  const user = db.get('users').find({ id: userId }).value();
  if (!user) {
    db.get('users').push({ id: userId, balance: 0, level: 1 }).write();
  }

  ctx.reply('Твоя стеклянная империя ждет!', {
    reply_markup: {
      inline_keyboard: [[{ text: "Играть", web_app: { url: 'https://idlegamebotik.onrender.com' } }]]
    }
  });
});

bot.launch();