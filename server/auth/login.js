var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var helpers = require('./helpers');

exports.login = function(req, res, next) {
  passport.authenticate('local', function(err, user) {
    if (err) { console.log('Passport Error:', err); }

    if (user) {
      res.json({success: true, message: 'Login Successful!'});
    } else {
      res.json({success: false, message: 'Error: Invalid Username/Password!'});
    }
  })(req, res, next);
};

passport.use(new LocalStrategy(
  function(username, password, done) {
    helpers.findUser(username, username, function(user) {
      if (!user) {
        return done(null, false, {message: 'Invalid Username.'});
      }
      helpers.checkPassword(user, password).then(function(result) {
        if (result) {
          return done(null, user.username);
        }
        return done(null, false, {messsage: 'Invalid Password.'});
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