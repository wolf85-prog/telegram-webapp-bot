require("dotenv").config();

//fetch api
const fetch = require('node-fetch');

//планировщик
var cron = require('node-cron');

//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID
const databaseManagerId = process.env.NOTION_DATABASE_MANAGER_ID
const databaseAddressId = process.env.NOTION_DATABASE_ADDRESS_ID
const databaseCompanyId = process.env.NOTION_DATABASE_COMPANY_ID
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID
const chatGroupId = process.env.CHAT_GROUP_ID
const chatTelegramId = process.env.CHAT_ID
const chatGiaId = process.env.GIA_CHAT_ID

var projectId, projectName, projectDate, projectTime, dateStart, manager_id, company_id, Geo, Teh, Worklist
var blockId

//telegram api
const token_fetch = 'Bearer ' + process.env.NOTION_API_KEY;
const webAppUrl = process.env.WEB_APP_URL;

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const https = require('https');

const sequelize = require('./bot/connections/db')
const models = require('./bot/models/models')

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_API_TOKEN, {polling: true});

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('telegram-webapp-bot'));

// Certificate
const privateKey = fs.readFileSync('privkey.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8'); //fs.readFileSync('/etc/letsencrypt/live/proj.uley.team/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);

const menuOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
            [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
        ]
    })
}

