if(process.env.NODE_ENV != 'production') {
    require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require('./models/review.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

const port = 8080;
const MONGO_URL = 'mongodb://127.0.0.1:27017/travel-booking-system';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, '/public')));

const sessionOptions =  {
    secret : "mysupersecretcode",
    resave : false,
    saveUnitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}

app.get('/', (req, res) => {
    res.send('Hi, I am Root');
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
})

main().then(() => {
    console.log('Connected to DB');
})
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);


// app.get("/listings", async (req, res) => {
//     let sampleListing = new Listing({
//         title : 'My New Villa',
//         description : 'By the Beach',
//         price : 120000,
//         location : 'Calangute, Goa',
//         country : 'India',
//     });

//     await sampleListing.save();
//     res.send(sampleListing);
// });

app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'Page Not Found!'))
});


//debug logs to trace the request flow and pinpoint where multiple responses are being sent
app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    res.on('finish', () => console.log('Response sent.'));
    next();
});


//Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong!' } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render('error.ejs', { err });
});

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});