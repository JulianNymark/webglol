precision mediump float;
uniform vec3 random;
uniform vec2 mouse;
uniform vec2 resolution;

void main(void) {
    vec2 pixel_position = gl_FragCoord.xy / resolution.xy;
    vec2 mouse_distance_taxi = mouse - pixel_position;

	float intensity = 1.0 - (mouse_distance_taxi.x / mouse_distance_taxi.y);//length(mouse_distance_taxi);
    gl_FragColor = vec4(intensity, intensity, intensity, 1.0);
}
