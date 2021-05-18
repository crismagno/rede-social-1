const UserController = require('./../controllers/UserController')

exports.start = io => {

    global.gSocket = io

    io.on('connection', async socket => {
        console.log('SOCKET CONNECT--------')

        let id_user = socket.handshake.query.id_user
        let returnStatus = await UserController.userOnOrOff(id_user, true)

        socket.on('disconnect', async () => {
            console.log('SOCKET DISCONNECT--------')
            await UserController.userOnOrOff(id_user, false)
        })

        socket.emit(`res-status-online-${id_user}`, returnStatus)

    })

    
}

exports.socketMessage = async data => {

    if (!global.gSocket) {
        console.log('error socket...')
        return false
    }

    global.gSocket.emit(`socket-message-${data.talkId}`, data)
}

// mensagem visualizada
exports.socketMessagesView = async data => {

    if (!global.gSocket) {
        console.log('error socket...')
        return false
    }

    global.gSocket.emit(`socket-messages-views-${data.talkId}`, data)
}

// mensagem visualizada
exports.socketMessagesEdit = async data => {

    if (!global.gSocket) {
        console.log('error socket...')
        return false
    }

    global.gSocket.emit(`socket-message-edit-${data.talkId}`, data)
}