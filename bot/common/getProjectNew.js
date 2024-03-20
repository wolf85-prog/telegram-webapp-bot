require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID

const getBlocks = require('./getBlocks')
const getDatabaseId = require('./getDatabaseId')

//получить id блока заданной страницы по id
module.exports = async function getProjectNew() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        let databaseBlock;
        let arrayProject = []

        const projects = response.results.map((page) => {
            return {
               id: page.id,
               title: page.properties.Name.title[0]?.plain_text,
               time: page.properties["Дата"].date,
               time_start: page.properties["Дата"].date.start,
               time_created: page.created_time,
               geo: '', //page.properties.Address.rollup.array,
               teh: page.properties["Тех. задание"].rich_text,
               status_id: page.properties["Статус проекта"].select,
               manager: page.properties["Менеджер"].relation[0]?.id,
               company: page.properties["Компания"].relation[0]?.id,
               worklist:'',
               crmID: page.properties.Crm_ID.rich_text[0]?.plain_text,
            };
        });

        console.log(projects)

        if (projects && projects.length > 0){
            projects.map(async(project, index)=> {
                let arraySpec = []
                const blockId = await getBlocks(project.id);             
                if (blockId) {  
                    databaseBlock = await getDatabaseId(blockId); 
                    //если бд ноушена доступна
                    if (databaseBlock && databaseBlock?.length !== 0) {
                        let projDB = databaseBlock.find(db => new Date(db.date) >= new Date())
                        //console.log("projDB: ", projDB)
                        if (projDB) {
                            const obj = {
                                id: project?.id,
                                name: project?.title,
                                datestart: projDB?.date,
                                crmID: project?.crmID,
                            }
                            console.log(obj)
                            arrayProject.push(obj)  
                        }                                     
                    }                   
                } else {
                    console.log("База данных не найдена! Проект ID: " + project.title)
                }       
            })

            setTimeout(()=> {
                return arrayProject;
            }, 10000) 
        }
        else{
            return [];
        }


        //return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}