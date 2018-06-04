"use strict";

function getURLParameters(e) {
  var t = window.location.search.substring(1);
  var s = t.split("&");
  for (var o = 0; o < s.length; o++) {
    var a = s[o].split("=");
    if (a[0] == e) {
      return a[1];
    }
  }
}

var username = getURLParameters("username");

if ("undefined" == typeof username || !username) {
  username = "Anonymous_" + Math.random();
}

var chat_room = getURLParameters("game_id");

if ("undefined" == typeof chat_room || !chat_room) {
  chat_room = "lobby";
}

var socket = io.connect();

socket.on("log", function(e) {
  console.log.apply(console, e);
});

socket.on("connect", function(e) {
  window.addEventListener("load", function() {
    var e = $("<div><strong>Hello, " + username + "</strong></div>");
    e.addClass("col-12 welcomePlayer");
    $("#player").append(e);
    e.hide();
    e.slideDown(250);
  }, false);
});

socket.on("join_room_response", function(e) {
  var t;
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  if (e.socket_id === socket.id) {
    return;
  }
  var s = $(".socket_" + e.socket_id);
  if (s.length === 0) {
    var o = $("<div><strong>" + e.username + "</strong></div>");
    o.addClass("col-6 socket_" + e.socket_id);
    t = makeInviteButton(e.socket_id);
    var a = $("<div></div>");
    a.addClass("col-6 text-center socket_" + e.socket_id);
    a.prepend(t);
    o.hide();
    a.hide();
    $("#players").append(o, a);
    o.slideDown(250);
    a.slideDown(250);
  } else {
    uninvite(e.socket_id);
    t = makeInviteButton(e.socket_id);
    $(".socket_" + e.socket_id + " btn").replaceWith(t);
    s.slideDown(250);
  }
  var n = "<p>" + e.username + " just entered the lobby</p>";
  var r = $(n);
  r.hide();
  $("#messages").prepend(r);
  r.slideDown(250);
});

socket.on("player_disconnected", function(e) {
  console.log('*** Client Log Message: "disconnected" payload: ' + JSON.stringify(e));
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  if (e.socket_id === socket.id) {
    return;
  }
  var t = $(".socket_" + e.socket_id);
  if (t.length !== 0) {
    t.slideUp(250);
  }
  var s = "<p class='animated bounce' data-wow-delay='2.5s'>" + e.username + " has left the lobby</p>";
  var o = $(s);
  o.hide();
  $("#messages").prepend(o);
  o.slideDown(250);
});

function invite(e) {
  var t = {};
  t.requested_user = e;
  console.log('*** Client Log Message: "invite" payload: ' + JSON.stringify(t));
  socket.emit("invite", t);
}

socket.on("invite_response", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = makeInvitedButton(e.socket_id);
  $(".socket_" + e.socket_id + " button").replaceWith(t);
});

socket.on("invited", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = makePlayButton(e.socket_id);
  $(".socket_" + e.socket_id + " button").replaceWith(t);
});

function uninvite(e) {
  var t = {};
  t.requested_user = e;
  console.log('*** Client Log Message: "invite" payload: ' + JSON.stringify(t));
  socket.emit("uninvite", t);
}

socket.on("uninvite_response", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = makeInviteButton(e.socket_id);
  $(".socket_" + e.socket_id + " button").replaceWith(t);
});

socket.on("uninvited", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = makeInviteButton(e.socket_id);
  $(".socket_" + e.socket_id + " button").replaceWith(t);
});

function game_start(e) {
  var t = {};
  t.requested_user = e;
  console.log('*** Client Log Message: "game_start" payload: ' + JSON.stringify(t));
  socket.emit("game_start", t);
}

socket.on("game_start_response", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = makeEngagedButton(e.socket_id);
  $(".socket_" + e.socket_id + " button").replaceWith(t);
  window.location.href = "game.html?username=" + username + "&game_id=" + e.game_id;
});

function send_message() {
  var e = {};
  e.room = chat_room;
  e.message = $("#send_message_holder").val();
  console.log("*** Client Log Message: 'send_message' payload: " + JSON.stringify(e));
  socket.emit("send_message", e);
  $("#send_message_holder").val("");
}

socket.on("send_message_response", function(e) {
  if (e.result == "fail") {
    alert(e.message);
    return;
  }
  var t = "<p><b>" + e.username + " says:</b> " + e.message + "</p>";
  var s = $(t);
  s.hide();
  $("#messages").prepend(s);
  s.slideDown(250);
});

function makeInviteButton(e) {
  var t = "<button type='button' class='btn blue-gradient waves-effect waves-light'>INVITE</button>";
  var s = $(t);
  s.click(function() {
    invite(e);
  });
  return s;
}

