const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')

const secretController = require('../controllers/secretController')

router.use('/secret', secretController.secretInfo)
router.use('/user', userRouter)

module.exports = router