const User = require("../model/User");
const bcrypt = require("bcryptjs");
const dbErrorHelper = require("../../helpers/dbErrorHandler");
const authHelper = require("../../helpers/authHelper");
const url = require("url");
const cloudinary = require("cloudinary");
const formidable = require("formidable");
const nodemailer = require("nodemailer");
const crypto = require('crypto');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

async function cloundinaryUpload(url) {
  let result = await cloudinary.uploader.upload(
    url,
    {
      use_filename: true
    },
    function(error, result) {
      if (error) {
        return error;
      } else {
        return result;
      }
    }
  );
  return result;
}

module.exports = {
  createUser: async (req, res, next) => {
    let createdUser = await new User({
      email: req.body.email,
      password: req.body.password
    });

    bcrypt.genSalt(12, (err, salt) => {
      bcrypt.hash(createdUser.password, salt, (err, hash) => {
        if (err) throw err;
        createdUser.password = hash;
        createdUser
          .save()
          .then(user => {
            res.json({
              message: "success"
            });
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
  signInUser: async (req, res) => {
    try {
      let foundUser = await User.findOne({ email: req.body.email });

      if (foundUser === null) {
        throw "User not found, please sign up.";
      }

      let comparedPassword = await authHelper.comparePassword(
        req.body.password,
        foundUser.password
      );
      if (comparedPassword === 409) {
        throw "Check your email and password.";
      }

      let jwtToken = await authHelper.createJwtToken(foundUser);
      res.status(200).json({
        token: jwtToken
      });
    } catch (error) {
  
      res.status(500).json({
        message: error
      });
    }
  },
  linkedInUserLogin: async (req, res) => {
    try {
      let foundUser = await User.findOne({ email: req.user.emails[0].value });
      //console.log(foundUser);
      if (foundUser) {
        let jwtToken = await authHelper.createLinkedInUserJwtToken(
          foundUser,
          true
        );

        res.redirect(
          url.format({
            pathname: "http://localhost:3000/linkedin-users/auth/callback",
            query: {
              token: jwtToken
            }
          })
        );
      } else {
        let { secure_url } = await cloundinaryUpload(req.user.photos[1].value);

        let createdUser = await new User({
          email: req.user.emails[0].value,
          linkedinID: req.user.id,
          firstName: req.user.name.givenName,
          lastName: req.user.name.familyName,
          linkedInStrategy: true,
          pictureUploaded: true,
          pictureName: secure_url
        });

        let successfullyCreatedUser = await createdUser.save();

        let jwtToken = await authHelper.createLinkedInUserJwtToken(
          successfullyCreatedUser,
          false
        );

        res.redirect(
          url.format({
            pathname: "http://localhost:3000/linkedin-users/auth/callback",
            query: {
              token: jwtToken
            }
          })
        );
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error
      });
    }
  },
  updateUserProfileInfo: async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {

      if (fields.interests.length > 0 ) {
        let splittedInterests = fields.interests.split(',')
        fields.interests = splittedInterests
       } else {
         fields.interests = []
       }

      if (files.photo) {
        try {
          let { secure_url } = await cloundinaryUpload(files.photo.path);
          fields["pictureName"] = secure_url;

          let successfullyUpdated = await User.findByIdAndUpdate(req.params.id, fields, {
            new: true
          }).select(['-password', '-__v', '-userCreated', '-linkedInStrategy']);

          let newJwtToken = await authHelper.createJwtToken(successfullyUpdated);

          res.json({
            updatedData: successfullyUpdated,
            newJwtToken: newJwtToken
          });
        } catch (e) {

          res.status(500).json(e);
        }
      } else {
        try {
          let successfullyUpdated = await User.findByIdAndUpdate(req.params.id, fields, {
            new: true
          }).select(['-password', '-__v', '-userCreated', '-linkedInStrategy']);
             let newJwtToken = await authHelper.createJwtToken(successfullyUpdated);
          
          res.json({
            updatedData: successfullyUpdated,
            newJwtToken: newJwtToken
          });
        } catch (e) {

          res.status(500).json(e);
        }


      }
    });
  },

  getUserInfoByID: async (req, res) => {

    let id = req.params.id;

    try {
      let foundUser = await User.findOne({_id: id}).select(['-password', '-userCreated', '-_id', '-__v', '-linkedInStrategy', '-pictureUploaded'])
      res.json(foundUser);  
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }


  },

  sendMail: async (req, res) => {

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'camopacman@gmail.com',
        pass: 'i@mamaster'
      }
    })

    var mailOptions = {
      from: req.body.email,
      to: 'paknchu@gmail.com',
      subject: req.body.subject,
      html: ` 
           From Email:  ${req.body.email}
              <p>${req.body.message}</p>
            `
    }

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
        res.status(500).json(error)
      } else {
        console.log(info.response)
        res.send('success')
      }
    })

  },
  resetPassword: async (req, res) => {
    
    try {

      let foundUser = await User.findOne({email: req.body.email, linkedInStrategy: false});

      if (!foundUser) {
        res.status(500).send('');
      } else {

        const token = await crypto.randomBytes(20).toString('hex');

        foundUser.resetPassword.token = token;
        foundUser.resetPassword.tokenExpires =  Date.now() + 3600000;

        foundUser.save();

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'camopacman@gmail.com',
            pass: 'i@mamaster'
          }
        })
    
        const mailOptions = {
          from: 'camopacman@gmail.com',
          to: foundUser.email,
          subject: 'Link to reset password',
          text:
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n'
            + 'Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n'
            + `http://localhost:3000/reset/${token}\n\n`
            + 'If you did not request this, please ignore this email and your password will remain unchanged.\n',
        };
    
        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
            res.status(500).json(error)
          } else {
            console.log(info.response)
            res.send('success')
          }
        })



        res.status(200).send('');
      }

    } catch (e) {
      res.status(500).send('');
    }
    


  },
  checkResetLink: async (req, res) => {

    try {
      let foundUser = await User.findOne({'resetPassword.token': req.query.resetPasswordToken})

      if (!foundUser) {
        return res.status(401).send(''); 
      } else {
        let tokenExpires = foundUser.resetPassword.tokenExpires;

        if (tokenExpires < Date.now()) {
          res.status(401).send(''); 
        } else {
          let jwtToken = await authHelper.createJWTResetPassword(foundUser);
  
          res.status(200).json({
            token: jwtToken
          })
        }
      }
  
  

    } catch (e) {
      console.log(e)
      res.status(500).json(e);

    }

  },
  resetWithNewPassword: async (req, res) => {
 
    try {
      let foundUser = await User.findOne({email: req.user.email})

      let tokenExpires = foundUser.resetPassword.tokenExpires;

      if (tokenExpires < Date.now()) {
        res.status(401).send(''); 
      } else {
       
        bcrypt.genSalt(12, (err, salt) => {
          bcrypt.hash(req.body.password, salt, (err, hash) => {
            if (err) throw err;
            foundUser.password = hash;
            foundUser.resetPassword.token = '';
            foundUser.resetPassword.tokenExpires = null;
            foundUser
              .save()
              .then(user => {

          

                res.json({
                  message: "success"
                });
              })
              .catch(e => {
                //console.log(e)
                res.status(400).json({
                  message: dbErrorHelper(e)
                });
              });
          });
        });

      }

    } catch (e) {
      console.log(e)
      res.status(500).json(e);

    }
  },
  updateUserPassword: async (req, res) => {

    let foundUser = await User.findOne({email: req.body.email})
    console.log(req.body)
    bcrypt.genSalt(12, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (err) throw err;
        foundUser.password = hash;

        foundUser
          .save()
          .then(user => {
            res.json({
              message: "success"
            });
          })
          .catch(e => {
            //console.log(e)
            res.status(400).json({
              message: dbErrorHelper(e)
            });
          });
      });
    });

  }
};
