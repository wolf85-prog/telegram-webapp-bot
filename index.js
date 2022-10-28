require("dotenv").config();

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

//telegram api
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5360466924:AAHNPVR7bV9269oe-pzxtzTuj58HIR4Jf5c';
const webAppUrl = 'https://inspiring-manatee-7e59f8.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

//send data to notion
async function addItem(text) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                title: {
                    title:[
                        {
                            "text": {
                                "content": text
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


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    
    await bot.sendMessage(chatId, 'Ниже появится форма, заполни ее', {
      reply_markup: {
        inline_keyboard:[
          [{text: 'Создать проект', web_app: {url: webAppUrl + '/form'}}]
        ]
      }
    })

      await  bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        reply_markup: {
            keyboard:[
                [{text: 'Заполнить форму', web_app:{url: webAppUrl + '/form'}}]
            ]
        }
    })

    await bot.on('message', (msg) => {
          const chatId = msg.chat.id;

          // send a message to the chat acknowledging receipt of their message
          bot.sendMessage(chatId, 'Получил ваше сообщение');
    });

  }

  if(msg?.web_app_data?.data) {
    try {
        const data = JSON.parse(msg?.web_app_data?.data)
        console.log(data)
        await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
        await bot.sendMessage(chatId, 'Название проекта: ' + data?.country);
        await bot.sendMessage(chatId, 'Город: ' + data?.street);

        addItem("Тестовый проект 2");

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