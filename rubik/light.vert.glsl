attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;

varying vec4 vColor;

void main() {
    vColor         = aVertexColor;

    gl_Position    = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
}
