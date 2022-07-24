const TelegramApi = require('node-telegram-bot-api');
const sequelize = require('./db');
const UserModel = require('./models').User;

const {checkCorrectTime} = require("./utils");
const {addRemoteChannel, postRemotePlace} = require("./Services/objectRemoteService");
const {User} = require("./models");
const {redirectToPrevPage} = require("./Services/redirectHandler");

const TG_COMMANDS = require('./constants').TG_COMMANDS;
const store = require('./store').store;

const startBot = require('./Services/objectLocalService').startBot;
const getMenu = require('./Services/objectLocalService').getMenu;
const getMyChannels = require('./Services/objectLocalService').getMyChannels;
const addChannel = require('./Services/objectLocalService').addChannel;
const selectChannel = require('./Services/objectLocalService').selectChannel;
const selectPlace = require('./Services/objectLocalService').selectPlace;
const selectTime = require('./Services/objectLocalService').selectTime;
const view_total = require('./Services/objectLocalService').view_total;
const sendSuccessResult = require('./Services/objectLocalService').sendSuccessResult;

const token = '5463427155:AAGrFdCY4pKDdt-OX7XcOvwEAsyY_daDaFs';

const bot = new TelegramApi(token, {polling: true});

let selectedChannel = '';
let selectedDay = '';
let selectedTime = '';

const commandHandler = async (command, chatId) => {
    try {
        switch (command) {
            case "/start": {
                console.log('>>> start');

                const isUser = !!(await UserModel.findOne({where: {chatId: chatId}}));

                if (!isUser) {
                    await UserModel.create({chatId}).then((res) => console.log('success', res.toJSON()))
                        .catch((err) => console.log('err =', err))
                }

                await startBot(chatId, bot, UserModel);
                break;
            }
            case "/menu": {
                console.log('>>> get menu');
                await getMenu(chatId, bot, UserModel);
                break;
            }
            case "/info": {
                console.log('>>> info');
                await bot.sendMessage(chatId, 'Айди твоего чата' + user.chatId)
                break;
            }
            case "/my_channels": {
                console.log('>>> my channels');
                await getMyChannels(chatId, bot);
                break;
            }
            case "/add_channel": {
                console.log('>>> add channel');
                await addChannel(chatId, bot);
                break;
            }
            case "/select_channel": {
                console.log('>>> select channel');
                await selectChannel(chatId, bot);
                break;
            }
            case "/select_place": {
                console.log('>>> select place');
                await selectPlace(chatId, bot);
                break;
            }
            case "/select_time": {
                console.log('>>> select time');
                await selectTime(chatId, bot);
                break;
            }
            case "/view_total": {
                console.log('>>> view total');
                await view_total(chatId, bot);
                break;
            }
            case "/view_result": {
                console.log('>>> view result');
                await postRemotePlace(selectedChannel, selectedDay, selectedTime);
                await sendSuccessResult(chatId, bot);
                break;
            }
            default:
                return;
        }
    } catch (e) {
        /*console.log('eeee =', e);
        return await bot.sendMessage(chatId, 'Произошла какая-то ошибочка!' + e);*/
    }
}

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        //await sequelize.sync({ force: true });
    } catch (e) {
        console.log('Подключение к бд сломалось ', e);
    }

    bot.setMyCommands([
        {command: '/start', description: 'Запуск бота'},
        {command: '/info', description: 'Инфо'},
    ])

    bot.on('message', async (msg) => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (store.state_pos === 2) {
                const res = await addRemoteChannel(text, chatId, UserModel, bot);
                return;
            }

            if (store.state_pos === 6) {
                return checkCorrectTime(text) ? await commandHandler('/view_total', chatId) : bot.sendMessage(chatId,
                    'Не верно указано время, укажи время в промежутке: от 07:00 до 12:00');
            }

            if (!TG_COMMANDS.hasOwnProperty(text)) {
                await bot.sendMessage(chatId, 'Я тебя не понимаю');
                return;
            }

            await commandHandler(TG_COMMANDS[text], chatId);
        } catch (e) {
            //return await bot.sendMessage(chatId, 'Произошла какая-то ошибочка!' + e);
        }
    })

    bot.on('callback_query', async (msg) => {
        console.log('>>> state position =', store.state_pos);
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (Object.values(data)[0] === '/') {
            return await commandHandler(data, chatId);
        }

        let parsedData = '';
        try {
            parsedData = JSON.parse(data);
        } catch (e) {
            console.log('>>> return to the prev page');
            parsedData = data;
        }

        console.log('>>> parsedData =', parsedData);

        if (parsedData === 'cancel') {
            await redirectToPrevPage(chatId, bot, UserModel);
        }

        if (parsedData.channel_id) {
            selectedChannel = parsedData.channel_id
            return await commandHandler('/select_channel', chatId);
        }

        if (parsedData.date) {
            selectedDay = parsedData.date;
            return await commandHandler('/select_place', chatId);
        }

        if (parsedData.get) {
            selectedTime = parsedData.get;
            return await commandHandler('/select_time', chatId);
        }

        if (parsedData.save) {
            return await commandHandler('/view_result', chatId);
        }
    })
}

start().then(() => '>>> bot is running');
