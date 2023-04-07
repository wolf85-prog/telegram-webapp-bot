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

let project_id, projectId, projectName, projectDate, projectTime, dateStart, manager_id, company_id, Geo, Teh, Worklist, Equipmentlist
let blockId

//functions
const newDatabase1 = require('./bot/common/newDatabase1')
const newDatabase2 = require('./bot/common/newDatabase2')
const newDatabase3 = require('./bot/common/newDatabase3')
const newDatabase4 = require('./bot/common/newDatabase4')
const newDatabase5 = require('./bot/common/newDatabase5')
const sendMyMessage = require('./bot/common/sendMyMessage')
const getReports = require('./bot/common/getReports')
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
const {UserBot, Message, Conversation, Project} = require('./bot/models/models')

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
        console.log("1 Success! Project with geo added. " + res_id)

        //создание базы данных "График работы"
        await newDatabase1(res_id);
        await newDatabase2(res_id, worklist);
        await newDatabase3(res_id);
        await newDatabase5(res_id);
        await newDatabase4(res_id, equipmentlist); 

        return res_id;

    } catch (error) {
        console.error(error.body)
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
        console.log("Success! Project not geo added. " + res_id)        

        //создание базы данных "График работы"
        await newDatabase1(res_id);
        await newDatabase2(res_id, worklist);
        await newDatabase3(res_id);
        await newDatabase5(res_id);
        await newDatabase4(res_id, equipmentlist);

        return res_id;

    } catch (error) {
        console.error(error.body)
    }
}

//----------------------------------------------------------------------------------------------------------------

