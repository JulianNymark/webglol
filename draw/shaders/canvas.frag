precision mediump float;

uniform sampler2D u_canvas; // texture
varying vec2 v_texCoord; // the texCoords passed in from the vertex shader.

void main(void) {
    //vec4 color = texture2D(canvas, gl_FragCoord.xy);
    vec4 color = texture2D(u_canvas, v_texCoord);
    gl_FragColor = vec4(color);
}
