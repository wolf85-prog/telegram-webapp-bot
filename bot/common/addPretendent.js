require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function addPretendent(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            // icon: {
            //     type: "emoji",
            //     emoji: "➡️"
            // },
            properties: {
                "01. Чек-ин": {
                    type: "title",
                    title: [
                        {
                            type: 'text',
                            text: {
                                content: " ",
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": " ",
                            "href": null
                        }
                    ],
                },
                // "03. Статус": {
                //     "type": "select",
                //     "select": {
                //         "name": "Не выбрано",
                //         "color": "blue"
                //     }
                // },
                // "2. Тех. Задание": {
                //     type: 'rich_text',   
                //     rich_text: [
                //         {
                //             "type": "text",
                //             "text": {
                //                 "content": "Техническое Задание текстом подробно",
                //             },                           
                //         }
                //     ]
                // },
            }
        })
        //console.log(response)
        console.log("4.1 Претендент добавлен!. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}