const TelegramApi = require('node-telegram-bot-api');
const sequelize = require('./db');
const UserModel = require('./models').User;
const ChannelModel = require('./models').Channel;
const fetch = require('node-fetch');


const {checkCorrectTime, checkValidTime, viewValidTime, partFreeHandler, channelLinkHandler, checkValidDate,
    formateDate, countChannelPlacesHandler, removeMessages, editMessage
} = require("./utils");
const {addRemoteChannel, postRemotePlace, checkInfoTookPlaces, postRemoteFreePlace, postRemoteSelectedChannelInUser,
    postRemoteSelectedTimeInUser, postRemoteOrderCostInUser, postRemoteOrderCommentInUser
} = require("./Services/objectRemoteService");
const {postRemoteSelectedDateInUser} = require('./Services/objectRemoteService');

const {User, Channel} = require("./models");
const {redirectToPrevPage} = require("./Services/redirectHandler");
const moment = require("moment");
const dayjs = require("dayjs");
require('dayjs/locale/ru');
const {selectedTimeHandler, selectedPartHandler, getNearestPlaces, addCost, addComment} = require("./Services/objectLocalService");
const {FAST_TIME, DATE_MATCH} = require("./constants");
const {fillChannels} = require("./Services/objectService");

const TG_COMMANDS = require('./constants').TG_COMMANDS;
const store = require('./store').store;
const options = require('./options');
const {emoji} = require("node-emoji");

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

