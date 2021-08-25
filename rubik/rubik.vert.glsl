attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;

uniform mat4 uMMatrix;
uniform mat4 invMMatrix;
uniform mat4 uVMatrix;
uniform mat4 invVMatrix;
uniform mat4 uPMatrix;
uniform mat4 invPMatrix;

uniform vec3 lightDirection;
uniform vec3 eyeDirection;
uniform vec4 ambientColor;

varying vec4 vColor;

void main() {
    vec3  invLight = normalize(invMMatrix *invVMatrix * invPMatrix * vec4(lightDirection, 0.0)).xyz;
    vec3  invEye   = normalize(invMMatrix *invVMatrix * invPMatrix * vec4(eyeDirection, 0.0)).xyz;
    vec3  halfLE   = normalize(invLight + invEye);
    float diffuse  = clamp(dot(aVertexNormal, invLight), 0.0, 0.9);
    float specular = pow(clamp(dot(aVertexNormal, halfLE), 0.0, 1.0), 50.0);
    vec4  light    = aVertexColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0);
    vColor         = light + ambientColor;

    gl_Position    = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
}
