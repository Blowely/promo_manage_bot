const {v4} = require("uuid");
const Channel = require("../models").Channel;

const upsert = async (name, condition, Model) => {
    const chatId = v4();
    //const chatId = condition.chatId;
    const user = await Model.findOne({ where: condition });
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

    /*Model.destroy({
        where: {},
        truncate: true
    })
    return Channel.destroy({
        where: {},
        truncate: true
    })*/
}

function getDataUser(chatId, UserModel) {
    console.log('chatId ==', chatId);
    return Channel
        .findOne({where: { chatId: chatId }})
        .then(function(user) {
            return user;
        }).catch(err => console.log('err = ', err))
}

module.exports.upsert = upsert;
module.exports.getDataUser = getDataUser;