const router = require('express').Router()
const MessageController = require('./../controllers/MessageController')
const path = require('path')
const multer = require('multer')

const typeFile = file => {
    switch(file.mimetype) {
        case 'image' || 'image/jpg' || 'image/png': return 'jpg'
        case 'video' || 'video/mp4': return 'mp4'
        case 'audio/mpeg' : return 'mp3'
    }
}

const Storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, path.join(__dirname,'../uploads_messages'))
    },
    filename(req, file, callback) {
        console.log(file)
        // let type = typeFile(file)
        let type = file.mimetype.split('/')[1]
        callback(null, `${file.fieldname}_${file.originalname}_${Date.now()}.${type}`)
    },
})
    
const upload = multer({ storage: Storage })

module.exports = app => {

    router.post('/', MessageController.send)

    router.post('/medias', upload.single('medias'), MessageController.sendMedias)

    router.get('/all/:talkId', MessageController.findMessages)

    router.delete('/:messageId', MessageController.removeMessage)

    // atualizar mensagem inserindo user como usuário que leu
    router.put('/user-view/:messageId/:userId/:talkId', MessageController.updateUserViewMessage)

    // atualizar todas mensagem inserindo user como usuário que leu
    router.put('/update-messages-unread/:userId/:talkId', MessageController.updateAllMessagesUnread)

    // atualizar mensagem de texto
    router.put('/update-message/:messageId/:talkId', MessageController.updateMessageText)

    app.use('/messages', router)
    
}