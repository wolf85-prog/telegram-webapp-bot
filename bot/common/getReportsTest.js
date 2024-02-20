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
// подключаем модуль для работы с файловой системой
const fs = require('fs');
const path = require('path')
// путь к текущей директории
const _dirname = path.resolve(__dirname, 'logs') 

const getDates = async(projectId, projectName) => {
    arr_count0 = []
    arr_count = []
    arr_count2 = [] 
    allDate = []
    arr_all = []

    //1)получить блок и бд
    if (projectId) {         
        const blockId = await getBlocks(projectId);            
        if (blockId) {   
            databaseBlock = await getDatabaseId(blockId);   
        } else {
            console.log("Ошибка доступа к БД Основной состав!")
        }
    }
        
    //--------------------------------------------------------------------------------
    //получить массив дат
    if (databaseBlock) {   
        databaseBlock.map((db) => {
            allDate.push(db?.date)                        
        })
    } else {
        console.log("Даты не определны! Проект: " + projectName)
    }

    //получить уникальные даты из Основного состава по возрастанию
    const dates = [...allDate].filter((el, ind) => ind === allDate.indexOf(el));
    const sortedDates = [...dates].sort((a, b) => {       
        var dateA = new Date(a), dateB = new Date(b) 
        return dateA-dateB  //сортировка по возрастающей дате  
    })

    return sortedDates
}

const randomNumberInRange = (min, max) => {
    return Math.floor(Math.random()
        * (max - min + 1)) + min;
};

