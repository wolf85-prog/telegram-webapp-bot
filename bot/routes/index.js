const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')

const secretController = require('../controllers/secretController')
const projectController = require('../controllers/projectController')

router.get('/secret', secretController.secretInfo)

// get PROJECTS  
router.get("/projects3", projectController.projects);

router.get("/projects4", projectController.getProjects2);


router.use('/user', userRouter)

module.exports = router