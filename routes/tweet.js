const express = require('express');
const router = express.Router();
const Tweet = require('../models/Tweet')
const User = require('../models/User')
const Comment = require('../models/Comment')

const { ensureAuthenticated } = require('../config/auth')

router.get('/:id', ensureAuthenticated, async (req, res) => {
    //All comments
    const allComments = await Comment.find().sort({ "dateCreated": -1 })
    // console.log("GET route")
    // console.log(allComments)
    try {
        const tweet = await Tweet.findById(req.params.id)
        res.render('tweet', { tweet, allComments })
    } catch (err) {
        console.log(err)
    }
})

router.post('/:id', ensureAuthenticated, (req, res) => {
    // console.log(req.body)
    const newComment = new Comment({
        message: req.body.comment,
        creatorId: req.user._id,
        creatorName: req.user.name,
        tweetId: req.params.id,
        dateCreated: Date.now()
    })
    //Save Comment to database
    newComment.save()
        .then(comment => {
            console.log('Comment posted successfully')
            req.flash('success_msg', 'Your comment has been posted!')
            res.redirect('' + req.params.id)
        })

    //Add comment to Tweet
    Tweet.findById(req.params.id)
        .then(tweet => {
            tweet.comments.push(newComment)
            tweet.save().then(tweet2 => console.log("New comment saved in tweet."))
        })

    //Add comment to User
    User.findById(req.user._id)
        .then(user => {
            user.commentsCreated.push(newComment)
            user.save().then(user2 => console.log("New comment Posted by:" + user.name + "!"))
        })

    // console.log(allComments)

})

module.exports = router;