const backOptions = {
    reply_markup: JSON.stringify({
        inline_keyboard:[
            [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
            [{text: 'Назад', callback_data:'/menu'}],
        ]
    })
}


bot.on('message', async (msg) => {
    const text = msg.text;
    const chat_id = msg.chat.id;
    if ((text || '')[0] !== '/') {       
        if (text.includes("Ответ")) {           
            await bot.sendMessage(text.substring(6, text.indexOf('.')), text.slice(text.indexOf('.') + 2))       
        
        } else if (text.includes('Проект успешно создан')) {           
            //await bot.sendMessage(chat_id, 'Ваша заявка отправлена администратору!')
            await bot.sendMessage(chatTelegramId, `${text} \n \n от ${msg.from.first_name} ${msg.from.last_name} ${chat_id}`)
            await bot.sendMessage(chatGiaId, `${text} \n \n от ${msg.from.first_name} ${msg.from.last_name} ${chat_id}`)

            //добавление геопозиции в БД Площадки (Адрес) и добавление проекта
            if (Geo != '') {
                projectId = await addAddress(Geo, projectName, dateStart, Teh, manager_id, company_id, Worklist);
            } else {
                //добавление проекта с названием проекта в базу
                projectId = await addProjectNotGeo(projectName, dateStart, Teh, manager_id, company_id, Worklist);
            }

            //8 секунд
            setTimeout(async () => {
                console.log("projectId: ", projectId)

                blockId = await getBlocks(projectId);
                console.log("blockId: ", blockId)

            }, 8000)


            // 30 секунд
            setTimeout(() => {bot.sendMessage(chat_id, 'Ваша заявка принята!')}, 30000) // 30 секунд


            let count_fio;
            let count_title;
            const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
            let i = 0;
            let arr_count = [] 
            let arr_all = [] 

            
            // повторить с интервалом 1 минуту
            let timerId = setInterval(async() => {
                i++
                
                let databaseBlock = await getDatabaseId(blockId); 
                //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

                arr_count = [] 
                
                arr_cat.map((arritem) => {
                    count_fio = 0;
                    count_title = 0;
                    if (databaseBlock) {
                        databaseBlock.map((value) => {
                            if (arritem === value.title) {
                                if (value.fio) {
                                    count_fio++               
                                }else {
                                    count_fio;
                                }  
                                count_title++;
                            }
                        })
                        if (count_fio != 0) {
                            const obj = {
                                title2: arritem,
                                count_fio: count_fio,
                                count_title: count_title,
                            }
                            arr_count.push(obj)
                        } else if (count_title !=0) {
                            const obj = {
                                title2: arritem,
                                count_fio: count_fio,
                                count_title: count_title,
                            }
                            arr_count.push(obj) 
                        }
                    }              
                })

                //сохранение массива в 2-х элементный массив
                if (i % 2 == 0) {
                    arr_all[0] = arr_count
                } else {
                    arr_all[1] = arr_count 
                }

                var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
                // если есть изменения в составе работников    
                if (!isEqual) {
                    //отправка сообщения в чат бота
                    await bot.sendMessage(chat_id, 
                        `Запрос на специалистов: 

${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                                                                
                    )
                };

            }, 60000); //каждую минуту 

            // 1. отправка через 30 минут 
            // cron.schedule('30 * * * *', function(){
            //     bot.sendMessage(chat_id, 
            //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
            //     )           
            // });

            setTimeout(() => {
                bot.sendMessage(chat_id, 
                    `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
                )
            }, 1800000)

            //task.stop();
             
            // 2. отправка через 1 час
            // const task1 = cron.schedule('* * 1 * * *', function(){
            //     bot.sendMessage(chat_id, 
            //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
            //     )           
            // });

            // task1.start();

            // 3. отправка через 4 часа (260 минут) 
            // var task3 = cron.schedule('* 1 * * *', function(){
            //     bot.sendMessage(chat_id, 
            //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`,
            //             {
            //                 reply_markup: ({
            //                     inline_keyboard:[
            //                         [{text: 'Остановить поиск', callback_data:'Остановить поиск'}],
            //                     ]
            //                 })
            //            }                                                    
            //     )           
            // });

            //task3.start();


            // остановить вывод через 260 минут
            setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут
        
        } else if (text.includes('Запрос на специалистов')) {
               
        } else if (text.includes('Тестовый')) {
            await bot.sendMessage(chat_id, 'Ваша заявка отправлена администратору!')
            //bot.sendMessage(chatTelegramId, `${text} \n \n от ${msg.from.first_name} ${msg.from.last_name} ${chat_id}`)
        
        } else {
            await bot.sendMessage(chat_id, `Ваше сообщение "${text}" отправлено администратору!`)
            await bot.sendMessage(chatTelegramId, `${text} \n \n от ${msg.from.first_name} ${msg.from.last_name} ${chat_id}`)           
        }
    }
})

//Добавление проекта в Notion (addProject send data to notion)
async function addProject(title, time, teh, managerId, companyId, worklist, geoId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            icon: {
                type: "emoji",
                emoji: "🟦"
            },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                Date: {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                TechZadanie: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: teh,
                            },
                        }
                        ],
                },
                Status: {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                City: {
                    type: 'select',
                    select: {
                        "id": "4e370773-fb5d-4ef7-bd2a-eaa91e5919e0",
                        "name": "Test",
                        "color": "brown"
                    }
                },
                Manager: {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                Company: {
                    type: "relation",
                    relation: [
                        {
                            "id": companyId
                        }
                    ]
                },
                "Площадка": {
                    "type": "relation",
                    "relation": [
                        {
                            "id": geoId
                        }
                    ],
                    "has_more": false
                }
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log(new Date())
        console.log("1 Success! Project with geo added. " + res_id)

        //setTimeout(()=> {
            newDatabase_1(res_id);
        //}, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000)

        return res_id;

    } catch (error) {
        console.error(error.body)
    }
}


//Добавление проекта в Notion без адреса (addProjectNotGeo)
async function addProjectNotGeo(title, time, teh, managerId, companyId, worklist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            icon: {
                type: "emoji",
                emoji: "🟦"
            },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                Date: {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                TechZadanie: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: teh,
                            },
                        }
                        ],
                },
                Status: {
                    type: 'select',
                    select: {
                        "id": "4f52b59e-2d7f-4a13-976f-f9773274825d",
                        "name": "New",
                        "color": "blue"
                    }
                },
                City: {
                    type: 'select',
                    select: {
                        "id": "4e370773-fb5d-4ef7-bd2a-eaa91e5919e0",
                        "name": "Test",
                        "color": "brown"
                    }
                },
                Manager: {
                    type: "relation",
                    relation: [
                        {
                            "id": managerId
                        }
                    ]
                },
                Company: {
                    type: "relation",
                    relation: [
                        {
                            "id": companyId
                        }
                    ]
                },
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log(new Date())
        console.log("Success! Project not geo added. " + res_id)        

        //setTimeout(()=> {
        newDatabase_1(res_id);
        //}, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000) 

        return res_id;

    } catch (error) {
        console.error(error.body)
    }
}

