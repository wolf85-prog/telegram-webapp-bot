const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')

const secretController = require('../controllers/secretController')
const projectController = require('../controllers/projectController')

router.get('/secret', secretController.secretInfo)

// get PROJECTS  
router.get("/projects", projectController.projects);
router.get("/projects2", projectController.projects2);
router.get("/projects/:id", projectController.projectsId);


router.use('/user', userRouter)

module.exports = router