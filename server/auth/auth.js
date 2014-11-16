/*jslint node: true */
/**
* @module auth
*/
exports.login = require('./login').login;
exports.isVendor = require('./login').isVendor;
exports.logout = require('./login').logout;
exports.register = require('./register');