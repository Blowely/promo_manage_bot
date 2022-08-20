const TelegramApi = require('node-telegram-bot-api');
const sequelize = require('./db');
const UserModel = require('./models').User;

const {checkCorrectTime, checkValidTime, viewValidTime, partFreeHandler} = require("./utils");
const {addRemoteChannel, postRemotePlace, checkInfoTookPlaces, postRemoteFreePlace} = require("./Services/objectRemoteService");
const {User, Channel} = require("./models");
const {redirectToPrevPage} = require("./Services/redirectHandler");
const moment = require("moment");
const dayjs = require("dayjs");
require('dayjs/locale/ru');
const {selectedTimeHandler, selectedPartHandler, getNearestPlaces} = require("./Services/objectLocalService");
const {FAST_TIME} = require("./constants");
const {fillChannels} = require("./Services/objectService");

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

const token = '5463427155:AAGrFdCY4pKDdt-OX7XcOvwEAsyY_daDaFs';

const bot = new TelegramApi(token, {polling: true});

dayjs.locale('ru');

let selectedChannel = '';
let selectedChannelName = '';
let selectedDay = '';
let selectedTime = '';
let selectedPart = '';

let infoTookPlaces = '';

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
            case "/near": {
                console.log('>>> get nearest places');
                await getNearestPlaces(chatId, bot, UserModel);
                break;
            }
            case "/select_channel": {
                console.log('>>> select channel');
                await selectChannel(chatId, bot);
                break;
            }
            case "/select_place": {
                try {
                    console.log('>>> select place');
                    infoTookPlaces = await checkInfoTookPlaces(selectedChannel, selectedDay, chatId, bot);
                    /*if (!selectedChannelName) {
                        console.log('>>> dd123');
                        const channel = await Channel.findOne({where: {chatId: selectedChannel}});
                        selectedChannelName = channel.name;
                    }*/
                    await selectPlace(infoTookPlaces, selectedChannelName, selectedDay, chatId, bot);
                    break;
                } catch (e) {
                    console.log('e =', e);
                    break;
                }
            }

            case "/select_time": {
                console.log('>>> select time');
                await selectTime(selectedPart, chatId, bot);
                break;
            }
            case "/view_total": {
                console.log('>>> view total');
                await view_total(selectedChannelName, selectedDay, selectedTime, chatId, bot);
                break;
            }
            case "/view_result": {
                console.log('>>> view result');
                await postRemotePlace(selectedChannel, selectedDay, selectedPart, selectedTime, bot, chatId);
                infoTookPlaces = await checkInfoTookPlaces(selectedChannel, selectedDay, chatId, bot);
                await selectPlace(infoTookPlaces, selectedChannelName, selectedDay, chatId, bot, true);
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
                return await addRemoteChannel(text, chatId, UserModel, bot);
            }

            if (store.state_pos === 6) {
                if (checkCorrectTime(text) && checkValidTime(text, selectedPart)) {
                    selectedTime = text;
                    console.log('>>> hrere');
                    return await commandHandler('/view_total', chatId)
                } else {
                    await bot.sendMessage(chatId,
                        'Не верно указано время, укажи время в промежутке: от ' + viewValidTime(selectedPart));
                    return await commandHandler('/select_time', chatId)
                }
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
            if (data === 'help') {
                await bot.sendMessage(chatId, 'По вопросам пиши @in_a_state_of_flux');
                await commandHandler('/menu', chatId);
            } else {
                console.log('>>> return to the prev page');
                await redirectToPrevPage(data, chatId, bot, UserModel);
                parsedData = data;
            }
        }

        if (parsedData.channel_id) {
            selectedChannel = parsedData.channel_id
            const channel = await Channel.findOne({ where: {chatId: selectedChannel} });
            selectedChannelName = channel.name;
            return await commandHandler('/select_channel', chatId);
        }

        if (parsedData.date) {
            selectedDay = parsedData.date;
            return await commandHandler('/select_place', chatId);
        }

        if (parsedData.get) {
            selectedPart = selectedPartHandler(parsedData.get);
            return await commandHandler('/select_time', chatId);
        }

        if (parsedData.get_fast) {
            selectedPart = selectedPartHandler(parsedData.get_fast);
            selectedTime = FAST_TIME[selectedPart];
            return await commandHandler('/view_total', chatId);
        }

        if (parsedData.get_out) {
            selectedPart = partFreeHandler(parsedData.get_out);
            await postRemoteFreePlace(selectedChannel, selectedDay, selectedPart, bot, chatId);
            return await commandHandler('/select_place', chatId);
        }

        if (parsedData.save) {
            return await commandHandler('/view_result', chatId);
        }
    })
}

start().then(() => '>>> bot is running');
