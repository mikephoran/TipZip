var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Type = require('./db').Type;
var Rating = require('./db').Rating;
var TypesVendors = require('./db').TypesVendors;
var TypesUsers = require('./db').TypesUsers;

var rec = null;

var UsersWithSameReviews = function(requestedUser) {

  var closestUser = null;


  Rating.findAll({
    where: {UserId:requestedUser},
    order: '"VendorId"'
  })
  .success(function(ratings) {
    if (ratings.length < 3) {
      closestUser = 'You must have reviewed at least 3 Vendors!'
      return 
    }

    var top3 = ratings.slice(0,4);
    var vendor1 = top3[0].VendorId;
    var vendor2 = top3[1].VendorId;
    var vendor3 = top3[2].VendorId;
    var userinfo = {User: requestedUser, Vendor1: top3[0].rating, Vendor2: top3[1].rating, Vendor3: top3[2].rating};

    console.log('vendor1', vendor1, 'vendor2', vendor2, 'vendor3', vendor3);

    Rating.findAll({
      where: {VendorId: [vendor1, vendor2, vendor3]},
      order: '"UserId", "VendorId"'
    }).success(function(ratings){
      var result = [];
      for (var i=0; i<ratings.length; i++) {
        var aUser = ratings[i].dataValues.UserId;
        if (i+2 < ratings.length && aUser === ratings[i+2].dataValues.UserId && aUser !==requestedUser) {
          result.push({User: aUser, Vendor1: ratings[i].dataValues.rating, Vendor2: ratings[i+1].dataValues.rating, Vendor3: ratings[i+2].dataValues.rating});
          i+=3;
        } 
      }
      console.log('User Being Queried', userinfo);
      console.log('Neighbors', result);
      if(!result) {
        closestUser = 'You have not reviewed enough Vendors to make a recommendations!';
        return;
      } else if (result.length === 1 ) {
        closestUser = result[0].User;
        console.log(closestUser);
      } else {
        closestUser = findMostSimilar(userinfo, result);
        console.log(closestUser);
      }
    })
  })
};

var calcSimilarity = function(a, b, max) {
  var diff1 = max - a
  var diff2 = max - b
  var diff = Math.abs(diff2 - diff1)
  var distance = diff / max
  return 1 - distance
};

var avgSimilarity = function (user, neighbor, traits) {
  var sum = 0;

  for (var i=1; i<=traits; i++) {
    sum += calcSimilarity(user['Vendor' + i], neighbor['Vendor' + i], 5);
  }
  return sum/traits;
};

var findMostSimilar = function(user, neighbors) {
  var mostSimilar = 0;
  var result = null;

  for (var i=0; i<neighbors.length; i++) {
    var similarity = avgSimilarity(user, neighbors[i], 3);
    
    if (similarity > mostSimilar) {
      mostSimilar = similarity;
      result = neighbors[i];
    }
  }

  return result;
};


UsersWithSameReviews(4);




