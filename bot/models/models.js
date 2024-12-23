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
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
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
    companyId: {type: DataTypes.STRING}, // id заказчика
    GUID: {type: DataTypes.STRING}, 
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
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    crmID: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},  //название проекта
    status: {type: DataTypes.STRING},
    specifika: {type: DataTypes.STRING},
    city: {type: DataTypes.STRING},
    dateStart: {type: DataTypes.STRING},  //дата начала проекта
    dateEnd: {type: DataTypes.STRING},  //дата окончания проекта
    teh: {type: DataTypes.TEXT},
    geo: {type: DataTypes.STRING},
    managerId: {type: DataTypes.STRING},
    managerId2: {type: DataTypes.STRING},
    companyId: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING},
    spec: {type: DataTypes.STRING},
    comment: {type: DataTypes.TEXT},
    equipment: {type: DataTypes.STRING},
    number: {type: DataTypes.INTEGER},
    teh1: {type: DataTypes.STRING},
    teh2: {type: DataTypes.STRING},
    teh3: {type: DataTypes.STRING},
    teh4: {type: DataTypes.STRING},
    teh5: {type: DataTypes.STRING},
    teh6: {type: DataTypes.STRING},
    teh7: {type: DataTypes.STRING},
    teh8: {type: DataTypes.STRING},
    deleted: {type: DataTypes.BOOLEAN},
})

const Company = sequelize.define('company', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    title: {type: DataTypes.STRING}, //
    city: {type: DataTypes.STRING},
    office: {type: DataTypes.STRING},
    sklad: {type: DataTypes.STRING},
    comment: {type: DataTypes.TEXT},
    projects: {type: DataTypes.TEXT},
    managers: {type: DataTypes.TEXT},
    dogovorDate: {type: DataTypes.STRING}, 
    dogovorNumber: {type: DataTypes.STRING}, 
    bugalterFio: {type: DataTypes.STRING}, 
    bugalterEmail: {type: DataTypes.STRING},
    bugalterPhone: {type: DataTypes.STRING},  
    GUID: {type: DataTypes.STRING}, 
})

const Platform = sequelize.define('platform', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    title: {type: DataTypes.STRING}, //
    city: {type: DataTypes.STRING}, //
    address: {type: DataTypes.STRING}, //
    track: {type: DataTypes.STRING}, //
    url: {type: DataTypes.STRING}, //
    karta: {type: DataTypes.STRING}, //
})

const MainSpec = sequelize.define('mainspec', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},  
    date: {type: DataTypes.STRING},
    specId: {type: DataTypes.STRING},
    vidWork: {type: DataTypes.STRING},
    specialization: {type: DataTypes.TEXT},  
    comteg: {type: DataTypes.TEXT},
    comment: {type: DataTypes.TEXT},
    stavka: {type: DataTypes.STRING},
    merch: {type: DataTypes.STRING},
    taxi: {type: DataTypes.STRING},
    projectId: {type: DataTypes.STRING},
    hr: {type: DataTypes.BOOLEAN},
    number: {type: DataTypes.INTEGER},
    count: {type: DataTypes.INTEGER},
})


module.exports = {
    User, 
    UserBot, 
    Conversation, 
    Project, 
    Distribution,
    Report,
    Manager,
    Projectcash,
    CountMessage,
    SoundNotif,
    ProjectNew,
    Company,
    Platform,
    MainSpec,
}