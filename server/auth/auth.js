var passport = exports.passport = require('passport');
var LocalStrategy = exports.passportLocal = require('passport-local').Strategy;
var User = require('../db/db').User;


exports.login = require('./login').login;

exports.register = require('./register').register;

exports.findUser = function(username, email, cb) {
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(cb);
};