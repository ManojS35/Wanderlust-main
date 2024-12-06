const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const {isLoggedIn, isOwner, validateListing} = require('../middlewares/middleware.js');
const listingController = require('../controllers/listing.js');
const multer  = require('multer')
const {storage} = require('../cloudConfig.js');
const upload = multer({ storage })
// const upload = multer({ dest: 'uploads/' })


router.route('/')
    .get(wrapAsync(listingController.index))   //Index route
    .post(                                     //Create Route
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

//NEW Route
router.get('/new', isLoggedIn, listingController.renderNewForm);

router.route('/:id') 
    .get(wrapAsync(listingController.showListing))  //SHOW Route
    .put(                                           //Update Route
        isOwner,
        validateListing,
        isLoggedIn,
        wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));   //Delete Route

//Edit Route
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;