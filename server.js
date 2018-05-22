/*jslint node: true */
// SET UP THE STATIC FILE SERVER
// include static file web server library
var static = require('node-static');
// include the http server library
var http = require('http');
// assume running on Heroku
var port = process.env.PORT;
var directory = __dirname + '/public';
// If not on Heroku, change port + dir info
if (typeof port == 'undefined' || !port) {
  directory = './public';
  port = 8080;
}
// set up static web server
var file = new static.Server(directory);
// construct HTTP server that pulls from file server
var app = http.createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(port);
// log message so we know everything is a-okay
console.log('The server is running');

// SET UP THE WEB SOCKET SERVER
var io = require('socket.io').listen(app);

io.on('connection', function (socket) {
  
  function log() {
    var array = ['*** Server log message: '];
    for (var i = 0; i < arguments.length; i++) {
      array.push(arguments[i]);
      console.log(arguments[i]);
    }
    socket.emit('log', array);
    socket.broadcast.emit('log', array);
  }
  log('A website connected to the server');

  socket.on('disconnect', function (socket) {
    log('A website disconnected from the server');
  });
});
          