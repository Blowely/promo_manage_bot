const options = require('../options');

const startBot = async (chatId, bot) => {
    await bot.sendMessage(chatId, 'Привет! Моя цель - автоматизировать твою ручную работу по управлению информацией о рекламе в твоем канале',
        options.START_OPTIONS);
    await bot.sendSticker(chatId, 'https://stickers.wiki/static/stickers/robocatbot/file_46751.gif');
}

const getMyChannels = async (chatId, bot) => {
    await bot.sendMessage(chatId, 'Твои каналы', options.START_OPTIONS);
}

const addChannel = async (chatId, bot) => {
    await bot.sendMessage(chatId, 'Введи название канала', options.startOptions);
}



module.exports.startBot = startBot;
module.exports.getMyChannels = getMyChannels;
module.exports.addChannel = addChannel;
