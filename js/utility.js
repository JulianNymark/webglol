function getShaders() {
  return new Promise(function(resolve, reject){

    // barrier for catching async loading of shaders :)
    var barrier = {
      limit: 2,
      current: 0,
      hit: function() {
        this.current += 1;
        if (this.current >= this.limit) {
          this.breach();
        }
      },
      breach: function() {
        resolve()
      },
      init: function() {
        return this;
      }
    }.init();

    // fetch fragment shader
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "shaders/shader.frag");
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        fragmentShaderSource = this.responseText;
        barrier.hit();
      }
    };
    xhr.send();

    // fetch vertex shader
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "shaders/shader.vert");
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        vertexShaderSource = this.responseText;
        barrier.hit();
      }
    };
    xhr.send();

  });
}
