require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//send data to notion
module.exports = async function updateToDoFinal(blockId) {
    try {
        const response = await notion.blocks.update({
            "block_id": blockId,
            "to_do": {
                "text": [{ 
                  "text": { "content": "Финальная смета" } 
                  }],
                "checked": true
              }
        })
        //console.log(response)
        console.log("Смета обновлена!") //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}