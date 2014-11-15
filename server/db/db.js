/*jslint node: true */
var Sequelize = require('sequelize');
var config = require('../config/config.js');

// if (process.env.HEROKU_POSTGRESQL_GRAY_URL) {
//   var match = process.env.HEROKU_POSTGRESQL_GRAY_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
// }  else {
//   var match = 'postgres://clqelihiewknzx:mPAumcBI-kQepasSXF-VkWcoQn@ec2-54-243-51-102.compute-1.amazonaws.com:5432/d1o7guvu2hnr2n'.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
// }

// sequelize = new Sequelize(match[5], match[1], match[2], {
//   dialect: 'postgres',
//   protocol: 'postgres',
//   port: match[4],
//   host: match[3],
//   logging: true,
//   native: true
// });

//USE FOR LOCAL PG DATABASE
var isNative = false;
var connectionString = config.dialect + '://' 
                     + config.username + ':' 
                     + config.password 
                     + '@' + config.host + ':5432/' 
                     + config.database;

if(process.env.NODE_ENV){
  connection_string = process.env.DATABASE_URL;
  isNative = true;
}

var sequelize = exports.sequelize = new Sequelize(connectionString, {
  logging: console.log,
  logging: true,
  protocol: 'postgres',
  native: isNative
});


//Define Models
//Sequelize automatically adds columns 'id', 'createAt', 'updatedAt'
sequelize.authenticate()
.complete(function(err) {
  if (err) {
    console.log('Unable to connect to the database:', err);
    return;
  } 
  console.log('Connection has been established successfully.');
});

// Define Models
// Sequelize automatically adds columns 'id', 'createAt', 'updatedAt'
// User Model
var User = exports.User = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  zipcode: Sequelize.STRING,
  age: Sequelize.INTEGER,
  displayname: Sequelize.STRING,
  firstname: Sequelize.STRING,
  middlename: Sequelize.STRING,
  lastname: Sequelize.STRING
});

// Vendor Model
var Vendor = exports.Vendor = sequelize.define('Vendor', {
  image: Sequelize.STRING,
  description: {
    type: Sequelize.STRING,
    defaultValue: 'Enter a description'
  },
  status: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  totaltip: Sequelize.DECIMAL,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT
});

// User and Vendor have 1-1 Relationship
User.hasOne(Vendor);
Vendor.belongsTo(User);

User.hasMany(Vendor);
Vendor.hasMany(User);

//Credit Card Model
var CreditCard = exports.Tip = sequelize.define('Tip', {
  type: Sequelize.STRING,
  lastfour: Sequelize.INTEGER,
  address: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING,
  token: Sequelize.STRING
});

User.hasMany(CreditCard);
User.belongsTo(User);

//Bank Model
var Bank = exports.Bank = sequelize.define('Bank', {
  token: Sequelize.STRING,
  lastfour: Sequelize.INTEGER,
  address: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING
})

Vendor.hasMany(Bank);
Bank.belongsTo(Vendor);

// Tip Model
var Tip = exports.Tip = sequelize.define('Tip', {
  amount: Sequelize.DECIMAL,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT
});

// Tip has one User and one Vendor
User.hasMany(Tip);
Tip.belongsTo(User);
Vendor.hasMany(Tip);
Tip.belongsTo(Vendor);

// Rating Model
var Rating = exports.Rating = sequelize.define('Rating', {
  rating: Sequelize.INTEGER,
  review: Sequelize.TEXT
});

// Vendor has one Rating, User has many Ratings tied to Vendors
Vendor.hasOne(Rating);
Rating.belongsTo(Vendor);
User.hasMany(Rating);
Rating.belongsTo(User);

// Type Model
var Type = exports.Type = sequelize.define('Type', {
  type: Sequelize.STRING
});

// Type is N:M with Users and with Vendors
var TypesUsers = exports.TypesUsers = sequelize.define('TypesUser', {});
Type.hasMany(User, {through: TypesUsers});
User.hasMany(Type, {through: TypesUsers});

var TypesVendors = exports.TypesVendors = sequelize.define('TypesVendor', {});
Type.hasMany(Vendor, {through: TypesVendors});
Vendor.hasMany(Type, {through: TypesVendors});

// Vendor Group Model
var Group = exports.Group = sequelize.define('Group', {
  groupname: Sequelize.STRING
});

// Group has multiple Vendors
Group.hasMany(Vendor);
Vendor.hasMany(Group);

//Pedestrian Model
var Pedestrian = exports.Pedestrian = sequelize.define('pedestrianvolume',{
  mainroute: Sequelize.STRING,
  sideroute: Sequelize.STRING,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  pedestrianvol8hr: Sequelize.STRING,
  pedestrianvol24hr: Sequelize.STRING
});

// Synchronize the schema and create tables
// 'force: true' removes existing tables and re-create them
sequelize.sync({ force: true })
.complete(function(err) {
   if (err) {
     console.log('An error occurred while creating the table:', err);
     return;
   } 
   console.log('It worked!');
});