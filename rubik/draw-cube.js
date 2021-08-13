var gl, ctx2d;
var shaderProgram;
var circleVertexBuffer, circleNormalBuffer, circleVertexIndexBuffer,
  circleColorBuffer;
var cubeVertexPositionBuffers;
var cubeVertexIndexBuffer;

var travel = 0;
var modeRotate = 0; // recover: 1, random: 2
var dragging = false,
  click = false;
var oddOrder = true;
var cubeOrderNum = 3;
var cubeOrderHalf = 1;
var surfaceV = 1;
var c2dMargin = (6 * 100 - 500) / 5,
  c2dSide = 100 - 2 * c2dMargin;
var c2dPixelLen;

var currentRotate;
var mayCircle;
var moveCount;
var perspectiveAngle;
var animeCursor;
var radius = 15;

var R = 2.1;
var A90 = Math.PI / 2,
  A180 = Math.PI,
  A270 = -Math.PI / 2,
  A48 = 0.8379118333508581;

/**
 *
 *  The indices of each side on cube surface are as following.
 *
 *                      4 BACK
 *                     /
 *              ______________
 *             /             /|
 *            /      3      / |
 *           /      UP     /  |
 *          /_____________/   |
 *   5 <--- |             | --+--> 2 RIGHT
 *   LEFT   |             |   |
 *          |      1      |   /
 *          |    FRONT    |  /
 *          |             | /
 *          |_____________|/
 *                 |
 *                 V
 *                 6 Down
 *
 *  The subscript of the side vertex buffer in the side array equals the side
 *  index minus one.
 *  The subscript of the side color in the color array equals the side index.
 *
 */

var cubeVertexNormal = [
  [0.0, 0.0, 1.0],
  [1.0, 0.0, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.0],
  [0.0, -1.0, 0.0],
];

var cubeVertexPosition = [
    // Front face
    [1.0, 1.0, 1.0, //v0
    -1.0, 1.0, 1.0, //v1
    -1.0, -1.0, 1.0, //v2
    1.0, -1.0, 1.0], //v3

    // Right face   ***
    [1.0, 1.0, 1.0, //v4
    1.0, -1.0, 1.0, //v5
    1.0, -1.0, -1.0, //v6
    1.0, 1.0, -1.0], //v7

    // Top face
    [1.0, 1.0, 1.0, //v8
    1.0, 1.0, -1.0, //v9
    -1.0, 1.0, -1.0, //v10
    -1.0, 1.0, 1.0], //v11

    // Back face
    [1.0, 1.0, -1.0, //v12
    -1.0, 1.0, -1.0, //v13
    -1.0, -1.0, -1.0, //v14
    1.0, -1.0, -1.0], //v15

    // Left face
    [-1.0, 1.0, 1.0, //v16
    -1.0, 1.0, -1.0, //v17
    -1.0, -1.0, -1.0, //v18
    -1.0, -1.0, 1.0], //v19

    // Bottom face   ***
    [1.0, -1.0, 1.0, //v20
    1.0, -1.0, -1.0, //v21
    -1.0, -1.0, -1.0, //v22
    -1.0, -1.0, 1.0], //v23
];

var colorArray = [
    [0.0, 0.0, 0.0, 1.0], // Black
    [0.0, 0.0, 1.0, 1.0], // Blue
    [1.0, 0.0, 0.0, 1.0], // Red
    [1.0, 0.9, 0.5, 1.0], // Yellow
    [0.0, 1.0, 0.0, 1.0], // Green
    [1.0, 0.45, 0.0, 1.0], // Orange
    [1.0, 1.0, 1.0, 1.0], // White
];

var colorArray2D = [
    "#000", // Black
    "#00f", // Blue
    "#f00", // Red
    "#fe8", // Yellow
    "#0f0", // Green
    "#f60", // Orange
    "#fff", // White
    "#0aa", // Dark Cyan
];

var xyzAxis = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, -1, 0]];

var sideColorMap;
var layerIndices = [-1, 0, 1];

var transformInfos;
var cubeRotateTrace;