//------------------------------- Тест -----------------------------------------------------
//Добавление проекта в Notion (addProject send data to notion)
async function addProjectTest(title, time, teh, worklist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            icon: {
                type: "emoji",
                emoji: "🟦"
            },
            properties: {
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                Date: {
                    type: 'date',
                    date: {
                        "start": time,
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }
                },
                TechZadanie: {
                    type: 'rich_text',
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: teh,
                            },
                        }
                        ],
                },
                Status: {
                    type: 'select',
                    select: {
                        "id": "08338ef4-9a4a-4f52-8e86-cc3f4115a9f2",
                        "name": "Test",
                        "color": "default"
                    }
                },
                City: {
                    type: 'select',
                    select: {
                        "id": "4e370773-fb5d-4ef7-bd2a-eaa91e5919e0",
                        "name": "Test",
                        "color": "brown"
                    }
                }                
            }
        })
        //console.log(response)
        const res_id = response.id;
        console.log("1 Success! Project test added. " + res_id)

        setTimeout(()=> {
            newDatabase_1(res_id);
        }, 2000) 

        setTimeout(()=> {
            newDatabase(res_id, worklist);
        }, 4000) 

        setTimeout(()=> {
            newDatabase_3(res_id);
        }, 9000)

        return res_id;

    } catch (error) {
        console.error(error.body)
    }
}

//-----------------------------------------------------------------------------------

//создание базы данных "График работы"
async function newDatabase_1(parent_page_id) {
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
        console.log("2.1 Success! Grafik project added. Database_id: " + data.id) // + " data: " + JSON.stringify(data))

        //добавить даты (День2, День3, День4)
        addDate(data.id, 'День №4');
        setTimeout(()=> {
            addDate(data.id, 'День №3');
        }, 2000)  
        setTimeout(()=> {
            addDate(data.id, 'День №2');
        }, 4000) 
        
    } catch (error) {
        console.error(error.body)
    }
}


//send create db notion
async function newDatabase(parent_page_id, worklist) {
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
                                "name": "Light",
                                "color": "yellow"
                            },
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Stagehands",
                                "color": "blue"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Tracks",
                                "color": "yellow"
                            },
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
                }
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
        worklist.forEach((worker, index) => {
            if (worker.count > 1) {
                for (let i = 0; i < worker.count; i++) {
                    addWorker(data.id, worker.icon)
                }
            } else {
                addWorker(data.id, worker.icon)
            }          
        });
        
    } catch (error) {
        console.error(error.body)
    }
}


// создание БД "Запасной состав"
async function newDatabase_3(parent_page_id) {
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
                        "content": "Запасной состав"
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
                                "name": "Light",
                                "color": "yellow"
                            },
                            {
                                "name": "Video",
                                "color": "green"
                            },
                            {
                                "name": "Riggers",
                                "color": "orange"
                            },
                            {
                                "name": "Stagehands",
                                "color": "blue"
                            },
                            {
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Tracks",
                                "color": "yellow"
                            },
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
                }
            }
        }

        // создание базы данных "Запасной состав"
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
        console.log("2.3 Success! Secondcast added. Database_id: " + data.id)// + " data: " + JSON.stringify(data))
        
        addWorkerZapas(data.id);
        addWorkerZapas(data.id);

    } catch (error) {
        console.error(error.body)
    }
}

