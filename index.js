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


//send data to notion
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
        console.log("1 Success! Project added. " + response.id)

        newDatabase(response.id, worklist)

    } catch (error) {
        console.error(error.body)
    }
}

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
        console.log("1 Success! Project added. " + response.id)

        newDatabase(response.id, worklist)

    } catch (error) {
        console.error(error.body)
    }
}


//send create db notion
async function newDatabase(parent_page_id, worklist) {
    try {
        //parent_page_id = "97884d7c-2c21-4dd0-adcb-689e6dd7da89" //Проект А

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
                "Date": {
                    "date": {}
                },
                "👷 ФИО": {    
                    "name": "👷 ФИО",               
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "Мерч": {
                    "name": "Мерч",
                    "type": "checkbox",
                    "checkbox": {}
                },
                "Комментарий": {
                    "rich_text": {}
                },
                "Рейтинг": {
                    "title": {}
                },
                "Специализация": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Sound",
                                "color": "green"
                            },
                            {
                                "name": "Light",
                                "color": "red"
                            },
                            {
                                "name": "Video",
                                "color": "pink"
                            },
                            {
                                "name": "Riggers",
                                "color": "blue"
                            },
                            {
                                "name": "Stagehands",
                                "color": "yellow"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "gray"
                            },
                            {
                                "name": "Tracks",
                                "color": "purple"
                            },
                            {
                                "name": "Production",
                                "color": "brown"
                            }
                        ]
                    }
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
        worklist.forEach((worker, index) =>
            addWorker(data.id, worker.icon)
        );
        
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
                Date: {
                    type: 'date',
                    date: {
                        "start": '2022-10-30T00:00',
                        "end": null,
                        "time_zone": null
                    }
                },
                Специалиация: {
                    type: "multi_select",
                    multi_select: [
                        {
                            "id": "77b62d03-73f2-46cd-b152-da47401462d3",
                            "name": "Stagehands",
                            "color": "blue"
                        }
                    ]
                },
                Комментарий : {
                    type: 'rich_text',
                    rich_text: [
                    {
                        type: 'text',
                        text: {
                            content: worker,
                        },
                    }
                    ]
                }
            }
        })
        //console.log(response)
        console.log("3 Success! Worker added. Data: " + JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}

//97884d7c-2c21-4dd0-adcb-689e6dd7da89 //Проект А

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
               title: page.properties.Специалиация.multi_select[0]?.name,
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

//получить все блоки заданной страницы по id
async function getBlocks(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        return response.results[1].id;
    } catch (error) {
        console.error(error.body)
    }
}

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
              message_text: `Проект успешно создан. 
              <b>Название проекта:</b>  ${projectname}, 
              <b>Дата начала:</b> ${datestart}, 
              <b>Геопозиция:</b> ${geo}, 
              <b>Тех. задание:</b> ${teh},  
              <b>Список специалистов:</b> ${worklist.map(item => item.spec + ' - ' + item.count + ' чел.').join(', ')}`
          }
      })

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