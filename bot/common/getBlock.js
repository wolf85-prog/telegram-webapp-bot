require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//получить id блока заданной страницы по id
module.exports = async function getBlock(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });


        return response;
    } catch (error) {
        console.error(error.message)
    }
}