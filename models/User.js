const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    tweetsCreated: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }]
})

const User = mongoose.model('User', UserSchema)

module.exports = User
