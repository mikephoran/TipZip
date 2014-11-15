/*jslint node: true */
/* jshint -W098 */
/**
* @module api
*/
var helpers = require('../db/helpers');
var Vendor = require('../db/db').Vendor;
var multipart = require('connect-multiparty');
var _ = require('lodash');


// need to handle being able to add a photo "before" user finishes registration process
/**
* Allows currently authenticated user to upload a photo to their vendor account 
* @function uploadPhoto
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.uploadPhoto = function (req, res) {
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

/**
* Allows currently authenticated user to upgrade their account to a Vendor account.
* @function addVendor
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.addVendor = function(req, res) {
  // helpers.findUser({username: 'ravendano'}, function(user) {
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

/**
* Allows a user (or vendor) to get the online status of single vendor, or themeselves.
* @function getStatus
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getStatus = function(req, res) {
  var user = {
    username: req.body.vendor || req.user,
    email: req.body.vendor || req.user
  };
  helpers.findOne(user, function(vendor) {
    res.json({
      success: true, 
      result: {
        isOnline: vendor.status
      }
    });
  });
};

/**
* Allows a user (or vendor) to grab public information for a single vendor 
* @function findOne
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.findOne = function(req, res) {
  var user = {
    username: req.params.vendor || req.user,
    email: req.params.vendor || req.user
  };
  helpers.findOne(user, function(vendor) {
    res.json({
      success: true, 
      result: vendor || []
    });
  });
};

/**
* Allows a user (or vendor) to grab public information for all vendors (Filter Constraints WIP)
* @function findAll
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.findAll = function(req, res) {
  helpers.findAll(function(vendors) {
    res.json({
      success: true,
      result: vendors
    });
  });
};
/**
* Allows currently authenticated vendor to update their vendor account information
* @function updateVendor
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
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

/**
* Allows currently authenticated user to update their user account information
* @function updateUser
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.updateUser = function(req, res) {
  var changes = _.pick(req.body,[
    'password',
    'email',
    'zipcode',
    'displayname'
  ]);

  var user = {
    username: req.user,
    email: req.user
  };

  helpers.findUser(user, function(user) {
    user.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: user
      });
    });
  });
};