//send data to notion
async function addDate(blockId, day) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                Name: {
                    type: "title",
                    title: [
                        {
                            "type": "text",
                            "text": {
                                "content": day,
                                "link": null
                            },
                            "annotations": {
                                "bold": false,
                                "italic": false,
                                "strikethrough": false,
                                "underline": false,
                                "code": false,
                                "color": "default"
                            },
                            "plain_text": day,
                            "href": null
                        }
                    ]
                },
                Date : {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                }
            }
        })
        //console.log(response)
        console.log("3.1 Success! Date added. Data: "  + response.id)//+ JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}


//send data to notion
async function addWorker(blockId, worker) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                // "1. Дата": {
                //     type: 'title',
                //     title: [
                //     {
                //         type: 'text',
                //         text: {
                //             content: "30/10/2022 0:00",
                //         },
                //     },
                //     ]
                // },
                "1. Дата": {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                },
                "3. Специализация": {
                    type: "multi_select",
                    multi_select: [
                        {
                            "name": worker
                        }
                    ]
                }
                // Комментарий : {
                //     type: 'rich_text',
                //     rich_text: [
                //     {
                //         type: 'text',
                //         text: {
                //             content: worker,
                //         },
                //     }
                //     ]
                // }
            }
        })
        //console.log(response)
        console.log("3 Success! Worker added. Data: " + response.id) //+ JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}

//Добавление строк в таблицу "Запасной состав"
async function addWorkerZapas(blockId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: blockId },
            properties: {
                // "1. Дата": {
                //     type: 'title',
                //     title: [
                //     {
                //         type: 'text',
                //         text: {
                //             content: "30/10/2022 0:00",
                //         },
                //     },
                //     ]
                // },
                "1. Дата": {
                    type: 'date',                   
                    date: {
                        "start": "2023-01-01T00:00:00.000",
                        "end": null,
                        "time_zone": "Europe/Moscow"
                    }

                }
            }
        })
        //console.log(response)
        console.log("3.3 Success! Worker zapas added. Data: " + response.id) //JSON.stringify(response))
    } catch (error) {
        console.error(error.body)
    }
}


//send data to notion
async function addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseAddressId },
            properties: {
                "Название": {
                    type: "title",
                    title: [
                        {
                            type: "text",
                            text: {
                                content: geo,
                                "link": null
                            },
                            plain_text: geo,
                            "href": null
                        }
                    ]
                },
                "Адрес": {
                    type: "rich_text",
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: geo,
                                "link": null
                            },
                            plain_text: geo,
                            "href": null
                        }
                    ]
                },
            },
        })
        //console.log(response)
        console.log("Success! Entry address added. " + response.id)

        //добавление проекта с названием проекта в базу
        const project_id = addProject(projectname, datestart, teh, managerId, companyId, worklist, response.id);

        return project_id

    } catch (error) {
        console.error(error.body)
    }
}

//--------------------------------------------------------------------------------------------------------
//              GET REQUEST
//--------------------------------------------------------------------------------------------------------

//get items from DB
async function getDatabase() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить id менеджера по его TelegramID
async function getManagerId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            "filter": {
                "property": "TelegramID",
                "rich_text": {
                    "contains": id
                }
            }
        });

        console.log("-------------------------------------------------------")
        console.log("----------------Открытие приложения--------------------")
        console.log("-------------------------------------------------------")
        console.log("TelegramID: ", id)
        console.log("ManagerId: ", response.results[0].id)

        return response.results[0].id;
    } catch (error) {
        console.error(error.body)
    }
}

//получить id компании заказчика
async function getCompanyId(id) {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId, 
            "filter": {
                "property": "TelegramID",
                "rich_text": {
                    "contains": id
                }
            }
        });
        console.log("CompanyId: ", response.results[0].properties.Заказчики.relation[0].id)
        return response.results[0].properties.Заказчики.relation[0].id;
    } catch (error) {
        console.error(error.body)
    }
}