const commandHandler = async (command, chatId, messageId) => {
    try {
        if (TG_COMMANDS.hasOwnProperty(command)) {
            await removeMessages(chatId, bot, [messageId]);
        }

        switch (command) {
            case "/start": {
                console.log('>>> start');
                const user = await UserModel.findOne({where: {chatId: chatId}});

                if (!user) {
                    await UserModel.create({chatId}).then((res) => console.log('success', res.toJSON()))
                        .catch((err) => console.log('err =', err))
                }

                await startBot(chatId, bot, UserModel, ChannelModel);
                break;
            }
            case "/menu": {
                console.log('>>> get menu');
                await getMenu(chatId, bot, UserModel, null, messageId);
                break;
            }
            case "/info": {
                console.log('>>> info');
                await bot.sendMessage(chatId, 'Айди твоего чата' + user.chatId)
                break;
            }
            case "/my_channels": {
                console.log('>>> my channels');
                const User = await UserModel.findOne({where: {chatId}});
                if (!User) {
                    break;
                }
                await getMyChannels(chatId, bot, User?.deleteMessageIds, UserModel, ChannelModel);
                break;
            }
            case "/add_channel": {
                console.log('>>> add channel');
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (!User) {
                        break;
                    }
                    await addChannel(chatId, bot, User.deleteMessageIds[0]);
                }


                await addChannel(chatId, bot, messageId);
                break;
            }
            case "/near": {
                console.log('>>> get nearest places');
                await getNearestPlaces(chatId, bot, ChannelModel);
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
                    const user = await User.findOne({ where: {chatId: chatId}});
                    const dataTookPlaces = await checkInfoTookPlaces(user.selectedChannel, user.selectedDate, chatId, bot);

                    await selectPlace(dataTookPlaces, chatId, bot);
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
                await view_total(chatId, bot);
                break;
            }
            case "/view_result": {
                console.log('>>> view result');
                await postRemotePlace(selectedChannel, selectedDay, selectedPart, selectedTime, bot, chatId);
                const user = await User.findOne({ where: {chatId: chatId}});
                const dataTookPlaces = await checkInfoTookPlaces(user.selectedChannel, user.selectedDate, chatId, bot);
                await selectPlace(dataTookPlaces, chatId, bot, true);
                break;
            }
            case "/add_cost": {
                console.log('>>> add_cost');
                await addCost(chatId, bot);
                break;
            }
            case "/add_comment": {
                console.log('>>> add_comment');
                await addComment(chatId, bot);
                break;
            }
            default:
                return;
        }
    } catch (e) {
        console.log('eeee =', e);
        return await bot.sendMessage(chatId, 'Произошла какая-то ошибочка!' + e);
    }
}

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        //await sequelize.sync({ force: true });
        /*const res = await fetch('https://t.me/jolybells');
        const data = res.json();
        console.log('>>> data =', data);*/
    } catch (e) {
        console.log('Подключение к бд сломалось ', e);
    }


    bot.setMyCommands([
        {command: '/start', description: 'Запуск бота'},
        {command: '/info', description: 'Инфо'},
    ])

    bot.on('message', async (msg) => {
        try {
            const text = msg.text;
            const chatId = msg.chat.id;

            const user = await UserModel.findOne({where: {chatId}});
            console.log('>>> userMessage =', user);
            const userState = user?.state;

            console.log('>>>> userState =', userState);

            if (TG_COMMANDS.hasOwnProperty(text)) {
                return await commandHandler(TG_COMMANDS[text], chatId, msg.message_id);
            }

            if (userState === '2') {
                try {
                    const res = channelLinkHandler(text);

                    if (!res) { return await bot.sendMessage(chatId, 'Пришли ссылку на канал', options.TIME)}

                    await UserModel.update({selectedLink: text, state: 2.1}, {where: {chatId}});
                    return await bot.sendMessage(chatId,  'Отлично! Теперь пришли название канала', options.TIME);
                } catch (e) {
                    console.log('e userState === 2', e.message);
                    await bot.sendMessage(chatId, 'Что-то пошло не так', options.TIME)
                }
            }

            if (userState === '2.1') {
                try {
                    if (!text) { return await bot.sendMessage(chatId, 'Пришли название канала', options.TIME)}

                    await UserModel.update({state: 2.2, selectedChannelName: text}, {where: {chatId}});
                    return await bot.sendMessage(chatId,  'Отлично! Теперь пришли кол-во рекалмных мест (до 10)', options.TIME);
                } catch (e) {
                    console.log('e userState === 2.1', e.message);
                    await bot.sendMessage(chatId, 'Что-то пошло не так', options.TIME)
                }
            }

            if (userState === '2.2') {
                try {
                    if (!countChannelPlacesHandler(text)) { return await bot.sendMessage(chatId, 'Пришли кол-во рекалмных мест (до 10)', options.TIME)}

                    await UserModel.update({state: 2, selectedCountPlaces: text}, {where: {chatId}});
                    return await addRemoteChannel(text, chatId, user?.deleteMessageIds, UserModel, ChannelModel, bot);
                } catch (e) {
                    console.log('e userState === 2.2', e.message);
                    await bot.sendMessage(chatId, 'Что-то пошло не так', options.TIME)
                }
            }

            if (userState === '4') {
                const res = checkValidDate(text);

                if (!res) { return await commandHandler('/select_channel', chatId)}

                const formatedDate = formateDate(text);
                console.log('>>> formDate =', formatedDate);
                await User.update({selectedDate: formatedDate}, { where: {chatId: chatId}});
                return await commandHandler('/select_place', chatId);
            }

            if (userState === '6') {
                if (checkCorrectTime(text) && checkValidTime(text, selectedPart)) {
                    selectedTime = text;
                    await postRemoteSelectedTimeInUser(selectedTime, chatId);
                    console.log('>>> hrere');
                    return await commandHandler('/view_total', chatId)
                } else {
                    await bot.sendMessage(chatId,
                        'Не верно указано время, укажи время в промежутке: от ' + viewValidTime(selectedPart));
                    return await commandHandler('/select_time', chatId)
                }
            }

            if (userState === '9') {
                await postRemoteOrderCostInUser(text, chatId);
                return await commandHandler('/view_total', chatId)
            }

            if (userState === '10') {
                await postRemoteOrderCommentInUser(text, chatId);
                return await commandHandler('/view_total', chatId)
            }

            if (!TG_COMMANDS.hasOwnProperty(text)) {
                await bot.sendMessage(chatId, 'Я тебя не понимаю');
                return;
            }


        } catch (e) {
            //return await bot.sendMessage(chatId, 'Произошла какая-то ошибочка!' + e);
        }
    })

    bot.on('callback_query', async (msg) => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        console.log('123')

        if (Object.values(data)[0] === '/') {
            return await commandHandler(data, chatId);
        }

        try {
            const testParseData = JSON.parse(data);
            console.log('testParseData =', testParseData)
            if (testParseData?.toPage && testParseData.editMessageId) {
                return await commandHandler(testParseData.toPage, chatId, testParseData.editMessageId);
            }


        } catch (e) {
            console.log('e callback_query =', e.message);
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
                await redirectToPrevPage(data, chatId, bot, UserModel, ChannelModel);
                parsedData = data;
            }
        }

        if (parsedData.editMessageId) {
            await commandHandler('/menu', chatId, parsedData.editMessageId);
        }

        if (parsedData.channel_id) {
            selectedChannel = parsedData.channel_id
            const channel = await Channel.findOne({ where: {chatId: selectedChannel} });
            selectedChannelName = channel.name;
            await postRemoteSelectedChannelInUser(selectedChannel, chatId);
            return await commandHandler('/select_channel', chatId);
        }

        if (parsedData.date) {
            selectedDay = parsedData.date;
            await postRemoteSelectedDateInUser(DATE_MATCH[selectedDay], chatId);
            return await commandHandler('/select_place', chatId);
        }

        if (parsedData.get) {
            selectedPart = selectedPartHandler(parsedData.get);
            return await commandHandler('/select_time', chatId);
        }

        if (parsedData.get_fast) {
            selectedPart = selectedPartHandler(parsedData.get_fast);
            selectedTime = FAST_TIME[selectedPart];
            await postRemoteSelectedTimeInUser(FAST_TIME[selectedPart], chatId);
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

        if (parsedData.add_cost) {
            return await commandHandler('/add_cost', chatId);
        }

        if (parsedData.add_comment) {
            return await commandHandler('/add_comment', chatId);
        }
    })
}

start().then(() => '>>> bot is running');
