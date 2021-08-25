var gls;
var gl, ctx2d;
var game;


//var modeRotate = 0; // recover: 1, random: 2
var cubeOrderNum = 3;

var c2dMargin = (6 * 100 - 500) / 5,
  c2dSide = 100 - 2 * c2dMargin;
var c2dPixelLen;

var radius = 3;

var R = 2.1;
var A90 = Math.PI / 2,
  A120 = Math.PI * 2 / 3,
  A180 = Math.PI,
  A270 = -Math.PI / 2,
  A48 = 0.8379118333508581;

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

function incept(base, derive) {
  if (typeof base === 'function') base = new base();
  for (var p in base) {
    if (derive[p] == null) {
      derive[p] = base[p];
    }
  }
}

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

function CubeShape() {
  this.axisNum = 3;
  this.angNum = 3;
  this.angUnit = A90;

  this.setupBuffers(gls);
}

CubeShape.prototype.xyzAxis = [
  [0, 0, 0],
  [1, 0, 0], // x axis
  [0, 1, 0], // y axis
  [0, 0, 1], // z axis
  [1, -1, 0]
];

CubeShape.prototype.vertexNormal = [
  [0.0, 0.0, 1.0],
  [1.0, 0.0, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.0],
  [0.0, -1.0, 0.0],
];

CubeShape.prototype.vertexPosition = [
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

CubeShape.prototype.setupBuffers = function(gls) {
  // Vertex Buffer
  this.vertexPositionBuffers = [
    gls.arrayToBuffer(this.vertexPosition[0], 3),
    gls.arrayToBuffer(this.vertexPosition[1], 3),
    gls.arrayToBuffer(this.vertexPosition[2], 3),
    gls.arrayToBuffer(this.vertexPosition[3], 3),
    gls.arrayToBuffer(this.vertexPosition[4], 3),
    gls.arrayToBuffer(this.vertexPosition[5], 3),
  ];

  // Vertex Index Buffer
  this.vertexIndexBuffer = gls.indexToBuffer([0, 1, 2, 0, 2, 3]);
}

CubeShape.prototype.focusView = function(f, gls) {
  glMatrix.mat4.identity(gls.rotateMatrix);
  switch (f) {
    case 0:
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A48, this
        .xyzAxis[
          4]);
      break;
    case 1: // Left front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90 / 2,
        this.xyzAxis[2]);
      break;
    case 2: // Up front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, -A90 / 2,
        this.xyzAxis[1]);
      break;
    case 3: // Right front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, -A90 / 2,
        this.xyzAxis[2]);
      break;
    case 4: // Down front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90 / 2,
        this.xyzAxis[1]);
      break;
  }
}

CubeShape.prototype.focusASide = function(f, gls) {
  glMatrix.mat4.identity(gls.rotateMatrix);
  switch (f) {
    case 1: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A180, this
        .xyzAxis[2]);
      break;
    case 2: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90, this
        .xyzAxis[2]);
      break;
    case 3: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A270, this
        .xyzAxis[2]);
      break;
    case 4: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90, this
        .xyzAxis[1]);
      break;
    case 5: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A270, this
        .xyzAxis[1]);
      break;
    default:
      break;
  }
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
CubeShape.prototype.circleProject = function(side, axis, layer) {
  var xy = (axis == 1) || (axis == 2 && side > 3);
  var asx = (xy ? 1 : 0) + (side % 2) * 2 + axis * 4;
  var reverse = axis == 1 || (side == 1 && axis == 0) || ((
    side == 3 || side == 5) && axis == 2);
  if (reverse) {
    layer = cubeOrderNum - layer - 1;
  }
  return layer + 0.45;
}

/**
 * Tetrahadron
 *
 *
 *
 *
 *
 *                       z
 *                       ^           ^ y
 *                       |          /
 *                       |         /
 *                    p2 +        /
 *                      .| .     /
 *                     ..|   .  /
 *                    .. |     .
 *                   ..  |    /  .
 *                  . .  |   /     .
 *                 . +   |  /        .
 *                .  p4  | /           .
 * --------------.-------+---------------.-------> x
 *              .       /|                .
 *             .       / |                  +p1
 *            +       /  |
 *            p3     /   |
 *                  /    |
 *                       |
 *
 *  Surface 1: P1, P2, P3
 *  Surface 2: P1, P2, P4
 *  Surface 3: P2, P3, P4
 *  Surface 4: P1, P3, P4
 */
var SQRT2 = Math.sqrt(2);
var SQRT3 = Math.sqrt(3);
var SQRT6 = Math.sqrt(6);

