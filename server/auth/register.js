/*jslint node: true */
/* jshint -W098 */
/**
* @module auth_register
*/
var helpers = require('../db/helpers');
var User = require('../db/db').User;
var bcrypt = require('bcrypt');
var Promise = require('bluebird');

/**
* Generates a new user and stores in DB
* @function
* @memberof module:auth_register
* @instance
* @param {object} user User object profile to save to database.
* @param {string} user.username Username of new user.
* @param {string} user.email Email of new user.
* @param {string} user.password Password of new user. Will be hashed before storage.
*/
var generateUser = function(user) {
  return new Promise(function(resolve) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      User.build({
        username: user.username,
        email: user.email,
        password: hash
      })
      .save()
      .complete(function(err) {
        resolve(err);
      });
    });
  });
};

module.exports = function(req, res) {
  var newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };
  helpers.findUser(newUser, function(user) {
    if (!!user) {
      return res.json({success: false, result: 'Error: Username already exists.'});
    } 

    generateUser(newUser).then(function(err) {
      req.login(newUser.username, function() {
        res.json({success: true, result: 'Successful Registration'});
      });
    });
  });
};