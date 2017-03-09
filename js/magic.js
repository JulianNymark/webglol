document.addEventListener("DOMContentLoaded", function() {
  main();
});

var gl;
var fragmentShaderSource;
var vertexShaderSource;

function main() {
  console.log('main');

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
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling a shader: ' + gl.getShaderInfoLog(fragmentShader));
  }

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.log('An error occurred compiling a shader: ' + gl.getShaderInfoLog(vertexShader));
  }

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log('Unable to link the shader program: ' + gl.getProgramInfoLog(shaderProgram));
  }

  gl.useProgram(shaderProgram);

  squareVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);

  var vertices = [
    1.0, 1.0,  0.0,
   -1.0, 1.0,  0.0,
    1.0, -1.0, 0.0,
   -1.0, -1.0, 0.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // CONTINUE HERE
  drawScene();
}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

  mvMatrix = Matrix.I(4);
  mvTranslate([-0.0, 0.0, -6.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
  var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));

  var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

function makePerspective(FOV, AspectRatio, Closest, Farest){
  var YLimit = Closest * Math.tan(FOV * Math.PI / 360);
  var A = -( Farest + Closest ) / ( Farest - Closest );
  var B = -2 * Farest * Closest / ( Farest - Closest );
  var C = (2 * Closest) / ( (YLimit * AspectRatio) * 2 );
  var D = (2 * Closest) / ( YLimit * 2 );
  return [
    C, 0, 0, 0,
    0, D, 0, 0,
    0, 0, A, -1,
    0, 0, B, 0
  ];
}

function makeTransform(Object){
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, -6, 1
  ];
}
