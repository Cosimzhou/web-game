/*************************************************************************
    > File Name: pintu.js
    > Author: cosim
    > Mail: cosimzhou@hotmail.com
    > Created Time: 日  4/ 5 20:04:04 2014
 ************************************************************************/

(function() {
  var exports = window || {};
  var TwoPI = Math.PI * 2;
  var PI_2 = Math.PI / 2;
  var Ratio = 2;

  function noise() {
    return Math.random() * 7 - 3;
  }

  function genEdge() {
    var neg = Math.random() < 0.5 ? 1 : -1;
    var pparray = [50, 5, 50, -5, 40, -15, 30, -25, 40, -35, 50, -35, 60, -35,
        70, -25, 60, -15, 50, -5, 50, 5, 100, 0
      ],
      parray = [];

    function adjustSubRange(odx, ody, pi) {
      var ox = pparray[pi] + noise(),
        oy = pparray[pi + 1] + noise();
      var dx = odx + noise(),
        dy = ody + noise();

      parray.push(ox + dx);
      parray.push(neg * (oy + dy));
      parray.push(ox);
      parray.push(neg * oy);
      var rn = -(Math.random() * 0.5 + 0.75);
      dx *= rn, dy *= rn;
      parray.push(ox + dx);
      parray.push(neg * (oy + dy));
    }

    parray.push(pparray[0] + noise());
    parray.push(neg * (pparray[1] + noise()));

    adjustSubRange(10, 10, 4);
    adjustSubRange(-10, 0, 10);
    adjustSubRange(10, -10, 16);

    for (var i = 20; i < 22; ++i)
      parray.push((i % 2 ? neg : 1) * (pparray[i] + noise()));
    parray.push(pparray[22]);
    parray.push(pparray[23]);

    parray.neg = neg < 0;
    return parray;
  }

  function nor(ang) {
    ang = ((ang % TwoPI) + TwoPI) % TwoPI;
    return (ang > Math.PI ? ang - TwoPI : ang);
  }

  var imageWidth, imageHeight;
  var Scale = 1;
  var DragX = 0,
    DragY = 0;
  var g_Game;


  function Game(container, cx = 4, cy = 4) {
    this._is_over = false;
    this._CX = cx;
    this._CY = cy
    this.focusPiece = null;
    //this.GenPuzzle();

    container.addEventListener('mousemove', pointerMove);
    container.addEventListener('touchmove', touchMove);
    container.addEventListener('mousedown', pointerDown);
    container.addEventListener('touchstart', touchDown);
    container.addEventListener('mouseup', pointerUp);
    container.addEventListener('touchend', touchUp);
    container.addEventListener('mouseleave', pointerLeave);
    container.addEventListener('touchleave', pointerLeave);
    container.addEventListener('mousewheel', pointerRoll);


    this._ctx = container.getContext("2d");
    this._ctx.scale(Scale, Scale);

    imageWidth = container.width;
    imageHeight = container.height;

    g_Game = this;
  }
  exports.Game = Game;

  Game.prototype.GenPuzzle = function() {
    this.verticals = [];
    for (var j = 0; j < this._CY; j++) {
      this.verticals.push([])
      for (var i = 0; i < this._CX - 1; i++) {
        var edge = genEdge();
        this.verticals[j].push(edge);
      }
    }

    this.horizontals = [];
    for (var j = 0; j < this._CY - 1; j++) {
      this.horizontals.push([])
      for (var i = 0; i < this._CX; i++) {
        var edge = genEdge();
        this.horizontals[j].push(edge);
      }
    }

    var piemap = [];
    for (var i = 0; i < this._CY; i++) {
      piemap.push([]);
      for (var j = 0; j < this._CX; j++) {
        piemap[i].push(new Piece(i, j));
        piemap[i][j].left = piemap[i][j - 1];
        if (i > 0) piemap[i][j].up = piemap[i - 1][j];
      }
    }

    for (var i = 0; i < this._CY; i++) {
      for (var j = 0; j < this._CX - 1; j++) {
        piemap[i][j].right = piemap[i][j + 1];
      }
    }

    for (var i = 0; i < this._CY - 1; i++) {
      for (var j = 0; j < this._CX; j++) {
        piemap[i][j].down = piemap[i + 1][j];
      }
    }

    this.pieces = [];
    for (var i = 0; i < this._CY; i++) {
      for (var j = 0; j < this._CX; j++) {
        var piece = piemap[i][j];
        this.pieces.push(piece);
        piece.x = 80 + Math.random() * (imageWidth - 160);
        piece.y = 80 + Math.random() * (imageHeight - 160);
        piece.x /= Scale;
        piece.y /= Scale;
        piece.flip = false;
        piece.ang = Math.random() * TwoPI;
        piece.typeKind(this);
      }
    }
    console.log(this.pieces);

    this.sort2();
  }

  Game.prototype.sort = function() {
    var cx = (imageWidth - 800) / 4;
    cy = (imageHeight - 400) / 2;
    for (var piece of this.pieces) {
      var pos = piece.kind;
      if (pos == 1) {
        if (piece.r == 0) {
          piece.ang = -PI_2;
        } else if (piece.r == this._CY - 1) {
          piece.ang = PI_2;
        } else if (piece.c == 0) {
          piece.ang = 0;
        } else if (piece.c == this._CX - 1) {
          piece.ang = Math.PI;
        }
      }

      piece.x = 100 + Math.random() * cx + (pos % 4) * imageWidth / 4;
      piece.y = 100 + Math.random() * cy + parseInt(pos / 4) * imageHeight /
        2;
    }
  }

  Game.prototype.sort2 = function() {
    var cx = (imageWidth - 800) / 4;
    cy = (imageHeight - 400) / 2;
    var horizonDict = {
      0: 0,
      //
      1: 0,
      2: -PI_2,
      4: Math.PI,
      8: PI_2,
      //
      5: 0,
      10: PI_2,
      //
      3: 0,
      6: -PI_2,
      12: Math.PI,
      9: PI_2,
      //
      15: 0,
      //
      7: 0,
      14: -PI_2,
      13: Math.PI,
      11: PI_2,
    };

    for (var piece of this.pieces) {
      var pos = piece.kind;
      switch (pos) {
        case 0:
          if (piece.r == 0) {
            if (piece.c == 0) piece.ang = 0;
            else if (piece.c == this._CX - 1) piece.ang = -PI_2;
          } else if (piece.r == this._CY - 1) {
            if (piece.c == 0) piece.ang = PI_2;
            else if (piece.c == this._CX - 1) piece.ang = Math.PI;
          }
          break;
        case 1:
          if (piece.r == 0) {
            piece.ang = -PI_2;
          } else if (piece.r == this._CY - 1) {
            piece.ang = PI_2;
          } else if (piece.c == 0) {
            piece.ang = 0;
          } else if (piece.c == this._CX - 1) {
            piece.ang = Math.PI;
          }
          break;
        default:
          piece.ang = horizonDict[piece.mask];
      }

      piece.x = 100 + Math.random() * cx + (pos % 4) * imageWidth / 4;
      piece.y = 100 + Math.random() * cy + parseInt(pos / 4) * imageHeight /
        2;
    }
  }

  Game.prototype.drawAll = function(onSpot = 0) {
    var len = this.pieces.length - onSpot;
    for (var i = 0, p; i < len; ++i) {
      this.pieces[i].draw(this, this._ctx);
    }

    if (onSpot) {
      this.cacheImgData = this._ctx.getImageData(0, 0, imageWidth,
        imageHeight);
    }
  }

  Game.prototype.refresh = function(onSpot) {
    if (this.focusPiece) {
      this.cleanScreen();
      this._ctx.putImageData(this.cacheImgData, 0, 0);
      this.focusPiece.draw(this, this._ctx, true);
    } else {
      this.cleanScreen();
      this.drawAll();
    }
  }

  Game.prototype.cleanScreen = function() {
    this._ctx.save();
    this._ctx.beginPath();
    this._ctx.rect(0, 0, imageWidth, imageHeight)
    this._ctx.fillStyle = "#c1c1c1";
    this._ctx.fill();
    this._ctx.closePath();
    this._ctx.restore();

    this._ctx.save();
  }

  Game.prototype.spot = function(x, y) {
    var i = this.pieces.length - 1,
      found_piece = null;
    for (var p; i >= 0; --i) {
      p = this.pieces[i];
      if (p.isFocus(x, y)) {
        found_piece = p;
        break
      }
    }

    if (found_piece) {
      if (found_piece != this.focusPiece) {
        this.pieces[i] = this.pieces[this.pieces.length - 1];
        this.pieces[this.pieces.length - 1] = found_piece;
        this.cleanScreen();
        this.drawAll(1);
        found_piece.draw(this, this._ctx, true)
        this.focusPiece = found_piece;
      }
    } else {
      if (this.focusPiece) {
        this.focusPiece = null;
        this.cleanScreen();
        this.drawAll(0);
      }
    }
  }

  Game.prototype.check = function() {
    this.focusPiece = null;
    this.refresh();

    if (!this._is_over && this.pieces.length == 1) {
      this._is_over = true;
      setTimeout(function() {
        alert("game pass!");
      }, 200);
    }
  }

  Game.prototype.bindOnePair = function() {

  }


  Game.prototype.drawAPiece = function(ctx, r, c, bold = false) {
    if (r < 0 || r >= this._CY || c < 0 || c >= this._CX) {
      return;
    }

    function bezier(parray) {
      for (var i = 0; i < parray.length / 6; i++)
        ctx.bezierCurveTo(...parray.slice(i * 6, (i + 1) * 6));
    }

    ctx.save();
    ctx.beginPath();
    // bottom edge
    ctx.translate(-50, 50);
    ctx.moveTo(0, 0);
    if (r == this._CY - 1) {
      ctx.lineTo(100, 0);
    } else {
      bezier(this.horizontals[r][c]);
    }

    // right edge
    ctx.translate(100, 0);
    ctx.rotate(-PI_2);
    ctx.moveTo(0, 0);
    if (c == this._CX - 1) {
      ctx.lineTo(100, 0);
    } else {
      bezier(this.verticals[r][c]);
    }

    // left edge
    ctx.translate(0, -100);
    ctx.moveTo(0, 0);
    if (c == 0) {
      ctx.lineTo(100, 0);
    } else {
      bezier(this.verticals[r][c - 1]);
    }

    // top edge
    ctx.translate(100, 0);
    ctx.rotate(PI_2);
    ctx.moveTo(0, 0);
    if (r == 0) {
      ctx.lineTo(100, 0);
    } else {
      bezier(this.horizontals[r - 1][c]);
    }

    if (bold) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "green";
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";
    }
    ctx.stroke()
    ctx.fillStyle = "white";
    ctx.rect(0, 0, 100, 100);
    ctx.fill('evenodd');
    ctx.restore();
  }

  function Piece(r, c) {
    this.r = r;
    this.c = c;

    this.x = 0;
    this.y = 0;
    this.ang = 0;
    this.flip = true;

    this.left = null;
    this.right = null;
    this.up = null;
    this.down = null;

    this.block = null;
    this.leftLock = this.rightLock = this.upLock = this.downLock = false;
  }

  Piece.prototype.typeKind = function(game) {
    if (this.kind != null) return this.kind;
    var edgen = 0;
    if (this.r == 0) edgen++;
    else if (this.r == game._CY - 1) edgen++;
    if (this.c == 0) edgen++;
    else if (this.c == game._CX - 1) edgen++;
    if (edgen == 1) {
      this.kind = 1;
      return this.kind;
    } else if (edgen == 2) {
      this.kind = 0;
      return this.kind;
    }

    var mask = 0;
    edgen = 0;
    if (!game.verticals[this.r][this.c].neg)
      edgen++, mask |= 1;
    if (!game.horizontals[this.r][this.c].neg)
      edgen++, mask |= 2;
    if (game.verticals[this.r][this.c - 1].neg)
      edgen++, mask |= 4;
    if (game.horizontals[this.r - 1][this.c].neg)
      edgen++, mask |= 8;

    this.kind = edgen + 2;
    this.mask = mask;

    if (edgen == 2 && (mask == 10 || mask == 5))
      this.kind = 7;
    return this.kind;
  }

  Piece.prototype.draw = function(game, ctx, bold) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.ang);
    if (this.flip) ctx.scale(1, -1);
    game.drawAPiece(ctx, this.r, this.c, bold);
    ctx.restore();
  }

  Piece.prototype.isFocus = function(x, y) {
    var dx = this.x - x,
      dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 50;
  }

  Piece.prototype.move = function(x, y) {
    if (this.block == null) {
      this.x += x;
      this.y += y;

      if (this.x < 50) {
        this.x = 50;
      }
      if (this.y < 50) {
        this.y = 50;
      }
      if (this.x > imageWidth - 50) {
        this.x = imageWidth - 50;
      }
      if (this.y > imageHeight - 50) {
        this.y = imageHeight - 50;
      }

      this.match();
    }
  }

  Piece.prototype.rotate = function(r) {
    this.ang = nor(this.ang + r);
    this.match();
  }

  Piece.prototype.match = function() {
    var anglimit = Math.PI / 18;

    function match2Pieces(obj, other) {
      if (obj.flip != other.flip) return false;

      var dang = ((other.ang - obj.ang) % TwoPI + TwoPI) % TwoPI;
      if (dang > Math.PI) dang = TwoPI - dang;
      if (dang >= anglimit) return false;

      var dx = other.x - obj.x,
        dy = other.y - obj.y;
      dis = Math.sqrt(dx * dx + dy * dy);
      if (Math.abs(dis - 100) > 4) {
        return false;
      }

      var aang = 0;
      if (obj.left == other) {
        aang = -Math.PI;
      } else if (obj.right == other) {} else if (obj.up == other) {
        aang = -PI_2;
      } else if (obj.down == other) {
        aang = PI_2;
      } else {
        return;
      }
      aang = nor(aang + obj.ang);

      var iang = Math.atan2(-dy, dx),
        dang = Math.abs(iang - aang);
      if (dang < 9 * Math.PI / 10 && dang > Math.PI / 10) {
        return false;
      }

      if (obj.block) {
        obj.block.absorb(obj, other);
      } else if (other.block) {
        other.block.absorb(other, obj);
      } else {
        obj.block = new PieceBlock(obj, other);
      }

      g_Game.check();
      return true;
    }

    var flag = false;
    if (!this.leftLock && this.left) {
      flag |= this.leftLock = match2Pieces(this, this.left);
      this.left.rightLock = this.leftLock;
    }

    if (!this.rightLock && this.right) {
      flag |= this.rightLock = match2Pieces(this, this.right);
      this.right.leftLock = this.rightLock;
    }

    if (!this.upLock && this.up) {
      flag |= this.upLock = match2Pieces(this, this.up);
      this.up.downLock = this.upLock;
    }

    if (!this.downLock && this.down) {
      flag |= this.downLock = match2Pieces(this, this.down);
      this.down.upLock = this.downLock;
    }

    return flag;
  }

  Piece.prototype.fit = function(obj) {
    var ax = 0,
      ay = 0;
    if (this.left == obj) {
      ax = -100;
    } else if (this.right == obj) {
      ax = 100;
    } else if (this.up == obj) {
      ay = -100;
    } else if (this.down == obj) {
      ay = 100;
    } else {
      return;
    }

    var dx = ax * Math.cos(this.ang) - ay * Math.sin(this.ang),
      dy = ax * Math.sin(this.ang) + ay * Math.cos(this.ang);
    obj.x = this.x + dx;
    obj.y = this.y + dy;
    obj.ang = this.ang;
  }

  function PieceBlock(obj, obj1) {
    this.pieces = [obj, obj1];
    this.spotOne = null;

    i = g_Game.pieces.findIndex(x => x == obj);
    g_Game.pieces.splice(i, 1);

    i = g_Game.pieces.findIndex(x => x == obj1);
    g_Game.pieces.splice(i, 1);

    g_Game.pieces.push(this);

    obj.block = obj1.block = this;

    obj.fit(obj1);
  }

  PieceBlock.prototype.isFocus = function(x, y) {
    for (var p of this.pieces) {
      if (p.isFocus(x, y)) {
        this.spotOne = p;
        return true;
      }
    }
    return false;
  }

  PieceBlock.prototype.move = function(x, y) {
    if (this.spotOne) {
      var p = this.spotOne;
      var ox = p.x,
        oy = p.y;
      p.x += x, p.y += y;
      if (p.x < 50) p.x = 50;
      if (p.y < 50) p.y = 50;
      if (p.x > imageWidth - 50) p.x = imageWidth - 50;
      if (p.y > imageHeight - 50) p.y = imageHeight - 50;
      x = p.x - ox, y = p.y - oy;
      p.x = ox, p.y = oy;
    } else return;

    for (var len = this.pieces.length, i = 0; i < len; i++) {
      var p = this.pieces[i];
      p.x += x, p.y += y;
      p.match();
    }
  }

  PieceBlock.prototype.rotate = function(r) {
    if (this.spotOne == null || r == 0)
      return;

    for (var p of this.pieces) {
      var dx = p.x - this.spotOne.x,
        dy = p.y - this.spotOne.y;
      var x = dx * Math.cos(r) - dy * Math.sin(r),
        y = dx * Math.sin(r) + dy * Math.cos(r);

      p.x = this.spotOne.x + x;
      p.y = this.spotOne.y + y;
      p.ang += r;
    }
  }

  PieceBlock.prototype.draw = function(game, ctx, opt) {
    for (var p of this.pieces) {
      p.draw(game, ctx, opt);
    }
  }

  PieceBlock.prototype.absorb = function(me, other) {
    if (other.block == null) {
      me.fit(other);
      this.pieces.push(other);
      other.block = this;

      i = g_Game.pieces.findIndex(x => x == other);
      g_Game.pieces.splice(i, 1);
      return;
    }
    if (other.block == this) {
      return;
    }

    var oblock = other.block;
    oblock.spotOne = other;
    dang = me.ang - other.ang;
    oblock.rotate(dang);

    var ox = other.x,
      oy = other.y;
    me.fit(other);
    ox = other.x - ox;
    oy = other.y - oy;

    for (var p of oblock.pieces) {
      if (p != other) {
        p.x += ox;
        p.y += oy;
      }
      this.pieces.push(p);
      p.block = this;
    }

    var idx = g_Game.pieces.findIndex(x => x == oblock);
    g_Game.pieces.splice(idx, 1);

    if (oblock == g_Game.focusPiece) {
      g_Game.focusPiece = null;
    }
  }

  var endAnimatingFunc = null;
  var Animating = false;
  var animateCursor = 0;
  var animateTop = 12;

  function procedureAnime() {
    g_Game.focusPiece.x = 0;
  }

  var lastPosX = 0,
    lastPosY = 0;

  function touchMove(e) {
    if (Animating) return;
    if (e.touches.length == 1) {
      var tch = e.touches[0];
      var x = tch.clientX * Ratio / Scale,
        y = tch.clientY * Ratio / Scale;

      if (g_Game.focusPiece) {
        g_Game.focusPiece.move(x - lastPosX, y - lastPosY);
        g_Game.refresh();
      }

      lastPosX = x, lastPosY = y;
    }

    console.log("touchMove", e);
  }

  function touchDown(e) {
    if (Animating) return;
    if (e.touches.length == 1) {
      var tch = e.touches[0];
      var x = tch.clientX * Ratio / Scale,
        y = tch.clientY * Ratio / Scale;
      g_Game.spot(x, y);
      lastPosX = x, lastPosY = y;
    }

    console.log("touchDown", e);
  }

  function touchUp(e) {
    if (Animating) return;
    g_Game.focusPiece = null;
    lastPosX = null, lastPosY = null;
  }

  var drag = false;
  var hasMove = false;

  function pointerMove(e) {
    hasMove = true;
    if (Animating) return;
    var x = e.offsetX * Ratio / Scale,
      y = e.offsetY * Ratio / Scale;
    if (drag) {
      if (g_Game.focusPiece) {
        g_Game.focusPiece.move(e.movementX * Ratio / Scale, e.movementY *
          Ratio /
          Scale);
        g_Game.refresh();
      }
    } else {
      g_Game.spot(x, y);
    }
    console.log("pointermove", e);
  }

  function pointerDown(e) {
    hasMove = false;
    drag = true;
    console.log("pointerDown", e);
  }

  function pointerUp(e) {
    drag = false;
    if (Animating) return;
    if (!hasMove) {
      // click
      if (g_Game.focusPiece) {
        var ang = g_Game.focusPiece.ang != null ? g_Game.focusPiece.ang :
          g_Game.focusPiece.pieces[0].ang;
        var dir = Math.floor(ang / TwoPI);
        dir = (dir + 1) * PI_2 - ang;
        g_Game.focusPiece.rotate(dir);
        g_Game.refresh();
      }
    }
    console.log("pointerUp", e);
  }

  function pointerRoll(e) {
    if (Animating) return;
    if (g_Game.focusPiece) {
      var dang = Math.PI * e.wheelDelta / 180;
      g_Game.focusPiece.rotate(dang);
      g_Game.refresh();
    } else {
      var pt = [e.offsetX, e.offsetY];
      me.zoom(me._zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), pt);

    }
  }

  function pointerLeave(e) {
    drag = false;
    hasMove = false;
  }

  //MapViewer2D.prototype.zoom = function(nzoom, pt = null) {
  //  var x, y;
  //  if (pt) {
  //    x = pt[0], y = pt[1];
  //  } else {
  //    x = this.width / 2, y = this.height / 2;
  //  }

  //  var hw = this.width / 2,
  //    hh = this.height / 2;
  //  var ratio = nzoom / this._zoom - 1;
  //  this._rate = this._rate / this._zoom * nzoom;
  //  this._point_radius = point_pixels / this._rate;
  //  this._zoom = nzoom;
  //  this._transX += (hw + this._transX - x) * ratio;
  //  this._transY += (hh + this._transY - y) * ratio;
  //}



  var timeCounterStart = 0;

  function setw(num, w) {
    return ("0000" + num).substr(-w);
  }

  function showTime() {
    var timer = document.getElementById("timer");
    timer.innerHTML = "0:00:00.000";

    var tick = Date.now() - timeCounterStart;
    var ms = tick % 1000;
    tick = (tick - ms) / 1000;
    sec = tick % 60;
    tick = (tick - sec) / 60;

    min = tick % 60;
    tick = (tick - min) / 60;

    hour = tick;

    timer.innerHTML = hour + ":" + setw(min, 2) + ":" + setw(sec, 2) + "." +
      setw(
        ms, 3);
  }

  function Start() {
    g_Game.GenPuzzle();
    g_Game.cleanScreen();
    g_Game.drawAll();

    var timer = document.getElementById("timer");
    timer.innerHTML = "0:00:00";

    timeCounterStart = Date.now();
    setInterval(showTime, 128);
  }
  exports.Start = Start;

})();
