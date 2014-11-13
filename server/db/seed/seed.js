var User = require('../db').User;
var Vendor = require('../db').Vendor;
var Type = require('../db').Type;
var Rating = require('../db').Rating;
var sequelize = require('../db').sequelize;

var SeedTypes = exports.SeedTypes = function() {
  console.log('Seeding Types')
  var types = ['Art', 'Music', 'Perfomance', 'Food', 'Goods', 'Farmers Market'];
  for (var i=0; i<types.length; i++) {
    Type.build({
      type: types[i]
    })
    .save()
    .complete(function(err) {
      if (!err) {
        console.log('Sucessfully added Type to Database');
      } else {
        console.log('Error:', err)
      }
    });
  } 
}

//Begin Seeding!
setTimeout(SeedTypes, 5000);



