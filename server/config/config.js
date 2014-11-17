/*jslint node: true */
module.exports = {
  images: '/public/profileImages/',
  port: process.env.PORT || 5000,
  database: process.env.DB_NAME || 'tipzip', 
  username: process.env.DB_USER || 'df', 
  password: process.env.DB_PASSWORD || 'myPassword',
  host: process.env.DB_HOST ||'localhost',
  db_port: 5432,
  dialect: 'postgres',
  native: true
};