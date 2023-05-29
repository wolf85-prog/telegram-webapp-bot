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

//socket.io
const {io} = require("socket.io-client")

//fetch api
const fetch = require('node-fetch');

module.exports = async function getReports(project, bot) {
    console.log('START GET REPORTS: ' + project.id + " " + project.name)

    const d = new Date(project.datestart);
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const chas = d.getHours();
    const minut = String(d.getMinutes()).padStart(2, "0");

    let count_fio;
    let i = 0;
    let j = 0;
    let databaseBlock
    let arr_count
    let arr_all = [] 

    if (JSON.parse(project.spec).length > 0) {
        // начало цикла Специалисты ----------------------------------------------------------------------
        // 86400 секунд в дне
        var minutCount = 0;
        
        // повторить с интервалом 1 минуту
        let timerId = setInterval(async() => {
            minutCount++  // a day has passed
            arr_count = [] 

            //1)получить блок и бд
            if (project.projectId) {
                const blockId = await getBlocks(project.projectId);
                console.log("i: " + i + " " +  new Date() + " Проект: " + project.name) 
                databaseBlock = await getDatabaseId(blockId); 
            }

            //2) проверить массив специалистов
            JSON.parse(project.spec).map((value)=> {           
                count_fio = 0;
                count_title = 0;

                //если бд ноушена доступна
                if (databaseBlock) {
                    j = 0
                    databaseBlock.map((db) => {
                        if (value.spec === db.spec) {
                            if (db.fio) {
                                count_fio++               
                            }else {
                                count_fio;
                            }  
                        }
                    })

                    const obj = {
                        title: value.spec,
                        title2: value.cat,
                        count_fio: count_fio,
                        count_title: value.count,
                    }
                    arr_count.push(obj) 

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
            }) // map spec end

            //получить название проекта из ноушена
            let project_name;
            const res = await fetch(
                 `${botApiUrl}/project/${project.projectId}`
            )
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    project_name = data?.properties.Name.title[0]?.plain_text;
                }  else {
                    project_name = project.name
                }                             
            });

            var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);

            //console.log(JSON.stringify(arr_all[0]))
            //console.log(JSON.stringify(arr_all[1]))
                
            //3) отправить сообщение если есть изменения в составе работников    
            if (!isEqual) {
                const text = `Запрос на специалистов: 
                        
${day}.${month} | ${chas}:${minut} | ${project_name} | U.L.E.Y
                    
${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                    
                //отправка сообщения в чат бота
                const report = await bot.sendMessage(project.chatId, text)

                // сохранить отправленное боту сообщение пользователя в БД
                const convId = sendMyMessage(text, 'text', project.chatId, report.message_id)

                //Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", project.chatId)

                //отправить сообщение в админку
                socket.emit("sendMessage", {
                            senderId: project.chatId,
                            receiverId: chatTelegramId,
                            text: text,
                            type: 'text',
                            convId: convId,
                            messageId: report.message_id,
                })  

            } // end if
            
            i++ // счетчик интервалов
        }, 60000); //каждую 1 минуту

        // остановить вывод через 30 дней
        if (minutCount == 43200) {
            clearInterval(timerId);
        }   
    } else if (JSON.parse(project.equipment).length > 0) {
        // начало цикла Оборудование ----------------------------------------------------------------------
        // повторить с интервалом 1 минуту
        let timerId = setInterval(async() => {

            const blockId = await getBlocks(project.projectId);

            let databaseBlock = await getDatabaseId(blockId); 
            //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

            arr_count = [] 

            JSON.parse(project.equipment).map((value)=> {                              
                    count_name= 0;
                    
                    if (databaseBlock) {
                        databaseBlock.map((db) => {
                            if (value.cat === db.category) {
                                if (db.subname) {
                                    count_name++               
                                }else {
                                    count_name;
                                }  
                            }
                        })                                   
                    
                        const obj = {
                            title: value.subname,
                            title2: value.cat,
                            count_name: count_name,
                            count_title: value.count,
                        }
                        arr_count.push(obj)  
                        
                        //сохранение массива в 2-х элементный массив
                        if (i % 2 == 0) {
                            arr_all[0] = arr_count
                        } else {
                            arr_all[1] = arr_count 
                        }
                    } else {
                        console.log("База данных не найдена! Проект ID: " + project.name)
                    }  

            }) // map equipment end
                
            var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
                
            // если есть изменения в составе работников    
            if (!isEqual) {
                const text = `Запрос на специалистов: 
                        
${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y
                    
${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                    
                //отправка сообщения в чат бота
                const report2 = bot.sendMessage(project.chatId, text)

                // сохранить отправленное боту сообщение пользователя в БД
                const convId = sendMyMessage(text, 'text', project.chatId, report2.message_id)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);

                socket.emit("addUser", project.chatId)

                //отправить сообщение в админку
                socket.emit("sendMessage", {
                    senderId: project.chatId,
                    receiverId: chatTelegramId,
                    text: text,
                    type: 'text',
                    convId: convId,
                    messageId: report2.message_id,
                })
            } // end if

            i++ //счетчик интервалов
        }, 60000); //каждую 1 минуту

        // остановить вывод через 260 минут
        //setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут
        
        // остановить вывод через 30 дней
        if (minutCount == 43200) {
            clearInterval(timerId);
        }
    }
}