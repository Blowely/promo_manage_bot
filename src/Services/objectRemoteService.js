const {upsert} = require("./objectService");
const {getDataUser} = require("./objectService");

const addRemoteChannel = (name, chatId, UserModel) => {
    const condition = {chatId: chatId};

    upsert(name, condition, UserModel).then((res) => console.log('success', JSON.stringify(res)))
        .catch((err) => console.log('err =', err));
}

const getRemoteChannel = (chatId, UserModel) => {

}

const getRemoteChannels = (chatId, UserModel) => {
    return getDataUser(chatId, UserModel).then(async user => {
        const users = await UserModel.findAll();
        console.log(users.every(user => user instanceof UserModel)); // true
        console.log("All users:", JSON.stringify(users, null, 2));

        return JSON.parse(user.channels);
    })

}

module.exports.addRemoteChannel = addRemoteChannel;
module.exports.getRemoteChannel = getRemoteChannel;
module.exports.getRemoteChannels = getRemoteChannels;
