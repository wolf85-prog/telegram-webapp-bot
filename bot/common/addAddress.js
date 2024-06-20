require("dotenv").config();
const databaseAddressId = process.env.NOTION_DATABASE_ADDRESS_ID
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

module.exports = async function addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseAddressId },
            properties: {
                "Название площадки": {
                    type: "title",
                    title: [
                        {
                            type: "text",
                            text: {
                                content: geo,
                                "link": null
                            },
                            plain_text: geo,
                            "href": null
                        }
                    ]
                },
                "Адрес": {
                    type: "rich_text",
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: geo,
                                "link": null
                            },
                            plain_text: geo,
                            "href": null
                        }
                    ]
                },
            },
        })
        //console.log(response)
        console.log("0. Адрес успешно добавлен! " + response.id)

        //добавление проекта с названием проекта в базу
        // const project_id = await addProject(projectname, datestart, teh, managerId, companyId, worklist, response.id);

        // return project_id

    } catch (error) {
        console.error(error.message)
    }
}