const {upsert, fillChannels} = require("./objectService");
const {Channel, Order, User} = require("../models");
const {getMenu} = require("./objectLocalService");
const {DATE_MATCH, parts} = require("../constants");
const {checkValidTime} = require("../utils");

const addRemoteChannel = (name, chatId, editMessageIds, UserModel, ChannelModel, bot) => {
    const condition = {chatId: chatId};

    return upsert(name, condition, UserModel, ChannelModel).then(async (res) => {
        console.log('success', JSON.stringify(res));
        await fillChannels(chatId, ChannelModel)
        await getMenu(chatId, bot, UserModel, {success: true}, editMessageIds[0]);
    }).catch((err) => console.log('err1 =', err));
}

const checkInfoTookPlaces = async (selectedChannel, selectedDate, chatId, bot) => {
    try {
        const orders = await Order.findAll({ where: { chatId: selectedChannel, date: selectedDate}});

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
        console.log('e checkInfoTookPlaces =', e.message);
        bot.sendMessage(chatId, 'Что-то пошло не так =' + e.message);
    }

}

const postRemotePlace = async (selectedChannel, selectedDay, selectedPart, selectedTime, bot, chatIdTrue) => {
    try {
        console.log('>>> selectedChannel =', selectedChannel);
        const channel = await Channel.findOne({ where: { chatId: selectedChannel } });

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



            const user = await User.findOne({ where: {chatId: chatIdTrue}});
            let getPart = '';

            for (const part of parts) {
                if (checkValidTime(user.selectedTime, part)) {
                    getPart = part;
                    break;
                }
            }

            await User.update({selectedCost: '', selectedComment: ''}, {where: {chatId: chatIdTrue}});

            const chatId = user.selectedChannel;

            await Order.create({chatId, date: user.selectedDate, time: user.selectedTime, getPart, cost: user.selectedCost, comment: user.selectedComment});
            await Channel.update({[selectedDay]: data}, {where: {chatId: user.selectedChannel}});
        } else {
            console.log('>>> e postRemotePlace', e.message);
            await bot.sendMessage(chatIdTrue, 'На это время место уже занято');
        }


    } catch (e) {
        console.log('e postRemotePlace =', e.message);
        bot.sendMessage(chatIdTrue, 'Что-то пошло не так =' + e.message);
    }
}

const postRemoteFreePlace = async (selectedChannel, selectedDay, selectedPart, bot, chatId) => {
    try {
        console.log('>>> selectedChannel =', selectedChannel);
        const date = DATE_MATCH[selectedDay];

        await Order.update({done: true}, {where: {chatId: selectedChannel, date, getPart: selectedPart, done: false}})
    } catch (e) {
        console.log('e postRemoteFreePlace =', e.message);
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
module.exports.postRemotePlace = postRemotePlace;
module.exports.checkInfoTookPlaces = checkInfoTookPlaces;
module.exports.postRemoteFreePlace = postRemoteFreePlace;
module.exports.postRemoteSelectedChannelInUser = postRemoteSelectedChannelInUser;
module.exports.postRemoteSelectedDateInUser = postRemoteSelectedDateInUser;
module.exports.postRemoteSelectedTimeInUser = postRemoteSelectedTimeInUser;
module.exports.postRemoteSelectedOrderInUser = postRemoteSelectedOrderInUser;
module.exports.postRemoteOrderCostInUser = postRemoteOrderCostInUser;
module.exports.postRemoteOrderCommentInUser = postRemoteOrderCommentInUser;

