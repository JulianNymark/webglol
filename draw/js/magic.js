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

  // shaderSource fetching (ideally JS should find filenames itself?)
  getShaders(['1.vert', 'brush.frag'])
    .then(function(resolved, rejected) {
      shaderSourceOriginal = resolved;
      processShaders();
      afterShaderProcessing();
      mainLoop(); // only call this once! (it's never ending)
    });
}

function processShaders() {
  shaderSource['1.vert'] = shaderSourceOriginal['1.vert'];
  shaderSource['brush.frag'] = shaderSourceOriginal['brush.frag'];

  // delete old shaders & programs
  shaderCleanup('1_brush', '1.vert', 'brush.frag');

  // create new shaders + programs
  shaderPrograms['1_brush'] = shaderProgram('1.vert', 'brush.frag');
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

  positionAttributeLocation = gl.getAttribLocation(shaderPrograms['1_brush'], "a_position");
  s_randomValueLoc = gl.getUniformLocation(shaderPrograms['1_brush'], "random");
  s_mouse = gl.getUniformLocation(shaderPrograms['1_brush'], "mouse");
  s_resolution = gl.getUniformLocation(shaderPrograms['1_brush'], "resolution");
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

function update(dt) {
  fpsCounter(dt);
}

function drawScene() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(shaderPrograms['1_brush']);
  // interact with the program
  gl.uniform3f(s_randomValueLoc, Math.random(), Math.random(), Math.random());
  gl.uniform2f(s_mouse, 0.35, 0.25);
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
