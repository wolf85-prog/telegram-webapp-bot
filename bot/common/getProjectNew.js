require("dotenv").config();
const getAllProjects = require("./getAllProjects");
const getBlocks = require('./getBlocks')
const getDatabaseId = require('./getDatabaseId')
let arr = []

//получить id блока заданной страницы по id
module.exports = async function getProjectNew() {
    try {
        const d = new Date()
        const arrProjects = await getAllProjects()
        //console.log("arrProjects: ", arrProjects)

        arrProjects.forEach(async(page)=> {
            const blockId = await getBlocks(page.id);
            if (blockId) { 
                databaseBlock = await getDatabaseId(blockId);  
                //console.log(databaseBlock)
                if (databaseBlock && databaseBlock?.length !== 0) {
                    //let project = databaseBlock.find(item => new Date(item.date) >= d)
                    // return {
                    //     id: page.id,
                    //     name: page.name,
                    //     datestart: project.date,
                    // }
                    arr.push("проект")
                    console.log(arr)
                }

                // databaseBlock.map(item => {
                //     if (new Date(item.date) >= d) {
                //         const obj = {
                //             id: page.id,
                //             name: page.name,
                //             date: item.date,
                //         }
                //         arr.push(obj) 
                //     }
                // })
                
            }
            //console.log("проект")
            
        })

        console.log(arr)
 
        return arr
    } catch (error) {
        console.error(error.message)
    }
}