require("dotenv").config();

//fetch api
const fetch = require('node-fetch');

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID
const databaseManagerId = process.env.NOTION_DATABASE_MANAGER_ID
const databaseAddressId = process.env.NOTION_DATABASE_ADDRESS_ID
const databaseCompanyId = process.env.NOTION_DATABASE_COMPANY_ID
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
const chatGroupId = process.env.CHAT_GROUP_ID

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const https = require('https');

const token = process.env.TELEGRAM_API_TOKEN;
const token_fetch = 'Bearer ' + token;
const webAppUrl = process.env.WEB_APP_URL;

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('telegram-webapp-bot'));

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

const menuOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
            [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
        ]
    })
}

const backOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
            [{text: 'Назад', callback_data:'/menu'}],
        ]
    })
}

bot.setMyCommands([
    {command: '/menu', description: 'Главное меню'},
    {command: '/info', description: 'Получить информацию о боте'},
    {command: '/settings', description: 'Настройки'},
])


//addProject send data to notion
async function addProject(title, time, teh, managerId, companyId, worklist, geoId) {
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
                        "time_zone": null
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
                },
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log("1 Success! Project with geo added. " + res_id)

        setTimeout(()=> {
            newDatabase_1(res_id);
        }, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000)

    } catch (error) {
        console.error(error.body)
    }
}


//addProjectNotGeo
async function addProjectNotGeo(title, time, teh, managerId, companyId, worklist) {
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
                        "time_zone": null
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
        console.log("1 Success! Project not geo added. " + res_id)        

        setTimeout(()=> {
            newDatabase_1(res_id);
        }, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000) 

    } catch (error) {
        console.error(error.body)
    }
}

//создание базы данных "График работы"
async function newDatabase_1(parent_page_id) {
    //console.log("parent_page_id: ", parent_page_id)
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
                    "rich_text": {}
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
                'Authorization': 'Bearer secret_QoVUx95AXfIlCgSkMpMx5WgRu1H4SvuZflCH4xMA42f', //`Bearer ${token}`
                'Content-Type': 'application/json', 
                accept: 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        console.log("2.1 Success! Grafik project added. Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //добавить даты (День2, День3, День4)
        addDate(data.id, 'День №2');
        addDate(data.id, 'День №3');
        addDate(data.id, 'День №4');
        
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
                "1. Дата": {
                    "name": "Дата", 
                    "title": {}
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
                                "name": "Tracks",
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

        // создание базы данных "Основной состав"
        const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': 'Bearer secret_QoVUx95AXfIlCgSkMpMx5WgRu1H4SvuZflCH4xMA42f', //`Bearer ${token}`
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
                "1. Дата": {
                    "name": "Дата", 
                    "title": {}
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
                                "name": "Tracks",
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
                'Authorization': 'Bearer secret_QoVUx95AXfIlCgSkMpMx5WgRu1H4SvuZflCH4xMA42f', //`Bearer ${token}`
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
                    type: 'rich_text',
                    rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: "01/01/2022 0:00",
                        },
                    }
                    ]
                }
            }
        })
        //console.log(response)
        console.log("3.1 Success! Date added. Data: "  + response.id)//+ JSON.stringify(response))
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
                    "type": "title",
                    "title": [
                        {
                            "type": "text",
                            "text": {
                                "content": "30/10/2022 0:00",
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
                            "plain_text": "30/10/2022 0:00",
                            "href": null
                        }
                    ]
                },
                "3. Специализация": {
                    type: "multi_select",
                    multi_select: [
                        {
                            "name": worker
                        }
                    ]
                }
                // Комментарий : {
                //     type: 'rich_text',
                //     rich_text: [
                //     {
                //         type: 'text',
                //         text: {
                //             content: worker,
                //         },
                //     }
                //     ]
                // }
            }
        })
        //console.log(response)
        console.log("3 Success! Worker added. Data: " + response.id) //+ JSON.stringify(response))
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
                    "type": "title",
                    "title": [
                        {
                            "type": "text",
                            "text": {
                                "content": "30/10/2022 0:00",
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
                            "plain_text": "30/10/2022 0:00",
                            "href": null
                        }
                    ]
                }
            }
        })
        //console.log(response)
        console.log("3.3 Success! Worker zapas added. Data: " + response.id) //JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}