//send data to notion
async function addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist, equipmentlist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseAddressId },
            properties: {
                "Название": {
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
        console.log("Success! Entry address added. " + response.id)

        //добавление проекта с названием проекта в базу
        const project_id = await addProject(projectname, datestart, teh, managerId, companyId, worklist, equipmentlist, response.id);

        return project_id

    } catch (error) {
        console.error(error.body)
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
    const text = msg.text;
    const messageId = msg.message_id;

    //console.log(msg)

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
                console.log('Ошибка работы БД. Пользователь уже существует')
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
                    filePath.on('finish',() => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        let convId;
                        if(msg.document) {
                            // сохранить отправленное боту сообщение пользователя в БД
                            convId = sendMyMessage(`${botApiUrl}/${msg.document.file_name}`, 'file', chatId, messageId)
                        }

                        // Подключаемся к серверу socket
                        let socket = io(socketUrl);

                        socket.emit("addUser", chatId)
                        //socket.on("getUsers", users => {
                            //console.log("users from bot: ", users);
                        //})

                        socket.emit("sendMessage", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${msg.document.file_name}`,
                            convId: convId,
                        })
                    })
                })
            } catch (error) {
                
            }
        }
        
        //обработка изображений
        if (msg.photo && msg.photo[3]) {
            console.log(msg.photo)
            const image = await bot.getFile(msg.photo[3].file_id);

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
                    filePath.on('finish',() => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        // сохранить отправленное боту сообщение пользователя в БД
                        const convId = sendMyMessage(`${botApiUrl}/${filename}.jpg`, 'image', chatId, messageId)

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
                            convId: convId,
                        })
                    })
                })            
            } catch (error) {
                console.log(error)
            }
            //await bot.sendMessage(chatId, 'Изображение отправлено администратору!');
        }
//----------------------------------------------------------------------------------------------------------------      
        
        //обработка сообщений    
        if ((text || '')[0] !== '/') {       
            if (text.includes("Reply")) {           
                await bot.sendMessage(text.substring(6, text.indexOf('.')), text.slice(text.indexOf('.') + 2)) 

            // Проект успешно создан
            } else if (text.includes('Проект успешно создан')) {           
                await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)
                await bot.sendMessage(chatGiaId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

                //отправить сообщение о создании проекта в админ-панель
                sendMyMessage(text, "text", chatId, messageId)

                const specArr = Worklist.map(item => ({
                    spec: item.spec,
                    cat: item.cat,
                    count: item.count,
                }));

                let equipArr = [{}]
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
                    console.log('Проект успешно добавлен в БД! Project: ')  

                    const project = await Project.findOne({where:{id: res.id}})
                
//-------------------------------------------------------------------------------------------------------------------------------
//--------------------------- Создание проекта ----------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
                    //добавление геопозиции в БД Площадки (Адрес) и добавление проекта
                    if (Geo != '') {
                        projectId = await addAddress(project.geo, project.name, project.datestart, project.teh, project.managerId, project.companyId, Worklist, Equipmentlist);
                    } else {
                        //добавление проекта с названием проекта в базу
                        projectId = await addProjectNotGeo(project.name, project.datestart, project.teh, project.managerId, project.companyId, Worklist, Equipmentlist);
                    }

                    //обновить проект 
                    await Project.update({projectId: projectId},{where: {id: res.id}})

                    // отправить сообщение пользователю через 30 секунд
                    setTimeout(() => {bot.sendMessage(project.chatId, 'Ваша заявка принята!')}, 30000) // 30 секунд
                    
                    //начать получать отчеты
                    console.log('START GET REPORTS')
                    const project2 = await Project.findOne({where:{projectId: projectId}})

                    const d = new Date(project2.datestart);
                    const year = d.getFullYear();
                    const month = String(d.getMonth()+1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    const chas = d.getHours();
                    const minut = String(d.getMinutes()).padStart(2, "0");

                    let count_fio;
                    let i = 0;
                    let arr_count = [] 
                    let arr_all = [] 

                    if (JSON.parse(project2.spec).length > 0) {
// начало цикла Специалисты ----------------------------------------------------------------------
                        // повторить с интервалом 1 минуту
                        let timerId = setInterval(async() => {
                            arr_count = [] 
                            const blockId = await getBlocks(project2.projectId);
                            console.log("blockId " + i + ": " + blockId)

                            //if (blockId !== 'undefined') { 
                                let databaseBlock = await getDatabaseId(blockId); 
                                //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

                                JSON.parse(project2.spec).map((value)=> {
                                    //console.log("value: ", value)                                
                                    count_fio = 0;
                                    count_title = 0;
                                    if (databaseBlock) {
                                        databaseBlock.map((db) => {
                                            //console.log("db: ", db)
                                            if (value.spec === db.spec) {
                                                if (db.fio) {
                                                    count_fio++               
                                                }else {
                                                    count_fio;
                                                }  
                                            }
                                        })
                                    } else {
                                        console.log("База данных не найдена")
                                    }
                                    
                                    const obj = {
                                        title: value.spec,
                                        title2: value.cat,
                                        count_fio: count_fio,
                                        count_title: value.count,
                                    }
                                    arr_count.push(obj)                                     
                                })
                                //console.log("arr_count (spec): ", arr_count)

                                //сохранение массива в 2-х элементный массив
                                if (i % 2 == 0) {
                                    arr_all[0] = arr_count
                                } else {
                                    arr_all[1] = arr_count 
                                }

                                var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
                                // если есть изменения в составе работников    
                                if (!isEqual) {
                                    //отправка сообщения в чат бота
                                    await bot.sendMessage(project2.chatId, 
                                    `Запрос на специалистов: 
                                        
${day}.${month} | ${chas}:${minut} | ${project2.name} | U.L.E.Y

${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
        ).join('\n')}`                         
                                    )
                                } 

                                i++ 

                            //}                   
                            //else {
                            //    console.log('Блок не найден!')
                            //}

                        }, 60000); //каждую 1 минуту

                        // остановить вывод через 260 минут
                        setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут                        
                    
                    } else if (JSON.parse(project2.equipment).length > 0) {
// начало цикла Оборудование ----------------------------------------------------------------------
                        // повторить с интервалом 1 минуту
                        let timerId = setInterval(async() => {

                            const blockId = await getBlocks(project2.projectId);
                            console.log("blockId " + i + ": " + blockId)

                            //if (blockId !== 'undefined') { 
                                let databaseBlock = await getDatabaseId(blockId); 
                                //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

                                arr_count = [] 

                                JSON.parse(project2.equipment).map((value)=> {
                                
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
                                    }
                                    
                                    const obj = {
                                        title: value.subname,
                                        title2: value.cat,
                                        count_name: count_name,
                                        count_title: value.count,
                                    }
                                    arr_count.push(obj)                                     
                                })

                                //console.log("arr_count (equipment): ", arr_count)

                                //сохранение массива в 2-х элементный массив
                                if (i % 2 == 0) {
                                    arr_all[0] = arr_count
                                } else {
                                    arr_all[1] = arr_count 
                                }

                                var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
                                // если есть изменения в составе работников    
                                if (!isEqual) {
                                    //отправка сообщения в чат бота
                                    await bot.sendMessage(project2.chatId, 
                                        `Запрос на оборудование: 
                                                            
${day}.${month} | ${chas}:${minut} | ${project2.name} | U.L.E.Y

${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_name + '\/' + item.count_title + ' [' + item.title2 + ']'
        ).join('\n')}`                         
                                )
                            } 

                            i++ 

                        //}                   
                        // else {
                        //     console.log('Блок не найден!')
                        // }

                       

        }, 60000); //каждую 1 минуту


                    // остановить вывод через 260 минут
                    setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут

                    }

                                    
                } catch (error) {
                    console.log(error)
                }
//----------------------------------------------------------------------------------------------------------------
            } else if (text.includes('Тестовое сообщение')) {  
           
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
                    convId: convId,
                    messageId: messageId,
                })

            } else {
//----------------------------------------------------------------------------------------------------------------
                // сохранить отправленное боту сообщение пользователя в БД
                const convId = sendMyMessage(text, 'text', chatId, messageId)

                // Подключаемся к серверу socket
                let socket = io(socketUrl);

                socket.emit("addUser", chatId)
                socket.on("getUsers", users => {
                    //console.log("users from bot: ", users);
                })

                socket.emit("sendMessage", {
                    senderId: chatId,
                    receiverId: chatTelegramId,
                    text: text,
                    convId: convId,
                    messageId: messageId,
                })

                // ответ бота
                //await bot.sendMessage(chatId, `Ваше сообщение "${text}" отправлено!`)
                await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)           
            }
        }

    } catch (error) {
        //await bot.sendMessage(chatId, 'Произошла непредвиденная ошибка!');
        console.log('Произошла непредвиденная ошибка! ', error)
    }
    
  });

//--------------------------------------------------------------------------------------------------------------------
  
  //Ответ на нажатие кнопок настройки и информаци
  bot.on('callback_query', msg => {
    const data = msg.data;
    const chatId = msg.message.chat.id;
  
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
        const convId = sendMyMessage('Пользователь нажал кнопку в рассылке', "text", chatId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку в рассылке',
            convId: convId,
        })


        return bot.sendMessage(chatId, 'Вы нажали кнопку')
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
        console.log('Подключение к БД сломалось!', error)
    }
}

start()