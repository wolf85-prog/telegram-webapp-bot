require("dotenv").config();
const addEquipment = require("./addEquipment");
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;

module.exports = async function newDatabase4(parent_page_id, equipmentlist) {
    //создание базы данных "Оборудование"
    try {
        const body = {
            "parent": {
                "type": "page_id",
                "page_id": parent_page_id
            },
            "title": [
                {
                    "type": "text",
                    "text": {
                        "content": "Оборудование"
                    }
                }
            ],
            "is_inline": true,
            "properties": {              
                "Date": {
                    "date": {}
                },
                "Наименование": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Sound",
                                "color": "blue"
                            },
                            {
                                "name": "Light",
                                "color": "yellow"
                            },
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            {
                                "name": "Production",
                                "color": "orange"
                            }
                        ]
                    }
                },
                "Комментарий": {
                    "title": {}
                },                 
            }
        }

        // создание базы данных "Оборудование"
        const response = await fetch('https://api.notion.com/v1/databases', {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Authorization': token_fetch, //`Bearer ${token}`
                'Content-Type': 'application/json', 
                accept: 'application/json',
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        console.log("4. Success! Equipments added. Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //добавить список работников
        equipmentlist.forEach((equipment, index) => {
            if (equipment.count > 1) {
                for (let i = 0; i < equipment.count; i++) {
                    addEquipment(data.id, equipment.icon)
                }
            } else {
                addEquipment(data.id, equipment.icon)
            }          
        });
        
    } catch (error) {
        console.error(error.body)
    }   
}