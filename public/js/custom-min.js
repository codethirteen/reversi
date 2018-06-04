"use strict";

var xo = document.getElementById("logo");

function reversiLogo() {
  if (xo.classList.contains("reversi")) {
    xo.classList.remove("reversi");
    xo.classList.add("isrever");
  } else {
    xo.classList.remove("isrever");
    xo.classList.add("reversi");
  }
}

xo.onmouseover = function() {
  reversiLogo();
};

window.addEventListener("load", function() {
  var e = setInterval(function() {
    return reversiLogo();
  }, 500);
  setTimeout(function() {
    clearInterval(e);
    console.log("stopping timer");
  }, 1e3);
}, false);