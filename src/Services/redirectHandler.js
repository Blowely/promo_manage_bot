const {getMenu, selectChannel, getMyChannels, selectPlace} = require("./objectLocalService");
const store = require('../store').store;


const redirectToPrevPage = async (data, chatId, bot, UserModel) => {
    console.log('>>> store.state_pos =', store.state_pos);

    //TODO SWITCH CASE on DATA that received on props

    switch (store.state_pos) {
        case 1: await getMenu(chatId, bot, UserModel); return;
        case 2: await getMenu(chatId, bot, UserModel); return;
        case 3: await getMenu(chatId, bot, UserModel); return;
        case 4: await getMyChannels(chatId, bot); return;
        case 5: await selectChannel(chatId, bot); return;
        case 6: await selectChannel(chatId, bot); return;
        case 7: await selectChannel(chatId, bot); return;
        case 8: await getMenu(chatId, bot, UserModel); return;
        default: break;
    }
}

module.exports.redirectToPrevPage = redirectToPrevPage;