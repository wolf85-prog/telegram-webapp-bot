require("dotenv").config();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
               //id: page.id,
               fio: page.properties["2. 👷 ФИО"].relation[0]?.id,
               title: page.properties["3. Специализация"].multi_select[0]?.name,
               spec: page.properties["3. Специализация"].multi_select[1]?.name                
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}