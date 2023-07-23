require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// текущая дата
const dateNow = new Date();
const date = dateNow.getFullYear() + "-0" + ((dateNow.getMonth())+1) + "-01T00:00:00.000"

//send data to notion
module.exports = async function addDate(blockId, day) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                Name: {
                    type: "title",
                    title: [
                        {
                            "type": "text",
                            "text": {
                                "content": "🔔",
                                "link": null
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": "🔔",
                            "href": null
                        }
                    ]
                },
                Date : {
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