module.exports = async function getReportsTest(projectId, projectName, bot) {

    let count_fio;
    let count_title;
    let i = 0;
    let j = 0;
    let databaseBlock;
    let arr_count0, arr_count, arr_count2, allDate;
    let arr_all = [];
    let all = [];
    let date_db;
    let randomSec = randomNumberInRange(10000, 30000)
    let sendReport = false

    let task1, task2, task3, task4, task5, task6, task7

    //создаю оповещения
    //получить название проекта из ноушена
    let project_name;  
    let project_status;

    await fetch(`${botApiUrl}/project/${projectId}`)
    .then((response) => response.json())
    .then((data) => {
        if (data) {
            project_name = data?.properties.Name.title[0]?.plain_text;
            project_status = data?.properties["Статус проекта"].select.name
        }  else {
            project_name = projectName
            project_status ='';
        }                             
    });

    console.log('START GET REPORTS 2: ' + project_name + " - " + project_status)

    const datesObj = await getDates(projectId, project_name)
    console.log(datesObj)

    if (datesObj) {
        //отправить сообщение по каждой дате
        datesObj.forEach((date, i)=> {
            const d = new Date(date.split('+')[0]);
            const d2 = new Date().getTime() + 10800000 // + 3 часа (московское время)

            if(d >= d2) {
                //отправка напоминания
                if (project_status === 'OnAir') {

                    var timeDiff = d.getTime() - 7200000; //120 минут
                    var timeDiff2 = d.getTime() - 3600000;//60 минут
                    var timeDiff3 = d.getTime() - 1800000;//30 минут
                    var timeDiff4 = d.getTime() - 900000; //15 минут
                    var timeDiff6 = d.getTime() - 600000; //10 минут
                    var timeDiff7 = d.getTime() - 300000; //5 минут
                    var timeDiff5 = d.getTime();          //0 минут        //0 минут

                    const date2 = new Date(timeDiff)
                    const date3 = new Date(timeDiff2)
                    const date4 = new Date(timeDiff3)
                    const date5 = new Date(timeDiff4)
                    const date6 = new Date(timeDiff5)
                    const dateNow = new Date(d2)
                    const date7 = new Date(timeDiff6)
                    const date8 = new Date(timeDiff7)

                    const milliseconds = Math.floor((date2 - dateNow)) + randomSec; //120 минут
                    const milliseconds2 = Math.floor((date3 - dateNow)) + randomSec; //60 минут
                    const milliseconds3 = Math.floor((date4 - dateNow)) + randomSec; //30 минут
                    const milliseconds4 = Math.floor((date5 - dateNow)) + randomSec; //15 минут
                    const milliseconds6 = Math.floor((date7 - dateNow)) + randomSec; //10 минут
                    const milliseconds7 = Math.floor((date8 - dateNow)) + randomSec; //5 минут
                    const milliseconds5 = Math.floor((date6 - dateNow)) + randomSec; //0 минут

                    //120-минутная готовность
                    if (milliseconds > 0) {
                        console.log("!!!!Планирую запуск сообщения 1...!!!!")     
                        task1 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 1
                                // }) 

                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 120 минут',
                                    date: new Date().getTime() + milliseconds,
                                    delivered: false
                                })
                            }
                        }, milliseconds)
                    }                

                    //60-минутная готовность
                    if (milliseconds2 > 0) {
                        console.log("!!!!Планирую запуск сообщения 2...!!!!")     
                        task2 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 2
                                // }) 

                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 60 минут',
                                    date: new Date().getTime() + milliseconds2,
                                    delivered: false
                                })
                            }
                        }, milliseconds2)
                    }

                    //30-минутная готовность
                    if (milliseconds3 > 0) {
                        console.log("!!!!Планирую запуск сообщения 3...!!!!")     
                        task3 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 3
                                // }) 

                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 30 минут',
                                    date: new Date().getTime() + milliseconds3,
                                    delivered: false
                                })
                            }
                        }, milliseconds3)
                    }

                    //15-минутная готовность
                    if (milliseconds4 > 0) {
                        console.log("!!!!Планирую запуск сообщения 4...!!!!")     
                        task4 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 4
                                // }) 

                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 15 минут',
                                    date: new Date().getTime() + milliseconds4,
                                    delivered: false
                                })
                            }
                        }, milliseconds4)
                    }

                    //10-минутная готовность
                    if (milliseconds6 > 0) {
                        console.log("!!!!Планирую запуск сообщения 6...!!!!")     
                        task4 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 6
                                // })
                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 10 минут',
                                    date: new Date().getTime() + milliseconds6,
                                    delivered: false
                                })
                            } 
                        }, milliseconds6)
                    }

                    //5-минутная готовность
                    if (milliseconds7 > 0) {
                        console.log("!!!!Планирую запуск сообщения 7...!!!!")     
                        task4 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 7
                                // })
                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 5 минут',
                                    date: new Date().getTime() + milliseconds7,
                                    delivered: false
                                })
                            } 
                        }, milliseconds7)
                    }

                    //0 готовность
                    if (milliseconds5 > 0) {
                        console.log("!!!!Планирую запуск сообщения 5...!!!!") 
                        console.log("--------------------------------------")       
                        task5 = setTimeout(async() => {
                            //отправить сообщение в админку
                            if (project_status === 'OnAir') {
                                // let socket = io(socketUrl);
                                // socket.emit("sendNotif", {
                                //     task: 5
                                // }) 
                                const res = SoundNotif.create({
                                    name: project_name,
                                    text: 'Звуковое оповещение - 0 минут',
                                    date: new Date().getTime() + milliseconds5,
                                    delivered: false
                                })
                            }
                        }, milliseconds5)
                    }
                }
            }
        })
    }

    // начало цикла Специалисты ----------------------------------------------------------------------
    // 86400 секунд в дне
    var minutCount = 0;
        
    // повторить с интервалом 1 минуту
    let timerId = setInterval(async() => {
        //console.log("Начало цикла отчетов. TimerId: ", timerId)
        minutCount++  // a day has passed
        arr_count0 = []
        arr_count = []
        arr_count2 = [] 
        allDate = []
        arr_all = []
        //sendReport = false

        let statusProjectNew = ''; 
        let project_name;  
        let project_manager; 
        let project_managers = []; 

        //получить название проекта из ноушена
        await fetch(`${botApiUrl}/project/${projectId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                project_name = data?.properties.Name.title[0]?.plain_text;
                project_manager = data?.properties["Менеджер"].relation[0]?.id;
                project_managers = data?.properties["Менеджер"].relation;
                statusProjectNew = data?.properties["Статус проекта"].select.name
                console.log("project_managers: ", project_managers)

            }  else {
                project_name = project.name
                project_manager = '';
                project_managers = [];
                statusProjectNew ='';
                //console.log("STATUS NEW: ", statusProjectNew)
            }                             
        });

         //получить TelegramID менеджера проекта из ноушена
         let chatId_manager;
         let chatId_managers = []

         const chat = await fetch(`${botApiUrl}/managers/${project_manager}`)
         .then((response) => response.json())
         .then((data) => {
             if (data) {
                 chatId_manager = data
             } else {
                 console.log("Manager TelegramId не найден!")
             }                             
         });

        // if (project_managers && project_managers.length > 0) {
        //     project_managers.maps(async(manager)=> {
        //         await fetch(`${botApiUrl}/managers/${manager.id}`)
        //         .then((response) => response.json())
        //         .then((data) => {
        //             if (data) {
        //                 chatId_managers.push(data)

        //                 console.log("chatId_managers: ", chatId_managers)
        //             }                            
        //         });
        //     })
        // }


        // 1) получить блок и бд
        const d = new Date()
        const year = d.getFullYear()
        const month = String(d.getMonth()+1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const chas = d.getHours();
        const minut = String(d.getMinutes()).padStart(2, "0");

        if (projectId) {
            console.log(`i: ${i} ${day}.${month}.${year} ${chas}:${minut} Проект: ${project_name} Статус: ${statusProjectNew}`) 
            
            const blockId = await getBlocks(projectId);            
            if (blockId) {
                j = 0    
                databaseBlock = await getDatabaseId(blockId);   
            } else {
                console.log("База данных не найдена! Проект: " + project_name)
                j++ //счетчик ошибок доступа к БД ноушена
                console.log("Ошибка № " + j)
                if (j > 5) {
                    console.log("Цикл проекта " + project_name + " завершен!")
                    clearTimeout(timerId);
                }
            }
        }


        //2) проверить массив специалистов (1-й отчет)                           
        //......

        //--------------------------------------------------------------------------------
        //получить массив дат
        if (databaseBlock) {   
            databaseBlock.map((db) => {
                allDate.push(db?.date)                        
            })
        }

        //получить уникальные даты из Основного состава по возрастанию
        const dates = [...allDate].filter((el, ind) => ind === allDate.indexOf(el));
        const sortedDates = [...dates].sort((a, b) => {       
            var dateA = new Date(a), dateB = new Date(b) 
            return dateA-dateB  //сортировка по возрастающей дате  
        })

        const datesObj = []

        sortedDates.map((item) =>{
            const obj = {
                date: item,
                consilience: false,
                send: false,
            }
            datesObj.push(obj)  
        })

        //2) проверить массив специалистов из ноушен (2-й отчет)
        datesObj.map((item, ind)=> {  
            arr_count2 = []  
            specData.map((specObject)=> {
                specObject.models.map((spec)=> {
                    //console.log(spec.name)
                    count_fio = 0;
                    count_title = 0;

                    if (databaseBlock) {   
                        databaseBlock.map((db) => {
                            if (db.date === item.date) {
                                if (spec.name === db.spec) {
                                    if (db.fio) {
                                        count_fio++               
                                    }else {
                                        count_fio;
                                    } 
                                    count_title++
                                    date_db = db.date
                                } 
                            }                              
                        })

                        //для второго отчета
                        if (count_title > 0) {
                            const obj = {
                                date: date_db,
                                title: spec.name,
                                title2: specObject.icon,
                                count_fio: count_fio,
                                count_title: count_title,
                            }
                            arr_count2.push(obj)        
                        }                  
                    } 
                })
            })// map spec end

            arr_count.push(arr_count2)
        })

        //перебрать все даты и создать общий массив
        datesObj.map((item, index) =>{
            arr_all.push(arr_count[index])
        })

        //пропустить пустые массивы
        if (arr_all.length > 0 ) {
            //сохранение массива в 2-х элементный массив
            if (i % 2 == 0) {
                all[0] = arr_all
            } else {
                all[1] = arr_all
            }
        }

        //записываем для каждой даты есть ли изменения
        datesObj.map((item, index) =>{
            //проверка на существование массива (чтобы не выводить первый отчет и пустые)
            if (all[1] && all[0]) {
                datesObj[index].consilience = JSON.stringify(all[0][index]) === JSON.stringify(all[1][index]);  
            }
        })

        // 1-й отчет
        if (i < 1) {
            //...
        } else {
            // 2-й отчет
            if (statusProjectNew !== 'Wasted' || statusProjectNew !== 'OnHold') {           
                //отправить одно сообщение за период
                let text = `Отчет по проекту «${project_name}»: \n\n` 

                //отправить сообщение по каждой дате
                datesObj.forEach((date, i)=> {
                    const d = new Date(date.date.split('+')[0]);
                    const d2 = new Date().getTime() + 10800000

                    if(d >= d2) {
                        //если есть изменения в таблице Основной состав
                        if (!date.consilience) { 
                            datesObj[i].consilience = true
                            datesObj[i].send = true
                            const arr_copy = arr_all[i]

                            const d = new Date(date.date.split('+')[0]);
                            const month = String(d.getMonth()+1).padStart(2, "0");
                            const day = String(d.getDate()).padStart(2, "0");
                            const chas = d.getHours();
                            const min = String(d.getMinutes()).padStart(2, "0");

                            text = text + `${day}.${month} | ${chas}:${min} | ${project_name}

    ${arr_copy.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title).join('\n')} \n\n`                           

                            
    //---------------------------------------------------------------------------------------------------
                            //создаю оповещения
                            //отправка напоминания
                            // if (statusProjectNew === 'OnAir') {

                            //     var timeDiff = d.getTime() - 7200000; //120 минут
                            //     var timeDiff2 = d.getTime() - 3600000;//60 минут
                            //     var timeDiff3 = d.getTime() - 1800000;//30 минут
                            //     var timeDiff4 = d.getTime() - 900000; //15 минут
                            //     var timeDiff6 = d.getTime();          //10 минут
                            //     var timeDiff7 = d.getTime();          //5 минут
                            //     var timeDiff5 = d.getTime();          //0 минут
                                
                            //     const date2 = new Date(timeDiff)
                            //     const date3 = new Date(timeDiff2)
                            //     const date4 = new Date(timeDiff3)
                            //     const date5 = new Date(timeDiff4)
                            //     const date6 = new Date(timeDiff5)
                            //     const dateNow = new Date(d2)
                            //     const date7 = new Date(timeDiff6)
                            //     const date8 = new Date(timeDiff7)

                            //     const milliseconds = Math.floor((date2 - dateNow)) + randomSec; //120 минут
                            //     const milliseconds2 = Math.floor((date3 - dateNow)) + randomSec; //60 минут
                            //     const milliseconds3 = Math.floor((date4 - dateNow)) + randomSec; //30 минут
                            //     const milliseconds4 = Math.floor((date5 - dateNow)) + randomSec; //15 минут
                            //     const milliseconds6 = Math.floor((date7 - dateNow)) + randomSec; //10 минут
                            //     const milliseconds7 = Math.floor((date8 - dateNow)) + randomSec; //5 минут
                            //     const milliseconds5 = Math.floor((date6 - dateNow)) + randomSec; //0 минут

                            //     // const data = 'СТАРТ - Задача 1 в ' + d + ' запущена! Проект: ' + project_name + '\n';
                            //     // const fileName = _dirname  + '/tasks.txt';
                            //     // fs.appendFileSync(fileName, data);

                            //     //120-минутная готовность
                            //     if (task1) {
                            //         clearTimeout(task1);    
                            //         console.log("Задача 1 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 1...!!!!")     
                            //         task1 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 1
                            //                 }) 
                            //                 const res = SoundNotif.create({
                            //                     name: project_name,
                            //                     text: 'Звуковое оповещение - 120 минут',
                            //                     date: new Date(milliseconds).toISOString(),
                            //                     delivered: false
                            //                 })
                                            
                            //             }
                            //         }, milliseconds) 
                            //     }
    

                            //     //60-минутная готовность
                            //     if (task2) {
                            //         clearTimeout(task2);    
                            //         console.log("Задача 2 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds2 > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 2...!!!!")     
                            //         task2 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 2
                            //                 }) 
                            //                 const res = SoundNotif.create({
                            //                     name: project_name,
                            //                     text: 'Звуковое оповещение - 60 минут',
                            //                     date: new Date(milliseconds2).toISOString(),
                            //                     delivered: false
                            //                 })
                            //             }
                            //         }, milliseconds2)
                            //     }

                            //     //30-минутная готовность
                            //     if (task3) {
                            //         clearTimeout(task3);    
                            //         console.log("Задача 3 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds3 > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 3...!!!!")     
                            //         task3 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 3
                            //                 }) 
                            //                 const res = SoundNotif.create({
                            //                     name: project_name,
                            //                     text: 'Звуковое оповещение - 30 минут',
                            //                     date: new Date(milliseconds3).toISOString(),
                            //                     delivered: false
                            //                 })
                            //             }
                            //         }, milliseconds3)
                            //     }

                            //     //15-минутная готовность
                            //     if (task4) {
                            //         clearTimeout(task4);    
                            //         console.log("Задача 4 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds4 > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 4...!!!!")     
                            //         task4 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 4
                            //                 }) 
                            //                 const res = SoundNotif.create({
                            //                     name: project_name,
                            //                     text: 'Звуковое оповещение - 15 минут',
                            //                     date: new Date(milliseconds4).toISOString(),
                            //                     delivered: false
                            //                 })
                            //             }
                            //         }, milliseconds4)
                            //     }

                            //     //10-минутная готовность
                            //     if (task6) {
                            //         clearTimeout(task6);    
                            //         console.log("Задача 6 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds6 > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 6...!!!!")     
                            //         task6 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 6
                            //                 }) 
                            //                 const res = SoundNotif.create({
                            //                     name: project_name,
                            //                     text: 'Звуковое оповещение - 10 минут',
                            //                     date: new Date(milliseconds6).toISOString(),
                            //                     delivered: false
                            //                 })
                            //             }
                            //         }, milliseconds6)
                            //     }

                            //     //5-минутная готовность
                            //     if (task7) {
                            //         clearTimeout(task7);    
                            //         console.log("Задача 7 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds7 > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 7...!!!!")     
                            //         task7 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 7
                            //                 }) 
                            //                 const res = SoundNotif.create({
                            //                     name: project_name,
                            //                     text: 'Звуковое оповещение - 5 минут',
                            //                     date: new Date(milliseconds7).toISOString(),
                            //                     delivered: false
                            //                 })
                            //             }
                            //         }, milliseconds7)
                            //     }

                            //     //0 готовность
                            //     if (task5) {
                            //         clearTimeout(task5);    
                            //         console.log("Задача 5 удалена! " + project_name)                       
                            //     } 
                            //     if (milliseconds5 > 0) {
                            //         console.log("!!!!Планирую запуск сообщения 5...!!!!")   
                            //         console.log("--------------------------------------")    
                            //         task5 = setTimeout(async() => {
                            //             //отправить сообщение в админку
                            //             if (statusProjectNew === 'OnAir') {
                            //                 let socket = io(socketUrl);
                            //                 socket.emit("sendNotif", {
                            //                     task: 5
                            //                 }) 
                            //             }
                            //         }, milliseconds5)
                            //     }
                            // }
    //----------------------------------------------------------------------------------------------
                        }
                    } else {
                        //console.log('Отчет не отправлен! Основная дата меньше текущей');
                    }
                })
                //отправка  одного сообщения
                            //if (i % 10 === 0 && i !== 0) {
                            if (datesObj.find(item=>item.send === true)) {
                                //отправка сообщений по таймеру
                                //setTimeout(async()=> { 
                                    //сбросить флаг отправки  
                                    datesObj.map(item=> {
                                        item.send = false
                                    })                            
                                    const report = await bot.sendMessage(chatId_manager, text, {
                                        reply_markup: ({
                                            inline_keyboard:[
                                                [
                                                    {"text": "Информация принята", callback_data:'/report_accept'},
                                                ],
                                            ]
                                        })
                                    })                         
                                    //console.log('Отчет отправлен заказчику! ', report);

                                    // сохранить отправленное боту сообщение пользователя в БД
                                    const convId = await sendMyMessage(text, 'text', chatId_manager, report.message_id)

                                    //Подключаемся к серверу socket
                                    let socket = io(socketUrl);
                                    socket.emit("addUser", chatId_manager)

                                    //отправить сообщение в админку
                                    socket.emit("sendMessage", {
                                        senderId: chatId_manager,
                                        receiverId: chatTelegramId,
                                        text: text,
                                        type: 'text',
                                        convId: convId,
                                        messageId: report.message_id,
                                    }) 
                                //}, 2500)  
                            }
            } else { // if status
                console.log('Статус проекта onHold или Wasted: ', project_name); 
            }
        }// end if i
    
        i++ // счетчик интервалов
    }, 600000); //каждую 10 минут

    // остановить вывод через 30 дней
    if (minutCount == 43200) {
        clearInterval(timerId);
    }
}