function TetrahedronShape() {
  this.axisNum = 4;
  this.angNum = 2;
  this.angUnit = A120;

  this.setupBuffers(gls);
}
//
//[[1.0,    0.0,      -SQRT2/4.0],
// [-0.5,   SQRT3/2,  -SQRT2/4.0],
// [-0.5,   -SQRT3/2, -SQRT2/4.0],
// [0.0,    0.0,      SQRT3*0.75]]
TetrahedronShape.prototype.xyzAxis = [
	[0.0, 0.0, 0.0],
	[SQRT2 / 3.0, -SQRT6 / 3.0, 1.0 / 3.0],
  [SQRT2 / 3.0, SQRT6 / 3.0, 1.0 / 3.0],
  [-SQRT2 * 2 / 3.0, 0.0, 1.0 / 3.0],
  [0.0, 0.0, -1.0]];

// Normal vectors
TetrahedronShape.prototype.vertexNormal = [
	[SQRT2 / 3.0, -SQRT6 / 3.0, 1.0 / 3.0],
  [SQRT2 / 3.0, SQRT6 / 3.0, 1.0 / 3.0],
  [-SQRT2 * 2 / 3.0, 0.0, 1.0 / 3.0],
  [0.0, 0.0, -1.0]];

TetrahedronShape.prototype.vertexPosition = [
  // Surface 1
  [1.0, 0.0, -SQRT2 / 4.0,
   -0.5, -SQRT3 / 2, -SQRT2 / 4.0,
   0.0, 0.0, SQRT3 * 0.75],

  // Surface 2
  [1.0, 0.0, -SQRT2 / 4.0,
   -0.5, SQRT3 / 2, -SQRT2 / 4.0,
   0.0, 0.0, SQRT3 * 0.75],

  // Surface 3
  [-0.5, SQRT3 / 2, -SQRT2 / 4.0,
   -0.5, -SQRT3 / 2, -SQRT2 / 4.0,
   0.0, 0.0, SQRT3 * 0.75],

  // Surface 4
  [1.0, 0.0, -SQRT2 / 4.0,
   -0.5, SQRT3 / 2, -SQRT2 / 4.0,
   -0.5, -SQRT3 / 2, -SQRT2 / 4.0],
];

TetrahedronShape.prototype.setupBuffers = function(gls) {
  // Vertex Buffer
  this.vertexPositionBuffers = [
    gls.arrayToBuffer(this.vertexPosition[0], 3),
    gls.arrayToBuffer(this.vertexPosition[1], 3),
    gls.arrayToBuffer(this.vertexPosition[2], 3),
    gls.arrayToBuffer(this.vertexPosition[3], 3),
  ];

  // Vertex Index Buffer
  this.vertexIndexBuffer = gls.indexToBuffer([0, 1, 2]);
}

TetrahedronShape.prototype.focusView = function(f, gls) {
  glMatrix.mat4.identity(gls.rotateMatrix);
  switch (f) {
    case 0:
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A48, this
        .xyzAxis[4]);
      break;
    case 1: // Left front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90 / 2,
        this.xyzAxis[2]);
      break;
    case 2: // Up front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, -A90 / 2,
        this.xyzAxis[1]);
      break;
    case 3: // Right front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, -A90 / 2,
        this.xyzAxis[2]);
      break;
    case 4: // Down front
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90 / 2,
        this.xyzAxis[1]);
      break;
  }
}

TetrahedronShape.prototype.focusASide = function(f, gls) {
  glMatrix.mat4.identity(gls.rotateMatrix);
  switch (f) {
    case 1: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A180, this
        .xyzAxis[2]);
      break;
    case 2: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90, this
        .xyzAxis[2]);
      break;
    case 3: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A270, this
        .xyzAxis[2]);
      break;
    case 4: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A90, this
        .xyzAxis[1]);
      break;
    case 5: //
      glMatrix.mat4.rotate(gls.rotateMatrix, gls.rotateMatrix, A270, this
        .xyzAxis[1]);
      break;
    default:
      break;
  }
}

///////////////////////////////////////////////////////
//
// Rubik class
//
function Rubik() {
  // Abstract class
  incept(Rotatable, this);

  this.transformInfos = [];
}

Rubik.prototype.assemble = function(tfi, matrix) {
  this.rotate(tfi, matrix);

  var tf = this.transformInfos[tfi];
  glMatrix.mat4.rotate(matrix, matrix, tf[1], this.xyzAxis[tf[0]]);
  glMatrix.mat4.translate(matrix, matrix, tf[2]);
}

Rubik.prototype.fillMove = function(ang, axisIdx, lyr) {
  var moves = { meta: [ang, axisIdx, this.moveCount, lyr] };
  var move = [ang, axisIdx + 1, this.moveCount, lyr];
  var cubes = this.findLayer(axisIdx, lyr);
  for (var ci of cubes) {
    moves[ci] = move;
  }

  return moves;
}

