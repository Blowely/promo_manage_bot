const {upsert, fillChannels} = require("./objectService");
const {Channel, Order} = require("../models");
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

const checkInfoTookPlaces = async (selectedChannel, selectedDay, chatId, bot) => {
    try {
        const channel = await Channel.findOne({ where: { chatId: selectedChannel } });


        const orders = await Order.findAll({ where: { chatId: selectedChannel, date: DATE_MATCH[selectedDay] }});
        console.log('>>> ordersHERE = ', orders);

        let morningGet = '';
        let morningTime = '';
        let dayGet = '';
        let dayTime = '';
        let eveningGet = '';
        let eveningTime = '';

        let date = '';

        const arrOrders = [];

        const response = {
            date: '',
            morning:  {time: ''},
            day: {time: ''},
            evening: {time: ''}
        }

        if (orders.length) {
            console.log('>>> orders', orders);
            console.log('>>> IN ORDERS');


            for (let order of orders) {
                if (order.done) {
                    console.log('>>> DONE order =', order); continue; }
                console.log('order =', order);

                response.date = order.date;
                response[order.getPart] = { time: order.time };

                /*switch (order.getPart) {
                    case 'morning': morningGet = order.getPart; morningTime = order.time; break;
                    case 'day': dayGet = order.getPart; dayTime = order.time; break;
                    case 'evening': eveningGet = order.getPart; eveningTime = order.time; break;
                }

                const morning = { time: morningTime };
                const day = { time: dayTime };
                const evening = { time: eveningTime };

                arrOrders.push({
                    date: date ?? '',
                    morning: morning ?? '',
                    day: day ?? '',
                    evening: evening ?? ''
                })*/
            }
        }
        console.log('>>> channel =', channel);
        return response;


        /*if (channel.dataValues[selectedDay]) {
            const splitStr = channel[selectedDay].split(';');

            let morningGet = '';
            let morningTime = '';
            let dayGet = '';
            let dayTime = '';
            let eveningGet = '';
            let eveningTime = '';

            if (splitStr.length) {
                for (let item of splitStr) {
                    if (item) {
                        item = JSON.parse(item);
                        console.log('item = ', item);
                        switch (item.get) {
                            case 'morning': morningGet = item.get; morningTime = item.time; break;
                            case 'day': dayGet = item.get; dayTime = item.time; break;
                            case 'evening': eveningGet = item.get; eveningTime = item.time; break;
                        }
                    }

                }
            } else {
                switch (splitStr.get) {
                    case 'morning': morningGet = splitStr.get; morningTime = splitStr.time; break;
                    case 'day': dayGet = splitStr.get; dayTime = splitStr.time; break;
                    case 'evening': eveningGet = splitStr.get; eveningTime = splitStr.time; break;
                }
            }

            const morning = { time: morningTime };
            const day = { time: dayTime };
            const evening = { time: eveningTime };

            return {
                morning: morning || '',
                day: day || '',
                evening: evening || ''
            }
        } else {
            return {morning: '', day: '', evening: ''};
        }*/

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

module.exports.addRemoteChannel = addRemoteChannel;
module.exports.getRemoteChannel = getRemoteChannel;
module.exports.getRemoteChannels = getRemoteChannels;
module.exports.postRemotePlace = postRemotePlace;
module.exports.checkInfoTookPlaces = checkInfoTookPlaces;
module.exports.postRemoteFreePlace = postRemoteFreePlace;
