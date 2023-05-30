// // повторить с интервалом 1 минуту
//     //             let timerId = setInterval(async() => {
//     //                 i++
                    
//     //                 let databaseBlock = await getDatabaseId(blockId); 
//     //                 //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//     //                 arr_count = [] 
                    
//     //                 arr_cat.map((arritem) => {
//     //                     count_fio = 0;
//     //                     count_title = 0;
//     //                     if (databaseBlock) {
//     //                         databaseBlock.map((value) => {
//     //                             if (arritem === value.title) {
//     //                                 if (value.fio) {
//     //                                     count_fio++               
//     //                                 }else {
//     //                                     count_fio;
//     //                                 }  
//     //                                 count_title++;
//     //                             }
//     //                         })
//     //                         if (count_fio != 0) {
//     //                             const obj = {
//     //                                 title2: arritem,
//     //                                 count_fio: count_fio,
//     //                                 count_title: count_title,
//     //                             }
//     //                             arr_count.push(obj)
//     //                         } else if (count_title !=0) {
//     //                             const obj = {
//     //                                 title2: arritem,
//     //                                 count_fio: count_fio,
//     //                                 count_title: count_title,
//     //                             }
//     //                             arr_count.push(obj) 
//     //                         }
//     //                     }              
//     //                 })

//     //                 //сохранение массива в 2-х элементный массив
//     //                 if (i % 2 == 0) {
//     //                     arr_all[0] = arr_count
//     //                 } else {
//     //                     arr_all[1] = arr_count 
//     //                 }

//     //                 var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
//     //                 // если есть изменения в составе работников    
//     //                 if (!isEqual) {
//     //                     //отправка сообщения в чат бота
//     //                     await bot.sendMessage(chatId, 
//     //                         `Запрос на специалистов: 

//     // ${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                                                                    
//     //                     )
//     //                 } else {
                        
//     //                 }

//     //             }, 60000); //каждую минуту 

//                 // 1. отправка через 30 минут 
//                 // setTimeout(() => {
//                 //     bot.sendMessage(chatId, 
//                 //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
//                 //     )
//                 // }, 1800000)

//                 // setTimeout(() => {
//                 //     bot.sendMessage(chatId, 
//                 //         `${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`                                                    
//                 //     )
//                 // }, 3600000)
                
//                 // 2. отправка через 1 час
//                 // 3. отправка через 4 часа (260 минут) 

//                 // остановить вывод через 260 минут
//                 //setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут

// //--------------------------------------------------------------------------------------------------

//                 // Подключаемся к серверу
//                 let socket = io('https://proj.uley.team:9000');
//                 socket.on("welcome", async message=> {
//                     console.log(message)
//                 });

//                 socket.emit("addUser", chatId)
//                 socket.on("getUsers", users => {
//                     console.log("users from bot: ", users);
//                 })

//                 socket.emit("sendMessage", {
//                     senderId: chatTelegramId,
//                     receiverId: chatId,
//                     text: text,
//                 })

//                 // сохранить отправленное боту сообщение пользователя в БД
//                 let conversation_id
//                 try {
//                     //найти беседу
//                     const conversation = await Conversation.findAll({
//                         where: {
//                             members: {
//                                 [Op.contains]: [chatId]
//                             }
//                         },
//                     })             

//                     //если нет беседы, то создать 
//                     if (conversation.length === 0) {
//                         const conv = await Conversation.create(
//                         {
//                             members: [chatId, chatTelegramId],
//                         })
//                         console.log("conversationId: ", conv.id)
//                         conversation_id = conv.id
//                     } else {
//                         console.log('Беседа уже создана в БД')  
//                         console.log("conversationId: ", conversation[0].id)  
//                         conversation_id = conversation[0].id
//                     }

//                     const messageDB = await Message.create(
//                     {
//                         text: text, 
//                         from: chatId, 
//                         to: chatTelegramId,
//                         messageType: 'text',
//                         conversationId: conversation_id,
//                     })
//                 } catch (error) {
//                     console.log(error);
//                 }

// //---------------------------------------------------------------------
// //Запрос на специалистов: 

// //08.01 | 12:00 | Тест №08012023 | U.L.E.Y

// //01. Звукорежиссер = 0/1 [Sound]
// //02. Художник по свету = 0/1 [Light]
// //03. Инженер Resolume = 1/1 [Video]
// //04. Верхний риггер = 4/4 [Riggers]
// //05. Помощник / Грузчик = 6/8 [Stagehands]
// //${arr_count.map(item =>projectDate +' | ' + projectTime + ' | ' + projectName + ' | ' + 'U.L.E.Y' + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`

