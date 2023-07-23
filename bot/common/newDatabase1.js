require("dotenv").config();
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
//fetch api
const fetch = require('node-fetch');

//functions
const addDate = require('./addDate')

//создание базы данных "График работы"
module.exports = async function newDatabase1(parent_page_id) {
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
                        "content": "График проекта"
                    }
                }
            ],
            "is_inline": true,
            "properties": {  
                "Комментарий": {
                    "title": {}
                },                             
                "График №1": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "День №1",
                                "color": "blue"
                            },
                            {
                                "name": "День №2",
                                "color": "blue"
                            },
                            {
                                "name": "День №3",
                                "color": "blue"
                            },
                            {
                                "name": "День №4",
                                "color": "blue"
                            },
                            {
                                "name": "День №5",
                                "color": "orange"
                            },
                            {
                                "name": "День №6",
                                "color": "orange"
                            },
                            {
                                "name": "День №7",
                                "color": "orange"
                            },
                            {
                                "name": "День №8",
                                "color": "orange"
                            },
                            {
                                "name": "День №9",
                                "color": "green"
                            },
                            {
                                "name": "День №10",
                                "color": "green"
                            },
                            {
                                "name": "День №11",
                                "color": "green"
                            },
                            {
                                "name": "День №12",
                                "color": "green"
                            },
                            {
                                "name": "День №13",
                                "color": "purple"
                            },
                            {
                                "name": "День №14",
                                "color": "purple"
                            },
                            {
                                "name": "День №15",
                                "color": "purple"
                            },
                            {
                                "name": "День №16",
                                "color": "purple"
                            },
                            {
                                "name": "День №17",
                                "color": "yellow"
                            },
                            {
                                "name": "День №18",
                                "color": "yellow"
                            },
                            {
                                "name": "День №19",
                                "color": "yellow"
                            },
                            {
                                "name": "День №20",
                                "color": "yellow"
                            },
                            {
                                "name": "День №21",
                                "color": "pink"
                            },
                            {
                                "name": "День №22",
                                "color": "pink"
                            },
                            {
                                "name": "День №23",
                                "color": "pink"
                            },
                            {
                                "name": "День №24",
                                "color": "pink"
                            },
                        ]
                    }
                },
                "Дата №1": {
                    "date": {}
                },
                "График №2": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "День №1",
                                "color": "blue"
                            },
                            {
                                "name": "День №2",
                                "color": "blue"
                            },
                            {
                                "name": "День №3",
                                "color": "blue"
                            },
                            {
                                "name": "День №4",
                                "color": "blue"
                            },
                            {
                                "name": "День №5",
                                "color": "orange"
                            },
                            {
                                "name": "День №6",
                                "color": "orange"
                            },
                            {
                                "name": "День №7",
                                "color": "orange"
                            },
                            {
                                "name": "День №8",
                                "color": "orange"
                            },
                            {
                                "name": "День №9",
                                "color": "green"
                            },
                            {
                                "name": "День №10",
                                "color": "green"
                            },
                            {
                                "name": "День №11",
                                "color": "green"
                            },
                            {
                                "name": "День №12",
                                "color": "green"
                            },
                            {
                                "name": "День №13",
                                "color": "purple"
                            },
                            {
                                "name": "День №14",
                                "color": "purple"
                            },
                            {
                                "name": "День №15",
                                "color": "purple"
                            },
                            {
                                "name": "День №16",
                                "color": "purple"
                            },
                            {
                                "name": "День №17",
                                "color": "yellow"
                            },
                            {
                                "name": "День №18",
                                "color": "yellow"
                            },
                            {
                                "name": "День №19",
                                "color": "yellow"
                            },
                            {
                                "name": "День №20",
                                "color": "yellow"
                            },
                            {
                                "name": "День №21",
                                "color": "pink"
                            },
                            {
                                "name": "День №22",
                                "color": "pink"
                            },
                            {
                                "name": "День №23",
                                "color": "pink"
                            },
                            {
                                "name": "День №24",
                                "color": "pink"
                            },
                        ]
                    }
                },
                "Дата №2": {
                    "date": {}
                },
            }
        }

        // создание базы данных "График проекта"
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
        console.log("1. Таблица График проектов добавлена! Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //добавить даты (День2, День3, День4)
        await addDate(data.id, 'День №4', 'День №8');
        await addDate(data.id, 'День №3', 'День №7');
        await addDate(data.id, 'День №2', 'День №6');
        await addDate(data.id, 'День №1', 'День №5');
        
    } catch (error) {
        console.error(error.message)
    }
}