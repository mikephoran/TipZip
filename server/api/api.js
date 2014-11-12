/*jslint node: true */
/* jshint -W098 */
var helpers = require('../db/helpers');
var Vendor = require('../db/db').Vendor;
var multipart = require('connect-multiparty');
var _ = require('lodash');

// need to handle being able to add a photo "before" user finishes registration process
exports.photo = function (req, res) {
  var fileName = req.files.file.path.split('/');
  fileName = fileName[fileName.length - 1];

  var changes = {
    image: fileName
  };
  var vendor = {
    username: req.user,
    email: req.user
  };
  helpers.findVendor(vendor, function(vendor) {
    vendor.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: {
          imagePath: fileName
        }
      }); 
    });
  });
};

exports.add = function(req, res) {
  helpers.findUser({username: req.user}, function(user) {
    Vendor.build({
      // image: '',
      description: req.body.description,
      status: false,
      UserId: user.id
    })
    .save()
    .complete(function(err) {
      if (err) {
        console.log('Error:', err);
      }
    });
  });
};

exports.findOne = function(req, res) {
  var user = {
    username: req.params.vendor,
    email: req.params.vendor
  };
  helpers.findOne(user, function(vendor) {
    res.json({
      success: true, 
      result: vendor || []
    });
  });
};

exports.findAll = function(req, res) {
  helpers.findAll(function(vendors) {
    res.json({
      success: true,
      result: vendors
    });
  });
};

exports.updateVendor = function(req, res) {
  var changes = req.body;
  var vendor = {
    username: req.user, //|| 'ravendano',
    email: req.user //|| 'ravendano'
  };
  helpers.findVendor(vendor, function(vendor) {
    vendor.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: vendor
      });
    });
  });
};