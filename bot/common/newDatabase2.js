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
                            {
                                "name": "Художник по свету",
                                "color": "yellow"
                            },
                            {
                                "name": "Оператор световой пушки",
                                "color": "yellow"
                            },
                            {
                                "name": "Гафер",
                                "color": "yellow"
                            },
                            {
                                "name": "Техник по свету",
                                "color": "yellow"
                            },
                            //-------- Video ------------------------------
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Инженер VMix",
                                "color": "green"
                            },
                            {
                                "name": "Инженер Resolume",
                                "color": "green"
                            },
                            {
                                "name": "Оператор Zoom",
                                "color": "green"
                            },
                            {
                                "name": "Оператор [сameraman]",
                                "color": "green"
                            },
                            {
                                "name": "Техник монтажа",
                                "color": "green"
                            },
                            {
                                "name": "IT-специалист",
                                "color": "green"
                            },
                            //-------- Riggers ------------------------------
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Верхний Риггер",
                                "color": "orange"
                            },
                            {
                                "name": "Нижний Риггер",
                                "color": "orange"
                            },
                            //-------- Stagehands ------------------------------
                            {
                                "name": "Stagehands",
                                "color": "blue"
                            },
                            {
                                "name": "Помощник \/ Грузчик",
                                "color": "blue"
                            },
                            {
                                "name": "Промоутер",
                                "color": "blue"
                            },
                            //-------- Stage Ground ------------------------------
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Риггер [Ground]",
                                "color": "green"
                            },
                            {
                                "name": "Монтажник [Ground]",
                                "color": "green"
                            },
                            {
                                "name": "Декоратор",
                                "color": "green"
                            },
                            //-------- Trucks ------------------------------
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            {
                                "name": "C личным ТС [B/C]",
                                "color": "yellow"
                            },
                            {
                                "name": "Без личного ТС [B/C]",
                                "color": "yellow"
                            },
                            {
                                "name": "С гидролифтом",
                                "color": "yellow"
                            },
                            {
                                "name": "Без гидролифта",
                                "color": "yellow"
                            },
                            //-------- Production ------------------------------
                            {
                                "name": "Production",
                                "color": "orange"
                            },
                            {
                                "name": "Мероприятие под ключ",
                                "color": "orange"
                            },
                            {
                                "name": "Отдельные технические задачи",
                                "color": "orange"
                            },
                            //-------- Catering ------------------------------
                            {
                                "name": "Catering",
                                "color": "blue"
                            },
                            {
                                "name": "Официант",
                                "color": "blue"
                            },
                            {
                                "name": "Бармен",
                                "color": "blue"
                            },
                            {
                                "name": "Повар",
                                "color": "blue"
                            },
                            {
                                "name": "Хостел",
                                "color": "blue"
                            },
                            {
                                "name": "Банкетный менеджер",
                                "color": "blue"
                            },
                             //-------- Photo ------------------------------
                             {
                                "name": "Photo",
                                "color": "yellow"
                            },
                            {
                                "name": "Свадебная съемка",
                                "color": "yellow"
                            },
                            {
                                "name": "Репортажная съемка",
                                "color": "yellow"
                            },
                            {
                                "name": "Портретная съемка",
                                "color": "yellow"
                            },
                            {
                                "name": "Предметная съемка",
                                "color": "yellow"
                            },
                            {
                                "name": "Документальная съемка",
                                "color": "yellow"
                            },
                             //-------- Party ------------------------------
                             {
                                "name": "Party",
                                "color": "green"
                            },
                            {
                                "name": "Кавер-бенд",
                                "color": "green"
                            },
                            {
                                "name": "Танцевальный коллектив",
                                "color": "green"
                            },
                            {
                                "name": "Диджей",
                                "color": "green"
                            },
                            {
                                "name": "Ведущий",
                                "color": "green"
                            },
                            {
                                "name": "Певец/певица",
                                "color": "green"
                            },
                            {
                                "name": "Артист оригинального жанра",
                                "color": "green"
                            },
                            {
                                "name": "Go-Go",
                                "color": "green"
                            },
                             //-------- Games ------------------------------
                             {
                                "name": "Games",
                                "color": "orange"
                            },
                            {
                                "name": "Аттракционы",
                                "color": "orange"
                            },
                            {
                                "name": "Надувные фигуры",
                                "color": "orange"
                            },
                            {
                                "name": "Игровые автоматы",
                                "color": "orange"
                            },
                            {
                                "name": "Активности",
                                "color": "orange"
                            },
                            {
                                "name": "Настольные игры",
                                "color": "orange"
                            },
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
        
        worklist.forEach((worker) => {
            
            for (let i = 0; i < worker.count; i++) {
                let arrWorks = []
                const newCategory = {
                    name: worker.icon,
                }
                const newSpec = {
                    name: worker.spec,
                }
    
                arrWorks.push(newCategory)
                arrWorks.push(newSpec)         
                
                addWorker(data.id, arrWorks)
            }    
            
            

        });
        
    } catch (error) {
        console.error(error.body)
    }
}