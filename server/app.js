var express = require('express');
var apiRouter = require('./routes').apiRouter;
var authRouter = require('./routes').authRouter;
// var passport = require('passport');
var bodyParser = require('body-parser');
var port = process.env.PORT || 5000;
var app = express();

// app.use(express.cookieParser());
// app.use(express.bodyParser());
// app.use(express.session({ secret: 'SECRET' }));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(__dirname + '/../client'));


var apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRouter(apiRoutes);

var authRoutes = express.Router();
app.use('/auth', authRoutes)
authRouter(authRoutes);

console.log('Listening on Port:', port);
app.listen(port);