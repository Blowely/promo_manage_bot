const START_OPTIONS = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Мои каналы", callback_data: "/my_channels"},{text:"Добавить канал", callback_data: "/add_channel"}],
            [{text:"Ближайшие места", callback_data: "/my_channels"}],
        ]
    })
}

const CHANNELS = {
    reply_markup: JSON.stringify({
        inline_keyboard: []
    })
}

const DATE = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Сегодня", callback_data: JSON.stringify({date: 'today'})},
                {text:"Завтра", callback_data: JSON.stringify({date: 'tomorrow'})},
                {text:"Послезавтра", callback_data: JSON.stringify({date: 'next_tomorrow'})}],
            [{text:"Назад", callback_data: "cancel"}, {text:"Помощь", callback_data: "/help"}]
        ]
    })
}

const PLACES_INFO = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Занять подробно 07:00 - 12:00", callback_data: JSON.stringify({get: 'get_morning'})},
                {text:"Занять быстро 07:00 - 12:00 ", callback_data:  JSON.stringify({get_fast: 'get_morning_fast'})}],
            [{text:"Занять подробно 12:00 - 17:00 ", callback_data: JSON.stringify({get: 'get_day'})},
                {text:"Занять быстро 12:00 - 17:00 ", callback_data:  JSON.stringify({get_fast: 'get_morning_fast'})}],
            [{text:"Занять подробно 17:00 - 22:00 ", callback_data: JSON.stringify({get: 'get_evening'})},
                {text:"Занять быстро 17:00 - 22:00 ", callback_data:  JSON.stringify({get_fast: 'get_morning_fast'})}],
            [{text:"Выбрать другую дату", callback_data: 'revoke'}]
        ]
    })
}

const TIME = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Отмена", callback_data: 'revoke'}]
        ]
    })
}

const TOTAL_INFO = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Сохранить", callback_data: JSON.stringify({save: Date.now()})},
                {text:"Отмена", callback_data: JSON.stringify({cancel: {from_state_pos: 6}})}],
            [{text:"Добавить цену", callback_data: "add_cost"},{text:"Добавить комментарий", callback_data: "add_comment"}],
        ]
    })
}

const RESULT_INFO = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text:"Освободить 8:00", callback_data: JSON.stringify({give_away: 'give_away_morning'})}],
            [{text:"Занять подробно 12:00 - 17:00 ", callback_data: JSON.stringify({get: 'get_day'})},
                {text:"Занять быстро 12:00 - 17:00 ", callback_data:  JSON.stringify({get_fast: 'get_morning_fast'})}],
            [{text:"Занять подробно 17:00 - 22:00 ", callback_data: JSON.stringify({get: 'get_evening'})},
                {text:"Занять быстро 17:00 - 22:00 ", callback_data:  JSON.stringify({get_fast: 'get_morning_fast'})}],
            [{text:"Выбрать другую дату", callback_data: 'revoke'}],
            [{text:"Вернуться в меню", callback_data: 'back_to_menu'}]
        ]
    })
}

module.exports.START_OPTIONS = START_OPTIONS;
module.exports.CHANNELS = CHANNELS;
module.exports.DATE = DATE;
module.exports.PLACES_INFO = PLACES_INFO;
module.exports.TIME = TIME;
module.exports.TOTAL_INFO = TOTAL_INFO;
module.exports.RESULT_INFO = RESULT_INFO;
