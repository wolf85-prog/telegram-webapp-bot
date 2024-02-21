require("dotenv").config();
const { Client } = require("@notionhq/client");
const {SoundNotif} = require('../models/models')

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
}

module.exports = new NotifController()