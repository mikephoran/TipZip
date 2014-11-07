var express = require('express');
var apiRouter = require('./routes').apiRouter;
var authRouter = require('./routes').authRouter;
var bodyParser = require('body-parser');
var port = process.env.PORT || 5000;
var app = express();b

app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', express.static(__dirname + '/../client'));

var apiRoutes = express.Router();
app.use('/api', apiRoutes);
apiRouter(apiRoutes);

var authRoutes = express.Router();
app.use('/auth', authRoutes)
authRouter(authRoutes);

console.log('Listening on Port:', port);
app.listen(port);