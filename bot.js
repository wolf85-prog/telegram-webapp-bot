require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const {menuOptions, backOptions} = require('./options')
const token = process.env.TELEGRAM_API_TOKEN
const bot = new TelegramBot(token, {polling: true});
const { Op } = require('sequelize')

// web-приложение
const webAppUrl = process.env.WEB_APP_URL;
const botApiUrl = process.env.REACT_APP_API_URL
const socketUrl = process.env.SOCKET_APP_URL

//socket.io
const {io} = require("socket.io-client")

//fetch api
const fetch = require('node-fetch');

//планировщик
var cron = require('node-cron');

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID
const databaseAddressId = process.env.NOTION_DATABASE_ADDRESS_ID
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
const databaseManagerId = process.env.NOTION_DATABASE_MANAGER_ID
const chatGroupId = process.env.CHAT_GROUP_ID
const chatTelegramId = process.env.CHAT_ID
const chatGiaId = process.env.GIA_CHAT_ID


let projectId, projectName, projectDate, projectTime, dateStart, manager_id, company_id, Geo, Teh, Worklist, Equipmentlist;

//functions
const newDatabase1 = require('./bot/common/newDatabase1')
const newDatabase2 = require('./bot/common/newDatabase2')
const newDatabase3 = require('./bot/common/newDatabase3')
const newDatabase4 = require('./bot/common/newDatabase4')
const newDatabase5 = require('./bot/common/newDatabase5')
const sendMyMessage = require('./bot/common/sendMyMessage')
const getReports = require('./bot/common/getReports')
const getReportsNotion = require("./bot/common/getReportsNotion");
const getReportsTest = require("./bot/common/getReportsTest");
const getBlocks = require('./bot/common/getBlocks')
const getDatabaseId = require('./bot/common/getDatabaseId')

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const https = require('https');
const router = require('./bot/routes/index')
const errorHandler = require('./bot/middleware/ErrorHandling')
const path = require('path')

//подключение к БД PostreSQL
const sequelize = require('./bot/connections/db')
const {UserBot, Message, Conversation, Project, Report} = require('./bot/models/models');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('telegram-webapp-bot'));
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/', router)

// Certificate
const privateKey = fs.readFileSync('privkey.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);

//--------------------------------------------------------------------------------------------------------
//              REQUEST
//--------------------------------------------------------------------------------------------------------

//создание страницы (проекта) базы данных проектов
app.post('/web-data', async (req, res) => {
    const {queryId, projectname, datestart, geo, teh, managerId, companyId, worklist = [], equipmentlist = []} = req.body;
    const d = new Date(datestart);
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const chas = d.getHours();
    const minut = String(d.getMinutes()).padStart(2, "0");
    try {
        if (worklist.length > 0) {

            console.log("Начинаю сохранять данные по заявке...")
            projectName = projectname
            projectDate = `${day}.${month}`
            projectTime = `${chas}:${minut}`
            dateStart = datestart
            Teh = teh
            Worklist = worklist
            Equipmentlist = equipmentlist 
            manager_id = managerId
            company_id = companyId
            Geo = geo   
            console.log("Сохранение данных завершено: ", projectName)
            
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Проект успешно создан',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
  `Проект успешно создан!
  
<b>Проект:</b> ${projectname} 
<b>Дата:</b> ${day}.${month}.${year}
<b>Время:</b> ${chas}:${minut} 
<b>Адрес:</b> ${geo} 
<b>Тех. задание:</b> ${teh}
  
<b>Специалисты:</b>  
${worklist.map(item =>' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
              }
        })

        
        //отправить сообщение в чат-админку
        await bot.sendMessage(chatGroupId, 
  `Проект успешно создан! 
  
Название проекта:  ${projectname} 
Дата: ${day}.${month}.${year}
Время: ${chas}:${minut} 
Адрес: ${geo} 
Тех. задание: ${teh} 
  
Специалисты:  
${worklist.map(item => ' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
          )
  

        } 
        
        if (equipmentlist.length > 0) {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Проект успешно создан',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
  `Проект успешно создан!
  
<b>Проект:</b> ${projectname} 
<b>Дата:</b> ${day}.${month}.${year}
<b>Время:</b> ${chas}:${minut} 
<b>Адрес:</b> ${geo} 
<b>Тех. задание:</b> ${teh}

<b>Оборудование:</b>  
${equipmentlist.map(item =>' - ' + item.subname + ' = ' + item.count + ' шт.').join('\n')}`
              }
        })

        
        //отправить сообщение в чат-админку
        await bot.sendMessage(chatGroupId, 
  `Проект успешно создан! 
  
Название проекта:  ${projectname} 
Дата: ${day}.${month}.${year}
Время: ${chas}:${minut} 
Адрес: ${geo} 
Тех. задание: ${teh} 

Оборудование:  
${equipmentlist.map(item =>' - ' + item.subname + ' = ' + item.count + ' шт.').join('\n')}`
          )
  
          projectName = projectname
          projectDate = `${day}.${month}`
          projectTime = `${chas}:${minut}`
          dateStart = datestart
          Teh = teh
          Worklist = worklist
          Equipmentlist = equipmentlist 
          manager_id = managerId
          company_id = companyId
          Geo = geo  

        } 
  
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})


