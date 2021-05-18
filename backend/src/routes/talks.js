const router = require('express').Router()
const TalkController = require('./../controllers/TalkController')

module.exports = app => {

    router.post('/create', TalkController.create)

    router.get('/all/:userId', TalkController.getAll)

    // router.delete('/', TalkController.remove)

    app.use('/talks', router)    
}