require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function updateProject(pageId, teh, summaStavki) {
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            properties: {
                "Тех. задание": {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": `❌ Ставка = ${summaStavki} ❌\n\n ${teh}`,
                                "link": null
                            },
                            "plain_text": `❌ Ставка = ${summaStavki} ❌\n\n ${teh}`,
                            "href": null
                        }
                    ]
                },
            },
        });
        
        if (response) {
            console.log("Проект обновлен!") //+ JSON.stringify(response))
        } else {
            console.log("Ошибка обновления проекта!") //+ JSON.stringify(response))
        }
    } catch (error) {
        console.error(error.message)
    }
}