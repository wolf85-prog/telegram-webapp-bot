require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

//получить id блока заданной страницы по id
module.exports = async function getProject(id) {
    try {
        const response = await notion.pages.retrieve({
            page_id: id,           
        });

        return response.properties.Crm_ID.rich_text[0]?.plain_text   

        //return response;
    } catch (error) {
        console.error(error.message)
    }
}