var Sequelize = require('sequelize')
  , sequelize = new Sequelize('tipzip', 'df', 'myPassword', {
      dialect: "postgres", 
      port:    5432, 
    })
 
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  })


//Define Models
//Sequelize automatically adds columns 'id', 'createAt', 'updatedAt'

//User Model
var User = sequelize.define('User', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  email: Sequelize.STRING,
  zipcode: Sequelize.STRING,
  age: Sequelize.INTEGER,
});

//Vendor Model
var Vendor = sequelize.define('Vendor', {
 // type: 
 // image: 
  description: Sequelize.STRING,
  //location: 
  status: Sequelize.BOOLEAN,
  total_tip: Sequelize.DECIMAL
});

//User and Vendor have 1-1 Relationship
User.hasOne(Vendor);  
Vendor.belongsTo(User);

//Tip Model
var Tip = sequelize.define('Tip', {
  amount: Sequelize.DECIMAL,
  location: Sequelize.STRING
});

//Tip has one User and one Vendor
User.hasMany(Tip);
Tip.belongsTo(User);
Vendor.hasMany(Tip);
Tip.belongsTo(Vendor);

//Rating Model
var Rating = sequelize.define('Rating', {
  rating: Sequelize.INTEGER,
});

//Vendor has one Rating, User has many Ratings tied to Vendors
Vendor.hasOne(Rating);
Rating.belongsTo(Vendor);
User.hasMany(Rating);
Rating.belongsTo(User);

//Type Model
var Type = sequelize.define('Type', {
  name: Sequelize.STRING,
})

//Type is N:M with Users and with Vendors
Type.hasMany(User);
User.hasMany(Type);
Type.hasMany(Vendor);
Vendor.hasMany(Type);


//Synchronize the schema and create tables
sequelize
//'force: true' removes existing tables and re-create them
  .sync({ force: true })
  .complete(function(err) {
     if (!!err) {
       console.log('An error occurred while creating the table:', err)
     } else {
       console.log('It worked!')
     }
  })