//получить все проекты
async function getProjects() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: page.properties.Date.date,
               time_start: page.properties.Date.date.start,
               time_created: page.created_time,
               geo: '',//page.properties.Address.rollup.array,
               teh: page.properties.TechZadanie.rich_text,
               status_id: page.properties.Status.select,
               manager: page.properties.Manager.relation[0]?.id,
               company: page.properties.Company.relation[0]?.id,
               worklist:'',
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

async function getProjects2() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить все проекты менеджера по id
async function getProjectsId(managerId) {
    //console.log("managerId: ", managerId)
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            "filter": {
                "property": "Manager",
                "relation": {
                    "contains": managerId
                },
            },
            "sorts": [{ 
                "timestamp": "created_time", 
                "direction": "descending" 
            }]
        });

        //return response.results[0].id;

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: page.properties.Date.date,
               time_start: page.properties.Date.date.start,
               time_created: page.created_time,
               geo: '',//page.properties.Address.rollup.array,
               teh: page.properties.TechZadanie.rich_text,
               status_id: page.properties.Status.select,
               manager: page.properties.Manager.relation[0]?.id,
               company: page.properties.Company.relation[0]?.id,
               worklist:'',
            };
        });

        //console.log("Projects Data: "  + JSON.stringify(responseResults))
        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные блока по заданному ID
