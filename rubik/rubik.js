var gls;
var ctx2d;
var game;

var c2dMargin = (6 * 100 - 500) / 5,
  c2dSide = 100 - 2 * c2dMargin;
var c2dPixelLen;

// Math Const
var SQRT2 = Math.sqrt(2.0);
var SQRT3 = Math.sqrt(3.0);
var SQRT6 = Math.sqrt(6.0);

var SQRT2_2 = SQRT2 / 2.0;
var SQRT2_3 = SQRT2 / 3.0;
var SQRT2_4 = SQRT2 / 4.0;
var SQRT3_2 = SQRT3 / 2.0;
var SQRT3_6 = SQRT3 / 6.0;
var SQRT6_3 = SQRT6 / 3.0;

var PHI = 0.5 + Math.sqrt(5.0) / 2.0;
var PHI_1 = 1.0 / PHI;
var MPHI_1 = Math.hypot(PHI, PHI_1);

var DN1_3 = 1.0 / 3.0;
var DN2_3 = 2.0 / 3.0;
var DN1_6 = 1.0 / 6.0;

var A1 = Math.PI / 180.0;
var A60 = Math.PI / 3.0;
var A90 = Math.PI / 2.0;
var A120 = Math.PI * DN2_3;
var A180 = Math.PI;
var A270 = -A90;
var A72 = Math.PI * 2.0 / 5.0;
var A54 = Math.acos(SQRT3 / 3);

var T4CAngle = Math.acos(DN1_3);

// Color Const
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


function incept(base, derive) {
  var func = null;
  if (typeof base === 'function') {
    func = base;
    base = base.prototype;
  }

  for (var p in base) {
    if (derive[p] == null) {
      derive[p] = base[p];
    }
  }

  if (func) {
    func.apply(derive, []);
  }
}

////////////////////////////////////////////////////////////////
//
//  Shape
//
function Shape() {
  this.setupBuffers();
}

Shape.prototype.setupBuffers = function() {
  // Vertex Buffer
  this.vertexPositionBuffers = this.surfacePositions.map(function(
    array) {
    return gls.arrayToBuffer(array, 3)
  });

  // Vertex Index Buffer
  this.vertexIndexBuffer = gls.indexToBuffer(this.vertexIndices);
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
  incept(Shape, this);
  this.axisNum = 3;
  this.angNum = 3;
  this.angUnit = A90;
  this.surfaceNum = 6;
  this.modelSide = SQRT2;

}

CubeShape.prototype.xyzAxis = [
  [0, 0, 0],
  [1, 0, 0], // x axis
  [0, 1, 0], // y axis
  [0, 0, 1], // z axis
  [-1, 1, 0]
];

CubeShape.prototype.ringRotate = [
  [A90, [0, 1, 0]], // y axis
  [A90, [1, 0, 0]], // x axis
  [0, [0, 0, 0]],
];

CubeShape.prototype.surfaceNormals = [
  [0.0, 0.0, 1.0],
  [1.0, 0.0, 0.0],
  [0.0, 1.0, 0.0],
  [0.0, 0.0, -1.0],
  [-1.0, 0.0, 0.0],
  [0.0, -1.0, 0.0],
];

