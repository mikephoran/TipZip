var User = require('../db/db').User;
var Vendor = require('../db/db').Vendor;
var sequelize = require('../db/db').sequelize;

exports.add = function(req, res) {
  findUser({username: 'ravendano'}, function(user) {
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
  })
};

exports.findOne = function(req, res) {
  var user = {
    username: req.params.vendor,
    email: req.params.vendor
  };
  findOne(user, function(vendor) {
    res.json({
      success: true, 
      result: vendor || []
    });
  })
};

exports.findAll = function(req, res) {
  findAll(function(vendors) {
    res.json({
      success: true,
      result: vendors
    });
  })
};

exports.updateVendor = function(req, res) {
  var changes = req.body;
  var vendor = {
    username: req.user,// || 'ravendano',
    email: req.user // || 'ravendano'
  };
  findVendor(vendor, function(vendor) {
    vendor.updateAttributes(changes)
    .success(function() {
      res.json({
        success: true,
        result: vendor
      });
    });
  });
};
var findUser = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  User.find({
    where: sequelize.or({ username: username }, { email: email })
  }).then(callback);
};
var findVendor = function(user, callback) {
  var username = user.username;
  var email = user.email || user.username;
  findUser(user, function(user) {
    Vendor.find({
      where: { UserId: user.id },
    }).then(callback);
  })
};

var findOne = function(user, callback) {
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

var findAll = function(callback) {
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