const GRAV = 9.81;
const M = 1;
const DX = 1;
const MARBLE_RADIUS = 5;
const FILTER_INTERVAL = 20;
const CANVAS_WIDTH_SCALE = 1;
const CANVAS_HEIGHT_SCALE = 0.8;

var mouseDownFlag = false;
var canvas = document.getElementById("simCanvas");
var ctx = canvas.getContext("2d");

canvas.width = $('#canvasCol').width();
canvas.height = window.innerHeight * CANVAS_HEIGHT_SCALE;

var xpoints = [];
var ypoints = [];

var runAnimation = false;
var marble;
var finePath;

$(document).ready(function() {
  document.getElementById('simCanvas').addEventListener('mousemove', getMouseLoc);
  document.getElementById('simCanvas').addEventListener('mousedown', mouseDown);
  document.getElementById('simCanvas').addEventListener('mouseup', mouseUp);
  window.addEventListener('resize', function() {
    canvas.width = $('#canvasCol').width();
    canvas.height = window.innerHeight * CANVAS_HEIGHT_SCALE;
  });

  document.getElementById("resetButton").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    runAnimation = false;
    xpoints = [];
    ypoints = [];
    marble.reset();
    finePath.reset();
  });

  document.getElementById("startButton").addEventListener("click", function() {
    runAnimation = true;
    animate();
  });

  document.getElementById("backButton").addEventListener("click", function() {
    // TODO: figure this out
  });
});

function FinePath(xpath, ypath) {
  this.xpath = xpath;
  this.ypath = ypath;

  this.draw = function() {
    for (var i = 1; i < this.xpath.length; i++) {
      connectPoints(this.xpath[i], this.ypath[i], this.xpath[i - 1], this.ypath[i - 1]);
    }
  }

  this.reset = function() {
    this.xpath = [];
    this.ypath = [];
  }
}

function Marble(xpath, ypath, pathTimes, directions) {
  this.xpath = xpath;
  this.ypath = ypath;
  this.pathTimes = pathTimes;
  this.directions = directions;
  this.x = this.xpath[0];
  this.y = this.ypath[0];
  this.pathIndex = 0;
  var movingBackwards = false;

  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, MARBLE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  this.update = function() {
    if ((this.directions[this.pathIndex] == 1) && !movingBackwards) {
      this.pathIndex++;
    } else if ((this.directions[this.pathIndex] == 0) && !movingBackwards) {
      movingBackwards = true;
      this.pathIndex--;
    } else {
      // check if marble has gone back to beginning of path
      if(this.pathIndex > 0) {
        this.pathIndex--;
      } else {
        movingBackwards = false;
        this.pathIndex++;
      }
    }
    this.x = this.xpath[this.pathIndex];
    this.y = this.ypath[this.pathIndex];
  }

  this.wait = function() {
    //var t0 = new Date().getTime();
    sleep(this.pathTimes[this.pathIndex] * 1000);
    // var t1 = new Date().getTime();
    // var dt = t1 - t0;
    // var t = 0;
    //
    // for (var i = this.pathIndex; i < this.pathTimes.length; i++) {
    //   t += pathTimes[i];
    //   if (t >= (this.pathTimes[this.pathIndex] + dt)) {
    //     this.pathIndex = i;
    //     break;
    //   }
    // }
  }

  this.reset = function() {
    this.xpath = [];
    this.ypath = []
    this.pathTimes = [];
    this.directions = [];
  }
}

function simulate(path) {
  var v0 = 0;
  var t = 0;
  var times = [];
  var directions = [];
  var movingForward = true;
  var u0 = M * GRAV * invY(path.ypath[0]);
  times.push(0);
  directions.push(1);

  for (var i = 1; i < path.ypath.length; i++) {
    var u = M * GRAV * invY(path.ypath[i]);
    var dy = invY(path.ypath[i]) - invY(path.ypath[i - 1]);
    var vSqr = (u0 - u + 0.5 * M * v0 * v0) * 2 / M;
    var dt;

    if (vSqr > 0) {
      if (movingForward) {
        directions.push(1);
      } else {
        directions.push(-1);
      }

      dt = Math.sqrt((DX * DX + dy * dy) / vSqr);
    } else if (vSqr <= 0) {
      directions.push(0);
      movingForward = !movingForward;
      dt = 0; //TODO: this might be wrong
    }

    times.push(dt);
    t += dt;
  }

  document.getElementById('info-display').innerHTML = "Your Time: " + t.toFixed(1) + " s";
  //console.log('Total time: ' + t);
  marble = new Marble(path.xpath, path.ypath, times, directions);
  marble.draw();
}

function animate() {
  if (!runAnimation) {
    return;
  }
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  finePath.draw();
  marble.wait();
  marble.draw();
  marble.update();
}

function filterPoints(intv) {
  var xfiltered = [];
  var yfiltered = [];

  for (var xf = xpoints[0]; xf < xpoints[xpoints.length - 1]; xf += intv) {
    for (var i = 0; i < xpoints.length; i++) {
      if ((xpoints[i] >= xf) && (xpoints[i] <= xf + intv)) {
        xfiltered.push(xpoints[i]);
        yfiltered.push(ypoints[i]);
        break;
      }
    }
  }

  xfiltered.push(xpoints[xpoints.length - 1]);
  yfiltered.push(ypoints[ypoints.length - 1]);
  xpoints = xfiltered;
  ypoints = yfiltered;
}

function getMouseLoc(event) {
  if (mouseDownFlag) {
    var x = event.x;
    var y = event.y;
    xpoints.push(x);
    ypoints.push(y);
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, 2, 2);
  }
}


function mouseDown(event) {
  mouseDownFlag = true;
  xpoints.push(event.x);
  ypoints.push(event.y);
}

function mouseUp(event) {
  mouseDownFlag = false;
  var xfine = [];
  var yfine = [];
  filterPoints(FILTER_INTERVAL);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var x = xpoints[0]; x < xpoints[xpoints.length - 1]; x += DX) {
    var y = spline(x, xpoints, ypoints);
    xfine.push(x);
    yfine.push(y);
  }

  finePath = new FinePath(xfine, yfine);
  finePath.draw();
  simulate(finePath);
}

function connectPoints(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// inverts y values such that direction of y-axis is flipped
function invY(y) {
  return canvas.height - y;
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  while(true) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

// Below code taken from https://github.com/morganherlocker/cubic-spline

function spline(x, xs, ys) {
  var ks = xs.map(function() {
    return 0
  })
  ks = getNaturalKs(xs, ys, ks)
  var i = 1;
  while (xs[i] < x) i++;
  var t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
  var a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
  var b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
  var q = (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
  return q;
}

function getNaturalKs(xs, ys, ks) {
  var n = xs.length - 1;
  var A = zerosMat(n + 1, n + 2);

  for (var i = 1; i < n; i++) // rows
  {
    A[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
    A[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
    A[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
    A[i][n + 1] = 3 * ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) + (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])));
  }

  A[0][0] = 2 / (xs[1] - xs[0]);
  A[0][1] = 1 / (xs[1] - xs[0]);
  A[0][n + 1] = 3 * (ys[1] - ys[0]) / ((xs[1] - xs[0]) * (xs[1] - xs[0]));

  A[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
  A[n][n] = 2 / (xs[n] - xs[n - 1]);
  A[n][n + 1] = 3 * (ys[n] - ys[n - 1]) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]));

  return solve(A, ks);
}


function solve(A, ks) {
  var m = A.length;
  for (var k = 0; k < m; k++) // column
  {
    // pivot for column
    var i_max = 0;
    var vali = Number.NEGATIVE_INFINITY;
    for (var i = k; i < m; i++)
      if (A[i][k] > vali) {
        i_max = i;
        vali = A[i][k];
      }
    swapRows(A, k, i_max);

    // for all rows below pivot
    for (var i = k + 1; i < m; i++) {
      for (var j = k + 1; j < m + 1; j++)
        A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
      A[i][k] = 0;
    }
  }
  for (var i = m - 1; i >= 0; i--) // rows = columns
  {
    var v = A[i][m] / A[i][i];
    ks[i] = v;
    for (var j = i - 1; j >= 0; j--) // rows
    {
      A[j][m] -= A[j][i] * v;
      A[j][i] = 0;
    }
  }
  return ks;
}

function zerosMat(r, c) {
  var A = [];
  for (var i = 0; i < r; i++) {
    A.push([]);
    for (var j = 0; j < c; j++) A[i].push(0);
  }
  return A;
}

function swapRows(m, k, l) {
  var p = m[k];
  m[k] = m[l];
  m[l] = p;
}
