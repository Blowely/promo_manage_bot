const {getMenu, selectChannel, getMyChannels, selectPlace, view_total} = require("./objectLocalService");
const {removeMessages, editMessage} = require("../utils");

const store = require('../store').store;


const redirectToPrevPage = async (data, chatId, bot, UserModel, ChannelModel) => {
    try {
        const user = await UserModel.findOne({where: {chatId}});

        //TODO SWITCH CASE on DATA that received on props
        console.log('>>> user.state =', user.state);

        switch (user.state) {
            case '1': await getMenu(chatId, bot, UserModel); return;
            case '2': await getMenu(chatId, bot, UserModel, null, user.deleteMessageIds); return;
            case '2.1': await getMenu(chatId, bot, UserModel); return;
            case '3': await getMenu(chatId, bot, UserModel); return;
            case '4': await getMyChannels(chatId, bot, UserModel, ChannelModel); return;
            case '5': await selectChannel(chatId, bot); return;
            case '6': await selectChannel(chatId, bot); return;
            case '7': await selectChannel(chatId, bot); return;
            case '8': await getMenu(chatId, bot, UserModel); return;
            case '9': await view_total(chatId, bot); return;
            case '10': await selectChannel(chatId, bot, UserModel); return;
            default: break;
        }
    } catch (e) {
        console.log('>>> err redirectToPrevPage', e.message);
    }
}

module.exports.redirectToPrevPage = redirectToPrevPage;