require("dotenv").config();
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

// создание БД "Запасной состав"
module.exports = async function newDatabase5(parent_page_id) {
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
                        "content": "Претенденты"
                    }
                }
            ],
            "is_inline": true,
            "properties": {                
                "Name": {
                    "title": {}
                },
                "1. Дата": {
                    "date": {}
                },
                "2. 👷 ФИО": {    
                    "name": "👷 ФИО",               
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "3. Специализация": {
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
                                "name": "Stagehands",
                                "color": "blue"
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
                "4. Комментарий": {
                    "rich_text": {}
                },
                "5. Телефон": {
                    "rich_text": {}
                },
            }
        }

        // создание базы данных "Запасной состав"
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
        console.log("5. Success! Pretendents added. Database_id: " + data.id)// + " data: " + JSON.stringify(data))

    } catch (error) {
        console.error(error.body)
    }
}