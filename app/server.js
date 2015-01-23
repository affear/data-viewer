var express = require('express');
var app = express();
var port = (process.argv[2] || 3000);

// app.use('/', express.static(__dirname + '/public'));
app.use('/', express.static(__dirname + '/public'));

var server = app.listen(port, function(){
	console.log('Polyphemus listening on port %d', port);
})