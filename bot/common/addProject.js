require("dotenv").config();
const databaseId = process.env.NOTION_DATABASE_ID

module.exports = async function addProject(title, time, teh, managerId, companyId, worklist, geoId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            icon: {
                type: "emoji",
                emoji: "🟦"
            },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                Date: {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                TechClient: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: teh,
                            },
                        }
                        ],
                },
                Status: {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                City: {
                    type: 'select',
                    select: {
                        "id": "4e370773-fb5d-4ef7-bd2a-eaa91e5919e0",
                        "name": "Test",
                        "color": "brown"
                    }
                },
                Manager: {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                Company: {
                    type: "relation",
                    relation: [
                        {
                            "id": companyId
                        }
                    ]
                },
                "Площадка": {
                    "type": "relation",
                    "relation": [
                        {
                            "id": geoId
                        }
                    ],
                    "has_more": false
                }
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log(new Date())
        console.log("1 Проект с адресом добавлено! " + res_id)

        //setTimeout(()=> {
            newDatabase_1(res_id);
        //}, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000)

        return res_id;

    } catch (error) {
        console.error(error.message)
    }
}