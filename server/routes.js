var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');

exports.apiRouter = function(app) {
  app.post('/vendor/add', api.add);
  app.post('/vendor/update', api.update);
  app.get('/vendors', api.getAll);
  app.get('/vendor/:vendor', api.getOne);
};

exports.authRouter = function(app) {
  app.post('/login', auth.login);
  app.post('/register', auth.register);
};