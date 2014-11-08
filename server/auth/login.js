var passport = require('./auth').passport;
var LocalStrategy = require('./auth').passportLocal;
var findUser = require('./auth').findUser;

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

var checkPassword = function(user, password) {
  return new Promise(function(resolve) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) { console.log('bcrypt compare error:', err); }
      resolve(result);
    });
  });
};