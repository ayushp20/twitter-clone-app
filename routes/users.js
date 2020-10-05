const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    // console.log(req.body)
    const { name, email, password, password2 } = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        console.log(errors)
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
            });
    } else {
        //Validation Passed
        User.findOne({ email: email})
            .then(user =>{
                if(user){
                    //User exists
                    errors.push({ msg: 'Email is already registered'})
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    }); 
                }else{
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt)=>bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        if(err) throw err
                        
                        //set password to hash
                        newUser.password = hash

                        //save new user
                        newUser.save()
                            .then(user =>{
                                req.flash('success_msg', 'You are now registered and can log in !')
                                res.redirect('login') 
                            })
                            .catch(err => console.log(err))
                    }))
                    // console.log(newUser)
                    // res.send('hello')
                }
            
            })
    }
});

//Login handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local',{
        successRedirect:'/home',
        failureRedirect:'login',
        failureFlash: true
    })(req, res, next)
})

//Logout handle
router.get('/logout',(req, res)=>{
    req.logout()
    // req.session.destroy()
    req.flash('success_msg', 'you have successfully logged out')
    res.redirect('/users/login')
})

module.exports = router;