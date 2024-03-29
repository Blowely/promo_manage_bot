const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config()
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
const {selectedTimeHandler, selectedPartHandler, getNearestPlaces, addCost, addComment, getImportExport, getImport} = require("./Services/objectLocalService");
const {FAST_TIME, DATE_MATCH, NOT_MODIFIED_ERROR} = require("./constants");

const TG_COMMANDS = require('./constants').TG_COMMANDS;
const store = require('./store').store;
const options = require('./options');
const {emoji} = require("node-emoji");
const {logger} = require("sequelize/lib/utils/logger");

const startBot = require('./Services/objectLocalService').startBot;
const getMenu = require('./Services/objectLocalService').getMenu;
const getMyChannels = require('./Services/objectLocalService').getMyChannels;
const addChannel = require('./Services/objectLocalService').addChannel;
const selectChannel = require('./Services/objectLocalService').selectChannel;
const selectPlace = require('./Services/objectLocalService').selectPlace;
const selectTime = require('./Services/objectLocalService').selectTime;
const view_total = require('./Services/objectLocalService').view_total;

const token = process.env.TOKEN;

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

                if (user?.editMessageIds.length) {
                    await removeMessages(chatId, bot, user.editMessageIds);
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
                let localMessageId = messageId;
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (User) {
                        localMessageId = User.editMessageIds[0];
                    }
                }
                await getMyChannels(chatId, bot, localMessageId, UserModel, ChannelModel);
                break;
            }
            case "/add_channel": {
                console.log('>>> add channel');
                let localMessageId = messageId;
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (User) {
                        localMessageId = User.editMessageIds[0];
                    }
                }

                await addChannel(chatId, bot, localMessageId);
                break;
            }
            case "/near": {
                console.log('>>> get nearest places');
                await getNearestPlaces(chatId, bot, ChannelModel);
                break;
            }
            case "/import_export": {
                console.log('>>> get nearest places');
                let localMessageId = messageId;
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (User) {
                        localMessageId = User.editMessageIds[0];
                    }
                }

                await getImportExport(chatId, bot, localMessageId, UserModel);

                break;
            }
            case "/import": {
                console.log('>>> get import');
                let localMessageId = messageId;
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (User) {
                        localMessageId = User.editMessageIds[0];
                    }
                }

                await getImport(chatId, bot, localMessageId, UserModel);

                break;
            }
            case "/download": {
                console.log('>>> get download');
                let localMessageId = messageId;
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (User) {
                        localMessageId = User.editMessageIds[0];
                    }
                }
                let photo = 'cats.jpg';
                await bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
                //await bot.downloadFile('store.js', '.');

                break;
            }
            case "/upload": {
                console.log('>>> get upload');
                let localMessageId = messageId;
                if (!messageId) {
                    const User = await UserModel.findOne({where: {chatId}});
                    if (User) {
                        localMessageId = User.editMessageIds[0];
                    }
                }

                await getImportExport(chatId, bot, localMessageId, UserModel);

                break;
            }
            case "/select_channel": {
                console.log('>>> select channel');
                await selectChannel(chatId, bot, messageId);
                break;
            }
            case "/select_place": {
                try {
                    console.log('>>> select place');
                    const user = await User.findOne({ where: {chatId: chatId}});
                    const dataTookPlaces = await checkInfoTookPlaces(user.selectedChannel, user.selectedDate, chatId, bot);

                    await selectPlace(dataTookPlaces, chatId, bot, messageId);
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
                await selectPlace(dataTookPlaces, chatId, bot, messageId, true);
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
            const messageId = msg.message_id;

            await bot.deleteMessage(chatId, messageId);

            const user = await UserModel.findOne({where: {chatId}});
            const userState = user?.state;
            const editMessageIds = user?.editMessageIds ?? [messageId];

            const revokeOptions = {...options.getRevokeOption(editMessageIds[0]), chat_id: chatId, message_id: editMessageIds[0]};

            if (TG_COMMANDS.hasOwnProperty(text)) {
                return await commandHandler(TG_COMMANDS[text], chatId, msg.message_id);
            }

            if (userState === '2') {
                try {
                    if (!channelLinkHandler(text)) {
                        return await bot.editMessageText('Невалидная ссылка. Пришли ссылку на канал', revokeOptions)
                    }

                    await UserModel.update({selectedLink: text, state: 2.1}, {where: {chatId}});
                    return await bot.editMessageText('Отлично! Теперь пришли название канала (до 255 символов)', revokeOptions);
                } catch (e) {
                    console.log('e userState === 2', e.message);
                    if (e.message === NOT_MODIFIED_ERROR) {
                        await bot.editMessageText('Невалидная ссылка. Пришли ссылку на канал', revokeOptions);
                    } else {
                        await bot.editMessageText('Что-то пошло не так, перезапустите бота', revokeOptions)
                    }
                }
            }

            if (userState === '2.1') {
                try {
                    if (!text || text?.length > 255) {
                        return await bot.editMessageText('Пришли название канала (до 255 символов)', revokeOptions);
                    }

                    await UserModel.update({state: 2.2, selectedChannelName: text}, {where: {chatId}});
                    return await bot.editMessageText('Отлично! Теперь пришли кол-во рекламных мест (до 10)', revokeOptions);
                } catch (e) {
                    console.log('e userState === 2.1', e.message);
                    if (e.message === NOT_MODIFIED_ERROR) {
                        await bot.editMessageText( 'Пришли название канала (до 255 символов)', revokeOptions);
                    } else {
                        await bot.editMessageText('Что-то пошло не так, перезапустите бота', revokeOptions)
                    }
                }
            }

            if (userState === '2.2') {
                try {
                    if (!countChannelPlacesHandler(text)) {
                        return await bot.editMessageText('Пришли кол-во рекламных мест (до 10)', revokeOptions)
                    }

                    await UserModel.update({state: 2, selectedCountPlaces: text}, {where: {chatId}});
                    return await addRemoteChannel(text, chatId, user?.editMessageIds, UserModel, ChannelModel, bot);
                } catch (e) {
                    console.log('e userState === 2.2', e.message);
                    if (e.message === NOT_MODIFIED_ERROR) {
                        await bot.editMessageText( 'Пришли кол-во рекламных мест (до 10)', revokeOptions);
                    } else {
                        await bot.editMessageText('Что-то пошло не так, перезапустите бота', revokeOptions)
                    }
                }
            }

            if (userState === '4') {
                try {
                    const res = checkValidDate(text);

                    if (!res) { return await commandHandler('/select_channel', chatId)}

                    const formatedDate = formateDate(text);
                    console.log('>>> formDate =', formatedDate);
                    await User.update({selectedDate: formatedDate}, { where: {chatId: chatId}});
                    return await commandHandler('/select_place', chatId);
                } catch (e) {
                    console.log('e userState === 4', e.message);
                    await bot.editMessageText( 'Что-то пошло не так, перезапустите бота', revokeOptions)
                }
            }

            if (userState === '6') {
                try {
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
                } catch (e) {
                    console.log('e userState === 6', e.message);
                    await bot.editMessageText( 'Что-то пошло не так, перезапустите бота',
                        {...options.getRevokeOption(editMessageIds[0]), chat_id: chatId, message_id: editMessageIds[0]})
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
                return await bot.deleteMessage(chatId, messageId);
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

        if (parsedData?.channel_id) {
            selectedChannel = parsedData.channel_id
            const channel = await Channel.findOne({ where: {chatId: selectedChannel} });
            selectedChannelName = channel.name;
            await postRemoteSelectedChannelInUser(selectedChannel, chatId);
            return await commandHandler('/select_channel', chatId, parsedData?.editMessageId);
        }

        if (parsedData.date) {
            selectedDay = parsedData.date;
            await postRemoteSelectedDateInUser(DATE_MATCH[selectedDay], chatId);
            return await commandHandler('/select_place', chatId, parsedData.editMessageId);
        }

        if (parsedData.get) {
            selectedPart = selectedPartHandler(parsedData.get);
            return await commandHandler('/select_time', chatId, parsedData.editMessageId);
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