var modelMatrix;
var invModelMatrix;
var viewMatrix;
var invViewMatrix;
var invProjMatrix;
var projectionMatrix;
var modelMatrixStack;


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
  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram,
    "aVertexNormal");
  // 设定 aVertexColor 属性为数组类型的变量数据
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  // 获取 uniform 属性的位置
  // matrix
  shaderProgram.uniformMMatrix = gl.getUniformLocation(shaderProgram,
    "uMMatrix");
  shaderProgram.uniformVMatrix = gl.getUniformLocation(shaderProgram,
    "uVMatrix");
  shaderProgram.uniformPMatrix = gl.getUniformLocation(shaderProgram,
    "uPMatrix");
  // inv matrix
  shaderProgram.uniformInvMMatrix = gl.getUniformLocation(shaderProgram,
    'invMMatrix');
  shaderProgram.uniformInvVMatrix = gl.getUniformLocation(shaderProgram,
    'invVMatrix');
  shaderProgram.uniformInvPMatrix = gl.getUniformLocation(shaderProgram,
    'invPMatrix');
  // vector
  shaderProgram.uniformLightDirection = gl.getUniformLocation(shaderProgram,
    'lightDirection');
  shaderProgram.uniformEyeDirection = gl.getUniformLocation(shaderProgram,
    'eyeDirection');
  shaderProgram.uniformAmbientColor = gl.getUniformLocation(shaderProgram,
    'ambientColor');
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


function transformArrayToBuffer(array, unit) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
  buffer.itemSize = unit;
  buffer.numberOfItems = array.length / unit;

  return buffer;
}

function transformIndexBuffer(array) {
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array),
    gl.STATIC_DRAW);
  buffer.itemSize = 1;
  buffer.numberOfItems = array.length;

  return buffer;
}

function setupCubeBuffers() {
  // Vertex Buffer
  cubeVertexPositionBuffers = [
    transformArrayToBuffer(cubeVertexPosition[0], 3),
    transformArrayToBuffer(cubeVertexPosition[1], 3),
    transformArrayToBuffer(cubeVertexPosition[2], 3),
    transformArrayToBuffer(cubeVertexPosition[3], 3),
    transformArrayToBuffer(cubeVertexPosition[4], 3),
    transformArrayToBuffer(cubeVertexPosition[5], 3),
  ];

  // Vertex Index Buffer
  var cubeVertexIndices = [0, 1, 2, 0, 2, 3];
  cubeVertexIndexBuffer = transformIndexBuffer(cubeVertexIndices);
}

function setupCircleBuffer() {
  var array = [];
  var colors = [];
  var indices = [];
  var normals = [];
  var dR = 2,
    h = 0.1;
  var CAP = 36,
    R1 = cubeOrderNum * 1.6,
    R2 = R1 + dR;
  var rR = h * (Math.sqrt(h * h + dR * dR) - h) / dR;
  var uang = 2 * Math.PI / CAP;
  var pidx = 0;
  for (var i = 0; i < CAP; ++i) {
    var ang = uang * i;
    array.push(R1 * Math.cos(ang), R1 * Math.sin(ang), 0);
    array.push(R2 * Math.cos(ang), R2 * Math.sin(ang), h);
    array.push(R2 * Math.cos(ang), R2 * Math.sin(ang), -h);

    normals.push(-Math.cos(ang), -Math.sin(ang), 0);
    normals.push(dR * Math.cos(ang), dR * Math.sin(ang), h);
    normals.push(dR * Math.cos(ang), dR * Math.sin(ang), -h);

    colors.push(0.0, 1.0, 1.0, (i % 2 ? 0.3 : 0.5));
    colors.push(0.0, 1.0, 1.0, 0.7);
    colors.push(0.0, 1.0, 1.0, 0.7);

    if (i < CAP - 1) {
      for (var j = 0, k = 1; j < 3; j++, k = (k + 1) % 3) {
        indices.push(pidx + j, pidx + k, pidx + j + 3);
        indices.push(pidx + j + 3, pidx + k, pidx + k + 3);
      }
      pidx += 3;
    }
  }
  indices.push(pidx, pidx + 1, 0);
  indices.push(0, pidx + 1, 1);

  indices.push(pidx + 1, pidx + 2, 1);
  indices.push(1, pidx + 2, 2);

  indices.push(pidx + 2, pidx, 2);
  indices.push(2, pidx, 0);

  if (circleVertexBuffer) {
    gl.deleteBuffer(circleVertexBuffer);
  }
  if (circleNormalBuffer) {
    gl.deleteBuffer(circleNormalBuffer);
  }
  if (circleColorBuffer) {
    gl.deleteBuffer(circleColorBuffer);
  }
  circleVertexBuffer = transformArrayToBuffer(array, 3);
  circleNormalBuffer = transformArrayToBuffer(normals, 3);
  circleColorBuffer = transformArrayToBuffer(colors, 4);

  if (circleVertexIndexBuffer) {
    gl.deleteBuffer(circleVertexIndexBuffer);
  }
  circleVertexIndexBuffer = transformIndexBuffer(indices);
}


