const TelegramApi = require('node-telegram-bot-api');

const TG_COMMANDS = require('./constants').TG_COMMANDS;
const startBot = require('./Services/objectLocalService').startBot;
const getMyChannels = require('./Services/objectLocalService').getMyChannels;
const addChannel = require('./Services/objectLocalService').addChannel;

const token = '5463427155:AAGrFdCY4pKDdt-OX7XcOvwEAsyY_daDaFs';

const bot = new TelegramApi(token, {polling: true});

const commandHandler = async (command, chatId) => {
    switch (command) {
        case "/start": {
            await startBot(chatId, bot);
            break;
        }
        case "/my_channels": {
            await getMyChannels(chatId, bot);
            break;
        }
        case "/add_channel": {
            await addChannel(chatId, bot);
            break;
        }
        default: return;
    }
}

bot.setMyCommands([
    {command: '/start', description: 'Запуск бота'},
    {command: '/info', description: 'Инфо'},
])

bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (!TG_COMMANDS.hasOwnProperty(text)) {
        return;
    }

    await commandHandler(TG_COMMANDS[text], chatId);
})

bot.on('callback_query', async (msg) => {
    //console.log(msg);
    const command = msg.data;
    const chatId = msg.message.chat.id;

    await bot.sendMessage(chatId, command);
    await commandHandler(command, chatId);
})