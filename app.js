if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express  = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

const app = express()

//Passport Config
require('./config/passport')(passport)

//Connect to Mongo
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true})
.then(() => console.log("MongoDB Connected..."))
.catch(err => console.log(err))

// const db = mongoose.connection
// db.once('open', () =>console.log('Connected to Mongoose'))

//public static
app.use(express.static("public"))

//EJS
app.use(expressLayouts)
app.set('view engine', 'ejs')

//Body Parser
app.use(express.urlencoded({extended:false}))

//Express Session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

//Global Vars
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

//Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/tweet', require('./routes/tweet'))

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server started on: http://localhost:${PORT}`))
