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

var framebuffer;

const resolution = {
  x:1000,
  y:1000
};
var mouse = {
  x:0.0,
  y:0.0
}

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
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0.0, 1.0, 1.0, 1.0); // the color of the void
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  ///// ? testing
  someFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebuffer);

  // Create a texture.
  sometexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, sometexture);

  // Set the parameters so we can render any size image.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution.x, resolution.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.framebufferTexture2D(gl.DRAW_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sometexture, 0);
  //////

  // shaderSource fetching (ideally JS should find filenames itself?)
  getShaders(['one.vert', 'brush.frag', 'canvas.frag'])
    .then(function(resolved, rejected) {
      shaderSourceOriginal = resolved;
      processShaders();
      afterShaderProcessing();
      mainLoop(); // only call this once! (it's never ending)
    });

  // mouseInputListeners
  mouseInputListeners(thecanvas_container);
}

function processShaders() {
  shaderSource['one.vert'] = shaderSourceOriginal['one.vert'];
  shaderSource['brush.frag'] = shaderSourceOriginal['brush.frag'];
  shaderSource['canvas.frag'] = shaderSourceOriginal['canvas.frag'];

  // delete old programs & shaders
  shaderCleanup(['one_brush', 'one_canvas'], ['one.vert', 'brush.frag', 'canvas.frag']);

  // create new shaders + programs
  shaderPrograms['one_brush'] = shaderProgram('one.vert', 'brush.frag');
  shaderPrograms['one_canvas'] = shaderProgram('one.vert', 'canvas.frag');
}

function afterShaderProcessing() {
  // common
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


  // brush stuff
  one_brush_positionLocation = gl.getAttribLocation(shaderPrograms['one_brush'], "a_position");
  one_brush_texcoordLocation = gl.getAttribLocation(shaderPrograms['one_brush'], "a_texCoord");

  one_brush_randomValueLoc = gl.getUniformLocation(shaderPrograms['one_brush'], "u_random");
  one_brush_mouse = gl.getUniformLocation(shaderPrograms['one_brush'], "u_mouse");
  one_brush_resolution = gl.getUniformLocation(shaderPrograms['one_brush'], "u_resolution");

  gl.enableVertexAttribArray(one_brush_positionLocation);

  // canvas stuff
  one_canvas_positionLocation = gl.getAttribLocation(shaderPrograms['one_canvas'], "a_position");
  one_canvas_texcoordLocation = gl.getAttribLocation(shaderPrograms['one_canvas'], "a_texCoord");

  one_canvas_resolution = gl.getUniformLocation(shaderPrograms['one_canvas'], "u_resolution");
  one_canvas_canvastex = gl.getUniformLocation(shaderPrograms['one_canvas'], "u_canvas");

  gl.enableVertexAttribArray(one_canvas_positionLocation);
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
  // draw brush -> canvas
  gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebuffer);
  gl.useProgram(shaderPrograms['one_brush']);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  /* gl.clearColor(0, 0, 0, 0);
   * gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);*/

  gl.uniform3f(one_brush_randomValueLoc, Math.random(), Math.random(), Math.random());
  gl.uniform2f(one_brush_mouse, mouse.x, mouse.y);
  gl.uniform2f(one_brush_resolution, resolution.x, resolution.y);

  drawSquare(one_brush_positionLocation);

  // draw canvas -> GPU framebuffer? (null?)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.useProgram(shaderPrograms['one_canvas']);
  gl.bindTexture(gl.TEXTURE_2D, sometexture);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(one_canvas_canvastex, sometexture);

  drawSquare(one_canvas_positionLocation);
}

function drawSquare(positionLocation){
  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
}
