const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../admin/model/Admin');
const keys = process.env.ADMIN_SECRET_KEY;

const jwtOpts = {};
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOpts.secretOrKey = keys;

const adminJWTLogin = new JwtStrategy(jwtOpts, async (payload, done) => {

  const adminEmail = payload.email;
 
	try {
		if (adminEmail) {
			const user = await Admin.findOne({email: adminEmail});
			if (!user || user === null) {
				return done(null, false);
			}
			return done(null, user)
		}
	} catch (error) {

		return done(error, false);
	}
});


module.exports = adminJWTLogin;

