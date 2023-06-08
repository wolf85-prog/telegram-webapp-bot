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
        console.error(error.message)
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
               date: page.properties["1. Дата"].date.start,
               fio: page.properties["2. ФИО"].relation[0]?.id,
               title: page.properties["3. Специализация"].multi_select[0]?.name, 
               spec: page.properties["3. Специализация"].multi_select[1]?.name              
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}


async function getDatabaseId2(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить данные блока по заданному ID
async function getDatabaseEquipmentId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
               //id: page.id,
               category: page.properties["Наименование"].multi_select[0]?.name, 
               name: page.properties["Наименование"].multi_select[1]?.name              
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}


class DatabaseController {

    //специалисты
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

    //оборудование
    async databaseEquipmentId(req, res) {
        const id = req.params.id; // получаем id

        const base = await getDatabaseEquipmentId(id);               

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