//send data to notion
async function addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist) {
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
        console.log(response)
        console.log("Success! Entry address added. " + response.id)

        //добавление проекта с названием проекта в базу
        addProject(projectname, datestart, teh, managerId, companyId, worklist, response.id);

    } catch (error) {
        console.error(error.body)
    }
}

//--------------------------------------------------------------------------------------------------------

//get items from DB
async function getDatabase() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить все проекты
async function getProjects() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: page.properties.Date.date,
               geo: '',//page.properties.Address.rollup.array,
               teh: page.properties.TechZadanie.rich_text,
               status_id: page.properties.Status.select,
               manager: page.properties.Manager.relation[0]?.id,
               company: page.properties.Company.relation[0]?.id,
               worklist:'',
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

async function getProjects2() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить все проекты менеджера по id
async function getProjectsId(managerId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            "filter": {
                "property": "Manager",
                "relation": {
                    "contains": managerId
                },
            }
        });

        //return response.results[0].id;

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: page.properties.Date.date,
               geo: '',//page.properties.Address.rollup.array,
               teh: page.properties.TechZadanie.rich_text,
               status_id: page.properties.Status.select,
               manager: page.properties.Manager.relation[0]?.id,
               company: page.properties.Company.relation[0]?.id,
               worklist:'',
            };
        });

        return responseResults;
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

async function getDatabaseId2(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить пустые данные блока
async function getDatabase2() {
    return {};
}

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

        return res;
    } catch (error) {
        console.error(error.body)
    }
}

//получить все блоки заданной страницы по id
async function getBlocks2(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные блока по заданному ID
async function getBlockId(blockId) {
    try {
        const response = await notion.blocks.retrieve({
            block_id: blockId,
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные страницы по заданному ID
async function getPage(pageId) {
    try {
        const response = await notion.pages.retrieve({
            page_id: pageId,
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить id менеджера по его TelegramID
async function getManagerId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            "filter": {
                "property": "TelegramID",
                "rich_text": {
                    "contains": id
                }
            }
        });

        return response.results[0].id;
    } catch (error) {
        console.error(error.body)
    }
}

//получить id компании заказчика
async function getCompanyId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            "filter": {
                "property": "TelegramID",
                "rich_text": {
                    "contains": id
                }
            }
        });

        return response.results[0].properties.Заказчики.relation[0].id;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные таблицы Площадки
async function getAddress() {
    try {
        const response = await notion.databases.query({
            database_id: databaseAddressId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}

async function getManagers() {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}

async function getCompanys() {
    try {
        const response = await notion.databases.query({
            database_id: databaseCompanyId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
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


  if (text === '/info') {

  }

  if (text === '/settings') {

  }

  if(msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data)
        console.log(data)
        await bot.sendMessage(chatId, 'Проект успешно создан!')

        await bot.sendMessage(chatId, 'Название проекта: ' + data?.project);
        await bot.sendMessage(chatId, 'Дата начала: ' + data?.datestart);
        await bot.sendMessage(chatId, 'Геопозиция: ' + data?.geo);
        await bot.sendMessage(chatId, 'Тех. задание: ' + data?.teh);

        //добавление проекта с названием проекта в базу
        addItem(data?.project, data?.geo);

        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000)
    } catch (e) {
        console.log(e);
    }
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


app.get('/secret',(req, res) => {
    const secret =  Math.floor(Math.random()*100)
    res.json({secret})
});

app.get('/blocks/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const blocks = await getBlocks(id);
    if(blocks){
        res.json(blocks);
    }
    else{
        res.json({});
    }
  });

app.get('/blocks2/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const blocks = await getBlocks2(id);
    if(blocks){
        res.json(blocks);
    }
    else{
        res.json({});
    }
  });

app.get('/block/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const blocks = await getBlockId(id);
    res.json(blocks);
  });

//get PAGE
app.get('/page/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const page = await getPage(id);
    res.json(page);
  });

//get DATABASE by ID
app.get('/database/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const base = await getDatabaseId(id);

    if(base){
        res.json(base);
    }
    else{
        res.json({});
    }
  });

  app.get('/database2/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const base = await getDatabaseId2(id);

    if(base){
        res.json(base);
    }
    else{
        res.json({});
    }
  });

  app.get('/database/', async (req, res) => {
    const base = await getDatabase2();
    res.json(base);
  });

app.get("/database1", async (req, res) => {
    const projects = await getDatabase();
    res.json(projects);
  });


// get PROJECTS  
app.get("/projects", async (req, res) => {
    const projects = await getProjects();
    res.json(projects);
  });

app.get("/projects2", async (req, res) => {
    const projects = await getProjects2();
    res.json(projects);
  });

app.get("/projects/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    const projects = await getProjectsId(id);
    if(projects){
        res.json(projects);
    }
    else{
        res.json([]);
    }
  });

//get MANAGERS
app.get("/managers", async (req, res) => {
    const managers = await getManagers();
    res.json(managers);
  });

app.get("/managers/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    const manager = await getManagerId(id);
    if(manager){
        res.json(manager);
    }
    else{
        res.json({});
    }
  });

