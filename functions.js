// повторить с интервалом 1 минуту
    //             let timerId = setInterval(async() => {
    //                 i++
                    
    //                 let databaseBlock = await getDatabaseId(blockId); 
    //                 //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

    //                 arr_count = [] 
                    
    //                 arr_cat.map((arritem) => {
    //                     count_fio = 0;
    //                     count_title = 0;
    //                     if (databaseBlock) {
    //                         databaseBlock.map((value) => {
    //                             if (arritem === value.title) {
    //                                 if (value.fio) {
    //                                     count_fio++               
    //                                 }else {
    //                                     count_fio;
    //                                 }  
    //                                 count_title++;
    //                             }
    //                         })
    //                         if (count_fio != 0) {
    //                             const obj = {
    //                                 title2: arritem,
    //                                 count_fio: count_fio,
    //                                 count_title: count_title,
    //                             }
    //                             arr_count.push(obj)
    //                         } else if (count_title !=0) {
    //                             const obj = {
    //                                 title2: arritem,
    //                                 count_fio: count_fio,
    //                                 count_title: count_title,
    //                             }
    //                             arr_count.push(obj) 
    //                         }
    //                     }              
    //                 })

    //                 //сохранение массива в 2-х элементный массив
    //                 if (i % 2 == 0) {
    //                     arr_all[0] = arr_count
    //                 } else {
    //                     arr_all[1] = arr_count 
    //                 }

    //                 var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
    //                 // если есть изменения в составе работников    
    //                 if (!isEqual) {
    //                     //отправка сообщения в чат бота
    //                     await bot.sendMessage(chatId, 
    //                         `Запрос на специалистов: 

    // ${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                                                                    
    //                     )
    //                 } else {
                        
    //                 }

    //             }, 60000); //каждую минуту 

                // 1. отправка через 30 минут 
                // setTimeout(() => {
                //     bot.sendMessage(chatId, 
                //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
                //     )
                // }, 1800000)

                // setTimeout(() => {
                //     bot.sendMessage(chatId, 
                //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
                //     )
                // }, 3600000)
                
                // 2. отправка через 1 час
                // 3. отправка через 4 часа (260 минут) 

                // остановить вывод через 260 минут
                //setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут

//--------------------------------------------------------------------------------------------------

                // Подключаемся к серверу
                let socket = io('https://proj.uley.team:9000');
                socket.on("welcome", async message=> {
                    console.log(message)
                });

                socket.emit("addUser", chatId)
                socket.on("getUsers", users => {
                    console.log("users from bot: ", users);
                })

                socket.emit("sendMessage", {
                    senderId: chatTelegramId,
                    receiverId: chatId,
                    text: text,
                })

                // сохранить отправленное боту сообщение пользователя в БД
                let conversation_id
                try {
                    //найти беседу
                    const conversation = await Conversation.findAll({
                        where: {
                            members: {
                                [Op.contains]: [chatId]
                            }
                        },
                    })             

                    //если нет беседы, то создать 
                    if (conversation.length === 0) {
                        const conv = await Conversation.create(
                        {
                            members: [chatId, chatTelegramId],
                        })
                        console.log("conversationId: ", conv.id)
                        conversation_id = conv.id
                    } else {
                        console.log('Беседа уже создана в БД')  
                        console.log("conversationId: ", conversation[0].id)  
                        conversation_id = conversation[0].id
                    }

                    const messageDB = await Message.create(
                    {
                        text: text, 
                        from: chatId, 
                        to: chatTelegramId,
                        messageType: 'text',
                        conversationId: conversation_id,
                    })
                } catch (error) {
                    console.log(error);
                }

//---------------------------------------------------------------------
//Запрос на специалистов: 

//08.01 | 12:00 | Тест №08012023 | U.L.E.Y

//01. Звукорежиссер = 0/1 [Sound]
//02. Художник по свету = 0/1 [Light]
//03. Инженер Resolume = 1/1 [Video]
//04. Верхний риггер = 4/4 [Riggers]
//05. Помощник / Грузчик = 6/8 [Stagehands]
//${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`

// ${projectDate} | ${projectTime} | ${projectName} | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// ).join('\n')}` 

//-----------------------------------------------------------------------------------------------------
// if (text === '/getmessage') {
//     //получить сообщения из админской панели
//     try {
//         const message_admin = await Message.findAll({where: {to: chatId.toString()}})
//         console.log(message_admin)
//     } catch (error) {
//         console.log(error)
//     }
// }

//-----------------------------------------------------------------------------------------------------
//          } else if (text.includes('Тестовый добавлен')) {
//                 await bot.sendMessage(chatGiaId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

//                 //отправить сообщение в админ-панель
//                 sendMyMessage("Тестовый проект создан", "text", chatId)