function draw3D() {
  gl.clearColor(0.4, 0.4, 0.4, 1);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 设置为正交矩阵
  //glMatrix.mat4.ortho(projectionMatrix, -8, 8, -8, 8, 0.1, 100);
  // 设置为透视矩阵
  glMatrix.mat4.perspective(projectionMatrix, 60 * Math.PI / 180, gl
    .viewportWidth / gl.viewportHeight, 0.1, 100);
  uploadProjectionMatrixToShader();

  // 初始化模型视图矩阵
  var eyePoint = [radius * Math.sin(perspectiveAngle),
                  8 * Math.sin(perspectiveAngle / 3),
                  radius * Math.cos(perspectiveAngle)];
  gl.uniform3fv(shaderProgram.uniformEyeDirection, eyePoint);

  glMatrix.mat4.identity(viewMatrix);
  glMatrix.mat4.lookAt(viewMatrix, eyePoint, [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.multiply(viewMatrix, viewMatrix, rotateMatrix);
  uploadViewMatrixToShader();

  glMatrix.mat4.identity(modelMatrix);
  for (var tfi in transformInfos) {
    var tf = transformInfos[tfi];
    pushModelMatrix();

    if (currentRotate) {
      var act = currentRotate[tfi];
      if (act) {
        glMatrix.mat4.rotate(modelMatrix, modelMatrix, act[0] *
          animeCursor / 100.0, xyzAxis[act[1]]);
      }
    }

    var trace = cubeRotateTrace[tfi];
    if (trace) {
      for (var i = trace.length - 1, rot; rot = trace[i]; i--) {
        glMatrix.mat4.rotate(modelMatrix, modelMatrix, rot[0], xyzAxis[
          rot[1]]);
      }
    }

    glMatrix.mat4.rotate(modelMatrix, modelMatrix, tf[1], xyzAxis[
      tf[0]]);
    glMatrix.mat4.translate(modelMatrix, modelMatrix, tf[2]);

    uploadModelMatrixToShader();
    drawCube(tf[3]);
    popModelMatrix();
  }

  // [angle, axis, move no, layer]
  var selectedCircle = null;
  if (currentRotate && currentRotate.meta) {
    selectedCircle = currentRotate.meta;
  } else if (mayCircle) {
    selectedCircle = mayCircle;
  }

  if (selectedCircle) {
    var offset = [0, 0, 0];
    offset[selectedCircle[1]] = selectedCircle[3] * R;
    pushModelMatrix();
    glMatrix.mat4.translate(modelMatrix, modelMatrix, offset);
    glMatrix.mat4.rotate(modelMatrix, modelMatrix, A90, xyzAxis[2 -
      selectedCircle[1]]);
    uploadModelMatrixToShader();
    drawCircle();
    popModelMatrix();
  }
}

function uploadViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformVMatrix, false, viewMatrix);
  glMatrix.mat4.invert(invViewMatrix, viewMatrix);
  gl.uniformMatrix4fv(shaderProgram.uniformInvVMatrix, false, invViewMatrix);
}

function uploadModelMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformMMatrix, false, modelMatrix);
  glMatrix.mat4.invert(invModelMatrix, modelMatrix);
  gl.uniformMatrix4fv(shaderProgram.uniformInvMMatrix, false, invModelMatrix);
}

function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.uniformPMatrix, false, projectionMatrix);
  glMatrix.mat4.invert(invProjMatrix, projectionMatrix);
  gl.uniformMatrix4fv(shaderProgram.uniformInvPMatrix, false, invProjMatrix);
}

// 将 modelMatrix 矩阵压入堆栈
function pushModelMatrix() {
  var copyToPush = glMatrix.mat4.clone(modelMatrix);
  modelMatrixStack.push(copyToPush);
}

// 从矩阵堆栈中取出矩阵并设定为当前的 modelMatrix 矩阵
function popModelMatrix() {
  if (modelMatrixStack.length == 0) {
    throw "Error popModelMatrix() - Stack was empty ";
  }
  modelMatrix = modelMatrixStack.pop();
}

