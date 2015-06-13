
var Rx = require('rx');
var randomstring = require("randomstring");

console.log('Current time: ' + Date.now());

var source = Rx.Observable.timer(
  5000, /* 5 seconds */
  1000 /* 1 second */)
   .timestamp();

var subscription = source.subscribe(
  function (x) {
    console.log(x.value + ': ' + x.timestamp);
  });

