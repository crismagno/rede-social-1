const mongoose = require('mongoose')

const Message = new mongoose.Schema({

    sentBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true 
    },

    talkId: {
        type: mongoose.Types.ObjectId,
        ref: 'Talk',
        required: true  
    },

    messageReply: {
        type: mongoose.Types.ObjectId,
        ref: 'Message',
    },

    content: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ['image', 'text', 'audio', 'video', 'document'],
        required: true
    },

    usersViewMessage: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Message', Message)