function project2D() {
  var matrix = glMatrix.mat4.create();
  for (var tfi in transformInfos) {
    var tf = transformInfos[tfi];
    glMatrix.mat4.identity(matrix);

    var trace = cubeRotateTrace[tfi];
    if (trace) {
      for (var i = trace.length - 1, rot; rot = trace[i]; i--) {
        glMatrix.mat4.rotate(matrix, matrix, rot[0], xyzAxis[rot[1]]);
      }
    }

    glMatrix.mat4.rotate(matrix, matrix, tf[1], xyzAxis[tf[0]]);
    glMatrix.mat4.translate(matrix, matrix, tf[2]);

    projectSubCube2D(tfi, matrix);
  }
}

function findLayer(axis, lyr) {
  var m = glMatrix.mat4.create();
  var result = [];

  lyr *= R;
  for (var tfi in transformInfos) {
    glMatrix.mat4.identity(m);

    var trace = cubeRotateTrace[tfi];
    if (trace) {
      for (var i = trace.length - 1, rot; rot = trace[i]; i--) {
        glMatrix.mat4.rotate(m, m, rot[0], xyzAxis[rot[1]]);
      }
    }

    var tf = transformInfos[tfi];
    glMatrix.mat4.rotate(m, m, tf[1], xyzAxis[tf[0]]);
    glMatrix.mat4.translate(m, m, tf[2]);

    var v = glMatrix.vec4.create();
    v[3] = 1;

    glMatrix.vec4.transformMat4(v, v, m);
    if (Math.abs(lyr - v[axis]) <= 0.01) {
      result.push(tfi);
    }
  }

  return result;
}

var lastLyr = NaN,
  lastAxis = -1,
  lastAng = 0;

function genRandomRotate3() {
  var axisIdx, lyr, differAng = false;
  while (true) {
    axisIdx = parseInt(Math.random() * 3);
    lyr = layerIndices[parseInt(Math.random() * cubeOrderNum)];
    if (axisIdx != lastAxis) break;
    if (lyr != lastLyr) { differAng = true; break; }
  }

  var ang;
  while (true) {
    ang = parseInt(Math.random() * 3);
    if (ang == 0) ang--;
    if (!differAng || ang != lastAng) break;
  }
  lastLyr = lyr;
  lastAxis = axisIdx;
  lastAng = ang;
  ang *= A90;

  console.log("random move:", ang, axisIdx, moveCount, lyr);
  return fillMove(ang, axisIdx, moveCount, lyr);
}

function genRandomRotate() {
  var axisIdx, lyr;
  while (true) {
    axisIdx = parseInt(Math.random() * 3);
    lyr = layerIndices[parseInt(Math.random() * cubeOrderNum)];
    if (axisIdx != lastAxis || lyr != lastLyr) break;
  }
  lastLyr = lyr;
  lastAxis = axisIdx;

  var ang = parseInt(Math.random() * 3);
  if (ang == 0) ang--;
  ang *= A90;

  console.log("random move:", ang, axisIdx, moveCount, lyr);
  return fillMove(ang, axisIdx, moveCount, lyr);
}

function fillMove(ang, axisIdx, moveCount, lyr) {
  var moves = { meta: [ang, axisIdx, moveCount, lyr] };
  var move = [ang, axisIdx + 1, moveCount, lyr];
  var cubes = findLayer(axisIdx, lyr);
  for (var ci of cubes) {
    moves[ci] = move;
  }

  return moves;
}

function pushRecord(act) {
  for (var ci in act) {
    if (cubeRotateTrace[ci] == null)
      cubeRotateTrace[ci] = [];
    cubeRotateTrace[ci].push(act[ci]);
  }

  moveCount++;
}

function focusView(f) {
  perspectiveAngle = 0;
  travel = false;
  glMatrix.mat4.identity(rotateMatrix);
  switch (f) {
    case 0:
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A48, xyzAxis[4]);
      break;
    case 1: // Left front
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A90 / 2, xyzAxis[2]);
      break;
    case 2: // Up front
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, -A90 / 2, xyzAxis[1]);
      break;
    case 3: // Right front
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, -A90 / 2, xyzAxis[2]);
      break;
    case 4: // Down front
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A90 / 2, xyzAxis[1]);
      break;
  }
}

