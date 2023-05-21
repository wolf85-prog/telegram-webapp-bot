require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//получить id блока заданной страницы по id
module.exports = async function getBlocks(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        let count = 0;
        let res;

        const responseResults = response.results.map((block) => {
            if (block.child_database?.title === "Основной состав"){
               res = block.id 
            }
        });

        return res;
    } catch (error) {
        console.error(error.message)
    }
}