//--------------------------------------------------------------------------------------------------

//Добавление проекта в Notion (addProject send data to notion)
async function addProject(title, time, teh, managerId, companyId, worklist, equipmentlist, geoId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            icon: {
                type: "emoji",
                emoji: "🟦"
            },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                Date: {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                TechClient: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: teh,
                            },
                        }
                        ],
                },
                TechPoster: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: 'Данные | Данные | Данные * 10 — 12 часов * 0 000.00 — 0 000.00 руб/час ',
                            },
                        }
                        ],
                },
                Status: {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                City: {
                    type: 'select',
                    select: {
                        "id": "4e370773-fb5d-4ef7-bd2a-eaa91e5919e0",
                        "name": "Test",
                        "color": "brown"
                    }
                },
                Manager: {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                Company: {
                    type: "relation",
                    relation: [
                        {
                            "id": companyId
                        }
                    ]
                },
                "Площадка": {
                    "type": "relation",
                    "relation": [
                        {
                            "id": geoId
                        }
                    ],
                    "has_more": false
                }
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log(new Date())
        console.log("1. Проект с адресом успешно добавлен! " + res_id)

        await newDatabase1(res_id);                //создание базы данных "График работы"    
        await newDatabase2(res_id, worklist, time);//создание базы данных "Основной состав"   
        await newDatabase3(res_id);                //создание базы данных "Запасной состав"
        await newDatabase5(res_id);                //создание базы данных "Претенденты"   
        await newDatabase4(res_id, equipmentlist); //создание базы данных "Оборудование"

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}


//Добавление проекта в Notion без адреса (addProjectNotGeo)
async function addProjectNotGeo(title, time, teh, managerId, companyId, worklist, equipmentlist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            icon: {
                type: "emoji",
                emoji: "🟦"
            },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                Date: {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                TechClient: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: teh,
                            },
                        }
                        ],
                },
                TechPoster: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: 'Данные | Данные | Данные * 10 — 12 часов * 0 000.00 — 0 000.00 руб/час ',
                            },
                        }
                        ],
                },
                Status: {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                City: {
                    type: 'select',
                    select: {
                        "id": "4e370773-fb5d-4ef7-bd2a-eaa91e5919e0",
                        "name": "Test",
                        "color": "brown"
                    }
                },
                Manager: {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                Company: {
                    type: "relation",
                    relation: [
                        {
                            "id": companyId
                        }
                    ]
                },
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log(new Date())
        console.log("1. Проект без адреса успешно добавлен! " + res_id)        

        
        await newDatabase1(res_id);                //создание базы данных "График работы"    
        await newDatabase2(res_id, worklist, time);      //создание базы данных "Основной состав"   
        await newDatabase3(res_id);                //создание базы данных "Запасной состав"
        await newDatabase5(res_id);                //создание базы данных "Претенденты"   
        await newDatabase4(res_id, equipmentlist); //создание базы данных "Оборудование"

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}

//----------------------------------------------------------------------------------------------------------------

//send data to notion
async function addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist, equipmentlist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseAddressId },
            properties: {
                "Название площадки": {
                    type: "title",
                    title: [
                        {
                            type: "text",
                            text: {
                                content: geo,
                                "link": null
                            },
                            plain_text: geo,
                            "href": null
                        }
                    ]
                },
                "Адрес": {
                    type: "rich_text",
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: geo,
                                "link": null
                            },
                            plain_text: geo,
                            "href": null
                        }
                    ]
                },
            },
        })
        //console.log(response)
        console.log("0. Адрес успешно добавлен! " + response.id)

        //добавление проекта с названием проекта в базу
        const project_id = await addProject(projectname, datestart, teh, managerId, companyId, worklist, equipmentlist, response.id);

        return project_id

    } catch (error) {
        console.error(error.message)
    }
}