function focusASide(f) {
  perspectiveAngle = 0;
  travel = false;
  glMatrix.mat4.identity(rotateMatrix);
  switch (f) {
    case 1: //
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A180, xyzAxis[2]);
      break;
    case 2: //
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A90, xyzAxis[2]);
      break;
    case 3: //
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A270, xyzAxis[2]);
      break;
    case 4: //
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A90, xyzAxis[1]);
      break;
    case 5: //
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, A270, xyzAxis[1]);
      break;
    default:
      break;
  }
}

function reset() {
  cubeRotateTrace = {};
  moveCount = 0;
  draw2D();
}

function popRecord() {
  if (moveCount <= 0) {
    return null;
  }

  moveCount--;
  action = {};
  for (var ci in cubeRotateTrace) {
    var trace = cubeRotateTrace[ci];
    if (trace && trace.length && trace[trace.length - 1][2] == moveCount) {
      action[ci] = trace[trace.length - 1];
      trace.pop();
    }
  }
  draw2D();
  return action;
}


function drawCube(colors) {
  for (var i = 0; i < 6; i++) {
    var color = i < colors.length ? colors[i] : 0;
    gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    gl.vertexAttrib3f(shaderProgram.vertexNormalAttribute,
      ...cubeVertexNormal[i]);

    gl.disableVertexAttribArray(shaderProgram.vertexColorAttribute);
    gl.vertexAttrib4f(shaderProgram.vertexColorAttribute,
      ...colorArray[color]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffers[i]);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
      cubeVertexPositionBuffers[i].itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numberOfItems, gl
      .UNSIGNED_SHORT, 0);
  }
}

function drawCircle() {
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, circleNormalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
    circleNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, circleColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
    circleColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
    circleVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, circleVertexIndexBuffer);
  gl.drawElements(gl.TRIANGLES, circleVertexIndexBuffer.numberOfItems, gl
    .UNSIGNED_SHORT, 0);
}

/**
 *  The index of the side in 3D space to 2D space conversion.
 *
 *     Surface | Axis | 3D index | 2D index
 *    ---------+------+----------+-----------
 *     Front   |  3   |   1      |    1
 *     Back    |  3   |   4      |    2
 *     Left    |  1   |   5      |    3
 *     Right   |  1   |   2      |    4
 *     Up      |  2   |   3      |    5
 *     Down    |  2   |   6      |    6
 */

function projectSubCube2D(cubeId, matrix) {
  var pos = matrix.slice(12, 15).map(function(x) {
    return parseInt(Math.round(x / R));
  });
  var faceMat = matrix.slice(0, 12).map(function(x) {
    return parseInt(Math.round(x));
  });
  var transInfo = transformInfos[cubeId];

  function findSide(axis, val) {
    val = Math.sign(val);
    for (var i = 0; i < 3; i++) {
      if (val == faceMat[i * 4 + axis]) {
        var n = (i + 1) % 3;
        if (transInfo[3].length >= n) {
          return transInfo[3][n];
        } else
          return 0;
      }
    }
    return 0;
  }

  for (var axis = 0, s, x, y, c; axis < 3; axis++) {
    var vaxis = pos[axis];
    if (Math.abs(vaxis) < surfaceV) continue;
    var saxis = Math.sign(vaxis);

    // Get side
    s = (axis + 1) % 3 << 1;
    if (vaxis > 0) {
      if (axis == 0) s = 3;
    } else if (vaxis < 0) {
      if (axis) s++;
    }

    // Get color
    c = findSide(axis, vaxis);

    // Get x,y at certain side
    if (axis == 0) {
      // Left or right
      x = -pos[2] * saxis;
      y = -pos[1];
    } else if (axis == 2) {
      // front or back
      x = pos[0] * saxis;
      y = -pos[1];
    } else {
      // Up or down
      x = pos[0];
      y = pos[2] * saxis;
    }

    if (oddOrder) {
      x = parseInt(x + cubeOrderHalf);
      y = parseInt(y + cubeOrderHalf);
    } else {
      if (x < 0) x--;
      if (y < 0) y--;
      x = parseInt(x / 2 + cubeOrderHalf);
      y = parseInt(y / 2 + cubeOrderHalf);
    }

    sideColorMap[s][x][y] = c;
  }
}


