var stripe = require("stripe")("sk_test_bfysqcVCJmCs7UChBjpZQM4r");
var helpers = require('../db/helpers');
var BPromise = require('bluebird');
var _ = require('lodash');
var Tip = require('../db/db').Tip;

exports.saveCard = function(req, res) {
  var token = req.body.token;
  getOrCreateCustomer(req.user).then(function(cust) {
    saveCard(cust.id, token).then(function(card) {
      var newCard = _.pick(card, [
        'id',
        'brand',
        'last4'
      ]);
      newCard.defaultcard = cust.default_card ? false : true;
      
      console.log('Save Card Success:', card);
      res.json({success: true, result: 'Save Card Success!', data: newCard});
    });
  })
  .catch(function(err) {
    console.log('Save Card Error:', err);
    res.json({success: false, result: 'Save Card Failure'});
  });
};

exports.getCards = function(req, res) {
  getOrCreateCustomer(req.user).then(function(cust) {
    getCards(cust.id).then(function(cards) {
      console.log('Get Card Success:', cards);
      res.json({success: true, data: cards, result: 'Get Card Success!'});
    })
    .catch(function(err) {
      console.log('Get Card Error:', err);
      res.json({success: false, result: 'Get Card Failure'});
    });
  });
};

exports.setDefault = function(req, res) {
  var newDefault = req.body.newDefaultCard;
  helpers.getPersonal({username: req.user}, function(user) {
    getCards(user.stripe).then(function(cards) {
      var isValid = _.some(cards, function(val) {
        return val.id === newDefault;
      });
      if (isValid) {
        setDefault(user.stripe, newDefault).then(function(cust) {
          res.json({success: true, result: 'New Default Selected', defaultCard: newDefault});
        });
        return;
      }
      res.json({success: false, result: 'Default Unchanged'});
    });
  });
};
exports.sendTip = function(req, res) {
  var details = _.pick(req.body, [
    'amount',
    'currency',
    'vendor'
  ]);
  details.amount *= 100;

  helpers.findVendor({username:details.vendor}, function(vendor) {
    if (!vendor || !vendor.User.stripe) {
      console.log('Invalid Vendor:', vendor);
      res.json({success: false, result: 'Invalid Vendor'});
      return;
    }

    details.vendorid = vendor.id;
    helpers.getPersonal({username: req.user}, function(user) {
      details.from = user.id;
      details.customer = user.stripe;

      chargeCard(details).then(function(charge) {
        console.log('Payment Success!:', charge);
        res.json({success: true, result: 'Payment Success!'});
      })
      .catch(function(err) {
        console.log('Invalid Payment:', err);
        res.json({success: false, result: 'Payment Failure'});
      });
    });
  });
};

var getOrCreateCustomer = function(user) {
  return new BPromise(function(resolve) {
    helpers.getPersonal({username: user}, function(user) {
      if (user.stripe) {
        stripe.customers.retrieve(user.stripe, function(err, customer) {
          resolve(customer);
        });
        return;
      }

      var cust = {
        description: user.id,
        email: user.email
      };
      stripe.customers.create(cust, function(err, customer) {
        user.updateAttributes({stripe: customer.id}).success(function() {
          resolve(customer);
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
    stripe.customers.retrieve(stripeCustId, function(err, customer) {
      if (err) {
        reject(err);
        return;
      }
      var credit_cards = customer.cards.data.map(function(val) {
        var card = _.pick(val, [
          'id',
          'brand',
          'last4'
        ]);
        card.defaultcard = card.id === customer.default_card;
        return card;
      });

      resolve(credit_cards);
    });
  });
};

var setDefault = function(stripeCustId, cardId) {
  var newDefault = {
    default_card: cardId
  };
  return new BPromise(function(resolve, reject) {
    stripe.customers.update(stripeCustId, newDefault, function(err, customer) {
      if (err) {
        console.log('New Default Failure!:', err);
        reject(err);
        return;
      }
      console.log('New Default Success!');
      resolve(customer);
    });
  });
};

var chargeCard = function(details) {
  var payment = {
    amount: details.amount,
    currency: details.currency,
    customer: details.customer,
    description: 'tip for ' + details.vendor
  };
  console.log('\n\n\nPayments: \n\n', payment);
    
  return new BPromise(function(resolve, reject) {
    stripe.charges.create(payment, function(err, charge) {
      if (err) {
        console.log('Payment Error:', err);
        reject(err);
        return;
      }
      Tip.create({
        amount: payment.amount,
        paid: false,
        UserId: details.from,
        VendorId: details.vendorid
      });
      console.log('Payment Success!:', charge);
      resolve(charge);
    });
  });
};