const Message = require('./../models/Message')
const Talk = require('./../models/Talk')
const mongoose = require('mongoose')
const socket = require('./../helpers/socket')

exports.send = async (req, res) => {

    let { sentBy, talkId, messageReply, content, type } = req.body

    const message = {
        sentBy: mongoose.Types.ObjectId(sentBy),
        talkId: mongoose.Types.ObjectId(talkId),
        messageReply: messageReply ? mongoose.Types.ObjectId(messageReply) : null,
        content: content,
        type: type,
        usersViewMessage: [mongoose.Types.ObjectId(sentBy)],
        createdAt: new Date()
    }

    Message.create(message)
        .then(messageResponse => {

            let $set = {
                lastMessageInteraction: {
                    contentType: type,
                    content,
                    timestamp: new Date()
                },
            }

            Talk.updateOne({ _id: mongoose.Types.ObjectId(talkId) }, { $set }).then()

            socket.socketMessage({
                talkId,
                message: messageResponse
            })

            res.status(200).json({
                message: messageResponse,
                temp: req.body.temp
            })
        })
        .catch(err => {
            console.log('erro ao criar mensagem.', err)
            res.status(400).send('Erro ao criar mensagem.')
        })      
}

exports.sendMedias = async (req, res) => {

    console.log(req.file)

    let { sentBy, talkId, messageReply } = req.body
    let { filename, mimetype } = req.file

    const message = {
        sentBy: mongoose.Types.ObjectId(sentBy),
        talkId: mongoose.Types.ObjectId(talkId),
        messageReply: messageReply ? mongoose.Types.ObjectId(messageReply) : null,
        content: filename,
        type: mimetype.split('/')[0],
        usersViewMessage: [mongoose.Types.ObjectId(sentBy)],
        createdAt: new Date()
    }

    Message.create(message)
        .then(messageResponse => {

            let $set = {
                lastMessageInteraction: {
                    contentType: mimetype.split('/')[0],
                    content: filename,
                    timestamp: new Date()
                },
            }

            Talk.updateOne({ _id: mongoose.Types.ObjectId(talkId) }, { $set }).then()

            socket.socketMessage({
                talkId,
                message: messageResponse
            })

            res.status(200).json(messageResponse)
        })
        .catch(err => {
            console.log('erro ao criar mensagem.', err)
            res.status(400).send('Erro ao criar mensagem.')
        })
       
}

exports.findMessages = async (req, res) => {

    const query = {
        talkId: mongoose.Types.ObjectId(req.params.talkId)
    }

    const { limit, skip }  = req.query

    Message.find(query)
        .populate({ path: 'sentBy', model: 'User' })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip) || 0)
        .limit(parseInt(limit) || 10)
        .then(messages => {
            res.status(200).json(messages)
        })
        .catch(err => {
            console.log('erro ao buscar mensagens.')
            res.status(400).send('Erro ao buscar mensagens.')
        })
}

exports.removeMessage = async (req, res) => {

    const { messageId } = req.params

    Message.deleteOne({_id: messageId})
        .then(resp => {
            res.status(200).json({ messageId })
        })
        .catch(err => {
            console.log('Erro ao remover mensagem')
            res.status(400).json([])
        })

}

exports.updateUserViewMessage = async (req, res) => {

    const { messageId, userId, talkId } = req.params

    try {
        const message = await Message.findOneAndUpdate({ _id: mongoose.Types.ObjectId(messageId)}, {
            $addToSet: { usersViewMessage: mongoose.Types.ObjectId(userId) } 
        },
        {
            returnNewDocument: true 
        })

        socket.socketMessagesView({
            talkId,
            messages: [message]
        })

        return res.status(200).json(message)

    } catch (error) {
        console.log('Erro au atualizar usuários que vizualizaram a mensagem', error)
        return res.status(400).send('Erro au atualizar usuários que vizualizaram a mensagem.')
    }
}

exports.updateAllMessagesUnread = async (req, res) => {

    const { userId, talkId } = req.params

    try {
        const messagesUnread = await Message.find({ 
            talkId: mongoose.Types.ObjectId(talkId),
            usersViewMessage: { $ne: mongoose.Types.ObjectId(userId) }
        }, { _id: 1 })

        let messagesUnreadFormatted = messagesUnread.map(m => mongoose.Types.ObjectId(m._id))

        await Message.updateMany({ _id: { $in: [...messagesUnreadFormatted] } }, {
            $addToSet: { usersViewMessage: mongoose.Types.ObjectId(userId) } 
        })

        let messagesReturn = await Message.find({ 
            talkId: mongoose.Types.ObjectId(talkId),
            usersViewMessage: { $ne: mongoose.Types.ObjectId(userId) }
        }) 

        socket.socketMessagesView({
            talkId,
            messages: [...messagesReturn]
        })

        return res.status(200).json({})

    } catch (error) {
        console.log('Erro au atualizar usuários que vizualizaram a mensagem', error)
        return res.status(400).send('Erro au atualizar usuários que vizualizaram a mensagem.')
    }
}

exports.updateMessageText = async (req, res) => {

    try {

        const { messageId, talkId } = req.params

        const message = await Message.findOneAndUpdate({
                _id: mongoose.Types.ObjectId(messageId)
            },{
                $set: {
                    content: req.body.content
                }
            },
            {
                new: true 
            })

            socket.socketMessagesEdit({
                talkId,
                messages: [message]
            })

        console.log(message)

        return res.status(200).json(message)

    } catch (error) {
        return res.status(400).send('Erro au atualizar conteudo da mensagem')
    }
}