//-------------------------------------------------------------------------------------------------------

bot.setMyCommands([
    // {command: '/start', description: 'Начальное приветствие'},
    // {command: '/menu', description: 'Главное меню'},
    // {command: '/info', description: 'Получить информацию о боте'},
    // {command: '/settings', description: 'Настройки'},
])

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const firstname = msg.from.first_name
    const lastname = msg.from.last_name
    const text = msg.text ? msg.text : '';
    const messageId = msg.message_id;

    //console.log("msg: ", msg)
    //console.log("text: ", text)

    try {
        // обработка команд
        // команда Старт
        if (text === '/start') {
            //добавить пользователя в бд
            const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
            if (!user) {
                await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId })
                console.log('Пользователь добавлен в БД')
            } else {
                console.log('Отмена добавления в БД. Пользователь уже существует')
            }
        
            await bot.sendMessage(chatId, 'Добро пожаловать в телеграм-бот U.L.E.Y_Projects. Смотрите и создавайте проекты U.L.E.Y в ' +
                'web-приложении прямо из мессенджера Telegram.', {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                        [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
                    ]
                })
            })
        }
      
        // команда Меню
        if (text === '/menu') {
            await bot.sendMessage(chatId, 'Смотрите и создавайте проекты U.L.E.Y в web-приложении прямо из мессенджера Telegram.', {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                        [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
                    ]
                })
            })
        }     
      
        // команда Информация
        if (text === '/information') {
            const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
            await bot.sendMessage(chatId, `Приветствуем тебя, ${firstname} ${lastname}! Чат-бот предназначен для создания проектов в U.L.E.Y и общения заказчика с администратором проектов.`);
        }


        // команда Добавить таблицу Претенденты
        if (text === '/addpretendents') {
            const project_id = 'e9fcd9a3-726f-4ae7-bc01-a9d2c84a3e0e'; 
            await newDatabase5(project_id);
        }

        if(text.startsWith('/startreports')) {
            const project = text.split(' ');

            const project2 = await Project.findOne({ where:{ id: project[1] } })

            //начать получать отчеты
            getReportsTest(project2, bot)
        }


        if(text.startsWith('/startnotionreports')) {
            const project = text.split(' ');

            const res = await fetch(`${botApiUrl}/project/${project[1]}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("проект найден!", data) 
                //начать получать отчеты
                getReportsNotion(data, bot)                           
            });

            
        }

//------------------------------------------------------------------------------------------------

        //обработка контактов
        if (msg.contact) {
            await bot.sendMessage(chatId, `Ваш контакт получен!`)
            const phone = msg.contact.phone_number
            const firstname = msg.contact.first_name
            const lastname = msg.contact.last_name ? msg.contact.last_name : ''
            
            //const response = await bot.sendContact(chatTelegramId, phone, firstname, lastname, vcard)  
            //const response2 = await bot.sendContact(chatGiaId, phone, firstname, lastname, vcard)   
            const text_contact = `${phone} ${firstname} ${lastname}`

            console.log("Отправляю контакт в админ-панель...")

            //отправить сообщение о контакте в админ-панель
            const convId = await sendMyMessage(text_contact, "text", chatId, messageId)
                
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)
                 
                //отправить сообщение в админку
                socket.emit("sendMessage", {
                     senderId: chatId,
                     receiverId: chatTelegramId,
                     text: text_contact,
                     type: 'text',
                     convId: convId,
                     messageId: messageId,
                 })
        }
//--------------------------------------------------------------------------------------------------
        //обработка документов
        if (msg.document) {
            console.log(msg.document)
            const docum = await bot.getFile(msg.document.file_id);
            try {
                const res = await fetch(
                    `https://api.telegram.org/bot${token}/getFile?file_id=${docum.file_id}`
                );

                // extract the file path
                const res2 = await res.json();
                const filePath = res2.result.file_path;

                // now that we've "file path" we can generate the download link
                const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;

                https.get(downloadURL,(res) => {
                    const filename = Date.now()
                    // Image will be stored at this path
                    let path;
                    let ras;
                    if(msg.document) {
                        ras = msg.document.mime_type.split('/')
                        //path = `${__dirname}/static/${filename}.${ras[1]}`; 
                        path = `${__dirname}/static/${msg.document.file_name}`; 
                    }
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', async () => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        let convId;
                        if(msg.document) {
                            // сохранить отправленное боту сообщение пользователя в БД
                            convId = await sendMyMessage(`${botApiUrl}/${msg.document.file_name}`, 'file', chatId, messageId)
                        }

                        // Подключаемся к серверу socket
                        let socket = io(socketUrl);
                        socket.emit("addUser", chatId)
                        socket.emit("sendMessage", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${msg.document.file_name}`,
                            convId: convId,
                        })
                    })
                })
            } catch (error) {
                console.log(error.message)
            }
        }
//----------------------------------------------------------------------------------------------------------------          
        //обработка изображений
        if (msg.photo) {
            console.log(msg.photo)
            //console.log(msg.photo.length)
            const image = await bot.getFile(msg.photo[msg.photo.length-1].file_id);

            try {
                const res = await fetch(
                    `https://api.telegram.org/bot${token}/getFile?file_id=${image.file_id}`
                );

                // extract the file path
                const res2 = await res.json();
                const filePath = res2.result.file_path;

                // now that we've "file path" we can generate the download link
                const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;

                https.get(downloadURL,(res) => {
                    const filename = Date.now()
                    // Image will be stored at this path
                    const path = `${__dirname}/static/${filename}.jpg`; 
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', async () => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        // сохранить отправленное боту сообщение пользователя в БД
                        const convId = await sendMyMessage(`${botApiUrl}/${filename}.jpg`, 'image', chatId, messageId)

                        // Подключаемся к серверу socket
                        let socket = io(socketUrl);

                        socket.emit("addUser", chatId)
                        //socket.on("getUsers", users => {
                            //console.log("users from bot: ", users);
                        //})

                        socket.emit("sendMessage", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${filename}.jpg`,
                            type: 'image',
                            convId: convId,
                        })
                    })
                })            
            } catch (error) {
                console.log(error.message)
            }
        }
//---------------------------------------------------------------------------------------------------------------

 //обработка аудио сообщений
 if (msg.voice) {
    await bottest.sendMessage(chatId, `Ваше аудио-сообщение получено!`)
    const voice = await bottest.getFile(msg.voice.file_id);

    try {
        const res = await fetch(
            `https://api.telegram.org/bot${token}/getFile?file_id=${voice.file_id}`
        );

        // extract the file path
        const res2 = await res.json();
        const filePath = res2.result.file_path;

        // now that we've "file path" we can generate the download link
        const downloadURL = `https://api.telegram.org/file/bot${token}/${filePath}`;

        https.get(downloadURL,(res) => {
            const filename = Date.now()
            // Image will be stored at this path
            let path;
            let ras;
            if(msg.voice) {
                ras = msg.voice.mime_type.split('/')
                //path = `${__dirname}/static/${filename}.${ras[1]}`; 
                path = `${__dirname}/static/${msg.voice.file_unique_id}.${ras[1]}`; 
            }
            const filePath = fs.createWriteStream(path);
            res.pipe(filePath);
            filePath.on('finish', async () => {
                filePath.close();
                console.log('Download Completed: ', path); 
                
                let convId;
                if(msg.voice) {
                    // сохранить отправленное боту сообщение пользователя в БД
                    convId = await sendMyMessage(`${botApiUrl}/${msg.voice.file_name}`, 'file', chatId, messageId)
                }

                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)
                socket.emit("sendMessage", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: `${botApiUrl}/${msg.voice.file_name}`,
                    convId: convId,
                })
            })
        })            
    } catch (error) {
        console.log(error.message)
    }
}

//----------------------------------------------------------------------------------------------------------------      
        
        //обработка сообщений    
        if ((text || '')[0] !== '/' && text) {       
            if (text.startsWith("Reply")) {           
                await bot.sendMessage(text.substring(6, text.indexOf('.')), text.slice(text.indexOf('.') + 2)) 

            // Проект успешно создан
            } else if (text.startsWith('Проект успешно создан')) {           
                const response = await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

                console.log("Отправляю сообщение в админ-панель...")

                //отправить сообщение о создании проекта в админ-панель
                const convId = await sendMyMessage(text, "text", chatId, response.message_id)
                
                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.emit("addUser", chatId)
                 
                //отправить сообщение в админку
                socket.emit("sendMessage", {
                     senderId: chatId,
                     receiverId: chatTelegramId,
                     text: text,
                     type: 'text',
                     convId: convId,
                     messageId: response.message_id,
                 })


                //массив специалистов
                let specArr = []
                console.log("Сохраняю Worklist в БД: ", Worklist)
                if (Worklist !== '') {
                    specArr = Worklist.map(item => ({
                        spec: item.spec,
                        cat: item.cat,
                        count: item.count,
                    }));
                }

                //массив оборудования
                let equipArr = []
                console.log("Сохраняю Equipmentlist в БД: ", Equipmentlist)
                if (Equipmentlist !== '') {
                    equipArr = Equipmentlist.map(item => ({
                        name: item.spec,
                        subname: item.subname,
                        cat: item.cat,
                        count: item.count,
                    }));
                } 

                try {
                    //создание проекта в БД
                    const res = await Project.create({ 
                        name: projectName, 
                        datestart: dateStart, 
                        spec: JSON.stringify(specArr),
                        equipment: JSON.stringify(equipArr),
                        teh: Teh, 
                        geo: Geo, 
                        managerId: manager_id, 
                        companyId: company_id, 
                        chatId: chatId
                    })

                    //очистить переменные
                    console.log("Очищаю переменные...")
                    projectName = '';
                    projectDate = '';
                    projectTime = '';
                    dateStart = '';
                    Teh = '';
                    //Worklist = [];
                    //Equipmentlist = [];
                    manager_id = '';
                    company_id = '';
                    Geo = '';

                    console.log('Проект успешно добавлен в БД! Project: ' + res.name)  
                    
                    const project = await Project.findOne({where:{id: res.id}})
                
//-------------------------------------------------------------------------------------------------------------------------------
//--------------------------- Создание проекта ----------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
                    //добавление геопозиции в БД Площадки (Адрес) и добавление проекта
                    if (project.geo != '') {
                        projectId = await addAddress(project.geo, project.name, project.datestart, project.teh, project.managerId, project.companyId, Worklist, Equipmentlist);
                    } else {
                        //добавление проекта с названием проекта в базу
                        projectId = await addProjectNotGeo(project.name, project.datestart, project.teh, project.managerId, project.companyId, Worklist, Equipmentlist);
                    }

                    //обновить проект 
                    await Project.update({projectId: projectId},{where: {id: res.id}})

                    // отправить сообщение пользователю через 30 секунд
                    setTimeout(() => {bot.sendMessage(project.chatId, 'Ваша заявка принята!')}, 25000) // 30 секунд                   
                    
                    const project2 = await Project.findOne({where:{id: res.id}})                   
                    
                    //начать получать отчеты
                    getReports(project2, bot)
                                    
                } catch (error) {
                    console.log(error.message)
                }
//----------------------------------------------------------------------------------------------------------------
            } else if (text.startsWith('Тестовое сообщение')) {  

                //добавление пользователя в БД
                const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId })
                    console.log('Пользователь добавлен в БД')
                } else {
                    console.log('Отмена операции! Пользователь уже существует')
                }
           
                // сохранить отправленное боту сообщение пользователя в БД
                const convId = await sendMyMessage(text, 'text', chatId, messageId)
                
                console.log("convId: ", convId)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);
                socket.on("welcome", async message=> {
                    console.log(message)
                });

                socket.emit("addUser", chatId)

                socket.emit("sendMessage", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                })

            } else {
//----------------------------------------------------------------------------------------------------------------
                //обработка исходящего сообщения

                //добавление пользователя в БД
                const user = await UserBot.findOne({where:{chatId: chatId.toString()}})
                if (!user) {
                    await UserBot.create({ firstname: firstname, lastname: lastname, chatId: chatId })
                    console.log('Пользователь добавлен в БД')
                } else {
                    console.log('Отмена операции! Пользователь уже существует')
                }

                //обработка пересылаемых сообщений
                let str_text;
                let reply_id;
                if (msg.reply_to_message) {
                    const message = await Message.findOne({where:{messageId: msg.reply_to_message.message_id.toString()}}) 
                   str_text = `${message.dataValues.text}_reply_${text}`  
                   reply_id = msg.reply_to_message.message_id              
                } else {
                    str_text = text
                }

                // сохранить отправленное боту сообщение пользователя в БД
                const convId = await sendMyMessage(str_text, 'text', chatId, messageId, reply_id)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);

                socket.emit("addUser", chatId)

                socket.emit("sendMessage", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: str_text,
                    type: 'text',
                    convId: convId,
                    messageId: messageId,
                    replyId: reply_id,
                })


                // ответ бота
                //await bot.sendMessage(chatId, `Ваше сообщение "${text}" отправлено!`)
                await bot.sendMessage(chatTelegramId, `${str_text} \n \n от ${firstname} ${lastname} ${chatId}`)           
            }
        }

    } catch (error) {
        console.log('Произошла непредвиденная ошибка! ', error.message)
    }
    
  });

