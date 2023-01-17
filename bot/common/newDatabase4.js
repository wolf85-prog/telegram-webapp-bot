module.exports = async function newDatabase_4(parent_page_id) {
    //создание базы данных "Оборудование"
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
                        "content": "Оборудование"
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
                "Наименование": {
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
                                "name": "Stage Ground",
                                "color": "green"
                            },
                            {
                                "name": "Trucks",
                                "color": "yellow"
                            },
                            {
                                "name": "Production",
                                "color": "orange"
                            }
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