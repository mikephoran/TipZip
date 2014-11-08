var sequelize = require('../db/db').sequelize;
var helpers = require('./helpers');

exports.register = function(req, res) {
  var newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  };

  helpers.findUser(newUser.username, newUser.password, function(user) {
    if (!!user) {
      return res.redirect('/fail'); 
    } 

    helpers.generateUser(newUser).then(function(err) {
      req.login(newUser.username, function() {
        res.redirect('/')
      });
    });
  });
};