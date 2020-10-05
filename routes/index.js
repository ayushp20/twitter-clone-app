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
    // res.send('Home Page')
     
    try {
        const tweets = await Tweet.find().sort({"dateCreated": -1})
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
    //save new user
    newTweet.save()
        .then(tweet =>{
            req.flash('success_msg', 'Your tweet has been posted!')
            res.redirect('home') 
        })
    
    User.findById(user._id)
        .then(user => {
            user.tweetsCreated.push(newTweet)
            user.save().then(user => console.log(user))
        })
        .catch(err => console.log(err))
})


module.exports = router