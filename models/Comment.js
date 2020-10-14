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
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    parentTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }
})

CommentSchema.pre('find', function() {
    this.populate('creator').populate( 'parentTweet');
  });

const Comment = mongoose.model('Comment', CommentSchema)

module.exports = Comment
