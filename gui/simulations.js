const GRAV = 9.81;
const M = 1;
const MARBLE_RADIUS = 5;
const FILTER_INTERVAL = 20;
const CANVAS_WIDTH_SCALE = 1;
const CANVAS_HEIGHT_SCALE = 0.8;
const TIMESCALE = 4;
const DISTANCE_FILTER = 20;
const NUM_SPLINE_POINTS = 1000;

var mouseDownFlag = false;
var canvas = document.getElementById("simCanvas");
var ctx = canvas.getContext("2d");

canvas.width = $('#canvasCol').width();
canvas.height = window.innerHeight * CANVAS_HEIGHT_SCALE;

// arrays of unfiltered x and y points captured during mouse movement
var xpoints = [];
var ypoints = [];

var runAnimation = false;
var marble;
var finePath;

$(document).ready(function() {
  document.getElementById('simCanvas').addEventListener('mousemove', getMouseLoc);
  document.getElementById('simCanvas').addEventListener('mousedown', mouseDown);
  document.getElementById('simCanvas').addEventListener('mouseup', mouseUp);
  //document.getElementById('simCanvas').addEventListener('mouseout', mouseUp); //TODO: fix this so it doesn't affect the animation
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
    marble.startTimer();
    animate();
  });

  document.getElementById("backButton").addEventListener("click", function() {
    // TODO: figure this out
  });
});

// arclen parameter is optional
function Path(xpath, ypath, arclen = []) {
  this.xpath = xpath;
  this.ypath = ypath;
  this.arclen =  arclen;

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

function Marble(path, pathTimes, directions) {
  this.xpath = path.xpath;
  this.ypath = path.ypath;
  this.pathTimes = pathTimes;
  this.directions = directions;
  this.x = this.xpath[0];
  this.y = this.ypath[0];
  this.pathIndex = 0;
  this.timer = 0;
  this.turningPoint = Number.POSITIVE_INFINITY;
  var movingBackwards = false;

  for(var i = 0; i < this.directions.length; i++) {
    if(this.directions[i] <= 0) {
      this.turningPoint = i;
      break;
    }
  }

  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, MARBLE_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  this.update = function() {
    if ((this.directions[this.pathIndex] == true) && !movingBackwards) { // check if moving forward
      if(this.pathIndex == this.directions.length - 1) { // stop animation if path is complete
        runAnimation = false;
      }
      this.pathIndex++;
    } else if ((this.directions[this.pathIndex] == false) && !movingBackwards) { // check if turning point reached
      movingBackwards = true;
      this.pathIndex--;
    } else {
      // check if marble has gone back to beginning of path
      if (this.pathIndex > 0) {
        this.pathIndex--;
      } else {
        movingBackwards = false;
        this.pathIndex++;
      }
    }
    this.x = this.xpath[this.pathIndex];
    this.y = this.ypath[this.pathIndex];
  }

  this.reset = function() {
    this.xpath = [];
    this.ypath = []
    this.pathTimes = [];
    this.directions = [];
  }

  this.startTimer = function(timestamp) {
    this.timer = performance.now();
  }

  this.waitTimer = function() {
    var dtPath = this.pathTimes[this.pathIndex] * 1000 / TIMESCALE;
    if(!movingBackwards) {
      var inc = 1;
    } else {
      var inc = -1;
    }

    while (this.getTimer() > dtPath && this.pathIndex < pathTimes.length - 1) {
      if(this.pathIndex < this.turningPoint) {
        this.pathIndex += inc;
        dtPath += this.pathTimes[this.pathIndex] * 1000 / TIMESCALE;
      }
    }
    while (this.getTimer() < dtPath) {}
  }

  this.getTimer = function() {
    return performance.now() - this.timer;
  }
}

function simulate(path) {
  var v0 = 0;
  var t = 0;
  var times = [];
  var directions = [];
  var movingForward = true;
  var u0 = M * GRAV * invY(path.ypath[0]);
  var k0 = 0.5 * M * v0 * v0;
  times.push(0);
  directions.push(true);

  for (var i = 1; i < path.ypath.length; i++) {
    var u = M * GRAV * invY(path.ypath[i]); // TODO: change this so it calls a poptential energy function
    //var dy = invY(path.ypath[i]) - invY(path.ypath[i - 1]);
    var ds = path.arclen[i] - path.arclen[i - 1];
    var vSqr = (u0 - u + k0) * 2 / M;
    var dt;

    if (vSqr > 0) {
      if (movingForward) {
        directions.push(true);
      } else {
        directions.push(false);
      }

      //dt = Math.sqrt((DX * DX + dy * dy) / vSqr);
      dt = ds / Math.sqrt(vSqr);
    } else if (vSqr <= 0) {
      directions.push(false);
      movingForward = false;
      dt = 0; //TODO: this might be wrong
      t = Number.POSITIVE_INFINITY;
      break;
    }

    times.push(dt);
    t += dt;
  }

  document.getElementById('info-display').innerHTML = "Your Time: " + t.toFixed(1) + " s";
  marble = new Marble(path, times, directions);
  marble.draw();
}

function animate() {
  if (!runAnimation) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  finePath.draw();
  marble.draw();
  marble.update();
  marble.waitTimer();
  marble.startTimer();
  requestAnimationFrame(animate);
}

// filters points based on their Euclidean distance from each other
function filterPoints(xs, ys) {
  var xfiltered = [];
  var yfiltered = [];
  xfiltered.push(xs[0]);
  yfiltered.push(ys[0]);

  for(var i = 1; i < xs.length; i++) {
    for(var j = i; j < xs.length; j++) {
      var dx = xs[j] - xs[i - 1];
      var dy = ys[j] - ys[i - 1];
      var dist = Math.sqrt(dx * dx + dy * dy);

      if(dist > DISTANCE_FILTER) {
        xfiltered.push(xs[j]);
        yfiltered.push(ys[j]);
        i = j;
        break;
      }
    }
  }

  return new Path(xfiltered, yfiltered);
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
  var x = event.x;
  var y = event.y;
  xpoints.push(x);
  ypoints.push(y);
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, 2, 2);
}

