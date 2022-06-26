const options = require('../options');
const DATABASE = require('../tempDb').DATABASE;
const store = require('../store').store;

const startBot = async (chatId, bot) => {
    store.state_pos = 1;
    await bot.sendMessage(chatId, 'Привет! Моя цель - автоматизировать твою ручную работу по управлению информацией о рекламе в твоем канале',
        options.START_OPTIONS);
    //await bot.sendSticker(chatId, 'https://stickers.wiki/static/stickers/robocatbot/file_46751.gif');

    //TODO
    //const remoteChannels = await fetch('');
    const channels = DATABASE.uuidUser;

    for (const channel of Object.keys(DATABASE.uuidUser)) {
        options.CHANNELS.reply_markup = JSON.stringify({
            inline_keyboard: [
                ...JSON.parse(options.CHANNELS.reply_markup).inline_keyboard,
                [{text: channels[channel].name, callback_data: JSON.stringify({channel_id: channels[channel].id})}]
            ]
        });
    }

    options.CHANNELS.reply_markup = JSON.stringify({
        inline_keyboard: [
            ...JSON.parse(options.CHANNELS.reply_markup).inline_keyboard,
            [{text: 'Назад', callback_data: 'cancel'}]
        ]
    });
}

const getMyChannels = async (chatId, bot) => {
    store.state_pos = 2;
    await bot.sendMessage(chatId, 'Выбери где нужно занять место', options.CHANNELS);
}

const addChannel = async (chatId, bot) => {
    store.state_pos = 2;
    await bot.sendMessage(chatId, 'Введи название канала', options.startOptions);
}

const selectChannel = async (chatId, bot) => {
    store.state_pos = 3;
    await bot.sendMessage(chatId, "Выбери кнопкой дату или пришли время сюда в формате: 25.06.2022", options.DATE);
}

const selectPlace = async (chatId, bot) => {
    store.state_pos = 4;
    await bot.sendMessage(chatId, "Канал: Магические ручки \n" +
        "Дата: 2022-06-26 \n" +
        "\n" +
        "#1) 07:00 - 12:00 - свободно\n" +
        "#2) 12:00 - 17:00 - свободно\n" +
        "#3) 17:00 - 22:00 - свободно\n" +
        "\n" +
        "Выберите время, чтобы занять его", options.PLACES_INFO);
}


const selectTime = async (chatId, bot) => {
    store.state_pos = 5;

    await bot.sendMessage(chatId, "Теперь пришли время в формате: 02:23, в промежутке от 07:00 до 12:00", options.TIME);
}

const view_total = async (chatId, bot) => {
    store.state_pos = 6;

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
module.exports.getMyChannels = getMyChannels;
module.exports.addChannel = addChannel;
module.exports.selectChannel = selectChannel;
module.exports.selectPlace = selectPlace;
module.exports.selectTime = selectTime;
module.exports.view_total = view_total;
module.exports.sendSuccessResult = sendSuccessResult;