function makeInvitedButton(e) {
  var t = "<button type='button' class='btn invited-gradient waves-effect waves-light'>INVITED</button>";
  var s = $(t);
  s.click(function() {
    uninvite(e);
  });
  return s;
}

function makePlayButton(e) {
  var t = "<button type='button' class='btn play-gradient waves-effect waves-light'>PLAY</button>";
  var s = $(t);
  s.click(function() {
    game_start(e);
  });
  return s;
}

function makeEngagedButton() {
  var e = "<button type='button' class='btn engaged-gradient waves-effect waves-light'>ENGAGED</button>";
  var t = $(e);
  return t;
}

$(function() {
  var e = {};
  e.room = chat_room;
  e.username = username;
  console.log("*** Client Log Message: 'join_room payload: " + JSON.stringify(e));
  socket.emit("join_room", e);
  $("#quit").append('<a href="lobby.html?username=' + username + '" class="btn engaged-gradient waves-effect waves-light active" role="button" aria-pressed="true">QUIT</a>');
});

var old_board = [ [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ] ];

var my_color = " ";

socket.on("game_update", function(e) {
  var t;
  console.log("*** Client Log Message: 'game_update' \n\tpayload: " + JSON.stringify(e));
  if (e.result === "fail") {
    console.log(e.message);
    window.location.href = "lobby.html?username=" + username;
    return;
  }
  var s = e.game.board;
  if ("undefined" === typeof s || !s) {
    console.log("Internal error: received a malformed board update from the server");
    return;
  }
  if (socket.id === e.game.player_white.socket) {
    t = "white";
  } else if (socket.id === e.game.player_black.socket) {
    t = "black";
  } else {
    window.location.href = "lobby.html?username=" + username;
    return;
  }
  $("#my_color").html('<h3 id="my_color">I am ' + t + "</h3>");
  var o = 0;
  var a = 0;
  var n, r;
  for (n = 0; n < 8; n++) {
    for (r = 0; r < 8; r++) {
      if (s[n][r] === "b") {
        o++;
      }
      if (s[n][r] === "w") {
        a++;
      }
      if (old_board[n][r] !== s[n][r]) {
        if (old_board[n][r] === "?" && s[n][r] === " ") {
          $("#" + n + "_" + r).html('<img src="assets/images/empty.gif" alt="empty square"/>');
        } else if (old_board[n][r] === "?" && s[n][r] === "w") {
          $("#" + n + "_" + r).html('<img src="assets/images/empty_to_white.gif" alt="white square">');
        } else if (old_board[n][r] === "?" && s[n][r] === "b") {
          $("#" + n + "_" + r).html('<img src="assets/images/empty_to_black.gif" alt="black square">');
        } else if (old_board[n][r] === " " && s[n][r] === "w") {
          $("#" + n + "_" + r).html('<img src="assets/images/empty_to_white.gif" alt="empty square">');
        } else if (old_board[n][r] === " " && s[n][r] === "b") {
          $("#" + n + "_" + r).html('<img src="assets/images/empty_to_black.gif" alt="empty square">');
        } else if (old_board[n][r] === " " && s[n][r] === "w") {
          $("#" + n + "_" + r).html('<img src="assets/images/white_to_black.gif" alt="black square">');
        } else if (old_board[n][r] === " " && s[n][r] === "b") {
          $("#" + n + "_" + r).html('<img src="assets/images/black_to_white.gif" alt="white square">');
        } else {
          $("#" + n + "_" + r).html('<img src="assets/images/error.gif" alt="white square"> alt="error"/>');
        }
        $("#" + n + "_" + r).off("click");
        if (s[n][r] === " ") {
          $("#" + n + "_" + r).addClass("hovered_over");
          t = t;
          $("#" + n + "_" + r).click(function(e, s) {
            return function() {
              var o = {};
              o.row = e;
              o.column = s;
              o.color = t;
              console.log("*** Client Log Message: 'Play_token' payload: " + JSON.stringify(o));
              socket.emit("play_token", o);
            };
          }(n, r));
        } else {
          $("#" + n + "_" + r).removeClass("hovered_over");
        }
      }
    }
  }
  $("#blacksum").html(o);
  $("#whitesum").html(a);
  old_board = s;
});

socket.on("play_token_response", function(e) {
  console.log("*** Client Log Message: 'play_token_response'\n\tpayload: " + JSON.stringify(e));
  if (e.result === "fail") {
    console.log(e.message);
    alert(e.message);
    return;
  }
});

socket.on("game_over", function(e) {
  console.log("*** Client Log Message: 'game_over'\n\tpayload: " + JSON.stringify(e));
  if (e.result === "fail") {
    console.log(e.message);
    alert(e.message);
    return;
  }
  $("#game_over").html("<h1>Game Over</h1><h2>" + e.who_won + " won!</h2>");
  $("#game_over").append('<br><a href="lobby.html?username=' + username + '" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to the lobby</a>');
});