//                 const specArr = Worklist.map(item => (item.spec));

//                 try {
//                     //создание проекта в БД
//                     const res = await Project.create({ 
//                         name: projectName, 
//                         datestart: dateStart, 
//                         spec: specArr,
//                         equipment: Equipmentlist,
//                         teh: Teh, 
//                         geo: Geo, 
//                         managerId: manager_id, 
//                         companyId: company_id, 
//                         chatId: chatId
//                     })
//                     console.log('Проект успешно добавлен в БД! Project: ', JSON.stringify(res))  

//                     const project = await Project.findOne({where:{id: res.id}})

//                     const d = new Date(project.datestart);
//                     const year = d.getFullYear();
//                     const month = String(d.getMonth()+1).padStart(2, "0");
//                     const day = String(d.getDate()).padStart(2, "0");
//                     const chas = d.getHours();
//                     const minut = String(d.getMinutes()).padStart(2, "0");
                                        
//                     //получить информацию о проекте (8 секунд)
//                     setTimeout(async () => {
//                         projectId = '34ae9c1c-3443-47c8-b3c8-ecccf07e5aea'
//                         console.log("projectId: ", projectId)
//                         if (projectId !== 'undefined') {
//                             blockId = await getBlocks(projectId);
//                             console.log("blockId: ", blockId)
//                         } else {
//                             console.log("Проект не добавлен в БД!")
//                         }
                        
//                     }, 2000)

//                     // отправить сообщение пользователю через 30 секунд
//                     setTimeout(() => {bot.sendMessage(project.chatId, 'Ваша тестовая заявка принята!')}, 4000) // 30 секунд

//                     let count_fio;
//                     let count_title;
//                     let count_title2;
//                     const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
//                     const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
//                     let i = 0;
//                     let j = 0;
//                     let arr_count = [] 
//                     let arr_all = [] 

//                     // повторить с интервалом 1 минуту
//                     let timerId = setInterval(async() => {
//                         i++
//                         let databaseBlock = await getDatabaseId(blockId); 
//                         //console.log("databaseBlock: ", JSON.stringify(databaseBlock))
                        
//                         arr_cat.map((arritem) => {
//                             count_fio = 0;
//                             count_title = 0;
//                             if (databaseBlock) {
//                                 databaseBlock.map((value) => {
//                                     if (arritem === value.title) {
//                                         if (value.fio) {
//                                             count_fio++               
//                                         }else {
//                                             count_fio;
//                                         }  
//                                         count_title++;
//                                     }
//                                 })
//                                 if (count_fio != 0) {
//                                     const obj = {
//                                         title: specArr[j-1],
//                                         title2: arritem,
//                                         count_fio: count_fio,
//                                         count_title: count_title,
//                                     }
//                                     arr_count.push(obj)
//                                 } else if (count_title !=0) {
//                                     const obj = {
//                                         title: specArr[j-1],
//                                         title2: arritem,
//                                         count_fio: count_fio,
//                                         count_title: count_title,
//                                     }
//                                     arr_count.push(obj) 
//                                 }
//                             }  
//                             j++
//                         })

//                         //сохранение массива в 2-х элементный массив
//                         if (i % 2 == 0) {
//                             arr_all[0] = arr_count
//                         } else {
//                             arr_all[1] = arr_count 
//                         }

//                         var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
//                         // если есть изменения в составе работников    
//                         if (!isEqual) {
//                             //отправка сообщения в чат бота
//                             await bot.sendMessage(project.chatId, 
//                                 `Запрос на специалистов: 
                                                                    
// ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
//     ).join('\n')}`                     
//                             )
//                         } 

//                     }, 60000); //каждую минуту   

//                     // остановить вывод через 260 минут
//                     setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут

//                 } catch (error) {
//                     console.log("Ошибка: ", error) 
//                 }

//------------------------------------------------------------------------------------
           // } else if (text.includes('Тестовое сообщение')) {  

            //     // Подключаемся к серверу socket
            //     let socket = io('https://proj.uley.team:9000');
            //     socket.on("welcome", async message=> {
            //         console.log(message)
            //     });

            //     socket.emit("addUser", chatId)
            //     socket.on("getUsers", users => {
            //         console.log("users from bot: ", users);
            //     })

            //     socket.emit("sendMessage", {
            //         senderId: chatTelegramId,
            //         receiverId: chatId,
            //         text: text,
            //     })
            
            //     // сохранить отправленное боту сообщение пользователя в БД
            //     let conversation_id
            //     try {
            //         //найти беседу
            //         const conversation = await Conversation.findAll({
            //             where: {
            //                 members: {
            //                     [Op.contains]: [chatId]
            //                 }
            //             },
            //         })             

            //         //если нет беседы, то создать 
            //         if (conversation.length === 0) {
            //             const conv = await Conversation.create(
            //             {
            //                 members: [chatId, chatTelegramId],
            //             })
            //             console.log("conversationId: ", conv.id)
            //             conversation_id = conv.id
            //         } else {
            //             console.log('Беседа уже создана в БД')  
            //             console.log("conversationId: ", conversation[0].id)  
            //             conversation_id = conversation[0].id
            //         }

            //         const messageDB = await Message.create(
            //         {
            //             text: text, 
            //             from: chatId, 
            //             to: chatTelegramId,
            //             messageType: 'text',
            //             conversationId: conversation_id,
            //         })
            //     } catch (error) {
            //         console.log(error);
            //     }


