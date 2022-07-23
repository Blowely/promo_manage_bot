const {getMenu} = require("./objectLocalService");
const store = require('../store').store;


const redirectToPrevPage = async (chatId, bot, UserModel) => {
    switch (store.state_pos) {
        case 2: await getMenu(chatId, bot, UserModel); return;
        case 3: await getMenu(chatId, bot, UserModel); return;
        default: break;
    }
}

module.exports.redirectToPrevPage = redirectToPrevPage;