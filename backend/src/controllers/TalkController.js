const { AUTH_SECRET } = require('./../../.env')
const jwt = require('jwt-simple')
const Talk = require('./../models/Talk')
const Message = require('./../models/Message')
const mongoose = require('mongoose')
const socket = require('./../helpers/socket')

exports.create = async (req, res) => {

    const users = req.body.users.map(u => mongoose.Types.ObjectId(u))
    const admins = req.body.admins.map(u => mongoose.Types.ObjectId(u))

    const talk = {
        typeTalk: req.body.typeTalk,
        inviter: mongoose.Types.ObjectId(req.body.inviter),
        users,
        admins,
        lastMessageInteraction: {
            contentType: 'text',
            content: 'conversa criada!',
            timestamp: new Date()
        },
        createdAt: new Date()
    }

    Talk.create(talk)
        .then(talkResponse => {
            res.status(200).json({})
        })
        .catch(err => {
            console.log('erro ao criar conversa.', err)
            res.status(400).send('Erro ao criar conversa.')
        })
       
}

exports.getAll = async (req, res) => {

    const userId = req.params.userId

    Talk.find({ users: mongoose.Types.ObjectId(userId) })
        .populate('users')
        .sort({ 'lastMessageInteraction.timestamp': -1 })
        .then(async talks => {

            let talksFormatted = []
            talks = JSON.parse(JSON.stringify(talks))
            for(let talk of talks) {
                talk['countUnread'] = await Message.find({ 
                    talkId: mongoose.Types.ObjectId(talk._id),
                    usersViewMessage: { $ne: mongoose.Types.ObjectId(userId) }
                }).count() 

                talksFormatted.push(talk)
            }
            res.status(200).json(talksFormatted)
        })
        .catch(err => {
            console.log('erro ao busca conversas.', err)
            res.status(400).send('Erro ao buscar conversas.')
        })
}
