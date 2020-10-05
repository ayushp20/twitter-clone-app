const mongoose = require('mongoose')

const TweetSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    creatorName: {
        type: String,
        required: true
    }
})

const Tweet = mongoose.model('Tweet', TweetSchema)

module.exports = Tweet
