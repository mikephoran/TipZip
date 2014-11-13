// var User = require('./db').User;
// var Vendor = require('./db').Vendor;
// var Type = require('./db').Type;
// var Rating = require('./db').Rating;
// var sequelize = require('./db').sequelize;

// var typeimages = {
//   Art:  '',
//   Music: '',
//   Performance: '',
//   Food: '',
//   Goods: '',
//   FarmersMarket: ''
// };

// var SeedTypes = exports.SeedTypes = function() {
//   console.log('Seeding Types')
//   var types = ['Art', 'Music', 'Perfomance', 'Food', 'Goods', 'Farmers Market'];
//   for (var i=0; i<types.length; i++) {
//     Type.build({
//       type: types[i]
//     })
//     .save()
//     .complete(function(err) {
//       console.log('Error:', err);
//     });
//   } 
// }

// var addVendor = exports.addVendor = function(name, lat, long, zip, type, totaltip, pass, email, age, image, desc, callback) {
//   console.log('Seeding Vendors')

//   //set defaults for User Properties. Name and Zip should not be allowed to default though.
//   name = name || 'test';
//   name = name.split(' ').join('');
//   pass = pass || 'test';
//   zip = zip || "M4B 1B3";
//   email = email || name + '@test.com'
//   age = age || Math.floor(Math.random()*60 + 18);
  
//   //set defaults for Vendor Properties. Long, Lat and Type should not be allowed to default though.
//   long = long || 43.661165;
//   lat = lat || -79.390919;
//   type = type || 'Food';
//   totaltip = totaltip || 0;
//   image = image || typeimages[type];
//   desc = desc || "Enter a Description";

//   User
//   .findOrCreate({
//     where: {username: name},
//     defaults: {
//       username: name, 
//       password: pass, 
//       email: email, 
//       zipcode: zip, 
//       age: age
//     }
//   })
//   .success(function(user, created) {
//     var userid = user.values.id
//     Vendor
//     .findOrCreate({
//       where: {UserId: userid}, 
//       defaults: {
//         UserId: userid, 
//         latitude: lat, 
//         longitude: long, 
//         type: type, 
//         totaltip: 
//         totaltip, 
//         image: image, 
//         description: desc
//       }
//     })
//     .success(function(user, created) {
//       callback(userid);
//     }) 
//   })
// };

// var addUser = exports.addUser = function(name, pass, zip, email, age, callback) {
//   console.log('Seeding Vendors')

//   //set defaults for User Properties. Name and Zip should not be allowed to default though.
//   name = name || 'test';
//   name = name.split(' ').join('');
//   pass = pass || 'test';
//   zip = zip || "M4B 1B3";
//   email = email || name + '@test.com'
//   age = age || Math.floor(Math.random()*60 + 18);

//   User
//   .findOrCreate({
//     where: {username: name},
//     defaults: {
//       username: name, 
//       password: pass, 
//       email: email, 
//       zipcode: zip, 
//       age: age
//     }
//   })
//   .success(function(user, created) {
//     callback(userid);
//   })
// };

// var addReview = exports.addReview = function (rating, userid, vendorid, callback) {
//   Rating
//   .create({
//     rating: rating,
//     VendorId: vendorid,
//     UserId: userid
//   })
//   .success(function(user){
//     callback(user)
//   })
// };

// //Need to add Algorithm for pull data and using functions

// //Begin Seeding!
// setTimeout(SeedTypes, 5000);
// setTimeout(addVendor, 5000);



