const options = require('../options');
const DATABASE = require('../tempDb').DATABASE;

const startBot = async (chatId, bot) => {
    await bot.sendMessage(chatId, 'Привет! Моя цель - автоматизировать твою ручную работу по управлению информацией о рекламе в твоем канале',
        options.START_OPTIONS);
    await bot.sendSticker(chatId, 'https://stickers.wiki/static/stickers/robocatbot/file_46751.gif');

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

    await bot.sendMessage(chatId, 'Выбери где нужно занять место', options.CHANNELS);
}

const addChannel = async (chatId, bot) => {
    await bot.sendMessage(chatId, 'Введи название канала', options.startOptions);
}



module.exports.startBot = startBot;
module.exports.getMyChannels = getMyChannels;
module.exports.addChannel = addChannel;
