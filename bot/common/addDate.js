require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

//send data to notion
module.exports = async function addDate(blockId, day, day2) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            icon: {
                type: "emoji",
                emoji: "🔔"
            },
            properties: {
                "2. График №1": {
                    "multi_select": [
                        {
                            "name": day,
                            "color": "blue"
                        },
                    ]
                },
                "3. Дата №1" : {
                    type: 'date',                   
                    date: {
                        "start": date,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                "4. График №2": {
                    "multi_select": [
                        {
                            "name": day2,
                            "color": "orange"
                        },
                    ]
                },
                "5. Дата №2" : {
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
        console.log("1.1 Дата добавлена! Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}