// // ${projectDate} | ${projectTime} | ${projectName} | U.L.E.Y

// // ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// // ).join('\n')}` 

// //-----------------------------------------------------------------------------------------------------
// // if (text === '/getmessage') {
// //     //получить сообщения из админской панели
// //     try {
// //         const message_admin = await Message.findAll({where: {to: chatId.toString()}})
// //         console.log(message_admin)
// //     } catch (error) {
// //         console.log(error)
// //     }
// // }

// //-----------------------------------------------------------------------------------------------------
// //          } else if (text.includes('Тестовый добавлен')) {
// //                 await bot.sendMessage(chatGiaId, `${text} \n \n от ${firstname} ${lastname} ${chatId}`)

// //                 //отправить сообщение в админ-панель
// //                 sendMyMessage("Тестовый проект создан", "text", chatId)

// //                 const specArr = Worklist.map(item => (item.spec));

// //                 try {
// //                     //создание проекта в БД
// //                     const res = await Project.create({ 
// //                         name: projectName, 
// //                         datestart: dateStart, 
// //                         spec: specArr,
// //                         equipment: Equipmentlist,
// //                         teh: Teh, 
// //                         geo: Geo, 
// //                         managerId: manager_id, 
// //                         companyId: company_id, 
// //                         chatId: chatId
// //                     })
// //                     console.log('Проект успешно добавлен в БД! Project: ', JSON.stringify(res))  

// //                     const project = await Project.findOne({where:{id: res.id}})

// //                     const d = new Date(project.datestart);
// //                     const year = d.getFullYear();
// //                     const month = String(d.getMonth()+1).padStart(2, "0");
// //                     const day = String(d.getDate()).padStart(2, "0");
// //                     const chas = d.getHours();
// //                     const minut = String(d.getMinutes()).padStart(2, "0");
                                        
// //                     //получить информацию о проекте (8 секунд)
// //                     setTimeout(async () => {
// //                         projectId = '34ae9c1c-3443-47c8-b3c8-ecccf07e5aea'
// //                         console.log("projectId: ", projectId)
// //                         if (projectId !== 'undefined') {
// //                             blockId = await getBlocks(projectId);
// //                             console.log("blockId: ", blockId)
// //                         } else {
// //                             console.log("Проект не добавлен в БД!")
// //                         }
                        
// //                     }, 2000)

// //                     // отправить сообщение пользователю через 30 секунд
// //                     setTimeout(() => {bot.sendMessage(project.chatId, 'Ваша тестовая заявка принята!')}, 4000) // 30 секунд

// //                     let count_fio;
// //                     let count_title;
// //                     let count_title2;
// //                     const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
// //                     const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
// //                     let i = 0;
// //                     let j = 0;
// //                     let arr_count = [] 
// //                     let arr_all = [] 

// //                     // повторить с интервалом 1 минуту
// //                     let timerId = setInterval(async() => {
// //                         i++
// //                         let databaseBlock = await getDatabaseId(blockId); 
// //                         //console.log("databaseBlock: ", JSON.stringify(databaseBlock))
                        
// //                         arr_cat.map((arritem) => {
// //                             count_fio = 0;
// //                             count_title = 0;
// //                             if (databaseBlock) {
// //                                 databaseBlock.map((value) => {
// //                                     if (arritem === value.title) {
// //                                         if (value.fio) {
// //                                             count_fio++               
// //                                         }else {
// //                                             count_fio;
// //                                         }  
// //                                         count_title++;
// //                                     }
// //                                 })
// //                                 if (count_fio != 0) {
// //                                     const obj = {
// //                                         title: specArr[j-1],
// //                                         title2: arritem,
// //                                         count_fio: count_fio,
// //                                         count_title: count_title,
// //                                     }
// //                                     arr_count.push(obj)
// //                                 } else if (count_title !=0) {
// //                                     const obj = {
// //                                         title: specArr[j-1],
// //                                         title2: arritem,
// //                                         count_fio: count_fio,
// //                                         count_title: count_title,
// //                                     }
// //                                     arr_count.push(obj) 
// //                                 }
// //                             }  
// //                             j++
// //                         })

// //                         //сохранение массива в 2-х элементный массив
// //                         if (i % 2 == 0) {
// //                             arr_all[0] = arr_count
// //                         } else {
// //                             arr_all[1] = arr_count 
// //                         }

