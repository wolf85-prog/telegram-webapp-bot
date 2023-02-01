require("dotenv").config();

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const {menuOptions, backOptions} = require('./options')
const token = process.env.TELEGRAM_API_TOKEN
const bot = new TelegramBot(token, {polling: true});
const { Op } = require('sequelize')

// web-приложение
const webAppUrl = process.env.WEB_APP_URL;

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

var projectId, projectName, projectDate, projectTime, dateStart, manager_id, company_id, Geo, Teh, Worklist, Equipmentlist
var blockId

//functions
const newDatabase2 = require('./bot/common/newDatabase2')

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const https = require('https');
const router = require('./bot/routes/index')
const errorHandler = require('./bot/middleware/ErrorHandling')
const path = require('path')

//подключение к БД PostreSQL
const sequelize = require('./bot/connections/db')
const {UserBot, Message, Conversation} = require('./bot/models/models')

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
${worklist.map(item =>' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}

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
  
Специалисты:  
${worklist.map(item => ' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}

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
  
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

//-------------------------------------------------------------------------------
//------------------ Функции ----------------------------------------------------
//-------------------------------------------------------------------------------

//получить id блока заданной страницы по id
async function getBlocks(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        let count = 0;

        const responseResults = response.results.map((block) => {
            //if (block.child_database.title == "Основной состав" || block.child_database.title == "Назначенные")
            if (block.child_database) {
                count++;
            }
        });

        let res;
        (count >1) ? res = response.results[1].id : res = response.results[0].id     
        
        console.log("Blocks Data: "  + res)

        return res;
    } catch (error) {
        console.error(error.body)
    }
}


//получить данные блока по заданному ID
async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
               //id: page.id,
               fio: page.properties["2. 👷 ФИО"].relation[0]?.id,
               title: page.properties["3. Специализация"].multi_select[0]?.name              
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

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
                TechZadanie: {
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

        //setTimeout(()=> {
            newDatabase_1(res_id);
        //}, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000)

        setTimeout(()=> {
            newDatabase4(res_id, equipmentlist);
        }, 13000) 

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
                TechZadanie: {
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

        newDatabase_1(res_id);

        setTimeout(()=> {
             newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000) 

        setTimeout(()=> {
            newDatabase4(res_id, equipmentlist);
        }, 13000) 

        return res_id;

    } catch (error) {
        console.error(error.body)
    }
}

//-----------------------------------------------------------------------------------

//создание базы данных "График работы"
async function newDatabase_1(parent_page_id) {
    try {
        const body = {
            "parent": {
                "type": "page_id",
                "page_id": parent_page_id
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "График проекта"
                    }
                }
            ],
            "is_inline": true,
            "properties": {  
                "Name": {
                    "title": {}
                },              
                "Date": {
                    "date": {}
                },
                "Комментарий": {
                    "rich_text": {}
                }               
            }
        }

        // создание базы данных "График проекта"
        const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': token_fetch, //`Bearer ${token}`
                'Content-Type': 'application/json', 
                accept: 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        console.log("2.1 Success! Grafik project added. Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //добавить даты (День2, День3, День4)
        addDate(data.id, 'День №4');
        setTimeout(()=> {
            addDate(data.id, 'День №3');
        }, 2000)  
        setTimeout(()=> {
            addDate(data.id, 'День №2');
        }, 4000) 
        
    } catch (error) {
        console.error(error.body)
    }
}

//send data to notion
async function addDate(blockId, day) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                Name: {
                    type: "title",
                    title: [
                        {
                            "type": "text",
                            "text": {
                                "content": day,
                                "link": null
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": day,
                            "href": null
                        }
                    ]
                },
                Date : {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                }
            }
        })
        //console.log(response)
        console.log("3.1 Success! Date added. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}


//send create db notion
async function newDatabase(parent_page_id, worklist) {
    try {
        const body = {
            "parent": {
                "type": "page_id",
                "page_id": parent_page_id
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Основной состав"
                    }
                }
            ],
            "is_inline": true,
            "properties": { 
                "Name": {
                    "title": {}
                },
                "1. Дата": {
                    "date": {}
                },
                "2. 👷 ФИО": {    
                    "name": "👷 ФИО",               
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "3. Специализация": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Sound",
                                "color": "blue"
                            },
                            {
                                "name": "Light",
                                "color": "yellow"
                            },
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Stagehands",
                                "color": "blue"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            {
                                "name": "Production",
                                "color": "orange"
                            }
                        ]
                    }
                },
                "4. Мерч": {
                    "name": "Мерч",
                    "type": "checkbox",
                    "checkbox": {}
                },
                "5. Комментарий": {
                    "rich_text": {}
                },
                "6. Рейтинг": {
                    "rich_text": {}
                },
                "7. Такси": {
                    "name": "Такси",
                    "type": "checkbox",
                    "checkbox": {}
                },
            }
        }

        // создание базы данных "Основной состав"
        const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': token_fetch, //`Bearer ${token}`
                'Content-Type': 'application/json', 
                accept: 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        console.log("2 Success! Maincast added. Database_id: " + data.id)// + " data: " + JSON.stringify(data))

        //добавить список работников
        worklist.forEach((worker, index) => {
            if (worker.count > 1) {
                for (let i = 0; i < worker.count; i++) {
                    addWorker(data.id, worker.icon)
                }
            } else {
                addWorker(data.id, worker.icon)
            }          
        });
        
    } catch (error) {
        console.error(error.body)
    }
}

