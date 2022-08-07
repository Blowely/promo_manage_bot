const options = require('../options');
const {logger} = require("sequelize/lib/utils/logger");
const {fillChannels} = require("./objectService");
const moment = require("moment");
const dayjs = require("dayjs");

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
        console.log('e =',e);
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
    await bot.sendMessage(chatId, 'Выбери где нужно занять место', options.CHANNELS);
}

const selectChannel = async (chatId, bot) => {
    store.state_pos = 4;
    await bot.sendMessage(chatId, "Выбери кнопкой дату или пришли время сюда в формате: 25.06.2022", options.DATE);
}

const selectPlace = async (infoTookPlaces, chatId, bot) => {
    store.state_pos = 5;
    await bot.sendMessage(chatId, "Канал: Магические ручки \n" +
        "Дата: "+ dayjs().format('DD MMMM YYYY') +" \n" +
        "\n" +
        "#1) "+ (infoTookPlaces.morning.time ? infoTookPlaces.morning.time + ' - занято' : '07:00 - 12:00 - свободно') + "\n" +
        "#2) "+ (infoTookPlaces.day.time ? infoTookPlaces.day.time + ' - занято' : '12:00 - 17:00 - свободно') + "\n" +
        "#3) "+ (infoTookPlaces.evening.time ? infoTookPlaces.evening.time + ' - занято' : '17:00 - 22:00 - свободно') + "\n" +
        "\n" +
        "Выберите время, чтобы занять его", options.placesInfoHandler(infoTookPlaces));
}


const selectTime = async (chatId, bot) => {
    store.state_pos = 6;

    await bot.sendMessage(chatId, "Теперь пришли время в формате: 02:23, в промежутке от 07:00 до 12:00", options.TIME);
}

const view_total = async (chatId, bot) => {
    store.state_pos = 7;

    await bot.sendMessage(chatId, "Канал: Магические ручки \n" +
        "\n" +
        "Дата занятия поста: 2022-06-26 \n" +
        "Время: 08:00 \n" +
        "Цена - нет\n" +
        "Комментарий - нет\n", options.TOTAL_INFO);
}

const sendSuccessResult = async (chatId, bot) => {
    await bot.sendMessage(chatId, 'Пост успешно занят!');
    await bot.sendMessage(chatId, "Канал: Магические ручки \n" +
        "Дата: 2022-06-26 \n" +
        "\n" +
        "#1) 8:00 - занято\n" +
        "#2) 12:00 - 17:00 - свободно\n" +
        "#3) 17:00 - 22:00 - свободно\n" +
        "\n" +
        "Выберите время, чтобы занять его", options.RESULT_INFO);
}




module.exports.startBot = startBot;
module.exports.getMenu = getMenu;
module.exports.getMyChannels = getMyChannels;
module.exports.addChannel = addChannel;
module.exports.selectChannel = selectChannel;
module.exports.selectPlace = selectPlace;
module.exports.selectTime = selectTime;
module.exports.view_total = view_total;
module.exports.sendSuccessResult = sendSuccessResult;
