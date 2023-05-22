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
                "Name": {
                    "title": {}
                },              
                "Date": {
                    "date": {}
                },
                "Status": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Погрузка",
                                "color": "orange"
                            },
                            {
                                "name": "Монтаж",
                                "color": "blue"
                            },
                            {
                                "name": "Дежурство",
                                "color": "green"
                            },
                            {
                                "name": "Мероприятие",
                                "color": "purple"
                            },
                            {
                                "name": "Эфир",
                                "color": "yellow"
                            },
                            {
                                "name": "Демонтаж",
                                "color": "blue"
                            },
                        ]
                    }
                },
                "Комментарий": {
                    "rich_text": {}
                }               
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
        console.log("1. Grafik project added. Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //добавить даты (День2, День3, День4)
        await addDate(data.id, 'День №4');
        await addDate(data.id, 'День №3');
        await addDate(data.id, 'День №2');
        
    } catch (error) {
        console.error(error.message)
    }
}