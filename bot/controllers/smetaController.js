require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const smetaId = process.env.NOTION_DATABASE_SMETA_ID

async function getSmeta() {
    try {
        const response = await notion.databases.query({
            database_id: smetaId
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

class SmetaController {
    
    async smeta(req, res) {
        const smeta = await getSmeta();
        res.json(smeta);
    }

}

module.exports = new SmetaController()