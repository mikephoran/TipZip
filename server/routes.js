var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');

exports.apiRouter = function(app) {
  // app.get('/users', api.xxx)
};

exports.authRouter = function(app) {
  app.post('/login', auth.login);
  app.post('/register', auth.register);
};