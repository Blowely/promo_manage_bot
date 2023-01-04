const options = require('../options');
const {fillChannels, fillNearestPlaces} = require("./objectService");
const {viewValidTime} = require("../utils");
const {User, ChannelModel} = require("../models");
const dayjs = require("dayjs");

const store = require('../store').store;
const Channel = require("../models").Channel;

var emoji = require('node-emoji').emoji;


const startBot = async (chatId, bot, UserModel, ChannelModel) => {
    try {
        store.state_pos = 1;
        await UserModel.update({state: 1}, { where: {chatId: chatId}});

        await bot.sendMessage(chatId, 'Привет! Моя цель - автоматизировать твою ручную работу по управлению информацией о рекламе в твоем канале',
            options.START_OPTIONS);


        return await fillChannels(chatId, ChannelModel);
    } catch (e) {
        console.log('e1 =',e);
    }
}

const getMenu = async (chatId, bot, UserModel, option) => {
    console.log('>>> getMenuFunc is called');
    store.state_pos = 1;
    await UserModel.update({state: 1}, { where: {chatId: chatId}});

    if (option?.success) {
        await bot.sendMessage(chatId, 'Канал успешно добавлен ' + emoji.white_check_mark);
        return await bot.sendMessage(chatId, 'Меню', options.START_OPTIONS);
    }
    return await bot.sendMessage(chatId, 'Меню',
        options.START_OPTIONS);
}

const addChannel = async (chatId, bot) => {
    try {
        store.state_pos = 2;
        await User.update({state: 2}, { where: {chatId: chatId}});

        await bot.sendMessage(chatId, 'Пришли ссылку на канал', options.TIME);
    } catch (e) {
        console.log('>>> err addChannel', e.message);
    }
}

const getMyChannels = async (chatId, bot, UserModel, ChannelModel) => {
    try {
        store.state_pos = 3;
        await UserModel.update({state: 3}, { where: {chatId: chatId}});

        await fillChannels(chatId, ChannelModel);
        await bot.sendMessage(chatId, 'Выбери где нужно занять место', options.CHANNELS);
    } catch (e) {
        console.log('>>> err getMyChannels', e.message);
    }
}

const selectChannel = async (chatId, bot) => {
    try {
        store.state_pos = 4;
        await User.update({state: 4}, { where: {chatId: chatId}});

        const firstDate = dayjs().format('DD.MM.YYYY');
        const secDate = dayjs().format('DD/MM/YYYY');
        const thirdDate = dayjs().format('DD-MM-YYYY');

        await bot.sendMessage(chatId, "Выбери кнопкой дату или пришли сюда в одном из форматов: "+ firstDate +", "+ secDate +", "+ thirdDate +"", options.DATE);
    } catch (e) {
        console.log('>>> err selectChannel', e.message);
    }
}

const selectPlace = async (dataTookPlaces, chatId, bot, success = false) => {
    try {
        if (success) {
            await bot.sendMessage(chatId, 'Пост успешно занят!' + emoji.white_check_mark);
        }
        console.log('>>> infoTookPlaces =', dataTookPlaces);


        store.state_pos = 5;
        await User.update({state: 5}, { where: {chatId: chatId}});

        const user = await User.findOne({ where: {chatId: chatId}});
        const channel = await Channel.findOne({ where: {chatId: user.selectedChannel}});

        await bot.sendMessage(chatId, "Канал: <b>"+ channel.name +"</b> \n" +
            "Дата: <b>"+ user.selectedDate +"</b> \n" +
            "\n" +
            "#1) "+ (dataTookPlaces.morning.time ? dataTookPlaces.morning.time + ' - занято' : '07:00 - 12:00 - свободно') + "\n" +
            "#2) "+ (dataTookPlaces.day.time ? dataTookPlaces.day.time + ' - занято' : '12:00 - 17:00 - свободно') + "\n" +
            "#3) "+ (dataTookPlaces.evening.time ? dataTookPlaces.evening.time + ' - занято' : '17:00 - 21:59 - свободно') + "\n" +
            "\n" +
            "Выберите время, чтобы занять его", options.placesInfoHandler(dataTookPlaces));
    } catch (e) {
        console.log('>>> err selectPlace', e.message);
    }
}


