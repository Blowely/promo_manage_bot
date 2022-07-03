const {v4} = require("uuid");

const upsert = async (name, condition, Model) => {
    const uuid = v4();
    const user = await Model.findOne({ where: condition });
    if (!user) {
        console.log('Пользователь не найден!')
    }

    let data = '';
    if (user.channels !== '') {
        console.log('here');
        const splitStr = user.channels.split('[').join('');
        const finalStr = JSON.parse(splitStr.split(']').join(''));
        data = JSON.stringify('[' + finalStr + ',' + JSON.stringify({id: uuid, name: name}) + ']');
    } else {
        console.log('else')
        data = JSON.stringify('[' + JSON.stringify({id: uuid, name: name}) + ']');
    }
    console.log('data =', data);
    return await Model.update({channels: data}, { where: condition});
}

function getDataUser(chatId, UserModel) {
    console.log('chatId ==', chatId);
    return UserModel
        .findOne({where: { chatId: chatId }})
        .then(function(user) {
            return user;
        }).catch(err => console.log('err = ', err))
}

module.exports.upsert = upsert;
module.exports.getDataUser = getDataUser;