Rubik.prototype.findLayer = function(axis, lyr) {
  var m = glMatrix.mat4.create();
  var result = [];
  //var axisVec = glMatrix.vec4.create();
  //axisVec = this.xyzAxis[axis];

  lyr *= R;
  for (var tfi in this.transformInfos) {
    glMatrix.mat4.identity(m);
    this.assemble(tfi, m);

    var v = glMatrix.vec4.create();
    v[3] = 1;

    glMatrix.vec4.transformMat4(v, v, m);
    if (Math.abs(lyr - v[axis]) <= 0.1) {
      result.push(tfi);
    }
  }

  return result;
}

Rubik.prototype.draw3D = function() {
  for (var tfi in this.transformInfos) {
    gls.pushModelMatrix();

    // Abstract method
    if (this.game.animate) {
      this.game.animate.animateRotate(tfi, gls.modelMatrix);
    }

    this.assemble(tfi, gls.modelMatrix);

    gls.uploadModelMatrixToShader();
    // Abstract method
    this.drawParticle3D(this.transformInfos[tfi]);
    gls.popModelMatrix();
  }
}

Rubik.prototype.project2D = function(map2d) {
  var matrix = glMatrix.mat4.create();
  for (var tfi in this.transformInfos) {
    glMatrix.mat4.identity(matrix);
    this.assemble(tfi, matrix);
    // Abstract method
    this.projectParticle2D(map2d, this.transformInfos[tfi], matrix);
  }
}

/////////////////////////////////////////////////////////////////
//
// CubeRubik
function CubeRubik(order) {
  incept(Rubik, this);
  incept(CubeShape, this);

  this.orderNum = 0;
  this.layerIndices = null;

  this.setOrder(order);
  this.game = null;
}

CubeRubik.prototype.setOrder = function(n) {
  if (n == this.orderNum || n > 7) return;
  this.orderNum = n;
  var cubeOrderHalf = n >> 1;
  radius = 5 * n;

  this.layerIndices = [];
  if (this.orderNum % 2) {
    R = 2.1;
    this.surfaceV = cubeOrderHalf;
    for (var i = -this.surfaceV; i <= this.surfaceV; ++i)
      this.layerIndices.push(i);
  } else {
    R = 1.025;
    this.surfaceV = 2 * cubeOrderHalf - 1;
    for (var i = -this.surfaceV; i <= this.surfaceV; i += 2)
      this.layerIndices.push(i);
  }

  this.initTransforms();

}

