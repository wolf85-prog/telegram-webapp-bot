require("dotenv").config();
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

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
                // "1. Ставка": {
                //     "rich_text": {}
                // },             
                "2. Тех. задание": {
                    "title": {}
                },
                "3. Дата": {
                    "date": {}
                },
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
                        "relation_property_name": "2. ФИО",
                        "function": "show_original"
                    }
                },
                "6. Ранг": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Rank",
                        "relation_property_name": "2. ФИО",
                        "function": "show_original"
                    }
                },
                "7. Комментарий": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Комментарии",
                        "relation_property_name": "2. ФИО",
                        "function": "show_original"
                    }
                },
                "8. Телефон": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Phone",
                        "relation_property_name": "2. ФИО",
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
        console.log("5. Success! Pretendents added. Database_id: " + data.id) //" data: " + JSON.stringify(data))

        await addPretendent(data.id);

    } catch (error) {
        console.error(error.body)
    }
}