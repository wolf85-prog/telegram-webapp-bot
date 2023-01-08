const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')


router.get('/auth', userController.check)


module.exports = router