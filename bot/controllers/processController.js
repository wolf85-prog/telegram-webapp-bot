require("dotenv").config();
const { Client } = require("@notionhq/client");
const {SoundNotif} = require('../models/models')


const socketUrl = process.env.SOCKET_APP_URL

async function fetchProcess(dataAll) {

    let d = new Date()
    d.setHours(d.getHours() + 3);

	console.log("Получен процесс: ", dataAll, d)
	const { process, data } = dataAll;

	if (process === 1) {
        console.log("Process = 1")      
    }
}

class ProcessController {

    async startProcess() {          
        // Подключаемся к серверу socket
        let socket = io(socketUrl);
        socket.on("getProcess", fetchProcess);
    }
}

module.exports = new ProcessController()