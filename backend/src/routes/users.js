const router = require('express').Router()
const UserController = require('./../controllers/UserController')
const path = require('path')
const multer = require('multer')

const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, path.join(__dirname,'../uploads'))
    },
    filename(req, file, callback) {
        
        callback(null, `${file.fieldname}_${file.originalname}_${Date.now()}.jpg`)
    },
})
    
const upload = multer({ storage: Storage })

module.exports = app => {

    router.post('/create', UserController.create)

    router.get('/find/:email/:password', UserController.find)
    router.get('/find-all/:id', UserController.findAll)

    router.post('/update-avatar/:id', upload.single('avatar'), UserController.updateAvatar)

    router.put('/update/:id', UserController.update)


    app.use('/users', router)
    
}