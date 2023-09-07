require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseSmetaId = process.env.NOTION_DATABASE_SMETA_ID

//получить id блока заданной страницы по id
module.exports = async function getSmeta(projectId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseSmetaId, 
            "filter": {
                "property": "Проект",
                "relation": {
                    "contains": projectId
                }
            }
        });
        console.log("SmetaId: ", response.results[0].id)
        return response.results[0].id;
    } catch (error) {
        console.error(error.message)
    }
}