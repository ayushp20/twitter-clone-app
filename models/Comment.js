const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
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
    },
    tweetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }
})

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment
