var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Type = require('./db').Type;
var Rating = require('./db').Rating;
var TypesVendors = require('./db').TypesVendors;
var TypesUsers = require('./db').TypesUsers;


var UsersWithSameReviews = function(UserId) {
  
  Rating.findAll({where: {UserId:UserId}})
  .success(function(ratings) {
    var top3 = ratings.slice(0,4);
    var vendor1 = top3[0].VendorId;
    var vendor2 = top3[1].VendorId;
    var vendor3 = top3[2].VendorId;
    console.log('vendor1', vendor1, 'vendor2', vendor2, 'vendor3', vendor3);

    User.findAll({
      where: {VendorId: [vendor1, vendor2, vendor3]},
      order: 'UserId DESC'
    }).success(function(users){
      console.log(users)
    })
  })
}

UsersWithSameReviews(4);

// //select "UserId" from "Ratings" where "VendorId" = 81 AND "VendorId" = 91 AND "VendorId" = 93;

//     // User.findAll({
//     //   where: 

//     // })
//     // Rating.findAll({
//     //   group: ['"UserId"', "id"], 
//     //   where: sequelize.and({VendorId: [vendor1, vendor2, vendor3]})
//     // })
//     .success(function(results) {
//       var similarUsers = [];;

//       for (var i=0; i<results.length; i++) {
//         similarUsers.push(results[i].UserId)
//       }

//       console.log(similarUsers);
//     })


//     //sequelize.query('SELECT * from "Users", "Ratings" where "Users".id = "Ratings"."UserId" and "Ratings.VendorId = Vendor1 and Ratings.VendorId = Vendor2 and Ratings.VendorId = Vendor3')
// })
// }




