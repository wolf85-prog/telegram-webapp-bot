require("dotenv").config();
const sequelize = require('../connections/db')
const {Project, SoundNotif} = require('../models/models')
const getBlocks = require('./getBlocks')
const getDatabaseId = require('./getDatabaseId')
const sendMyMessage = require('./sendMyMessage')
// web-приложение
const webAppUrl = process.env.WEB_APP_URL;
const botApiUrl = process.env.REACT_APP_API_URL
const socketUrl = process.env.SOCKET_APP_URL
const chatTelegramId = process.env.CHAT_ID

const {specData} = require('../data/specData');

//socket.io
const {io} = require("socket.io-client")

//fetch api
const fetch = require('node-fetch');

const fs = require('fs');
const path = require('path');
const getNotif = require("./getNotif");


module.exports = async function getSoundNotif(project, bot) {

    let task1, task2, task3, task4, task5, task6, task7

    //создаю оповещения

    // начало цикла Специалисты ----------------------------------------------------------------------
    // 86400 секунд в дне
    var minutCount = 0;
        
    // повторить с интервалом 1 минута
    let timerId = setInterval(async() => {
        //console.log("Начало цикла отчетов. TimerId: ", timerId)
        minutCount++  // a day has passed

        const notifs = await getNotif()
        //console.log("notifs: ", notifs)

        const currentDate = new Date().getTime()
        const notif = notifs.find(item => (item.dataValues.date - currentDate) > 0 && (item.dataValues.date - currentDate) < 100000)
        console.log("currentDate: ", currentDate)
        if (notif) {
            console.log("notif: ", notif)

            //let socket = io(socketUrl);
            // socket.emit("sendNotif", {
            //     task: 5
            // }) 
        } else {
            console.log("notif отсутствует!") 
        }
        
    
        //i++ // счетчик интервалов
    }, 60000); //каждую 1 минуту

    // остановить вывод через 30 дней
    if (minutCount == 43200) {
        clearInterval(timerId);
    }
}
