/*jslint node: true */
/* jshint -W098 */
/**
* @module dbHelpers
*/
var sequelize = require('./db').sequelize;
var Vendor = require('./db').Vendor;
var User = require('./db').User;

/**
* Finds a user in the database based on username or email.
* @function findUser
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.findUser = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(callback);
};

/**
* Finds a vendor in the database based on username or email and returns all data on vendor.
* @function findVendor
* @memberof module:dbHelpers
* @instance
* @param {object} vendor Object containing vendor searching parameters.
* @param {string} vendor.username (Optional if searching by email) Username of the vendor your searching for.
* @param {string} vendor.email (Optional if searching by username) Email of the vendor your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.findVendor = function(vendor, callback) {
  var user = {
    username: vendor.username,
    email: vendor.email || vendor.username
  };
  exports.findUser(user, function(user) {
    Vendor.find({
      where: { UserId: user.id },
    }).then(callback);
  });
};

/**
* Finds a vendor in the database based on username or email and returns public data.
* @function findOne
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.findOne = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email }),
    attributes: ['username'],
    include: {
      model: Vendor, 
      attributes: [
        'image',
        'description',
        'status',
        'latitude',
        'longitude',
        'createdAt'
      ]
    }
  }).then(callback);
};

/**
* Finds all vendors in the database.
* @function findAll
* @memberof module:dbHelpers
* @instance
* @param {function} callback Function to be executed on results of the query. 
*/
exports.findAll = function(callback) {
  User.findAll({
    attributes: ['username'],
    include: {
      model: Vendor, 
      attributes: [
        'image',
        'description',
        'status',
        'latitude',
        'longitude',
        'createdAt'
      ]
    }
  }).then(callback);
};