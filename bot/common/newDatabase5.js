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
                          "id": "134ece9a-384d-4d1f-97f7-7f685b29ae9b",
                          "name": "Не выбрано",
                          "color": "blue"
                        },
                        {
                          "id": "234ece9a-384d-4d1f-97f7-7f685b29ae9b",
                          "name": "В чат",
                          "color": "green"
                        },
                        {
                          "id": "334ece9a-384d-4d1f-97f7-7f685b29ae9b",
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
                            "134ece9a-384d-4d1f-97f7-7f685b29ae9b",
                            "234ece9a-384d-4d1f-97f7-7f685b29ae9b",
                            "334ece9a-384d-4d1f-97f7-7f685b29ae9b",
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

        await addPretendent(data.id);

        return data.id

    } catch (error) {
        console.error(error.message)
    }
}