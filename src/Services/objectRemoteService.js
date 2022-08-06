const {upsert, fillChannels} = require("./objectService");
const {Channel} = require("../models");
const {getMenu} = require("./objectLocalService");
const {v4} = require("uuid");
const {Model} = require("sequelize");
const {logger} = require("sequelize/lib/utils/logger");

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
        const channel = await Channel.findOne({ where: {chatId: selectedChannel} });
        console.log('>>> channel =', channel);
        if (channel.dataValues[selectedDay]) {
            const splitStr = channel[selectedDay].split(';');

            let morningGet = '';
            let morningTime = '';
            let dayGet = '';
            let dayTime = '';
            let eveningGet = '';
            let eveningTime = '';

            if (splitStr.length) {
                for (let item of splitStr) {
                    item = JSON.parse(item);
                    console.log('item = ', item);
                    switch (item.get) {
                        case 'morning': morningGet = item.get; morningTime = item.time; break;
                        case 'day': dayGet = item.get; dayTime = item.time; break;
                        case 'evening': eveningGet = item.get; eveningTime = item.time; break;
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
        }

    } catch (e) {
        console.log('e =', e.message);
        bot.sendMessage(chatId, 'Что-то пошло не так =' + e.message);

    }

}

const postRemotePlace = async (selectedChannel, selectedDay, selectedPart, selectedTime, bot, chatId) => {
    try {
        const channel = await Channel.findOne({ where: {chatId: selectedChannel} });
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
            await Channel.update({[selectedDay]: data}, {where: {chatId: selectedChannel}});
        } else {
            await bot.sendMessage(chatId, 'На это время место уже занято');
        }


    } catch (e) {
        bot.sendMessage(chatId, 'Что-то пошло не так =' + e.message);
    }
    //const chatId = condition.chatId;
    /*const user = await Model.findOne({ where: condition });

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
    console.log('data =', data);*/

}

module.exports.addRemoteChannel = addRemoteChannel;
module.exports.getRemoteChannel = getRemoteChannel;
module.exports.getRemoteChannels = getRemoteChannels;
module.exports.postRemotePlace = postRemotePlace;
module.exports.checkInfoTookPlaces = checkInfoTookPlaces;