function mouseUp(event) {
  mouseDownFlag = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var filteredPath = filterPoints(xpoints, ypoints);
  var spline = CSPL.paraSpline(filteredPath.xpath, filteredPath.ypath, NUM_SPLINE_POINTS);
  finePath = new Path(spline.xvals, spline.yvals, spline.arcvals);
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
  while (true) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}

// Some of below code modified from https://github.com/morganherlocker/cubic-spline
function construct_arclength_vector(x_points, y_points, arc) { //in x_points y_points, out distances
  //WARNING: THIS METHOD MODIFIES THE VECTOR 'arc'
  var size = x_points.length - 1;
  arc[0] = 0;
  for (var a = 1; a <= size; a++) {
    arc[a] = arc[a - 1] + Math.sqrt(Math.pow((x_points[a] - x_points[a - 1]), 2) + Math.pow((y_points[a] - y_points[a - 1]), 2));
  }
}

function CSPL() {};

CSPL._gaussJ = {};
// in Matrix, out solutions
CSPL._gaussJ.solve = function(A, x) {
  var m = A.length;
  for (var k = 0; k < m; k++) { // column
    // pivot for column
    var i_max = 0;
    var vali = Number.NEGATIVE_INFINITY;
    for (var i = k; i < m; i++)
      if (Math.abs(A[i][k]) > vali) {
        i_max = i;
        vali = Math.abs(A[i][k]);
      }
    CSPL._gaussJ.swapRows(A, k, i_max);

    //if(A[k][k] == 0) console.log("matrix is singular!");

    // for all rows below pivot
    for (var i = k + 1; i < m; i++) {
      var cf = (A[i][k] / A[k][k]);
      for (var j = k; j < m + 1; j++) A[i][j] -= A[k][j] * cf;
    }
  }

  for (var i = m - 1; i >= 0; i--) { // rows = columns
    var v = A[i][m] / A[i][i];
    x[i] = v;
    for (var j = i - 1; j >= 0; j--) { // rows
      A[j][m] -= A[j][i] * v;
      A[j][i] = 0;
    }
  }
}

CSPL._gaussJ.zerosMat = function(r, c) {
  var A = [];
  for (var i = 0; i < r; i++) {
    A.push([]);
    for (var j = 0; j < c; j++) A[i].push(0);
  }
  return A;
}

CSPL._gaussJ.printMat = function(A) {
  for (var i = 0; i < A.length; i++) console.log(A[i]);
}

CSPL._gaussJ.swapRows = function(m, k, l) {
  var p = m[k];
  m[k] = m[l];
  m[l] = p;
}

CSPL.getNaturalKs = function(xs, ys, ks) { // in x values, in y values, out k values
  var n = xs.length - 1;
  var A = CSPL._gaussJ.zerosMat(n + 1, n + 2);

  for (var i = 1; i < n; i++) { // rows
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

  CSPL._gaussJ.solve(A, ks);
}

CSPL.evalSpline = function(x, xs, ys, ks) {
  var i = 1;
  while (xs[i] < x) i++;

  var t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);

  var a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
  var b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);

  var q = (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
  return q;
}

CSPL.evalMany = function(X, xs, ys, ks, Y) { // in X vector, xpoints, ypoints, coefficients : out Y vector
  //WARNING: THIS METHOD MODIFIES THE VECTOR Y

  for (var x = 0; x < X.length; x++) {
    Y[x] = CSPL.evalSpline(X[x], xs, ys, ks);
  }
}

CSPL.linspace = function linspace(a, b, n) {
  if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i, ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}

CSPL.paraSpline = function paraSpline(xpoints, ypoints, N) {
  arc = [];
  kx = [];
  ky = [];
  X = [];
  Y = [];

  construct_arclength_vector(xpoints, ypoints, arc);

  total_arc = arc[arc.length - 1];

  CSPL.getNaturalKs(arc, xpoints, kx);
  CSPL.getNaturalKs(arc, ypoints, ky);

  arcvec = CSPL.linspace(0, total_arc, N);
  CSPL.evalMany(arcvec, arc, xpoints, kx, X);
  CSPL.evalMany(arcvec, arc, ypoints, ky, Y);

  return {
    xvals: X,
    yvals: Y,
    arcvals: arcvec
  };
}
