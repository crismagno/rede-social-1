const mongoose = require('mongoose')

const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    avatar: {
        type: String,
        default: ''
    },

    online_at: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('User', User)