//send data to notion
async function addWorker(blockId, worker) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "1. Дата": {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                "3. Специализация": {
                    type: "multi_select",
                    multi_select: [
                        {
                            "name": worker
                        }
                    ]
                }
            }
        })
        //console.log(response)
        console.log("3 Success! Worker added. Data: " + response.id) //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}



// создание БД "Запасной состав"
async function newDatabase_3(parent_page_id) {
    try {
        const body = {
            "parent": {
                "type": "page_id",
                "page_id": parent_page_id
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Запасной состав"
                    }
                }
            ],
            "is_inline": true,
            "properties": {                
                "Name": {
                    "title": {}
                },
                "1. Дата": {
                    "date": {}
                },
                "2. 👷 ФИО": {    
                    "name": "👷 ФИО",               
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "3. Специализация": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Sound",
                                "color": "blue"
                            },
                            {
                                "name": "Light",
                                "color": "yellow"
                            },
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Stagehands",
                                "color": "blue"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            {
                                "name": "Production",
                                "color": "orange"
                            }
                        ]
                    }
                },
                "4. Мерч": {
                    "name": "Мерч",
                    "type": "checkbox",
                    "checkbox": {}
                },
                "5. Комментарий": {
                    "rich_text": {}
                },
                "6. Рейтинг": {
                    "rich_text": {}
                }
            }
        }

        // создание базы данных "Запасной состав"
        const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': token_fetch, //`Bearer ${token}`
                'Content-Type': 'application/json', 
                accept: 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        console.log("2.3 Success! Secondcast added. Database_id: " + data.id)// + " data: " + JSON.stringify(data))
        
        addWorkerZapas(data.id);
        addWorkerZapas(data.id);

    } catch (error) {
        console.error(error.body)
    }
}

//Добавление строк в таблицу "Запасной состав"
async function addWorkerZapas(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "1. Дата": {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                }
            }
        })
        //console.log(response)
        console.log("3.3 Success! Worker zapas added. Data: " + response.id) //JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}

async function newDatabase4(parent_page_id, equipmentlist) {
    //создание базы данных "Оборудование"
    try {
        const body = {
            "parent": {
                "type": "page_id",
                "page_id": parent_page_id
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Оборудование"
                    }
                }
            ],
            "is_inline": true,
            "properties": {              
                "Дата": {
                    "date": {}
                },
                "Наименование": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Sound",
                                "color": "blue"
                            },
                            {
                                "name": "Light",
                                "color": "yellow"
                            },
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            {
                                "name": "Production",
                                "color": "orange"
                            }
                        ]
                    }
                },
                "Комментарий": {
                    "title": {}
                },                 
            }
        }

        // создание базы данных "Оборудование"
        const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': token_fetch, //`Bearer ${token}`
                'Content-Type': 'application/json', 
                accept: 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        console.log("4. Success! Equipments added. Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //console.log("equipmentlist: ", equipmentlist)

        //добавить список работников

        equipmentlist.forEach((equipment, index) => {
            if (equipment.count > 1) {
                for (let i = 0; i < equipment.count; i++) {
                    addEquipment(data.id, equipment.cat)
                    //console.log("equipment: ", equipment)
                }
                //addEquipment(data.id, equipment.cat)
            } else {
                addEquipment(data.id, equipment.icon)
            }          
        });
        
    } catch (error) {
        console.error(error.body)
    }   
}

