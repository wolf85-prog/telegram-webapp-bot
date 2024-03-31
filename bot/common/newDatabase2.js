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
                                "color": "orange"
                            },
                            {
                                "name": "Демонтаж",
                                "color": "blue"
                            },
                            {
                                "name": "Эфир",
                                "color": "green"
                            },
                            {
                                "name": "Тесты \/ Чеки",
                                "color": "purple"
                            },
                            {
                                "name": "Сборы",
                                "color": "pink"
                            },
                            {
                                "name": "Работы на складе",
                                "color": "orange"
                            },
                            {
                                "name": "Выезд \/ Перелет",
                                "color": "blue"
                            },
                            {
                                "name": "Водитель ТС",
                                "color": "green"
                            },
                            {
                                "name": "Доставка",
                                "color": "purple"
                            },
                            {
                                "name": "Отмена",
                                "color": "pink"
                            },
                            {
                                "name": "Запасной состав",
                                "color": "orange"
                            },
                            {
                                "name": "Постер",
                                "color": "blue"
                            },
                            {
                                "name": "Репетиция",
                                "color": "green"
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
                // "5. Специализация": {
                //     "multi_select": {
                //         "options": [
                //             {
                //                 "name": "Sound",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Звукорежиссер",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "RF-Менеджер",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Backline",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Roadie",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Техник по звуку",
                //                 "color": "blue"
                //             },
                //             //-------- Light ------------------------------
                //             {
                //                 "name": "Light",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Художник по свету",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Оператор световой пушки",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Гафер",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Техник по свету",
                //                 "color": "yellow"
                //             },
                //             //-------- Video ------------------------------
                //             {
                //                 "name": "Video",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Инженер VMix",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Инженер Resolume",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Оператор Zoom",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Оператор [cameraman]",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Оператор-постановщик",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Режиссер эфиров",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Техник монтажа",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "IT-специалист",
                //                 "color": "green"
                //             },

                //              //-------- Photo ------------------------------
                //              {
                //                 "name": "Photo",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Свадебная съемка",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Репортажная съемка",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Портретная съемка",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Предметная съемка",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Документальная съемка",
                //                 "color": "orange"
                //             },
                //             //---------Promo---------------------------------
                //             {
                //                 "name": "Promo",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Модель",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Актер",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Промоутер",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Гример",
                //                 "color": "blue"
                //             },
                //             //-------- Catering ------------------------------
                //             {
                //                 "name": "Catering",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Официант",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Бармен",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Повар",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Хостес",
                //                 "color": "blyellowue"
                //             },
                //             {
                //                 "name": "Банкетный менеджер",
                //                 "color": "yellow"
                //             },
                //             //-------- Stagehands ------------------------------
                //             {
                //                 "name": "Stagehands",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Помощник \/ Грузчик",
                //                 "color": "green"
                //             },
                            
                //             //-------- Riggers ------------------------------
                //             {
                //                 "name": "Riggers \/ Ground",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Верхний Риггер",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Нижний Риггер",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Монтажник [Ground]",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Декоратор",
                //                 "color": "orange"
                //             },
                            
                //             //-------- Stage Ground ------------------------------
                //             // {
                //             //     "name": "Stage Ground",
                //             //     "color": "green"
                //             // },
                //             // {
                //             //     "name": "Риггер [Ground]",
                //             //     "color": "green"
                //             // },
                //             // {
                //             //     "name": "Монтажник [Ground]",
                //             //     "color": "green"
                //             // },
                //             // {
                //             //     "name": "Декоратор",
                //             //     "color": "green"
                //             // },

                //             //-------- Trucks ------------------------------
                //             {
                //                 "name": "Trucks",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "C личным ТС [B\/C]",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Без личного ТС [B\/C]",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "С гидролифтом",
                //                 "color": "blue"
                //             },
                //             {
                //                 "name": "Без гидролифта",
                //                 "color": "blue"
                //             },

                //             //-------- Party ------------------------------
                //             {
                //                 "name": "Party",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Кавер-бенд",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Танцевальный коллектив",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Диджей",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Ведущий",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Певец \/ певица",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Артист оригинального жанра",
                //                 "color": "yellow"
                //             },
                //             {
                //                 "name": "Go-Go",
                //                 "color": "yellow"
                //             },

                //             //-------- Games ------------------------------
                //             {
                //                 "name": "Games",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Квесты",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Квизы",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Аниматоры",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Настольные игры \/ игровые автоматы",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Пневмокостюмы \/ ростовые куклы",
                //                 "color": "green"
                //             },
                //             {
                //                 "name": "Активности \/ аттракционы",
                //                 "color": "green"
                //             },

                //             //-------- Production ------------------------------
                //             {
                //                 "name": "Production",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Мероприятие под ключ",
                //                 "color": "orange"
                //             },
                //             {
                //                 "name": "Отдельные технические задачи",
                //                 "color": "orange"
                //             },
                //             //--------- Менеджер --------------------------------
                //             {
                //                 "name": "Менеджер «U.L.E.Y»",
                //                 "color": "purple"
                //             },
                             
                //              //-------- Blacklist ------------------------------
                //             {
                //                 "name": "Blacklist",
                //                 "color": "gray"
                //             },
                            
                //         ]
                //     }
                // },
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
                            },
                            {
                                "name": "№3",
                                "color": "green"
                            },
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
                
                if (data.id) {
                   addWorker(data.id, arrWorks, time) 
                }     
            }    
            
        });

        return data.id
        
    } catch (error) {
        console.error(error.message)
    }
}