require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

//get items from DB
async function getDatabase() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить пустые данные блока
async function getDatabase2() {
    return {};
}


//получить данные блока по заданному ID
async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
               //id: page.id,
               fio: page.properties["2. 👷 ФИО"].relation[0]?.id,
               title: page.properties["3. Специализация"].multi_select[0]?.name              
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

async function getDatabaseId2(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}


class DatabaseController {

    async databaseId(req, res) {
        const id = req.params.id; // получаем id
        const base = await getDatabaseId(id);
    
        if(base){
            res.json(base);
        }
        else{
            res.json({});
        }
    }

    async databaseId2(req, res) {
        const id = req.params.id; // получаем id
        const base = await getDatabaseId2(id);
    
        if(base){
            res.json(base);
        }
        else{
            res.json({});
        }
    }

    async database(req, res) {
        const base = await getDatabase2();
        res.json(base);
    }

    async database1(req, res) {
        const projects = await getDatabase();
        res.json(projects);
    }
}

module.exports = new DatabaseController()