// //                         var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
// //                         // если есть изменения в составе работников    
// //                         if (!isEqual) {
// //                             //отправка сообщения в чат бота
// //                             await bot.sendMessage(project.chatId, 
// //                                 `Запрос на специалистов: 
                                                                    
// // ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// // ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// //     ).join('\n')}`                     
// //                             )
// //                         } 

// //                     }, 60000); //каждую минуту   

// //                     // остановить вывод через 260 минут
// //                     setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут

// //                 } catch (error) {
// //                     console.log("Ошибка: ", error) 
// //                 }

// //------------------------------------------------------------------------------------
//            // } else if (text.includes('Тестовое сообщение')) {  

//             //     // Подключаемся к серверу socket
//             //     let socket = io('https://proj.uley.team:9000');
//             //     socket.on("welcome", async message=> {
//             //         console.log(message)
//             //     });

//             //     socket.emit("addUser", chatId)
//             //     socket.on("getUsers", users => {
//             //         console.log("users from bot: ", users);
//             //     })

//             //     socket.emit("sendMessage", {
//             //         senderId: chatTelegramId,
//             //         receiverId: chatId,
//             //         text: text,
//             //     })
            
//             //     // сохранить отправленное боту сообщение пользователя в БД
//             //     let conversation_id
//             //     try {
//             //         //найти беседу
//             //         const conversation = await Conversation.findAll({
//             //             where: {
//             //                 members: {
//             //                     [Op.contains]: [chatId]
//             //                 }
//             //             },
//             //         })             

//             //         //если нет беседы, то создать 
//             //         if (conversation.length === 0) {
//             //             const conv = await Conversation.create(
//             //             {
//             //                 members: [chatId, chatTelegramId],
//             //             })
//             //             console.log("conversationId: ", conv.id)
//             //             conversation_id = conv.id
//             //         } else {
//             //             console.log('Беседа уже создана в БД')  
//             //             console.log("conversationId: ", conversation[0].id)  
//             //             conversation_id = conversation[0].id
//             //         }

//             //         const messageDB = await Message.create(
//             //         {
//             //             text: text, 
//             //             from: chatId, 
//             //             to: chatTelegramId,
//             //             messageType: 'text',
//             //             conversationId: conversation_id,
//             //         })
//             //     } catch (error) {
//             //         console.log(error);
//             //     }


// // Получить отчет о специалистах    
// //---------------------------------------------------------------------------------------------------------------- 
// //         if (text == '/getReports') {
// //             let count_fio;
// //             let count_title;
// //             let count_title2;
// //             const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
// //             const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
// //             const workerlist = ['Звукорежессер', 'Рабочий со светом', 'Грузчик', 'Помошник']
// //             let i = 0;
// //             let arr_count = [] 
// //             let arr_all = [] 
// //             let blockId2

// //             const projectId2 = '34ae9c1c-3443-47c8-b3c8-ecccf07e5aea'
// //             if (projectId2 !== 'undefined') {
// //                 blockId2 = await getBlocks(projectId2);
// //                 console.log("----------- get Reports------------ ")
// //                 console.log("blockId: ", blockId2)
// //             } else {
// //                 console.log("Проект не добавлен в БД!")
// //             }

// //             let databaseBlock = await getDatabaseId(blockId2); 
// //                     //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

// //                     arr_count = [] 
// //                     arr_cat.map((arritem) => {
// //                         count_fio = 0;
// //                         count_title = 0;
                        
// //                         if (databaseBlock) {
// //                             databaseBlock.map((value) => {
// //                                 if (arritem === value.title) {
// //                                     if (value.fio) {
// //                                         count_fio++               
// //                                     }else {
// //                                         count_fio;
// //                                     }  
// //                                     count_title++;
// //                                 }
// //                             })
// //                             if (count_fio != 0) {
// //                                 const obj = {
// //                                     title: workerlist[i-1],
// //                                     title2: arritem,
// //                                     count_fio: count_fio,
// //                                     count_title: count_title,
// //                                 }
// //                                 arr_count.push(obj)
// //                             } else if (count_title !=0) {
// //                                 const obj = {
// //                                     title: workerlist[i-1],
// //                                     title2: arritem,
// //                                     count_fio: count_fio,
// //                                     count_title: count_title,
// //                                 }
// //                                 arr_count.push(obj) 
// //                             }
// //                         }  
// //                         i++;            
// //                     })

// //                     console.log("arr_count: ", arr_count)

// //                     //сохранение массива в 2-х элементный массив
// //                     if (i % 2 == 0) {
// //                         arr_all[0] = arr_count
// //                     } else {
// //                         arr_all[1] = arr_count 
// //                     }

