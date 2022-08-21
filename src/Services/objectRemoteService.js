const {upsert, fillChannels} = require("./objectService");
const {Channel, Order, User} = require("../models");
const {getMenu} = require("./objectLocalService");
const {v4} = require("uuid");
const {Model} = require("sequelize");
const {logger} = require("sequelize/lib/utils/logger");
const {DATE_MATCH} = require("../constants");

const addRemoteChannel = (name, chatId, UserModel, bot) => {
    const condition = {chatId: chatId};

    return upsert(name, condition, UserModel).then(async (res) => {
        console.log('success', JSON.stringify(res));
        await fillChannels(chatId, UserModel)
        await getMenu(chatId, bot, UserModel, {success: true});
    }).catch((err) => console.log('err1 =', err));
}

const getRemoteChannel = (chatId) => {
    return Channel
        .findOne({where: { chatId: chatId }})
        .then(channel => channel).catch(err => console.log('err = ', err))
}

const getRemoteChannels = (chatId, UserModel) => {
    return getDataUser(chatId, UserModel).then(async user => {
        const users = await UserModel.findAll();
        console.log(users.every(user => user instanceof UserModel)); // true
        console.log("All users:", JSON.stringify(users, null, 2));

        return JSON.parse(user.channels);
    })
}

const checkInfoTookPlaces = async (selectedChannel, selectedDate, chatId, bot) => {
    try {
        const channel = await Channel.findOne({ where: { chatId: selectedChannel } });

        const orders = await Order.findAll({ where: { chatId: selectedChannel, date: selectedDay}});

        const response = {
            date: '',
            morning:  {time: ''},
            day: {time: ''},
            evening: {time: ''}
        }

        if (!orders.length) { return response; }

        for (let order of orders) {
            if (order.done) { continue; }

            response.date = order.date;
            response[order.getPart] = { time: order.time };
        }

        return response;
    } catch (e) {
        console.log('e =', e.message);
        bot.sendMessage(chatId, 'Что-то пошло не так =' + e.message);
    }

}

const postRemotePlace = async (selectedChannel, selectedDay, selectedPart, selectedTime, bot, chatIdTrue) => {
    try {
        console.log('>>> selectedChannel =', selectedChannel);
        const channel = await Channel.findOne({ where: { chatId: selectedChannel } });
        console.log('123');
        //if (true//!channel[selectedDay]) {

        if (channel) {
            let data = '';
            const obj =  {get: selectedPart, time: selectedTime}

            if (channel[selectedDay] !== '') {
                data = '' + channel[selectedDay] + ';' + JSON.stringify(obj) + '';
            } else {
                console.log('else')
                data = '' + JSON.stringify(obj) + '';
            }

            const date = DATE_MATCH[selectedDay];
            const time = selectedTime;
            const getPart = selectedPart;

            const chatId = selectedChannel;

            await Order.create({chatId, date, time, getPart});
            await Channel.update({[selectedDay]: data}, {where: {chatId: selectedChannel}});
        } else {
            await bot.sendMessage(chatIdTrue, 'На это время место уже занято');
        }


    } catch (e) {
        bot.sendMessage(chatIdTrue, 'Что-то пошло не так =' + e.message);
    }
}

const postRemoteFreePlace = async (selectedChannel, selectedDay, selectedPart, bot, chatId) => {
    try {
        console.log('>>> selectedChannel =', selectedChannel);

        const date = DATE_MATCH[selectedDay];

        /*if (channel) {
            let data = '';
            //const obj =  {get: selectedPart, time: selectedTime}
            console.log('channel[selectedDay]=', channel[selectedDay]);
            const items = channel[selectedDay].split(';');
            for (let item of items) {
                if (item) {
                    item = JSON.parse(item);
                    if (item.get !== selectedPart) {
                        data += JSON.stringify(item) + ';'
                    }
                }
            }
            console.log('>>> data =', data);
            await Channel.update({[selectedDay]: data}, {where: {chatId: selectedChannel}});

        } else {
            await bot.sendMessage(chatId, 'На это время место уже занято');
        }*/
        await Order.update({done: true}, {where: {chatId: selectedChannel, date, getPart: selectedPart, done: false}})

    } catch (e) {
        console.log('e =', e.message);
        bot.sendMessage(chatId, 'Что-то пошло не так =' + e.message);
    }
}

const postRemoteSelectedChannelInUser = async (selectedChannelId, chatId) => {
    try {
        await User.update({
            selectedChannel: selectedChannelId,
            selectedCost: '',
            selectedComment: ''
        }, {where: {chatId}});
    } catch (e) {
        console.log('>>> Error postRemoteSelectedChannelInUser', e.message);
    }
}

const postRemoteSelectedDateInUser = async (selectedDate, chatId) => {
    try {
        await User.update({selectedDate: selectedDate}, {where: {chatId}})
    } catch (e) {
        console.log('>>> Error postRemoteSelectedDateInUser', e.message);
    }
}

const postRemoteSelectedTimeInUser = async (selectedTime, chatId) => {
    try {
        await User.update({selectedTime: selectedTime}, {where: {chatId}})
    } catch (e) {
        console.log('>>> Error postRemoteSelectedTimeInUser', e.message);
    }
}

const postRemoteSelectedOrderInUser = async (selectedOrderId, chatId) => {
    try {
        await User.update({selectedOrder: selectedOrderId}, {where: {chatId}})
    } catch (e) {
        console.log('>>> Error postRemoteSelectedOrderInUser', e.message);
    }
}

const postRemoteOrderCostInUser = async (cost, chatId) => {
    try {
        const user = await User.findOne({where: {chatId: chatId}});
        console.log('>>> userPost =', user);
        console.log('>>> selectedChannelId =', user.selectedChannel);
        await User.update({selectedCost: cost}, {where: {chatId: chatId}})
    } catch (e) {
        console.log('>>> Error postRemoteOrderCost', e.message);
    }
}

const postRemoteOrderCommentInUser = async (comment, chatId) => {
    try {
        const user = await User.findOne({where: {chatId: chatId}});
        console.log('>>> userPost =', user);
        console.log('>>> selectedChannelId =', user.selectedChannel);
        await User.update({selectedComment: comment}, {where: {chatId: chatId}})
    } catch (e) {
        console.log('>>> Error postRemoteOrderComment', e.message);
    }
}

module.exports.addRemoteChannel = addRemoteChannel;
module.exports.getRemoteChannel = getRemoteChannel;
module.exports.getRemoteChannels = getRemoteChannels;
module.exports.postRemotePlace = postRemotePlace;
module.exports.checkInfoTookPlaces = checkInfoTookPlaces;
module.exports.postRemoteFreePlace = postRemoteFreePlace;
module.exports.postRemoteSelectedChannelInUser = postRemoteSelectedChannelInUser;
module.exports.postRemoteSelectedDateInUser = postRemoteSelectedDateInUser;
module.exports.postRemoteSelectedTimeInUser = postRemoteSelectedTimeInUser;
module.exports.postRemoteSelectedOrderInUser = postRemoteSelectedOrderInUser;
module.exports.postRemoteOrderCostInUser = postRemoteOrderCostInUser;
module.exports.postRemoteOrderCommentInUser = postRemoteOrderCommentInUser;

