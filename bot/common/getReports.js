require("dotenv").config();
const sequelize = require('./../connections/db')
const {Project} = require('./../models/models')

module.exports = async function getReports(project_id) {
    console.log('start get reports')
    const project = await Project.findOne({where:{projectId: project_id}})
    console.log("project.projectId: ", project.projectId)

    const d = new Date(project.datestart);
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const chas = d.getHours();
    const minut = String(d.getMinutes()).padStart(2, "0");

    let count_fio;
    let i = 0;
    let arr_count = [] 
    let arr_all = [] 

    
    // повторить с интервалом 1 минуту
    let timerId = setInterval(async() => {

        const blockId = await getBlocks(project.projectId);
        console.log("blockId " + i + ": " + blockId)

        let databaseBlock = await getDatabaseId(blockId); 
        //console.log("databaseBlock: ", JSON.stringify(databaseBlock))

        arr_count = [] 
        JSON.parse(project.spec).map((value)=> {
        
            count_fio = 0;
            count_title = 0;
            if (databaseBlock) {
                databaseBlock.map((db) => {
                    console.log("value.spec: ", value.spec)
                    console.log("db.spec: ", db.spec)
                    if (value.spec === db.spec) {
                        if (db.fio) {
                            count_fio++               
                        }else {
                            count_fio;
                        }  
                    }
                })
            }
            
            const obj = {
                title: value.spec,
                title2: value.cat,
                count_fio: count_fio,
                count_title: value.count,
            }
            arr_count.push(obj)                                     
        })

        console.log("arr_count: ", arr_count)

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
            await bot.sendMessage(project.chatId, 
                `Запрос на специалистов: 
                                                        
${day}.${month} | ${chas}:${minut} | ${project.name} | U.L.E.Y

${arr_count.map((item, index) =>'0' + (index+1) + '. '+ item.title + ' = ' + item.count_fio + '\/' + item.count_title + ' [' + item.title2 + ']'
).join('\n')}`                         
                )
            } 
        i++ 

    }, 60000); //каждую 1 минуту


    // остановить вывод через 260 минут
    setTimeout(() => { clearInterval(timerId); }, 15600000); //260 минут
}