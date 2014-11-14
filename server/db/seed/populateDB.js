var User = require('../db').User;
var Vendor = require('../db').Vendor;
var Type = require('../db').Type;
var Rating = require('../db').Rating;
var sequelize = require('../db').sequelize;

var typeimages = {
  Art:  '',
  Music: '',
  Performance: '',
  Food: '',
  Goods: '',
  FarmersMarket: ''
};

var addVendor = exports.addVendor = function(allData, callback) {

  //set defaults for User Properties of Vendor. Name and Zip should not be allowed to default though.
  var name = allData.vendorname || 'test';
  var name = name.split(' ').join('');
  var pass = allData.pass || 'test';
  var zip = allData.zip || "M4B 1B3";
  var email = allData.email || name + '@test.com'
  var age = allData.age || Math.floor(Math.random()*40 + 15);
  
  //set defaults for Vendor Properties of Vendor. Long, Lat and Type should not be allowed to default though.
  var long = allData.long || 43.661165;
  var lat = allData.lat || -79.390919;
  var type = allData.type || 'Food';
  var totaltip = allData.totaltip || 0;
  var image = allData.image || typeimages[type];
  var desc = allData.desc || "Enter a description";

  User
  .findOrCreate({
    where: {username: name},
    defaults: {
      username: name, 
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
      if(callback && created) {
        callback(allData, vendor, zipofvendor)
      }
    }) 
  })
};

var addUsersAndReviews = exports.addUser = function(allData, vendor, zipofvendor) {

  if (allData.reviews) {
    for (var i=0; i<allData.reviews.length; i++) {
      var review = allData.reviews[i];
      
      //Parse Info for Creating User
      var name = review.author_name.split(' ').join('');
      
      if (name === "AGoogleUser") {
      	continue;
      }

      var pass = 'test';
      var email = name + '@test.com';
      var zip = zipofvendor;
      var age = Math.floor(Math.random()*60 + 18);
      

      //Parse Info for Creating Review
      var vendorid = vendor.values.id;
      var rating = review.rating;
      //var review = review.text;

      User
      .findOrCreate({
        where: {username: name},
        defaults: {
          username: name, 
          password: pass, 
          email: email, 
          zipcode: zip, 
          age: age
        }
      })
      .success(function(user, created) {
        addReview(rating, user.values.id, vendorid);
      })
    }
  }
};

var addReview = exports.addReview = function (rating, userid, vendorid) {
  Rating
  .create({
    rating: rating,
    VendorId: vendorid,
    UserId: userid
  })
  .success(function(user){
    console.log('User and Review added succesfully!')
  })
};

var processData = exports.processData = function(type, details) {

  var allData = {
    vendorname: details.name,
    lat: details.geometry.location.k,
    long: details.geometry.location.B,
    zip: details.address_components[details.address_components.length-1].long_name,
    type: type,
    reviews: details.reviews
  }

  addVendor(allData, addUsersAndReviews);
};