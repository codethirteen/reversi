"use strict";

function getURLParameters(e) {
  var t = window.location.search.substring(1);
  var a = t.split("&");
  for (var o = 0; o < a.length; o++) {
    var s = a[o].split("=");
    if (s[0] === e) {
      return s[1];
    }
  }
}

var username = getURLParameters("username");

if ("undefined" === typeof username || !username) {
  username = "Anonymous_" + Math.random();
}

var chat_room = getURLParameters("game_id");

if ("undefined" === typeof chat_room || !chat_room) {
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
  var a = $(".socket_" + e.socket_id);
  if (a.length === 0) {
    var o = $("<div><strong>" + e.username + "</strong></div>");
    o.addClass("col-6 socket_" + e.socket_id);
    t = makeInviteButton(e.socket_id);
    var s = $("<div></div>");
    s.addClass("col-6 text-center socket_" + e.socket_id);
    s.prepend(t);
    o.hide();
    s.hide();
    $("#players").append(o, s);
    o.slideDown(250);
    s.slideDown(250);
  } else {
    uninvite(e.socket_id);
    t = makeInviteButton(e.socket_id);
    $(".socket_" + e.socket_id + " btn").replaceWith(t);
    a.slideDown(250);
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
  var a = '<p class="animated bounce" data-wow-delay="2.5s">' + e.username + " has left the lobby</p>";
  var o = $(a);
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
  console.log('*** Client Log Message: "send_message" payload: ' + JSON.stringify(e));
  socket.emit("send_message", e);
  $("#send_message_holder").val("");
}

socket.on("send_message_response", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = '<span class="text-left mb-3">' + e.message + '</span><h5 class="text-left border-bottom mt-4 mb-3 blue-text">' + e.username + "</h5>";
  var a = $(t);
  a.hide();
  $("#messages").prepend(a);
  a.slideDown(500);
});

function makeInviteButton(e) {
  var t = '<button type="button"' + 'class="btn blue-gradient waves-effect' + 'waves-light">INVITE</button>';
  var a = $(t);
  a.click(function() {
    invite(e);
  });
  return a;
}

function makeInvitedButton(e) {
  var t = '<button type="button" class="btn invited-gradient waves-effect waves-light">INVITED</button>';
  var a = $(t);
  a.click(function() {
    uninvite(e);
  });
  return a;
}

function makePlayButton(e) {
  var t = '<button type="button" class="btn play-gradient waves-effect waves-light">PLAY</button>';
  var a = $(t);
  a.click(function() {
    game_start(e);
  });
  return a;
}

function makeEngagedButton() {
  var e = '<button type="button" class="btn engaged-gradient waves-effect waves-light">ENGAGED</button>';
  var t = $(e);
  return t;
}

$(function() {
  var e = {};
  e.room = chat_room;
  e.username = username;
  console.log("*** Client Log Message: 'join_room payload: " + JSON.stringify(e));
  socket.emit("join_room", e);
  $("#quit").append('<button type="button" id="quitBtn" class="btn btn-primary waves-effect waves-light" data-toggle="modal" data-target="#modalConfirmQuit">QUIT</button>');
});

function quitBtn() {
  return window.location.href = "lobby.html?username=" + username;
}

var old_board = [ [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ], [ "?", "?", "?", "?", "?", "?", "?", "?" ] ];

var my_color = " ";

var interval_timer;

