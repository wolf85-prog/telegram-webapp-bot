require("dotenv").config();

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID
const databaseManagerId = process.env.NOTION_DATABASE_MANAGER_ID
const databaseAddressId = process.env.NOTION_DATABASE_ADDRESS_ID

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const https = require('https');

const token = process.env.TELEGRAM_API_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('telegram-webapp-bot'));

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/telegram.uley.moscow/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/telegram.uley.moscow/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/telegram.uley.moscow/chain.pem', 'utf8');

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
            [{text: 'Открыть Notion', web_app: {url: webAppUrl}}],
        ]
    })
}

const backOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: 'Открыть Notion-проекты', web_app: {url: webAppUrl}}],
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
async function addProject(title, time, teh, workers_str) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
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
                Workers: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: workers_str,
                            },
                        }
                        ],
                },
                // Workers: {
                //     type: "rollup",
                //     rollup: {
                //         type: "array",
                //         array: worklist,
                //         function: "show_original"
                //     }
                // },
            },
        })
        console.log(response)
        console.log("Success! Entry added.")
    } catch (error) {
        console.error(error.body)
    }
}

//send data to notion
async function addAddress(geo) {
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
        console.log("Success! Entry address added.")
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
               workers: page.properties.Workers.rich_text[0]?.plain_text,
               manager: page.properties.Manager.relation[0]?.id,
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

async function getManagerId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            // "filter": {
            //     "property": "TelegramID",
            //     page.id
            // }
            "filter": {
                "id": id,
            }
        });

        // const responseResults = response.results.map((page) => {
        //     return {
        //        id: page.id,
        //        post_manager: page.properties.Select.name,
        //        telegram_id: page.properties.TelegramID.rich_text[0]?.plain_text,
        //        fio: '',//page.properties.ФИО.rollup.array,
        //     };
        // });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

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


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Добро пожаловать в чат-бот Notion. Смотрите и создавайте Notion-проекты в ' +
        'web-приложении прямо из телеграм.', {
        reply_markup: ({
            inline_keyboard:[
                [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                [{text: 'Открыть Notion-проекты', web_app: {url: webAppUrl}}],
            ]
        })
    })
  }

  if (text === '/menu') {
      await bot.sendMessage(chatId, 'Смотрите и создавайте Notion-проекты в web-приложении прямо из телеграм.', {
          reply_markup: ({
              inline_keyboard:[
                  [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                  [{text: 'Открыть Notion-проекты', web_app: {url: webAppUrl}}],
              ]
          })
      })
  }

    // if (text === '/menu') {
    //     await bot.sendMessage(chatId, 'Смотрите и создавайте Notion-проекты в web-приложении прямо из телеграм.', {
    //         reply_markup: ({
    //             keyboard:[
    //                 [{text: 'Создать проект', web_app: {url: webAppUrl}}],
    //             ]
    //         })
    //     })
    // }

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
        return bot.sendMessage(chatId, 'Смотрите и создавайте Notion-проекты в web-приложении прямо из телеграм.', {
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

app.get("/database1", async (req, res) => {
    const projects = await getDatabase();
    res.json(projects);
  });

app.get("/projects", async (req, res) => {
    const projects = await getProjects();
    res.json(projects);
  });

app.get("/managers", async (req, res) => {
    const managers = await getManagers();
    res.json(managers);
  });

app.get("/managers/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    res.json(id);
    //const manager = await getManagerId(id);
    //res.json(manager);
  });

app.get("/address", async (req, res) => {
    const address = await getAddress();
    res.json(address);
  });

app.post('/web-data', async (req, res) => {
  const {queryId, projectname, datestart, geo, teh, worklist = []} = req.body;
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

      const workers_str = JSON.stringify(worklist);
      //const workers_str=str.replace('\\','');

      //добавление проекта с названием проекта в базу
      addProject(projectname, datestart, teh, workers_str);

      //добавление геопозиции в БД Площадки (Адрес)
      //addAddress(geo);

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