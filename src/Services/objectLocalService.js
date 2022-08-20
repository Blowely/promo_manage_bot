const options = require('../options');
const {logger} = require("sequelize/lib/utils/logger");
const {fillChannels, fillNearestPlaces} = require("./objectService");
const moment = require("moment");
const dayjs = require("dayjs");
const {viewValidTime} = require("../utils");
const {DATE_MATCH} = require("../constants");
const {User} = require("../models");

const store = require('../store').store;
const Channel = require("../models").Channel;

var emoji = require('node-emoji').emoji;


const startBot = async (chatId, bot, UserModel) => {
    try {
        store.state_pos = 1;
        await bot.sendMessage(chatId, 'Привет! Моя цель - автоматизировать твою ручную работу по управлению информацией о рекламе в твоем канале',
            options.START_OPTIONS);

        const user = await UserModel.findOne({ where: {chatId: chatId}});
        console.log('userChannels =', user.dataValues);

        return await fillChannels(chatId, UserModel);
    } catch (e) {
        console.log('e1 =',e);
    }
}

const getMenu = async (chatId, bot, UserModel, option) => {
    console.log('>>> getMenuFunc is called');
    store.state_pos = 1;
    if (option?.success) {
        await bot.sendMessage(chatId, 'Канал успешно добавлен ' + emoji.white_check_mark);
        return await bot.sendMessage(chatId, 'Меню', options.START_OPTIONS);
    }
    return await bot.sendMessage(chatId, 'Меню',
        options.START_OPTIONS);
}

const addChannel = async (chatId, bot, UserModel) => {
    store.state_pos = 2;
    await bot.sendMessage(chatId, 'Введи название канала', options.startOptions);
}

const getMyChannels = async (chatId, bot) => {
    store.state_pos = 3;
    await fillChannels(chatId, User);
    await bot.sendMessage(chatId, 'Выбери где нужно занять место', options.CHANNELS);
}

const selectChannel = async (chatId, bot) => {
    store.state_pos = 4;
    await bot.sendMessage(chatId, "Выбери кнопкой дату или пришли время сюда в формате: 25.06.2022", options.DATE);
}

const selectPlace = async (infoTookPlaces, selectedChannelName, selectedDay, chatId, bot, success = false) => {
    if (success) {
        await bot.sendMessage(chatId, 'Пост успешно занят!');
    }
    console.log('>>> infoTookPlaces =', infoTookPlaces);

    store.state_pos = 5;

    await bot.sendMessage(chatId, "Канал: "+ selectedChannelName +" \n" +
        "Дата: "+ DATE_MATCH[selectedDay] +" \n" +
        "\n" +
        "#1) "+ (infoTookPlaces.morning.time ? infoTookPlaces.morning.time + ' - занято' : '07:00 - 12:00 - свободно') + "\n" +
        "#2) "+ (infoTookPlaces.day.time ? infoTookPlaces.day.time + ' - занято' : '12:00 - 17:00 - свободно') + "\n" +
        "#3) "+ (infoTookPlaces.evening.time ? infoTookPlaces.evening.time + ' - занято' : '17:00 - 21:59 - свободно') + "\n" +
        "\n" +
        "Выберите время, чтобы занять его", options.placesInfoHandler(infoTookPlaces));
}


const selectTime = async (part, chatId, bot) => {
    store.state_pos = 6;

    await bot.sendMessage(chatId, "Теперь пришли время в формате: 02:23, в промежутке от " + viewValidTime(part), options.TIME);
}

const view_total = async (selectedChannelName, selectedDay, selectedTime, chatId, bot) => {
    try {
        store.state_pos = 7;

        await bot.sendMessage(chatId, "Канал: "+ selectedChannelName +" \n" +
            "\n" +
            "Дата занятия поста: "+ DATE_MATCH[selectedDay] +" \n" +
            "Время: "+ selectedTime +" \n" +
            "Цена - нет\n" +
            "Комментарий - нет\n", options.TOTAL_INFO);
    } catch (e) {
        console.log('e =', e.message);
    }
}

const getNearestPlaces = async (chatId, bot, UserModel) => {
    try {
        store.state_pos = 8;

        const text = await fillNearestPlaces(chatId, UserModel);

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
module.exports.getNearestPlaces = getNearestPlaces;
module.exports.selectedTimeHandler = selectedTimeHandler;
module.exports.selectedPartHandler = selectedPartHandler;
