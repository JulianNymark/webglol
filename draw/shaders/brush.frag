precision mediump float;

uniform vec3 u_random;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

void main(void) {
    vec2 pixel_position = gl_FragCoord.xy / u_resolution.xy;
    float mouse_distance = distance(u_mouse, pixel_position);

    if (mouse_distance <= 0.01) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
}