//--------------------------------------------------------------------------------------------------------------------
  
  //Ответ на нажатие кнопок настройки и информаци
  bot.on('callback_query', async (msg) => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
    const messageId = msg.message.message_id;
  
    if (data === '/menu') {
        return bot.sendMessage(chatId, 'Смотрите и создавайте Notion-проекты в web-приложении прямо из мессенджера Telegram.', {
            reply_markup: ({
                inline_keyboard:[
                    [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                    [{text: 'Открыть Notion-проекты', web_app: {url: webAppUrl}}],
                ]
            })
        })
    }

    if (data === '/report') {
        //отправить сообщение о создании проекта в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку в рассылке', "text", chatId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку в рассылке',
            convId: convId,
            messageId: messageId,
        })


        return bot.sendMessage(chatId, 'Ваша заявка принята! Мы свяжемся с вами в ближайшее время.')
    }

    bot.sendMessage(chatId, `Вы нажали кнопку ${data}`, backOptions)
  });


// Обработка ошибок, последний middleware
app.use(errorHandler)

//-------------------------------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        
        httpsServer.listen(PORT, () => {
            console.log('HTTPS Server Bot running on port ' + PORT);
        });

    } catch (error) {
        console.log('Подключение к БД сломалось!', error.message)
    }
}

start()