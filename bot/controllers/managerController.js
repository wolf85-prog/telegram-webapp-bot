require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseManagerId = process.env.NOTION_DATABASE_MANAGER_ID
const databaseCompanyId = process.env.NOTION_DATABASE_COMPANY_ID

//получить id менеджера по его TelegramID
async function getManagerId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            "filter": {
                "property": "TelegramID",
                "rich_text": {
                    "contains": id
                }
            }
        });

        console.log("-------------------------------------------------------")
        console.log("----------------Открытие приложения--------------------")
        console.log("-------------------------------------------------------")
        console.log("TelegramID: ", id)
        console.log("ManagerId: ", response.results[0].id)

        return response.results[0].id;
    } catch (error) {
        console.error(error.body)
    }
}

//получить id компании заказчика
async function getCompanyId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            "filter": {
                "property": "TelegramID",
                "rich_text": {
                    "contains": id
                }
            }
        });
        console.log("CompanyId: ", response.results[0].properties.Заказчики.relation[0].id)
        return response.results[0].properties.Заказчики.relation[0].id;
    } catch (error) {
        console.error(error.body)
    }
}

async function getManagers() {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}

async function getCompanys() {
    try {
        const response = await notion.databases.query({
            database_id: databaseCompanyId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}


class ManagerController {

    async managers(req, res) {
        const managers = await getManagers();
        res.json(managers);
    }

    async managersId(req, res) {
        const id = req.params.id; // получаем id
        const manager = await getManagerId(id);
        if(manager){
            res.json(manager);
        }
        else{
            res.json({});
        }
    }

    async managerId(req, res) {
        const id = req.params.id; // получаем id
        const manager = await getCompanyId(id);
        if(manager){
            res.json(manager);
        }
        else{
            res.json({});
        }
    }

    async companys(req, res) {
        const companys = await getCompanys();
        res.json(companys);
    }
}

module.exports = new ManagerController()