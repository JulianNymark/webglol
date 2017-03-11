#define NUM_STEPS   50
#define ZOOM_FACTOR 2.0
#define X_OFFSET    0.5

precision highp float;
precision mediump int;

void main() {
    vec2 z;
    float x,y;
    int steps;
    float normalizedX = (gl_FragCoord.x - 500.0) / 1000.0 * ZOOM_FACTOR *
        (1000.0 / 1000.0) - X_OFFSET;
    float normalizedY = (gl_FragCoord.y - 500.0) / 1000.0 * ZOOM_FACTOR;

    z.x = normalizedX;
    z.y = normalizedY;

    for (int i=0;i<NUM_STEPS;i++) {
        steps = i;

        x = (z.x * z.x - z.y * z.y) + normalizedX;
        y = (z.y * z.x + z.x * z.y) + normalizedY;

        if((x * x + y * y) > 4.0) {
            break;
		}

        z.x = x;
        z.y = y;
    }

    if (steps == NUM_STEPS-1) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
}
