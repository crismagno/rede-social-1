const router = require('express').Router()
const PostController = require('./../controllers/PostController')
const path = require('path')
const multer = require('multer')

const typeFile = file => {
    switch(file.mimetype) {
        case 'image': return 'jpg'
        case 'image/jpg': return 'jpg'
        case 'image/png': return 'jpg'
        case 'video': return 'mp4'
    }
}

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, path.join(__dirname,'../uploads'))
    },
    filename(req, file, callback) {
        let type = typeFile(file)
        callback(null, `${file.fieldname}_${file.originalname}_${Date.now()}.${type}`)
    },
})
    
const upload = multer({ storage })

module.exports = app => {

    router.post('/create/:user', upload.single('media'), PostController.create)

    router.get('/find/all/:user', PostController.findAll)

    router.delete('/remove/:id', PostController.remove)

    app.use('/posts', router)    
}