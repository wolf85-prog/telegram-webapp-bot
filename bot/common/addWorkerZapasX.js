require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

//Добавление строк в таблицу "Запасной состав"
module.exports = async function addWorkerZapasX(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            cover: null,
            icon: {
                type: "emoji",
                emoji: "❌"
            },
            properties: {
                "1. Чек-ин": {
                    title:[
                        {
                            "text": {
                                "content": " "
                            }
                        }
                    ]
                },

            }
        })

        if (response) {
            console.log("3.1 Специалист в Запасной состав добавлен! Data: " + response.id) //JSON.stringify(response)) 
         } else {
             console.log("3.1 Ошибка добавления специалиста в Запасной состав!")
         }
    } catch (error) {
        console.error(error.message)
    }
}