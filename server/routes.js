/*jslint node: true */
/* jshint -W098 */
var helpers = require('./main/helpers');
var api = require('./api/api');
var auth = require('./auth/auth');
var multipart = require('connect-multiparty');
var express = require('express');
var payments = require('./payments/payments');
var config = require('./config/config');

var authenticate = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  } 
  next();
};

var upload = multipart({
  uploadDir: __dirname + '/..' + config.images
});

/* ======= ROUTER: '/api' ======= */
exports.api = function(app) {
  // app.post('/vendor/photo', authenticate, upload, api.uploadPhoto)
  // app.post('/vendor/add', authenticate, api.addVendor);
  // app.post('/vendor/update', authenticate, api.updateVendor);
  // app.get('/vendor/status', authenticate, api.getStatus);
  // app.get('/vendor/get', authenticate, api.findAll);
  // app.get('/vendor/trending', authenticate, api.findOne);
  // app.get('/vendor/:vendor', authenticate, api.findOne);

  app.post('/user/update', api.updateUser);
  app.post('/vendor/photo', upload, api.uploadPhoto)
  app.post('/vendor/add', api.addVendor);
  app.post('/vendor/update', api.updateVendor);
  app.get('/vendor/status', api.getStatus);
  app.get('/vendor/get', api.findAll);
  // app.get('/vendor/trending', api.findOne);
  app.get('/vendor/:vendor', api.findOne);

  app.post('/user/update', api.updateUser);
};

/* ======= ROUTER: '/auth' ======= */
exports.auth = function(app) {
  app.post('/login', auth.isVendor, auth.login, function(req, res) {
    console.log('Logged In:', req.user, req.session, 'type:', req.isVendor);
    res.json({user: req.user, isVendor: req.isVendor});
  });
  app.post('/logout', auth.logout, function(req, res) {
    console.log('Logged Out:', req.user, req.session);
    res.sendStatus(401);
  });
  app.post('/register', auth.register);
};

/* ======= subdomain: 'management' ======= */
exports.management = function(app) {
  var processData = require('./db/seed/populateDB').processData;
  app.use('/', express.static(__dirname + '/../management'));

  app.post('/populate', function(req, res) {
    processData(JSON.parse(req.body.type), JSON.parse(req.body.result)); 
    res.json({
      success: true, 
      result: JSON.parse(req.body.type)
    });
  });
};

exports.payments = function(app) {
  app.post('/save', authenticate, payments.save);
}