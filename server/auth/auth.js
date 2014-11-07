var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var Sequelize = require ('Sequelize');
// May need to be changed based on db
// var User = require('../db/db.js');

var User = db.Model.extend({
  makeHash: function(password) {
    return new Promise(function(resolve) {
      bcrypt.genSalt(10, function(err, salt) {
        if (err) { console.log('Bcrypt Error:', err); }

        bcrypt.hash(newUser.password, salt, function(err, hash) {
          if (err) { console.log('Bcrypt hashing error:' err); }
          resolve(hash);
        });
      });
    });
  },
  compare: function(password) {
    return new Promise(function(resolve) {
      bcrypt.compare(password, this.get('password'), resolve);
    }.bind(this));
  },
  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      var password = model.get('password');
      this.makeHash(password).then(function(hash) {
        model.set('password', hash);
      });
    });
  }
});


var authenticate = function(username, password, done) {
  findUser(username, password, function(user) {
    if (!user) { 
      return done(null, false, { message: 'Invalid User' }); 
    }
    bcrypt.compare(password, user.password, function(err, result) {
      if (result) { 
        return done(null, user.username);
      } else {
        return done(null, false, { message: 'Invalid Password' });
      }
    });
  });
};

var auth = {};
auth.localStrategy = new LocalStrategy({username: 'username',password: 'password'}, authenticate);


passport.use(new LocalStrategy(
  function(username, password, done) {
    findUser(username, password, function(user) {
      if (!user) { 
        return done(null, false, { message: 'Invalid User' }); 
      }
      bcrypt.compare(password, user.password, function(err, result) {
        if (result) { 
          return done(null, user.username);
        } else {
          return done(null, false, { message: 'Invalid Password' });
        }
      });
    });
  }
));

// exports.register = function(req, res) {
//   var newUser = {
//     username: req.body.username,
//     password: req.body.password,
//     email: req.body.email
//   };
//   var responseMsg = {};

//   findUser(newUser.username, newUser.password, function(user) {
//     if (!!user.username) {
//       responseMsg.result = false;
//       responseMsg.message = 'Username and/or Password already Exists';
//       res.json(response);
//     } else {
//       generateUser(newUser, responseMsg, res);
//     }
//   });
// };

var generateUser = function(newUser, responseMsg, res) {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) {
      console.log('Bcrypt Error:', err);
    } else {
      bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        User.save(newUser).success(function() {
          responseMsg.result = true;
          responseMsg.message = 'User successfully Created';
          res.json(responseMsg);
        });
      });
    }
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