function setPixelSide(s) {
  ctx2d.translate(c2dMargin + (c2dMargin + c2dSide) * s, c2dMargin);
  ctx2d.scale(c2dPixelLen, c2dPixelLen);
  ctx2d.translate(0.05, 0.05);
}

function drawPixel(x, y, c) {
  ctx2d.beginPath();
  ctx2d.fillStyle = colorArray2D[c];
  ctx2d.rect(x, y, 0.9, 0.9);
  ctx2d.fill();
  ctx2d.closePath();
}

/***********************************************
 *
 *  axis | side | horizon | vertical | reverse
 * ------+------+---------+----------+---------
 *  0 x  |  0   |         |    1     |
 *       |  1   |         |    1     |    1
 *       |  4   |         |    1     |
 *       |  5   |         |    1     |
 *  1 y  |  0   |    1    |          |    1
 *       |  1   |    1    |          |    1
 *       |  2   |    1    |          |    1
 *       |  3   |    1    |          |    1
 *  2 z  |  2   |         |    1     |
 *       |  3   |         |    1     |    1
 *       |  4   |    1    |          |
 *       |  5   |    1    |          |    1
 *
 ***********************************************/
function drawBoldCircle2D(side, axis, layer) {
  var xy = (axis == 1) || (axis == 2 && side > 3);
  var asx = (xy ? 1 : 0) + (side % 2) * 2 + axis * 4;
  var reverse = axis == 1 || (side == 1 && axis == 0) || ((
    side == 3 || side == 5) && axis == 2);
  if (reverse) {
    layer = cubeOrderNum - layer - 1;
  }
  var l = layer + 0.45;

  ctx2d.beginPath();
  if (xy) {
    ctx2d.moveTo(-0.3, l);
    ctx2d.lineTo(cubeOrderNum + 0.2, l);
  } else {
    ctx2d.moveTo(l, -0.3);
    ctx2d.lineTo(l, cubeOrderNum + 0.2);
  }
  ctx2d.lineWidth = 1.2;
  ctx2d.strokeStyle = colorArray2D[7];
  ctx2d.stroke();
  ctx2d.closePath();
}

function draw2D() {
  project2D();
  ctx2d.setTransform(1, 0, 0, 1, 0, 0);
  ctx2d.fillStyle = "#777";
  ctx2d.clearRect(0, 0, 500, 100);

  var boldSides = new Set();
  var boldLayer, boldAxis;
  if (currentRotate && currentRotate.meta) {
    boldAxis = currentRotate.meta[1];
    boldLayer = layerIndices.indexOf(currentRotate.meta[3]);
  } else if (mayCircle) {
    boldAxis = mayCircle[1];
    boldLayer = layerIndices.indexOf(mayCircle[3]);
  }

  if (boldAxis == 0) {
    boldSides = new Set([0, 1, 4, 5]);
  } else if (boldAxis == 1) {
    boldSides = new Set([0, 1, 2, 3]);
  } else if (boldAxis == 2) {
    boldSides = new Set([4, 5, 2, 3]);
  }

  for (var s = 0; s < 6; s++) {
    ctx2d.save();
    setPixelSide(s);
    if (boldSides.has(s)) drawBoldCircle2D(s, boldAxis, boldLayer);

    for (var x = 0; x < cubeOrderNum; x++)
      for (var y = 0; y < cubeOrderNum; y++) {
        drawPixel(x, y, sideColorMap[s][x][y]);
      }
    ctx2d.restore();
  }
}


function hoverToggle() { travel = !travel; }

function randomToggle() {
  if (modeRotate == 0) modeRotate = 2;
  else if (modeRotate == 2) enterManual();
}

function recoverToggle() {
  if (modeRotate == 0) modeRotate = 1;
  else if (modeRotate == 1) enterManual();
}

function enterManual() {
  modeRotate = 0;
  mayCircle = null;
}

function changeOrder(n) {
  if (n == cubeOrderNum || n > 7) return;
  cubeOrderNum = n;
  oddOrder = cubeOrderNum % 2;
  cubeOrderHalf = n >> 1;
  radius = 5 * n;


  layerIndices = [];
  if (oddOrder) {
    R = 2.1;
    surfaceV = cubeOrderHalf;
    for (var i = -surfaceV; i <= surfaceV; ++i)
      layerIndices.push(i);
  } else {
    R = 1.025;
    surfaceV = 2 * cubeOrderHalf - 1;
    for (var i = -surfaceV; i <= surfaceV; i += 2)
      layerIndices.push(i);
  }

  initVaribles();
  draw2D();
}

