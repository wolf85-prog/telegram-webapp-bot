require("dotenv").config();
const { Client } = require("@notionhq/client");
const {SoundNotif} = require('../models/models')


const socketUrl = process.env.SOCKET_APP_URL

async function fetchProcess(dataAll) {

    let d = new Date()
    d.setHours(d.getHours() + 3);

	console.log("Отправлен процесс: ", dataAll, d)
	const { process, data } = dataAll;

	if (process === 1) {
        console.log("Process = 1")      
    }
}

class ProcessController {

    async startProcess(req, res) {   
        const count = req.params.count; // получаем id     
        const on = req.params.count; // получаем id     
        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.emit("sendProcess", {
            process: count,
            data: [
                {
                    start: on,
                },
            ],
        }) 
    }
}

module.exports = new ProcessController()