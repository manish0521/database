const Admin = require('../model/Admin');
const bcrypt = require("bcryptjs");
const dbErrorHelper = require('../../helpers/dbErrorHandler');
const authHelper = require('../../helpers/authHelper');

module.exports = {

  createAdmin: async (req, res, next) => {

    let createdAdmin = await new Admin({
      email: req.body.email,
      password: req.body.password
    })

    bcrypt.genSalt(12, (err, salt) => {
      bcrypt.hash(createdAdmin.password, salt, (err, hash) => {
        if (err)
          throw err;
        createdAdmin.password = hash;
        createdAdmin
          .save()
          .then(user => {
            res.json({
              message: 'success'
            })
          })
          .catch(e => {
            //console.log(e)
            res.status(400).json({
              message: dbErrorHelper(e)
            });
          });
      });
    });

  },
  loginAdmin: async (req, res) => {

    try {
      let foundAdmin = await Admin.findOne({email: req.body.email})
   
      if (foundAdmin === null) {
        throw 'User not found, please sign up';
      }

      let comparedPassword = await authHelper.comparePassword(req.body.password, foundAdmin.password);
      if (comparedPassword === 409) {
        throw 'Check your email and password';
      }

      let jwtToken = await authHelper.createAdminToken(foundAdmin);
      res.status(200).json({
        token: jwtToken
      })

    } catch (error) {
      res.status(500).json({
        message: error
      })
    }


  }


}