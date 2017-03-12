precision mediump float;
uniform vec3 random;
uniform vec2 mouse;
uniform vec2 resolution;

void main(void) {
    vec2 pixel_position = gl_FragCoord.xy / resolution.xy;
    float mouse_distance = distance(mouse, pixel_position);

    if (mouse_distance >= 0.1) {
        float intensity = 1.0 - mouse_distance;
        gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
    } else {
        gl_FragColor = vec4(1.0, .9, .9, 1.0);
    }
}
