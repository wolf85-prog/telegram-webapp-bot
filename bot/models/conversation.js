const sequelize = require('../connections/db_rent')
const {DataTypes} = require('sequelize')


const Conversation = sequelize.define('conversation', {
    members: {type: DataTypes.ARRAY(DataTypes.STRING)},
})

const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    conversationId: {type: DataTypes.STRING},
    senderId: {type: DataTypes.STRING},
    receiverId: {type: DataTypes.STRING},    
    text: {type: DataTypes.TEXT}, //текст сообщения;
    type: {type: DataTypes.STRING},      //тип сообщения;
    is_bot: {type: DataTypes.BOOLEAN},
    messageId: {type: DataTypes.STRING},
    buttons: {type: DataTypes.STRING},   //названия кнопок;
    replyId: {type: DataTypes.STRING}, //id пересылаемого сообщения
})

module.exports = {
    Conversation, 
    Message
}