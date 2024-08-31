require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

//получить id всех проектов
module.exports = async function getProjectsOn() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });


        const responseResults = response.results.filter((page) => page.properties["Статус проекта"].select?.name === 'Load' || page.properties["Статус проекта"].select?.name === 'Ready' || page.properties["Статус проекта"].select?.name === 'OnAir').map((page) => {
            return {
                id: page.id,
                name: page.properties.Name?.title[0]?.plain_text,
                datestart: page.properties["Дата"].date?.start,
                crmID: page.properties.Crm_ID.rich_text[0]?.plain_text               
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}