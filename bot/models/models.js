const sequelize = require('../connections/db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
    chatId: {type: DataTypes.STRING, unique: true},
})

const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    text: {type: DataTypes.STRING},
    from_id: {type: DataTypes.STRING},
    firstname: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    is_bot: {type: DataTypes.BOOLEAN},
    img: {type: DataTypes.STRING},
})

User.hasMany(Message)
Message.belongsTo(User)

module.exports = {User, Message}