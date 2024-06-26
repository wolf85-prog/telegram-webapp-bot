require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

//Добавление строк в таблицу "Запасной состав"
module.exports = async function addWorkerZapas(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "Ставка": {
                    title:[
                        {
                            "text": {
                                "content": "000.00"
                            }
                        }
                    ]
                },
                "1. Дата": {
                    type: 'date',                   
                    date: {
                        "start": date,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                }
            }
        })
        //console.log(response)
        console.log("3.1 Специалист в Запасной состав добавлен! Data: " + response.id) //JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}