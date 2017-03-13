function getShaders(shaderNames) {
  var shaders = {};

  return new Promise(function(resolve, reject){
    // barrier for catching async loading of shaders :)
    var barrier = {
      limit: shaderNames.length,
      current: 0,
      hit: function() {
        this.current += 1;
        if (this.current >= this.limit) { this.breach(); }
      },
      breach: function() {
        resolve(shaders);
      },
      init: function() {
        return this;
      }
    }.init();

    for (i = 0; i < shaderNames.length; i++ ) {
      sendShaderGet(shaderNames[i])
        .then(function(resolved, rejected) {
          shaders[resolved[0]] = resolved[1];
          barrier.hit();
        });
    }
  });
}

function sendShaderGet(shaderName){
  return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "shaders/" + shaderName);
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        resolve([shaderName, this.responseText]);
      }
    };
    xhr.send();
  });
}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function shaderProgram(vertShaderName, fragShaderName) {
  shaders[vertShaderName] = createShader(gl, gl.VERTEX_SHADER, shaderSource[vertShaderName]);
  shaders[fragShaderName] = createShader(gl, gl.FRAGMENT_SHADER, shaderSource[fragShaderName]);

  return createProgram(gl, shaders[vertShaderName], shaders[fragShaderName]);
}

function shaderCleanup(programName, vertShaderName, fragShaderName){
  if (typeof shaderPrograms[programName] !== 'undefined') {
    gl.deleteProgram(shaderPrograms[programName]);
  }
  if (typeof shaders[vertShaderName] !== 'undefined') {
    gl.deleteShader(shaders[vertShaderName]);
  }
  if (typeof shaders[fragShaderName] !== 'undefined') {
    gl.deleteShader(shaders[fragShaderName]);
  }
}

function glError(){
  var glErrorEnum = [
    'NO_ERROR',
    'INVALID_ENUM',
    'INVALID_VALUE',
    'INVALID_OPERATION',
    'INVALID_FRAMEBUFFER_OPERATION',
    'OUT_OF_MEMORY',
    'CONTEXT_LOST_WEBGL'
  ];
  console.log('gl.getError:', glErrorEnum[gl.getError()]);
}

const numFramesToAverage = 16;
var frameTimeHistory = [];
var frameTimeIndex = 0;
var totalTimeForFrames = 0.0;
var fpsElement = document.getElementById("fps");
function fpsCounter(dt){
  totalTimeForFrames += dt;
  totalTimeForFrames -= (frameTimeHistory[frameTimeIndex] || 0);
  frameTimeHistory[frameTimeIndex] = dt;
  frameTimeIndex = (frameTimeIndex + 1) % numFramesToAverage;

  var averageElapsedTime = totalTimeForFrames / numFramesToAverage;
  var fps = 1 / averageElapsedTime;
  fpsElement.innerText = fps.toFixed(0);
}

function addEventListeners(theElement) {
  theElement.addEventListener('mousewheel', function(event){
    (event.wheelDelta > 0) ? onScrollUp() : onScrollDown();
  });

  theElement.addEventListener('DOMMouseScroll', function(event){
    (event.detail > 0) ? onScrollUp() : onScrollDown();
  });
}
