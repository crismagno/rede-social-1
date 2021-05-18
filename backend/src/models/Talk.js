const mongoose = require('mongoose')

const Talk = mongoose.Schema({

    typeTalk: {
        type: String,
        enum: ['group', 'normal'],
        default: 'normal'
    },

    users: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],

    inviter: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true 
    },

    admins: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    ],

    lastMessageInteraction: {
        type: Object,
        default: {}
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }

})

module.exports = mongoose.model('Talk', Talk)