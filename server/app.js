var express = require('express');
var apiRouter = require('./routes').apiRouter;
var authRouter = require('./routes').authRouter;
var passport = require('passport');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var port = process.env.PORT || 5000;
var app = express();

app.use(cookieParser());
app.use(session({ secret: 'TIPZIPWILLWIN' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/', express.static(__dirname + '/../client'));
/*
* Fake Routes for Testing 
*/
app.get('/', function(req, res) {
  res.json({success: true, message: 'Valid Credentials!'});
});
app.get('/fail', function(req, res) {
  res.json({success: false, message: 'Invalid Credentials!'});
});
/*
* end fake routes for testing
*/ 


var apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRouter(apiRoutes);

var authRoutes = express.Router();
app.use('/auth', authRoutes)
authRouter(authRoutes);

console.log('Listening on Port:', port);
app.listen(port);