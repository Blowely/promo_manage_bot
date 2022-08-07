const dayjs = require("dayjs");

const TG_COMMANDS = {
    '/start': '/start',
    '/info': '/info',
}

const FAST_TIME = {
    morning: '07:00',
    day: '12:00',
    evening: '17:00'
}

const DATE_MATCH = {
    'today': dayjs().format('DD/MM/YYYY'),
    'tomorrow': dayjs().add(1, 'day').format('DD/MM/YYYY'),
    'af_tmrw': dayjs().add(2, 'day').format('DD/MM/YYYY'),
}

module.exports.TG_COMMANDS = TG_COMMANDS;
module.exports.FAST_TIME = FAST_TIME;
module.exports.DATE_MATCH = DATE_MATCH;