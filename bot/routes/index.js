const Router = require('express')
const router = new Router()

const secretController = require('../controllers/secretController')
const projectController = require('../controllers/projectController')
const managerController = require('../controllers/managerController')
const databaseController = require('../controllers/databaseController')
const blockController = require('../controllers/blockController')
const blockEquipmentController = require('../controllers/blockEquipmentController')
const addressController = require('../controllers/addressController')
const workerController = require('../controllers/workerController')
const posterController = require('../controllers/posterController')
const smetaController = require('../controllers/smetaController')
const notifController = require('../controllers/notifController')
const processController = require('../controllers/processController')

router.get('/secret', secretController.secretInfo)

// get PROJECTS  
router.get("/projects", projectController.projects);
router.get("/projects2", projectController.projects2);
router.get("/projects3", projectController.projects3);
router.get("/projects/:id", projectController.projectsId);
router.get("/project/:id", projectController.projectId);
router.get("/project/crm/:id", projectController.projectCrmId);
router.get("/projectall", projectController.projectAll);
router.get("/projectscash", projectController.projectsCash)
router.get("/projectnewdate", projectController.projectNewDate);
router.get("/projectsnewcash", projectController.projectsNewCash)
router.get("/projectsallnotion", projectController.projectsAllNotion);

//get MANAGERS
router.get("/managers", managerController.managers);                // все менеджеры с краткой информацией
router.get("/managers2", managerController.managers2);              // все менеджеры с полной информацией
router.get("/managers/:id", managerController.managersId);          // tgID менеджера по его UUID
router.get("/managers/chat/:id", managerController.managersChatId); // UUID менеджера по его tgID
router.get("/manager/:id", managerController.companyId);            // UUID компании по tgID менеджера
router.get("/manager/name/:id", managerController.managerName);     // полная информация о менеджере по его UUID

router.get("/managers/cash/:id", managerController.managerCash);     // получить данные менеджера из БД
router.get("/managersall/cash", managerController.managerCashAll);     // получить всех менеджеров из БД

//post MANAGER
router.post("/manager", managerController.create);

//get COMPANYS
router.get("/companys", managerController.companys);
router.get("/company/:id", managerController.company);
router.get("/company/name/:id", managerController.companyName);


//get DATABASE (специалисты)
router.get('/database/:id', databaseController.databaseId); //получить список работников
router.get('/database2/:id', databaseController.databaseId2);
router.get('/database/', databaseController.database);
router.get("/database1", databaseController.database1);
//get DATABASE (оборудование)
router.get('/database/equipment/:id', databaseController.databaseEquipmentId); //получить список оборудования


//get BLOCK (специалисты)
router.get('/blocks/:id', blockController.blocksId); //получить id таблицы/блока "Основной состав" ("4a74b62a-2f46-4fae-9e4b-9c700cb1b2f1")
router.get('/blocksp/:id', blockController.blocksPId); //получить id таблицы/блока "Претенденты"
router.get('/blocks2/:id', blockController.blocksId2); //подробная инфа
router.get('/block/:id', blockController.blockId); // получить данные доп. таблиц

router.get('/blocks/children/:id', blockController.blocksChildrenId); // получить данные дочерних блоков
router.patch("/blocks/children/:id", blockController.appendBlock); // добавить дочерний блок

//get BLOCK (оборудование)
router.get('/blocks/equipment/:id', blockEquipmentController.blocksId); //получить id таблицы/блока "Основной состав" ("4a74b62a-2f46-4fae-9e4b-9c700cb1b2f1")
router.get('/blocks2/equipment/:id', blockEquipmentController.blocksId2); //подробная инфа
router.get('/block/equipment/:id', blockEquipmentController.blockId); // получить данные доп. таблиц

//get PAGE
router.get('/page/:id', blockController.pageId);

//get ADDRESS
router.get("/address", addressController.address);


//get WORKERS
router.get("/workers", workerController.workers);

//-----------------POSTER---------------------------------
router.post('/poster/send', posterController.sendPoster)
router.post('/poster/final/send', posterController.sendPosterFinal)

//-----------------СМЕТЫ ВСЕХ ПРОЕКТОВ МИРА-------------------------
//get SMETS
router.get('/smeta', smetaController.smeta)
router.get('/smeta/:id', smetaController.smetaId)

//-----------------ЗВУКОВЫЕ УВЕДОМЛЕНИЯ-----------------------------
router.get('/soundnotifAll', notifController.soundnotifAll)
router.get('/startsoundnotif', notifController.startSoundNotif)


//-----------------УПРАВЛЕНИЕ ПРОЦЕССАМИ---------------------------------
router.get('/process/update/:count/:on', processController.startProcess)

module.exports = router