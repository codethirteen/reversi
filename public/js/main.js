function getURLParameters(whichParam) {
    var pageURL = window.location.search.substring(1);
    var pageURLVariables = pageURL.split("&");
    for (var i = 0; i < pageURLVariables.length; i++) {
        var parameterName = pageURLVariables[i].split("=");
        if (parameterName[0] == whichParam) {
            return parameterName[1];
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
/* Connect to the socket server */
var socket = io.connect();
/* What to do when the server sends me a log message */
socket.on("log", function (array) {
    console.log.apply(console, array);
});

socket.on("connect", function (socket_id) {
    // Add a welcome message to the player
    window.addEventListener("load", function () {
        var nodePlayer = $("<div><strong>Hello, " + username + "</strong></div>");
        nodePlayer.addClass("col-12 welcomePlayer");
        $("#player").append(nodePlayer);
        nodePlayer.hide();
        nodePlayer.slideDown(250);
    }, false);
});
socket.on("join_room_response", function (payload) {
    var buttonC;
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    if (payload.socket_id === socket.id) {
        return;
    }
    var dom_element = $(".socket_" + payload.socket_id);
    if (dom_element.length === 0) {
        var nodeA = $(
            "<div><strong>" + payload.username + "</strong></div>"
        );
        nodeA.addClass("col-6 socket_" + payload.socket_id);
        buttonC = makeInviteButton(payload.socket_id);
        var nodeB = $("<div></div>");
        nodeB.addClass(
            "col-6 text-center socket_" + payload.socket_id
        );
        nodeB.prepend(buttonC);
        nodeA.hide();
        nodeB.hide();
        $("#players").append(nodeA, nodeB);
        nodeA.slideDown(250);
        nodeB.slideDown(250);
    } else {
        uninvite(payload.socket_id);
        buttonC = makeInviteButton(payload.socket_id);
        $(".socket_" + payload.socket_id + " btn").replaceWith(
            buttonC
        );
        dom_element.slideDown(250);
    }
    var newHTML =
        "<p>" + payload.username + " just entered the lobby</p>";
    var newNode = $(newHTML);
    newNode.hide();
    $("#messages").prepend(newNode);
    newNode.slideDown(250);
});
// What to do when the server says someone has left a room
socket.on("player_disconnected", function (payload) {
    console.log(
        '*** Client Log Message: "disconnected" payload: ' +
        JSON.stringify(payload)
    );
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    // if were are being notified that we left the room, then ignore it
    if (payload.socket_id === socket.id) {
        return;
    }
    // if someone left the room then animate out all their content
    var dom_elements = $(".socket_" + payload.socket_id);
    // if something exists
    if (dom_elements.length !== 0) {
        dom_elements.slideUp(250);
    }
    // manage the message that a player has left
    var newHTML =
        "<p class='animated bounce' data-wow-delay='2.5s'>" + payload.username + " has left the lobby</p>";
    var newNode = $(newHTML);
    newNode.hide();
    $("#messages").prepend(newNode);
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
    socket.emit("invite", payload);
}
// Handle a response after sending an invite message to the server
socket.on("invite_response", function (payload) {
    // invite_response
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    var newNode = makeInvitedButton(payload.socket_id);
    $(".socket_" + payload.socket_id + " button").replaceWith(
        newNode
    );
});
// Handle a notification that we have been invited
socket.on("invited", function (payload) {
    // invited
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    var newNode = makePlayButton(payload.socket_id);
    $(".socket_" + payload.socket_id + " button").replaceWith(
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
    socket.emit("uninvite", payload);
}
socket.on("uninvite_response", function (payload) {
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    var newNode = makeInviteButton(payload.socket_id);
    $(".socket_" + payload.socket_id + " button").replaceWith(
        newNode
    );
});
socket.on("uninvited", function (payload) {
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    var newNode = makeInviteButton(payload.socket_id);
    $(".socket_" + payload.socket_id + " button").replaceWith(
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
    socket.emit("game_start", payload);
}
// Handle a notification that we have been engaged
socket.on("game_start_response", function (payload) {
    // unInvited
    if (payload.result === "fail") {
        alert(payload.message);
        return;
    }
    var newNode = makeEngagedButton(payload.socket_id);
    $(".socket_" + payload.socket_id + " button").replaceWith(
        newNode
    );
    /* Jump to a new page */
    window.location.href =
        "game.html?username=" +
        username +
        "&game_id=" +
        payload.game_id;
});
// add content to message variable
function send_message() {
    var payload = {};
    payload.room = chat_room;
    payload.message = $("#send_message_holder").val();
    console.log(
        "*** Client Log Message: 'send_message' payload: " +
        JSON.stringify(payload)
    );
    socket.emit("send_message", payload);
    $("#send_message_holder").val("");
}
socket.on("send_message_response", function (payload) {
    // Send message response
    if (payload.result == "fail") {
        alert(payload.message);
        return;
    }
    var newHTML =
        "<p><b>" +
        payload.username +
        " says:</b> " +
        payload.message +
        "</p>";
    var newNode = $(newHTML);
    newNode.hide();
    $("#messages").prepend(newNode);
    newNode.slideDown(250);
});
function makeInviteButton(socket_id) {
    var newHTML =
        "<button type='button' class='btn blue-gradient waves-effect waves-light'>INVITE</button>";
    var newNode = $(newHTML);
    newNode.click(function () {
        invite(socket_id);
    });
    return newNode;
}
function makeInvitedButton(socket_id) {
    var newHTML =
        "<button type='button' class='btn invited-gradient waves-effect waves-light'>INVITED</button>";
    var newNode = $(newHTML);
    newNode.click(function () {
        uninvite(socket_id);
    });
    return newNode;
}
function makePlayButton(socket_id) {
    var newHTML =
        "<button type='button' class='btn play-gradient waves-effect waves-light'>PLAY</button>";
    var newNode = $(newHTML);
    newNode.click(function () {
        game_start(socket_id);
    });
    return newNode;
}
function makeEngagedButton() {
    var newHTML =
        "<button type='button' class='btn engaged-gradient waves-effect waves-light'>ENGAGED</button>";
    var newNode = $(newHTML);
    return newNode;
}
$(function () {
    var payload = {};
    payload.room = chat_room;
    payload.username = username;
    console.log(
        "*** Client Log Message: 'join_room payload: " +
        JSON.stringify(payload)
    );
    socket.emit("join_room", payload);
    $("#quit").append(
        '<a href="lobby.html?username=' +
        username +
        '" class="btn engaged-gradient waves-effect waves-light active" role="button" aria-pressed="true">QUIT</a>'
    );
});
// Board code
var old_board = [
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"],
    ["?", "?", "?", "?", "?", "?", "?", "?"]
];
var my_color = " ";
socket.on("game_update", function (payload) {
    var my_color;
    console.log(
        "*** Client Log Message: 'game_update' \n\tpayload: " +
        JSON.stringify(payload)
    );
    // Check for a good board update
    if (payload.result === "fail") {
        console.log(payload.message);
        window.location.href = "lobby.html?username=" + username;
        return;
    }
    // Check for a good board in payload
    var board = payload.game.board;
    if ("undefined" === typeof board || !board) {
        console.log(
            "Internal error: received a malformed board update from the server"
        );
        return;
    }
    // update my color
    if (socket.id === payload.game.player_white.socket) {
        my_color = "white";
    } else if (socket.id === payload.game.player_black.socket) {
        my_color = "black";
    } else {
        // something weird is going on, like three people playing at once
        // send client back to the lobby
        window.location.href = "lobby.html?username=" + username;
        return;
    }
    $("#my_color").html(
        '<h3 id="my_color">I am ' + my_color + "</h3>"
    );
    // Animate changes to the board
    var blacksum = 0;
    var whitesum = 0;
    var row, column;
    for (row = 0; row < 8; row++) {
        for (column = 0; column < 8; column++) {
            if (board[row][column] === "b") {
                blacksum++;
            }
            if (board[row][column] === "w") {
                whitesum++;
            }
            // if a board space has changed
            if (old_board[row][column] !== board[row][column]) {
                if (
                    old_board[row][column] === "?" &&
                    board[row][column] === " "
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/empty.gif" alt="empty square"/>'
                    );
                } else if (
                    old_board[row][column] === "?" &&
                    board[row][column] === "w"
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/empty_to_white.gif" alt="white square">'
                    );
                } else if (
                    old_board[row][column] === "?" &&
                    board[row][column] === "b"
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/empty_to_black.gif" alt="black square">'
                    );
                } else if (
                    old_board[row][column] === " " &&
                    board[row][column] === "w"
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/empty_to_white.gif" alt="empty square">'
                    );
                } else if (
                    old_board[row][column] === " " &&
                    board[row][column] === "b"
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/empty_to_black.gif" alt="empty square">'
                    );
                } else if (
                    old_board[row][column] === " " &&
                    board[row][column] === "w"
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/white_to_black.gif" alt="black square">'
                    );
                } else if (
                    old_board[row][column] === " " &&
                    board[row][column] === "b"
                ) {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/black_to_white.gif" alt="white square">'
                    );
                } else {
                    $("#" + row + "_" + column).html(
                        '<img src="assets/images/error.gif" alt="white square"> alt="error"/>'
                    );
                }
                // Set up interactivity
                $("#" + row + "_" + column).off("click");
                if (board[row][column] === " ") {
                    $("#" + row + "_" + column).addClass(
                        "hovered_over"
                    );
                    my_color = my_color;
                    $("#" + row + "_" + column).click(
                        (function (r, c) {
                            return function () {
                                var payload = {};
                                payload.row = r;
                                payload.column = c;
                                payload.color = my_color;
                                console.log(
                                    "*** Client Log Message: 'Play_token' payload: " +
                                    JSON.stringify(payload)
                                );
                                socket.emit("play_token", payload);
                            };
                        })(row, column)
                    );
                } else {
                    $("#" + row + "_" + column).removeClass(
                        "hovered_over"
                    );
                }
            }
        }
    }
    $("#blacksum").html(blacksum);
    $("#whitesum").html(whitesum);
    old_board = board;
});
socket.on("play_token_response", function (payload) {
    console.log(
        "*** Client Log Message: 'play_token_response'\n\tpayload: " +
        JSON.stringify(payload)
    );
    // Check for a good play_token_response
    if (payload.result === "fail") {
        console.log(payload.message);
        alert(payload.message);
        return;
    }
});
socket.on("game_over", function (payload) {
    console.log(
        "*** Client Log Message: 'game_over'\n\tpayload: " +
        JSON.stringify(payload)
    );
    // Check for a good play_token_response
    if (payload.result === "fail") {
        console.log(payload.message);
        alert(payload.message);
        return;
    }
    // Jump to a new page
    $("#game_over").html(
        "<h1>Game Over</h1><h2>" + payload.who_won + " won!</h2>"
    );
    $("#game_over").append(
        '<br><a href="lobby.html?username=' +
        username +
        '" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to the lobby</a>'
    );
});
