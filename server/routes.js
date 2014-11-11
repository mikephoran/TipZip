var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');

var authenticate = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  } else {
    next();
  }
};

exports.apiRouter = function(app) {
  app.post('/vendor/add', authenticate, api.add);
  app.post('/vendor/update', authenticate, api.updateVendor);
  app.get('/vendor/:vendor', authenticate, api.findOne);
  app.get('/vendors', authenticate, api.findAll);
  // app.post('/vendor/add', api.add);
  // app.post('/vendor/updateVendor', api.updateVendor);
  // app.get('/vendors', api.findAll);
  // app.get('/vendor/:vendor', api.findOne);
};

exports.authRouter = function(app) {
  app.post('/login', auth.login, function(req, res) {
    console.log('Logged In:', req.user, req.session);
    res.send(req.user);
  });
  app.post('/logout', auth.logout, function(req, res) {
    console.log('Logged Out:', req.user, req.session);
    res.sendStatus(401);
  })
  app.post('/register', auth.register);
};