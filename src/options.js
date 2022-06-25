const START_OPTIONS = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Мои каналы", callback_data: "/my_channels"},{text:"Добавить канал", callback_data: "/add_channel"}],
            [{text:"Выберите канал2", callback_data: "3"}]
        ]
    })
}

module.exports.START_OPTIONS = START_OPTIONS;