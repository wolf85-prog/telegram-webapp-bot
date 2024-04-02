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
                "01. Чек-ин": {
                    "title": {}
                },             
                "02. Дата": {
                    "date": {}
                },
                "03. Статус": {
                    "type": "select",
                    "select": {
                      "options": [
                        {
                            "name": "В проект",
                            "color": "green"
                        },
                        {
                            "name": "Отказано",
                            "color": "orange"
                        },
                    ]
                }},
                "04. ФИО": {                  
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "05. Специальность": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Specialization",
                        "relation_property_name": "04. ФИО",
                        "function": "show_original"
                    }
                },
                "06. Ранг": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Ранг",
                        "relation_property_name": "04. ФИО",
                        "function": "show_original"
                    }
                },
                "07. Комментарий": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Комментарии",
                        "relation_property_name": "04. ФИО",
                        "function": "show_original"
                    }
                },
                "08. Телефон": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Phone",
                        "relation_property_name": "04. ФИО",
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