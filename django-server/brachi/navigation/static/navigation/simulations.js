const GRAV = 0.5;
const M = 2;
const T0 = 0.000001;
const MARBLE_RADIUS = 5;
const FILTER_INTERVAL = 20;
const TIMESCALE = 1;
const DISTANCE_FILTER = 20;
const NUM_SPLINE_POINTS = 1000;
const ENDPOINT_CIRCLE_RADIUS = 15;
const CANVAS_SIZE_SCALE = 0.7;

// below values edited by server
const CONTOUR_IMAGE = "https://github.com/jake-wickstrom/brachi/blob/scale-gui/images/brachi.png?raw=true";
const CONTOUR_IMAGE_OPT = "https://github.com/jake-wickstrom/brachi/blob/scale-gui/images/brachi-optimal.png?raw=true";

const XI_SCALE = 0.1;
const YI_SCALE = 0.9;
const XF_SCALE = 0.9;
const YF_SCALE = 0.1;
// above values edited by server

var mouseDownFlag = false;
var canvas = document.getElementById("simCanvas");
var ctx = canvas.getContext("2d");

// canvas.width = $('#canvasCol').width() * CANVAS_SIZE_SCALE;
// canvas.height = $('#canvasCol').width() * CANVAS_SIZE_SCALE;

canvas.height = $('#simCanvas').width();
canvas.width = $('#simCanvas').width();

const X_START = XI_SCALE * canvas.width;
const Y_START = canvas.height - YI_SCALE * canvas.height;
const X_END = XF_SCALE * canvas.width;
const Y_END = canvas.height - YF_SCALE * canvas.height;

// arrays of unfiltered x and y points captured during mouse movement
var xpoints = [];
var ypoints = [];

var runAnimation = false;
var marble;
var finePath;

var formIndex = 0;

document.getElementById('simCanvas').style.backgroundImage="url(" + CONTOUR_IMAGE + ")";

$(document).ready(function() {
  console.log(canvas.width);
  console.log(canvas.height);

  var endPoints = new EndPoints(X_START, Y_START, X_END, Y_END);
  endPoints.draw();

  document.getElementById('simCanvas').addEventListener('mousemove', getMouseLoc);
  document.getElementById('simCanvas').addEventListener('mousedown', mouseDown);
  document.getElementById('simCanvas').addEventListener('mouseup', mouseUp);
  //document.getElementById('simCanvas').addEventListener('mouseout', mouseUp); //TODO: fix this so it doesn't affect the animation
  window.addEventListener('resize', function() {
    // // canvas.width = $('#canvasCol').width() * CANVAS_SIZE_SCALE;
    // canvas.height = $('#canvasCol').width() * CANVAS_SIZE_SCALE;
    canvas.height = $('#simCanvas').width();
    canvas.width = $('#simCanvas').width();

  });

  document.getElementById("resetButton").addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    endPoints.draw();
    document.getElementById('error-display').innerHTML = "Draw a path that starts and ends in the given circles";
    document.getElementById('simCanvas').style.backgroundImage="url(" + CONTOUR_IMAGE + ")";
    runAnimation = false;
    xpoints = [];
    ypoints = [];

    if((typeof marble !== 'undefined') && (typeof finePath !== 'undefined')) {
      marble.reset();
      finePath.reset();
    }
  });

  document.getElementById("startButton").addEventListener("click", function() {
    if((typeof marble !== 'undefined') && (typeof finePath !== 'undefined')) {
      document.getElementById('error-display').innerHTML = "Simulating the motion of the marble...";
      runAnimation = true;
      marble.startTimer();
      animate();
    }
  });

  document.getElementById("solnButton").addEventListener("click", function() {
    document.getElementById('simCanvas').style.backgroundImage="url(" + CONTOUR_IMAGE_OPT + ")";
    document.getElementById('opt-time').innerHTML = "Optimal Time: " + 1111 + " s";
  });

  document.getElementById("backButton").addEventListener("click", function() {
    window.location.assign("/navigation/level-select");
  });
});

/*
 * This function is used instead of the usual form submit method as it allows
 * the POST request to submit without refreshing the page.
 */
function submitForm(form) {
  $.ajax({
      data: $("#" + form.getAttribute("id")).serialize(),
      type: $("#" + form.getAttribute("id")).attr('method'),
      url:  $("#" + form.getAttribute("id")).attr('action'),
      success: function() {
          console.log("Submitted time.");
      },
      error: function() {
          console.log("Failed to submit time.");
      }
  });
}

/*
 * This function is used to submit POST requests. A hidden form is created
 * with a unique id which then submits itself using the submitForm() function.
 * PLEASE do not sent invalid times (NaN, inf, negative times) to the backend.
 *
 * To use this:
 * 1. Create a dictionary with the information to pass to the form:
 *    var dict = [];
 *    dict.push({
 *      key: "level",
 *      value: 1
 *    });
 *    You can repeat the "push" for all of the variables needed in the form.
 *
 * 2. Make the following function call:
 *    post('navigation/play/submit/', dict);
 */
function post(path, params, method) {
  formIndex = formIndex + 1;
  method = method || "post";
  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);
  form.setAttribute("id", "time-form" + formIndex)
  for(var key in params) {
    if(params.hasOwnProperty(key)) {
        var hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", params[key].key);
        hiddenField.setAttribute("value", params[key].value);
        form.appendChild(hiddenField);
    }
  }
  document.body.appendChild(form);
  submitForm(form); // use the function we made as opposed to the usual form submit behavior
}

