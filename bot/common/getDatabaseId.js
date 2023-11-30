require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.filter((page) => page.properties["2. Дата"].date).map((page) => {
            return {   
                id: page.id,        
                date: page.properties["2. Дата"].date?.start,
                fio: page.properties["4. ФИО"].relation[0]?.id,
                vid: page.properties["3. Вид работ"] ? page.properties["3. Вид работ"].multi_select[0]?.name : page.properties["3. Статус"].multi_select[0]?.name,
                spec: page.properties["5. Специализация"].multi_select[0]?.name 
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}