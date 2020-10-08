const express = require('express')
const router = express.Router()

const Tweet = require('../models/Tweet')
const User = require('../models/User')

const { ensureAuthenticated} = require('../config/auth')

//Homepage route
router.get('/', (req, res) =>{
    res.render('welcome')
})

//Home Feed
router.get('/home', ensureAuthenticated, async (req, res)=>{     
    try {
        const tweets = await Tweet.find().sort({"dateCreated": -1})
        // console.log(tweets)
        res.render('home', { 
            tweets,
        })
    } catch (err){
        console.log(err)
    }
})

//dashboard route
router.get('/dashboard', ensureAuthenticated, async (req, res) =>{
    try {
        const tweets = await Tweet.find({creatorId: req.user._id})
        res.render('dashboard', { 
            tweets,
            name: req.user.name
        })
    } catch (err){
        console.log(err)
    }
})

//tweet post
router.post('/dashboard', ensureAuthenticated, (req, res) =>{
    const user = req.user
    const message = req.body.content
    // console.log(user)
    // console.log(message)
    const newTweet = new Tweet({
        message: message,
        creatorId: user._id,
        creatorName: user.name    
    })
    //save new tweet
    newTweet.save()
        .then(tweet =>{
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
router.get('/about', ensureAuthenticated, (req, res) =>{
    res.render('about')
})



module.exports = router