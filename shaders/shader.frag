precision mediump float;
uniform vec3 random;

void main(void) {
  gl_FragColor = vec4(random, 1.0);
}
