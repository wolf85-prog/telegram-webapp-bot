require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const {menuOptions, backOptions} = require('./options')
const token = process.env.TELEGRAM_API_TOKEN
//const bot = new TelegramBot(token, {polling: true});

const bot = new TelegramBot(token, {
    polling: {
        autoStart: false,
    }
});

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

//мониторинг
const statusMonitor = require('express-status-monitor');

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
const host = process.env.HOST
const hostAdmin = process.env.HOST_ADMIN

let projectId, projectName, projectDate, projectTime, dateStart, manager_id, company_id, Geo, Teh, Worklist, Equipmentlist;

let socket = io(socketUrl);

let currentProcess = 0 
let dataProcess = true
let dataInterval = '0'
let dataTime = 'S'

//functions
const addTable = require('./bot/common/addTable')
const addMainSpec = require('./bot/common/addMainSpec')
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
const addPretendent = require('./bot/common/addPretendent')
const getBlocksP = require('./bot/common/getBlocksP')
const getBlock = require('./bot/common/getBlock')
const getNotif = require("./bot/common/getNotif");
const addAddress = require("./bot/common/addAddress")

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const https = require('https');
const router = require('./bot/routes/index')
const errorHandler = require('./bot/middleware/ErrorHandling')
const path = require('path')
const pm2 = require('pm2');

//подключение к БД PostreSQL
const sequelize = require('./bot/connections/db')
const { Op } = require('sequelize')
const {UserBot, Message, Company, Project, Manager, SoundNotif, ProjectNew, Platform} = require('./bot/models/models');
const updateToDo = require("./bot/common/updateToDo");
const getProject = require("./bot/common/getProject");
const sendMessageAdmin = require("./bot/common/sendMessageAdmin");
const getProjectNew = require("./bot/common/getProjectNew");
const getAllProjects = require("./bot/common/getAllProjects");
const getProjectsOn = require("./bot/common/getProjectsOn");
const updateToDoFinal = require("./bot/common/updateToDoFinal");
const updateSmetaFinal = require("./bot/common/updateSmetaFinal");
const getSmeta = require("./bot/common/getSmeta");
const updateSmeta = require("./bot/common/updateSmeta");
const getManagersAll = require("./bot/http/getManagersAll");
const getCompanyAll = require("./bot/http/getCompanyAll");
const getProjectsAll = require("./bot/http/getProjectsAll");
const getSoundNotif = require("./bot/common/getSoundNotif");
const getProjectTeh = require("./bot/common/getProjectTeh");
const updateProject = require("./bot/common/updateProject");

const {managerNotion} = require('./bot/data/managerNotion');
const {companyNotion} = require('./bot/data/companyNotion');
const {platformsNotion} = require('./bot/data/platformsNotion');

const app = express();

app.use(statusMonitor({
    title: 'Бот заказчиков',
    theme: '../../../../../custom.css',
})); // Enable Express Status Monitor middleware

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

//перезагрузка бота
bot.getUpdates().then((updates) => {
    if (updates[0] !== undefined) {
      if (updates[0].message.text.includes('/restart')) {
        bot.getUpdates({
          timeout: 1,
          limit: 0,
          offset: updates[0].update_id + 1
        });
        bot.sendMessage(updates[0].message.chat.id, 'Бот перезагружен');
      }
    }
});
bot.stopPolling();
bot.startPolling();


function errorTelegram(error) {
    bot.stopPolling();
    bot.getUpdates({
      timeout: 1,
      limit: 0,
      offset: bot._polling.options.params.offset
    });
    console.error(error);
    pm2.disconnect();
}

//--------------------------------------------------------------------------------------------------------
//              REQUEST
//--------------------------------------------------------------------------------------------------------

