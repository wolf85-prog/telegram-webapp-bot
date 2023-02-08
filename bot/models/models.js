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
    firstname: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
})

const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    conversationId: {type: DataTypes.STRING},
    messageType: {type: DataTypes.STRING},      //тип сообщения;
    text: {type: DataTypes.STRING}, //текст сообщения;
    img: {type: DataTypes.STRING}, //путь к файлу;
    to: {type: DataTypes.STRING},
    from: {type: DataTypes.STRING},
    is_bot: {type: DataTypes.BOOLEAN},
})

const Conversation = sequelize.define('conversation', {
    members: {type: DataTypes.ARRAY(DataTypes.STRING)},
})

const Project = sequelize.define('project', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},  //название проекта
    datestart: {type: DataTypes.STRING},  //дата начала проекта
    spec: {type: DataTypes.ARRAY(DataTypes.STRING)},
    equipment: {type: DataTypes.ARRAY(DataTypes.STRING)},
    teh: {type: DataTypes.STRING},
    geo: {type: DataTypes.STRING},
    managerId: {type: DataTypes.STRING},
    companyId: {type: DataTypes.STRING},
    projectId: {type: DataTypes.STRING},
})

//UserBot.hasMany(Message)
//Message.belongsTo(UserBot)

module.exports = {User, UserBot, Message, Conversation}