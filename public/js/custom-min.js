"use strict";

var xo = document.getElementById("logo");

function reversiLogo() {
  if (xo != null) {
    if (xo.classList.contains("reversi")) {
      xo.classList.remove("reversi");
      xo.classList.add("isrever");
    } else {
      xo.classList.remove("isrever");
      xo.classList.add("reversi");
    }
  }
}

if (xo != null) {
  xo.onmouseover = function() {
    reversiLogo();
  };
}

window.addEventListener("load", function() {
  var e = setInterval(function() {
    return reversiLogo();
  }, 500);
  setTimeout(function() {
    clearInterval(e);
    console.log("stop spinning");
  }, 1e3);
}, false);

$(document).ready(function() {
  if ($("#messages").length > 0) {
    $("#messages").stop().animate({
      scrollTop: $("#messages")[0].scrollHeight
    }, 800);
  }
});