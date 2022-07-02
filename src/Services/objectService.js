const {v4} = require("uuid");

function upsert(name, condition, Model) {
    const uuid = v4();
    return Model
        .findOne({ where: condition })
        .then(function(obj) {
            // update
            if(obj) {
                let data = '';

                if (obj.channels !== '') {
                    data = JSON.stringify(JSON.stringify(...obj.channels) + ',' + JSON.stringify({id: uuid, name: name}));
                } else {
                    data = JSON.stringify({id: uuid, name: name});
                }

                return obj.update({channels: data});
            }

            // insert
            return Model.create({channels: name});
        })
}

function getDataUser(chatId, UserModel) {
    return UserModel
        .findOne({ chatId: chatId })
        .then(function(user) {
            return user;
        }).catch(err => console.log('err = ', err))
}

module.exports.upsert = upsert;
module.exports.getDataUser = getDataUser;