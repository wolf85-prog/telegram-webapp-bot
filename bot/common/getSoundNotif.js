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
    let count_fio, count_fio2;
    let count_title;
    let i = 0;
    let j = 0;
    let databaseBlock;
    let arr_count0, arr_count, arr_count2, allDate;
    let arr_all = [];
    let all = [];
    let date_db;


    let task1, task2, task3, task4, task5, task6, task7

    //создаю оповещения

    // начало цикла Специалисты ----------------------------------------------------------------------
    // 86400 секунд в дне
    var minutCount = 0;
        
    // повторить с интервалом 2 минуты
    let timerId = setInterval(async() => {
        //console.log("Начало цикла отчетов. TimerId: ", timerId)
        minutCount++  // a day has passed

        const notifs = await getNotif()
        console.log(notifs)

        const currentDate = new Date().getTime()
        const notif = notifs.find(item => (item.date - currentDate) > 0 && (item.date - currentDate) < 100000)
        console.log("notif: ", notif)
    
        i++ // счетчик интервалов
    }, 60000); //каждые 1 минут

    // остановить вывод через 30 дней
    if (minutCount == 43200) {
        clearInterval(timerId);
    }
}