CubeRubik.prototype.initTransforms = function() {
  var transformInfos = [];
  var V = this.surfaceV * R;
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
  var edgeCubeNum = this.orderNum - 2;
  for (var i, n = 0; n < edgeCubeNum; ++n) {
    i = this.layerIndices[n + 1] * R;
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
    i = this.layerIndices[x + 1] * R;
    for (var j, y = 0; y < edgeCubeNum; ++y) {
      j = this.layerIndices[y + 1] * R;
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

  this.transformInfos = transformInfos;
}


CubeRubik.prototype.drawParticle3D = function(tfInfo) {
  var colors = tfInfo[3];
  for (var i = 0; i < 6; i++) {
    var color = i < colors.length ? colors[i] : 0;
    gls.setUniversalNormal(this.vertexNormal[i]);
    gls.setUniversalColor(colorArray[color]);
    gls.drawObject(this.vertexPositionBuffers[i], this.vertexIndexBuffer);
  }
}


CubeRubik.prototype.draw2D = function() {
  //return;
  //var boldSides = new Set();
  //var boldLayer, boldAxis;
  //if (currentRotate && currentRotate.meta) {
  //  boldAxis = currentRotate.meta[1];
  //  boldLayer = this.layerIndices.indexOf(currentRotate.meta[3]);
  //} else if (mayCircle) {
  //  boldAxis = mayCircle[1];
  //  boldLayer = this.layerIndices.indexOf(mayCircle[3]);
  //}

  //if (boldAxis == 0) {
  //  boldSides = new Set([0, 1, 4, 5]);
  //} else if (boldAxis == 1) {
  //  boldSides = new Set([0, 1, 2, 3]);
  //} else if (boldAxis == 2) {
  //  boldSides = new Set([4, 5, 2, 3]);
  //}

  //if (boldSides.has(s)) {
  //  drawBoldCircle2D(s, boldAxis, boldLayer);
  //}

  for (var s = 0; s < 6; s++) {
    ctx2d.save();
    //  Set pixel side
    ctx2d.translate(c2dMargin + (c2dMargin + c2dSide) * s, c2dMargin);
    ctx2d.scale(c2dPixelLen, c2dPixelLen);
    ctx2d.translate(0.05, 0.05);

    for (var x = 0; x < this.orderNum; x++)
      for (var y = 0; y < this.orderNum; y++) {
        // Draw pixel
        ctx2d.beginPath();
        ctx2d.fillStyle = colorArray2D[sideColorMap[s][x][y]];
        ctx2d.rect(x, y, 0.9, 0.9);
        ctx2d.fill();
        ctx2d.closePath();
      }

    ctx2d.restore();
  }
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
CubeRubik.prototype.projectParticle2D = function(map2d, transInfo, matrix) {
  var pos = matrix.slice(12, 15).map(function(x) {
    return parseInt(Math.round(x / R));
  });
  var faceMat = matrix.slice(0, 12).map(function(x) {
    return parseInt(Math.round(x));
  });

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
    if (Math.abs(vaxis) < this.surfaceV) continue;
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

    var orderHalf = this.orderNum >> 1;
    if (this.orderNum % 2) {
      x = parseInt(x + orderHalf);
      y = parseInt(y + orderHalf);
    } else {
      if (x < 0) x--;
      if (y < 0) y--;
      x = parseInt(x / 2 + orderHalf);
      y = parseInt(y / 2 + orderHalf);
    }

    map2d[s][x][y] = c;
  }
}

////////////////////////////////////////////////////////////////
//
// TetrahedronRubik
function TetrahedronRubik() {
  incept(Rubik, this);
  incept(TetrahedronShape, this);

  this.initTransforms();
}

TetrahedronRubik.prototype.initTransforms = function() {

  this.transformInfos.push(
    [0, 0, [0, 0, 0], [1, 2, 3, 4]]
  );
}

TetrahedronRubik.prototype.drawParticle3D = function(tfInfo) {
  var colors = tfInfo[3];
  for (var i = 0; i < 4; i++) {
    var color = i < colors.length ? colors[i] : 0;
    gls.setUniversalNormal(this.vertexNormal[i]);
    gls.setUniversalColor(colorArray[color]);
    gls.drawObject(this.vertexPositionBuffers[i], this.vertexIndexBuffer);
  }
}


//////////////////////////////////////////////////////////////
//
//	 RingShape
//
function RingShape() {
  this.vertexBuffer = null;
  this.normalBuffer = null;
  this.vertexIndexBuffer = null;
  this.colorBuffer = null;
}

RingShape.prototype.render = function() {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.depthMask(false);

  gls.setNormals(this.normalBuffer);
  gls.setColors(this.colorBuffer);
  gls.drawObject(this.vertexBuffer, this.vertexIndexBuffer);

  gl.depthMask(true);
  gl.disable(gl.BLEND);
}

RingShape.prototype.setupBuffer = function(orderNum) {
  var array = [];
  var colors = [];
  var indices = [];
  var normals = [];
  var dR = 2,
    h = 0.1;
  var CAP = 36,
    R1 = orderNum * 1.6,
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

  if (this.vertexBuffer) {
    gl.deleteBuffer(this.vertexBuffer);
  }
  if (this.normalBuffer) {
    gl.deleteBuffer(this.normalBuffer);
  }
  if (this.colorBuffer) {
    gl.deleteBuffer(this.colorBuffer);
  }
  this.vertexBuffer = gls.arrayToBuffer(array, 3);
  this.normalBuffer = gls.arrayToBuffer(normals, 3);
  this.colorBuffer = gls.arrayToBuffer(colors, 4);

  if (this.vertexIndexBuffer) {
    gl.deleteBuffer(this.vertexIndexBuffer);
  }
  this.vertexIndexBuffer = gls.indexToBuffer(indices);
}

function Projector() {

}




var sideColorMap;



//////////////////////////////////////////////////////////////
//
//  RandomRotator
function RandomRotator(rubik) {
  this.rubik = rubik;

  this.lastLyr = NaN;
  this.lastAxis = -1;
  this.lastAng = 0;
}

RandomRotator.prototype.gen = function() {
  var rbk = this.rubik;
  var axisIdx, lyr;
  while (true) {
    axisIdx = parseInt(Math.random() * rbk.axisNum);
    lyr = rbk.layerIndices[parseInt(Math.random() * rbk.orderNum)];
    if (axisIdx != this.lastAxis || lyr != this.lastLyr) break;
  }
  this.lastLyr = lyr;
  this.lastAxis = axisIdx;

  var ang = parseInt(Math.random() * rbk.angNum);
  if (ang == 0) { ang-- };
  ang *= rbk.angUnit;

  return rbk.fillMove(ang, axisIdx, lyr);
}


RandomRotator.prototype.gen3 = function() {
  var rbk = this.rubik;
  var axisIdx, lyr, differAng = false;
  while (true) {
    axisIdx = parseInt(Math.random() * rbk.axisNum);
    lyr = rbk.layerIndices[parseInt(Math.random() * rbk.orderNum)];
    if (axisIdx != this.lastAxis) break;
    if (lyr != this.lastLyr) { differAng = true; break; }
  }

  var ang;
  while (true) {
    ang = parseInt(Math.random() * rbk.angNum);
    if (ang == 0) ang--;
    if (!differAng || ang != this.lastAng) break;
  }

  this.lastLyr = lyr;
  this.lastAxis = axisIdx;
  this.lastAng = ang;
  ang *= rbk.angUnit;

  return rbk.fillMove(ang, axisIdx, lyr);
}





//////////////////////////////////////////////////////////////
//
//  Rotatable
function Rotatable() {
  this.clearRotates();
}

Rotatable.prototype.clearRotates = function() {
  this.rotateTrace = {};
  this.moveCount = 0;
}

Rotatable.prototype.pushRotate = function(act) {
  for (var ci in act) {
    if (this.rotateTrace[ci] == null)
      this.rotateTrace[ci] = [];
    this.rotateTrace[ci].push(act[ci]);
  }

  this.moveCount++;
}

Rotatable.prototype.popRotate = function() {
  if (this.moveCount <= 0) {
    return null;
  }

  this.moveCount--;
  action = {};
  for (var ci in this.rotateTrace) {
    var trace = this.rotateTrace[ci];
    if (trace && trace.length && trace[trace.length - 1][2] == this
      .moveCount) {
      action[ci] = trace[trace.length - 1];
      trace.pop();
    }
  }

  return action;
}

Rotatable.prototype.rotate = function(id, modelMatrix) {
  var trace = this.rotateTrace[id];
  if (trace) {
    for (var i = trace.length - 1, rot; rot = trace[i]; i--) {
      glMatrix.mat4.rotate(modelMatrix,
        modelMatrix,
        rot[0],
        this.xyzAxis[rot[1]]); // xyz axis
    }
  }
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
  ctx2d.setTransform(1, 0, 0, 1, 0, 0);
  ctx2d.fillStyle = "#777";
  ctx2d.clearRect(0, 0, 500, 100);
  //return;
  game.rubik.project2D(sideColorMap);
  game.rubik.draw2D();
  //var boldSides = new Set();
  //var boldLayer, boldAxis;
  //if (currentRotate && currentRotate.meta) {
  //  boldAxis = currentRotate.meta[1];
  //  boldLayer = layerIndices.indexOf(currentRotate.meta[3]);
  //} else if (mayCircle) {
  //  boldAxis = mayCircle[1];
  //  boldLayer = layerIndices.indexOf(mayCircle[3]);
  //}

  //if (boldAxis == 0) {
  //  boldSides = new Set([0, 1, 4, 5]);
  //} else if (boldAxis == 1) {
  //  boldSides = new Set([0, 1, 2, 3]);
  //} else if (boldAxis == 2) {
  //  boldSides = new Set([4, 5, 2, 3]);
  //}

  //for (var s = 0; s < 6; s++) {
  //  ctx2d.save();
  //  //  Set pixel side
  //  ctx2d.translate(c2dMargin + (c2dMargin + c2dSide) * s, c2dMargin);
  //  ctx2d.scale(c2dPixelLen, c2dPixelLen);
  //  ctx2d.translate(0.05, 0.05);

  //  if (boldSides.has(s)) {
  //    drawBoldCircle2D(s, boldAxis, boldLayer);
  //  }

  //  for (var x = 0; x < cubeOrderNum; x++)
  //    for (var y = 0; y < cubeOrderNum; y++) {
  //      // Draw pixel
  //      ctx2d.beginPath();
  //      ctx2d.fillStyle = colorArray2D[sideColorMap[s][x][y]];
  //      ctx2d.rect(x, y, 0.9, 0.9);
  //      ctx2d.fill();
  //      ctx2d.closePath();
  //    }

  //  ctx2d.restore();
  //}
}


function initVaribles() {

  //initSubCubeTransform();

  // init sideColorMap
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
    game.dragging = true;
    game.click = true;
  });
  canvas.addEventListener("mouseup", function(e) {
    game.dragging = false;
    if (game.click) {
      game.hoverToggle();
    }
    game.click = false;
  });
  canvas.addEventListener("mouseleave", function(e) {
    game.dragging = false;
    game.click = false;
    game.mayCircle = null;
  });
  canvas.addEventListener("mousemove", function(e) {
    game.click = false;
    game.drag(e.movementX, e.movementY);
  });
  canvas.addEventListener("mousewheel", function(e) {
    if (game.modeRotate) {
      return;
    }

    var curRotate = game.animate && game.animate.curRotate;
    if (curRotate == null) {
      if (game.mayCircle) {
        if (e.deltaY < 0) game.mayCircle[0] *= -1;
        curRotate = game.rubik.fillMove(...game.mayCircle);
        game.animate = new Animation(game, curRotate);
        game.animate.done = function(cr) {
          game.rubik.pushRotate(cr);
        }
      }
      game.mayCircle = null;
    }
  });

  gls = new GLSuit(canvas);
  gl = gls.gl;

  game = new Game();

  //initVaribles();

  update();
  draw2D();
}


