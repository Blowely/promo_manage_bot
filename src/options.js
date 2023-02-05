const {infoTookPlaces} = require("./index.js");
const {emoji} = require("node-emoji");
const {JSON} = require("sequelize");

const getStartOptionsWithMessageId = (messageId) => ({
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [
                {text: emoji.scroll + "Мои каналы", callback_data: JSON().stringify(
                {toPage: "/my_channels", editMessageId: messageId})},
                {text:emoji.heavy_plus_sign + "Добавить канал", callback_data: JSON().stringify(
                {toPage: "/add_channel", editMessageId: messageId})}
            ],
            [{text: emoji.date + "Ближайшие места", callback_data: "/near"},
                {text: emoji.cd + "Импорт/Экспорт данных", callback_data: JSON().stringify({toPage: "/import_export", editMessageId: messageId})}],
        ]
    })
})

const START_OPTIONS = {
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text: emoji.scroll + "Мои каналы", callback_data: "/my_channels"},{text:emoji.heavy_plus_sign + "Добавить канал", callback_data: "/add_channel"}],
            [{text: emoji.date + "Ближайшие места", callback_data: "/near"}, {text: emoji.cd + "Импорт/Экспорт данных", callback_data: "/import_export"}],
        ]
    })
}

const CHANNELS = {
    reply_markup: JSON().stringify({
        inline_keyboard: []
    })
}

const getImportExportOptions = (messageId) => ({
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text:"Импорт", callback_data: JSON().stringify({toPage: '/import', editMessageId: messageId})},
                {text:"Экспорт", callback_data: JSON().stringify({toPage: '/export', editMessageId: messageId})}],
            [{text:emoji.arrow_left + "Назад", callback_data: JSON().stringify({toPage: "/menu", editMessageId: messageId})}]
        ]
    })
})

const getImportOptions = (messageId) => ({
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text:"Скачать шаблон", callback_data: JSON().stringify({toPage: '/download', editMessageId: messageId})},
                {text:"Отправить шаблон", callback_data: JSON().stringify({toPage: '/upload', editMessageId: messageId})}],
            [{text:emoji.arrow_left + "Назад", callback_data: JSON().stringify({toPage: "/import_export", editMessageId: messageId})}]
        ]
    })
})


const getDateWithMessageId = (messageId) => ({
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text:"Сегодня", callback_data: JSON().stringify({date: 'today', editMessageId: messageId})},
                {text:"Завтра", callback_data: JSON().stringify({date: 'tomorrow', editMessageId: messageId})},
                {text:"Послезавтра", callback_data: JSON().stringify({date: 'af_tmrw', editMessageId: messageId})}],
            [{text:emoji.arrow_left + "Назад", callback_data: JSON().stringify({toPage: "/my_channels", editMessageId: messageId})},
                {text:emoji.grey_question + "Помощь", callback_data: JSON().stringify({toPage: "/help", editMessageId: messageId})}]
        ]
    })
})

const DATE = {
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text:"Сегодня", callback_data: JSON().stringify({date: 'today'})},
                {text:"Завтра", callback_data: JSON().stringify({date: 'tomorrow'})},
                {text:"Послезавтра", callback_data: JSON().stringify({date: 'af_tmrw'})}],
            [{text:emoji.arrow_left + "Назад", callback_data: "cancel"}, {text:emoji.grey_question + "Помощь", callback_data: "help"}]
        ]
    })
}

let PLACES_INFO = {};

const placesInfoHandler = (infoTookPlaces, messageId) => {
    const morning = infoTookPlaces.morning.time ? [{text:"Освободить " + infoTookPlaces.morning.time, callback_data: JSON().stringify({get_out: 'get_out_morning'})}] :
        [{text:"Занять подробно 07:00 - 12:00", callback_data: JSON().stringify({get: 'get_morning'})},
            {text:"Занять быстро 07:00 - 12:00 ", callback_data:  JSON().stringify({get_fast: 'get_morning_fast'})}];

    const day = infoTookPlaces.day.time ? [{text:"Освободить " + infoTookPlaces.day.time, callback_data: JSON().stringify({get_out: 'get_out_day'})}] :
        [{text:"Занять подробно 12:00 - 17:00 ", callback_data: JSON().stringify({get: 'get_day'})},
            {text:"Занять быстро 12:00 - 17:00 ", callback_data:  JSON().stringify({get_fast: 'get_day_fast'})}];

    const evening = infoTookPlaces.evening.time ? [{text:"Освободить " + infoTookPlaces.evening.time, callback_data: JSON().stringify({get_out: 'get_out_evening'})}] :
            [{text:"Занять подробно 17:00 - 21:59 ", callback_data: JSON().stringify({get: 'get_evening'})},
                {text:"Занять быстро 17:00 - 21:59 ", callback_data:  JSON().stringify({get_fast: 'get_evening_fast'})}];

    return {
        parse_mode: 'html',
        reply_markup: JSON().stringify({
            inline_keyboard: [
                morning,
                day,
                evening,
                [{text: emoji.date + "Выбрать другую дату", callback_data: JSON().stringify({toPage: "/select_channel", editMessageId: messageId})}]
            ]
        })
    }
}

const getRevokeOption = (editMessageId) => {
    return {
        reply_markup: JSON().stringify({
            inline_keyboard: [
                [{text: emoji.no_entry_sign + "Отмена", callback_data: JSON().stringify({toPage: "/menu", editMessageId: editMessageId})}]
            ]
        })
    }
}

const TIME = {
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text: emoji.no_entry_sign + "Отмена", callback_data: 'revoke'}]
        ]
    })
}

const MENU = {
    parse_mode: 'html',
    disable_web_page_preview: 'True',
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text: emoji.house + "Вернуться в меню", callback_data: 'back_to_menu'}]
        ]
    })
}

const TOTAL_INFO = {
    parse_mode: 'html',
    reply_markup: JSON().stringify({
        inline_keyboard: [
            [{text:emoji.floppy_disk + "Сохранить", callback_data: JSON().stringify({save: Date.now()})},
                {text:emoji.no_entry_sign + "Отмена", callback_data: 'cancel'}],
            [{text: emoji.moneybag + "Добавить цену", callback_data: JSON().stringify({add_cost: 'add_cost'})},
                {text: emoji.pencil + "Добавить комментарий", callback_data: JSON().stringify({add_comment: 'add_comment'})}],
        ]
    })
}


module.exports.START_OPTIONS = START_OPTIONS;
module.exports.getStartOptionsWithMessageId = getStartOptionsWithMessageId;
module.exports.getImportExportOptions = getImportExportOptions;
module.exports.getImportOptions = getImportOptions;
module.exports.CHANNELS = CHANNELS;
module.exports.DATE = DATE;
module.exports.getDateWithMessageId = getDateWithMessageId;
module.exports.PLACES_INFO = PLACES_INFO;
module.exports.placesInfoHandler = placesInfoHandler;
module.exports.TIME = TIME;
module.exports.getRevokeOption = getRevokeOption;
module.exports.TOTAL_INFO = TOTAL_INFO;
module.exports.MENU = MENU;
