require("dotenv").config();
//подключение к БД PostreSQL
const sequelize = require('./../../bot/connections/db')
const {UserBot, Message, Conversation} = require('./../../bot/models/models')
const chatTelegramId = process.env.CHAT_ID
const { Op } = require('sequelize')

module.exports = async function sendMyMessage(text, typeText, chatId) {
    //создать беседу в админке в бд 
    //сохранить отправленное боту сообщение пользователя в БД
    let  conversation_id              
    try {                  
        //найти беседу
        const conversation = await Conversation.findOne({
            where: {
                members: {
                    [Op.contains]: [chatId]
                }
            },
        })             

        //если нет беседы, то создать 
        if (conversation.length === 0) {
            const conv = await Conversation.create(
            {
                members: [chatId, chatTelegramId],
                message: text,
            })
            console.log("Беседа успешно создана: ", conv.id) 
            console.log("conversationId: ", conv.id)
            
            conversation_id = conv.id
        } else {
            console.log('Беседа уже создана в БД')  
            console.log("conversationId: ", conversation[0].id)  
            
            conversation_id = conversation[0].id
        }

        const messageDB = await Message.create(
        {
            text: text, 
            senderId: chatId, 
            receiverId: chatTelegramId,
            type: typeText,
            conversationId: conversation_id,
        })

        return conversation_id;
    } catch (error) {
        console.log(error)
    }
}          