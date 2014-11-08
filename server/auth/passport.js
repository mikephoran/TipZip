var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passport = exports.passport = require('passport');

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

var AuthController = {
  login: passport.authenticate('local', {
    successRedirect: '/auth/login/success',
    failureRedirect: '/auth/login/failure'
  }),

  loginSuccess: function(req, res){
    res.json({
      success: true,
      user: req.session.passport.user
    });
  },

  loginFailure: function(req, res){
    res.json({
      success:false,
      message: 'Invalid username or password.'
    });
  },

  logout: function(req, res){
    req.logout();
    res.end();
  },
};

var checkPassword = function(user, password) {
  return new Promise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) { console.log('bcrypt compare error:', err); }
      resolve(result);
    });
  });
}