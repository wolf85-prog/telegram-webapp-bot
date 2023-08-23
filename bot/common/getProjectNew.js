require("dotenv").config();
//notion api
// const { Client } = require("@notionhq/client");
// const notion = new Client({ auth: process.env.NOTION_API_KEY });
// const databaseId = process.env.NOTION_DATABASE_ID

const getBlocks = require('./getBlocks')
const getDatabaseId = require('./getDatabaseId')

//получить id блока заданной страницы по id
module.exports = async function getProjectNew() {
    try {
        // const response = await notion.databases.query({
        //     database_id: databaseId
        // });

        // const d2 = new Date()

        // const responseResults = response.results.filter((page) => new Date(page.properties["Дата"].date.start) > d2).map((page) => {
        //         return {
        //             id: page.id,
        //             name: page.properties.Name.title[0]?.plain_text,
        //             datestart: page.properties["Дата"].date.start,
        //             crmID: page.properties.Crm_ID.rich_text[0]?.plain_text               
        //         };
        // });

        let arr = []
        const d = new Date()
        const arrProjects = await getAllProjects()

        console.log("Запускаю фильтрацию проектов...")

        arrProjects.forEach(async(page)=> {
            const blockId = await getBlocks(page.id);
            if (blockId) { 
                databaseBlock = await getDatabaseId(blockId);  
                if (databaseBlock && databaseBlock?.length !== 0) {
                    //console.log(databaseBlock)
                    let project = databaseBlock.find(item => new Date(item.date) >= d)
                    const obj = {
                        id: page.id,
                        name: page.name,
                        date: project.date,
                    }
                    arr.push(obj)
                }
            }
        })

        setTimeout(()=>{
            console.log("arr: ", arr)
            return arr; 
        }, 5000) 
    } catch (error) {
        console.error(error.message)
    }
}