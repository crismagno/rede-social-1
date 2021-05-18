const mongoose = require('mongoose')

const Post = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true 
    },

    description: {
        type: String,
        required: true
    },

    media: {
        type: Object,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Post', Post)