//////////////////////////////////////////////////////////////
//
//  Animation
function Animation(owner, curmove, reverse = false, s = 1, c = 100) {
  this.owner = owner;
  this.currentRotate = curmove;
  this.reverse = reverse;
  this.cursor = 0;
  this.cap = c || 100;
  this.step = s;
  this.done = null;
}

Animation.prototype.next = function() {
  this.cursor += this.step;
  if (this.cursor > this.cap) {
    var cr = this.currentRotate;
    this.currentRotate = null;

    if (this.done) {
      this.done(cr);
    }

    if (this.currentRotate) {
      this.cursor = 0;
    } else {
      this.owner.enterManual();
    }
    draw2D();
  }
}

Animation.prototype.progress = function() {
  var prog = this.cursor / (this.cap || 1);
  return this.reverse ? 1 - prog : prog;
}

Animation.prototype.animateRotate = function(tfid, matrix) {
  var act = this.currentRotate[tfid];
  if (act) {
    glMatrix.mat4.rotate(matrix,
      matrix,
      act[0] * this.progress(),
      this.owner.rubik.xyzAxis[act[1]]);
  }
}

//////////////////////////////////////////////////////////////
//
//  Game
//
function Game() {
  this.travel = false;
  this.modeRotate = 0;
  this.perspectiveAngle = 0;

  this.animate = null;
  this.mayCircle = null;

  this.click = false;
  this.dragging = false;

  this.changeOrder(3);
}

