require("dotenv").config();
const sequelize = require('../connections/db')
const {Project} = require('../models/models')
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

module.exports = async function getReportsTest(projectId, projectName, bot) {
    console.log('START GET REPORTS TEST: ' + projectId + " " + projectName)

    let count_fio, count_fio2;
    let count_title;
    let i = 0;
    let j = 0;
    let databaseBlock;
    let arr_count0, arr_count, arr_count2, allDate;
    let arr_all = [];
    let all = [];
    let date_db;


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

        //1)получить блок и бд
        if (projectId) {
            console.log("i: " + i + " " +  new Date() + " Проект: " + projectName) 
            
            const blockId = await getBlocks(projectId);            
            if (blockId) {
                j = 0    
                databaseBlock = await getDatabaseId(blockId);   
            } else {
                console.log("База данных не найдена! Проект ID: " + projectName)
                j++ //счетчик ошибок доступа к БД ноушена
                console.log("Ошибка № " + j)
                if (j > 5) {
                    console.log("Цикл проекта " + projectName + " завершен!")
                    clearTimeout(timerId);
                }
            }
        }


        //2) проверить массив специалистов (1-й отчет)
            // JSON.parse(project.spec).map((value)=> {           
            //     count_fio = 0;
            //     count_title = 0;

            //     //если бд ноушена доступна
            //     if (databaseBlock) {
            //         databaseBlock.map((db) => {
            //             if (value.spec === db.spec) {
            //                 if (db.fio) {
            //                     count_fio++               
            //                 }else {
            //                     count_fio;
            //                 } 
            //             }
            //         })

            //         //для первого отчета
            //         const obj = {
            //             title: value.spec,
            //             title2: value.cat,
            //             count_fio: count_fio,
            //             count_title: value.count,
            //         }
            //         arr_count0.push(obj) 

            //     }                                           
            // }) // map spec end

        //--------------------------------------------------------------------------------
        //получить массив дат
        if (databaseBlock) {   
            databaseBlock.map((db) => {
                allDate.push(db?.date)                        
            })
        }

        //получить уникальные даты из Основного состава по возрастанию
        dates = [...allDate].filter((el, ind) => ind === allDate.indexOf(el));
        const sortedDates = [...dates].sort((a, b) => {       
            var dateA = new Date(a), dateB = new Date(b) 
            return dateA-dateB  //сортировка по возрастающей дате  
        })

        const datesObj = []

        sortedDates.map((item) =>{
            const obj = {
                date: item,
                consilience: false,
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

//                 const d = new Date(project.datestart);
//                 const month = String(d.getMonth()+1).padStart(2, "0");
//                 const day = String(d.getDate()).padStart(2, "0");
//                 const chas = d.getHours();
//                 const minut = String(d.getMinutes()).padStart(2, "0");

//                 const text = `Запрос на специалистов: 
                            
// ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// ${arr_count0.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title).join('\n')}`    

                //отаправить 1-й отчет
                //const report = await bot.sendMessage(project.chatId, text)                         
                    
                // сохранить отправленное боту сообщение пользователя в БД

                //Подключаемся к серверу socket

                //отправить сообщение в админку
  
            } else {
                // 2-й отчет

                //получить название проекта из ноушена
                let project_name;   
                await fetch(`${botApiUrl}/project/${projectId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        project_name = data?.properties.Name.title[0]?.plain_text;
                    }  else {
                        project_name = projectName
                    }                             
                });

                //получить менеджера проекта из ноушена
                let project_manager;
                await fetch(`${botApiUrl}/project/${projectId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        project_manager = data?.properties["Менеджер"].relation[0]?.id;
                    }  else {
                        project_manager = '';
                    }                             
                });

                //получить TelegramID менеджера проекта из ноушена
                let chatId_manager;
                const chat = await fetch(`${botApiUrl}/managers/${project_manager}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        chatId_manager = data
                    } else {
                        console.log("Manager TelegramId не найден!")
                    }                             
                });


            //отправить сообщение по каждой дате
            datesObj.forEach((date, i)=> {
                const d = new Date(date.date.split('+')[0]);
                const d2 = new Date()

                if(d >= d2) {
                    if (!date.consilience) { 
                        datesObj[i].consilience = true
                        const arr_copy = arr_all[i]

                        const d = new Date(date.date.split('+')[0]);
                        const month = String(d.getMonth()+1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        const chas = d.getHours();
                        const minut = String(d.getMinutes()).padStart(2, "0");

                        const text = `Запрос на специалистов: 
                                
${day}.${month} | ${chas}:${minut} | ${project_name} | U.L.E.Y

${arr_copy.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title).join('\n')}`                           

                        //отправка сообщений по таймеру
                        setTimeout(async()=> {
                            const report = await bot.sendMessage(chatId_manager, text)                         
                            console.log('Отчет отправлен заказчику! ', date.date);

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
                        }, 2500 * ++i)   
                    }
                } else {
                    console.log('Отчет не отправлен! Основная дата меньше текущей');
                }
            })
        }// end if i
 
    
        i++ // счетчик интервалов
    }, 120000); //каждую 1 минуту

    // остановить вывод через 30 дней
    if (minutCount == 43200) {
        clearInterval(timerId);
    }
}