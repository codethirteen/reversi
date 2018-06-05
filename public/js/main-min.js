"use strict";

function getURLParameters(e) {
  var t = window.location.search.substring(1);
  var o = t.split("&");
  for (var s = 0; s < o.length; s++) {
    var a = o[s].split("=");
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

socket.on("connect", function() {
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
  var o = $(".socket_" + e.socket_id);
  if (o.length === 0) {
    var s = $("<div><strong>" + e.username + "</strong></div>");
    s.addClass("col-6 socket_" + e.socket_id);
    t = makeInviteButton(e.socket_id);
    var a = $("<div></div>");
    a.addClass("col-6 text-center socket_" + e.socket_id);
    a.prepend(t);
    s.hide();
    a.hide();
    $("#players").append(s, a);
    s.slideDown(250);
    a.slideDown(250);
  } else {
    uninvite(e.socket_id);
    t = makeInviteButton(e.socket_id);
    $(".socket_" + e.socket_id + " btn").replaceWith(t);
    o.slideDown(250);
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
  var o = "<p class='animated bounce' data-wow-delay='2.5s'>" + e.username + " has left the lobby</p>";
  var s = $(o);
  s.hide();
  $("#messages").prepend(s);
  s.slideDown(250);
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
  var o = $(t);
  o.hide();
  $("#messages").prepend(o);
  o.slideDown(250);
});

function makeInviteButton(e) {
  var t = "<button type='button' class='btn blue-gradient waves-effect waves-light'>INVITE</button>";
  var o = $(t);
  o.click(function() {
    invite(e);
  });
  return o;
}

function makeInvitedButton(e) {
  var t = "<button type='button' class='btn invited-gradient waves-effect waves-light'>INVITED</button>";
  var o = $(t);
  o.click(function() {
    uninvite(e);
  });
  return o;
}

function makePlayButton(e) {
  var t = "<button type='button' class='btn play-gradient waves-effect waves-light'>PLAY</button>";
  var o = $(t);
  o.click(function() {
    game_start(e);
  });
  return o;
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
  $("#quit").append('<a href="lobby.html?username=' + username + '" class="btn btn-danger btn-default active" role="button" aria-pressed="true">Quit</a>');
});

var old_board = [ [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ] ];

var my_color = " ";

socket.on("game_update", function(e) {
  console.log("*** Client Log Message: 'game_update' \n\tpayload: " + JSON.stringify(e));
  if (e.result === "fail") {
    console.log(e.message);
    window.location.href = "lobby.html?username=" + username;
    return;
  }
  var t = e.game.board;
  if ("undefined" === typeof t || !t) {
    console.log("Internal error: received a malformed board update from the server");
    return;
  }
  if (socket.id === e.game.player_white.socket) {
    my_color = "white";
  } else if (socket.id === e.game.player_black.socket) {
    my_color = "black";
  } else {
    window.location.href = "lobby.html?username=" + username;
    return;
  }
  $("#my_color").html('<h3 id="my_color">I am ' + my_color + "</h3>");
  var o = 0;
  var s = 0;
  var a, n;
  for (a = 0; a < 8; a++) {
    for (n = 0; n < 8; n++) {
      if (t[a][n] === "b") {
        o++;
      }
      if (t[a][n] === "w") {
        s++;
      }
      if (old_board[a][n] !== t[a][n]) {
        if (old_board[a][n] === "?" && t[a][n] === " ") {
          $("#" + a + "_" + n).html('<img src="../img/discs/trans.gif" alt="empty square"/>');
        } else if (old_board[a][n] === "?" && t[a][n] === "w") {
          $("#" + a + "_" + n).html('<img src="../img/discs/t2w.gif" alt="white square">');
        } else if (old_board[a][n] === "?" && t[a][n] === "b") {
          $("#" + a + "_" + n).html('<img src="../img/discs//t2b.gif" alt="black square">');
        } else if (old_board[a][n] === " " && t[a][n] === "w") {
          $("#" + a + "_" + n).html('<img src="../img/discs/t2w.gif" alt="empty square">');
        } else if (old_board[a][n] === " " && t[a][n] === "b") {
          $("#" + a + "_" + n).html('<img src="../img/discs/t2b.gif" alt="empty square">');
        } else if (old_board[a][n] === " " && t[a][n] === "w") {
          $("#" + a + "_" + n).html('<img src="../img/discs/w2b.gif" alt="black square">');
        } else if (old_board[a][n] === " " && t[a][n] === "b") {
          $("#" + a + "_" + n).html('<img src="../img/discs/w2b.gif" alt="white square">');
        } else {
          $("#" + a + "_" + n).html('<img src="../img/discs/error.gif" alt="error"/>');
        }
        $("#" + a + "_" + n).off("click");
        if (t[a][n] === " ") {
          $("#" + a + "_" + n).addClass("hovered_over");
          $("#" + a + "_" + n).click(function(e, t) {
            return function() {
              var o = {};
              o.row = e;
              o.column = t;
              o.color = my_color;
              console.log("*** Client Log Message: 'Play_token' payload: " + JSON.stringify(o));
              socket.emit("play_token", o);
            };
          }(a, n));
        } else {
          $("#" + a + "_" + n).removeClass("hovered_over");
        }
      }
    }
  }
  $("#blacksum").html(o);
  $("#whitesum").html(s);
  old_board = t;
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