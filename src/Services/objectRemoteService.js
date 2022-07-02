const {upsert} = require("./objectService");
const {getDataUser} = require("./objectService");

const addRemoteChannel = (name, chatId, UserModel) => {
    const condition = {chatId: chatId};

    upsert(name, condition, UserModel).then((res) => console.log('success', res.toJSON()))
        .catch((err) => console.log('err =', err));

    console.log('UserModel.ch =',UserModel.findOne({where: {chatId: chatId}}).channels);
}

const getRemoteChannel = (chatId, UserModel) => {

}

const getRemoteChannels = (chatId, UserModel) => {
    getDataUser(chatId, UserModel).then(user => {
        console.log('user.channels =', user.channels);

        //return JSON.parse(user.channels).split(',') || JSON.parse(user.channels);
    })

}

module.exports.addRemoteChannel = addRemoteChannel;
module.exports.getRemoteChannel = getRemoteChannel;
module.exports.getRemoteChannels = getRemoteChannels;
