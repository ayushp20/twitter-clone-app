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
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})

const Tweet = mongoose.model('Tweet', TweetSchema)

module.exports = Tweet
