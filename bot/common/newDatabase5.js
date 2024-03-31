require("dotenv").config();
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
//fetch api
const fetch = require('node-fetch');

//functions
const addPretendent = require('./addPretendent')

// создание БД "Претенденты"
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
                "1. Чек-ин": {
                    "title": {}
                },             
                "2. Дата": {
                    "date": {}
                },
                "Status": {
                    "type": "status",
                    "status": {
                        "id": "4d44b2da-bcd1-4893-a051-bd90c6e97ba7",
                        "name": "Not started",
                        "color": "default"
                    }
                },
                // "3. Статус": {
                //     "type": "status",
                //      "status": {
                //      "options": [
                //             {
                //             "id": "7a2f146b-560d-4e3d-9eda-09f254d11b32",
                //             "name": "Не выбрано",
                //             "color": "default"
                //             },
                //         ],
                //         "groups": [
                //             {
                //             "name": "To-do",
                //             "color": "gray",
                //             "option_ids": [
                //                 "7a2f146b-560d-4e3d-9eda-09f254d11b32",
                //             ]
                //             },
                //         ]
                //    }
                //},
                "4. ФИО": {    
                    "name": "ФИО",               
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "5. Специализация": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Specialization",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
                "6. Ранг": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Ранг",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
                "7. Комментарий": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Комментарии",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
                "8. Телефон": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Phone",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
            }
        }

        // создание базы данных "Претенденты"
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

        if (data.id) {
            console.log("4. Таблица Претенденты добавлена! Database_id: " + data.id) 
        } else {
            console.log("4. Таблица Претенденты не добавлена! ") 
        }
        
        if (data.id) {
           await addPretendent(data.id); 
        }
        
        return data.id

    } catch (error) {
        console.error(error.message)
    }
}