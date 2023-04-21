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

        const responseResults = response.results.map((block) => {
            //if (block.child_database.title == "Основной состав" || block.child_database.title == "Назначенные")
            if (block.child_database) {
                count++;
            }
        });

        let res;
        (count >1) ? res = response.results[1].id : res = response.results[0].id     

        return res;
    } catch (error) {
        console.error(error.message)
    }
}