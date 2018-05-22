function getURLParameters(urlParams) {
  var pageURL = window.location.search.substring(1);
  var pageURLVariables = pageURL.split('&');
  for (var i = 0; i < pageURLVariables.length; i++) {

    var parameterName = pageURLVariables[i].split('=');
    if (parameterName[0] == urlParams) {
      return parameterName[1];
    }
  }
}

var username = getURLParameters('username');
if (typeof username === typeof undefined || !username) {
  username = 'Anonymous_'+Math.random();
}

$('#messages').append('<h4>'+getURLParameters('username')+'</h4>');

// connect to socket server 
var socket = socket.on.connect();

socket.on('log', function (array) {
  console.log.apply(console, array);
});