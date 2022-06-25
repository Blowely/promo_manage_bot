const START_OPTIONS = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Мои каналы", callback_data: "/my_channels"},{text:"Добавить канал", callback_data: "/add_channel"}],
        ]
    })
}

const CHANNELS = {
    reply_markup: JSON.stringify({
        inline_keyboard: []
    })
}

module.exports.START_OPTIONS = START_OPTIONS;
module.exports.CHANNELS = CHANNELS;