function initVaribles() {
  c2dPixelLen = c2dSide / cubeOrderNum;

  initSubCubeTransform();

  // init sideColorMap
  sideColorMap = [];
  for (var s = 0; s < 6; s++) {
    sideColorMap.push([]);
    for (var i = 0; i < cubeOrderNum; i++) {
      sideColorMap[s].push(new Int8Array(cubeOrderNum));
    }
  }

  // 初始化矩阵
  modelMatrix = glMatrix.mat4.create();
  viewMatrix = glMatrix.mat4.create();
  projectionMatrix = glMatrix.mat4.create();

  invModelMatrix = glMatrix.mat4.create();
  invViewMatrix = glMatrix.mat4.create();
  invProjMatrix = glMatrix.mat4.create();

  rotateMatrix = glMatrix.mat4.create();
  glMatrix.mat4.identity(rotateMatrix);

  modelMatrixStack = [];
  cubeRotateTrace = {};
  currentRotate = {};

  moveCount = 0;
  perspectiveAngle = 0;
  animeCursor = 0;
  setupCircleBuffer();
}

function initSubCubeTransform() {
  transformInfos = [];
  var V = surfaceV * R;
  // Vertex cubes
  transformInfos.push(
    // Front side
    [0, 0, [V, V, V], [1, 2, 3]],
    [3, A90, [V, V, V], [1, 3, 5]],
    [3, A180, [V, V, V], [1, 5, 6]],
    [3, A270, [V, V, V], [1, 6, 2]],
    // Back side
    [2, A90, [V, V, V], [2, 4, 3]],
    [2, A180, [V, V, V], [4, 5, 3]],
    [1, A180, [V, V, V], [4, 2, 6]],
    [4, A180, [V, V, V], [4, 6, 5]],
  );

  // Edge cubes
  var edgeCubeNum = cubeOrderNum - 2;
  for (var i, n = 0; n < edgeCubeNum; ++n) {
    i = layerIndices[n + 1] * R;
    transformInfos.push(
      // At front side
      [0, 0, [V, i, V], [1, 2]], // right
      [3, A90, [V, i, V], [1, 3]], // up
      [3, A180, [V, i, V], [1, 5]], // left
      [3, A270, [V, i, V], [1, 6]], // down
      // At back side
      [1, A180, [V, i, V], [4, 2]], // left
      [1, A180, [i, V, V], [4, 0, 6]], // down*
      [1, A270, [i, V, V], [3, 0, 4]], // up*
      [2, A180, [V, i, V], [4, 5]], // right
      // At left side
      [2, A90, [i, V, V], [2, 0, 3]], // up*
      [3, A180, [V, V, i], [0, 5, 6]], // down*
      // At right side
      [2, A270, [i, V, V], [5, 0, 3]], // up*
      [3, A270, [V, V, i], [0, 6, 2]], // down*
    );
  }

  for (var i, x = 0; x < edgeCubeNum; ++x) {
    i = layerIndices[x + 1] * R;
    for (var j, y = 0; y < edgeCubeNum; ++y) {
      j = layerIndices[y + 1] * R;
      transformInfos.push(
        [0, 0, [i, j, V], [1]], // Front side
        [1, A180, [i, j, V], [4]], // Back side
        [2, A270, [i, j, V], [5]], // Left side
        [2, A90, [i, j, V], [2]], // Right side
        [1, A270, [i, j, V], [3]], // Top side
        [1, A90, [i, j, V], [6]], // Down side
      );
    }
  }
}

