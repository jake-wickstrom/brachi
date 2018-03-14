var mouseDownFlag = false;
var canvas = document.getElementById("simCanvas");
var ctx = canvas.getContext("2d");

var xpoints = new Array();
var ypoints = new Array();
var pointsCounter = 0;

function getMouseLoc(event) {
  if (mouseDownFlag) {
    var x = event.clientX;
    var y = event.clientY;
    xpoints[pointsCounter] = x;
    ypoints[pointsCounter] = y;
    connectPoints(xpoints[pointsCounter - 1], ypoints[pointsCounter - 1], xpoints[pointsCounter], ypoints[pointsCounter]);
    pointsCounter++;
  }
}

function connectPoints(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function mouseDown(event) {
  mouseDownFlag = true;
  var x = event.clientX;
  var y = event.clientY;
  xpoints[pointsCounter] = x;
  ypoints[pointsCounter] = y;
  pointsCounter++;
}

function mouseUp(event) {
  mouseDownFlag = false;
  pointsCounter = 0;
}
