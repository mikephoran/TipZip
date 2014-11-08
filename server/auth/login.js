var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var helpers = require('./helpers');

exports.login = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/fail',
  failureFlash: true
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    helpers.findUser(username, username, function(user) {
      if (!user) {
        return done(null, false, { message: 'Invalid Username.' });
      }
      helpers.checkPassword(user, password).then(function(result) {
        if (result) {
          return done(null, user.username);
        }
        return done(null, false, { messsage: 'Invalid Password.' });
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});