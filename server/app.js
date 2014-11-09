var express = require('express');
var apiRouter = require('./routes').apiRouter;
var authRouter = require('./routes').authRouter;
var passport = require('passport');
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var port = require('./config/config').port;
var app = express();
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10
};

app.use(function(req, res, next) {
  res.header(defaultCorsHeaders);
  next();
});
app.use(cookieParser());
app.use(session({ secret: 'TIPZIPWILLWIN' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(bodyParser.json());  
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/', express.static(__dirname + '/../client'));

var apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRouter(apiRoutes);

var authRoutes = express.Router();
app.use('/auth', authRoutes)
authRouter(authRoutes);

console.log('Listening on Port:', port);
app.listen(port);