// //                     var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
// //                     // если есть изменения в составе работников    
// //                     if (!isEqual) {
// //                         //отправка сообщения в чат бота
// //                         await bot.sendMessage(chatId, 
// //                             `Запрос на специалистов: 

// // 12.00  | 00:00  |  ${projectName}  | U.L.E.Y

// // ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.spec + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'

// // ).join('\n')}`                                                                   
// //                         )
// //                     } else {
                        
// //                     }

// //         }


// //--------------------------------------------------------------------------------
// // if (text == '/setconversation') {
// //     //const users = await UserBot.findAll()
// //     let users = [];

// //     await fetch('https://proj.uley.team:8000/managers')
// //         .then(res => res.json())
// //         .then(json => {
// //             console.log("Name of the first user in the array:");
// //             //console.log("users: ", json)

// //             users = json.map(item => ({
// //                 // Так ссылка не скопируется и оригинальный массив останется чист
// //                 id: item.id,
// //                 fio: item.fio,
// //                 tgID: item.tgID,
// //                 phone: item.phone,
// //               }))

// //     })     

// //     //console.log("user: ", users)

// //     users.map(async (item) => {  

// //         let conversation_id
// //         try {

// //             //1. добавить пользователя в бд
// //             if (item.tgID) {
// //                 const user = await UserBot.findOne({where:{chatId: item.tgID}})
// //                 //console.log("user: ", user)

// //                 if (user === null) {
// //                     await UserBot.create({ firstname: item.fio, lastname: "", chatId: item.tgID })
// //                     console.log('Пользователь добавлен в БД')
// //                 } else {
// //                     console.log('Ошибка работы БД. Пользователь уже существует')
// //                 } 

// //                 //2. найти беседу
// //                 const conversation = await Conversation.findAll({
// //                     where: {
// //                         members: {
// //                             [Op.contains]: [item.tgID]
// //                         }
// //                     },
// //                 })             

// //                 //3. если нет беседы, то создать 
// //                 if (conversation.length === 0) {
// //                     const conv = await Conversation.create(
// //                     {
// //                         members: [item.tgID, chatTelegramId],
// //                     })
// //                     console.log("conversationId: ", conv.id)
// //                     conversation_id = conv.id
// //                 } else {
// //                     console.log('Беседа уже создана в БД')  
// //                     console.log("conversationId: ", conversation[0].id)  
// //                     conversation_id = conversation[0].id
// //                 }
// //             }                  
         
// //         } catch (error) {
// //             console.log(error);
// //         }

// //       });
    
// // }

// //---------------------------------------------------------------
//         // команда Отчеты
// //         if (text === '/getReports') {
// //             let count_fio;
// //             let count_title;
// //             let count_title2;
// //             const arr_cat = ['Sound', 'Light', 'Video', 'Riggers', 'Stagehands', 'StageGround', 'Trucks', 'Production']
// //             const arr_cat2 = ['Sound', 'Light', 'Video', 'Riggers', 'StageGround', 'Trucks', 'Production']
// //             let i = 0;
// //             let arr_count = [] 
// //             let arr_all = [] 
// //             let blockId

// //             try {
// //                 //отправить сообщение в админ-панель
// //                 //sendMyMessage("Проект создан", "text", chatId)
              
// //                 const project = await Project.findOne({where:{id: 28 }})
// //                 const projectId2 = project.projectId; //'630297e3-0b77-4317-9064-a5d45537b177'

// //                 const d = new Date(project.datestart);
// //                 const year = d.getFullYear();
// //                 const month = String(d.getMonth()+1).padStart(2, "0");
// //                 const day = String(d.getDate()).padStart(2, "0");
// //                 const chas = d.getHours();
// //                 const minut = String(d.getMinutes()).padStart(2, "0");

// //                 blockId = await getBlocks(projectId2);
// //                 console.log("blockId: ", blockId)
                    
// //                 // повторить с интервалом 1 минуту
// //                 let timerId = setInterval(async() => {
// //                     let databaseBlock = await getDatabaseId(blockId); 
// //                     //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

// //                     arr_count = [] 

// //                     JSON.parse(project.spec).map((value)=> {
                        
// //                         count_fio = 0;
// //                         count_title = 0;
// //                         if (databaseBlock) {
// //                             databaseBlock.map((db) => {
// //                                 if (value.cat === db.title) {
// //                                     if (db.fio) {
// //                                         count_fio++               
// //                                     }else {
// //                                         count_fio;
// //                                     }  
// //                                     count_title++; 
// //                                 }
// //                             })
// //                         }
                        
