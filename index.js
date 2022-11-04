require("dotenv").config();

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = process.env.TELEGRAM_API_TOKEN;
const webAppUrl = process.env.WEB_APP_URL;

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

const menuOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: 'Информация', callback_data:'sdfsdf'}, {text: 'Настройки', callback_data:'sdfsdf'}],
            [{text: 'Открыть Notion', callback_data:'sdfsdf'}],
        ]
    })
}

bot.setMyCommands([
    {command: '/menu', description: 'Главное меню'},
    {command: '/info', description: 'Получить информацию о боте'},
    {command: '/settings', description: 'Настройки'},
])

//send data to notion
async function addItem(text) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": text
                            }
                        }
                    ]
                },
                TG_chat_ID: {
                    rich_text:[
                        {
                            "text": {
                                "content": "47453454"
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
                Manager: page.properties.Manager.id,
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
        'web-приложении прямо из телеграм.', {menuOptions})
  }

  if (text === '/menu') {
      await bot.sendMessage(chatId, 'Смотрите и создавайте Notion-проекты в web-приложении прямо из телеграм.', {menuOptions})
  }

  if (text === '/info') {

  }

  if (text === '/settings') {

  }

  if(msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data)
        console.log(data)
        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Название проекта: ' + data?.country);
        await bot.sendMessage(chatId, 'Город: ' + data?.street);

        //добавление проекта с названием проекта в базу
        addItem(data?.country);

        //getDatabase();

        const projects = await getDatabase();
        res.json(projects);


        setTimeout(async () => {
            await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
        }, 3000)
    } catch (e) {
        console.log(e);
    }
  }
  
});

app.post('/web-data', async (req, res) => {
  const {queryId, products = [], totalPrice} = req.body;
  try {
      await bot.answerWebAppQuery(queryId, {
          type: 'article',
          id: queryId,
          title: 'Успешная покупка',
          input_message_content: {
              message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
          }
      })
      return res.status(200).json({});
  } catch (e) {
      return res.status(500).json({})
  }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))