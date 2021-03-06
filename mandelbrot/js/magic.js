document.addEventListener("DOMContentLoaded", function() {
  main();
});

var gl;
var fragmentShaderSource;
var vertexShaderSource;

var shaderSourceOriginal;
var shaderSource = {};
var shaders = {};
var shaderPrograms = {};

var num_steps = 10;

const resolution = {
  x:1000,
  y:1000
};

function main() {
  // canvas
  var canvas = document.createElement('canvas');
  canvas.id = 'thecanvas';
  canvas.width  = resolution.x;
  canvas.height = resolution.y;
  var thecanvas_container = document.getElementById('thecanvas_container');
  thecanvas_container.appendChild(canvas);

  // webglmagic
  gl = canvas.getContext('webgl2');
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // shaderSourceOriginal fetching (ideally JS should find filenames itself?)
  getShaders(['1.vert', 'mandelbrot.frag'])
    .then(function(resolved, rejected) {
      shaderSourceOriginal = resolved;
      processShaders();
      afterShaderProcessing();
      mainLoop(); // only call this once! (it's never ending)
    });

  addEventListeners(thecanvas_container);
}

function onScrollUp() {
  num_steps++;
  processShaders();
  afterShaderProcessing();
}
function onScrollDown() {
  num_steps--;
  processShaders();
  afterShaderProcessing();
}

function processShaders() {
  // prepend NUM_STEPS to mandelbrot shader before compile / recompile
  var define_num_steps = "#define NUM_STEPS " + num_steps + "\n";
  shaderSource['mandelbrot.frag'] = define_num_steps + shaderSourceOriginal['mandelbrot.frag'];
  // no processing needed for the simple vertex shader
  shaderSource['1.vert'] = shaderSourceOriginal['1.vert'];

  // delete old shaders & programs
  shaderCleanup('1_mandelbrot', '1.vert', 'mandelbrot.frag');

  // create new shaders + programs
  shaderPrograms['1_mandelbrot'] = shaderProgram('1.vert', 'mandelbrot.frag');
}

function afterShaderProcessing() {
  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  var vertices = [
    1.0, 1.0,
   -1.0, 1.0,
    1.0, -1.0,

   -1.0, 1.0,
   -1.0, -1.0,
    1.0, -1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  positionAttributeLocation = gl.getAttribLocation(shaderPrograms['1_mandelbrot'], "a_position");
  s_resolution = gl.getUniformLocation(shaderPrograms['1_mandelbrot'], "resolution");
}

var lastTime = Date.now() / 1000;
var dt = 0;

function mainLoop() {
  var now = Date.now() / 1000;
  dt = now - lastTime;
  lastTime = now;

  update(dt);
  drawScene();

  requestAnimationFrame(mainLoop);
};

var numStepElement = document.getElementById("num-steps");
function update(dt) {
  fpsCounter(dt);
  numStepElement.innerText = num_steps;
}

function drawScene() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shaderPrograms['1_mandelbrot']);
  gl.uniform2f(s_resolution, resolution.x, resolution.y);

  drawSquare();
}

function drawSquare(){
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}