Game.prototype.changeOrder = function(n) {
  this.rubik = new CubeRubik(n);
  //this.rubik = new TetrahedronRubik(n);
  this.rubik.game = this;

  this.random = new RandomRotator(this.rubik);

  this.ring = new RingShape();
  this.ring.setupBuffer(n);


  // 2D
  sideColorMap = [];
  for (var s = 0; s < 6; s++) {
    sideColorMap.push([]);
    for (var i = 0; i < this.orderNum; i++) {
      sideColorMap[s].push(new Int8Array(this.orderNum));
    }
  }

  c2dPixelLen = c2dSide / this.orderNum;

}

Game.prototype.render = function() {
  this.rubik.draw3D();

  var selectedCircle = null;
  if (this.animate != null && this.animate.currentRotate != null && this
    .animate.currentRotate.meta) {
    selectedCircle = this.animate.currentRotate.meta;
  } else if (this.mayCircle) {
    selectedCircle = this.mayCircle;
  }

  if (selectedCircle) {
    var offset = [0, 0, 0];
    offset[selectedCircle[1]] = selectedCircle[3] * R;

    gls.pushModelMatrix();
    glMatrix.mat4.translate(gls.modelMatrix, gls.modelMatrix, offset);
    glMatrix.mat4.rotate(gls.modelMatrix, gls.modelMatrix, A90, xyzAxis[2 -
      selectedCircle[1]]);
    gls.uploadModelMatrixToShader();

    this.ring.render();

    gls.popModelMatrix();
  }
}

Game.prototype.hoverToggle = function() {
  this.travel = !this.travel;
}

Game.prototype.randomToggle = function() {
  if (this.modeRotate == 0) {
    var gm = this;
    this.modeRotate = 2;
    this.animate = new Animation(this, gm.random.gen());
    this.animate.done = function(e) {
      this.currentRotate = gm.random.gen();
      gm.rubik.pushRotate(this.currentRotate);

    }
  } else if (this.modeRotate == 2) {
    this.enterManual();
  }
}

Game.prototype.recoverToggle = function() {
  if (this.modeRotate == 0) {
    var gm = this;
    this.modeRotate = 1;
    var cm = this.rubik.popRotate();
    if (cm) {
      this.animate = new Animation(this, cm, true);
      this.animate.done = function(e) {
        this.currentRotate = gm.rubik.popRotate();
      }
    } else {
      this.enterManual();
    }
  } else if (this.modeRotate == 1) {
    this.enterManual();
  }
}

Game.prototype.enterManual = function() {
  this.modeRotate = 0;
  this.animate = null;

  this.mayCircle = null;
}

Game.prototype.manualMove = function(cm) {
  if (this.modeRotate == 0) {
    var gm = this;
    this.animate = new Animation(this, cm);
    this.animate.done = function(cr) {
      gm.rubik.pushRotate(cr);
    }
  }
}

Game.prototype._autoMove = function() {
  if (this.travel) {
    this.perspectiveAngle += 0.025;
  }

  if (this.animate) {
    this.animate.next();
  }
}

