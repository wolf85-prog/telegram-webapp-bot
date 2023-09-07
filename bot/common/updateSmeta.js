require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function updateSmeta(pageId) {
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            properties: {
                "Пред. смета": {
                    "type": "status",
                    "status": {
                        "id": "0c5b3c6e-2360-48e9-b34f-ada30852d5f4",
                        "name": "Подтверждена",
                        "color": "green"
                    }
                },
            },
        });
        console.log(response);
        console.log("Смета обновлена!") //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}