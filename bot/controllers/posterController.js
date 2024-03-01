require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID
const chatTelegramId = process.env.CHAT_ID
//fetch api
const fetch = require('node-fetch');
const axios = require("axios");
const sendMessageAdmin = require("./../common/sendMessageAdmin");
//socket.io
const {io} = require("socket.io-client")
const socketUrl = process.env.SOCKET_APP_URL

const $host = axios.create({
    baseURL: process.env.REACT_APP_API_URL
})

class PosterController {

    //отправка предварительной сметы
    async sendPoster(req, res) {
        const token = process.env.TELEGRAM_API_TOKEN
        const host = process.env.HOST
        const {crmId, chatId, ver} = req.body;
        try {
            //const poster = 'https://proj.uley.team/files/1389/pre/1389_1408579113_customer.pdf'
            const poster = `${host}/files/${crmId}/pre/${crmId}_${chatId}_customer_${ver}.pdf`
            console.log("poster API: ", poster)

            const response = await notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: "Crm_ID",
                    rich_text: {
                        "contains": crmId
                    }
                },         
            });

            //const project = await getProjectCrmId(crmId)
            const projectId = response.results[0].id
            console.log("projectId pred smeta: ", projectId)


            //Передаем данные боту
            const keyboard = JSON.stringify({
                inline_keyboard:[
                    [{text: 'Подтвердить', callback_data:'/smeta ' + projectId}]
                ]
            });

            console.log("Отправляю постер...")
            const url_send_poster = `https://api.telegram.org/bot${token}/sendDocument?chat_id=${chatId}&document=${poster}&reply_markup=${keyboard}`
            console.log(url_send_poster)

            // создание базы данных "Основной состав"
            const response2 = await $host.get(url_send_poster);

            console.log("messageId: ", response2.data?.result?.message_id)


            //сохранение сметы в базе данных
            const convId = await sendMessageAdmin(poster, "image", chatId, response2.data?.result?.message_id, true, 'Подтверждаю')
            console.log("convId: ", convId)

            // Подключаемся к серверу socket
            let socket = io(socketUrl);
            socket.emit("addUser", chatId)

            // //сохранить в контексте (отправка) сметы в админку
            socket.emit("sendAdmin", { 
                senderId: chatTelegramId,
                receiverId: chatId,
                text: poster,
                type: 'image',
                buttons: 'Подтверждаю',
                convId: convId,
                messageId: response2.data?.result?.message_id,
            })

            return res.status(200).json("Poster has been sent successfully");
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }

    //отправка финальной сметы
    async sendPosterFinal(req, res) {
        const token = process.env.TELEGRAM_API_TOKEN
        const host = process.env.HOST
        const {crmId, chatId, ver} = req.body;
        try {
            //const poster = 'https://proj.uley.team/files/1389/pre/1389_1408579113_customer.pdf'
            const poster = `${host}/files/${crmId}/final/${crmId}_${chatId}_${ver}.pdf`
            console.log("poster final API: ", poster)

            const response = await notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: "Crm_ID",
                    rich_text: {
                        "contains": crmId
                    }
                },         
            });

            //const project = await getProjectCrmId(crmId)
            const projectId = response.results[0].id
            console.log("projectId final smeta: ", projectId)


            //Передаем данные боту
            const keyboard = JSON.stringify({
                inline_keyboard:[
                    [{text: 'Подтвердить', callback_data:'/finalsmeta ' + projectId}]
                ]
            });

            console.log("Отправляю постер...")
            const url_send_poster = `https://api.telegram.org/bot${token}/sendDocument?chat_id=${chatId}&document=${poster}&reply_markup=${keyboard}`
            console.log(url_send_poster)

            // создание базы данных "Основной состав"
            const response2 = await $host.get(url_send_poster);
        
            const data = await response2.json();

            console.log("messageId: ", response2)

            //сохранение сметы в базе данных
            const convId = await sendMessageAdmin(poster, "image", chatId, response2.data?.result?.message_id, true, 'Подтверждаю')

            // Подключаемся к серверу socket
            let socket = io(socketUrl);
            socket.emit("addUser", chatId)

            // //сохранить в контексте (отправка) сметы в админку
            socket.emit("sendAdmin", { 
                senderId: chatTelegramId,
                receiverId: chatId,
                text: poster,
                type: 'image',
                buttons: 'Подтверждаю',
                convId: convId,
                messageId: response2.data?.result?.message_id,
            })

            return res.status(200).json("Poster has been sent successfully");
        } catch (error) {
            return res.status(500).json(error.message);
        }
    }
}

module.exports = new PosterController()