Game.prototype.shuffle = function() {
  for (var i = 0; i < 40; i++) {
    this.rubik.pushRotate(this.random.gen());
  }
  //
  draw2D();
}

Game.prototype.drag = function(dragX, dragY) {
  var dist = Math.hypot(dragX, dragY);
  var vec = glMatrix.vec4.create();
  var rubik = this.rubik;
  var cubeMat = glMatrix.mat4.create();
  glMatrix.mat4.multiply(cubeMat, gls.invViewMatrix, gls.invProjMatrix);

  if (game.dragging) {
    vec[0] = dragY, vec[1] = dragX;
    glMatrix.vec4.transformMat4(vec, vec, cubeMat);
    glMatrix.mat4.rotate(gls.rotateMatrix,
      gls.rotateMatrix,
      2 * Math.atan2(dist, 20),
      vec);
    game.mayCircle = null;
  } else if (dist > 3) {
    // Select circle candidate
    var axisIdx = 0,
      layerDiff;
    var layer = 0;

    vec[0] = dragX, vec[1] = -dragY;
    glMatrix.vec4.normalize(vec, vec);
    glMatrix.vec4.transformMat4(vec, vec, cubeMat);
    for (var i = 0, mv = 0; i < 3; ++i) {
      if (Math.abs(vec[i]) > mv) {
        axisIdx = i;
        mv = Math.abs(vec[i]);
        layerDiff = Math.sign(vec[i]);
        layer = layerDiff < 0 ? 0 : rubik.orderNum - 1;
      }
    }

    if (game.mayCircle) {
      if (game.mayCircle[1] == axisIdx) {
        if (game.mayCircle[4] < 5) {
          game.mayCircle[4]++;
          return;
        }
        layer = game.mayCircle[5] + layerDiff;
        if (layer >= rubik.orderNum) layer = rubik.orderNum - 1;
        else if (layer < 0) layer = 0;
        game.mayCircle = [A90, axisIdx, game.rubik.moveCount,
            game.rubik.layerIndices[layer], 0, layer];
        draw2D();
        return;
      }
    }

    game.mayCircle = [A90, axisIdx, game.rubik.moveCount, game.rubik
        .layerIndices[layer], 0, layer];
    draw2D();
  }
}

Game.prototype.focusView = function(f) {
  this.perspectiveAngle = 0;
  this.travel = false;
  this.rubik.focusView(f, gls);
}

Game.prototype.focusASide = function(f) {
  this.perspectiveAngle = 0;
  this.travel = false;
  this.rubik.focusASide(f, gls);
}

Game.prototype.reset = function() {
  this.rubik.clearRotates();
  draw2D();
}

function update() {
  gls.render();

  requestAnimationFrame(update);
  game._autoMove();
}



/////////////////////////////////////////////////
// WebGL & glMatrix related
/////////////////////////////////////////////////
function GLSuit(canvas) {
  this.gl = this.createGLContext(canvas);

  this.setupShaders();
  this.gl.enable(this.gl.DEPTH_TEST);

  this.gl.uniform3fv(this.shaderProgram.uniformLightDirection, [-1, 1, -1]);
  this.gl.uniform4fv(this.shaderProgram.uniformAmbientColor, [0.01, 0.01, 0.01,
  1.0]);

  // 初始化矩阵
  this.modelMatrix = glMatrix.mat4.create();
  this.viewMatrix = glMatrix.mat4.create();
  this.projectionMatrix = glMatrix.mat4.create();

  this.invModelMatrix = glMatrix.mat4.create();
  this.invViewMatrix = glMatrix.mat4.create();
  this.invProjMatrix = glMatrix.mat4.create();

  this.rotateMatrix = glMatrix.mat4.create();

  this.modelMatrixStack = [];
}

GLSuit.prototype.createGLContext = function(canvas) {
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

GLSuit.prototype.loadShaderFromDOM = function(id) {
  // 获取 DOM
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var shaderSource = "";
  var url = shaderScript.src;
  if (url.length == 0) {
    // 获取着色器代码
    var currentChild = shaderScript.firstChild;
    while (currentChild) {
      if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
        shaderSource += currentChild.textContent;
      }
      currentChild = currentChild.nextSibling;
    }
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, false);
    xhr.send();
    if (xhr.readyState == 4 && xhr.status == 200) {
      shaderSource = xhr.responseText;
    } else {
      return null;
    }
  }

  // 创建着色器
  var shader;
  var gl = this.gl;
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

GLSuit.prototype.setupShaders = function() {
  // 从 DOM 上创建对应的着色器
  var vertexShader = this.loadShaderFromDOM("shader-vs");
  var fragmentShader = this.loadShaderFromDOM("shader-fs");

  // 创建程序并连接着色器
  var gl = this.gl;
  var shaderProgram = gl.createProgram();
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

  this.shaderProgram = shaderProgram;
}