// Получить отчет о специалистах    
//---------------------------------------------------------------------------------------------------------------- 
//         if (text == '/getReports') {
//             let count_fio;
//             let count_title;
//             let count_title2;
//             const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
//             const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
//             const workerlist = ['Звукорежессер', 'Рабочий со светом', 'Грузчик', 'Помошник']
//             let i = 0;
//             let arr_count = [] 
//             let arr_all = [] 
//             let blockId2

//             const projectId2 = '34ae9c1c-3443-47c8-b3c8-ecccf07e5aea'
//             if (projectId2 !== 'undefined') {
//                 blockId2 = await getBlocks(projectId2);
//                 console.log("----------- get Reports------------ ")
//                 console.log("blockId: ", blockId2)
//             } else {
//                 console.log("Проект не добавлен в БД!")
//             }

//             let databaseBlock = await getDatabaseId(blockId2); 
//                     //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//                     arr_count = [] 
//                     arr_cat.map((arritem) => {
//                         count_fio = 0;
//                         count_title = 0;
                        
//                         if (databaseBlock) {
//                             databaseBlock.map((value) => {
//                                 if (arritem === value.title) {
//                                     if (value.fio) {
//                                         count_fio++               
//                                     }else {
//                                         count_fio;
//                                     }  
//                                     count_title++;
//                                 }
//                             })
//                             if (count_fio != 0) {
//                                 const obj = {
//                                     title: workerlist[i-1],
//                                     title2: arritem,
//                                     count_fio: count_fio,
//                                     count_title: count_title,
//                                 }
//                                 arr_count.push(obj)
//                             } else if (count_title !=0) {
//                                 const obj = {
//                                     title: workerlist[i-1],
//                                     title2: arritem,
//                                     count_fio: count_fio,
//                                     count_title: count_title,
//                                 }
//                                 arr_count.push(obj) 
//                             }
//                         }  
//                         i++;            
//                     })

//                     console.log("arr_count: ", arr_count)

//                     //сохранение массива в 2-х элементный массив
//                     if (i % 2 == 0) {
//                         arr_all[0] = arr_count
//                     } else {
//                         arr_all[1] = arr_count 
//                     }

//                     var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
//                     // если есть изменения в составе работников    
//                     if (!isEqual) {
//                         //отправка сообщения в чат бота
//                         await bot.sendMessage(chatId, 
//                             `Запрос на специалистов: 

// 12.00  | 00:00  |  ${projectName}  | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.spec + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'

// ).join('\n')}`                                                                   
//                         )
//                     } else {
                        
//                     }

//         }


//--------------------------------------------------------------------------------
// if (text == '/setconversation') {
//     //const users = await UserBot.findAll()
//     let users = [];

//     await fetch('https://proj.uley.team:8000/managers')
//         .then(res => res.json())
//         .then(json => {
//             console.log("Name of the first user in the array:");
//             //console.log("users: ", json)

//             users = json.map(item => ({
//                 // Так ссылка не скопируется и оригинальный массив останется чист
//                 id: item.id,
//                 fio: item.fio,
//                 tgID: item.tgID,
//                 phone: item.phone,
//               }))

//     })     

//     //console.log("user: ", users)

//     users.map(async (item) => {  

//         let conversation_id
//         try {

//             //1. добавить пользователя в бд
//             if (item.tgID) {
//                 const user = await UserBot.findOne({where:{chatId: item.tgID}})
//                 //console.log("user: ", user)

//                 if (user === null) {
//                     await UserBot.create({ firstname: item.fio, lastname: "", chatId: item.tgID })
//                     console.log('Пользователь добавлен в БД')
//                 } else {
//                     console.log('Ошибка работы БД. Пользователь уже существует')
//                 } 

//                 //2. найти беседу
//                 const conversation = await Conversation.findAll({
//                     where: {
//                         members: {
//                             [Op.contains]: [item.tgID]
//                         }
//                     },
//                 })             

