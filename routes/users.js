const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const Tweet = require('../models/Tweet');
const Comment = require('../models/Comment');
const { forwardAuthenticated } = require('../config/auth');
const { ensureAuthenticated } = require('../config/auth');


var ObjectId = require('mongodb').ObjectID;
// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
    // console.log(req.body)
    let { name, email, password, password2 } = req.body;
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
        email = email.toLowerCase()
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //User exists
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    
                    const newUser = new User({
                        name,
                        email,
                        password
                    })
                    //Hash Password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err

                        //set password to hash
                        newUser.password = hash

                        //save new user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered and can log in !')
                                res.redirect('login')
                            })
                            .catch(err => console.log(err))
                    }))
                }

            })
    }
});

//Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: 'login',
        failureFlash: true
    })(req, res, next)
})

//Logout handle
router.get('/logout', (req, res) => {
    req.logout()
    // req.session.destroy()
    req.flash('success_msg', 'you have successfully logged out')
    res.redirect('/users/login')
})

//Change Password GET
router.get('/changepassword', (req, res) => {
    console.log("GET change password")
    // res.send("GET change password")
    res.render('changePassword')
});

//Change Password PUT
router.put('/changepassword', (req, res) => {
    console.log("PUT change password")
    const { currentPassword, newPassword1, newPassword2 } = req.body
    const user = req.user
    // console.log(req.body)
    // console.log(`${currentPassword} ${newPassword1} ${newPassword2}`)
    let errors = []
    if (!currentPassword || !newPassword1 || !newPassword2) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (newPassword1 !== newPassword2) {
        errors.push({ msg: 'New passwords do not match' });
    }

    if (newPassword1.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }
    
    if(errors.length > 0){
        console.log(errors)
        res.render('changePassword', { errors })
    }
    else {
        try {
            bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    console.log('match')
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newPassword1, salt, (err, hash) => {
                        if (err) throw err
    
                        //set password to hash
                        user.password = hash
    
                        //save new user
                        user.save()
                            .then((user) => {
                                req.flash('success_msg', 'You have successfully updated your password.')
                                res.redirect('/dashboard')
                            })
                            .catch(err => console.log(err))
                    }))
                }
            })
        } catch (err){
            console.log(err)
            errors.push({ msg: 'Current password entered is incorrect.' })
            console.log(errors)
            res.render('changePassword', { errors })
        }

    }
    
});

//User profile page
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.render('edit-profile', { user })
    } catch (err) {
        console.log(err)
    }
})

//Verify user password
router.put('/:id', async (req, res) => {
    // console.log(req.body)
    const { name, email, password } = req.body
    const user = await User.findById(req.params.id)
    // res.send('Update working...')
    try {
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                user.name = name
                user.email = email
                user.save()
                    .then((user) => {
                        req.flash('success_msg', 'You have successfully edited your profile.')
                        res.redirect('/dashboard')
                    })
            } else {
                console.log('Password is incorrect.')
                req.flash('error', 'Password is incorrect.')
                res.redirect('/users/' + user._id)
            }
        })
    } catch {
        res.status(500).send()
    }

})


module.exports = router;