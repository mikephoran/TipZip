var User = require('../db').User;
var Vendor = require('../db').Vendor;
var Rating = require('../db').Rating;
var sequelize = require('../db').sequelize;


var truncateIndex = 0;
var truncateUser = true;

var addVendor = exports.addVendor = function(allData) {

  var category = allData.category || 'Food';

  if (category === 'Farmers Market' && truncateIndex >= 5) {
    truncateIndex = 1; 
  } else if (category === 'Farmers Market' && truncateIndex < 5) {
    truncateIndex++; 
  }

  if (category === 'Music' && truncateIndex >= 20) {
    truncateIndex = 1; 
  } else if (category === 'Music' && truncateIndex < 20) {
    truncateIndex++; 
  } 

  if (category === 'Food' && truncateIndex >= 20) {
    truncateIndex = 1; 
  } else if (category === 'Food' && truncateIndex < 20) {
    truncateIndex++; 
  } 

  if (category === 'Performance' && truncateIndex >= 10) {
    truncateIndex = 1; 
  } else if (category === 'Performance' && truncateIndex < 10) {
    truncateIndex++; 
  }

  if (category === 'Goods' && truncateIndex >= 15) {
    truncateIndex = 1; 
  } else if (category === 'Goods' && truncateIndex < 15) {
    truncateIndex++; 
  }

  if (category === 'Art' && truncateIndex >= 10) {
    truncateIndex = 1; 
  } else if (category === 'Art' && truncateIndex < 10) {
    truncateIndex++; 
  }

  //set defaults for User Properties of Vendor. 
  var displayname = category + ' Vendor ' + truncateIndex;
  var username = displayname.split(' ').join('');
  var pass = 'test';
  var email = username.split(' ').join('') + '@test.com'
  var age = Math.floor(Math.random()*40 + 15);
  
  //set defaults for Vendor Properties of Vendor.
  var long = allData.long || 43.661165;
  var lat = allData.lat || -79.390919;
  var category = allData.category|| 'Food';
  var totaltip = Math.floor(Math.random() * 50000);
  var desc = "Enter a description";
  
  if (truncateIndex < 5) {
    var image = allData.category + truncateIndex + '.jpg';
  } else {
    var image = allData.category + (Math.floor(Math.random()*4)+1) + '.jpg';
  }

  User
  .findOrCreate({
    where: {username: username},
    defaults: {
      displayname: displayname,
      username: username, 
      password: pass, 
      email: email,  
      age: age
    }
  })
  .success(function(user, created) {
    var useridofvendor = user.values.id;

    Vendor
    .findOrCreate({
      where: {UserId: useridofvendor}, 
      defaults: {
        UserId: useridofvendor, 
        latitude: lat, 
        longitude: long, 
        category: category, 
        totaltip: totaltip, 
        description: desc,
        image: image
      }
    })
    .success(function(vendor, created) {

      if (truncateUser) {
        addTruncatedUsersAndReviews(allData, vendor)
      }
      else {
        addUsersAndReviews(allData, vendor)
      }

      // truncateUser = !truncateUser
    
    }) 
  })
};

var addUsersAndReviews = exports.addUser = function(allData, vendor) {

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
          age: age
        }
      })
      .success(function(user, created) {
        console.log('ADDING REVIEW FOR', rating, user.dataValues.id, vendorid);
        addReview(rating, user.dataValues.id, vendorid);
      })
    }
  }
};

var addTruncatedUsersAndReviews = exports.addUser = function(allData, vendor) {

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

var processData = exports.processData = function(category, details) {

  var allData = {
    //vendorname: details.name,
    lat: details.geometry.location.k,
    long: details.geometry.location.B,
    category: category,
    reviews: details.reviews
  }

  addVendor(allData);
};