//                 //3. если нет беседы, то создать 
//                 if (conversation.length === 0) {
//                     const conv = await Conversation.create(
//                     {
//                         members: [item.tgID, chatTelegramId],
//                     })
//                     console.log("conversationId: ", conv.id)
//                     conversation_id = conv.id
//                 } else {
//                     console.log('Беседа уже создана в БД')  
//                     console.log("conversationId: ", conversation[0].id)  
//                     conversation_id = conversation[0].id
//                 }
//             }                  
         
//         } catch (error) {
//             console.log(error);
//         }

//       });
    
// }

//---------------------------------------------------------------
        // команда Отчеты
//         if (text === '/getReports') {
//             let count_fio;
//             let count_title;
//             let count_title2;
//             const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
//             const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
//             let i = 0;
//             let arr_count = [] 
//             let arr_all = [] 
//             let blockId

//             try {
//                 //отправить сообщение в админ-панель
//                 //sendMyMessage("Проект создан", "text", chatId)
              
//                 const project = await Project.findOne({where:{id: 28 }})
//                 const projectId2 = project.projectId; //'630297e3-0b77-4317-9064-a5d45537b177'

//                 const d = new Date(project.datestart);
//                 const year = d.getFullYear();
//                 const month = String(d.getMonth()+1).padStart(2, "0");
//                 const day = String(d.getDate()).padStart(2, "0");
//                 const chas = d.getHours();
//                 const minut = String(d.getMinutes()).padStart(2, "0");

//                 blockId = await getBlocks(projectId2);
//                 console.log("blockId: ", blockId)
                    
//                 // повторить с интервалом 1 минуту
//                 let timerId = setInterval(async() => {
//                     let databaseBlock = await getDatabaseId(blockId); 
//                     //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//                     arr_count = [] 

//                     JSON.parse(project.spec).map((value)=> {
                        
//                         count_fio = 0;
//                         count_title = 0;
//                         if (databaseBlock) {
//                             databaseBlock.map((db) => {
//                                 if (value.cat === db.title) {
//                                     if (db.fio) {
//                                         count_fio++               
//                                     }else {
//                                         count_fio;
//                                     }  
//                                     count_title++; 
//                                 }
//                             })
//                         }
                        
//                         const obj = {
//                             title: value.spec,
//                             title2: value.cat,
//                             count_fio: count_fio,
//                             count_title: count_title,
//                         }
//                         arr_count.push(obj)                                     
//                     })

//                     //console.log("arr_count: ", arr_count)

//                     //сохранение массива в 2-х элементный массив
//                     if (i % 2 == 0) {
//                         arr_all[0] = arr_count
//                     } else {
//                         arr_all[1] = arr_count 
//                     }

//                     var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
//                      // если есть изменения в составе работников    
//                     if (!isEqual) {
//                         //отправка сообщения в чат бота
//                         await bot.sendMessage(project.chatId, 
//                             `Запрос на специалистов: 
                                                                    
// ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// ).join('\n')}`                         
//                             )
//                         } 
//                     i++
//                     }, 60000); //каждую 2 минуты 


//                     // остановить вывод через 260 минут
//                     setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут 
                    
//                 } catch (error) {
//                     console.log(error)
//                 }

//         }


//-----------------------------------------------------------------------------------------------------
//-------------------------------------- start report----------------------------------
// let count_fio;
// let count_title;
// let i = 0;
// let arr_count = [] 
// let arr_all = [] 


// // повторить с интервалом 1 минуту
// let timerId = setInterval(async() => {

//     const blockId2 = await getBlocks(project2.projectId);
//     console.log("blockId " + i + ": " + blockId2)

//     let databaseBlock = await getDatabaseId(blockId2); 
//     //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//     arr_count = [] 
//     JSON.parse(project.spec).map((value)=> {
    
//         count_fio = 0;
//         count_title = 0;
//         if (databaseBlock) {
//             databaseBlock.map((db) => {
//                 if (value.spec === db.title) {
//                     if (db.fio) {
//                         count_fio++               
//                     }else {
//                         count_fio;
//                     }  
//                 }
//             })
//         }
        
//         const obj = {
//             title: value.spec,
//             title2: value.cat,
//             count_fio: count_fio,
//             count_title: value.count,
//         }
//         arr_count.push(obj)                                     
//     })

//     //console.log("arr_count: ", arr_count)

//     //сохранение массива в 2-х элементный массив
//     if (i % 2 == 0) {
//         arr_all[0] = arr_count
//     } else {
//         arr_all[1] = arr_count 
//     }

//     var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
//      // если есть изменения в составе работников    
//     if (!isEqual) {
//         //отправка сообщения в чат бота
//         await bot.sendMessage(project.chatId, 
//             `Запрос на специалистов: 
                                                    
// ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// ).join('\n')}`                         
//             )
//         } 
//     i++ 

// }, 60000); //каждую 1 минуту


// // остановить вывод через 260 минут
// setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут