'use strict';
function getURLParameters(whichParam) {
  var pageURL = window.location.search.substring(1);
  var pageURLVariables = pageURL.split('&');
  for (var i = 0; i < pageURLVariables.length; i++) {
    var parameterName = pageURLVariables[i].split('=');
    if (parameterName[0] === whichParam) {
      return parameterName[1];
    }
  }
}
var username = getURLParameters('username');
if ('undefined' === typeof username || !username) {
  username = 'Anonymous_' + Math.random();
}

var chat_room = getURLParameters('game_id');
if ('undefined' === typeof chat_room || !chat_room) {
  chat_room = 'lobby';
}
/* Connect to the socket server */
var socket = io.connect();
/* What to do when the server sends me a log message */
socket.on('log', function (array) {
  console.log.apply(console, array);
});

socket.on('connect', function () {
  // Add a welcome message to the player
  window.addEventListener('load', function () {
    var nodePlayer = $('<div><strong>Hello, ' + username + '</strong></div>');
    nodePlayer.addClass('col-12 welcomePlayer');
    $('#player').append(nodePlayer);
    nodePlayer.hide();
    nodePlayer.slideDown(250);
  }, false);
});
socket.on('join_room_response', function (payload) {
  var buttonC;
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  if (payload.socket_id === socket.id) {
    return;
  }
  var dom_element = $('.socket_' + payload.socket_id);
  if (dom_element.length === 0) {
    var nodeA = $(
      '<div><strong>' + payload.username + '</strong></div>'
    );
    nodeA.addClass('col-6 socket_' + payload.socket_id);
    buttonC = makeInviteButton(payload.socket_id);
    var nodeB = $('<div></div>');
    nodeB.addClass(
      'col-6 text-center socket_' + payload.socket_id
    );
    nodeB.prepend(buttonC);
    nodeA.hide();
    nodeB.hide();
    $('#players').append(nodeA, nodeB);
    nodeA.slideDown(250);
    nodeB.slideDown(250);
  } else {
    uninvite(payload.socket_id);
    buttonC = makeInviteButton(payload.socket_id);
    $('.socket_' + payload.socket_id + ' btn').replaceWith(
      buttonC
    );
    dom_element.slideDown(250);
  }
  var newHTML =
    '<p>' + payload.username + ' just entered the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').prepend(newNode);
  newNode.slideDown(250);
});
// What to do when the server says someone has left a room
socket.on('player_disconnected', function (payload) {
  console.log(
    '*** Client Log Message: "disconnected" payload: ' +
    JSON.stringify(payload)
  );
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  // if were are being notified that we left the room, then ignore it
  if (payload.socket_id === socket.id) {
    return;
  }
  // if someone left the room then animate out all their content
  var dom_elements = $('.socket_' + payload.socket_id);
  // if something exists
  if (dom_elements.length !== 0) {
    dom_elements.slideUp(250);
  }
  // manage the message that a player has left
  var newHTML =
    '<p class="animated bounce" data-wow-delay="2.5s">' + payload.username + ' has left the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').prepend(newNode);
  newNode.slideDown(250);
});
// Send an invite message to the server
function invite(who) {
  // Inveite someone
  var payload = {};
  payload.requested_user = who;
  console.log(
    '*** Client Log Message: "invite" payload: ' +
    JSON.stringify(payload)
  );
  socket.emit('invite', payload);
}
// Handle a response after sending an invite message to the server
socket.on('invite_response', function (payload) {
  // invite_response
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  var newNode = makeInvitedButton(payload.socket_id);
  $('.socket_' + payload.socket_id + ' button').replaceWith(
    newNode
  );
});
// Handle a notification that we have been invited
socket.on('invited', function (payload) {
  // invited
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  var newNode = makePlayButton(payload.socket_id);
  $('.socket_' + payload.socket_id + ' button').replaceWith(
    newNode
  );
});
function uninvite(who) {
  var payload = {};
  payload.requested_user = who;
  console.log(
    '*** Client Log Message: "invite" payload: ' +
    JSON.stringify(payload)
  );
  socket.emit('uninvite', payload);
}
socket.on('uninvite_response', function (payload) {
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  var newNode = makeInviteButton(payload.socket_id);
  $('.socket_' + payload.socket_id + ' button').replaceWith(
    newNode
  );
});
socket.on('uninvited', function (payload) {
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  var newNode = makeInviteButton(payload.socket_id);
  $('.socket_' + payload.socket_id + ' button').replaceWith(
    newNode
  );
});
// game_start
function game_start(who) {
  var payload = {};
  payload.requested_user = who;
  console.log(
    '*** Client Log Message: "game_start" payload: ' +
    JSON.stringify(payload)
  );
  socket.emit('game_start', payload);
}
// Handle a notification that we have been engaged
socket.on('game_start_response', function (payload) {
  // unInvited
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  var newNode = makeEngagedButton(payload.socket_id);
  $('.socket_' + payload.socket_id + ' button').replaceWith(
    newNode
  );
  /* Jump to a new page */
  window.location.href =
    'game.html?username=' +
    username +
    '&game_id=' +
    payload.game_id;
});
// add content to message variable
function send_message() {
  var payload = {};
  payload.room = chat_room;
  payload.message = $('#send_message_holder').val();
  console.log('*** Client Log Message: "send_message" payload: ' + JSON.stringify(payload));
  socket.emit('send_message', payload);
  $('#send_message_holder').val('');
}
socket.on('send_message_response', function (payload) {
  // Send message response
  if (payload.result === 'fail') {
    alert(payload.message);
    return;
  }
  var newHTML = '<span class="text-left mb-3">' + payload.message + '</span><h5 class="text-left border-bottom mt-4 mb-3 blue-text">' + payload.username + '</h5>';

  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').prepend(newNode);
  newNode.slideDown(500);
});
function makeInviteButton(socket_id) {
  var newHTML = '<button type="button"'+
                'class="btn blue-gradient waves-effect'+
                'waves-light">INVITE</button>';
  var newNode = $(newHTML);
  newNode.click(function () {
    invite(socket_id);
  });
  return newNode;
}
function makeInvitedButton(socket_id) {
  var newHTML = '<button type="button" class="btn invited-gradient waves-effect waves-light">INVITED</button>';
  var newNode = $(newHTML);
  newNode.click(function () {
    uninvite(socket_id);
  });
  return newNode;
}
function makePlayButton(socket_id) {
  var newHTML = '<button type="button" class="btn play-gradient waves-effect waves-light">PLAY</button>';
  var newNode = $(newHTML);
  newNode.click(function () {
    game_start(socket_id);
  });
  return newNode;
}
function makeEngagedButton() {
  var newHTML = '<button type="button" class="btn engaged-gradient waves-effect waves-light">ENGAGED</button>';
  var newNode = $(newHTML);
  return newNode;
}
$(function () {
  var payload = {};
  payload.room = chat_room;
  payload.username = username;
  console.log('*** Client Log Message: \'join_room\ payload: '+ JSON.stringify(payload));
  socket.emit('join_room', payload);
  $('#quit').append('<button type="button" id="quitBtn" class="btn btn-primary waves-effect waves-light" data-toggle="modal" data-target="#modalConfirmQuit">QUIT</button>');
});
// generate custom URL for quit button in game.html
function quitBtn() {
  return window.location.href = 'lobby.html?username=' + username;
}
/* Code for the board specifically */
var old_board = [
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?'],
  ['?', '?', '?', '?', '?', '?', '?', '?']
];

