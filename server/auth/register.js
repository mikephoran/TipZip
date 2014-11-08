var bcrypt = require('bcrypt');
var sequelize = require('../db/db').sequelize;
var Promise = require('bluebird');
var User = require('../db/db').User;
var findUser = require('./auth').findUser;

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