//создание страницы (проекта) базы данных проектов
app.post('/web-data', async (req, res) => {
    const {queryId, projectname, datestart, geo, teh, managerId, companyId, worklist = [], equipmentlist = [], chatId} = req.body;
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
  `Проект успешно создан! ${ companyId === 'Локальный заказчик' ? 'Offline' : ''} 
  
<b>Проект:</b> ${projectname} 
<b>Дата:</b> ${day}.${month}.${year}
<b>Время:</b> ${chas}:${minut} 
<b>Адрес:</b> ${geo} 
<b>Тех. задание:</b> ${teh}
  
<b>Специалисты:</b>  
${worklist.map(item =>' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
              }
        })
        
        //отправить сообщение в чат-админку (телеграм)
        await bot.sendMessage(chatGroupId, 
`Проект успешно создан! ${ companyId === 'Локальный заказчик' ? 'Offline' : ''} 
  
Название проекта:  ${projectname} 
Дата: ${day}.${month}.${year}
Время: ${chas}:${minut} 
Адрес: ${geo} 
Тех. задание: ${teh} 
  
Специалисты:  
${worklist.map(item => ' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
          )

        } 
//-------------------------------------------------------------------------------------
// Оборудование
        
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

//альтернативна ставка
app.post('/web-stavka', async (req, res) => {
    const {queryId, summaStavki, id, userId} = req.body;

    try {
            await bot.answerWebAppQuery(queryId, {
                type: 'article',
                id: queryId,
                title: 'Твоя цена отправлена',
                input_message_content: {
                    parse_mode: 'HTML',
                    message_text: 
`Новая ставка отправлена на модерацию!`}})

            console.log("Начинаю сохранять данные в ноушене...", id, summaStavki)
            console.log("chatId: ", userId)
            let projectTeh

            while (!projectTeh) {
                projectTeh= await getProjectTeh(id)
                console.log("Teh: ", projectTeh)

                const res = await updateProject(id, projectTeh, summaStavki)

                if (projectTeh) {
                    console.log("Ставка сохранена! " + projectTeh)
                }
                else {
                    console.log("1. Ошибка обновления ставки! ")
                }   
                
                await delay(20000);  
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
                "Дата": {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                "Тех. задание": {
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
                "Статус проекта": {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                "Город": {
                    type: 'select',
                    select: {
                        "id": "fd53fb72-3800-451b-92e8-14c5f2f542e4",
                        "name": "Выбор города...",
                        "color": "blue"
                    }
                },
                "Менеджер": {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                "Компания": {
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
                },
                "Специфика": {
                    "multi_select": [
                        // {
                        //     "id": "6a7d3807-9581-45f8-afb7-f8bd33867daf",
                        //     "name": "Стандарт",
                        //     "color": "green"
                        // }
                    ]
                },
            }
        })
        
        return response.id;

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
                "Дата": {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                "Тех. задание": {
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
                "Статус проекта": {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                "Город": {
                    type: 'select',
                    select: {
                        "id": "fd53fb72-3800-451b-92e8-14c5f2f542e4",
                        "name": "Выбор города...",
                        "color": "blue"
                    }
                },
                "Менеджер": {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                "Компания": {
                    type: "relation",
                    relation: [
                        {
                            "id": companyId
                        }
                    ]
                },
                "Специфика": {
                    "multi_select": [
                        // {
                        //     "id": "6a7d3807-9581-45f8-afb7-f8bd33867daf",
                        //     "name": "Стандарт",
                        //     "color": "green"
                        // }
                    ]
                },
            }
        })
        
        
        return response.id;

    } catch (error) {
        console.error(error.message)
    }
}

//----------------------------------------------------------------------------------------------------------------

//send data to notion
async function addProjectAddress(geo, projectname, datestart, teh, managerId, companyId, worklist, equipmentlist) {
    try {
        const addressId = await addAddress(geo)

        let project_id
        //добавление проекта с названием проекта в базу
        while (!project_id) {
            if (addressId) {
                //break
                console.log("0. Адрес успешно добавлен! " + addressId)
                project_id = await addProject(projectname, datestart, teh, managerId, companyId, worklist, equipmentlist, addressId);
            }
            else {
                console.log("0. Ошибка создания адреса! " + addressId)
                project_id = await addProjectNotGeo(projectname, datestart, teh, managerId, companyId, worklist, equipmentlist);
            }
            
            //
            
            if (project_id) {
                console.log("1. Проект с адресом успешно добавлен! " + project_id)
            }
            else {
                console.log("1. Ошибка создания проекта! ")
            } 
            await delay(2000);  
        }

        if (project_id) {
          
            //создать верхний блок
            // await addTable(project_id)                       
            // await newDatabase2(project_id, worklist, datestart);//создание базы данных "Основной состав"  
            // await newDatabase3(project_id);                     //создание базы данных "Запасной состав" 
            
            // while (true) {
            //     const pretendentId = await newDatabase5(project_id);   //создание базы данных "Претенденты"           
            //     if (pretendentId) break
            //     else {
            //         console.log("4. Ошибка создания таблицы Претенденты!")
            //     }                          
            // } 
            // await newDatabase4(project_id, equipmentlist); //создание базы данных "Оборудование"

            console.log("Текущая дата и время: ", new Date())
            let topId, mainId, zapasId, pretendentId, equipId 
                            
            //создать верхний блок 
            while (!topId) {                                
                topId = await addTable(project_id).catch(() => null); 
                await delay(2000);                                                        
            }
                            

            //создание базы данных "Основной состав"
            while (!mainId) {  
                mainId = await newDatabase2(project_id, worklist, datestart);  
                console.log("mainId: ", mainId)  
                if (mainId) break; // (*)                           
                await delay(2000);                                                  
            }

            //создание базы данных "Запасной состав"
            // while (!zapasId) {                                
            //     zapasId = await newDatabase3(project_id);  
            //     console.log("zapasId: ", zapasId) 
            //     if (zapasId) break; // (*)   
            //     await delay(2000);                                                        
            // }
                            
            //создание базы данных "Претенденты"
            while (!pretendentId) {                                
                pretendentId = await newDatabase5(project_id);  
                console.log("pretendentId: ", pretendentId) 
                if (pretendentId) break; // (*)   
                await delay(2000);                                                          
            }

            //создание базы данных "Оборудование"
            while (!equipId) {                                
                equipId = await newDatabase4(project_id, equipmentlist);    
                console.log("equipId: ", equipId) 
                if (equipId) break; // (*)   
                await delay(2000);                                                      
            }  

        }

        return project_id

    } catch (error) {
        console.error(error.message)
    }
}


//-------------------------------------------------------------------------------------------------------

//bot.setMyCommands([
    // {command: '/start', description: 'Начальное приветствие'},
    // {command: '/menu', description: 'Главное меню'},
    // {command: '/info', description: 'Получить информацию о боте'},
    // {command: '/settings', description: 'Настройки'},
//])

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const firstname = msg.from.first_name
    const lastname = msg.from.last_name
    const text = msg.text ? msg.text : '';
    const messageId = msg.message_id;
    const fromId = msg.from.id;
    const isBot = msg.from.is_bot;
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
        
            // await bot.sendMessage(chatId, 'Добро пожаловать в телеграм-бот U.L.E.Y_Projects. Смотрите и создавайте проекты U.L.E.Y в ' +
            //     'web-приложении прямо из мессенджера Telegram.', {
            //     reply_markup: ({
            //         inline_keyboard:[
            //             [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
            //             [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
            //         ]
            //     })
            // })

            await bot.sendPhoto(chatId, 'https://proj.uley.team/upload/2024-05-18T09:08:53.561Z.jpg', {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Поехали!', web_app: {url: webAppUrl}}],
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
            const project = text.split(' ');
            console.log(project[1])
            await newDatabase5(project[1]);
        }


        if(text.startsWith('/startnotif')) {
            //task1.stop();
            //console.log("Задача 1 остановлена!");
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 2
            }) 
        }


        if(text.startsWith('/startnotionreports')) {
            const project = text.split(' ');

            const res = await fetch(`${botApiUrl}/project/${project[1]}`)
            .then((response) => response.json())
            .then((data) => {
                console.log("проект найден!") 
                //начать получать отчеты
                getReportsNotion(data, bot)                           
            }); 
        }

        if (text === '/startgetmanagers') {
                console.log("START GET MANAGERS ALL...")
                const managers = await getManagersAll()
                console.log(managers)

                console.log("START GET COMPANY ALL...")
                const companies = await getCompanyAll()
                console.log(companies)                

                //await Manager.truncate();

                managers.map(async(manager)=> {
                    const companyObj = companies.find((item)=> item.managers.find((item2)=>item2.id === manager.id))
                    console.log(companyObj)

                    //найти chatId в БД
                    //если нашел то ничего не делать иначе создать запись в таблице
                    const count = await Manager.count();

                    if (count !== 0) {
                    const findChatId = Manager.findOne({
                            where: {
                                chatId: manager.tgID ? manager.tgID : '',
                            }
                        })
                        console.log(findChatId) 
                        // if (!findChatId) {
                        //     await Manager.create({ 
                        //         id: manager.id, 
                        //         companyId: companyObj.id, 
                        //         companyName: companyObj.title, 
                        //         chatId: manager.tgID ? manager.tgID : "", 
                        //         fio: manager.fio, 
                        //         phone: manager.phone,  
                        //     })
                        // } 

                    } else {
                        await Manager.create({ 
                            id: manager.id, 
                            companyId: companyObj.id, 
                            companyName: companyObj.title, 
                            chatId: manager.tgID ? manager.tgID : "", 
                            fio: manager.fio, 
                            phone: manager.phone,  
                        })
                    }              
                })
        }

        if (text === '/getprojectnewdate') {
            console.log("START GET PROJECT NEW...")
            const projects = await getProjectNew()
            
            await ProjectNew.truncate();

            projects.map(async(project)=> {
                await ProjectNew.create({ 
                    id: project.id, 
                    name: project.name, 
                    datestart: project.datestart, 
                    crmID: project.crmID, 
                })
            })
        }


        if (text === '/addnotif') {
            const task4 = await SoundNotif.create({
                name: 'Test',
                text: 'Звуковое оповещение - 15 минут',
                date: new Date().getTime(),
                delivered: false,
                task: 4
            })
            console.log("task4: ", task4)
        }

        if (text === '/addpretendent') {
            pretendentId = await newDatabase5('f84744b7-29d7-4576-81f4-3fe8a0ee86a2');  
            console.log("pretendentId: ", pretendentId) 
        }

        //обновление списка проектов в планировщике
        if (text === '/getprojectnew') {
                console.log("START GET PROJECT NEW...")
                const projects = await getProjectNew()

                await ProjectNew.truncate();

                projects.map(async(project)=> {
                    await ProjectNew.create({ 
                        id: project.id, 
                        name: project.name, 
                        datestart: project.datestart, 
                        crmID: project.crmID, 
                    })
                })     
        }

        if (text === '/getallprojects') {
            const arrProjects = await getAllProjects()
            console.log("Новые проекты: ", arrProjects)
        }

        if (text === '/sendbutton') {
            //Передаем данные боту
            const keyboard = JSON.stringify({
                inline_keyboard:[
                    [{text: 'Подтвердить смету', callback_data:'/smeta ' + projectId}]
                ]
            });

            await bot.sendMessage(chatId, 'Смотрите и создавайте проекты U.L.E.Y в web-приложении прямо из мессенджера Telegram.', {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Подтвердить смету', callback_data:'Информация'}],
                        [{text: 'Предложить свою цену', web_app: {url: webAppUrl+'/add-stavka/1'}}],
                    ]
                })
            })
        }

        //if (text === '/sendsmeta') { //805436270, 5096408255
        if(text.startsWith('/sendsmeta')) {
            const id = text.split(' ');

            const poster = 'https://proj.uley.team/files/2335/final/2335_5096408255_16.pdf'

            const response = await bot.sendDocument(id[1], poster,
            {
                reply_markup: ({
                    inline_keyboard:[
                        [{text: 'Подтвердить', callback_data:'/finalsmeta ' + projectId}]
                    ]
                })
            }); 

            //сохранение сметы в базе данных
            const convId = await sendMessageAdmin(poster, "image", id[1], response.data?.result?.message_id, true, 'Подтверждаю')
            //console.log("convId: ", convId)

            // Подключаемся к серверу socket
            let socket = io(socketUrl);
            socket.emit("addUser", id[1])

            // //сохранить в контексте (отправка) сметы в админку
            socket.emit("sendAdmin", { 
                senderId: chatTelegramId,
                receiverId: id[1],
                text: poster,
                type: 'image',
                buttons: 'Подтверждаю',
                convId: convId,
                messageId: response.data?.result?.message_id,
            })
        }

        if (text.startsWith('/delmessage')) {
            const id = text.split(' ');
            await bot.deleteMessage(id[1], id[2])
        }

        //5. получить новые проекты для рассылки, повторить с интервалом 2 минуты
        if (text === '/getnewprojects') {
            let timerId = setInterval(async() => {
                console.log("START GET PROJECT NEW...")
                //notion
                const projects = await getProjectNew()

                try {    
                    const projectsNew = await ProjectNew.findAll()
                    //console.log("projectsNew: ", projectsNew)

                    //добавление новых проектов
                    if (projects && projects.length > 0) {
                        projects.map(async(project)=> {
                            const id = project.id
                            let exist = await ProjectNew.findOne( {where: {id}} )
                            
                            if(!exist){
                                await ProjectNew.create({ 
                                    id: project.id, 
                                    name: project.name, 
                                    datestart: project.datestart, 
                                    crmID: project.crmID, 
                                })
                            } else {
                                await ProjectNew.update({name: project.name},{where: {id: project.id}})    
                                console.log("Проект в кеше обновлен!")   
                            }   
                        })

                        //удаление старых проектов
                        projectsNew.map(async(project, index)=> {
                            const projectOld = projects.find(item => item.id === project.id)
                            //console.log("projectOld: ", projectOld)
                            if (projectOld === undefined) {
                                await ProjectNew.destroy({
                                    where: {
                                        id: project.id,
                                    }
                                })
                                console.log("Удаленный проект: ", index)
                            }
                        })
                    }  

                } catch (error) {
                    return res.status(500).json(error.message);
                }    
                
                i++ // счетчик интервалов
            }, 120000); //каждые 2 минуты
        }

        if (text === '/testsound') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 1
            })
        }

        if (text === '/testsound2') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 2
            })
        }

        if (text === '/testsound3') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 3
            })
        }

        if (text === '/testsound4') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 4
            })
        }

        if (text === '/testsound5') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 5
            })
        }

        if (text === '/testsound6') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 6
            })
        }

        if (text === '/testsound7') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 7
            })
        }

        if (text === '/testsoundall') {
            let socket = io(socketUrl);
            socket.emit("sendNotif", {
                task: 1
            })
            socket.emit("sendNotif", {
                task: 1
            })
        }


        if (text === '/restart') {
            let proc = 'bot';
            pm2.restart(proc, function(err, pr) {
                if (err) {
                    errorTelegram(err);
                }

                bot.sendMessage(chatId, `Process <i>${proc.name}</i> has been restarted`, {
                    parse_mode: 'html'
                });

            });
        }


        if (text === '/savemanagerdb') {

            const workers = managerNotion.reverse().map((page) => {


                let sferaArr = []
                page.properties["Сфера деятельности"].multi_select.length > 0 && page.properties["КомТег"].multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    sferaArr.push(obj) 
                })
                
                let comtegArr = []
                page.properties["КомТег"].multi_select.length > 0 && page.properties["КомТег"].multi_select.map(item2=> { 
                    const obj = {
                        name: item2.name,
                    }
                    comtegArr.push(obj) 
                })


                let comment = []
                page.properties["Комментарий"].rich_text.length > 0 && page.properties["Комментарий"].rich_text.map(item2=> { 
                    const obj = {
                        content: item2.plain_text,
                    }
                    comment.push(obj) 
                })

                let companyArr = []
                page.properties["Компания"].relation.length > 0 && page.properties["Компания"].relation.map(item2=> { 
                    const obj = {
                        content: item2.id,
                    }
                    companyArr.push(obj) 
                })

                return {
                    fio: page.properties["ФИО"].title[0]?.plain_text,
                    chatId: page.properties.ID.rich_text[0]?.plain_text,
                    phone: page.properties["Телефон"].phone_number,
                    phone2: page.properties["Телефон №2"].phone_number,
                    city: page.properties["Город"].multi_select[0]?.name,
                    sfera: JSON.stringify(sferaArr),
                    dolgnost: page.properties["Должность"].select?.name, 
                    comteg: JSON.stringify(comtegArr), 
                    comment: JSON.stringify(comment),
                    email: page.properties.Email.email, 
                    projects: page.properties["Проекты"].number,
                    company: JSON.stringify(companyArr),
                };
            });

            console.log("arr_worker: ", workers.length)


            workers.map(async (user, index) => {      
                setTimeout(async()=> { 
                    console.log(index + " Пользовател: " + user.fio + " сохранен!")

                    //сохранение сообщения в базе данных wmessage
                    await Manager.create(user)

                }, 500 * ++index) 

            })
                

        }

        if (text === '/savecompanydb') {

            const workers = companyNotion.reverse().map((page) => {
                
                let managerArr = []
                page.properties["Менеджеры"].relation.length > 0 && page.properties["Менеджеры"].relation.map(item2=> { 
                    const obj = {
                        name: item2.id,
                    }
                    managerArr.push(obj) 
                })

                let projectsArr = []
                page.properties["🧰 Проекты"].relation.length > 0 && page.properties["🧰 Проекты"].relation.map(item2=> { 
                    const obj = {
                        name: item2.id,
                    }
                    projectsArr.push(obj) 
                })


                let comment = []
                page.properties["Комментарий"].rich_text.length > 0 && page.properties["Комментарий"].rich_text.map(item2=> { 
                    const obj = {
                        content: item2.plain_text,
                    }
                    comment.push(obj) 
                })


                return {
                    title: page.properties["Название компании"].title[0]?.plain_text,
                    city: page.properties["Город"].rich_text[0]?.plain_text,
                    office: page.properties["Адрес офиса"].rich_text[0]?.plain_text,
                    sklad: page.properties["Адрес склада"].rich_text[0]?.plain_text,
                    comment: JSON.stringify(comment),
                    projects: JSON.stringify(projectsArr), 
                    managers: JSON.stringify(managerArr),          
                    dogovorDate: page.properties["Договор до"].date?.start,
                    dogovorNumber: page.properties["№ Договора"].number, 
                };
            });

            console.log("arr_worker: ", workers.length)


            workers.map(async (user, index) => {      
                setTimeout(async()=> { 
                    console.log(index + " Компания: " + user.title + " сохранен!")

                    //сохранение сообщения в базе данных wmessage
                    await Company.create(user)

                }, 500 * ++index) 

            })
                

        }

        if (text === '/updatemanagerdb') {

            const workers = managerNotion.reverse().map((page) => {            

                return {
                    id: page.id,
                    fio: page.properties["ФИО"].title[0]?.plain_text,
                    companyId: page.properties["Компания"].relation[0]?.id
                };
            });

            console.log("arr_worker: ", workers.length)

            workers.map(async (user, index) => {      
                setTimeout(async()=> { 
                    console.log(index + " Менеджер: " + user.fio + " сохранен!")

                    //сохранение сообщения в базе данных wmessage
                    await Manager.update({companyId: user.companyId},{where: {fio: user.fio}})

                }, 500 * ++index) 

            })
                

        }

        if (text === '/updatecompanydb') {

            const workers = companyNotion.reverse().map((page) => {            

                return {
                    id: page.id,
                    title: page.properties["Название компании"].title[0]?.plain_text
                };
            });

            console.log("arr_worker: ", workers.length)

            workers.map(async (user, index) => {      
                setTimeout(async()=> { 
                    console.log(index + " Компания: " + user.title + " сохранен!")

                    //сохранение сообщения в базе данных wmessage
                    await Company.update({GUID: user.id},{where: {title: user.title}})

                }, 500 * ++index) 

            })
                

        }

        if (text === '/saveplatformdb') {
            const mesta = platformsNotion.reverse().map((page) => {
                return {
                    title: page.properties["Название площадки"].title[0]?.plain_text,
                    address: page.properties["Адрес"].rich_text[0]?.plain_text,
                    track: page.properties["Как добраться"].rich_text[0]?.plain_text,
                    url: page.properties["Ссылка на карту"].url,
                };
            });

            console.log("arr_mesta: ", mesta.length)


            mesta.map(async (mesto, index) => {      
                setTimeout(async()=> { 
                    console.log(index + " Площадка: " + mesto.title + " сохранена!")

                    //сохранение сообщения в базе данных wmessage
                    await Platform.create(mesto)

                }, 500 * ++index) 

            })
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
                        path = `${__dirname}/static/${msg.document.file_name}`.replaceAll(/\s/g, '_'); 
                    }
                    const filePath = fs.createWriteStream(path);
                    res.pipe(filePath);
                    filePath.on('finish', async () => {
                        filePath.close();
                        console.log('Download Completed: ', path); 
                        
                        let convId;
                        if(msg.document) {
                            // сохранить отправленное боту сообщение пользователя в БД
                            convId = await sendMyMessage(`${botApiUrl}/${msg.document.file_name}`.replaceAll(/\s/g, '_'), 'file', chatId, messageId)
                        }

                        // Подключаемся к серверу socket
                        let socket = io(socketUrl);
                        socket.emit("addUser", chatId)
                        socket.emit("sendMessage", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${msg.document.file_name}`.replaceAll(/\s/g, '_'),
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
            await bot.sendMessage(chatId, `Ваше аудио-сообщение получено!`)
            const voice = await bot.getFile(msg.voice.file_id);

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
                            convId = await sendMyMessage(`${botApiUrl}/${msg.voice.file_unique_id}.${ras[1]}`, 'file', chatId, messageId)
                        }

                        //Подключаемся к серверу socket
                        let socket = io(socketUrl);
                        socket.emit("addUser", chatId)
                        socket.emit("sendMessage", {
                            senderId: chatId,
                            receiverId: chatTelegramId,
                            text: `${botApiUrl}/${msg.voice.file_unique_id}.${ras[1]}`,
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
                const convId = await sendMyMessage(text, "text", chatId, parseInt(response.message_id)-1)
                
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
                    const crm = await sequelize.query("SELECT nextval('crm_id')");

                    const resid = crm[0][0].nextval

                    const obj = {                
                        crmID: resid.toString(),
                        name: project.name,
                        status: 'Новый',
                        //specifika: '',
                        //city: '',
                        dateStart: project?.datestart + ':00.000Z', 
                        dateEnd: project?.dateend, 
                        teh: project?.teh,
                        geo: project?.geo,
                        managerId: project?.managerId,
                        companyId: project?.companyId,
                        chatId: chatId,
                        spec: JSON.stringify(specArr),  
                        comment: '',
                        equipment: JSON.stringify(equipArr),
                    }
                    console.log("obj :", obj)

                    const resAdd2 = await ProjectNew.create(obj)
                    console.log("resAdd2: ", resAdd2)

                    if (resAdd2) {
                        const startD = new Date(project.datestart?.split('T')[0]).toLocaleString().split(',')[0]
                        const startT = project.datestart?.split('T')[1]?.slice(0, 5)
                        //добавление специалистов в основной состав
                        const dateStart = startD + 'T' + startT


                        //добавить список работников        
                        Worklist.forEach((worker, index) => {           
                            for (let i = 0; i < worker.count; i++) {
                                setTimeout(async()=> {
                                    const res = await addMainSpec(resAdd2?.id, dateStart, worker.spec, '№1');
                                    console.log("res add spec main: ", res, index+1) 
                                }, 300 * i) 
                            }    
                        });                   
                    }
                    

                    //добавление геопозиции в БД Площадки (Адрес) и добавление проекта
                    // if (project.geo != '') {
                    //     projectId = await addProjectAddress(project.geo, project.name, project.datestart, project.teh, project.managerId, project.companyId, Worklist, Equipmentlist);
                    // } else {
                    //     while (true) {
                    //         projectId = await addProjectNotGeo(project.name, project.datestart, project.teh, project.managerId, project.companyId, Worklist, Equipmentlist);
                    //         console.log("1. Проект без адреса успешно добавлен! " + projectId)             
                    //         if (projectId) break
                    //         else {
                    //             console.log("1. Ошибка создания проекта! ")
                    //         }                          
                    //     }
                    //     //добавление проекта с названием проекта в базу
                        
                    //     if (projectId) {
                    //         console.log("Текущая дата и время: ", new Date())
                    //         let topId, mainId, zapasId, pretendentId, equipId 
                            
                    //         //создать верхний блок 
                    //         while (!topId) {                                
                    //             topId = await addTable(projectId).catch(() => null); 
                    //             await delay(2000);                                                        
                    //         }
                            

                    //         //создание базы данных "Основной состав"
                    //         let i = 0;
                    //         while (!mainId) {  
                    //             //console.log("data: ", projectId, Worklist, project.datestart)
                    //             mainId = await newDatabase2(projectId, Worklist, project.datestart);  
                    //             console.log("mainId: ", mainId)  
                    //             if (mainId) break; // (*)                           
                    //             await delay(2000);                                                  
                    //         }

                    //         //создание базы данных "Запасной состав"
                    //         // while (!zapasId) {                                
                    //         //     zapasId = await newDatabase3(projectId);  
                    //         //     console.log("zapasId: ", zapasId) 
                    //         //     if (zapasId) break; // (*)   
                    //         //     await delay(2000);                                                        
                    //         // }
                            
                    //         //создание базы данных "Претенденты"
                    //         while (!pretendentId) {                                
                    //             pretendentId = await newDatabase5(projectId);  
                    //             console.log("pretendentId: ", pretendentId) 
                    //             if (pretendentId) break; // (*)   
                    //             await delay(2000);                                                          
                    //         }

                    //         //создание базы данных "Оборудование"
                    //         while (!equipId) {                                
                    //             equipId = await newDatabase4(projectId, Equipmentlist);    
                    //             console.log("equipId: ", equipId) 
                    //             if (equipId) break; // (*)   
                    //             await delay(2000);                                                      
                    //         }                             
                            
                    //     } else {
                    //         console.log('Ошибка добавления проекта в Ноушен... ')  
                    //     }
                    // }

                    //обновить проект 
                    //await Project.update({projectId: projectId},{where: {id: res.id}})

                    // отправить сообщение пользователю через 30 секунд
                    setTimeout(() => {bot.sendMessage(project.chatId, 'Ваша заявка принята!')}, 25000) // 30 секунд                   
                    
                    const project2 = await Project.findOne({where:{id: res.id}})  
                    
                    //начать получать отчеты
                    getReports(project2, bot, currentProcess, dataProcess, dataInterval, dataTime)
                    
                                    
                } catch (error) {
                    console.log(error.message)
                }

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

    //предварительная смета
    if (data.startsWith('/smeta')) {
        const projectId = data.split(' ');
        console.log("projectId: ", projectId[1])
        console.log("Начинаю обрабатывать запрос подтверждения сметы...")

        //const crmId = await getProject(projectId[1])

        const block1 = await getBlock(projectId[1])
        console.log("block1: ", block1.results[0].id)
                        
        const block2 = await getBlock(block1.results[0].id)
        console.log("block2: ", block2.results[0].id)
                        
        const block3 = await getBlock(block2.results[0].id)
        console.log("block3: ", block3.results[0].id)  
        
            
        if (block3) {
            //поставить галочку в проекте в поле Предварительная смета
            await updateToDo(block3.results[0].id); 
        } else {
            console.log("Ошибка установки чека")
        }

        //const poster = `${host}/files/${crmId}/pre/${crmId}_${chatId}_customer_1.pdf`
        //console.log("poster: ", poster)
        

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)

        //отправить сообщение об одобрении сметы проекта в админ-панель
        const convId = await sendMyMessage('Предварительная смета одобрена!', "text", chatId, messageId)

        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Предварительная смета одобрена!',
            convId: convId,
            messageId: messageId,
            replyId: ''
        })

        return bot.sendMessage(chatId, 'Предварительная смета одобрена!')
    }

    //финальная смета
    if (data.startsWith('/finalsmeta')) {
        const projectId = data.split(' ');
        console.log("projectId: ", projectId[1])
        console.log("Начинаю обрабатывать запрос подтверждения финальной сметы...")

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)

        //отправить сообщение об одобрении сметы проекта в админ-панель
        const convId = await sendMyMessage('Финальная смета одобрена!', "text", chatId, messageId)

        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Финальная смета одобрена!',
            convId: convId,
            messageId: messageId,
            replyId: ''
        })
        
        const block1 = await getBlock(projectId[1])
        console.log("block1: ", block1.results[0].id) //первый объект (to do)

        //pre final                     
        const block2_1 = await getBlock(block1.results[0].id)
        console.log("block2_1: ", block2_1.results[0].id) // 1-й объект (предварительная смета и финальная смета)
                        
        const block3_1 = await getBlock(block2_1.results[0].id)
        console.log("block3_1: ", block3_1.results[0].id) // 1-й объект (предварительная смета)

        const block3_2 = await getBlock(block2_1.results[0].id)
        console.log("block3_2: ", block3_2.results[1].id) // 2-й объект (финальная смета)


        if (block3_2) {
            //поставить галочку в проекте в поле Финальная смета
            await updateToDoFinal(block3_2.results[1].id); //22.03.2024
        } else {
            console.log("Ошибка установки чека")
        }  

        //найти смету по свойству Проект
        const smetaId = await getSmeta(projectId[1])

        setTimeout(async()=> {
            //получить обновленный чек Финальная смета
            const block3_2 = await getBlock(block2_1.results[0].id)

            console.log("checked: ", block3_1.results[0].to_do.checked)
            console.log("checked2: ", block3_2.results[1].to_do.checked)

            const check = block3_1.results[0].to_do.checked // pre
            const checkFinal = block3_2.results[1].to_do.checked //final

            if (check) {
                //изменить тег в таб. Сметы в поле смета на Подтверждена
                await updateSmeta(smetaId)
            }

            if (checkFinal) {
                //изменить тег в таб. Сметы в поле Финал. смета на Подтверждена
                await updateSmetaFinal(smetaId)
            }
        }, 3000)
        

        return bot.sendMessage(chatId, 'Финальная смета одобрена!')
    }

    //кнопка в отчете
    if (data === '/report_accept') {

        //отправить сообщение о создании проекта в админ-панель
        const convId = await sendMyMessage('Информация подтверждена', "text", chatId, messageId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Информация подтверждена',
            convId: convId,
            messageId: messageId,
        })


        return bot.sendMessage(chatId, 'Информация подтверждена')
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


    //нажатие на кнопку "Принять"
    if (data.startsWith('/accept')) {
        const projectId = data.split(' ');
        console.log("projectId: ", projectId[1])

        const blockId = await getBlocksP(projectId[1]); 
        
        //Добавить специалиста в таблицу Претенденты
        await addPretendent(blockId);

        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Принять" в рассылке', "text", chatId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Принять" в рассылке',
            convId: convId,
            messageId: messageId,
        })

        return bot.sendMessage(chatId, 'Ваша заявка принята! Мы свяжемся с вами в ближайшее время.')
    }

    //нажатие на кнопку "Отклонить"
    if (data === '/cancel') {
        //отправить сообщение в админ-панель
        const convId = await sendMyMessage('Пользователь нажал кнопку "Отклонить" в рассылке', "text", chatId)

        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("addUser", chatId)
        socket.emit("sendMessage", {
            senderId: chatId,
            receiverId: chatTelegramId,
            text: 'Пользователь нажал кнопку "Отклонить" в рассылке',
            convId: convId,
            messageId: messageId,
        })


        return bot.sendMessage(chatId, 'Спасибо!')
    }


    bot.sendMessage(chatId, `Вы нажали кнопку ${data}`, backOptions)
  });


// Обработка ошибок, последний middleware
app.use(errorHandler)


//функция задержки
const delay = async(ms) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms);
    });
}

const fetchProcess = async (dataAll) => {

    let d = new Date()
    d.setHours(d.getHours() + 3);

	//console.log("Получен процесс: ", dataAll, d)
	const { process, data, interval, time } = dataAll;

	if (process === 1) {
        currentProcess = 1
        dataProcess = data
        dataInterval = interval
        dataTime = time
    }
}

//-------------------------------------------------------------------------------------------------------------------------------
const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        
        httpsServer.listen(PORT, async () => {
            console.log('HTTPS Server Bot running on port ' + PORT);

            // Подключаемся к серверу socket
            //let socket = io(socketUrl);
            socket.on("getProcess", fetchProcess);
            
            // 1. получить новые проекты
            let arr = []
            const d = new Date().getTime() + 10800000
            //notion
           // const arrProjects = await getProjectsOn()

            //console.log("Новые проекты: ", arrProjects)

           // console.log("Запускаю фильтрацию проектов...")

            // if (arrProjects && arrProjects.length > 0) {
            //     arrProjects.forEach(async(page)=> {
            //         const blockId = await getBlocks(page.id);
            //         if (blockId) { 
            //             const databaseBlock = await getDatabaseId(blockId);  
                        
            //             if (databaseBlock && databaseBlock?.length !== 0) {
            //                 //console.log("main table: ", databaseBlock)
            //                 let project = databaseBlock.find(item => new Date(item?.date) >= d)
            //                 const obj = {
            //                     id: page.id,
            //                     name: page.name,
            //                     date: project?.date,
            //                 }
            //                 arr.push(obj)
            //             }
            //         }
            //     }) 
            // }
            

            // 2. Отчеты проектов
            // setTimeout(()=>{
            //     //запуск отчетов
            //     console.log('Запускаю отчеты проектов...');
            //     console.log('Текущий процесс: ', currentProcess, dataProcess)
                
            //     arr.map(async (project, i) => {
            //         console.log(project?.name + " - " + project?.date)
                    
            //         setTimeout(function(){
            //             //начать получать отчеты
            //             getReportsTest(project.id, project.name, bot, currentProcess, dataProcess, dataInterval, dataTime)
            //         }, 2000 * ++i)     
            //     })
            // }, 6000) 


            //3. синхронизация менеджеров из ноушена с БД
 
        });

    } catch (error) {
        console.log('Подключение к БД сломалось!', error.message)
    }
}

start()