// arclen parameter is optional
function Path(xpath, ypath, arclen = []) {
  this.xpath = xpath;
  this.ypath = ypath;
  this.arclen = arclen;

  this.draw = function() {
    for (var i = 1; i < this.xpath.length; i++) {
      connectPoints(this.xpath[i], this.ypath[i], this.xpath[i - 1], this.ypath[i - 1]);
    }
  }

  this.reset = function() {
    this.xpath = [];
    this.ypath = [];
    this.arclen = [];
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

  for (var i = 0; i < this.directions.length; i++) {
    if (this.directions[i] <= 0) {
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
      if (this.pathIndex == this.directions.length - 1) { // stop animation if path is complete
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
    if (!movingBackwards) {
      var inc = 1;
    } else {
      var inc = -1;
    }

    while (this.getTimer() > dtPath && this.pathIndex < pathTimes.length - 1) {
      if (this.pathIndex < this.turningPoint) {
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

function EndPoints(x0, y0, xf, yf) {
  this.x0 = x0;
  this.y0 = y0;
  this.xf = xf;
  this.yf = yf;

  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x0, this.y0, ENDPOINT_CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.xf, this.yf, ENDPOINT_CIRCLE_RADIUS, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function simulate(path) {
  var t = 0;
  var times = [];
  var directions = [];
  var movingForward = true;
  var u0 = getPotential(normX(path.xpath[0]), normY(path.ypath[0]));
  times.push(0);
  directions.push(true);

  for (var i = 1; i < path.ypath.length; i++) {
    var u = getPotential(normX(path.xpath[i]), normY(path.ypath[i]));
    //var dy = invY(path.ypath[i]) - invY(path.ypath[i - 1]);
    //var ds = path.arclen[i] - path.arclen[i - 1];
    // x and y ard normalized so that they are between 0 and 1
    var dx = normX(path.xpath[i]) - normX(path.xpath[i - 1]);
    var dy = normY(path.ypath[i]) - normY(path.ypath[i - 1]);
    var ds = Math.sqrt(dx * dx + dy * dy);
    var vSqr = (u0 - u + T0) * 2 / M;
    var dt;

    if (vSqr > 0) {
      if (movingForward) {
        directions.push(true);
      } else {
        directions.push(false);
      }

      dt = ds / Math.sqrt(vSqr);
    } else if (vSqr <= 0) {
      directions.push(false);
      movingForward = false;
      dt = 0;
      t = Number.POSITIVE_INFINITY;
      break;
    }

    times.push(dt);
    t += dt;
  }

  document.getElementById('info-display').innerHTML = "Your Time: " + t.toFixed(2) + " s";
  // check if the time is valid then send it to the server
  if (!(isNaN(t) || t <= 0.0 || t >= 1000.0)) {
    var time_dict = [];
    time_dict.push({
      key: "level",
      value: level
    });
    time_dict.push({
      key: "time",
      value: t.toFixed(2)
    });
    post('play/submit/', time_dict)
  }

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
function filterPoints(xs, ys, x0, y0, xf, yf) {
  var xfiltered = [];
  var yfiltered = [];
  xfiltered.push(x0);
  yfiltered.push(y0);

  for (var i = 1; i < xs.length; i++) {
    for (var j = i; j < xs.length; j++) {
      var dx = xs[j] - xs[i - 1];
      var dy = ys[j] - ys[i - 1];
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > DISTANCE_FILTER) {
        xfiltered.push(xs[j]);
        yfiltered.push(ys[j]);
        i = j;
        break;
      }
    }
  }

  xfiltered.push(xf);
  yfiltered.push(yf);

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

  // calculate distance path was drawn from end points to check valud path
  var xStartDist = X_START - xpoints[0];
  var yStartDist = Y_START - ypoints[0];
  var xEndDist = X_END - xpoints[xpoints.length - 1];
  var yEndDist = Y_END - ypoints[ypoints.length - 1];
  var distFromStart = Math.sqrt(xStartDist * xStartDist + yStartDist + yStartDist);
  var distFromEnd = Math.sqrt(xEndDist * xEndDist + yEndDist * yEndDist);
  if (distFromStart >= ENDPOINT_CIRCLE_RADIUS || distFromEnd >= ENDPOINT_CIRCLE_RADIUS) {
    console.log('Not a valid path drawn');
    document.getElementById('error-display').innerHTML = "Redraw a valid path starting and ending in the circles";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    xpoints = [];
    ypoints = [];
    var endPoints = new EndPoints(X_START, Y_START, X_END, Y_END);
    endPoints.draw();

  } else {
    document.getElementById('error-display').innerHTML = "Press Start!";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var filteredPath = filterPoints(xpoints, ypoints, X_START, Y_START, X_END, Y_END);
    var spline = CSPL.paraSpline(filteredPath.xpath, filteredPath.ypath, NUM_SPLINE_POINTS);
    finePath = new Path(spline.xvals, spline.yvals, spline.arcvals);
    finePath.draw();
    simulate(finePath);
  }
}

function connectPoints(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// returns potential at given x and y and scales for x and y values between [0, 1]
function getPotential(x, y) {
  return M * GRAV * y;
}

// inverts y values such that direction of y-axis is flipped and normalized them between 0 and 1
function normY(y) {
  return (canvas.height - y) / canvas.height;
}

// normalizes x values between 0 and 1
function normX(x) {
  return x / canvas.width;
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
