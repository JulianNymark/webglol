document.addEventListener("DOMContentLoaded", function() {
  main();
});

var gl;
var fragmentShaderSource;
var vertexShaderSource;

function main() {
  // canvas
  var canvas = document.createElement('canvas');
  canvas.id = 'thecanvas';
  canvas.width  = 400;
  canvas.height = 400;
  document.body.appendChild(canvas);

  // webglmagic
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // shaders
  getShaders().then(afterLoadingShaders);
}

function afterLoadingShaders() {
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

  shaderProgram = createProgram(gl, vertexShader, fragmentShader);

  positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
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

  randomValueLoc = gl.getUniformLocation(shaderProgram, "random");

  drawScene();
}

function drawScene() {
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(shaderProgram);

  // send random values to the fragment shader
  gl.uniform3f(randomValueLoc, Math.random(), Math.random(), Math.random());

  drawSquare();

  requestAnimationFrame(drawScene);
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