CubeShape.prototype.vertexIndices = [0, 1, 2, 0, 2, 3];
CubeShape.prototype.surfacePositions = [
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


CubeShape.prototype.focusView = function(f, gls) {
  var rmat = gls.rotateMatrix;
  glMatrix.mat4.identity(rmat);
  switch (f) {
    case 0:
      glMatrix.mat4.rotate(rmat, rmat, A54, this.xyzAxis[4]);
      break;
    case 1: // Left front
      glMatrix.mat4.rotateY(rmat, rmat, A90 / 2);
      break;
    case 2: // Up front
      glMatrix.mat4.rotateX(rmat, rmat, -A90 / 2);
      break;
    case 3: // Right front
      glMatrix.mat4.rotateY(rmat, rmat, -A90 / 2);
      break;
    case 4: // Down front
      glMatrix.mat4.rotateX(rmat, rmat, A90 / 2);
      break;
  }
}

CubeShape.prototype.focusASide = function(f, gls) {
  var rmat = gls.rotateMatrix;
  glMatrix.mat4.identity(rmat);
  switch (f) {
    case 1: // Back side
      glMatrix.mat4.rotateY(rmat, rmat, A180);
      break;
    case 2: // Left side
      glMatrix.mat4.rotateY(rmat, rmat, A90);
      break;
    case 3: // Right side
      glMatrix.mat4.rotateY(rmat, rmat, A270);
      break;
    case 4: // Up side
      glMatrix.mat4.rotateX(rmat, rmat, A90);
      break;
    case 5: // Down side
      glMatrix.mat4.rotateX(rmat, rmat, A270);
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
    layer = this.orderNum - layer - 1;
  }

  return [layer, xy];
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
 *  Surface 1: P2, P3, P4
 *  Surface 2: P1, P3, P4
 *  Surface 3: P1, P2, P4
 *  Surface 4: P1, P2, P3
 */


function TetrahedronShape() {
  incept(Shape, this);
  this.axisNum = 4;
  this.angNum = 2;
  this.angUnit = A120;
  this.surfaceNum = 4;
  this.modelSide = SQRT3_2;

}

TetrahedronShape.prototype.vertexVector = [
  [1.0, 0.0, -SQRT2_4],
  [0.0, 0.0, SQRT2 * 0.75],
  [-0.5, -SQRT3_2, -SQRT2_4],
  [-0.5, SQRT3_2, -SQRT2_4],
];

TetrahedronShape.prototype.xyzAxis = [
  [0.0, 0.0, 0.0],
  [-SQRT2 * DN2_3, 0.0, DN1_3],
  [0.0, 0.0, -1.0],
  [SQRT2_3, SQRT6_3, DN1_3],
  [SQRT2_3, -SQRT6_3, DN1_3]];


TetrahedronShape.prototype.surfaceMatrix = [
  // [x axis, y axis, z axis]
  [[0, -1, 0],
   [DN1_3, 0, SQRT2 * DN2_3],
   [-SQRT2 * DN2_3, 0, DN1_3, 0]],
  [[-0, 1, 0],
   [1, 0, 0],
   [0, 0, -1, 0]],
  [[-SQRT3_2, 0.5, 0],
   [-DN1_6, -SQRT3_6, 2 * SQRT2_3],
   [SQRT2_3, SQRT6_3, DN1_3, 0]],
  [[SQRT3_2, 0.5, -0],
   [-DN1_6, SQRT3_6, 2 * SQRT2_3],
   [SQRT2_3, -SQRT6_3, DN1_3, 0]]
];

TetrahedronShape.prototype.ringRotate = [
  [T4CAngle, [0, -1, 0]],
  [0, [0, 0, 0]],
  [T4CAngle, [-1.5, SQRT3_2, 0]],
  [T4CAngle, [1.5, SQRT3_2, 0]]
];

// Normal vectors
TetrahedronShape.prototype.surfaceNormals = [
  [-SQRT2 * DN2_3, 0.0, DN1_3],
  [0.0, 0.0, -1.0],
  [SQRT2_3, SQRT6_3, DN1_3],
  [SQRT2_3, -SQRT6_3, DN1_3]
  ];


TetrahedronShape.prototype.vertexIndices = [0, 1, 2];
TetrahedronShape.prototype.surfacePositions = [
  // Surface 1
  [-0.5, SQRT3_2, -SQRT2_4,
   -0.5, -SQRT3_2, -SQRT2_4,
   0.0, 0.0, SQRT2 * 0.75],

  // Surface 2
  [1.0, 0.0, -SQRT2_4,
   -0.5, SQRT3_2, -SQRT2_4,
   -0.5, -SQRT3_2, -SQRT2_4],

  // Surface 3
  [1.0, 0.0, -SQRT2_4,
   -0.5, SQRT3_2, -SQRT2_4,
   0.0, 0.0, SQRT2 * 0.75],

  // Surface 4
  [1.0, 0.0, -SQRT2_4,
   -0.5, -SQRT3_2, -SQRT2_4,
   0.0, 0.0, SQRT2 * 0.75]
];


TetrahedronShape.prototype.focusView = function(f, gls) {
  var rmat = gls.rotateMatrix;
  var smat = this.surfaceMatrix;
  glMatrix.mat4.identity(rmat);
  glMatrix.mat4.rotateZ(rmat, rmat, A90);
  switch (f) {
    case 0:
      glMatrix.mat4.rotate(rmat, rmat, A120, smat[0][2]);
      break;
    case 1: // Left front
      glMatrix.mat4.rotate(rmat, rmat, A120, smat[2][2]);
      break;
    case 2: // Up front
      glMatrix.mat4.rotate(rmat, rmat, A120, smat[3][2]);
      break;
    default:
      break;
  }
}

TetrahedronShape.prototype.focusASide = function(f, gls) {
  var rmat = gls.rotateMatrix;
  glMatrix.mat4.identity(rmat);
  switch (f) {
    case 0: //
      glMatrix.mat4.rotateZ(rmat, rmat, A90);
      glMatrix.mat4.rotateY(rmat, rmat, T4CAngle);
      break;
    case 1: //
      glMatrix.mat4.rotateX(rmat, rmat, A180);
      glMatrix.mat4.rotateZ(rmat, rmat, A270);
      break;
    case 2: //
      glMatrix.mat4.rotateZ(rmat, rmat, A270 - A60);
      glMatrix.mat4.rotate(rmat, rmat, -T4CAngle, this.surfaceMatrix[2][0]);
      break;
    case 3: //
      glMatrix.mat4.rotateZ(rmat, rmat, A270 - A60);
      glMatrix.mat4.rotate(rmat, rmat, -T4CAngle, this.surfaceMatrix[3][0]);
      glMatrix.mat4.rotate(rmat, rmat, A120, this.surfaceMatrix[3][2]);
      break;
    default:
      break;
  }
}

/**
 * Pentagonal Dodecahedron
 *
 *
 */

function DodecahedronShape() {
  incept(Shape, this);
  this.axisNum = 6;
  this.angNum = 5;
  this.angUnit = A72;
  this.surfaceNum = 12;
  this.modelSide = PHI;

}

//var p = [
//  [0, PHI, PHI_1],
//  [PHI, PHI_1, 0],
//  [PHI_1, 0 PHI],
//  [1, 1, 1],
//];
DodecahedronShape.prototype.xyzAxis = [
  [PHI / MPHI_1, PHI_1 / MPHI_1, 0],
  [PHI / MPHI_1, -PHI_1 / MPHI_1, 0],
  [-PHI / MPHI_1, PHI_1 / MPHI_1, 0],
  [-PHI / MPHI_1, -PHI_1 / MPHI_1, 0],
];
DodecahedronShape.prototype.surfaceNormals = [
  [PHI / MPHI_1, PHI_1 / MPHI_1, 0],
  [PHI / MPHI_1, -PHI_1 / MPHI_1, 0],
  [-PHI / MPHI_1, PHI_1 / MPHI_1, 0],
  [-PHI / MPHI_1, -PHI_1 / MPHI_1, 0],
];
DodecahedronShape.prototype.vertexIndices = [0, 1, 2, 0, 2, 3, 0, 3, 4];
DodecahedronShape.prototype.surfacePositions = [
  [1.0, 1.0, 1.0,
    0, PHI, PHI_1,
    0, PHI, -PHI_1,
    1.0, 1.0, -1.0,
    PHI, PHI_1, 0],

  [1.0, -1.0, 1.0,
    0, -PHI, PHI_1,
    0, -PHI, -PHI_1,
    1.0, -1.0, -1.0,
    PHI, -PHI_1, 0],

  [-1.0, 1.0, 1.0,
    0, PHI, PHI_1,
    0, PHI, -PHI_1,
   -1.0, 1.0, -1.0,
   -PHI, PHI_1, 0],

  [-1.0, -1.0, 1.0,
    0, -PHI, PHI_1,
    0, -PHI, -PHI_1,
   -1.0, -1.0, -1.0,
   -PHI, -PHI_1, 0],
];


//////////////////////////////////////////////////////////////
//
//   Cursor
function Cursor(rubik, axis, layer) {
  this.rubik = rubik;
  this.axis = axis;
  this.layer = layer;
  this.angle = 0;
  this.tick = 0;
}

Cursor.prototype.changeLayer = function(lyr) {
  this.layer = lyr;
  this.tick = 0;
}

Cursor.prototype.isRevert = function(cur) {
  return this.similarTo(cur.layer) && (this.angle ==
    -cur.angle || (this.angle + cur.angle == 2 * Math.PI));
}

Cursor.prototype.similarTo = function(cur) {
  return (this.axis == cur.axis && this.layer == cur.layer);
}

///////////////////////////////////////////////////////
//
// Rubik class
//
function Rubik() {
  // Abstract class
  incept(Rotatable, this);

  this.transformInfos = [];
  this.R = 2.1;
}

Rubik.prototype.getCursor = function(axis, layer) {
  var csr = new Cursor(this, axis, layer);

  // Abstract sentences, variables are derived from Shape
  csr.angle = this.angUnit;

  return csr;
}

Rubik.prototype.assemble = function(tfi, matrix) {
  this.rotate(tfi, matrix);

  var tf = this.transformInfos[tfi];
  glMatrix.mat4.rotate(matrix, matrix, tf[1], this.xyzAxis[tf[0]]);
  glMatrix.mat4.translate(matrix, matrix, tf[2]);
}

Rubik.prototype.fillMove = function(ang, axisIdx, layer) {
  var cursor;
  if (ang instanceof Cursor) {
    cursor = ang;
  } else {
    cursor = this.getCursor(axisIdx, layer);
    cursor.angle = ang;
  }

  var moves = { meta: cursor };
  var cubes = this.findLayer(cursor.axis, cursor.layer);
  for (var ci of cubes) {
    moves[ci] = cursor;
  }

  return moves;
}

Rubik.prototype.findLayer = function(axis, layer) {
  var m = glMatrix.mat4.create();
  var result = [];

  var axisVec = this.xyzAxis[axis + 1];
  var layerOffset = this.layerIndices[layer] * this.R;
  for (var tfi in this.transformInfos) {
    glMatrix.mat4.identity(m);
    this.assemble(tfi, m);

    var project = glMatrix.vec3.dot(m.slice(12, 15), axisVec);
    if (this._projectInLayer(project, layer, layerOffset)) {
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
    this.drawParticle3D(this.transformInfos[tfi]);
    gls.popModelMatrix();
  }
}

Rubik.prototype.drawParticle3D = function(tfInfo) {
  var colors = tfInfo[3];
  for (var i = 0; i < this.surfaceNum; i++) {
    var color = i < colors.length ? colors[i] : 0;
    gls.setUniversalNormal(this.surfaceNormals[i]);
    gls.setUniversalColor(colorArray[color]);
    gls.drawObject(this.vertexPositionBuffers[i], this
      .vertexIndexBuffer);
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
//
function CubeRubik(order) {
  incept(Rubik, this);
  incept(CubeShape, this);

  this.orderNum = 0;
  this.layerIndices = null;

  this.setOrder(order);
  this.game = null;
}

CubeRubik.prototype._projectInLayer = function(project, layer, layerOffset) {
  return Math.abs(project - layerOffset) < 0.1;
}

CubeRubik.prototype.setOrder = function(n) {
  if (n == this.orderNum || n > 7) return;
  this.orderNum = n;
  var cubeOrderHalf = n >> 1;

  this.layerIndices = [];
  if (this.orderNum % 2) {
    this.R = 2.1;
    this.surfaceV = cubeOrderHalf;
    for (var i = -this.surfaceV; i <= this.surfaceV; ++i)
      this.layerIndices.push(i);
  } else {
    this.R = 1.025;
    this.surfaceV = 2 * cubeOrderHalf - 1;
    for (var i = -this.surfaceV; i <= this.surfaceV; i += 2)
      this.layerIndices.push(i);
  }

  this.initTransforms();
}

CubeRubik.prototype.initTransforms = function() {
  var transformInfos = [];
  var V = this.surfaceV * this.R;
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
    i = this.layerIndices[n + 1] * this.R;
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
    i = this.layerIndices[x + 1] * this.R;
    for (var j, y = 0; y < edgeCubeNum; ++y) {
      j = this.layerIndices[y + 1] * this.R;
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



  // 2D
  sideColorMap = [];
  for (var s = 0, n = this.orderNum; s < 6; s++) {
    sideColorMap.push([]);
    for (var i = 0; i < n; i++) {
      sideColorMap[s].push(new Int8Array(n));
    }
  }

  c2dPixelLen = c2dSide / n;
}

CubeRubik.prototype.draw2D = function(game) {
  function transformSide(s) {
    ctx2d.translate(c2dMargin + (c2dMargin + c2dSide) * s, c2dMargin);
    ctx2d.scale(c2dPixelLen, c2dPixelLen);
    ctx2d.translate(0.05, 0.05);
  }

  var me = this;

  function drawBoldCircle(ring, sides) {
    for (var s of sides) {
      ctx2d.save();
      transformSide(s);
      var lxy = me.circleProject(s, ring.axis, ring.layer);
      var l = lxy[0] + 0.45;

      ctx2d.beginPath();
      if (lxy[1]) {
        ctx2d.moveTo(-0.3, l);
        ctx2d.lineTo(me.orderNum + 0.2, l);
      } else {
        ctx2d.moveTo(l, -0.3);
        ctx2d.lineTo(l, me.orderNum + 0.2);
      }
      ctx2d.lineWidth = 1.2;
      ctx2d.strokeStyle = colorArray2D[7];
      ctx2d.stroke();
      ctx2d.closePath();

      ctx2d.restore();
    }
  }

  var ring;
  if (game.animate && game.animate.currentRotate && game.animate
    .currentRotate.meta) {
    ring = game.animate.currentRotate.meta;
  } else if (game.mayCircle) {
    ring = game.mayCircle;
  }

  if (ring) {
    if (ring.axis == 0) {
      drawBoldCircle(ring, [0, 1, 4, 5]);
    } else if (ring.axis == 1) {
      drawBoldCircle(ring, [0, 1, 2, 3]);
    } else if (ring.axis == 2) {
      drawBoldCircle(ring, [4, 5, 2, 3]);
    }
  }

  for (var s = 0; s < 6; s++) {
    ctx2d.save();
    transformSide(s);
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
CubeRubik.prototype.projectParticle2D = function(map2d, transInfo,
  matrix) {
  var R = this.R;
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
function TetrahedronRubik(order) {
  incept(Rubik, this);
  incept(TetrahedronShape, this);

  this.layerIndices = null;
  this.setOrder(order);
}

TetrahedronRubik.prototype._projectInLayer = function(project, layer,
  layerOffset) {
  var U = 1 + DN1_3;
  var N = project + this.orderNum - 1.1;
  return U * (layer - 1) < N && (layer + 1 == this.orderNum || N < U * layer);
}

TetrahedronRubik.prototype.setOrder = function(n) {
  this.orderNum = n;
  this.R = 1.05;

  // init layer indices
  this.layerIndices = [];
  for (var i = 0; i < n; ++i) {
    this.layerIndices.push((1 + DN1_3) * i - n + 1);
  }

  this.initTransforms();
}

TetrahedronRubik.prototype.initTransforms = function() {
  var N = this.orderNum - 1;
  var rt = this.R * N;
  this.surfaceV = rt / 3;

  // Vertices
  for (var s = 0, color, trans; s < 4; s++) {
    color = [1, 2, 3, 4];
    color[s] = 0;
    trans = [];
    glMatrix.vec3.scale(trans, this.vertexVector[s], rt);
    this.transformInfos.push([0, 0, trans, color]);
  }

  // Edges
  if (N > 1) {
    for (var p1 = 0; p1 < 3; p1++) {
      for (var p2 = p1 + 1; p2 < 4; p2++) {
        var clr = [1, 2, 3, 4];
        clr[p1] = clr[p2] = 0;
        for (var i = 1, trans; i < N; i++) {
          trans = [];
          glMatrix.vec3.lerp(trans,
            this.vertexVector[p1],
            this.vertexVector[p2],
            i / N);
          glMatrix.vec3.scale(trans, trans, rt);
          this.transformInfos.push([0, 0, trans, clr]);
        }
      }
    }
  }

  // Surfaces
  for (var side = 0; side < 4; side++) {
    var idx = [0, 1, 2, 3];
    var nor = this.vertexVector[side];
    var clr = [0, 0, 0, 0];
    clr[side] = side + 1;
    idx.splice(side, 1);

    // Fill those positive triangles
    var p1 = [],
      p2 = [],
      p0 = [];
    glMatrix.vec3.scale(p0, this.vertexVector[idx[0]], rt);
    glMatrix.vec3.scale(p1, this.vertexVector[idx[1]], rt);
    glMatrix.vec3.scale(p2, this.vertexVector[idx[2]], rt);
    for (var i = 1; i < N; ++i) {
      var pn = [],
        pm = [];
      lambda = i / N;
      glMatrix.vec3.lerp(pn, p0, p1, lambda);
      glMatrix.vec3.lerp(pm, p0, p2, lambda);
      for (var j = 1, trans; j < i; ++j) {
        trans = [];
        glMatrix.vec3.lerp(trans, pn, pm, j / i);
        this.transformInfos.push([0, 0, trans, clr]);
      }
    }

    // Fill those negitive triangles
    var saxis = side + 1;
    var matrix = glMatrix.mat4.create();
    glMatrix.mat4.rotate(matrix, matrix, Math.PI, this.xyzAxis[saxis]);
    glMatrix.vec3.transformMat4(p0, p0, matrix);
    glMatrix.vec3.transformMat4(p1, p1, matrix);
    glMatrix.vec3.transformMat4(p2, p2, matrix);

    var rx = DN2_3 / N;
    var pp0 = [];
    glMatrix.vec3.lerp(pp0, p1, p2, 0.5);
    glMatrix.vec3.lerp(pp0, p0, pp0, rx);
    this.transformInfos.push([saxis, Math.PI, pp0, clr]);

    if (N <= 1) continue;

    var pp1 = [],
      pp2 = [];
    glMatrix.vec3.lerp(pp1, p0, p2, 0.5);
    glMatrix.vec3.lerp(pp1, p1, pp1, rx);

    glMatrix.vec3.lerp(pp2, p0, p1, 0.5);
    glMatrix.vec3.lerp(pp2, p2, pp2, rx);

    for (var i = 0; i < N; ++i) {
      var pn = [],
        pm = [];
      var lambda = i / (N - 1);
      glMatrix.vec3.lerp(pn, pp0, pp1, lambda);
      glMatrix.vec3.lerp(pm, pp0, pp2, lambda);
      for (var j = 0; j <= i; ++j) {
        trans = [];
        glMatrix.vec3.lerp(trans, pn, pm, i ? j / i : 1);
        this.transformInfos.push([saxis, Math.PI, trans, clr]);
      }
    }
  }

  // 2D
  sideColorMap = [];
  for (var s = 0, n = this.orderNum; s < 4; s++) {
    sideColorMap.push([]);
    for (var i = 0; i < n; i++) {
      sideColorMap[s].push(new Int8Array(n * 2 + 1));
    }
  }

  c2dMargin = (6 * 100 - 500) / 5;
  c2dSide = 100 - 2 * c2dMargin;
  c2dPixelLen = c2dSide / n;
}

TetrahedronRubik.prototype.projectParticle2D = function(map2d, transInfo,
  matrix) {
  var pos = matrix.slice(12, 15);
  var smat = this.surfaceMatrix;

  function findSide(axis) {
    var mi, mv = 0;
    var v = glMatrix.vec4.create();
    var vaxis = smat[axis][2];
    for (var i = 0; i < 4; i++) {
      glMatrix.vec4.transformMat4(v, smat[i][2], matrix);
      var val = glMatrix.vec3.dot(v, vaxis);
      if (val > mv) {
        mv = val;
        mi = i;
      }
    }
    return mi;
  }

  var R = this.R;
  var xunit = 1.5 * R / SQRT3;

  function findY(y, n) {
    for (var i = 0; i < n; i++) {
      //(1 + DN1_3) * i - n + 1
      if (y + 0.1 > R * (n - 1 - 1.5 * i)) {
        return i;
      }
    }
    return i - 1;
  }

  function findX(x, y) {
    return y + parseInt(Math.round(x / xunit));
  }

  for (var axis = 0, s = 0, x = 0, y = 0, c; axis < 4; axis++) {
    if (glMatrix.vec3.dot(pos, smat[axis][2]) < this.surfaceV)
      continue;

    x = glMatrix.vec3.dot(pos, smat[axis][0]);
    y = glMatrix.vec3.dot(pos, smat[axis][1]);

    c = findSide(axis);
    var iy = findY(y, this.orderNum);
    var ix = findX(x, iy);

    map2d[axis][iy][ix] = c + 1;
  }
}

TetrahedronRubik.prototype.draw2D = function(game) {
  for (var s = 0; s < 4; s++) {
    ctx2d.save();
    //  Set pixel side
    ctx2d.translate(100 + c2dMargin + (c2dMargin + c2dSide) * s, c2dMargin);
    ctx2d.scale(c2dPixelLen, c2dPixelLen);
    ctx2d.translate(0.05, 0.05);

    for (var y = 0; y < this.orderNum; y++) {
      for (var xx = 0, xx; xx <= y * 2; xx++) {
        // Draw pixel
        ctx2d.beginPath();
        ctx2d.fillStyle = colorArray2D[sideColorMap[s][y][xx]];
        x = (xx - y) / 2;
        if (xx & 1) {
          ctx2d.moveTo(x, y + 0.95);
          ctx2d.lineTo(x - 0.45, y);
          ctx2d.lineTo(x + 0.45, y);
        } else {
          ctx2d.moveTo(x, y);
          ctx2d.lineTo(x - 0.45, y + 0.95);
          ctx2d.lineTo(x + 0.45, y + 0.95);
        }
        ctx2d.closePath();
        ctx2d.fill();
      }
    }

    ctx2d.restore();
  }
}

//////////////////////////////////////////////////////////////
//
//  DodecahedronRubik
//
function DodecahedronRubik() {
  incept(Rubik, this);
  incept(DodecahedronShape, this);

  this.orderNum = 0;
  this.layerIndices = null;

  //this.setOrder();
  this.game = null;
}

DodecahedronRubik.prototype.initTransforms = function() {

}
DodecahedronRubik.prototype.setOrder = function() {}
DodecahedronRubik.prototype.draw2D = function(game) {}

//////////////////////////////////////////////////////////////
//
//	 RingShape
//
function RingShape() {
  this.vertexBuffer = null;
  this.normalBuffer = null;
  this.vertexIndexBuffer = null;
  this.colorBuffer = null;
  // miscelenious
  this.degree = 0;
}

RingShape.prototype.transform = function(circle, rubik, matrix) {
  var rate = circle.rubik.layerIndices[circle.layer] * rubik.R;
  var translate = [];
  glMatrix.vec3.scale(translate, rubik.xyzAxis[circle.axis + 1], rate);
  glMatrix.mat4.translate(matrix, matrix, translate);
  glMatrix.mat4.rotate(matrix, matrix, ...rubik.ringRotate[circle
    .axis]);
  glMatrix.mat4.rotateZ(matrix, matrix, (this.degree++) * A1);
}

RingShape.prototype.render = function() {
  var gl = gls.gl;

  gls.useShader(gls.lightShader);
  gls.uploadModelMatrixToShader();
  gls.uploadViewMatrixToShader();
  gls.uploadProjectionMatrixToShader();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(false);
  gl.enable(gl.CULL_FACE);

  gls.setColors(this.colorBuffer);
  gls.drawObject(this.vertexBuffer, this.vertexIndexBuffer);

  gl.disable(gl.CULL_FACE);
  gl.depthMask(true);
  gl.disable(gl.BLEND);

  gls.useShader(gls.objectShader);
}

RingShape.prototype.setupBuffer = function(radius) {
  var array = [];
  var colors = [];
  var indices = [];
  var CAP = 36;
  var dR = 2,
    h = 0.1 / 6 * radius,
    R1 = radius * 1.4 * SQRT2_2,
    R2 = R1 + dR;
  var theta = Math.atan2(dR, h) / 2;
  var cosTheta = Math.cos(theta),
    sinTheta = Math.sin(theta);
  var uang = 2 * Math.PI / CAP;
  var pidx = 0;
  for (var i = 0; i < CAP; ++i) {
    var ang = uang * i;
    var cang = Math.cos(ang),
      sang = Math.sin(ang);
    array.push(R1 * cang, R1 * sang, 0);
    array.push(R2 * cang, R2 * sang, h);
    array.push(R2 * cang, R2 * sang, -h);

    colors.push(0.0, 1.0, 1.0, (i % 2 ? 0.1 : 0.5));
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

  var gl = gls.gl;
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
    lyr = parseInt(Math.random() * rbk.orderNum);
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
    lyr = parseInt(Math.random() * rbk.orderNum);
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
  this.actions = [];
  this.clearRotates();
}

Rotatable.prototype.clearRotates = function() {
  this.rotateTrace = {};
}

Rotatable.prototype.pushRotate = function(act) {
  var meta = act.meta;

  if (this.actions.length) {
    var neta = this.actions[0].meta;
    if (meta.similarTo(neta)) {
      if (meta.isRevert(neta)) {
        this.popRotate();
      } else {
        neta.angle += meta.angle;
      }

      return;
    }
  }

  this.actions.unshift(act);
  for (var ci in act) {
    if (this.rotateTrace[ci] == null)
      this.rotateTrace[ci] = [];
    this.rotateTrace[ci].unshift(meta);
  }
}

Rotatable.prototype.popRotate = function() {
  if (this.actions.length <= 0) {
    return null;
  }

  var act = this.actions.shift();
  for (var ci in act) {
    var trace = this.rotateTrace[ci];
    if (trace && trace.length) {
      trace.shift();
    }
  }

  return act;
}

Rotatable.prototype.rotate = function(id, modelMatrix) {
  var trace = this.rotateTrace[id];
  if (trace) {
    for (var i = 0, rot; rot = trace[i]; i++) {
      glMatrix.mat4.rotate(modelMatrix,
        modelMatrix,
        rot.angle,
        this.xyzAxis[rot.axis + 1]); // xyz axis
    }
  }
}









function startup() {
  var canvas2d = document.getElementById("myCanvas");
  canvas2d.addEventListener("click", function(e) {
    var extraX = game.shape == TetrahedronRubik ? 100 : 0;
    var x = e.offsetX - c2dMargin - extraX;
    var unit = c2dSide + c2dMargin;
    var side = parseInt(x / unit);
    if (0 <= side && side < game.rubik.surfaceNum && x % unit <= c2dSide) {
      game.focusASide(side);
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
        if (e.deltaY < 0) game.mayCircle.angle *= -1;
        curRotate = game.rubik.fillMove(game.mayCircle);
        game.animate = new Animation(game, curRotate, false, 2);
        game.animate.done = function(cr) {
          game.rubik.pushRotate(cr);
        }
      }
      game.mayCircle = null;
    }
  });

  gls = new GLSuit(canvas);
  game = new Game();

  update();
}


//////////////////////////////////////////////////////////////
//
//  Animation
function Animation(owner, curmove, reverse = false, s = 1, c = 100) {
  this.owner = owner;
  this.currentRotate = curmove;
  this.reverse = reverse;
  this.frame = 0;
  this.cap = c || 100;
  this.step = s;
  this.done = null;
}

Animation.prototype.next = function() {
  this.frame += this.step;
  if (this.frame > this.cap) {
    var cr = this.currentRotate;
    this.currentRotate = null;

    if (this.done) {
      this.done(cr);
    }

    if (this.currentRotate) {
      this.frame = 0;
    } else {
      this.owner.enterManual();
    }
    this.owner.refresh2D();
  }
}

Animation.prototype.progress = function() {
  var prog = this.frame / (this.cap || 1);
  return this.reverse ? 1 - prog : prog;
}

Animation.prototype.animateRotate = function(tfid, matrix) {
  var act = this.currentRotate[tfid];
  if (act) {
    glMatrix.mat4.rotate(matrix,
      matrix,
      act.angle * this.progress(),
      this.owner.rubik.xyzAxis[act.axis + 1]);
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

  this.shape = CubeRubik;
  this.changeOrder(3);
}

Game.prototype.changeShape = function(s) {
  if (s == 0) {
    this.shape = CubeRubik;
  } else {
    this.shape = TetrahedronRubik;
  }

  this.changeOrder(this.rubik.orderNum);
}

Game.prototype.modelToggle = function(s) {
  if (this.shape == CubeRubik) {
    this.shape = TetrahedronRubik;
    //} else if (this.shape == TetrahedronRubik) {
    //  this.shape = DodecahedronRubik;
  } else {
    this.shape = CubeRubik;
  }

  this.changeOrder(this.rubik.orderNum);
}

Game.prototype.changeOrder = function(n) {
  this.rubik = new this.shape(n);
  this.rubik.game = this;

  this.radius = 3 * this.rubik.modelSide * n;

  this.random = new RandomRotator(this.rubik);

  this.ring = new RingShape();
  this.ring.setupBuffer(n * this.rubik.modelSide);

  this.focusASide(0);
  this.refresh2D();
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
    gls.pushModelMatrix();
    this.ring.transform(selectedCircle, this.rubik, gls.modelMatrix);
    this.ring.render();
    gls.popModelMatrix();
  }
}

Game.prototype.refresh2D = function() {
  ctx2d.setTransform(1, 0, 0, 1, 0, 0);
  ctx2d.fillStyle = "#777";
  ctx2d.clearRect(0, 0, 500, 100);

  if (this.rubik) {
    this.rubik.project2D(sideColorMap);
    this.rubik.draw2D(this);
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
    this.animate.done = function(cr) {
      gm.rubik.pushRotate(cr);
      this.currentRotate = gm.random.gen();
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
  if (this.animate && this.animate.currentRotate) {
    var oldDone = this.animate.done;
    this.animate.done = function(cr) {
      if (oldDone && !this.reverse) {
        oldDone.apply(this, [cr]);
      }

      // Stop animation
      this.currentRotate = null;
    }
  } else {
    this.animate = null;
  }

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

Game.prototype.eyePoint = function() {
  return [this.radius * Math.sin(this.perspectiveAngle),
          8 * Math.sin(this.perspectiveAngle / 3),
          this.radius * Math.cos(this.perspectiveAngle)];
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

  this.refresh2D();
}

Game.prototype.drag = function(dragX, dragY) {
  var dist = Math.hypot(dragX, dragY);
  var vec = glMatrix.vec4.create();
  var rubik = this.rubik;
  var cubeMat = glMatrix.mat4.create();
  glMatrix.mat4.multiply(cubeMat, gls.invViewMatrix, gls.invProjMatrix);

  if (this.dragging) {
    // Rotate the rubik
    vec[0] = dragY, vec[1] = dragX;
    glMatrix.vec4.transformMat4(vec, vec, cubeMat);
    glMatrix.mat4.rotate(gls.rotateMatrix,
      gls.rotateMatrix,
      2 * Math.atan2(dist, 20),
      vec);
    this.mayCircle = null;
  } else if (dist > 3) {
    // Select circle candidate
    var axisIdx = 0,
      layerDiff;
    var layer = 0;

    // Select a axis
    vec[0] = dragX, vec[1] = -dragY;
    glMatrix.vec4.normalize(vec, vec);
    glMatrix.vec4.transformMat4(vec, vec, cubeMat);
    for (var i = 0, mv = 0; i < rubik.axisNum; ++i) {
      var cosAxis = glMatrix.vec3.dot(vec, rubik.xyzAxis[i + 1]);
      if (Math.abs(cosAxis) > mv) {
        axisIdx = i;
        layerDiff = Math.sign(cosAxis);
        mv = cosAxis * layerDiff;
        layer = layerDiff > 0 ? 0 : rubik.orderNum - 1;
      }
    }

    // Update cursor
    if (this.mayCircle) {
      if (this.mayCircle.axis == axisIdx) {
        if (this.mayCircle.tick < 9) {
          this.mayCircle.tick++;
          return;
        }

        layer = this.mayCircle.layer + layerDiff;
        if (layer >= rubik.orderNum) {
          layer = rubik.orderNum - 1;
        } else if (layer < 0) {
          layer = 0;
        }

        this.mayCircle.changeLayer(layer);
        this.refresh2D();
        return;
      }
    }

    this.mayCircle = rubik.getCursor(axisIdx, layer);
    this.refresh2D();
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
  this.refresh2D();
}

function update() {
  gls.render();

  requestAnimationFrame(update);
  game._autoMove();
}



/////////////////////////////////////////////////
// WebGL & glMatrix related
/////////////////////////////////////////////////
function GLShader(gl, vs, fs) {
  this.gl = gl;
  this.vertexShader = vs;
  this.fragmentShader = fs;
  this.program = null;
}

GLShader.prototype.init = function() {
  // 从 DOM 上创建对应的着色器
  if (typeof this.vertexShader === "string") {
    this.vertexShader = this.loadShaderFromDOM(this.vertexShader);
  }

  if (typeof this.fragmentShader === "string") {
    this.fragmentShader = this.loadShaderFromDOM(this.fragmentShader);
  }

  // 创建程序并连接着色器
  var gl = this.gl;
  var shdpr = gl.createProgram();
  gl.attachShader(shdpr, this.vertexShader);
  gl.attachShader(shdpr, this.fragmentShader);
  gl.linkProgram(shdpr);

  // 连接失败的检测
  if (!gl.getProgramParameter(shdpr, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // 使用着色器
  gl.useProgram(shdpr);

  // Virtual function
  this.getArguments(shdpr);
  this.program = shdpr;
}

GLShader.prototype.loadShaderFromDOM = function(id) {
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

  return this.compileShader(shaderSource, shaderScript.type);
}

GLShader.prototype.compileShader = function(src, type) {
  // 创建着色器
  var shader;
  var gl = this.gl;
  if (type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  // 编译着色器
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  // 判断编译是否成功
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}


/////////////////////////////////////////////////
function GLSuit(canvas) {
  this.gl = this.createGLContext(canvas);

  this.setupShaders();
  this.gl.enable(this.gl.DEPTH_TEST);

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

GLSuit.prototype.setupShaders = function() {
  // 创建程序并连接着色器
  var gl = this.gl;
  var shdpr = new GLShader(gl, "shader-vs", "shader-fs");
  shdpr.getArguments = function(shd) {
    // 获取 attribute 属性的位置
    this.vertexPositionAttribute = gl.getAttribLocation(shd,
      "aVertexPosition");
    this.vertexColorAttribute = gl.getAttribLocation(shd,
      "aVertexColor");
    this.vertexNormalAttribute = gl.getAttribLocation(shd,
      "aVertexNormal");
    // 设定 aVertexColor 属性为数组类型的变量数据
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexColorAttribute);
    gl.enableVertexAttribArray(this.vertexNormalAttribute);

    // 获取 uniform 属性的位置
    // matrix
    this.uniformMMatrix = gl.getUniformLocation(shd, "uMMatrix");
    this.uniformVMatrix = gl.getUniformLocation(shd, "uVMatrix");
    this.uniformPMatrix = gl.getUniformLocation(shd, "uPMatrix");
    // inv matrix
    this.uniformInvMMatrix = gl.getUniformLocation(shd, 'invMMatrix');
    this.uniformInvVMatrix = gl.getUniformLocation(shd, 'invVMatrix');
    this.uniformInvPMatrix = gl.getUniformLocation(shd, 'invPMatrix');
    // vector
    this.uniformEyeDirection = gl.getUniformLocation(shd,
      'eyeDirection');
    this.uniformAmbientColor = gl.getUniformLocation(shd,
      'ambientColor');
    this.uniformLightDirection = gl.getUniformLocation(shd,
      'lightDirection');

    // Setup default value
    gl.uniform3fv(this.uniformLightDirection, [-1, 1, -1]);
    gl.uniform4fv(this.uniformAmbientColor, [0.01, 0.01, 0.01, 1.0]);
  }
  shdpr.init();
  this.objectShader = shdpr;

  var lshdpr = new GLShader(gl, "light-vs", "light-fs");
  lshdpr.getArguments = function(shd) {
    // 获取 attribute 属性的位置
    this.vertexPositionAttribute = gl.getAttribLocation(shd,
      "aVertexPosition");
    this.vertexColorAttribute = gl.getAttribLocation(shd,
      "aVertexColor");
    //
    // 设定 aVertexColor 属性为数组类型的变量数据
    gl.enableVertexAttribArray(this.vertexPositionAttribute);
    gl.enableVertexAttribArray(this.vertexColorAttribute);

    // 获取 uniform 属性的位置
    // matrix
    this.uniformMMatrix = gl.getUniformLocation(shd, "uMMatrix");
    this.uniformVMatrix = gl.getUniformLocation(shd, "uVMatrix");
    this.uniformPMatrix = gl.getUniformLocation(shd, "uPMatrix");
    // vector
  }
  lshdpr.init();
  this.lightShader = lshdpr;

  this.useShader(this.objectShader);
}

GLSuit.prototype.useShader = function(shr) {
  this.gl.useProgram(shr.program);
  this.shaderProgram = shr;
}

GLSuit.prototype.arrayToBuffer = function(array, unit) {
  var gl = this.gl;
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
  buffer.itemSize = unit;
  buffer.numberOfItems = array.length / unit;

  return buffer;
}

GLSuit.prototype.indexToBuffer = function(array) {
  var gl = this.gl;
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array),
    gl.STATIC_DRAW);
  buffer.itemSize = 1;
  buffer.numberOfItems = array.length;

  return buffer;
}

GLSuit.prototype.uploadViewMatrixToShader = function() {
  var gl = this.gl;
  var shdpr = this.shaderProgram;
  gl.uniformMatrix4fv(shdpr.uniformVMatrix, false, this.viewMatrix);

  if (shdpr == this.objectShader) {
    glMatrix.mat4.invert(this.invViewMatrix, this.viewMatrix);
    gl.uniformMatrix4fv(shdpr.uniformInvVMatrix, false, this.invViewMatrix);
  }
}

GLSuit.prototype.uploadModelMatrixToShader = function() {
  var gl = this.gl;
  var shdpr = this.shaderProgram;
  gl.uniformMatrix4fv(shdpr.uniformMMatrix, false, this.modelMatrix);

  if (shdpr == this.objectShader) {
    glMatrix.mat4.invert(this.invModelMatrix, this.modelMatrix);
    gl.uniformMatrix4fv(shdpr.uniformInvMMatrix, false, this.invModelMatrix);
  }
}

GLSuit.prototype.uploadProjectionMatrixToShader = function() {
  var gl = this.gl;
  var shdpr = this.shaderProgram;
  gl.uniformMatrix4fv(shdpr.uniformPMatrix, false, this.projectionMatrix);

  if (shdpr == this.objectShader) {
    glMatrix.mat4.invert(this.invProjMatrix, this.projectionMatrix);
    gl.uniformMatrix4fv(shdpr.uniformInvPMatrix, false, this.invProjMatrix);
  }
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
  this.gl.disableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
  this.gl.vertexAttrib3f(this.shaderProgram.vertexNormalAttribute, ...normal);
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
  var gl = this.gl;
  // Set vertex positions
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute,
    vertices.itemSize, gl.FLOAT, false, 0, 0);

  // Draw surfaces
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.drawElements(gl.TRIANGLES, indices.numberOfItems, gl.UNSIGNED_SHORT, 0);
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
  glMatrix.mat4.perspective(this.projectionMatrix, 60 * A1,
    gl.viewportWidth / gl.viewportHeight, 0.1, 100);
  this.uploadProjectionMatrixToShader();


  // 初始化模型视图矩阵
  var eyePoint = game.eyePoint();
  gl.uniform3fv(shaderProgram.uniformEyeDirection, eyePoint);

  glMatrix.mat4.identity(this.viewMatrix);
  glMatrix.mat4.lookAt(this.viewMatrix, eyePoint, [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.multiply(this.viewMatrix, this.viewMatrix, this.rotateMatrix);
  this.uploadViewMatrixToShader();

  glMatrix.mat4.identity(this.modelMatrix);

  game.render();
}