// //                         const obj = {
// //                             title: value.spec,
// //                             title2: value.cat,
// //                             count_fio: count_fio,
// //                             count_title: count_title,
// //                         }
// //                         arr_count.push(obj)                                     
// //                     })

// //                     //console.log("arr_count: ", arr_count)

// //                     //сохранение массива в 2-х элементный массив
// //                     if (i % 2 == 0) {
// //                         arr_all[0] = arr_count
// //                     } else {
// //                         arr_all[1] = arr_count 
// //                     }

// //                     var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
// //                      // если есть изменения в составе работников    
// //                     if (!isEqual) {
// //                         //отправка сообщения в чат бота
// //                         await bot.sendMessage(project.chatId, 
// //                             `Запрос на специалистов: 
                                                                    
// // ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// // ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// // ).join('\n')}`                         
// //                             )
// //                         } 
// //                     i++
// //                     }, 60000); //каждую 2 минуты 


// //                     // остановить вывод через 260 минут
// //                     setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут 
                    
// //                 } catch (error) {
// //                     console.log(error)
// //                 }

// //         }


// //-----------------------------------------------------------------------------------------------------
// //-------------------------------------- start report----------------------------------
// // let count_fio;
// // let count_title;
// // let i = 0;
// // let arr_count = [] 
// // let arr_all = [] 


// // // повторить с интервалом 1 минуту
// // let timerId = setInterval(async() => {

// //     const blockId2 = await getBlocks(project2.projectId);
// //     console.log("blockId " + i + ": " + blockId2)

// //     let databaseBlock = await getDatabaseId(blockId2); 
// //     //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

// //     arr_count = [] 
// //     JSON.parse(project.spec).map((value)=> {
    
// //         count_fio = 0;
// //         count_title = 0;
// //         if (databaseBlock) {
// //             databaseBlock.map((db) => {
// //                 if (value.spec === db.title) {
// //                     if (db.fio) {
// //                         count_fio++               
// //                     }else {
// //                         count_fio;
// //                     }  
// //                 }
// //             })
// //         }
        
// //         const obj = {
// //             title: value.spec,
// //             title2: value.cat,
// //             count_fio: count_fio,
// //             count_title: value.count,
// //         }
// //         arr_count.push(obj)                                     
// //     })

// //     //console.log("arr_count: ", arr_count)

// //     //сохранение массива в 2-х элементный массив
// //     if (i % 2 == 0) {
// //         arr_all[0] = arr_count
// //     } else {
// //         arr_all[1] = arr_count 
// //     }

// //     var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
// //      // если есть изменения в составе работников    
// //     if (!isEqual) {
// //         //отправка сообщения в чат бота
// //         await bot.sendMessage(project.chatId, 
// //             `Запрос на специалистов: 
                                                    
// // ${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

// // ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// // ).join('\n')}`                         
// //             )
// //         } 
// //     i++ 

// // }, 60000); //каждую 1 минуту


// // // остановить вывод через 260 минут
// // setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут




// if(text.includes('/startgetreports')) {
//     const project = text.split(' ');
//     console.log(project[1])

//     //const project2 = 'bd040741-c0c3-4091-b5f9-380bf111e9ef'; 
//     const project2 = await Project.findOne({ where:{ projectId: project[1] } })//'630297e3-0b77-4317-9064-a5d45537b177'

//     //начать получать отчеты
//     console.log('START GET TEST REPORTS')

//     const d = new Date(project2.datestart);
//     const year = d.getFullYear();
//     const month = String(d.getMonth()+1).padStart(2, "0");
//     const day = String(d.getDate()).padStart(2, "0");
//     const chas = d.getHours();
//     const minut = String(d.getMinutes()).padStart(2, "0");

//     let count_fio;
//     let i = 0;
//     let arr_count = [] 
//     let arr_all = [] 

//     if (JSON.parse(project2.spec).length > 0) {
//         console.log("Специалисты: ", project2.spec)

//         // повторить с интервалом 1 минуту
//         let timerId = setInterval(async() => {

//             const blockId = await getBlocks(project2.projectId);
//             console.log("blockId " + i + ": " + blockId)

//             //if (blockId !== 'undefined') { 
//                 let databaseBlock = await getDatabaseId(blockId); 
//                 //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//                 arr_count = [] 

//                 JSON.parse(project2.spec).map((value)=> {
                
