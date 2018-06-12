/*========================
  | Author: Paul Tutty   |
  |   Date: May 15, 2018 |
  ========================*/
'use strict';
var xo = document.getElementById('logo');

function reversiLogo() {
  if(xo != null) {
    if (xo.classList.contains('reversi')) {
    xo.classList.remove('reversi');
    xo.classList.add('isrever');
    } else {
      xo.classList.remove('isrever');
      xo.classList.add('reversi');
    }
  }
}

// wait for hover then call function
if(xo != null) {
  xo.onmouseover = function () {
  reversiLogo();
  };
}

// run spin animation onload for 2.5s
window.addEventListener('load', function () {
  var timer = setInterval(() => reversiLogo(), 500);
  setTimeout(() => {
    clearInterval(timer);
    console.log('stop spinning');
  }, 1000);
}, false);

/**
 * jQuery functions below
 */

 // Force chat window scroll to bottom
$(document).ready(function() {
  if ($('#messages').length > 0) {
    $('#messages').stop().animate({
      scrollTop: $('#messages')[0].scrollHeight
    }, 800);
  }
});
