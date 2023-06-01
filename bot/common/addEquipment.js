require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

module.exports = async function addEquipment(blockId, equipment) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "Дата": {
                    type: 'date',                   
                    date: {
                        "start": date,
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
        console.log("5.1 Оборудование добавлено! Data: " + response.id) //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}