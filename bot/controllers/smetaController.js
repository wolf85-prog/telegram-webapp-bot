require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseSmetaId = process.env.NOTION_DATABASE_SMETA_ID

async function getSmeta() {
    try {
        const response = await notion.databases.query({
            database_id: databaseSmetaId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: page.properties["Дата"].date,
               time_start: page.properties["Дата"].date.start,
               time_created: page.created_time,
               geo: '', //page.properties.Address.rollup.array,
               teh: page.properties["Тех. задание"].rich_text,
               status_id: page.properties["Статус проекта"].select,
               manager: page.properties["Менеджер"].relation[0]?.id,
               company: page.properties["Компания"].relation[0]?.id,
               worklist:'',
            };
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить id сметы (страницы)
async function getSmetaId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseSmetaId, 
            "filter": {
                "property": "Проект",
                "relation": {
                    "contains": id
                }
            }
        });
        console.log("SmetaId: ", response.results[0].id)
        return response.results[0].id;
    } catch (error) {
        console.error(error.message)
    }
}

class SmetaController {
    
    async smeta(req, res) {
        const smeta = await getSmeta();
        res.json(smeta);
    }

    async smetaId(req, res) {
        const id = req.params.id; // получаем id
        const page = await getSmetaId(id);
        res.json(page);
    }

}

module.exports = new SmetaController()