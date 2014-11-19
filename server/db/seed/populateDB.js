var User = require('../db').User;
var Vendor = require('../db').Vendor;
var Type = require('../db').Type;
var Rating = require('../db').Rating;
var sequelize = require('../db').sequelize;
var TypesVendors = require('../db').TypesVendors;
var TypesUsers = require('../db').TypesUsers;
var SeedTypes = require('./seed').SeedTypes;

var typeimages = {
  Art:  '',
  Music: '',
  Performance: '',
  Food: '',
  Goods: '',
  FarmersMarket: ''
};

var truncateIndex = 0;
var truncateUser = true;

var addVendor = exports.addVendor = function(allData) {

  var type = allData.type || 'Food';

  if (type === 'Farmers Market' && truncateIndex >= 5) {
    truncateIndex = 1; 
  } else if (type === 'Farmers Market' && truncateIndex < 5) {
    truncateIndex++; 
  }

  if (type === 'Music' && truncateIndex >= 40) {
    truncateIndex = 1; 
  } else if (type === 'Music' && truncateIndex < 40) {
    truncateIndex++; 
  } 

  if (type === 'Food' && truncateIndex >= 40) {
    truncateIndex = 1; 
  } else if (type === 'Food' && truncateIndex < 40) {
    truncateIndex++; 
  } 

  if (type === 'Performance' && truncateIndex >= 10) {
    truncateIndex = 1; 
  } else if (type === 'Performance' && truncateIndex < 10) {
    truncateIndex++; 
  }

  if (type === 'Goods' && truncateIndex >= 30) {
    truncateIndex = 1; 
  } else if (type === 'Goods' && truncateIndex < 30) {
    truncateIndex++; 
  }

  if (type === 'Art' && truncateIndex >= 20) {
    truncateIndex = 1; 
  } else if (type === 'Art' && truncateIndex < 20) {
    truncateIndex++; 
  }

  //set defaults for User Properties of Vendor. 
  var displayname = type + ' Vendor ' + truncateIndex;
  var username = displayname.split(' ').join('');
  var pass = 'test';
  var zip = allData.zip || "M4B 1B3";
  var email = username.split(' ').join('') + '@test.com'
  var age = Math.floor(Math.random()*40 + 15);
  
  //set defaults for Vendor Properties of Vendor.
  var long = allData.long || 43.661165;
  var lat = allData.lat || -79.390919;
  var type = allData.type || 'Food';
  var totaltip = Math.floor(Math.random() * 50000);
  var image = typeimages[type];
  var desc = "Enter a description";

  User
  .findOrCreate({
    where: {username: username},
    defaults: {
      displayname: displayname,
      username: username, 
      password: pass, 
      email: email, 
      zipcode: zip, 
      age: age
    }
  })
  .success(function(user, created) {
    var useridofvendor = user.values.id;
    var zipofvendor = user.values.zipcode;

    Vendor
    .findOrCreate({
      where: {UserId: useridofvendor}, 
      defaults: {
        UserId: useridofvendor, 
        latitude: lat, 
        longitude: long, 
        type: type, 
        totaltip: totaltip, 
        image: image, 
        description: desc
      }
    })
    .success(function(vendor, created) {

      TypesVendors.findOrCreate({
        where: {VendorId: vendor.values.id},
        defaults: {
          VendorId: vendor.values.id,
          TypeId: SeedTypes.indexOf(type)+1
        }
      })

      if (truncateUser) {
        addTruncatedUsersAndReviews(allData, vendor, zipofvendor)
      }
      else {
        addUsersAndReviews(allData, vendor, zipofvendor)
      }

      // if (Math.random()*100 > 75) {
      //    truncateUser = false;
      //  }
      //  else {
      //   truncateUser = true;
      //  }
      // truncateUser = !truncateUser
    }) 
  })
};

var addUsersAndReviews = exports.addUser = function(allData, vendor, zipofvendor) {

  console.log('adding new Users')
  if (allData.reviews) {
    for (var i=0; i<allData.reviews.length; i++) {
      var review = allData.reviews[i];
      
      //Parse Info for Creating User
      var displayname = review.author_name;
      var username = displayname.split(' ').join('');
      
      if (username === "AGoogleUser") {
        displayname = 'A Google User ' + Math.floor(Math.random()*10);
        username = displayname.split(' ').join('');
      }

      var pass = 'test';
      var email = username + '@test.com';
      var zip = zipofvendor;
      var age = Math.floor(Math.random()*50 + 18);
      

      //Parse Info for Creating Review
      var vendorid = vendor.values.id;
      var rating = review.rating;

      User
      .findOrCreate({
        where: {username: username},
        defaults: {
          displayname: displayname,
          username: username, 
          password: pass, 
          email: email, 
          zipcode: zip, 
          age: age
        }
      })
      .success(function(user, created) {

        TypesUsers.findOrCreate({
        where: {UserId: user.values.id},
        defaults: {
          UserId: user.values.id,
          TypeId: SeedTypes.indexOf(allData.type)+1
        }
      })
        console.log('ADDING REVIEW FOR', rating, user.dataValues.id, vendorid);
        addReview(rating, user.dataValues.id, vendorid);
      })
    }
  }
};

var addTruncatedUsersAndReviews = exports.addUser = function(allData, vendor, zipofvendor) {

  console.log('Adding Truncated')

  if (allData.reviews) {
    for (var i=0; i<allData.reviews.length; i++) {
      var review = allData.reviews[i];

      sequelize.query('SELECT "UserId", COUNT(*) from "Ratings" GROUP BY "UserId" HAVING COUNT(*)<10')
      .success(function(rows) {
        var randomRow = Math.floor(Math.random()*(rows.length-1));
        var UserToMapOnto = rows[randomRow].UserId;
        var vendorid = vendor.values.id;
        var rating = review.rating;
        addReview(rating, UserToMapOnto, vendorid);

      });
    }
  }
}

var addReview = exports.addReview = function (rating, userid, vendorid) {
  
  Rating
  .findAll({
    where: {UserId: userid}
  })
  .success(function(user) {

    var nodupes = true;
    for (var i =0; i<user.length; i++) {
      console.log('DUPECHECK', user[i].dataValues.VendorId, vendorid)
      if (user[i].dataValues.VendorId === vendorid) {
        nodupes = false;
        console.log('FOUND A DUPE')
      } 
    }
    if (nodupes) {
      Rating.create({
        UserId: userid,
        VendorId: vendorid,
        rating: rating
      })
    }
  })
};

var processData = exports.processData = function(type, details) {

  var allData = {
    //vendorname: details.name,
    lat: details.geometry.location.k,
    long: details.geometry.location.B,
    zip: details.address_components[details.address_components.length-1].long_name,
    type: type,
    reviews: details.reviews
  }

  addVendor(allData);
};