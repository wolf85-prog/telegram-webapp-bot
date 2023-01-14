const sequelize = require('../connections/db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
})

const UserBot = sequelize.define('userbot', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    first_name: {type: DataTypes.STRING},
    last_name: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
})

const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    messageType: {type: DataTypes.STRING},      //тип сообщения;
    textOrPathToFile: {type: DataTypes.STRING}, //текст сообщения или путь к файлу;
    to: {type: DataTypes.STRING},
    from: {type: DataTypes.STRING},
    is_bot: {type: DataTypes.BOOLEAN},
})

UserBot.hasMany(Message)
Message.belongsTo(UserBot)

module.exports = {User, UserBot, Message}