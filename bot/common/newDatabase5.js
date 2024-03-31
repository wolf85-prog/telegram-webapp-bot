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
                // "2. Тех. Задание": {
                //     "rich_text": {}
                // },
                "02. Дата": {
                    "date": {}
                },
                "03. Статус": {
                    "name": "Статус",
                    "type": "status",
                    "status": {
                      "options": [
                        {
                          "id": "7a2f146b-560d-4e3d-9eda-09f254d11b32",
                          "name": "Не выбрано",
                          "color": "blue"
                        },
                        {
                          "id": "X<B^",
                          "name": "В чат",
                          "color": "green"
                        },
                        {
                          "id": "A]py",
                          "name": "Отказ",
                          "color": "orange"
                        }
                      ],
                      "groups": [
                        {
                          "id": "b9d42483-e576-4858-a26f-ed940a5f678f",
                          "name": "To-do",
                          "color": "gray",
                          "option_ids": [
                            "7a2f146b-560d-4e3d-9eda-09f254d11b32",
                            "X<B^",
                            "A]py",
                          ]
                        },
                        // {
                        //   "id": "cf4952eb-1265-46ec-86ab-4bded4fa2e3b",
                        //   "name": "In progress",
                        //   "color": "blue",
                        //   "option_ids": [
                        //     "330aeafb-598c-4e1c-bc13-1148aa5963d3"
                        //   ]
                        // },
                        // {
                        //   "id": "4fa7348e-ae74-46d9-9585-e773caca6f40",
                        //   "name": "Complete",
                        //   "color": "green",
                        //   "option_ids": [
                        //     "497e64fb-01e2-41ef-ae2d-8a87a3bb51da"
                        //   ]
                        // }
                      ]
                    }
                },
                "04. ФИО": {    
                    "name": "ФИО",               
                    "type": "relation",
                    "relation": {
                        "database_id": databaseWorkersId,
                        "single_property": {}
                    }
                },
                "05. Специализация": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Specialization",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
                "06. Ранг": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Ранг",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
                "07. Комментарий": {
                    "type": "rollup",
                    "rollup": {
                        "rollup_property_name": "Комментарии",
                        "relation_property_name": "4. ФИО",
                        "function": "show_original"
                    }
                },
                "08. Телефон": {
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
        console.log("4. Таблица Претенденты добавлена! Database_id: " + data.id) //" data: " + JSON.stringify(data))

        if (data.id) {
           await addPretendent(data.id); 
        }
        
        return data.id

    } catch (error) {
        console.error(error.message)
    }
}