"use strict";

function getURLParameters(e) {
  var t = window.location.search.substring(1);
  var n = t.split("&");
  for (var s = 0; s < n.length; s++) {
    var o = n[s].split("=");
    if (o[0] == e) {
      return o[1];
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

socket.on("join_room_response", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  if (e.socket_id === socket.id) {
    return;
  }
  var t = $(".socket_" + e.socket_id);
  if (t.length === 0) {
    var n = $("<div><strong>" + e.username + "</strong></div>");
    n.addClass("col-6 socket_" + e.socket_id);
    var s = makeInviteButton(e.socket_id);
    var o = $("<div></div>");
    o.addClass("col-6 text-center socket_" + e.socket_id);
    o.prepend(s);
    n.hide();
    o.hide();
    $("#players").append(n, o);
    n.slideDown(1e3);
    o.slideDown(1e3);
  } else {
    s = makeInviteButton(e.socket_id);
    $(".socket_" + e.socket_id + " button").replaceWith(s);
    t.slideDown(1e3);
  }
  var a = "<p>" + e.username + " just entered the lobby</p>";
  var r = $(a);
  r.hide();
  $("#messages").append(r);
  r.slideDown(1e3);
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
    t.slideUp(1e3);
  }
  var n = "<p>" + e.username + " has left the lobby</p>";
  var s = $(n);
  s.hide();
  $("#message").append(s);
  s.slideDown(1e3);
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
  var t = makeInvitedButton();
  $(".socket_" + e.socket_id + " button").replaceWith(t);
});

socket.on("invited", function(e) {
  if (e.result === "fail") {
    alert(e.message);
    return;
  }
  var t = makePlayButton();
  $(".socket_" + e.socket_id + " button").replaceWith(t);
});

socket.on("send_message_response", function(e) {
  if (e.result == "fail") {
    alert(e.message);
    return;
  }
  $("#messages").append("<p><strong>" + e.username + " says:</strong> " + e.message + "</p>");
});

function send_message() {
  var e = {};
  e.room = chat_room;
  e.username = username;
  e.message = $("#send_message_holder").val();
  console.log("*** Client Log Message: 'send_message' payload: " + JSON.stringify(e));
  socket.emit("send_message", e);
}

function makeInviteButton(e) {
  var t = "<button type='button' class='btn blue-gradient waves-effect waves-light'>INVITE</button>";
  var n = $(t);
  n.click(function() {
    invite(e);
  });
  return n;
}

function makeInvitedButton() {
  var e = "<button type='button' class='btn invited-gradient waves-effect waves-light'>INVITED</button>";
  var t = $(e);
  return t;
}

function makePlayButton() {
  var e = "<button type='button' class='btn play-gradient waves-effect waves-light'>PLAY</button>";
  var t = $(e);
  return t;
}

function makeEngageButton() {
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
});