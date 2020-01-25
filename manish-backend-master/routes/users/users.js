var express = require('express');
var router = express.Router();
const passport = require('passport')

const fs = require('fs')

const userController = require('./controllers/userController')


/* GET users listing. */
router.get('/',passport.authenticate('jwt-user', {session: false}), function(req, res, next) {
  res.send('From User');
});

router.get('/get-user-info/:id',passport.authenticate('jwt-user', {session: false}), userController.getUserInfoByID);

router.post('/sign-up', userController.createUser);

router.post('/sign-in', userController.signInUser);

router.post('/update-user-info/:id',passport.authenticate('jwt-user', {session: false}), userController.updateUserProfileInfo);

router.get('/linkedin/auth', passport.authenticate('jwt-linkedin')); 

router.get('/linkedin/auth/callback', passport.authenticate('jwt-linkedin', {
  failureRedirect: 'http://localhost:3000'
}), userController.linkedInUserLogin);

router.post('/send-email', passport.authenticate('jwt-user', {session: false}), userController.sendMail);

router.post('/reset-password', userController.resetPassword);

router.get('/reset', userController.checkResetLink);

router.put('/reset-password', passport.authenticate('jwt-reset-password', {session: false}), userController.resetWithNewPassword);

router.put('/new-user-password', passport.authenticate('jwt-user', {session: false}), userController.updateUserPassword)

module.exports = router;