//добавление строки в таблицу Оборудование
async function addEquipment(blockId, equipment) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "Дата": {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                "Наименование": {
                    type: "multi_select",
                    multi_select: [
                        {
                            "name": equipment
                        }
                    ]
                }
            }
        })
        //console.log(response)
        console.log("3 Success! Equipment added. Data: " + response.id) //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}


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
      
        //обработка сообщений    
        if ((text || '')[0] !== '/') {       
            if (text.includes("Ответ")) {           
                await bot.sendMessage(text.substring(6, text.indexOf('.')), text.slice(text.indexOf('.') + 2))       
            
            } else if (text.includes('Проект успешно создан')) {           
                await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)
                await bot.sendMessage(chatGiaId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

                //создать беседу в админке в бд 
                let  conversation_id              
                try {                  
                    //найти беседу
                    const conversation = await Conversation.findAll({
                        where: {
                            members: {
                                [Op.contains]: [chatId]
                            }
                        },
                    })             

                    //если нет беседы, то создать 
                    if (conversation.length === 0) {
                        const conv = await Conversation.create(
                        {
                            members: [chatId, chatTelegramId],
                        })
                        console.log("Беседа успешно создана: ", conv.id) 
                        console.log("conversationId: ", conv.id)
                        
                        conversation_id = conv.id
                    } else {
                        console.log('Беседа уже создана в БД')  
                        console.log("conversationId: ", conversation[0].id)  
                        
                        conversation_id = conversation[0].id
                    }
                } catch (error) {
                    console.log(error)
                }

                
                //-------------------------------------------------------------------------------------------------------------------------------
                //--------------------------- Создание проекта ----------------------------------------------------------------------------------
                //-------------------------------------------------------------------------------------------------------------------------------
                //добавление геопозиции в БД Площадки (Адрес) и добавление проекта
                if (Geo != '') {
                    projectId = await addAddress(Geo, projectName, dateStart, Teh, manager_id, company_id, Worklist, Equipmentlist);
                } else {
                    //добавление проекта с названием проекта в базу
                    projectId = await addProjectNotGeo(projectName, dateStart, Teh, manager_id, company_id, Worklist, Equipmentlist);
                }

                //получить информацию о проекте (8 секунд)
                setTimeout(async () => {
                    console.log("projectId: ", projectId)
                    if (projectId !== 'undefined') {
                        blockId = await getBlocks(projectId);
                        console.log("blockId: ", blockId)
                    } else {
                        console.log("Проект не добавлен в БД!")
                    }
                    
                }, 8000)

                // отправить сообщение пользователю через 30 секунд
                setTimeout(() => {bot.sendMessage(chatId, 'Ваша заявка принята!')}, 30000) // 30 секунд

                let count_fio;
                let count_title;
                let count_title2;
                const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
                const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
                let i = 0;
                let arr_count = [] 
                let arr_all = [] 

                
                // повторить с интервалом 1 минуту
    //             let timerId = setInterval(async() => {
    //                 i++
                    
    //                 let databaseBlock = await getDatabaseId(blockId); 
    //                 //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

    //                 arr_count = [] 
                    
    //                 arr_cat.map((arritem) => {
    //                     count_fio = 0;
    //                     count_title = 0;
    //                     if (databaseBlock) {
    //                         databaseBlock.map((value) => {
    //                             if (arritem === value.title) {
    //                                 if (value.fio) {
    //                                     count_fio++               
    //                                 }else {
    //                                     count_fio;
    //                                 }  
    //                                 count_title++;
    //                             }
    //                         })
    //                         if (count_fio != 0) {
    //                             const obj = {
    //                                 title2: arritem,
    //                                 count_fio: count_fio,
    //                                 count_title: count_title,
    //                             }
    //                             arr_count.push(obj)
    //                         } else if (count_title !=0) {
    //                             const obj = {
    //                                 title2: arritem,
    //                                 count_fio: count_fio,
    //                                 count_title: count_title,
    //                             }
    //                             arr_count.push(obj) 
    //                         }
    //                     }              
    //                 })

    //                 //сохранение массива в 2-х элементный массив
    //                 if (i % 2 == 0) {
    //                     arr_all[0] = arr_count
    //                 } else {
    //                     arr_all[1] = arr_count 
    //                 }

    //                 var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
    //                 // если есть изменения в составе работников    
    //                 if (!isEqual) {
    //                     //отправка сообщения в чат бота
    //                     await bot.sendMessage(chatId, 
    //                         `Запрос на специалистов: 

    // ${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                                                                    
    //                     )
    //                 } else {
                        
    //                 }

    //             }, 60000); //каждую минуту 

                // 1. отправка через 30 минут 
                // setTimeout(() => {
                //     bot.sendMessage(chatId, 
                //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
                //     )
                // }, 1800000)

                // setTimeout(() => {
                //     bot.sendMessage(chatId, 
                //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
                //     )
                // }, 3600000)
                
                // 2. отправка через 1 час
                // 3. отправка через 4 часа (260 минут) 

                // остановить вывод через 260 минут
                //setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут     

            } else if (text.includes('Запрос на специалистов')) {  
                
                // Подключаемся к серверу
                let socket = io('https://proj.uley.team:9000');
                socket.on("welcome", async message=> {
                    console.log(message)
                });

                socket.emit("addUser", chatId)
                socket.on("getUsers", users => {
                    console.log("users from bot: ", users);
                })

                socket.emit("sendMessage", {
                    senderId: chatTelegramId,
                    receiverId: chatId,
                    text: text,
                })

                // сохранить отправленное боту сообщение пользователя в БД
                let conversation_id
                try {
                    //найти беседу
                    const conversation = await Conversation.findAll({
                        where: {
                            members: {
                                [Op.contains]: [chatId]
                            }
                        },
                    })             

                    //если нет беседы, то создать 
                    if (conversation.length === 0) {
                        const conv = await Conversation.create(
                        {
                            members: [chatId, chatTelegramId],
                        })
                        console.log("conversationId: ", conv.id)
                        conversation_id = conv.id
                    } else {
                        console.log('Беседа уже создана в БД')  
                        console.log("conversationId: ", conversation[0].id)  
                        conversation_id = conversation[0].id
                    }

                    const messageDB = await Message.create(
                    {
                        text: text, 
                        from: chatId, 
                        to: chatTelegramId,
                        messageType: 'text',
                        conversationId: conversation_id,
                    })
                } catch (error) {
                    console.log(error);
                }

            } else {

                // сохранить отправленное боту сообщение пользователя в БД
                let conversation_id
                try {
                    //найти беседу
                    const conversation = await Conversation.findAll({
                        where: {
                            members: {
                                [Op.contains]: [chatId]
                            }
                        },
                    })             

                    //если нет беседы, то создать 
                    if (conversation.length === 0) {
                        const conv = await Conversation.create(
                        {
                            members: [chatId, chatTelegramId],
                        })
                        console.log("conversationId: ", conv.id)
                        conversation_id = conv.id
                    } else {
                        console.log('Беседа уже создана в БД')  
                        console.log("conversationId: ", conversation[0].id)  
                        conversation_id = conversation[0].id
                    }

                    const messageDB = await Message.create(
                    {
                        text: text, 
                        from: chatId, 
                        to: chatTelegramId,
                        messageType: 'text',
                        conversationId: conversation_id,
                    })
                } catch (error) {
                    console.log(error);
                }
                // ответ бота
                await bot.sendMessage(chatId, `Ваше сообщение "${text}" отправлено!`)
                await bot.sendMessage(chatTelegramId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)           
            }
        }
    
    
        if (text === '/getmessage') {
            //получить сообщения из админской панели
            try {
                const message_admin = await Message.findAll({where: {to: chatId.toString()}})
                console.log(message_admin)
            } catch (error) {
                console.log(error)
            }
        }

        if (text == '/function') {
            newDatabase2()

        }

        if (text == '/setconversation') {
            //const users = await UserBot.findAll()
            let users = [];

            await fetch('https://proj.uley.team:8000/managers')
                .then(res => res.json())
                .then(json => {
                    console.log("Name of the first user in the array:");
                    //console.log("users: ", json)

                    users = json.map(item => ({
                        // Так ссылка не скопируется и оригинальный массив останется чист
                        id: item.id,
                        fio: item.fio,
                        tgID: item.tgID,
                        phone: item.phone,
                      }))

            })     

            //console.log("user: ", users)

            users.map(async (item) => {  

                let conversation_id
                try {

                    //1. добавить пользователя в бд
                    if (item.tgID) {
                        const user = await UserBot.findOne({where:{chatId: item.tgID}})
                        //console.log("user: ", user)

                        if (user === null) {
                            await UserBot.create({ firstname: item.fio, lastname: "", chatId: item.tgID })
                            console.log('Пользователь добавлен в БД')
                        } else {
                            console.log('Ошибка работы БД. Пользователь уже существует')
                        } 
                    }                  

                    //2. найти беседу
                    // const conversation = await Conversation.findAll({
                    //     where: {
                    //         members: {
                    //             [Op.contains]: [item.tgID]
                    //         }
                    //     },
                    // })             

                    // //3. если нет беседы, то создать 
                    // if (conversation.length === 0) {
                    //     const conv = await Conversation.create(
                    //     {
                    //         members: [item.tgID, chatTelegramId],
                    //     })
                    //     console.log("conversationId: ", conv.id)
                    //     conversation_id = conv.id
                    // } else {
                    //     console.log('Беседа уже создана в БД')  
                    //     console.log("conversationId: ", conversation[0].id)  
                    //     conversation_id = conversation[0].id
                    // }
                    
                } catch (error) {
                    console.log(error);
                }

              });
            
        }

    } catch (error) {
        //await bot.sendMessage(chatId, 'Произошла непредвиденная ошибка!');
        console.log('Произошла непредвиденная ошибка! ', error)
    }
    
  });
  
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
      bot.sendMessage(chatId, `Вы нажали кнопку ${data}`, backOptions)
  });


// Обработка ошибок, последний middleware
app.use(errorHandler)

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