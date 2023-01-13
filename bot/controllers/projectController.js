const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

class ProjectController {
    
    async getProjects(req, res) {
        try {
            const response = await notion.databases.query({
                database_id: databaseId
            });
    
            const responseResults = response.results.map((page) => {
                return {
                   id: page.id,
                   title: page.properties.Name.title[0]?.plain_text,
                   time: page.properties.Date.date,
                   time_start: page.properties.Date.date.start,
                   time_created: page.created_time,
                   geo: '', //page.properties.Address.rollup.array,
                   teh: page.properties.TechZadanie.rich_text,
                   status_id: page.properties.Status.select,
                   manager: page.properties.Manager.relation[0]?.id,
                   company: page.properties.Company.relation[0]?.id,
                   worklist:'',
                };
            });
    
            return responseResults;
        } catch (error) {
            console.error(error.body)
        }
    }

    async getProjects2(req, res) {
        const secret =  Math.floor(Math.random()*100)
        res.json({secret})
    }
}

module.exports = new ProjectController()