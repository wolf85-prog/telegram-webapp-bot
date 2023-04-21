require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function addPretendent(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "1. Ставка": {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: "0 000.00 — 0 000.00",
                            },
                        }
                    ],
                },
                "2. Тех. задание": {
                    type: "title",
                    title: [
                        {
                            "type": "text",
                            "text": {
                                "content": "",
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
                            "plain_text": "",
                            "href": null
                        }
                    ]
                },
            }
        })
        //console.log(response)
        console.log("5.1 Pretendent added. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}