//                     count_fio = 0;
//                     count_title = 0;
//                     if (databaseBlock) {
//                         databaseBlock.map((db) => {
//                             if (value.spec === db.spec) {
//                                 if (db.fio) {
//                                     count_fio++               
//                                 }else {
//                                     count_fio;
//                                 }  
//                             }
//                         })
//                     }
                    
//                     const obj = {
//                         title: value.spec,
//                         title2: value.cat,
//                         count_fio: count_fio,
//                         count_title: value.count,
//                     }
//                     arr_count.push(obj)                                     
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
//                     await bot.sendMessage(project2.chatId, 
//                     `Запрос на специалистов: 
                        
// ${day}.${month} | ${chas}:${minut} | ${project2.name} | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
// ).join('\n')}`                         
//                     )
//                 } 

//                 i++ 

//             //}                   
//             // else {
//             //     console.log('Блок не найден!')
//             // }

//         }, 60000); //каждую 1 минуту

//         // остановить вывод через 260 минут
//         setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут                        
    
//     } else if (JSON.parse(project2.equipment).length > 0) {
//         console.log("Оборудование: ", project2.equipment)
//         // повторить с интервалом 1 минуту
//         let timerId = setInterval(async() => {

//             const blockId = await getBlocks(project2.projectId);
//             console.log("blockId " + i + ": " + blockId)

//             //if (blockId !== 'undefined') { 
//                 let databaseBlock = await getDatabaseId(blockId); 
//                 //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//                 arr_count = [] 

//                 JSON.parse(project2.equipment).map((value)=> {
                
//                     count_name= 0;
//                     if (databaseBlock) {
//                         databaseBlock.map((db) => {
//                             if (value.cat === db.category) {
//                                 if (db.subname) {
//                                     count_name++               
//                                 }else {
//                                     count_name;
//                                 }  
//                             }
//                         })
//                     }
                    
//                     const obj = {
//                         title: value.subname,
//                         title2: value.cat,
//                         count_name: count_name,
//                         count_title: value.count,
//                     }
//                     arr_count.push(obj)                                     
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
//                     await bot.sendMessage(project2.chatId, 
//                         `Запрос на оборудование: 
                                            
// ${day}.${month} | ${chas}:${minut} | ${project2.name} | U.L.E.Y

// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_name + '\/' + item.count_title + ' [' + item.title2 + ']'
// ).join('\n')}`                         
//                 )
//             } 

//             i++ 

//         //}                   
//         //else {
//         //    console.log('Блок не найден!')
//         //}

       

// }, 60000); //каждую 1 минуту


//     // остановить вывод через 260 минут
//     setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут

//     }


// }





//newDatabase5
// "properties": {                
//     "Name": {
//         "title": {}
//     },
//     "1. Дата": {
//         "date": {}
//     },
//     "2. ФИО": {    
//         "name": "ФИО",               
//         "type": "relation",
//         "relation": {
//             "database_id": databaseWorkersId,
//             "single_property": {}
//         }
//     },
//     "3. Специализация": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Specialization",
//             "relation_property_name": "2. ФИО",
//             "function": "show_original"
//         }
//     },
//     "4. Ранг": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Rank",
//             "relation_property_name": "2. ФИО",
//             "function": "show_original"
//         }
//     },
//     "5. Комментарий": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Комментарии",
//             "relation_property_name": "2. ФИО",
//             "function": "show_original"
//         }
//     },
//     "6. Телефон": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Phone",
//             "relation_property_name": "2. ФИО",
//             "function": "show_original"
//         }
//     },


// "properties": {   
//     "1. Ставка": {
//         "rich_text": {}
//     },             
//     "2. Тех. задание": {
//         "title": {}
//     },
//     "3. Дата": {
//         "date": {}
//     },
//     "4. ФИО": {    
//         "name": "ФИО",               
//         "type": "relation",
//         "relation": {
//             "database_id": databaseWorkersId,
//             "single_property": {}
//         }
//     },
//     "5. Специализация": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Specialization",
//             "relation_property_name": "4. ФИО",
//             "function": "show_original"
//         }
//     },
//     "6. Ранг": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Rank",
//             "relation_property_name": "4. ФИО",
//             "function": "show_original"
//         }
//     },
//     "7. Комментарий": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Комментарии",
//             "relation_property_name": "4. ФИО",
//             "function": "show_original"
//         }
//     },
//     "8. Телефон": {
//         "type": "rollup",
//         "rollup": {
//             "rollup_property_name": "Phone",
//             "relation_property_name": "4. ФИО",
//             "function": "show_original"
//         }
//     },
// }