const selectTime = async (part, chatId, bot) => {
    try {
        store.state_pos = 6;
        await User.update({state: 6}, { where: {chatId: chatId}});

        await bot.sendMessage(chatId, "Теперь пришли время в формате: 02:23, в промежутке от " + viewValidTime(part), options.TIME);
    } catch (e) {
        console.log('>>> err selectPlace', e.message);

    }
}

const view_total = async (chatId, bot) => {
    try {
        store.state_pos = 7;
        await User.update({state: 7}, { where: {chatId: chatId}});
        const user = await User.findOne({ where: {chatId: chatId}});
        const channel = await Channel.findOne({ where: {chatId: user.selectedChannel}});

        await bot.sendMessage(chatId, "Канал: <b>"+ channel.name +"</b> \n" +
            "\n" +
            "Дата занятия поста: <b>"+ user.selectedDate +"</b> \n" +
            "Время: <b>"+ user.selectedTime +"</b> \n" +
            "Цена: <b>"+ (user.selectedCost ?? '') +"</b>\n" +
            "Комментарий: "+ (user.selectedComment ?? '') +"\n", options.TOTAL_INFO);
    } catch (e) {
        console.log('e view_total =', e.message);
    }
}

const addCost = async (chatId, bot) => {
    try {
        store.state_pos = 9;
        await User.update({state: 9}, { where: {chatId: chatId}});

        await bot.sendMessage(chatId, "Пришли цену, ограничение - 200 символов", options.TIME);
    } catch (e) {
        console.log('e addCost =', e.message);
    }
}

const addComment = async (chatId, bot) => {
    try {
        store.state_pos = 10;
        await User.update({state: 10}, { where: {chatId: chatId}});

        await bot.sendMessage(chatId, "Пришли комментарий, ограничение - 1000 символов ", options.TIME);
    } catch (e) {
        console.log('e addComment =', e.message);
    }
}

const getNearestPlaces = async (chatId, bot, ChannelModel) => {
    try {
        store.state_pos = 8;
        await User.update({state: 8}, { where: {chatId: chatId}});

        const text = await fillNearestPlaces(chatId, ChannelModel);

        await bot.sendMessage(chatId, text, options.MENU);

    } catch (e) {
        console.log('e =', e.message);
    }
}

const selectedTimeHandler = (part, time) => {
    const hour = time.split(':')[0];
    const minutes = time.split(':')[1];
    switch (part) {
        case 'morning': {
            if (hour >= 7 && hour < 12) {
                return 'morning';
            } else {
                return 'incorrect'
            }
        }
        case 'day': {
            if (hour >= 12 && hour < 17) {
                return 'morning';
            } else {
                return 'day'
            }
        }
        case 'evening': {
            if (hour >= 17 && hour < 22) {
                return 'evening';
            } else {
                return 'incorrect'
            }
        }
    }
}

const selectedPartHandler = (part) => {
    switch (part) {
        case 'get_morning': return 'morning';
        case 'get_day': return 'day';
        case 'get_evening': return 'evening';
        case 'get_morning_fast': return 'morning';
        case 'get_day_fast': return 'day';
        case 'get_evening_fast': return 'evening';
    }
}


module.exports.startBot = startBot;
module.exports.getMenu = getMenu;
module.exports.getMyChannels = getMyChannels;
module.exports.addChannel = addChannel;
module.exports.selectChannel = selectChannel;
module.exports.selectPlace = selectPlace;
module.exports.selectTime = selectTime;
module.exports.view_total = view_total;
module.exports.addCost = addCost;
module.exports.addComment = addComment;
module.exports.getNearestPlaces = getNearestPlaces;
module.exports.selectedTimeHandler = selectedTimeHandler;
module.exports.selectedPartHandler = selectedPartHandler;
