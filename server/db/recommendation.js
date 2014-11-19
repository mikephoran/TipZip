var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Rating = require('./db').Rating;
var sequelize = require('./db').sequelize;

var rec = null;

var findRecommendation = function(requestedUser) {

  var closestUser = null;

  Rating.findAll({
    where: {UserId:requestedUser},
    order: '"VendorId"'
  })
  .success(function(ratings) {
    if (ratings.length < 3) {
      closestUser = null;
      rec = null;
      console.log('\n You need to review more vendors to receive a recommendation! \n')
      return 
    }

    var vendors = {};
   
    for (var i=0; i<ratings.length; i++) {
      vendors["vendor"+i] = [ratings[i].VendorId, ratings[i].rating];
    }

    var userinfo = {User: requestedUser, Vendor1: vendors.vendor0[1], Vendor2: vendors.vendor1[1], Vendor3: vendors.vendor2[1]};

    console.log('vendor0', vendors.vendor0[0], 'vendor1', vendors.vendor1[0], 'vendor2', vendors.vendor2[0]);

    Rating.findAll({
      where: {VendorId: [vendors.vendor0[0], vendors.vendor1[0], vendors.vendor2[0]]},
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
      if(result.length === 0) {
        closestUser = null;
        rec = closestUser;
        console.log('No Neighbors Found')
        return;
      } else if (result.length === 1 ) {
        closestUser = result[0].User;
      } else {
        closestUser = findMostSimilar(userinfo, result);
      }
      Rating.findAll({
        where: sequelize.and({UserId: closestUser.User}, {rating: {gt: 3}}, {VendorId: {ne: vendors.vendor0[0]}}, {VendorId: {ne: vendors.vendor1[0]}}, {VendorId: {ne: vendors.vendor2[0]}}),
        order: 'rating DESC'
      }).success(function(ratings) {
        if (ratings.length > 0) {
          var result = [];
          for (var i=0; i<ratings.length; i++) {
            result.push(ratings[i].dataValues.VendorId);
          }
          rec = result;
        } else {
          rec = null;
        }
        console.log('\n RECOMMENDED VENDORS: ', rec, '\n');
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