//-------------------------------------------------
                    //console.log('START GET REPORTS: ' + project2.id + " " + project2.name)                  

                    // const d = new Date(project2.datestart);
                    // const year = d.getFullYear();
                    // const month = String(d.getMonth()+1).padStart(2, "0");
                    // const day = String(d.getDate()).padStart(2, "0");
                    // const chas = d.getHours();
                    // const minut = String(d.getMinutes()).padStart(2, "0");

//                     let count_fio;
//                     let i = 0;
//                     let j = 0;
//                     let arr_all = [] 
//                     let databaseBlock

//                     if (JSON.parse(project2.spec).length > 0) {
//                         // начало цикла Специалисты ----------------------------------------------------------------------
                        
//                         // 86400 секунд в дне
//                         var minutCount = 0;

//                         // СТАРТ повторить с интервалом 1 минуту
//                         let timerId = setInterval(async() => {
//                             minutCount++  // a day has passed
//                             arr_count = [] 

//                             //1)получить блок и бд
//                             if (project2.projectId) {
//                                 const blockId = await getBlocks(project2.projectId);
//                                 //console.log(new Date() + " Проект ID: " + project2.name + " - project2.spec: " + project2.spec) 
//                                 databaseBlock = await getDatabaseId(blockId); 
//                             }

//                             //2) проверить массив специалистов
//                             JSON.parse(project2.spec).map((value)=> {
//                                 //console.log("value: ", value)                                
//                                 count_fio = 0;
//                                 count_title = 0;

//                                 //если бд ноушена доступна
//                                 if (databaseBlock) {
//                                     j = 0
//                                     databaseBlock.map((db) => {
//                                         //console.log("db: ", db)
//                                         if (value.spec === db.spec) {
//                                             if (db.fio) {
//                                                 count_fio++               
//                                             }else {
//                                                 count_fio;
//                                             }  
//                                         }
//                                     })
                                                                                                       
//                                     const obj = {
//                                         title: value.spec,
//                                         title2: value.cat,
//                                         count_fio: count_fio,
//                                         count_title: value.count,
//                                     }
//                                     arr_count.push(obj) 
//                                     //console.log("arr_count "+ i  + JSON.stringify(arr_count))

//                                     //сохранение массива в 2-х элементный массив
//                                     if (i % 2 == 0) {
//                                         arr_all[0] = arr_count
//                                     } else {
//                                         arr_all[1] = arr_count 
//                                     }
//                                 } else {
//                                     console.log("База данных не найдена! Проект ID: " + project2.name)
//                                     j++ //счетчик ошибок доступа к БД ноушена
//                                     console.log("Ошибка № " + j)
//                                     if (j > 10) {
//                                         console.log("Цикл проекта " + project2.name + " завершен!")
//                                         clearTimeout(timerId);
//                                     }
//                                 }                                  
//                             }) // map spec end

//                             var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);

//                             //получить название проекта из ноушена
//                             let project_name;
//                             const res = await fetch(
//                                  `${botApiUrl}/project/${project2.projectId}`
//                             )
//                             .then((response) => response.json())
//                             .then((data) => {
//                                 if (data) {
//                                     project_name = data?.properties.Name.title[0]?.plain_text;
//                                 }  else {
//                                     project_name = project2.name
//                                 }                             
//                             });
                                            
//                             //3) отправить сообщение если есть изменения в составе работников    
//                             if (!isEqual) {
//                                 const text = `Запрос на специалистов: 
                                        
// ${day}.${month} | ${chas}:${minut} | ${project_name} | U.L.E.Y
                                    
// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                                    
//                                 //отправка сообщения в чат бота
//                                 const report = await bot.sendMessage(project2.chatId, text)
//                                 //console.log("respose: ", respose)

//                                 // сохранить отправленное боту сообщение пользователя в БД
//                                 const convId = sendMyMessage(text, 'text', project2.chatId, report.message_id)

//                                 //Подключаемся к серверу socket
//                                 let socket = io(socketUrl);
//                                 socket.emit("addUser", project2.chatId)

//                                 //отправить сообщение в админку
//                                 socket.emit("sendMessage", {
//                                             senderId: project2.chatId,
//                                             receiverId: chatTelegramId,
//                                             text: text,
//                                             type: 'text',
//                                             convId: convId,
//                                             messageId: report.message_id,
//                                 })  

//                             } // end if

//                             i++ // счетчик интервалов
//                         }, 120000); //каждые 2 минуты

