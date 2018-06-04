/*use 'esversion: 6'*/
/*========================
  | Author: Paul Tutty   |
  |   Date: May 15, 2018 |
  ========================*/
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

// 1. wait for hover 
// 2. call function
xo.onmouseover = function () {
  reversiLogo();
};

// run spin animation onload for 2.5s
window.addEventListener("load", function () {
  let timer = setInterval(() => reversiLogo(), 500);
  setTimeout(() => {
    clearInterval(timer);
    console.log('stopping timer');
  }, 1000);
}, false);
