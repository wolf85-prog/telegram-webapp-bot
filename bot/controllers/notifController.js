require("dotenv").config();
const { Client } = require("@notionhq/client");
const {SoundNotif} = require('../models/models')

const getAllProjects = require("./../common/getAllProjects");
const getBlocks = require('./../common/getBlocks')
const getDatabaseId = require('./../common/getDatabaseId')

//получить данные таблицы Площадки
async function getSoundnotifAll() {
    try {
        const notifs = await SoundNotif.findAll({
            where: {
                delivered: false,
            },
            order: [
                ['id', 'DESC'],
            ],
        })
        return notifs;

    } catch (error) {
        console.error(error.message)
    }
}


class NotifController {

    async soundnotifAll(req, res) {
        const notif = await getSoundnotifAll();
        if(notif){
            res.json(notif);
        }
        else{
            res.json({});
        }
    }


    async startSoundNotif() {
            //очистить таблицу уведомлений
            // await SoundNotif.destroy({
            //     where: {
            //         delivered: false
            //     },
            // });
            //console.log('Таблица звуковых уведомлений очищена...');
            
            // 1. получить новые проекты
            let arr = []
            const d = new Date().getTime() + 10800000
            //notion
            const arrProjects = await getAllProjects()

            console.log("Новые проекты: ", arrProjects)

            console.log("Запускаю фильтрацию проектов...")

            if (arrProjects && arrProjects.length > 0) {
                arrProjects.forEach(async(page)=> {
                    const blockId = await getBlocks(page.id);
                    if (blockId) { 
                        const databaseBlock = await getDatabaseId(blockId);  
                        
                        if (databaseBlock && databaseBlock?.length !== 0) {
                            //console.log("main table: ", databaseBlock)
                            let project = databaseBlock.find(item => new Date(item?.date) >= d)
                            const obj = {
                                id: page.id,
                                name: page.name,
                                date: project?.date,
                            }
                            arr.push(obj)
                        }
                    }
                }) 
            }

    }
}

module.exports = new NotifController()