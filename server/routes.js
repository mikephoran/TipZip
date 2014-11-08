var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');
// var authLogin = require('./auth/passport').login;

exports.apiRouter = function(app) {
  // app.get('/users', helpers.xxxxxxx)
};

exports.authRouter = function(app) {
  app.post('/login', auth.login);
  app.post('/register', auth.register);
  // app.get('/logout', auth.logout);
};