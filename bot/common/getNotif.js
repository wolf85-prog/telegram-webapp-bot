require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const {SoundNotif} = require('../models/models')

//получить id блока заданной страницы по id
module.exports = async function getNotif() {
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