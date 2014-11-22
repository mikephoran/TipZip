var stripe = require("stripe")("sk_test_bfysqcVCJmCs7UChBjpZQM4r");
var helpers = require('../db/helpers');
var BPromise = require('bluebird');
var _ = require('lodash');
var Tip = require('../db/db').Tip;

exports.saveCard = function(req, res) {
  var token = req.body.token;
  getOrCreateCustomer(req.user)
  .then(function(stripeCustId) {
    saveCard(stripeCustId, token).then(function(card) {
      console.log('Save Card Success:', card);
      res.json({success: true, result: 'Save Card Success!'});
    });
  })
  .catch(function(err) {
    console.log('Save Card Error:', err);
    res.json({success: false, result: 'Save Card Failure'});
  });
};

exports.getCards = function(req, res) {
  getOrCreateCustomer(req.user).then(function(stripeCustId) {
    getCards(stripeCustId)
    .then(function(cards) {
      console.log('Get Card Success:', cards);
      res.json({success: true, data: cards, result: 'Get Card Success!'});
    })
    .catch(function(err) {
      console.log('Get Card Error:', err);
      res.json({success: false, result: 'Get Card Failure'});
    });
  });
};

exports.sendTip = function(req, res) {
  var details = _.pick(req.body, [
    'amount',
    'currency',
    'card',
    'vendor'
  ]);
  helpers.findVendor({username:details.vendor}, function(vendor) {
    if (!vendor.stripe) {
      res.json({success: false, result: 'Invalid Vendor'});
      return;
    }
    chargeCard(details).then(function(err, charge) {
      if (err) {
        console.log('Invalid Payment:', err);
        res.json({success: false, result: 'Payment Failure'});
        return;
      }
    });
  });
};

var getOrCreateCustomer = function(user) {
  return new BPromise(function(resolve) {
    helpers.getPersonal({username: user}, function(user) {
      if (user.stripe) {
        resolve(user.stripe);
        return;
      }
      var cust = {
        description: user.id,
        email: user.email
      };
      stripe.customers.create(cust, function(err, customer) {
        user.updateAttributes({stripe: customer.id}).success(function() {
          resolve(customer.id);
        });
      });
    });
  });
};

var saveCard = function(stripeCustId, cardToken) {
  return new BPromise(function(resolve, reject) {
    stripe.customers.createCard(stripeCustId, {card: cardToken}, function(err, card) {
      if (err) {
        reject(err);
        return;
      }
      resolve(card);
    });
  });
};

var getCards = function(stripeCustId) {
  return new BPromise(function(resolve, reject) {
    stripe.customers.listCards(stripeCustId, function(err, cards) {
      if (err) {
        reject(err);
        return;
      }
      var credit_cards = cards.map(function(card) {
        return _.pick(card, [
          'id',
          'brand',
          'last4'
        ]);
      });
      resolve(credit_cards);
    });
  });
};

var chargeCard = function(details) {
  return new BPromise(function(resolve, reject) {
    var payment = {
      amount: details.amount,
      currency: details.currency,
      card: details.card,
      description: 'tip for ' + details.vendor
    };
    stripe.charges.create(payment, function(err, charge) {
      if (err) {
        console.log('Payment Error:', err);
        reject(err);
        return;
      }
      console.log('Payment Success!:', charge);
      resolve(charge);
    });
  });
};