require("dotenv").config();
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID
const {Projectcash} = require('../models/models')

async function getProjects() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        const responseResults = response.results.map((page) => {
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
            };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}

async function getProjects2() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

async function getProjects3() {
    try {
        const response = await notion.databases.query({
            database_id: databaseId
        });

        const d2 = new Date()

        const responseResults = response.results.filter((page) => page.properties["Статус проекта"].select?.name !== 'Deleted' && new Date(page.properties["Дата"].date.start) > d2).map((page) => {
                return {
                    id: page.id,
                    name: page.properties.Name.title[0]?.plain_text,
                    datestart: page.properties["Дата"].date.start,
                    crmID: page.properties.Crm_ID.rich_text[0]?.plain_text               
                };
        });

        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}

//получить все проекты менеджера по id
async function getProjectsId(managerId) {
    //console.log("managerId: ", managerId)
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            "filter": {
                "and": [
                    {
                        "property": "Менеджер",
                        "relation": {
                            "contains": managerId
                        },
                    },
                    {
                        // "property": "Date",
                        // "date": {
                        //     "after": "2023-05-31"
                        // }
                        "timestamp": "created_time",
                        "created_time": {
                            "after": "2023-05-31"
                        }
                    }
                ]
                
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
               time: page.properties["Дата"].date,
               time_start: page.properties["Дата"].date.start,
               time_created: page.created_time,
               geo: '', //page.properties.Address.rollup.array,
               teh: page.properties["Тех. задание"].rich_text,
               status_id: page.properties["Статус проекта"].select,
               manager: page.properties["Менеджер"].relation[0]?.id,
               company: page.properties["Компания"].relation[0]?.id,
               worklist:'',
            };
        });

        //console.log("Projects Data: "  + JSON.stringify(responseResults))
        return responseResults;
    } catch (error) {
        console.error(error.message)
    }
}


//получить проект по его id
async function getProjectId(projectId) {
    try {
        const response = await notion.pages.retrieve({
            page_id: projectId,           
        });

        //title: response.properties.Name.title[0]?.plain_text,  

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить проект по его CrmId
async function getProjectCrmId(crmId) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "Crm_ID",
                rich_text: {
                    "contains": crmId
                }
            },         
        });  

        return response;
    } catch (error) {
        console.error(error.message)
    }
}

//получить проекты из БД (кэш)
async function getProjectsCash() {
    try {
        const projects = await Projectcash.findAll({
            order: [
                ['id', 'DESC'],
            ],
        })
        return projects;
    } catch (error) {
        console.error(error.message);
    }
}


class ProjectController {
    
    async projects(req, res) {
        const projects = await getProjects();
        res.json(projects);
    }

    async projects2(req, res) {
        const projects = await getProjects2();
        res.json(projects);
    }

    async projects3(req, res) {
        const projects = await getProjects3();
        res.json(projects);
    }

    async projectsId(req, res) {
        const id = req.params.id; // получаем id
        const projects = await getProjectsId(id);
        if(projects){
            res.json(projects);
        }
        else{
            res.json([]);
        }
    }

    async projectId(req, res) {
        const id = req.params.id; // получаем id
        const project = await getProjectId(id);
        if(project){
            res.json(project);
        }
        else{
            res.json({});
        }
    }

    async projectCrmId(req, res) {
        const id = req.params.id; // получаем id
        const project = await getProjectCrmId(id);
        if(project){
            res.json(project);
        }
        else{
            res.json({});
        }
    }

    async projectAll(req, res) {
        let databaseBlock;
        let arrayProject = []
    
        const projects = await getProjects();
        if (projects && projects.length > 0){
            projects.map(async(project, index)=> {
                let arraySpec = []
                const blockId = await getBlocks(project.id);
                
                if (blockId) {  
                    databaseBlock = await getDatabaseId(blockId); 
                    //если бд ноушена доступна
                    if (databaseBlock) {
                        databaseBlock.map((db) => {
                            if (db.fio_id) {
                                const newSpec = {
                                    rowId: db?.id,
                                    id: db?.fio,
                                    vid: db?.vid,
                                    spec: db?.spec,
                                    date: db?.date,
                                }
                                arraySpec.push(newSpec)
                            }
                        })
    
                        const newProject = {
                            id: project.id,
                            title: project.title,
                            date_start: project.date_start,
                            date_end: project.date_end,
                            status: project.status,
                            managerId: project.manager,
                            specs: arraySpec,
                        }
                        arrayProject.push(newProject)                           
                    }                   
                } else {
                    console.log("База данных не найдена! Проект ID: " + project.title)
                }
                
            })

            setTimeout(()=> {
                res.json(arrayProject);
            }, 10000) 
        }
        else{
            res.json([]);
        }
    }

    async projectsCash(req, res) {
        const projects = await getProjectsCash();
        if(projects){
            res.json(projects);
        }
        else{
            res.json({});
        }
    }
    
}

module.exports = new ProjectController()