function startup() {
  var canvas2d = document.getElementById("myCanvas");
  canvas2d.addEventListener("click", function(e) {
    var x = e.offsetX - c2dMargin;
    var unit = c2dSide + c2dMargin;
    var side = parseInt(x / unit);
    if (0 <= side && side < 6 && x % unit <= c2dSide) {
      focusASide(side);
    }
  });
  ctx2d = canvas2d.getContext("2d");

  var canvas = document.getElementById("myGLCanvas");
  canvas.addEventListener("mousedown", function(e) {
    dragging = true;
    click = true;
  });
  canvas.addEventListener("mouseup", function(e) {
    dragging = false;
    if (click) {
      travel = !travel;
    }
    click = false;
  });
  canvas.addEventListener("mouseleave", function(e) {
    dragging = false;
    click = false;
    mayCircle = null;
  });
  canvas.addEventListener("mousemove", function(e) {
    click = false;
    var dist = Math.hypot(e.movementX, e.movementY);

    var cubeMat = glMatrix.mat4.create();
    glMatrix.mat4.multiply(cubeMat, invViewMatrix, invProjMatrix);

    if (dragging) {
      var ang = 2 * Math.atan2(dist, 20);
      var vec = glMatrix.vec4.create();
      vec[0] = e.movementY, vec[1] = e.movementX;
      glMatrix.vec4.transformMat4(vec, vec, cubeMat);
      glMatrix.mat4.rotate(rotateMatrix, rotateMatrix, ang, vec);
      mayCircle = null;
    } else if (dist > 3) {
      // Select circle candidate
      var axisIdx = 0,
        layerDiff;
      var layer = 0;
      var vec = glMatrix.vec4.create();
      vec[0] = e.movementX, vec[1] = -e.movementY;
      glMatrix.vec4.normalize(vec, vec);
      glMatrix.vec4.transformMat4(vec, vec, cubeMat);
      for (var i = 0, mv = 0; i < 3; ++i) {
        if (Math.abs(vec[i]) > mv) {
          axisIdx = i;
          mv = Math.abs(vec[i]);
          layerDiff = Math.sign(vec[i]);
          layer = layerDiff < 0 ? 0 : cubeOrderNum - 1;
        }
      }

      if (mayCircle) {
        if (mayCircle[1] == axisIdx) {
          if (mayCircle[4] < 5) {
            mayCircle[4]++;
            return;
          }
          layer = mayCircle[5] + layerDiff;
          if (layer >= cubeOrderNum) layer = cubeOrderNum - 1;
          else if (layer < 0) layer = 0;
          mayCircle = [A90, axisIdx, moveCount, layerIndices[layer], 0,
            layer];
          draw2D();
          return;
        }
      }


      mayCircle = [A90, axisIdx, moveCount, layerIndices[layer], 0, layer];
      draw2D();
    }
  });
  canvas.addEventListener("mousewheel", function(e) {
    if (modeRotate) {
      return;
    }
    //
    if (currentRotate == null) {
      if (mayCircle) {
        if (e.deltaY < 0) mayCircle[0] *= -1;
        currentRotate = fillMove(...mayCircle);
      }
      mayCircle = null;
    } else {
      if (Math.sign(currentRotate.meta[0]) == Math.sign(e.deltaY)) {
        if (++animeCursor == 100) {
          pushRecord(currentRotate);
          currentRotate = null;
          mayCircle = null;
          animeCursor = 0;
          draw2D();
        }
      } else {
        if (--animeCursor <= 0) {
          currentRotate = null;
          mayCircle = null;
          animeCursor = 0;
        }
      }
    }
  });

  gl = createGLContext(canvas);
  setupShaders();
  setupCubeBuffers();

  gl.enable(gl.DEPTH_TEST);

  gl.uniform3fv(shaderProgram.uniformLightDirection, [-1, 1, -1]);
  gl.uniform4fv(shaderProgram.uniformAmbientColor, [0.01, 0.01, 0.01, 1.0]);

  initVaribles();

  update();
  draw2D();
}

function shuffle() {
  for (var i = 0; i < 40; i++) {
    pushRecord(genRandomRotate());
  }
  draw2D();
}

function update() {
  draw3D();

  requestAnimationFrame(update);
  autoMove();
}

function autoMove() {
  if (travel) {
    perspectiveAngle += 0.025;
  }

  if (modeRotate == 2) {
    shuffleWards();
  } else if (modeRotate == 1) {
    recoverWards();
  } else if (currentRotate) {
    manualAnimate();
  }
}

function recoverWards() {
  if (--animeCursor < 0) {
    currentRotate = popRecord();
    if (currentRotate) {
      animeCursor = 100;
    } else {
      enterManual();
    }
    draw2D();
  }
}

function shuffleWards() {
  if (++animeCursor >= 100) {
    pushRecord(currentRotate);
    currentRotate = genRandomRotate();
    animeCursor = 0;
    draw2D();
  }
}

function manualAnimate() {
  animeCursor += 2;
  if (animeCursor >= 100) {
    pushRecord(currentRotate);
    currentRotate = null;
    animeCursor = 0;
    draw2D();
  }
}
