const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config()

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users/users');
const adminRouter = require('./routes/admin/admin');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const userJWTStrategy = require('./routes/passport/user-passport-auth');
const adminJWTStrategy = require('./routes/passport/admin-jwt-strategy');
const LinkedInPassportStrategy = require('./routes/passport/user-linked-in-strategy');
const resetPasswordPassportStrategy = require('./routes/passport/reset-password-jwt-strategy');

app.use(passport.initialize());

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

passport.use('jwt-linkedin', LinkedInPassportStrategy)
passport.use('jwt-user', userJWTStrategy);
passport.use('jwt-admin', adminJWTStrategy);
passport.use('jwt-reset-password', resetPasswordPassportStrategy);

app.use(cors({ origin: 'http://localhost:3000', credentials: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
