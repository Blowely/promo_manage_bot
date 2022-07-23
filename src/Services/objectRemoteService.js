const {upsert, fillChannels} = require("./objectService");
const {Channel} = require("../models");
const {getMenu} = require("./objectLocalService");

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

const postRemotePlace = async (selectedChannel, selectedDay, selectedTime) => {

}

module.exports.addRemoteChannel = addRemoteChannel;
module.exports.getRemoteChannel = getRemoteChannel;
module.exports.getRemoteChannels = getRemoteChannels;
module.exports.postRemotePlace = postRemotePlace;
