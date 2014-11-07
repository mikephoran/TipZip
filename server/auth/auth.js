var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var Sequelize = require ('Sequelize');
// May need to be changed based on db
// var User = require('../db/db.js');

exports.register = function(req, res) {
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
        responseMsg.result = true;
        responseMsg.message = 'User Creation Success!';
        console.log(responseMsg.message);
        res.json(responseMsg);
      });
    } else {
      responseMsg.result = false;
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

var findUser = function(username, email, cb) {
  var firstFilter = {
    username: username
  };
  var secondFilter = {
    email: email
  };

  User.find({
    where: Sequelize.and(firstFilter, Sequelize.or(secondFilter))
  }).success(cb);
};

