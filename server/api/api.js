var helpers = require('../db/helpers');
// var User = require('../db/db').User;
var Vendor = require('../db/db').Vendor;

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
      console.log('Error:', err);
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
  })
};

exports.findAll = function(req, res) {
  helpers.findAll(function(vendors) {
    res.json({
      success: true,
      result: vendors
    });
  })
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