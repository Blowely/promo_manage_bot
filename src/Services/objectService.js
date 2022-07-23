const {v4} = require("uuid");
const options = require("../options");
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

const fillChannels = async (chatId,UserModel) => {
    const channels = [];
    const user = await UserModel.findOne({where:{chatId: chatId}});

    if (user && user.channels) {
        const userChannels = user.channels.split(',');

        for (const channel of userChannels) {
            const foundChannel = await Channel.findOne({where:{chatId: channel}});
            if (foundChannel) {channels.push(foundChannel.dataValues)}
        }
    }
    console.log('channels =', channels);
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
                [{text: 'Назад', callback_data: 'cancel'}]
            ]
        });
    }
    return options.CHANNELS.reply_markup;
}

module.exports.upsert = upsert;
module.exports.fillChannels = fillChannels;
