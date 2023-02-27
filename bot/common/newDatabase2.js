require("dotenv").config();
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
//functions
const addWorker = require('./addWorker')

//send create db notion
module.exports = async function newDatabase(parent_page_id, worklist) {
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
                        "content": "Основной состав"
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
                                "name": "Звукорежиссер",
                                "color": "blue"
                            },
                            {
                                "name": "RF-Менеджер",
                                "color": "blue"
                            },
                            {
                                "name": "Backline",
                                "color": "blue"
                            },
                            {
                                "name": "Roadie",
                                "color": "blue"
                            },
                            {
                                "name": "Техник по звуку",
                                "color": "blue"
                            },
                            //-------- Light ------------------------------
                            {
                                "name": "Light",
                                "color": "yellow"
                            },
                            //-------- Video ------------------------------
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            //-------- Riggers ------------------------------
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            //-------- Stagehands ------------------------------
                            {
                                "name": "Stagehands",
                                "color": "blue"
                            },
                            //-------- Stage Ground ------------------------------
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            //-------- Trucks ------------------------------
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            //-------- Production ------------------------------
                            {
                                "name": "Production",
                                "color": "orange"
                            }
                        ]
                    }
                },
                "4. Мерч": {
                    "name": "Мерч",
                    "type": "checkbox",
                    "checkbox": {}
                },
                "5. Комментарий": {
                    "rich_text": {}
                },
                "6. Рейтинг": {
                    "rich_text": {}
                },
                "7. Такси": {
                    "name": "Такси",
                    "type": "checkbox",
                    "checkbox": {}
                },
            }
        }

        // создание базы данных "Основной состав"
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
        console.log("2 Success! Maincast added. Database_id: " + data.id)// + " data: " + JSON.stringify(data))

        //добавить список работников
        let arrWorks = []
        worklist.forEach((worker, index) => {
            if (worker.count > 1) {
                const newSpec = {
                    name: worker.icon,
                }
                arrWorks.push(newSpec)
                //добавить категорию
                addWorker(data.id, arrWorks)
                //добавить специальности
                // for (let i = 0; i < worker.count; i++) {
                //     addWorker(data.id, worker.spec)
                // }
            } else if (worker.count == 1) {
                const newSpec = {
                    name: worker.icon,
                }
                arrWorks.push(newSpec)
                addWorker(data.id, arrWorks)
                //addWorker(data.id, worker.spec)
            }  

        });
        
    } catch (error) {
        console.error(error.body)
    }
}