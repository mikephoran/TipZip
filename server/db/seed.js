var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Type = require('./db').Type;
var sequelize = require('./db').sequelize;

// var toronotoZips =  ["M4B 1B3", "M4B 1B4", "M4B 1B5", "M4B, 1B6", "M4B 1B7", "M4B 1B8",
// "M4B 1C3", "M4B 1C4", "M4B 1C5", "M4B 1C6", "M4B 1C7", "M4B 1C8", "M4B 1C9", "M4B 1E1",
// "M4B 1E7", "M4B 1E8", "M4B 1E9", "M4B 1G1"];

var images = {
  Art:  '',
  Music: '',
  Performance: '',
  Food: '',
  Goods: '',
  FarmersMarket: ''
};

var SeedTypes = exports.SeedTypes = function() {
  console.log('SEEDING THE TYPE!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  var types = ['Art', 'Music', 'Perfomance', 'Food', 'Goods', 'Farmers Market'];
  for (var i=0; i<types.length; i++) {
    Type.build({
      type: types[i]
    })
    .save()
    .complete(function(err) {
      console.log('Error:', err);
    });
  } 
}

var addVendor = exports.addVendor = function(name, lat, long, zip, type, totaltip, pass, email, age, image, desc) {
  
  //set defaults for User Properties. Name and Zip should not be allowed to default though.
  name = name || 'test';
  name = name.split(' ').join('');
  pass = pass || 'test';
  zip = zip || "M4B 1B3";
  email = email || name + '@test.com'
  age = age || Math.floor(Math.random()*60 + 18);
  
  //set defaults for Vendor Properties. Long, Lat and Type should not be allowed to default though.
  long = long || 43.661165;
  lat = lat || -79.390919;
  type = type || 'Food';
  totaltip = totaltip || 0;
  image = image || images[type];
  desc = desc || "Enter a Description";

  User
  .findOrCreate({
    where: {
      username: name
    }
  }, { defaults: {
    username: name, 
    password: pass, 
    email: email, 
    zip: zip, 
    age: age
  }
  })
  .success(function(user, created) {
    var userid = user.values.id
    Vendor
    .findOrCreate({where: {UserId: userid}}, {
      UserId: userid, 
      latitude: lat, 
      longitude: long, 
      type: type, 
      totaltip: 
      totaltip, 
      image: image, 
      description: desc})
    .success(function(user, created) {
      return userid;
    }) 
  })
}


//Begin Seeding!
setTimeout(SeedTypes, 5000);
setTimeout(addVendor, 5000);

