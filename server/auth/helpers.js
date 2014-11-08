var sequelize = require('../db/db').sequelize;
var User = require('../db/db').User;
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

exports.findUser = function(username, email, cb) {
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(cb);
};

exports.checkPassword = function(user, password) {
  return new Promise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        console.log('bcrypt compare error:', err);
      }
      resolve(result);
    });
  });
};


exports.generateUser = function(newUser) {
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