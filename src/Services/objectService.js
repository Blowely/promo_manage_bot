const {v4} = require("uuid");
const options = require("../options");
const {Order} = require("../models");
const {DATE_MATCH} = require("../constants");
const {emoji} = require("node-emoji");
const Channel = require("../models").Channel;

const upsert = async (name, condition, Model) => {
    const chatId = v4();
    //const chatId = condition.chatId;
    const user = await Model.findOne({ where: condition });

    const deleted = false;
    if (!user) {
        console.log('Пользователь не найден!')
    }

    let data = '';
    if (user.channels !== '') {
        console.log('here');
        const splitStr = user.channels.split(',');

        data = '' + user.channels + ',' + chatId + '';
    } else {
        console.log('else')
        data = '' + chatId + '';
    }
    console.log('data =', data);

    await Model.update({channels: data}, {where: condition});

    return await Channel.create({chatId, name});

    /*return Channel.destroy({
        where: {},
        truncate: true
    })*/
}

const getUserChannels = async (chatId, UserModel) => {
    try {
        const channels = [];

        const user = await UserModel.findOne({where:{chatId: chatId}});
        console.log('>>> user =', user);

        if (user && user.channels) {
            const userChannels = user.channels.split(',');

            for (const channel of userChannels) {
                const foundChannel = await Channel.findOne({where:{chatId: channel}});
                if (foundChannel) { channels.push(foundChannel.dataValues) }
            }
        }

        return channels;
    } catch (e) {
        console.log('>>> e getUserChannels =', e.message);
    }
}

const fillChannels = async (chatId, UserModel) => {
    try {
        const orders = await Order.findAll();
        console.log('>>> orders =', orders);

        options.CHANNELS.reply_markup = JSON.stringify({
            inline_keyboard: []
        })

        const channels = await getUserChannels(chatId,UserModel);

        if (channels.length > 0) {
            options.CHANNELS.reply_markup = JSON.stringify({inline_keyboard: []});

            for (const channel of channels) {
                options.CHANNELS.reply_markup = JSON.stringify({
                    inline_keyboard: [
                        ...JSON.parse(options.CHANNELS.reply_markup).inline_keyboard,
                        [{text: channel.name, callback_data: JSON.stringify({channel_id: channel.chatId})}]
                    ]
                });
            }

            options.CHANNELS.reply_markup = JSON.stringify({
                inline_keyboard: [
                    ...JSON.parse(options.CHANNELS.reply_markup).inline_keyboard,
                    [{text: emoji.arrow_left + 'Назад', callback_data: 'cancel'}]
                ]
            });
        }

        return options.CHANNELS.reply_markup;
    } catch (e) {
        console.log('>>> Error FillChannels =', e.message);
    }
}

const ordersHandler = async (date, channelChatId, channelName) => {
    try {
        const day = {};

        const orders = await Order.findAll({
            where: {
                chatId: channelChatId,
                done: false,
                date: DATE_MATCH[date]
            }
        })

        day.name = channelName;

        if (!orders.length) { return day; }

        for (let order of orders) {
            switch (order.getPart) {
                case 'morning': {
                    day.morning = 'morning'; break;
                }
                case 'day': {
                    day.day = 'day'; break;
                }
                case 'evening': {
                    day.evening = 'evening'; break;
                }
            }
        }

        return day;
    } catch (e) {
        console.log('>>> Error ordersHandler', e.message);
    }

}

const viewChannelsInNearPlaces = (channelsInDay) => {
    try {
        let res = ''

        const channelNames = Object.keys(channelsInDay);

        for (let i = 0; i < channelNames.length; i++) {
            res += '<b>'+ channelsInDay[channelNames[i]].name + '</b>: ' + (channelsInDay[channelNames[i]].hasOwnProperty('morning') ? '' : ' утро') +
                ' ' + (channelsInDay[channelNames[i]].hasOwnProperty('day') ? '' : 'день') +
                ' ' + (channelsInDay[channelNames[i]].hasOwnProperty('evening') ? '' : 'вечер') + '\n';
        }
        console.log('>>> resView =', res);
        return res;
    } catch (e) {
        console.log('>>> Error viewChannelsInNearPlaces', e.message);
    }

}

const fillNearestPlaces = async (chatId, UserModel) => {
    try {
        const channels = await getUserChannels(chatId,UserModel);

        let todayChannels = {};
        let tomorrowChannels = {};
        let af_tmrwChannels = {};
        console.log('>>> channelsHere =', channels);
        for (let channel of channels) {
            todayChannels[channel.chatId] = await ordersHandler('today', channel.chatId, channel.name)
            tomorrowChannels[channel.chatId] = await ordersHandler('tomorrow', channel.chatId, channel.name)
            af_tmrwChannels[channel.chatId] = await ordersHandler('af_tmrw', channel.chatId, channel.name)
        }


        const res = "Ближайшие места \n" +
            "\n" +
            "<b>Сегодня ("+ DATE_MATCH['today'] +")</b> \n" +
            "\n" +
            ""+ viewChannelsInNearPlaces(todayChannels) +" \n" +
            "<b>Завтра ("+ DATE_MATCH['tomorrow'] +")</b> \n" +
            "\n" +
            ""+ viewChannelsInNearPlaces(tomorrowChannels) +" \n" +
            "<b>Послезавтра ("+ DATE_MATCH['af_tmrw'] +")</b> \n" +
            "\n" +
            ""+ viewChannelsInNearPlaces(af_tmrwChannels) +" \n";

        console.log('>>> resEnd =', res);

        return res;
    } catch (e) {
        console.log('>>> Error FillChannels =', e.message);
    }
}


module.exports.upsert = upsert;
module.exports.fillChannels = fillChannels;
module.exports.fillNearestPlaces = fillNearestPlaces;