var my_color = ' ';
var interval_timer;

socket.on('game_update', function (payload) {
  console.log('*** Client Log Message: game_update\n\tpayload: ' + JSON.stringify(payload));

  /* Check for a good board update */
  if (payload.result === 'fail') {
    console.log(payload.message);
    window.location.href = 'lobby.html?username=' + username;
    return;
  }

  /* Check for a good board in the payload */
  var board = payload.game.board;
  if ('undefined' === typeof board || !board) {
    console.log('Internal error: received a malformed board update from the server');
  }

  /* Update my color */
  var my_color = '';
  var my_opponent = '';
  if (socket.id === payload.game.player_white.socket) {
    my_color = 'white';
    my_opponent = payload.game.player_black.username;
  }
  else if (socket.id === payload.game.player_black.socket) {
    my_color = 'black';
    my_opponent = payload.game.player_white.username;
  }
  else {
    // something weird is going on, like three people playing at once
    // send client back to the lobby
    window.location.href = 'lobby.html?username=' + username;
    return;
  }

  // highlight player on scoreboard
  if (my_color === 'white') {
    $('#blackPlayer').html(my_opponent);
    $('#whitePlayer').html(username);
  }
  else if (my_color === 'black') {
    $('#blackPlayer').html(username);
    $('#whitePlayer').html(my_opponent);
  }
  else {
    $('#blackPlayer').html('BLACK');
    $('#whitePlayer').html('WHITE');

  }

  clearInterval(interval_timer);
  interval_timer = setInterval(function (last_time) {
    return function () {
      // Do the work of updating the UI
      var d = new Date();
      var elapsedmilli = d.getTime() - last_time;
      var minutes = Math.floor(elapsedmilli / (60 * 1000));
      var seconds = Math.floor((elapsedmilli % (60 * 1000)) / 1000);

      if (seconds < 10) {
        $('#elapsed').fadeIn(250).html(minutes + ':0' + seconds);
      }
      else {
        $('#elapsed').fadeIn(250).html(minutes + ':' + seconds);
      }
    };
  }(payload.game.last_move_time), 1000);

  /* Animate changes to the board */
  var blacksum = 0;
  var whitesum = 0;
  var row, column;
  for (row = 0; row < 8; row++) {
    for (column = 0; column < 8; column++) {
      if (board[row][column] === 'b') {
        blacksum++;
      }
      if (board[row][column] === 'w') {
        whitesum++;
      }
    }
  }
  for (row = 0; row < 8; row++) {
    for (column = 0; column < 8; column++) {
      /* If a board space has changed */
      if (old_board[row][column] !== board[row][column]) {
        if (old_board[row][column] === '?' && board[row][column] === ' ') {
          //$('#' + row + '_' + column).html('<img src="../img/discs/trans.gif" alt="empty square"/>');
          $('#' + row + '_' + column).removeClass().addClass('empty');
        }
        else if (old_board[row][column] === '?' && board[row][column] === 'w') {
          $('#' + row + '_' + column).removeClass().addClass('t2w');
          //$('#' + row + '_' + column).html('<img src="../img/discs/t2w.gif" alt="white square">');
        }
        else if (old_board[row][column] === '?' && board[row][column] === 'b') {
          //$('#' + row + '_' + column).html('<img src="../img/discs/t2b.gif" alt="black square">');
          $('#' + row + '_' + column).removeClass().addClass('t2b');
        }
        else if (old_board[row][column] === ' ' && board[row][column] === 'w') {
          $('#' + row + '_' + column).removeClass().addClass('t2w');
          //$('#' + row + '_' + column).html('<img src="../img/discs/t2w.gif" alt="empty square">');
        }
        else if (old_board[row][column] === ' ' && board[row][column] === 'b') {
          $('#' + row + '_' + column).removeClass().addClass('t2b');
          //$('#' + row + '_' + column).html('<img src="../img/discs/t2b.gif" alt="empty square">');
        }
        else if (old_board[row][column] === 'w' && board[row][column] === ' ') {
          $('#' + row + '_' + column).removeClass().addClass('w2t');
          //$('#' + row + '_' + column).html('<img src="../img/discs/w2t.gif" alt="empty square">');
        }
        else if (old_board[row][column] === 'b' && board[row][column] === ' ') {
          $('#' + row + '_' + column).removeClass().addClass('b2t');
          //$('#' + row + '_' + column).html('<img src="../img/discs/b2t.gif" alt="empty square">');
        }
        else if (old_board[row][column] === 'w' && board[row][column] === 'b') {
          $('#' + row + '_' + column).removeClass().addClass('w2b');
          //$('#' + row + '_' + column).html('<img src="../img/discs/w2b.gif" alt="black square">');
        }
        else if (old_board[row][column] === 'b' && board[row][column] === 'w') {
          $('#' + row + '_' + column).removeClass().addClass('b2w');
          //$('#' + row + '_' + column).html('<img src="../img/discs/b2w.gif" alt="white square">');
        }
        else {
          $('#' + row + '_' + column).removeClass().addClass('error');
          //$('#' + row + '_' + column).html('<img src="../img/discs/error.gif" alt="error">');
        }
      }

      /* Set Up Interactivity */
      $('#' + row + '_' + column).off('click');
      $('#' + row + '_' + column).removeClass('hovered_over');

      if (payload.game.whose_turn === my_color) {
        if (payload.game.legal_moves[row][column] === my_color.substr(0, 1)) {
          $('#' + row + '_' + column).removeClass().addClass('hovered_over');
          $('#' + row + '_' + column).click(function (r, c) {
            return function () {
              var payload = {};
              payload.row = r;
              payload.column = c;
              payload.color = my_color;
              console.log('*** Client Log Message : \'play token\' payload: ' + JSON.stringify(payload));
              socket.emit('play_token', payload);
            };
          }(row, column));
        }
      }
    }
  }
  // display score
  $('#blacksum').html(blacksum);
  $('#whitesum').html(whitesum);
  // calculate progress percentage from maximum of 64 and display
  var whiteProgress = ((whitesum / 64) * 100).toFixed(0);
  $('#whiteScore').attr('aria-valuenow', whitesum).css('width',whiteProgress+'%').html(whiteProgress + '%');
  var blackProgress = ((blacksum / 64) * 100).toFixed(0);
  $('#blackScore').attr('aria-valuenow', blacksum).css('width',blackProgress+'%').html(blackProgress + '%');

  // update board for next turn
  old_board = board;
});
socket.on('play_token_response', function (payload) {
  console.log('*** Client Log Message: \'play_token_response\'\n\tpayload: ' + JSON.stringify(payload));
  /* Check for a good play_token_response */
  if (payload.result === 'fail') {
    console.log(payload.message);
    alert(payload.message);
    return;
  }
});
socket.on('game_over', function (payload) {
  console.log('*** Client Log Message: \'game_over\'\n\tpayload: ' + JSON.stringify(payload));
  /* Check for a good game over response */
  if (payload.result === 'fail') {
    console.log(payload.message);
    return;
  }
  /* Jump to a new page */
  $('#game_over').html('<div class="alert alert-dismissable alert-success" role="alert"><h4 class="alert-heading">GAME OVER</h4><h5>' + payload.who_won + ' won!</h5><hr><a href="lobby.html?username=' + username + '" class="btn btn-success btn-lg active" role="button" aria-pressed="true"> Return to the Lobby </a></div>');
});
