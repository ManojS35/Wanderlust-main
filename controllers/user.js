const User = require('../models/user.js');

module.exports.renderSignupForm = (req, res) => {
    res.render('users/signup.ejs');
}

module.exports.signup = async (req, res) => {
    try {
        let {username, email, password} = req.body;
        let newUser = new User({email, username});
        const registerdUser = await User.register(newUser, password);
        req.login(registerdUser, (err) => {
            if(err) {
                next(err);
            } else {
                // console.log(registerdUser);
                req.flash('success', 'Welcome to Wanderlust!');
                res.redirect('/listings');
            }
        });
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('/signup');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login.ejs');
}

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    if(res.locals.redirectUrl) {
        res.redirect(res.locals.redirectUrl);
    } else {
        res.redirect('/listings');
    }
}

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Logged out successfully!");
        res.redirect('/listings');
    });
}