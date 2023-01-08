const {v4} = require("uuid");
const options = require("../options");
const {Order, ChannelModel} = require("../models");
const {DATE_MATCH} = require("../constants");
const {emoji} = require("node-emoji");
const dayjs = require("dayjs");
const Channel = require("../models").Channel;

const upsert = async (name, condition, UserModel, ChannelModel) => {
    const generatedId = v4();
    //const chatId = condition.chatId;
    const user = await UserModel.findOne({ where: condition });
    console.log('12312')
    const userChannels = await ChannelModel.findAll({ where: { chatId: condition?.chatId.toString() }});
    console.log('userChannels =', userChannels);

    const deleted = false;
    if (!user) {
        console.log('Пользователь не найден!')
    }

    return await Channel.create({
        chatId: condition.chatId,
        name: user.selectedChannelName,
        link: user.selectedLink,
        countPlaces: user.selectedCountPlaces
    });

    /*return Channel.destroy({
        where: {},
        truncate: true
    })*/
}

const getUserChannels = async (chatId, ChannelModel) => {
    try {
        const channels = [];

        if (chatId) {
            const userChannels = await ChannelModel.findAll({where:{chatId: chatId}});
            return userChannels;
        }

        return channels;
    } catch (e) {
        console.log('>>> e getUserChannels =', e.message);
    }
}

const fillChannels = async (chatId, ChannelModel, messageId) => {
    try {
        options.CHANNELS.reply_markup = JSON().stringify({
            inline_keyboard: []
        })

        const channels = await getUserChannels(chatId, ChannelModel);

        if (channels?.length > 0) {
            options.CHANNELS.reply_markup = JSON().stringify({inline_keyboard: []});

            for (const channel of channels) {
                options.CHANNELS.reply_markup = JSON().stringify({
                    inline_keyboard: [
                        ...JSON().parse(options.CHANNELS.reply_markup).inline_keyboard,
                        [{text: channel.name, callback_data: JSON().stringify({channel_id: channel.chatId, editMessageId: messageId})}]
                    ]
                });
            }

        }

        options.CHANNELS.reply_markup = JSON().stringify({
            inline_keyboard: [
                ...JSON().parse(options.CHANNELS.reply_markup).inline_keyboard,
                [{text: emoji.arrow_left + 'Назад', callback_data: JSON().stringify({toPage: "/menu", editMessageId: messageId})}]
            ]
        });

        return options.CHANNELS.reply_markup;
    } catch (e) {
        console.log('>>> Error FillChannels =', e.message);
    }
}

const ordersHandler = async (date, channelChatId, channelName, link) => {
    try {
        const day = {};

        const orders = await Order.findAll({
            where: {
                chatId: channelChatId,
                done: false,
                date: DATE_MATCH[date] ?? date
            }
        })

        day.name = channelName;
        day.link = link;

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
            const link = channelsInDay[channelNames[i]].link;
            res += '<a href="'+ link +'">'+ channelsInDay[channelNames[i]].name + '</a>: ' + (channelsInDay[channelNames[i]].hasOwnProperty('morning') ? '' : ' утро') +
                ' ' + (channelsInDay[channelNames[i]].hasOwnProperty('day') ? '' : 'день') +
                ' ' + (channelsInDay[channelNames[i]].hasOwnProperty('evening') ? '' : 'вечер') + '\n';
        }
        console.log('>>> resView =', res);
        return res;
    } catch (e) {
        console.log('>>> Error viewChannelsInNearPlaces', e.message);
    }

}

const fillNearestPlaces = async (chatId, ChannelModel) => {
    try {
        const channels = await getUserChannels(chatId, ChannelModel);

        if (!channels?.length) {
            return "";
        }

        let todayChannels = {};
        let tomorrowChannels = {};
        let af_tmrwChannels = {};
        let af_tmrwChannelsN1 = {};
        let af_tmrwChannelsN2 = {};

        const afN1 = dayjs().add(3, 'day').format('DD/MM/YYYY');
        const afN2 = dayjs().add(4, 'day').format('DD/MM/YYYY');

        console.log('>>> channelsHere =', channels);
        for (let channel of channels) {
            todayChannels[channel.chatId] = await ordersHandler('today', channel.chatId, channel.name, channel.link)
            tomorrowChannels[channel.chatId] = await ordersHandler('tomorrow', channel.chatId, channel.name, channel.link)
            af_tmrwChannels[channel.chatId] = await ordersHandler('af_tmrw', channel.chatId, channel.name, channel.link)
            af_tmrwChannelsN1[channel.chatId] = await ordersHandler(afN1, channel.chatId, channel.name, channel.link)
            af_tmrwChannelsN2[channel.chatId] = await ordersHandler(afN2, channel.chatId, channel.name, channel.link)
        }


        const res = "<b>БЛИЖАЙШИЕ МЕСТА</b> \n" +
            "\n" +
            "<b>Сегодня ("+ DATE_MATCH['today'] +")</b>" +
            "\n" +
            ""+ viewChannelsInNearPlaces(todayChannels) +" \n" +
            "<b>Завтра ("+ DATE_MATCH['tomorrow'] +")</b>" +
            "\n" +
            ""+ viewChannelsInNearPlaces(tomorrowChannels) +" \n" +
            "<b>Послезавтра ("+ DATE_MATCH['af_tmrw'] +")</b>" +
            "\n" +
            ""+ viewChannelsInNearPlaces(af_tmrwChannels) +" \n" +
            "<b>("+ afN1 +")</b>" +
            "\n" +
            ""+ viewChannelsInNearPlaces(af_tmrwChannelsN1) +" \n" +
            "<b>("+ afN2 +")</b>" +
            "\n" +
            ""+ viewChannelsInNearPlaces(af_tmrwChannelsN2) +" \n";

        console.log('>>> resEnd =', res);

        return res;
    } catch (e) {
        console.log('>>> Error FillChannels =', e.message);
    }
}


module.exports.upsert = upsert;
module.exports.fillChannels = fillChannels;
module.exports.fillNearestPlaces = fillNearestPlaces;
