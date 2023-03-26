require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function addWorker(blockId, worker) {
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
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                "3. Специализация": {
                    type: "multi_select",
                    multi_select: worker
                }
            }
        })
        //console.log(response)
        console.log("3 Success! Worker added. Data: " + response.id) //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}