socket.on("game_update", function(e) {
  console.log("*** Client Log Message: game_update\n\tpayload: " + JSON.stringify(e));
  if (e.result === "fail") {
    console.log(e.message);
    window.location.href = "lobby.html?username=" + username;
    return;
  }
  var t = e.game.board;
  if ("undefined" === typeof t || !t) {
    console.log("Internal error: received a malformed board update from the server");
  }
  var a = "";
  var o = "";
  if (socket.id === e.game.player_white.socket) {
    a = "white";
    o = e.game.player_black.username;
  } else if (socket.id === e.game.player_black.socket) {
    a = "black";
    o = e.game.player_white.username;
  } else {
    window.location.href = "lobby.html?username=" + username;
    return;
  }
  if (a === "white") {
    $("#blackPlayer").html(o);
    $("#whitePlayer").html(username);
  } else if (a === "black") {
    $("#blackPlayer").html(username);
    $("#whitePlayer").html(o);
  } else {
    $("#blackPlayer").html("BLACK");
    $("#whitePlayer").html("WHITE");
  }
  clearInterval(interval_timer);
  interval_timer = setInterval(function(e) {
    return function() {
      var t = new Date();
      var a = t.getTime() - e;
      var o = Math.floor(a / (60 * 1e3));
      var s = Math.floor(a % (60 * 1e3) / 1e3);
      if (s < 10) {
        $("#elapsed").fadeIn(250).html(o + ":0" + s);
      } else {
        $("#elapsed").fadeIn(250).html(o + ":" + s);
      }
    };
  }(e.game.last_move_time), 1e3);
  var s = 0;
  var n = 0;
  var r, l;
  for (r = 0; r < 8; r++) {
    for (l = 0; l < 8; l++) {
      if (t[r][l] === "b") {
        s++;
      }
      if (t[r][l] === "w") {
        n++;
      }
    }
  }
  for (r = 0; r < 8; r++) {
    for (l = 0; l < 8; l++) {
      if (old_board[r][l] !== t[r][l]) {
        if (old_board[r][l] === "?" && t[r][l] === " ") {
          $("#" + r + "_" + l).removeClass().addClass("empty");
        } else if (old_board[r][l] === "?" && t[r][l] === "w") {
          $("#" + r + "_" + l).removeClass().addClass("t2w");
        } else if (old_board[r][l] === "?" && t[r][l] === "b") {
          $("#" + r + "_" + l).removeClass().addClass("t2b");
        } else if (old_board[r][l] === " " && t[r][l] === "w") {
          $("#" + r + "_" + l).removeClass().addClass("t2w");
        } else if (old_board[r][l] === " " && t[r][l] === "b") {
          $("#" + r + "_" + l).removeClass().addClass("t2b");
        } else if (old_board[r][l] === "w" && t[r][l] === " ") {
          $("#" + r + "_" + l).removeClass().addClass("w2t");
        } else if (old_board[r][l] === "b" && t[r][l] === " ") {
          $("#" + r + "_" + l).removeClass().addClass("b2t");
        } else if (old_board[r][l] === "w" && t[r][l] === "b") {
          $("#" + r + "_" + l).removeClass().addClass("w2b");
        } else if (old_board[r][l] === "b" && t[r][l] === "w") {
          $("#" + r + "_" + l).removeClass().addClass("b2w");
        } else {
          $("#" + r + "_" + l).removeClass().addClass("error");
        }
      }
      $("#" + r + "_" + l).off("click");
      $("#" + r + "_" + l).removeClass("hovered_over");
      if (e.game.whose_turn === a) {
        if (e.game.legal_moves[r][l] === a.substr(0, 1)) {
          $("#" + r + "_" + l).removeClass().addClass("hovered_over");
          $("#" + r + "_" + l).click(function(e, t) {
            return function() {
              var o = {};
              o.row = e;
              o.column = t;
              o.color = a;
              console.log("*** Client Log Message : 'play token' payload: " + JSON.stringify(o));
              socket.emit("play_token", o);
            };
          }(r, l));
        }
      }
    }
  }
  $("#blacksum").html(s);
  $("#whitesum").html(n);
  var i = (n / 64 * 100).toFixed(0);
  $("#whiteScore").attr("aria-valuenow", n).css("width", i + "%").html(i + "%");
  var d = (s / 64 * 100).toFixed(0);
  $("#blackScore").attr("aria-valuenow", s).css("width", d + "%").html(d + "%");
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
    return;
  }
  $("#game_over").html('<div class="alert alert-dismissable alert-success" role="alert"><h4 class="alert-heading">GAME OVER</h4><h5>' + e.who_won + ' won!</h5><hr><a href="lobby.html?username=' + username + '" class="btn btn-success btn-lg active" role="button" aria-pressed="true"> Return to the Lobby </a></div>');
});