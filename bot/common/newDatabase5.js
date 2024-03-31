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
                "3. Статус": {
                    "type": "status",
                    "status": {
                     "options": [
                        {
                          //"id": "7a2f146b-560d-4e3d-9eda-09f254d11b32",
                          "name": "Не выбрано",
                          "color": "blue"
                        },
                        // {
                        //   //"id": "X<B^",
                        //   "name": "В чат",
                        //   "color": "green"
                        // },
                        // {
                        //   //"id": "A]py",
                        //   "name": "Отказ",
                        //   "color": "orange"
                        // }
                     ],
                    //   "groups": [
                    //     {
                    //       //"id": "b9d42483-e576-4858-a26f-ed940a5f678f",
                    //       "name": "To-do",
                    //       "color": "gray",
                    //       "option_ids": [
                    //         "7a2f146b-560d-4e3d-9eda-09f254d11b32",
                    //         // "X<B^",
                    //         // "A]py",
                    //       ]
                    //     },
                    //   ]
                    //"status": {
                       // "options": [
                        //   {
                        //     "id": "034ece9a-384d-4d1f-97f7-7f685b29ae9b",
                        //     "name": "Not started",
                        //     "color": "default"
                        //   },
                        //   {
                        //     "id": "330aeafb-598c-4e1c-bc13-1148aa5963d3",
                        //     "name": "In progress",
                        //     "color": "blue"
                        //   },
                        //   {
                        //     "id": "497e64fb-01e2-41ef-ae2d-8a87a3bb51da",
                        //     "name": "Done",
                        //     "color": "green"
                        //   }
                        //],
                       // "groups": [
                        //   {
                        //     "id": "b9d42483-e576-4858-a26f-ed940a5f678f",
                        //     "name": "To-do",
                        //     "color": "gray",
                        //     "option_ids": [
                        //       "034ece9a-384d-4d1f-97f7-7f685b29ae9b"
                        //     ]
                        //   },
                        //   {
                        //     "id": "cf4952eb-1265-46ec-86ab-4bded4fa2e3b",
                        //     "name": "In progress",
                        //     "color": "blue",
                        //     "option_ids": [
                        //       "330aeafb-598c-4e1c-bc13-1148aa5963d3"
                        //     ]
                        //   },
                        //   {
                        //     "id": "4fa7348e-ae74-46d9-9585-e773caca6f40",
                        //     "name": "Complete",
                        //     "color": "green",
                        //     "option_ids": [
                        //       "497e64fb-01e2-41ef-ae2d-8a87a3bb51da"
                        //     ]
                        //   }
                        //]
                    }
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