app.get("/manager/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    const manager = await getCompanyId(id);
    if(manager){
        res.json(manager);
    }
    else{
        res.json({});
    }
  });

//get COMPANYS
app.get("/companys", async (req, res) => {
    const companys = await getCompanys();
    res.json(companys);
  });

//get ADDRESS
app.get("/address", async (req, res) => {
    const address = await getAddress();
    res.json(address);
  });


  app.post('https://api.notion.com/v1/databases', async (req, res) => {
    
  })

//создание страницы (проекта) базыданных проектов
app.post('/web-data', async (req, res) => {
  const {queryId, projectname, datestart, geo, teh, managerId, companyId, worklist = []} = req.body;
  try {
      await bot.answerWebAppQuery(queryId, {
          type: 'article',
          id: queryId,
          title: 'Проект успешно создан',
          input_message_content: {
              parse_mode: 'HTML',
              message_text: `Проект успешно создан! 
              <b>Название проекта:</b>  ${projectname}, 
              <b>Дата начала:</b> ${datestart}, 
              <b>Адрес:</b> ${geo}, 
              <b>Тех. задание:</b> ${teh},  
              <b>Список специалистов:</b> ${worklist.map(item => item.spec + ' - ' + item.count + ' чел.').join(', ')}`
          }
      })

        await bot.sendMessage(chatGroupId, `Проект успешно создан! 
                        Название проекта:  ${projectname}, 
                        Дата начала: ${datestart}, 
                        Адрес: ${geo}, 
                        Тех. задание: ${teh},  
                        Список специалистов: ${worklist.map(item => item.spec + ' - ' + item.count + ' чел.').join(', ')}`
        )

      //добавление проекта с названием проекта в базу
      //addProject(projectname, datestart, teh, managerId, companyId, worklist);

      //добавление геопозиции в БД Площадки (Адрес)
      if (geo != '') {
        addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist);
      } else {
        addProjectNotGeo(projectname, datestart, teh, managerId, companyId, worklist);
      }
      

      return res.status(200).json({});
  } catch (e) {
      return res.status(500).json({})
  }
})

const PORT = 8000;

//app.listen(PORT, () => console.log('server started on PORT ' + PORT))
httpsServer.listen(PORT, () => {
    console.log('HTTPS Server running on port' + PORT);
});