/* include static file web server library */
var static = require('node-static');
/*include the http server library */
var http = require('http');
/* assume running on Heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';
/* If not on Heroku, change port + dir info */
if (typeof port == 'undefined' || !port) {
  directory = './public';
  port = 8080;
}
/* set up static web server */
var file = new static.Server(directory);
/* construct HTTP server that pulls from file server */
var app = http.createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(port);
console.log('The server is running');