//                         // остановить вывод через 30 дней
//                         if (minutCount == 43200) {
//                             clearInterval(timerId);
//                         }                    
                    
//                     } else if (JSON.parse(project2.equipment).length > 0) {
//                         // начало цикла Оборудование ----------------------------------------------------------------------
//                         // повторить с интервалом 1 минуту
//                         let timerId = setInterval(async() => {

//                             const blockId = await getBlocks(project2.projectId);
//                             //console.log("blockId " + i + ": " + blockId)

//                             let databaseBlock = await getDatabaseId(blockId); 
//                             //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

//                             arr_count = [] 

//                             JSON.parse(project2.equipment).map((value)=> {                              
//                                     count_name= 0;
                                    
//                                     if (databaseBlock) {
//                                         databaseBlock.map((db) => {
//                                             if (value.cat === db.category) {
//                                                 if (db.subname) {
//                                                     count_name++               
//                                                 }else {
//                                                     count_name;
//                                                 }  
//                                             }
//                                         })                                   
                                    
//                                         const obj = {
//                                             title: value.subname,
//                                             title2: value.cat,
//                                             count_name: count_name,
//                                             count_title: value.count,
//                                         }
//                                         arr_count.push(obj)  
                                        
//                                         //сохранение массива в 2-х элементный массив
//                                         if (i % 2 == 0) {
//                                             arr_all[0] = arr_count
//                                         } else {
//                                             arr_all[1] = arr_count 
//                                         }
//                                     } else {
//                                         console.log("База данных не найдена! Проект ID: " + project2.name)
//                                     }  

//                             }) // map equipment end
                                
//                             var isEqual = JSON.stringify(arr_all[0]) === JSON.stringify(arr_all[1]);
                                
//                             // если есть изменения в составе работников    
//                             if (!isEqual) {
//                                 const text = `Запрос на специалистов: 
                                        
// ${day}.${month} | ${chas}:${minut} | ${project2.name} | U.L.E.Y
                                    
// ${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']').join('\n')}`
                                    
//                                 //отправка сообщения в чат бота
//                                 const report2 = bot.sendMessage(project2.chatId, text)

//                                 // сохранить отправленное боту сообщение пользователя в БД
//                                 const convId = sendMyMessage(text, 'text', project2.chatId, report2.message_id)

//                                 // Подключаемся к серверу socket
//                                 let socket = io(socketUrl);

//                                 socket.emit("addUser", project2.chatId)

//                                 //отправить сообщение в админку
//                                 socket.emit("sendMessage", {
//                                     senderId: project2.chatId,
//                                     receiverId: chatTelegramId,
//                                     text: text,
//                                     type: 'text',
//                                     convId: convId,
//                                     messageId: report2.message_id,
//                                 })
//                             } // end if

//                             i++ //счетчик интервалов
//                         }, 60000); //каждую 1 минуту

//                         // остановить вывод через 260 минут
//                         //setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут
                        
//                         // остановить вывод через 30 дней
//                         if (minutCount == 43200) {
//                             clearInterval(timerId);
//                         }
//                     }

//------------------------------------------------------------------------------------------
//создание базы данных "График работы"
        // let result1
        // let i = 0;
        // 1)
        // result1 = await newDatabase1(res_id);
        // if (!result1) {   
            // while (i < 10) {
            //     console.log("Ошибка создания таблицы! Попытка №" + i+1 + "Пробуем еще раз...")
            //     console.log("Пробуем еще раз...")
            //     result1 = await newDatabase1(res_id);
            //     i++;
            // }
        //} else {
            //создание базы данных "Основной состав"
            // 2)
            //result2 = await newDatabase2(res_id, worklist);
            // let i = 0;
            // if (!result2) {  
                // while (i < 10) {
                //     console.log("Ошибка создания таблицы! Попытка №" + i+1 + "Пробуем еще раз...")
                //     console.log("Пробуем еще раз...")
                //     result2 = await newDatabase2(res_id);
                //     i++;
                // }
            //} else {
                //создание базы данных "Запасной состав"
                // 3)
                //result3 = await newDatabase3(res_id, worklist);
                // let i = 0;
                // if (!result3) {  
                    // while (i < 10) {
                    //     console.log("Ошибка создания таблицы! Попытка №" + i+1 + "Пробуем еще раз...")
                    //     console.log("Пробуем еще раз...")
                    //     result3 = await newDatabase3(res_id);
                    //     i++;
                    // }
                //} else {
            //}
        //}