var express = require('express');
var port = process.env.PORT || 5000;
var app = express();

app.use('/', express.static(__dirname + '/../client'));

console.log('Listening on Port:', port);
app.listen(port);