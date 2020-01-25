var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

let linkedInPassport = new LinkedInStrategy({
    clientID: '77zphwi0a3k2at',
    clientSecret: 'oPxsjEM5uEQXOBIn',
    callbackURL: process.env.NODE_ENV !== 'development' ? '' : "http://127.0.0.1:3001/api/users/linkedin/auth/callback",
    scope: ['r_liteprofile', 'r_emailaddress']
  }, function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...

    process.nextTick(function () {
      // To keep the example simple, the user's LinkedIn profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the LinkedIn account with a user record in your database,
      // and return that user instead.
      // console.log('-----')
  
      return done(null, profile);
    });
  });

  module.exports = linkedInPassport;