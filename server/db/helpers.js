/*jslint node: true */
/* jshint -W098 */
/**
* @module dbHelpers
*/
var sequelize = require('./db').sequelize;
var Vendor = require('./db').Vendor;
var User = require('./db').User;
var Rating = require('./db').Rating;
var Vendor = require('./db').Vendor;


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
* Finds a user in the database based on username or email and returns all data (vendor + personal).
* @function getPersonal
* @memberof module:dbHelpers
* @instance
* @param {object} user Object containing user searching parameters.
* @param {string} user.username (Optional if searching by email) Username of user your searching for.
* @param {string} user.email (Optional if searching by username) Email of user your searching for.
* @param {function} callback Function to be executed on result of the query. 
*/
exports.getPersonal = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email }),
    include: Vendor
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
    attributes: [
      'username',
      'displayname'
    ],
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
  Vendor.findAll({
    attributes: [
      'image',
      'description',
      'status',
      'latitude',
      'longitude',
      'createdAt'
    ],
    include: [
      {
        model: User,
        attributes: [
          'username',
          'displayname',
        ]
      },
      Rating
    ]
  }).then(function(vendors) {
    vendors = vendors.map(function(val, index) {
      val.dataValues.avgrating = val.Ratings.reduce(function(mem, val, i, col) {
        mem += val.rating;
        if (i === col.length -1) {
          mem /= col.length;
        }
        return mem;
      }, 0);
      console.log('VAL', val);
      return val;
    });
    callback(vendors)
  });
};


var addUser = function(username, password, email, latitude, longitude, zipcode, age, displayname, firstname, middlename, lastname) {
  //username, password and e-mail are required arguments

  User.create({
    username: username,
    password: password,
    email: email,
    latitude: latitude || null,
    longitude: longitude || null,
    zipcode: zipcode || null,
    age: age || null,
    displayname: displayname || null,
    firstname: firstname || null,
    middlename: middlename || null,
    lastname: lastname || null
  }).success(function(user) {
    if (latitude && longitude) {
      var qstring = 'UPDATE "Users" ' + "SET geoloc=ST_GeogFromText('SRID=4326;POINT("+ longitude + " " + latitude + ")') WHERE id="+user.dataValues.id;
      sequelize.query(qstring);
    }
  });
}

var addVendor = function(UserId, latitude, longitude, totaltip, image, description, status) {
  //UserId, Latitude and Longitude are required

  Vendor.create({
    UserId: UserId,
    latitude: latitude,
    longitude: longitude,
    image: image || null,
    description: description || null,
    status: status || false,
    totaltip: totaltip || null
  }).success(function(vendor) {
    if (latitude && longitude) {
      var qstring = 'UPDATE "Vendors" ' + "SET geoloc=ST_GeogFromText('SRID=4326;POINT("+ longitude + " " + latitude + ")') WHERE id="+vendor.dataValues.id;
      sequelize.query(qstring);
    }
  });
}

var vendorsWithinMiles = function(UserId, VendorId, miles) {
  var radius = miles*1.6*1000;
  User.find({
    attributes: 'geoloc',
    where: {UserId: UserId}
  }).success(function(UserGeo) {
    console.log(UserGeo);
    sequelize.query('SELECT geoloc FROM "Vendors" WHERE ST_DWithin(geoloc, ' + UserGeo + ', ' + radius + ')')
    .success(function(nearbyVendors) {
      console.log(nearbyVendors);
    })
  })
}

var calcDistance = function(UserId, VendorId) {
  User.find({
    attributes: 'geoloc',
    where: {UserId: UserId}
  }).success(function(UserGeo) {
    User.find({
      attributes: 'geoloc',
      where: {VendorId: VendorId}
    }).success(function(VendorGeo) {
      sequelize.query('SELECT ST_Distance(gg1, gg2) As spheroid_dist FROM (SELECT ' + UserGeo + ' As gg1, ' + VendorGeo + ' As gg2) As foo')
      .success(function(distance) {
        console.log(distance);
      })
    })
  })
}
