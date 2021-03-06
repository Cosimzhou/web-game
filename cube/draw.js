var gl;
var canvas;
var shaderProgram;
var floorVertexPositionBuffer;
var floorVertexIndexBuffer;
var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;

var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixStack;

function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i = 0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch (e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    // 添加动态属性记录画布的大小
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function setupShaders() {
  // 从 DOM 上创建对应的着色器
  var vertexShader = loadShaderFromDOM("shader-vs");
  var fragmentShader = loadShaderFromDOM("shader-fs");

  // 创建程序并连接着色器
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // 连接失败的检测
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // 使用着色器
  gl.useProgram(shaderProgram);

  // 获取 attribute 属性的位置
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram,
    "aVertexColor");
  // 获取 uniform 属性的位置
  shaderProgram.uniformMVMatrix = gl.getUniformLocation(shaderProgram,
    "uMVMatrix");
  shaderProgram.uniformProjMatrix = gl.getUniformLocation(shaderProgram,
    "uPMatrix");

  // 设定 aVertexColor 属性为数组类型的变量数据
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  // 初始化矩阵
  modelViewMatrix = glMatrix.mat4.create();
  projectionMatrix = glMatrix.mat4.create();
  modelViewMatrixStack = [];
}

function loadShaderFromDOM(id) {
  // 获取 DOM
  var shaderScript = document.getElementById(id);

  if (!shaderScript) {
    return null;
  }

  // 获取着色器代码
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  // 创建着色器
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  // 编译着色器
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  // 判断编译是否成功
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function setupBuffers() {
  setupFloorBuffers();
  setupCubeBuffers();
}

function setupFloorBuffers() {
  floorVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);

  var floorVertexPosition = [
                // Plane in y=0
                5.0, 0.0, 5.0, //v0
                5.0, 0.0, -5.0, //v1
                -5.0, 0.0, -5.0, //v2
                -5.0, 0.0, 5.0]; //v3

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(floorVertexPosition), gl
    .STATIC_DRAW);

  floorVertexPositionBuffer.itemSize = 3;
  floorVertexPositionBuffer.numberOfItems = 4;

  floorVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);
  var floorVertexIndices = [0, 1, 2, 3];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(
    floorVertexIndices), gl.STATIC_DRAW);
  floorVertexIndexBuffer.itemSize = 1;
  floorVertexIndexBuffer.numberOfItems = 4;
}

function setupCubeBuffers() {
  cubeVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

  var cubeVertexPosition = [
                // Front face
                1.0, 1.0, 1.0, //v0
                -1.0, 1.0, 1.0, //v1
                -1.0, -1.0, 1.0, //v2
                1.0, -1.0, 1.0, //v3

                // Back face
                1.0, 1.0, -1.0, //v4
                -1.0, 1.0, -1.0, //v5
                -1.0, -1.0, -1.0, //v6
                1.0, -1.0, -1.0, //v7

                // Left face
                -1.0, 1.0, 1.0, //v8
                -1.0, 1.0, -1.0, //v9
                -1.0, -1.0, -1.0, //v10
                -1.0, -1.0, 1.0, //v11

                // Right face
                1.0, 1.0, 1.0, //12
                1.0, -1.0, 1.0, //13
                1.0, -1.0, -1.0, //14
                1.0, 1.0, -1.0, //15

                // Top face
                1.0, 1.0, 1.0, //v16
                1.0, 1.0, -1.0, //v17
                -1.0, 1.0, -1.0, //v18
                -1.0, 1.0, 1.0, //v19

                // Bottom face
                1.0, -1.0, 1.0, //v20
                1.0, -1.0, -1.0, //v21
                -1.0, -1.0, -1.0, //v22
                -1.0, -1.0, 1.0, //v23
            ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertexPosition), gl
    .STATIC_DRAW);
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numberOfItems = 24;

  cubeVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

  var cubeVertexIndices = [
                0, 1, 2, 0, 2, 3, // Front face
                4, 6, 5, 4, 7, 6, // Back face
                8, 9, 10, 8, 10, 11, // Left face
                12, 13, 14, 12, 14, 15, // Right face
                16, 17, 18, 16, 18, 19, // Top face
                20, 22, 21, 20, 23, 22 // Bottom face
            ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices),
    gl.STATIC_DRAW);
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numberOfItems = 36;
}

