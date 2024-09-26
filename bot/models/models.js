const sequelize = require('../connections/db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    username: {type: DataTypes.STRING, allowNull: true},
    email: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
})

const UserBot = sequelize.define('userbot', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    firstname: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    username: {type: DataTypes.STRING},
    avatar: {type: DataTypes.STRING},
})

const Message = sequelize.define('message', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    conversationId: {type: DataTypes.STRING},
    senderId: {type: DataTypes.STRING},
    receiverId: {type: DataTypes.STRING},    
    text: {type: DataTypes.TEXT}, //текст сообщения;
    type: {type: DataTypes.STRING},      //тип сообщения;
    is_bot: {type: DataTypes.BOOLEAN},
    messageId: {type: DataTypes.STRING},
    buttons: {type: DataTypes.STRING},   //названия кнопок;
    replyId: {type: DataTypes.STRING}, //id пересылаемого сообщения
})

const Conversation = sequelize.define('conversation', {
    members: {type: DataTypes.ARRAY(DataTypes.STRING)},
})

const Project = sequelize.define('project', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING},  //название проекта
    datestart: {type: DataTypes.STRING},  //дата начала проекта
    spec: {type: DataTypes.STRING},
    equipment: {type: DataTypes.STRING},
    teh: {type: DataTypes.STRING},
    geo: {type: DataTypes.STRING},
    managerId: {type: DataTypes.STRING},
    companyId: {type: DataTypes.STRING},
    projectId: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING},
})

const Distribution = sequelize.define('distribution', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING},  //название рассылки
    text: {type: DataTypes.STRING}, //текст сообщения;
    image: {type: DataTypes.STRING}, //ссылка на картинку;
    button: {type: DataTypes.STRING}, //текст кнопки;
    receivers: {type: DataTypes.STRING}, //массив получателей;
    datestart: {type: DataTypes.STRING},  //дата начала рассылки
    delivered: {type: DataTypes.BOOLEAN}, //доставлено
})

const Report = sequelize.define('report', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING},  //название проекта
    text: {type: DataTypes.STRING}, //текст сообщения;
    receiverId: {type: DataTypes.STRING}, //чат-id получателя;
    date: {type: DataTypes.STRING},  //дата отправки отчета
    delivered: {type: DataTypes.BOOLEAN}, //доставлено
})

const Manager = sequelize.define('manager', {
    id: {type: DataTypes.STRING, primaryKey: true}, // id менеджера
    companyId: {type: DataTypes.STRING}, // id заказчика
    chatId: {type: DataTypes.STRING, unique: true}, // telegram id
    fio: {type: DataTypes.STRING}, //фио менеджера
    phone: {type: DataTypes.STRING}, //телефон менеджера
    phone2: {type: DataTypes.STRING}, //телефон менеджера
    city: {type: DataTypes.STRING},
    dolgnost: {type: DataTypes.STRING},
    sfera: {type: DataTypes.TEXT}, 
    projects: {type: DataTypes.STRING}, 
    email: {type: DataTypes.STRING}, //почта менеджера
    inn: {type: DataTypes.STRING}, //инн менеджера
    comteg: {type: DataTypes.TEXT},
    comment: {type: DataTypes.TEXT}, 
    profile: {type: DataTypes.TEXT},
    dogovor: {type: DataTypes.BOOLEAN}, 
    block: {type: DataTypes.BOOLEAN},
    deleted: {type: DataTypes.BOOLEAN},
    great: {type: DataTypes.BOOLEAN}, //hello
})

const CountMessage = sequelize.define('countmessage', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    managers: {type: DataTypes.INTEGER},
    projects: {type: DataTypes.INTEGER},
    workers: {type: DataTypes.INTEGER},
    pretendents: {type: DataTypes.INTEGER},
})

const Projectcash = sequelize.define('projectcash', {
    id: {type: DataTypes.STRING, primaryKey: true}, // id проекта
    title: {type: DataTypes.STRING},  //название проекта
    dateStart: {type: DataTypes.STRING}, //начало
    dateEnd: {type: DataTypes.STRING}, //конец
    tgURLchat: {type: DataTypes.STRING}, //ссылка на чат
    manager: {type: DataTypes.STRING}, //id менеджера
    status: {type: DataTypes.TEXT}, //стытус проекта
    specs: {type: DataTypes.TEXT}, // специалисты
})


const SoundNotif = sequelize.define('soundnotifs', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING},  //название проекта
    text: {type: DataTypes.STRING}, //текст сообщения;
    date: {type: DataTypes.STRING},  //дата отправки напоминания
    delivered: {type: DataTypes.BOOLEAN}, //доставлено
    task: {type: DataTypes.INTEGER}, //номер задачи
})

const ProjectNew = sequelize.define('projectnew', {
    id: {type: DataTypes.STRING, primaryKey: true}, // id проекта
    name: {type: DataTypes.STRING},  //название проекта
    datestart: {type: DataTypes.STRING}, //начало
    crmID: {type: DataTypes.STRING},
})


module.exports = {
    User, 
    UserBot, 
    Message, 
    Conversation, 
    Project, 
    Distribution,
    Report,
    Manager,
    Projectcash,
    CountMessage,
    SoundNotif,
    ProjectNew
}