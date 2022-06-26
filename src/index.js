const TelegramApi = require('node-telegram-bot-api');
const {checkCorrectTime} = require("./utils");

const TG_COMMANDS = require('./constants').TG_COMMANDS;
const store = require('./store').store;

const startBot = require('./Services/objectLocalService').startBot;
const getMyChannels = require('./Services/objectLocalService').getMyChannels;
const addChannel = require('./Services/objectLocalService').addChannel;
const selectChannel = require('./Services/objectLocalService').selectChannel;
const selectPlace = require('./Services/objectLocalService').selectPlace;
const selectTime = require('./Services/objectLocalService').selectTime;
const view_total = require('./Services/objectLocalService').view_total;

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
        case "/select_channel": {
            await selectChannel(chatId, bot);
            break;
        }
        case "/select_place": {
            await selectPlace(chatId, bot);
            break;
        }
        case "/select_time": {
            await selectTime(chatId, bot);
            break;
        }
        case "/view_total": {
            await view_total(chatId, bot);
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

    if (store.state_pos === 5) {
        return checkCorrectTime(text) ? await commandHandler('/view_total', chatId) : bot.sendMessage(chatId,
            'Не верно указано время, укажи время в промежутке: от 07:00 до 12:00');
    }

    if (!TG_COMMANDS.hasOwnProperty(text)) {
        bot.sendMessage(chatId, 'Я тебя не понимаю');
        return;
    }

    await commandHandler(TG_COMMANDS[text], chatId);
})

bot.on('callback_query', async (msg) => {
    //console.log(msg);
    console.log('state_pos =', store.state_pos);
    const data = msg.data;
    const chatId = msg.message.chat.id;

    if (Object.values(data)[0] === '/') {
        return await commandHandler(data, chatId);
    }

    const parsedData = JSON.parse(msg.data);

    console.log('msg = ',msg);
    console.log('parsedData =', parsedData);
    if (parsedData.channel_id) {
       return await commandHandler('/select_channel', chatId);
    }

    if (parsedData.date) {
        return await commandHandler('/select_place', chatId);
    }

    if (parsedData.get) {
        return await commandHandler('/select_time', chatId);
    }


})