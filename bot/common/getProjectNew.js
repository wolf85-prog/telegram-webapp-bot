require("dotenv").config();
const getAllProjects = require("./getAllProjects");
const getBlocks = require('./getBlocks')
const getDatabaseId = require('./getDatabaseId')

//получить id блока заданной страницы по id
module.exports = async function getProjectNew() {
    try {
        let arr = []
        const d = new Date()
        const arrProjects = await getAllProjects()

        arrProjects.forEach(async(page)=> {
            const blockId = await getBlocks(page.id);
            if (blockId) { 
                databaseBlock = await getDatabaseId(blockId);  
                if (databaseBlock && databaseBlock?.length !== 0) {
                    let project = databaseBlock.find(item => new Date(item.date) >= d)
                    const obj = {
                        id: page.id,
                        name: page.name,
                        datestart: project.date,
                    }
                    arr.push(obj)
                }
            }
        })

        return arr;  
    } catch (error) {
        console.error(error.message)
    }
}