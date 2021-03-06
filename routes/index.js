const express = require('express')
const router = express.Router()

const Tweet = require('../models/Tweet')
const User = require('../models/User')

const { ensureAuthenticated } = require('../config/auth')

//Homepage route
router.get('/', (req, res) => {
    res.render('welcome')
})

//Home Feed
router.get('/home', ensureAuthenticated, async (req, res) => {
    let user = req.user
    // console.log(req.user._id)
    try {
        const tweets = await Tweet.find().populate('creator').sort({ "dateCreated": -1 })
        // console.log(tweets)
        res.render('home', { tweets, user })
    } catch (err) {
        console.log(err)
    }
})

//dashboard route
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const tweets = await Tweet.find({ creator: req.user._id }).populate('creator')
        res.render('dashboard', {
            tweets,
            user: req.user
        })
    } catch (err) {
        console.log(err)
    }
})

//tweet post
router.post('/dashboard', ensureAuthenticated, (req, res) => {
    const user = req.user
    const message = req.body.content
    // console.log(user)
    // console.log(message)
    const newTweet = new Tweet({
        message: message,
        creator: user._id,
        dateCreated: Date.now()
    })
    //save new tweet
    newTweet.save()
        .then(tweet => {
            req.flash('success_msg', 'Your tweet has been posted!')
            res.redirect('home')
        })

    User.findById(user._id)
        .then(user => {
            user.tweetsCreated.push(newTweet)
            user.save().then(user => console.log("New Tweet Posted by:" + user.name + "!"))
        })
        .catch(err => console.log(err))
})

//About Page
router.get('/about', ensureAuthenticated, (req, res) => {
    res.render('about')
})



module.exports = router