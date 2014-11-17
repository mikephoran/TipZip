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
        res.json({
          success: false,
          result: 'Error: Vendor profile creation unsuccessful.',
          user: req.user,
          isVendor: false
        });
        return;
      }
      res.json({
        success: true,
        result: 'Vendor Successfully Created!',
        user: req.user,
        isVendor: true
      });
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
* @function getOne
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getOne = function(req, res) {
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
* @function getAll
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getAll = function(req, res) {
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

/**
* Allows a user (or vendor) to grab all of their information
* @function getPersonal
* @memberof module:api
* @instance
* @param {object} req Request Object
* @param {object} res Response Object
*/
exports.getPersonal = function(req, res) {
  var user = {
    username: req.user,
    email: req.user
  };
  helpers.getPersonal(user, function(vendor) {
    res.json({
      success: true, 
      result: vendor || []
    });
  });
};

exports.updateVendor = function(req, res) {
  var changes = _.pick(req.body, [
    'description'
  ]);
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
  var changes = {
    displayname: req.body.displayName,
    firstname: req.body.firstName,
    middlename: req.body.middleName,
    lastname: req.body.lastName,
    email: req.body.email,
    zipcode: req.body.zipcode,
    age: req.body.age
  };
  console.log(changes);

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