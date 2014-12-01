var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Rating = require('./db').Rating;
var sequelize = require('./db').sequelize;

var rec = null;

var findRecommendation = exports.findRecommendation = function(requestedUser, callback) {

  var closestUser = null;

  Rating.findAll({
    where: {UserId:requestedUser},
    order: '"VendorId"'
  })
  .success(function(requestedUser_ratings) {
    if (requestedUser_ratings.length < 3) {
      closestUser = null;
      rec = null;
      console.log('\n You need to review more vendors to receive a recommendation! \n')
      if(callback){
        callback(rec);
      }
      return; 
    }
    var vendors = [];
    var ratings = [];

    for (var i=0; i<requestedUser_ratings.length; i++) {
      vendors.push(requestedUser_ratings[i].VendorId)
      ratings.push(requestedUser_ratings[i].rating);
    }

    var userinfo = {User: requestedUser, Vendor1: vendors[0], Vendor2: vendors[1], Vendor3: vendors[2]};

    console.log('vendor0', vendors[0], 'vendor1', vendors[1], 'vendor2', vendors[2]);

    Rating.findAll({
      where: {VendorId: [vendors[0], vendors[1], vendors[2]]},
      order: '"UserId", "VendorId"'
    }).success(function(neighbor_ratings){
      var result = [];
      for (var i=0; i<neighbor_ratings.length; i++) {
        var aUser = neighbor_ratings[i].dataValues.UserId;
        if (i+2 < neighbor_ratings.length && aUser === neighbor_ratings[i+2].dataValues.UserId && aUser !==requestedUser) {
          result.push({User: aUser, Vendor1: neighbor_ratings[i].dataValues.rating, Vendor2: neighbor_ratings[i+1].dataValues.rating, Vendor3: neighbor_ratings[i+2].dataValues.rating});
          i+=3;
        } 
      }
      console.log('User Being Queried', userinfo);
      console.log('Neighbors', result);
      if(result.length === 0) {
        nearestNeighbor = null;
        rec = nearestNeighbor;
        console.log('No Neighbors Found')
        if(callback){
          callback(rec);
        }
        return;
      } else if (result.length === 1 ) {
        console.log("Only found 1", result);
        nearestNeighbor = result[0];
      } else {
        nearestNeighbor = findMostSimilar(userinfo, result);
      }
      Rating.findAll({
        where: sequelize.and({UserId: nearestNeighbor.User}, {rating: {gt: 3}}, {VendorId: {ne: vendors[0]}}, {VendorId: {ne: vendors[1]}}, {VendorId: {ne: vendors[2]}}),
        order: 'rating DESC'
      }).success(function(nearestNeighbor_ratings) {
        if (nearestNeighbor_ratings.length > 0) {
          var result = [];
          for (var i=0; i<nearestNeighbor_ratings.length; i++) {
            if (vendors.indexOf(nearestNeighbor_ratings[i].dataValues.VendorId > 0)) {
              result.push(nearestNeighbor_ratings[i].dataValues.VendorId);
            }
          }
          rec = result;
        } else {
          rec = null;
        }
        console.log('\n RECOMMENDED VENDORS: ', rec, '\n');
        if (callback) {
          callback(rec);
        }
      })
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

// Testing the Algo with User # 4: 
// findRecommendation(4);
