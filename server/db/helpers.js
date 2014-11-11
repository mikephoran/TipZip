/**
* @module dbHelpers
*/
var sequelize = require('./db').sequelize;
var Vendor = require('./db').Vendor;
var User = require('./db').User;

/**
* Finds a user in the database based on username or email;
* @function findUser
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Callback function to be executed on result of query. 
*/
exports.findUser = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(callback);
};


exports.findVendor = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  exports.findUser(user, function(user) {
    Vendor.find({
      where: { UserId: user.id },
    }).then(callback);
  })
};

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