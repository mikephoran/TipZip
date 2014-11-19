/*jslint node: true */
/**
* @module auth
*/
exports.login = require('./login').login;
exports.isVendor = require('./login').isVendor;
exports.logout = require('./login').logout;
exports.register = require('./register').register;
exports.changePassword = require('./register').changePassword;