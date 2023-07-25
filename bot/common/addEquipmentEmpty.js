require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });


module.exports = async function addEquipmentEmpty(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                "Дата": {
                    type: 'date',                   
                    date: {
                        "start": '',
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                // "Наименование": {
                //     type: "multi_select",
                //     multi_select: []
                // }
            }
        })
        //console.log(response)
        console.log("5.1 Оборудование добавлено! Data: " + response.id) //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.message)
    }
}