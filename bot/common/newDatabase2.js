require("dotenv").config();
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
//functions
const addWorker = require('./addWorker')
//fetch api
const fetch = require('node-fetch');

//send create db notion
module.exports = async function newDatabase2(parent_page_id, worklist, time) {
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
                "1. Чек-ин": {
                    "title": {}
                },
                "2. Дата": {
                    "date": {}
                },
                "3. Статус": {
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
                                "name": "Сопровождение",
                                "color": "pink"
                            },
                            {
                                "name": "Полный цикл",
                                "color": "blue"
                            },
                            {
                                "name": "Тесты \/ Чеки",
                                "color": "green"
                            },
                            {
                                "name": "Эфир",
                                "color": "yellow"
                            },
                            {
                                "name": "Демонтаж",
                                "color": "blue"
                            },
                            {
                                "name": "Сборы",
                                "color": "orange"
                            },
                            {
                                "name": "Выезд \/ Перелет",
                                "color": "purple"
                            },
                            {
                                "name": "Водитель ТС",
                                "color": "pink"
                            },
                            {
                                "name": "Отмена",
                                "color": "red"
                            },
                        ]
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
                                "name": "Оператор [cameraman]",
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
                            {
                                "name": "Оператор-постановщик",
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
                                "name": "C личным ТС [B\/C]",
                                "color": "yellow"
                            },
                            {
                                "name": "Без личного ТС [B\/C]",
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
                                "name": "Хостес",
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
                                "name": "Певец \/ певица",
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
                                "name": "Квесты",
                                "color": "orange"
                            },
                            {
                                "name": "Квизы",
                                "color": "orange"
                            },
                            {
                                "name": "Аниматоры",
                                "color": "orange"
                            },
                            {
                                "name": "Настольные игры \/ игровые автоматы",
                                "color": "orange"
                            },
                            {
                                "name": "Пневмокостюмы \/ ростовые куклы",
                                "color": "orange"
                            },
                            {
                                "name": "Активности \/ аттракционы",
                                "color": "orange"
                            },
                             //-------- Blacklist ------------------------------
                             {
                                "name": "Blacklist",
                                "color": "gray"
                            },
                        ]
                    }
                },
                "6. Мерч": {
                    "name": "Мерч",
                    "type": "checkbox",
                    "checkbox": {}
                },
                "7. КомТег": {
                    "multi_select": {
                        "options": [
                            {
                                "name": "Опоздание",
                                "color": "blue"
                            },
                            {
                                "name": "Невыход",
                                "color": "orange"
                            },
                            {
                                "name": "Без мерча",
                                "color": "purple"
                            },
                            {
                                "name": "Не компетентен",
                                "color": "green"
                            },
                            {
                                "name": "Нарушение субординации",
                                "color": "pink"
                            },
                            {
                                "name": "Нетрезвый вид",
                                "color": "blue"
                            },
                            {
                                "name": "Повышенная ставка",
                                "color": "orange"
                            },
                            {
                                "name": "Такси [корпоративное]",
                                "color": "green"
                            },
                            {
                                "name": "Такси [личные расходы]",
                                "color": "purple"
                            },
                            {
                                "name": "Общ. транспорт",
                                "color": "pink"
                            },
                            {
                                "name": "Каршеринг",
                                "color": "blue"
                            },
                            {
                                "name": "ГСМ",
                                "color": "orange"
                            },
                            {
                                "name": "Компенсация",
                                "color": "purple"
                            },
                            {
                                "name": "Доп. расходы",
                                "color": "green"
                            },
                            {
                                "name": "Суточные",
                                "color": "pink"
                            },
                            {
                                "name": "Старший",
                                "color": "blue"
                            },
                            {
                                "name": "Премия",
                                "color": "orange"
                            },
                            {
                                "name": "Герой дня",
                                "color": "purple"
                            },
                            {
                                "name": "Высотные работы",
                                "color": "brown"
                            },
                        ]
                    }
                },
                "8. Комментарий": {
                    "rich_text": {}
                },
                "9. Ставка": {
                    "type": "select",
                    "select": {
                        "options": [
                            {
                                "name": "№1",
                                "color": "blue"
                            },
                            {
                                "name": "№2",
                                "color": "orange"
                            }
                          ]
                    }
                },
                "90. Такси": {
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
        //console.log(response)
        console.log("2. Таблица Основной состав добавлена! Database_id: " + data.id)// + " data: " + JSON.stringify(data))

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
    
                //arrWorks.push(newCategory)
                arrWorks.push(newSpec)         
                
                addWorker(data.id, arrWorks, time)
            }    
            
        });
        
    } catch (error) {
        console.error(error.message)
    }
}