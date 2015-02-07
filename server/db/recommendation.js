var User = require('./db').User;
var Vendor = require('./db').Vendor;
var Rating = require('./db').Rating;
var sequelize = require('./db').sequelize;

var rec = null;

/**
* Calculate recommended Vendors based on User's ratings. 
* @function findRecommendation
* @memberof module:recommendation
* @instance
* @param {number} [requestedUser] UserId of User to find recommendations for
* @param {function} [callback] callback function to be executed on array of recommended Vendors
*/
var findRecommendation = exports.findRecommendation = function(requestedUser, callback) {

  var closestUser = null;
  
  //Find all Ratings for the requestedUser and order by VendorID (lowest to highest)
  Rating.findAll({
    where: {UserId:requestedUser},
    order: '"VendorId"'
  })
  .success(function(requestedUser_ratings) {
    //If requestedUser has less than 3 total ratings, then not enough ratings to make recommendation.
    //Stop algorithm and pass "null" recommendations to callback
    if (requestedUser_ratings.length < 3) {
      closestUser = null;
      rec = null;
      console.log('\n User has less than 3 ratings! \n', 'users ratings:', requestedUser_ratings)
      if(callback){
        callback(rec);
      }
      return; 
    }
    
    var vendors = [];
    var ratings = [];
    
    //If requestedUser has more than 3 total ratings, then for each rating save the VendorID and Rating in parallel arrays.
    for (var i=0; i<requestedUser_ratings.length; i++) {
      vendors.push(requestedUser_ratings[i].VendorId)
      ratings.push(requestedUser_ratings[i].rating);
    }
    
    //Create reference object that contains RequestedUser ID and Ratings of first 3 vendors.
    var userinfo = {User: requestedUser, Vendor1: ratings[0], Vendor2: ratings[1], Vendor3: ratings[2]};

    console.log('vendor0', vendors[0], 'vendor1', vendors[1], 'vendor2', vendors[2]);
    
    //Find all ratings of first 3 Vendors and order first by UserID, then by VendorID
    //Example query return: User1: Vendor1review, User1: Vendor2review, User1: Vendor3review, User2:Vendor1Review, etc.
    Rating.findAll({
      where: {VendorId: [vendors[0], vendors[1], vendors[2]]},
      order: '"UserId", "VendorId"'
    }).success(function(neighbor_ratings){
      //Find Neighbor Users and ensure that each neighbor rated all 3 Vendors, not just 1 or 2 of them, i.e.:
      //For each rating, check that rating 2 ahead  is same User, if so save User and those 3 Ratings and skip 3 Ratings ahead.
      //Results array will contain object for each Neighbors that rated all 3 Vendors
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
      
      //If 0 Neighbors found: stop algorithm and pass "null" to callback
      if(result.length === 0) {
        nearestNeighbor = null;
        rec = nearestNeighbor;
        console.log('No Neighbors Found')
        if(callback){
          callback(rec);
        }
        return;
        //If 1 Neighbor found: set nearestNeighbor to that neighbor object
      } else if (result.length === 1 ) {
        console.log("Only found 1", result);
        nearestNeighbor = result[0];
      } else {
        //If 2+ Neighbors found: set nearestNeighbor to neighbor with MOST SIMILAR ratings to requested User
        nearestNeighbor = findMostSimilar(userinfo, result);
      }
      //Find NearestNeighbor, and return in descending order all ratings greater than 3 of the 3 vendors
      Rating.findAll({
        where: sequelize.and({UserId: nearestNeighbor.User}, {rating: {gt: 3}}, {VendorId: {ne: vendors[0]}}, {VendorId: {ne: vendors[1]}}, {VendorId: {ne: vendors[2]}}),
        order: 'rating DESC'
      }).success(function(nearestNeighbor_ratings) {
        //If query brings back vendors, push the VendorID into results array. Recommend results array.
        if (nearestNeighbor_ratings.length > 0) {
          var result = [];
          for (var i=0; i<nearestNeighbor_ratings.length; i++) {
            if (vendors.indexOf(nearestNeighbor_ratings[i].dataValues.VendorId > 0)) {
              result.push(nearestNeighbor_ratings[i].dataValues.VendorId);
            }
          }
          rec = result;
        } else {
          //If query brings back no vendors (nearest neighbor did not rate any 3 vendors greater than 3), recommend null.
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
* @param {number} [traits] The number of individual traits (here: ratings) being averaged.
* @returns {number} average similarity between Requested User and Neighbor User
*/
var avgSimilarity = function (user, neighbor, traits) {
  var sum = 0;
  
  //For each vendor rating, calculate the similarity of the RequestedUser's rating to the Neighbor's rating.   Add that to sum. 
  for (var i=1; i<=traits; i++) {
    sum += calcSimilarity(user['Vendor' + i], neighbor['Vendor' + i], 5);
  }
  //Return the average similarity (sum of rating similarity scores / number of ratings)
  return sum/traits;
};

/**
* Finds Neighbor User with ratings most similar to Requested User
* @function findMostSimilar
* @instance
* @param {object} requestedUser object containing UserId and requestedUser's ratings for the 3 vendors
* @param {array} array of neighbor objects, each object contains UserID  of Neighbor and Ratings for the 3 vendors
* @returns {object} returns neighbor object of most similar neighbor
*/
var findMostSimilar = function(user, neighbors) {
  var mostSimilar = 0;
  var result = null;
  for (var i=0; i<neighbors.length; i++) {
    //For each neighbor, calculate the average similarity of their ratings. 
    var similarity = avgSimilarity(user, neighbors[i], 3);
    
    //If that similarity is greater than the previous most Similar, save that neighbor as nearest.
    if (similarity > mostSimilar) {
      mostSimilar = similarity;
      result = neighbors[i];
    }
  }
  return result;
};

// Testing the Algo with User # 4: 
// findRecommendation(4);
