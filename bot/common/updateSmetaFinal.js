require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function updateSmetaFinal(pageId) {
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            properties: {
                "Финал. смета": {
                    "type": "status",
                    "status": {
                        "id": "b102a1eb-6392-4e8c-a58a-d0f4ce1a5566",
                        "name": "Подтверждена",
                        "color": "green"
                    }
                },
            }
        })
        console.log(response)
        console.log("Смета обновлена!") //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}