var ang = 0,
  radius = 15;

function draw() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 设置为正交矩阵
  //glMatrix.mat4.ortho(projectionMatrix, -8, 8, -8, 8, 0.1, 100);
  // 设置为透视矩阵
  glMatrix.mat4.perspective(projectionMatrix, 60 * Math.PI / 180, gl
    .viewportWidth / gl.viewportHeight, 0.1, 100);
  // 初始化模型视图矩阵
  glMatrix.mat4.identity(modelViewMatrix);
  glMatrix.mat4.lookAt(modelViewMatrix, [radius * Math.cos(ang), 5.5 + 5 * Math
    .sin(ang / 3), radius * Math.sin(ang)], [0, 2, 0], [0, 1, 0]);

  uploadModelViewMatrixToShader();
  uploadProjectionMatrixToShader();

  // 绘制地板
  drawFloor(1, 0, 0, 1);

  // 绘制桌子
  pushModelViewMatrix();
  glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0, 1.1, 0]);
  uploadModelViewMatrixToShader();
  drawTable();
  popModelViewMatrix();

  // 绘制桌子上的小盒子
  pushModelViewMatrix();
  glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0, 2.7, 0]);
  glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [0.5, 0.5, 0.5]);
  uploadModelViewMatrixToShader();
  drawCube(0, 0, 1, 1);
  popModelViewMatrix()

  // 绘制桌子上的小小盒子
  pushModelViewMatrix();
  glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0, 3.45, 0]);
  glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [0.25, 0.25, 0.25]);
  uploadModelViewMatrixToShader();
  drawCube(0, 1, 0, 1);
  popModelViewMatrix()

  // 绘制桌子上的小小小盒子
  pushModelViewMatrix();
  glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0, 3.825, 0]);
  glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [0.125, 0.125, 0.125]);
  uploadModelViewMatrixToShader();
  drawCube(0.35, 0, 0.8, 1);
  popModelViewMatrix()
}

function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformMVMatrix, false,
    modelViewMatrix);
}

function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformProjMatrix, false,
    projectionMatrix);
}

// 将 modelViewMatrix 矩阵压入堆栈
function pushModelViewMatrix() {
  var copyToPush = glMatrix.mat4.clone(modelViewMatrix);
  modelViewMatrixStack.push(copyToPush);
}

// 从矩阵堆栈中取出矩阵并设定为当前的 modelViewMatrix 矩阵
function popModelViewMatrix() {
  if (modelViewMatrixStack.length == 0) {
    throw "Error popModelViewMatrix() - Stack was empty ";
  }
  modelViewMatrix = modelViewMatrixStack.pop();
}

function drawFloor(r, g, b, a) {
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);

  gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLE_FAN, floorVertexIndexBuffer.numberOfItems, gl
    .UNSIGNED_SHORT, 0);
}

function drawTable() {
  pushModelViewMatrix();
  glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 1.0,
      0.0]);
  glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [2.0, 0.1, 2.0]);
  uploadModelViewMatrixToShader();
  // 绘制桌面
  drawCube(0.72, 0.53, 0.04, 1.0);
  popModelViewMatrix();

  // 绘制 4 个腿
  for (var i = -1; i <= 1; i += 2) {
    for (var j = -1; j <= 1; j += 2) {
      pushModelViewMatrix();
      glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, [i * 1.9, -
            0.1, j * 1.9]);
      glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, [0.1, 1.0,
          0.1]);
      uploadModelViewMatrixToShader();
      drawCube(0.72, 0.53, 0.04, 1.0);
      popModelViewMatrix();
    }
  }
}

function drawCube(r, g, b, a) {
  gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.vertexAttrib4f(shaderProgram.vertexColorAttribute, r, g, b, a);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems, gl
    .UNSIGNED_SHORT, 0);
}

function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.enable(gl.DEPTH_TEST);
  update();
}

function update() {
  requestAnimationFrame(update);

  gl.clearColor(0, 0, 0, 1);
  draw();
  ang += 0.05;
}
