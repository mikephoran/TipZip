/*jslint node: true */
/**
* @module auth_login
*/
var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var helpers = require('../db/helpers');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');


exports.login = passport.authenticate('local');
exports.logout = function(req, res, next) {
  req.logout();
  next();
};

/**
* Checks to see if a password given by a user matches their Encrypted password stored in DB.
* @function
* @memberof module:auth_login
* @instance
* @param {object} user User object profile to test against.
* @param {string} user.password Password from user object profile.
* @param {string} password Password to test against provided by user.
*/
var checkPassword = function(user, password) {
  return new Promise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        console.log('bcrypt compare error:', err);
      }
      resolve(result);
    });
  });
};

passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = { username: username };
    helpers.findUser(user, function(user) {
      if (!user) {
        return done(null, false, {message: 'Invalid Username.'});
      }
      checkPassword(user, password).then(function(result) {
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