async function getDatabaseId(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        const responseResults = response.results.map((page) => {
            return {
               //id: page.id,
               fio: page.properties["2. 👷 ФИО"].relation[0]?.id,
               title: page.properties["3. Специализация"].multi_select[0]?.name              
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.body)
    }
}

async function getDatabaseId2(baseId) {
    try {
        const response = await notion.databases.query({
            database_id: baseId
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить пустые данные блока
async function getDatabase2() {
    return {};
}

//получить id блока заданной страницы по id
async function getBlocks(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        let count = 0;

        const responseResults = response.results.map((block) => {
            //if (block.child_database.title == "Основной состав" || block.child_database.title == "Назначенные")
            if (block.child_database) {
                count++;
            }
        });

        let res;
        (count >1) ? res = response.results[1].id : res = response.results[0].id     
        
        console.log("Blocks Data: "  + res)

        return res;
    } catch (error) {
        console.error(error.body)
    }
}

//получить все блоки заданной страницы по id
async function getBlocks2(blockId) {
    try {
        const response = await notion.blocks.children.list({
            block_id: blockId,
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные блока по заданному ID
async function getBlockId(blockId) {
    try {
        const response = await notion.blocks.retrieve({
            block_id: blockId,
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные страницы по заданному ID
async function getPage(pageId) {
    try {
        const response = await notion.pages.retrieve({
            page_id: pageId,
        });

        return response;
    } catch (error) {
        console.error(error.body)
    }
}

//получить данные таблицы Площадки
async function getAddress() {
    try {
        const response = await notion.databases.query({
            database_id: databaseAddressId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        //console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}

async function getManagers() {
    try {
        const response = await notion.databases.query({
            database_id: databaseManagerId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}

async function getCompanys() {
    try {
        const response = await notion.databases.query({
            database_id: databaseCompanyId
        });

        const responseResults = response.results.map((page) => {
            return {
               id: page.id,
               title: '',

            };
        });

        console.log(responseResults);
        return response;
    } catch (error) {
        console.error(error.body)
    }
}


app.get('/secret',(req, res) => {
    const secret =  Math.floor(Math.random()*100)
    res.json({secret})
});

app.get('/blocks/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const blocks = await getBlocks(id);
    if(blocks){
        res.json(blocks);
    }
    else{
        res.json({});
    }
  });

app.get('/blocks2/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const blocks = await getBlocks2(id);
    if(blocks){
        res.json(blocks);
    }
    else{
        res.json({});
    }
  });

app.get('/block/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const blocks = await getBlockId(id);
    res.json(blocks);
  });

//get PAGE
app.get('/page/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const page = await getPage(id);
    res.json(page);
  });

//get DATABASE by ID
app.get('/database/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const base = await getDatabaseId(id);

    if(base){
        res.json(base);
    }
    else{
        res.json({});
    }
  });

app.get('/database2/:id', async (req, res) => {
    const id = req.params.id; // получаем id
    const base = await getDatabaseId2(id);

    if(base){
        res.json(base);
    }
    else{
        res.json({});
    }
  });

app.get('/database/', async (req, res) => {
    const base = await getDatabase2();
    res.json(base);
  });

app.get("/database1", async (req, res) => {
    const projects = await getDatabase();
    res.json(projects);
  });


// get PROJECTS  
app.get("/projects", async (req, res) => {
    const projects = await getProjects();
    res.json(projects);
  });

app.get("/projects2", async (req, res) => {
    const projects = await getProjects2();
    res.json(projects);
  });

app.get("/projects/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    const projects = await getProjectsId(id);
    if(projects){
        res.json(projects);
    }
    else{
        res.json([]);
    }
  });

//get MANAGERS
app.get("/managers", async (req, res) => {
    const managers = await getManagers();
    res.json(managers);
  });

app.get("/managers/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    const manager = await getManagerId(id);
    if(manager){
        res.json(manager);
    }
    else{
        res.json({});
    }
  });

app.get("/manager/:id", async (req, res) => {
    const id = req.params.id; // получаем id
    const manager = await getCompanyId(id);
    if(manager){
        res.json(manager);
    }
    else{
        res.json({});
    }
  });

//get COMPANYS
app.get("/companys", async (req, res) => {
    const companys = await getCompanys();
    res.json(companys);
  });

//get ADDRESS
app.get("/address", async (req, res) => {
    const address = await getAddress();
    res.json(address);
  });

//-------------------------------------------------------------------------------------------------------
require('./bot/middleawre/command/help.command')

bot.setMyCommands([
    {command: '/start', description: 'Начальное приветствие'},
    {command: '/menu', description: 'Главное меню'},
    {command: '/info', description: 'Получить информацию о боте'},
    {command: '/settings', description: 'Настройки'},
    {command: '/getmyblockdb', description: 'Получить уведомление о назначениях специалистов'},
])

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const messageId = msg.message_id;
  
    if (text === '/start') {
      await bot.sendMessage(chatId, 'Добро пожаловать в телеграм-бот U.L.E.Y_Projects. Смотрите и создавайте проекты U.L.E.Y в ' +
          'web-приложении прямо из мессенджера Telegram.', {
          reply_markup: ({
              inline_keyboard:[
                  [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                  [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
              ]
          })
      })
    }
  
    if (text === '/menu') {
        await bot.sendMessage(chatId, 'Смотрите и создавайте проекты U.L.E.Y в web-приложении прямо из мессенджера Telegram.', {
            reply_markup: ({
                inline_keyboard:[
                    [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                    [{text: 'Открыть проекты U.L.E.Y', web_app: {url: webAppUrl}}],
                ]
            })
        })
    }
  
  
    if (text === '/info') {
      await bot.sendMessage(chatId, 'Чат-бот предназначен для создания проектов в U.L.E.Y и общения заказчика с администратором проектов.');
    }
  
    if (text === '/settings') {
  
    }

    if (text === '/getmyblockdb') {


    }

    if (text === '/cron') {
        let i = 0;
        //setTimeout(()=>{bot.sendMessage(chatId, 'timeout text')}, 50000)
        //const task = cron.schedule('*/1 * * * *', () => {
            i++ 
            // if (i > 1) {
            //     bot.deleteMessage(chatId, messageId) 
            // }

            bot.sendMessage(chatId, 'текст сообщения: ' + msg.message_id)
                      
        //});
        //task.start()
    }
    
  });
  
  //Ответ на нажатие кнопок настройки и информаци
  bot.on('callback_query', msg => {
      const data = msg.data;
      const chatId = msg.message.chat.id;
  
      if (data === '/menu') {
          return bot.sendMessage(chatId, 'Смотрите и создавайте Notion-проекты в web-приложении прямо из мессенджера Telegram.', {
              reply_markup: ({
                  inline_keyboard:[
                      [{text: 'Информация', callback_data:'Информация'}, {text: 'Настройки', callback_data:'Настройки'}],
                      [{text: 'Открыть Notion-проекты', web_app: {url: webAppUrl}}],
                  ]
              })
          })
      }
      bot.sendMessage(chatId, `Вы нажали кнопку ${data}`, backOptions)
  });


//создание страницы (проекта) базыданных проектов
app.post('/web-data', async (req, res) => {
  const {queryId, projectname, datestart, geo, teh, managerId, companyId, worklist = []} = req.body;
  const d = new Date(datestart);
  //console.log(d);
  const year = d.getFullYear();
  const month = String(d.getMonth()+1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const chas = d.getHours();
  const minut = String(d.getMinutes()).padStart(2, "0");
  try {
      await bot.answerWebAppQuery(queryId, {
          type: 'article',
          id: queryId,
          title: 'Проект успешно создан',
          input_message_content: {
              parse_mode: 'HTML',
              message_text: 
`Проект успешно создан!

<b>Проект:</b> ${projectname} 
<b>Дата:</b> ${day}.${month}.${year}
<b>Время:</b> ${chas}:${minut} 
<b>Адрес:</b> ${geo} 
<b>Тех. задание:</b> ${teh}

<b>Специалисты:</b>  
${worklist.map(item =>' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
            }
      })

        await bot.sendMessage(chatGroupId, 
`Проект успешно создан! 

Название проекта:  ${projectname} 
Дата: ${day}.${month}.${year}
Время: ${chas}:${minut} 
Адрес: ${geo} 
Тех. задание: ${teh} 

Специалисты: 
${worklist.map(item => ' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
        )

        //добавление геопозиции в БД Площадки (Адрес) и добавление проекта
        // if (geo != '') {
        //     await addAddress(geo, projectname, datestart, teh, managerId, companyId, worklist);
        // } else {
        //     //добавление проекта с названием проекта в базу
        //     await addProjectNotGeo(projectname, datestart, teh, managerId, companyId, worklist);
        // }

        projectName = projectname
        projectDate = `${day}.${month}`
        projectTime = `${chas}:${minut}`
        dateStart = datestart
        Teh = teh
        Worklist = worklist
        manager_id = managerId
        company_id = companyId
        Geo = geo
      

      return res.status(200).json({});
  } catch (e) {
      return res.status(500).json({})
  }
})

//создание тестовой страницы (проекта) базыданных проектов
app.post('/web-test-data', async (req, res) => {
    const {queryId, projectname, datestart, geo, teh, managerId, companyId, worklist = []} = req.body;
    const d = new Date(datestart);
    //console.log(d);
    const year = d.getFullYear();
    const month = d.getMonth()+1;
    const day = String(d.getDate()).padStart(2, "0");
    const chas = d.getHours();
    const minut = String(d.getMinutes()).padStart(2, "0");
    try {

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Тестовый проект успешно создан',
            input_message_content: {
                parse_mode: 'HTML',
                message_text: 
  `Тестовый проект успешно создан!
  
  <b>Проект:</b> ${projectname} 
  <b>Дата:</b> ${day}.${month}.${year}
  <b>Время:</b> ${chas}:${minut} 
  <b>Адрес:</b> ${geo} 
  <b>Тех. задание:</b> ${teh} 

  <b>Специалисты:</b>  
  ${worklist.map(item =>' - ' + item.spec + ' = ' + item.count + ' чел.').join('\n')}`
              }
        })

        projectName = projectname
        projectDate = `${day}.${month}`
        projectTime = `${chas}:${minut}`
        dateStart = datestart
        Teh = teh
        Worklist = worklist
        manager_id = managerId
        company_id = companyId
  
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = process.env.PORT || 8000;

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        
        httpsServer.listen(PORT, () => {
            console.log('HTTPS Server running on port' + PORT);
        });

    } catch (error) {
        console.log(error)
    }
}

start()