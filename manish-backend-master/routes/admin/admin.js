var express = require('express');
var router = express.Router();
const passport = require('passport');
const adminController = require('./controllers/adminController');
/* GET home page.. */
router.get('/', passport.authenticate('jwt-admin'), function(req, res, next) {
  res.send('From Admin')
});

router.post('/sign-up', adminController.createAdmin);

router.post('/sign-in', adminController.loginAdmin);

module.exports = router;
