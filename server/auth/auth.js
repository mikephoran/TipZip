var passport = exports.passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var sequelize = require('../db/db').sequelize;
var Promise = require('bluebird');
var User = require('../db/db').User;

passport.use(new LocalStrategy(
  function(username, password, done) {
    findUser(username, username, function(user) {
      if (!user) {
        return done(null, false, { message: 'Incorrect Username.'});
      }
      checkPassword(user, password).then(function(result) {
        if (result) {
          return done(null, { username: user.username });
        }
        return done(null, false, {messsage: 'Incorrect Password.' });
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

exports.login = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
});

exports.register = function(req, res) {
  console.log('Registering:', req.body);
  var newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };
  var responseMsg = {};

  findUser(newUser.username, newUser.password, function(user) {
    if (!user) {
      generateUser(newUser).then(function(err) {
        if (err) { console.log('User Creation Failed:', err); }
        responseMsg.success = true;
        responseMsg.message = 'User Creation Success!';
        res.json(responseMsg);
      });
    } else {
      responseMsg.success = false;
      responseMsg.message = 'Username and/or Password already Exists';
      res.json(responseMsg);
    }
  });
};

var generateUser = function(newUser) {
  return new Promise(function(resolve) {
    bcrypt.hash(newUser.password, 10, function(err, hash) {
      User.build({
        username: newUser.username,
        email: newUser.email,
        password: hash
      })
      .save()
      .complete(function(err) {
        resolve(err);
      });
    });
  });
};

var checkPassword = function(user, password) {
  return new Promise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) { console.log('bcrypt compare error:', err); }
      resolve(result);
    });
  });
};

var findUser = function(username, email, cb) {
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(cb);
};