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

router.get('/secret', secretController.secretInfo)

// get PROJECTS  
router.get("/projects", projectController.projects);
router.get("/projects2", projectController.projects2);
router.get("/projects3", projectController.projects3);
router.get("/projects/:id", projectController.projectsId);
router.get("/project/:id", projectController.projectId);

//get MANAGERS
router.get("/managers", managerController.managers);
router.get("/managers2", managerController.managers2);
router.get("/managers/:id", managerController.managersId);
router.get("/managers/chat/:id", managerController.managersChatId);
router.get("/manager/:id", managerController.companyId);
router.get("/manager/name/:id", managerController.managerName);

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

module.exports = router