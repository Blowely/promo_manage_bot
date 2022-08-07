const {getMenu, selectChannel, getMyChannels} = require("./objectLocalService");
const store = require('../store').store;


const redirectToPrevPage = async (chatId, bot, UserModel) => {
    console.log('>>> store.state_pos =', store.state_pos);
    switch (store.state_pos) {
        case 2: await getMenu(chatId, bot, UserModel); return;
        case 3: await getMenu(chatId, bot, UserModel); return;
        case 4: await getMyChannels(chatId, bot); return;
        case 5: await selectChannel(chatId, bot); return;
        default: break;
    }
}

module.exports.redirectToPrevPage = redirectToPrevPage;