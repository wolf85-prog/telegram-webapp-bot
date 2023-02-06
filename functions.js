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