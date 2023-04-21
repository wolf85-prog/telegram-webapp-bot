require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

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
                        "start": "2023-04-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                }
            }
        })
        //console.log(response)
        console.log("3.3 Success! Worker zapas added. Data: " + response.id) //JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}