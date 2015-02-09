var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Rating = require('./db').Rating;
var sequelize = require('./db').sequelize;

/**
* Calculate recommended Vendors for requested User based on User's rating history
* @function findRecommendation
* @memberof module:recommendation
* @instance
* @param {number} [requestedUser] UserId of User to find recommendations for
* @param {function} [callback] callback function to be executed on array of recommended Vendors
*/
var findRecommendation = exports.findRecommendation = function(requestedUser, callback, precision) {
    
  //Find all Ratings for the requestedUser and order by VendorID (lowest to highest)
  Rating.findAll({
    where: {UserId:requestedUser},
    order: '"VendorId"'
  })
  .success(function(requestedUser_ratings) {
    
    precision = precision || requestedUser_ratings.length;
      console.log('Finding Recommendation at precision level: ', precision);
    
    //If precision is less than 1, end algorithm, no recommendations can be made.
    if (precision < 1) {
      console.log('\n Line 31: FAILURE EXIT CONDITION MET: \n', 'users ratings: ', requestedUser_ratings)
      if(callback){
        callback(null);
      }
      return; 
    }
    
    var vendors = [];
    var ratings = [];
    
    //If precision greater than 1, then for each rating (up to precision #) save the VendorID and Rating in parallel arrays.
    for (var i=0; i<precision; i++) {
      vendors.push(requestedUser_ratings[i].VendorId)
      ratings.push(requestedUser_ratings[i].rating);
    }
    
    //Create reference object that contains RequestedUser ID and Ratings of vendors
    console.log('Creating RequestedUser Info for Precision Level: ', precision);
    var userinfo = {User: requestedUser};
    vendors.forEach(function(vendor, i) {
      userinfo["vendor" + i] = ratings[i];
      console.log('RequestedUser #' + userinfo.User + ' gave vendorId# ' + vendors[i] + ' a rating of ' + userinfo['vendor'+i]);
    })

    //Find all ratings of each vendor and order first by UserID, then by VendorID
    //Example query return: User1: Vendor1review, User1: Vendor2review, User1: Vendor3review, User2:Vendor1Review, etc.
    Rating.findAll({
      where: {VendorId: vendors},
      order: '"UserId", "VendorId"'
    }).success(function(neighbor_ratings){
      //Find Neighbor Users and ensure that each neighbor rated all vendors, not just a subset, i.e.:
      //For each rating, check that the rating [precision#-1] is same User, this means User rated all vendors
      var result = [];
      for (var i=0; i<neighbor_ratings.length; i++) {
        var aUser = neighbor_ratings[i].dataValues.UserId;
        if (i+(precision-1) < neighbor_ratings.length && aUser === neighbor_ratings[i+(precision-1)].dataValues.UserId && aUser !==requestedUser) {
          var neighbor = {User: aUser};
          vendors.forEach(function(vendor, j) {
            neighbor['vendor'+j] = neighbor_ratings[i+j].dataValues.rating;
          })
          result.push(neighbor);
          i+=(precision-1);
        }
      }
      console.log('User Being Queried: ', userinfo);
      console.log('Neighbors found: ', result);
      
      //If 0 Neighbors found: rerun with less precision
      if(result.length === 0) {
        console.log('Recurse at Line 80: No neighbor found with ratings for all vendors')
        findRecommendation(requestedUser, callback, precision-1);
        return;
        //If 1 Neighbor found: set nearestNeighbor to that neighbor object
      } else if (result.length === 1 ) {
        console.log("Found exactly 1 neighbor: ", result);
        nearestNeighbor = result[0];
      } else {
        //If 2+ Neighbors found: set nearestNeighbor to neighbor with MOST SIMILAR ratings to requested User
        nearestNeighbor = findMostSimilar(userinfo, result, precision);
        console.log('Nearest Neighbor Calculated: ', nearestNeighbor);
      }
      //Find NearestNeighbor, and return all ratings of Vendors not already reviewed by Requested User greater than 3 
      console.log('Determining if Nearest Neighbor had a useful review')
      Rating.findAll({
        where: sequelize.and({UserId: nearestNeighbor.User}, {rating: {gt: 3}}),
        order: 'rating DESC'
      }).success(function(nearestNeighbor_ratings) {
        var result = [];
        nearestNeighbor_ratings.forEach(function(rating) {
          console.log(rating.dataValues)
          if (vendors.indexOf(rating.dataValues.VendorId) < 0) {
            result.push(rating.dataValues.VendorId);
          }
          console.log('Result: ', result)  
        });
        if (result.length>0) {
          if (callback) { 
            console.log('\n Line 104: SUCCESS EXIT CONDITION MET')
            callback(result);
            return
          }
        } else {
          console.log('Recurse at Line 110: NearestNeighbor did not have a useful review')
          findRecommendation(requestedUser, callback, precision-1);
          return;
        }
      })
    })
  })
};

/**
* Calculates the similarity between two ratings (a & b) based on the max possible rating
* @function calcSimilarity
* @instance
* @param {number} [a] A rating of a vendor (presumably the rating given by the Requested User)
* @param {number} [b] A second rating of that same Vendor (presumably the rating given by a Neighbor)
* @param {number} [max] The max rating possible (here ratings up to 5, so max is 5)
* @returns {number} The similarity between the two ratings normalized to 1. Perfect similarity = 1, No Similarity = 0.
*/
var calcSimilarity = function(a, b, max) {
  var diff1 = max - a
  var diff2 = max - b
  var diff = Math.abs(diff2 - diff1)
  var distance = diff / max
  return 1 - distance
};

/**
* Finds average similarity between a Requested User and a Neighbor User
* @function avgSimilarity
* @instance
* @param {object} [user] Requested User object containing UserId and ratings for the 3 vendors
* @param {object} [neighbor] Neighbor User object, containing UserID and ratings for the 3 vendors
* @param {number} [precision] The number of individual ratings being averaged.
* @returns {number} average similarity between Requested User and Neighbor User
*/
var avgSimilarity = function (user, neighbor, precision) {
  var sum = 0;
  
  //For each vendor rating, calculate the similarity of the RequestedUser's rating to the Neighbor's rating.   Add that to sum. 
  for (var i=0; i<precision; i++) {
    sum += calcSimilarity(user['vendor' + i], neighbor['vendor' + i], 5);
  }
  //Return the average similarity (sum of rating similarity scores / number of ratings)
  return sum/precision;
};

/**
* Finds Neighbor User with ratings most similar to Requested User
* @function findMostSimilar
* @instance
* @param {object} requestedUser object containing UserId and requestedUser's ratings for the 3 vendors
* @param {array} array of neighbor objects, each object contains UserID  of Neighbor and Ratings for the 3 vendors
* @returns {object} returns neighbor object of most similar neighbor
*/
var findMostSimilar = function(user, neighbors, precision) {
  var mostSimilar = 0;
  var result = null;
  for (var i=0; i<neighbors.length; i++) {
    //For each neighbor, calculate the average similarity of their ratings. 
    var similarity = avgSimilarity(user, neighbors[i], precision);
    
    //If that similarity is greater than the previous most Similar, save that neighbor as nearest.
    if (similarity > mostSimilar) {
      mostSimilar = similarity;
      result = neighbors[i];
    }
  }
  return result;
};

// Testing the Algo with User # 4: 
setTimeout(findRecommendation.bind(this,5, function(result) { console.log('RECOMMENDATIONS:' + result)}), 2000);
