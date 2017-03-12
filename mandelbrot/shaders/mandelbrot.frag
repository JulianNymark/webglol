precision highp float;
precision mediump int;

uniform vec2 resolution;

#ifndef NUM_STEPS
const int num_steps = 31;
#else
const int num_steps = NUM_STEPS;
#endif

void main() {

    float normalizedX;
    float normalizedY;
    float x;
    float y;
    int steps;

    normalizedX = (gl_FragCoord.x - resolution.x/2.0) / resolution.x *
        2.0 *
        (resolution.x / resolution.y) - 0.5;
    normalizedY = (gl_FragCoord.y - resolution.y/2.0) / resolution.y * 2.0;

    vec2 z = vec2(normalizedX, normalizedY);

    for (int i=0; i<num_steps; i++) {
        steps = i;

        x = (z.x * z.x - z.y * z.y) + normalizedX;
        y = (z.y * z.x + z.x * z.y) + normalizedY;

        if((x * x + y * y) > 4.0) {
            break;
		}

        z.x = x;
        z.y = y;

    }

    if (steps == num_steps-1) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
