require("dotenv").config();

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

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

// properties: {
//     Manager: { id: '%3ACda', type: 'relation', relation: [], has_more: false },
//     Company: { id: '%3AgN%3A', type: 'relation', relation: [], has_more: false },
//     City: { id: '%3B%3Eb%5B', type: 'select', select: null },
//     'Date (1) 2': { id: 'HOPL', type: 'date', date: null },
//     Property: { id: 'MI%5BK', type: 'people', people: [] },
//     'Date (1) 3': { id: 'Nj%3DX', type: 'date', date: null },
//     'Ссылка на карту': { id: 'PZXb', type: 'url', url: null },
//     TG_chat_ID: { id: 'QctD', type: 'rich_text', rich_text: [] },
//     'Date (1)': { id: '%5CTdz', type: 'date', date: null },
//     Text: { id: '%5CXsm', type: 'rich_text', rich_text: [] },
//     Payload: { id: '%5DJj%60', type: 'number', number: null },
//     Notice24: { id: 'eT%5BN', type: 'checkbox', checkbox: false },
//     'Тех. Задание': { id: 'hP%3C%3A', type: 'rich_text', rich_text: [] },
//     'Смета №1': { id: 'jIHc', type: 'relation', relation: [], has_more: false },
//     Date: { id: 'llLo', type: 'date', date: null },
//     'Адрес': { id: 'nRHW', type: 'rich_text', rich_text: [] },
//     Status: { id: 'qC%3Ac', type: 'select', select: null },
//     Notice2: { id: 'qdtL', type: 'checkbox', checkbox: false },
//     Phone: { id: 'tF%3Fl', type: 'rollup', rollup: [Object] },
//     Responsible: { id: 'tVkR', type: 'relation', relation: [], has_more: false },
//     Crm_ID: { id: 'zwOj', type: 'rich_text', rich_text: [] },
//     'Date (2)': { id: '%7CHuq', type: 'date', date: null },
//     Name: { id: 'title', type: 'title', title: [Array] }
// },

//send data to notion
async function addItem(title, teh) {
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
                TG_chat_ID: {
                    rich_text:[
                        {
                            "text": {
                                "content": teh
                            }
                        }
                    ]
                }
            },
        })
        console.log(response)
        console.log("Success! Entry added.")
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

        const responseResults = response.results.map((page) => {
            return {
               // Manager: page.properties.Manager.id,
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: '',
               geo: '',
               teh: '',
               status: Math.floor(Math.random()*9),//page.properties.Status.id,
            };
        });

        console.log(responseResults);
        return responseResults;
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

// app.post('/web-data', async (req, res) => {
//     const {queryId, products = [], totalPrice} = req.body;
//     try {
//         await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Успешная покупка',
//             input_message_content: {
//                 message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
//             }
//         })
//         return res.status(200).json({});
//     } catch (e) {
//         return res.status(500).json({})
//     }
// })

app.get('/secret',(req, res) => {
    const secret =  Math.floor(Math.random()*100)
    res.json({secret})
});

app.get("/projects", async (req, res) => {
    const projects = await getDatabase();
    res.json(projects);
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

      //добавление проекта с названием проекта в базу
      addItem(projectname, teh);

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