GLSuit.prototype.arrayToBuffer = function(array, unit) {
  var buffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(array), this.gl
    .STATIC_DRAW);
  buffer.itemSize = unit;
  buffer.numberOfItems = array.length / unit;

  return buffer;
}

GLSuit.prototype.indexToBuffer = function(array) {
  var buffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
  this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array),
    this.gl.STATIC_DRAW);
  buffer.itemSize = 1;
  buffer.numberOfItems = array.length;

  return buffer;
}

GLSuit.prototype.uploadViewMatrixToShader = function() {
  this.gl.uniformMatrix4fv(this.shaderProgram.uniformVMatrix, false, this
    .viewMatrix);
  glMatrix.mat4.invert(this.invViewMatrix, this.viewMatrix);
  this.gl.uniformMatrix4fv(this.shaderProgram.uniformInvVMatrix, false,
    this.invViewMatrix);
}

GLSuit.prototype.uploadModelMatrixToShader = function() {
  this.gl.uniformMatrix4fv(this.shaderProgram.uniformMMatrix, false,
    this.modelMatrix);
  glMatrix.mat4.invert(this.invModelMatrix, this.modelMatrix);
  this.gl.uniformMatrix4fv(this.shaderProgram.uniformInvMMatrix, false,
    this.invModelMatrix);
}

GLSuit.prototype.uploadProjectionMatrixToShader = function() {
  this.gl.uniformMatrix4fv(this.shaderProgram.uniformPMatrix, false,
    this.projectionMatrix);
  glMatrix.mat4.invert(this.invProjMatrix, this.projectionMatrix);
  this.gl.uniformMatrix4fv(this.shaderProgram.uniformInvPMatrix, false,
    this.invProjMatrix);
}

// 将 modelMatrix 矩阵压入堆栈
GLSuit.prototype.pushModelMatrix = function() {
  var copyToPush = glMatrix.mat4.clone(this.modelMatrix);
  this.modelMatrixStack.push(copyToPush);
}

// 从矩阵堆栈中取出矩阵并设定为当前的 modelMatrix 矩阵
GLSuit.prototype.popModelMatrix = function() {
  if (this.modelMatrixStack.length == 0) {
    throw "Error popModelMatrix() - Stack was empty ";
  }

  this.modelMatrix = this.modelMatrixStack.pop();
}

GLSuit.prototype.setUniversalNormal = function(normal) {
  this.gl.disableVertexAttribArray(this.shaderProgram
    .vertexNormalAttribute);
  this.gl.vertexAttrib3f(this.shaderProgram.vertexNormalAttribute, ...
    normal);
}

GLSuit.prototype.setNormals = function(normals) {
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normals);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute,
    normals.itemSize, this.gl.FLOAT, false, 0, 0);
}

GLSuit.prototype.setUniversalColor = function(color) {
  this.gl.disableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
  this.gl.vertexAttrib4f(this.shaderProgram.vertexColorAttribute, ...color);
}

GLSuit.prototype.setColors = function(colors) {
  this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colors);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute,
    colors.itemSize, this.gl.FLOAT, false, 0, 0);
}

GLSuit.prototype.drawObject = function(vertices, indices) {
  // Set vertex positions
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertices);
  this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
    vertices.itemSize, this.gl.FLOAT, false, 0, 0);

  // Draw surfaces
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indices);
  this.gl.drawElements(this.gl.TRIANGLES, indices.numberOfItems, this.gl
    .UNSIGNED_SHORT, 0);
}

GLSuit.prototype.render = function() {
  var gl = this.gl;
  var shaderProgram = this.shaderProgram;

  gl.clearColor(0.4, 0.4, 0.4, 1);
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // 设置为正交矩阵
  //glMatrix.mat4.ortho(projectionMatrix, -8, 8, -8, 8, 0.1, 100);
  // 设置为透视矩阵
  glMatrix.mat4.perspective(this.projectionMatrix, 60 * Math.PI / 180, gl
    .viewportWidth / gl.viewportHeight, 0.1, 100);
  this.uploadProjectionMatrixToShader();


  glMatrix.mat4.identity(this.viewMatrix);


  // 初始化模型视图矩阵
  var perspectiveAngle = game.perspectiveAngle;
  var eyePoint = [radius * Math.sin(perspectiveAngle),
                  8 * Math.sin(perspectiveAngle / 3),
                  radius * Math.cos(perspectiveAngle)];
  gl.uniform3fv(shaderProgram.uniformEyeDirection, eyePoint);
  glMatrix.mat4.lookAt(this.viewMatrix, eyePoint, [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.multiply(this.viewMatrix, this.viewMatrix, this
    .rotateMatrix);

  this.uploadViewMatrixToShader();

  glMatrix.mat4.identity(this.modelMatrix);

  game.render();
}
