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
               fio: page.properties["ФИО"].title[0]?.plain_text,
               tgID: page.properties.TelegramID.rich_text[0]?.plain_text,
               phone: page.properties["Основной"].phone_number,
            };
        });

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

        return response;
    } catch (error) {
        console.error(error.body)
    }
}


async function createManager(id, firstname, lastname) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseManagerId },
            properties: {
                "ФИО": {
                    type: "title",
                    title: [
                        {
                            "type": "text",
                            "text": {
                                "content": firstname +" "+ lastname,
                                "link": null
                            },
                            "plain_text": firstname +" "+ lastname,
                        }
                    ]
                },
                TelegramID: {
                    "type": "rich_text",
                    "rich_text": [
                        {
                            "type": "text",
                            "text": {
                                "content": id,
                                "link": null
                            },
                            "plain_text": id,
                        }
                    ]
                },
                "Должность": {
                    "type": "select",
                    "select": {
                        "id": "e2c4b173-3d60-467f-9597-81a2f8248437",
                        "name": "Менеджер",
                        "color": "yellow"
                    }
                },
                "Заказчики": {
                    "type": "relation",
                    "relation": [
                        {
                            "id": "b27565fe-ce91-4457-983e-5e40c1bcbceb"
                        }
                    ],
                },
            }
        })
        //console.log(response)
        const res_id = response.id;

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

    async companyId(req, res) {
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


    async create(req, res) {
        const {id, firstname, lastname} = req.body;
        try {
            const managers = await createManager(id, firstname, lastname);
            res.status(200).json(managers);
        } catch (err) {
            console.log(err)
            res.status(500).json(err);
        }
    }
}

module.exports = new ManagerController()