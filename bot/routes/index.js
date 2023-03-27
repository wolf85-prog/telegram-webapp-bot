const Router = require('express')
const router = new Router()

const secretController = require('../controllers/secretController')
const projectController = require('../controllers/projectController')
const managerController = require('../controllers/managerController')
const databaseController = require('../controllers/databaseController')
const blockController = require('../controllers/blockController')
const blockEquipmentController = require('../controllers/blockEquipmentController')
const addressController = require('../controllers/addressController')

router.get('/secret', secretController.secretInfo)

// get PROJECTS  
router.get("/projects", projectController.projects);
router.get("/projects2", projectController.projects2);
router.get("/projects/:id", projectController.projectsId);

//get MANAGERS
router.get("/managers", managerController.managers);
router.get("/managers/:id", managerController.managersId);
router.get("/manager/:id", managerController.companyId);

//post MANAGER
router.post("/manager", managerController.create);

//get COMPANYS
router.get("/companys", managerController.companys);


//get DATABASE
router.get('/database/:id', databaseController.databaseId); //получить список работников
router.get('/database2/:id', databaseController.databaseId2);
router.get('/database/', databaseController.database);
router.get("/database1", databaseController.database1);


//get BLOCK (Основной состав)
router.get('/blocks/:id', blockController.blocksId); //получить id таблицы/блока "Основной состав" ("4a74b62a-2f46-4fae-9e4b-9c700cb1b2f1")
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


module.exports = router