require("dotenv").config();
const sequelize = require('./../connections/db')
const {Project} = require('./../models/models')
const getBlocks = require('./getBlocks')
const getDatabaseId = require('./getDatabaseId')
const sendMyMessage = require('./sendMyMessage')
// web-приложение
const webAppUrl = process.env.WEB_APP_URL;
const botApiUrl = process.env.REACT_APP_API_URL
const socketUrl = process.env.SOCKET_APP_URL
const chatTelegramId = process.env.CHAT_ID

const {specData} = require('./../data/specData');

//socket.io
const {io} = require("socket.io-client")

//fetch api
const fetch = require('node-fetch');

module.exports = async function getReports(project, bot) {
    console.log('START GET REPORTS: ' + project.id + " " + project.name)

    let count_fio, count_fio2;
    let count_title;
    let i = 0;
    let j = 0;
    let databaseBlock;
    let arr_count, arr_count2, arr_date;
    let arr_all = [];
    let arr_all2 = [];


    // начало цикла Специалисты ----------------------------------------------------------------------
    // 86400 секунд в дне
    var minutCount = 0;
        
    // повторить с интервалом 1 минуту
    let timerId = setInterval(async() => {
        minutCount++  // a day has passed
        arr_count = []
        arr_count2 = [] 
        arr_date = []

        //1)получить блок и бд
        if (project.projectId) {
            const blockId = await getBlocks(project.projectId);
            console.log("i: " + i + " " +  new Date() + " Проект2: " + project.name) 
            databaseBlock = await getDatabaseId(blockId); 
            console.log("databaseBlock: ", databaseBlock)
        }

        //2) проверить массив специалистов из ноушен (2-й отчет)
        specData.map((specObject)=> {
            specObject.models.map((spec)=> {
                //console.log(spec.name)
                count_fio = 0;
                count_title = 0;

                if (databaseBlock) {   
                    j = 0
                    databaseBlock.map((db) => {
                        if (spec.name === db.spec) {
                            if (db.fio) {
                                count_fio++               
                            }else {
                                count_fio;
                            } 
                            count_title++
                            arr_date.push(db.date)
                        }               
                    })
                    //для второго отчета
                    if (count_title > 0) {
                        const obj = {
                            //date: db.date,
                            title: spec.name,
                            title2: specObject.icon,
                            count_fio: count_fio,
                            count_title: count_title,
                        }
                        arr_count.push(obj) 
                    }
                        

                    //сохранение массива в 2-х элементный массив
                    if (i % 2 == 0) {
                        arr_all[0] = arr_count
                    } else {
                        arr_all[1] = arr_count 
                    }
                    
                } else {
                    console.log("База данных не найдена! Проект ID: " + project.name)
                    j++ //счетчик ошибок доступа к БД ноушена
                    console.log("Ошибка № " + j)
                    if (j > 10) {
                        console.log("Цикл проекта " + project.name + " завершен!")
                        clearTimeout(timerId);
                    }
                } 

            })
        })// map spec end

        //получить название проекта из ноушена
        let project_name;   
        const res = await fetch(`${botApiUrl}/project/${project.projectId}`)
        .then((response) => response.json())
        .then((data) => {
            if (data) {
                project_name = data?.properties.Name.title[0]?.plain_text;
            }  else {
                project_name = project.name
            }                             
        });

        //получить дату из Основного состава проекта в ноушена
        let project_date = arr_date[0];
        const d = new Date(project_date);
        const year = d.getFullYear();
        const month = String(d.getMonth()+1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const chas = d.getHours();
        const minut = String(d.getMinutes()).padStart(2, "0");

        //сравнить два массива и узнать есть ли изменения
        let isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);

        if (!isEqual) {
            //2-й и последующие отчеты
            const text = `Запрос на специалистов: 
                    
${day}.${month} | ${chas}:${minut} | ${project_name} | U.L.E.Y
                
${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                    
            
            //получить менеджера проекта из ноушена
            let project_manager;
            const res = await fetch(`${botApiUrl}/project/${project.projectId}`)
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    project_manager = data?.properties.Manager.relation[0]?.id;
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
                    console.log("Manager TelegramId: ", data)
                    chatId_manager = data
                } else {
                    console.log("Manager TelegramId не найден!")
                }                             
            });

            const report = await bot.sendMessage(chatId_manager, text) 
            
            // сохранить отправленное боту сообщение пользователя в БД
            const convId = sendMyMessage(text, 'text', chatId_manager, report.message_id)

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
        }// end if
    
        i++ // счетчик интервалов
    }, 60000); //каждую 1 минуту

    // остановить вывод через 30 дней
    if (minutCount == 43200) {
        clearInterval(timerId);
    }
}



   

            //2) проверить массив специалистов
            // JSON.parse(project.spec).map((value)=> {           
            //     count_fio = 0;
            //     count_title = 0;

            //     //если бд ноушена доступна
            //     if (databaseBlock) {
            //         j = 0
            //         databaseBlock.map((db) => {
            //             if (value.spec === db.spec) {
            //                 if (db.fio) {
            //                     count_fio++               
            //                 }else {
            //                     count_fio;
            //                 }  
            //             }
            //         })

            //         const obj = {
            //             title: value.spec,
            //             title2: value.cat,
            //             count_fio: count_fio,
            //             count_title: value.count,
            //         }
            //         arr_count.push(obj) 

            //         //сохранение массива в 2-х элементный массив
            //         if (i % 2 == 0) {
            //             arr_all[0] = arr_count
            //         } else {
            //             arr_all[1] = arr_count 
            //         }
            //     } else {
            //         console.log("База данных не найдена! Проект ID: " + project.name)
            //         j++ //счетчик ошибок доступа к БД ноушена
            //         console.log("Ошибка № " + j)
            //         if (j > 10) {
            //             console.log("Цикл проекта " + project.name + " завершен!")
            //             clearTimeout(timerId);
            //         }
            //     }                                          
            // }) // map spec end

            //получить название проекта из ноушена
            // let project_name;
            // const res = await fetch(
            //      `${botApiUrl}/project/${project.projectId}`
            // )
            // .then((response) => response.json())
            // .then((data) => {
            //     if (data) {
            //         project_name = data?.properties.Name.title[0]?.plain_text;
            //     }  else {
            //         project_name = project.name
            //     }                             
            // });

            // var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);

                
            //3) отправить сообщение если есть изменения в составе работников    
//             if (!isEqual) {
//                 const text = `Запрос на специалистов: 
                        
// ${day}.${month} | ${chas}:${minut} | ${project_name} | U.L.E.Y
                    
// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`

 
                
//                     //получить менеджера проекта из ноушена
//                     let project_manager;
//                     const res = await fetch(
//                         `${botApiUrl}/project/${project.projectId}`
//                     )
//                     .then((response) => response.json())
//                     .then((data) => {
//                         if (data) {
//                             project_manager = data?.properties.Manager.relation[0]?.id;
//                         }  else {
//                             project_manager = ''
//                         }                             
//                     });

//                     //получить chatId менеджера проекта из ноушена
//                     let chatId_manager;
//                     const chat = await fetch(
//                         `${botApiUrl}/managers/${project_manager}`
//                     )
//                     .then((response) => response.json())
//                     .then((data) => {
//                         if (data) {
//                             console.log("Manager TelegramId: ", data)
//                             chatId_manager = data
//                         }  else {
//                             console.log("Manager TelegramId не найден!")
//                         }                             
//                     });

//                     const report2 = await bot.sendMessage(chatId_manager, text2)

//                     // сохранить отправленное боту сообщение пользователя в БД
//                     const convId = sendMyMessage(text2, 'text', chatId_manager, report2.message_id)

//                     //Подключаемся к серверу socket
//                     let socket = io(socketUrl);
//                     socket.emit("addUser", chatId_manager)

//                     //отправить сообщение в админку
//                     socket.emit("sendMessage", {
//                                 senderId: chatId_manager,
//                                 receiverId: chatTelegramId,
//                                 text: text2,
//                                 type: 'text',
//                                 convId: convId,
//                                 messageId: report2.message_id,
//                     }) 
                


//             } // end if
            
//             i++ // счетчик интервалов
//         }, 60000); //каждую 1 минуту

//     }

