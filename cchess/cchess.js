(function() {
  var exports = window || {};
  var M2PI = Math.PI * 2;
  var CX = 9,
    CY = 10;
  var WALL = 0xff;
  var ChessMarkTexts = [[, "將", "士", "象", "馬", "車", "炮", "卒", ],
   [, "帥", "仕", "相", "馬", "車", "炮", "兵", ]];

  var GameUI = c2g.GameUI;
  GameUI.prototype.gameClear = function() {
    alert("Game over");
  }
  GameUI.prototype.finishAnimate = function() {
    alert("Game over");
  }
  GameUI.prototype.initImpl = function() {
    this._turn = true;
  }
  GameUI.prototype.putSpriteImpl = function(e) {
    if (!this.spotted) return;
    var pt = this.pointToPot(e);
    var brd = this.base;
    var chm = brd._mps[this.spotted];
    if (chm != null) {
      var allows = this._coverage._allowMoves[chm._pos];
      if (allows && allows.has(pt)) {
        this.base._move(this.spotted, pt);
        this._turn = !this._turn;
        this.updateImpl();
      } else {
        this.base._map[chm._pos] = chm._id;
      }
    }

    this.spotted = null;
    this.refresh();

    if (!this._turn) {
      // Because of the capablity of the web browser, the search
      // depth is limited not greater than 2.
      var mv = AISearch(this.base, false, 2);
      if (mv) {
        var chm = this.base._mps[mv[0]];
        console.log(mv, chm._pos);
        this.base._map[chm._pos] = 0;
        this.animate = new c2g.Animate(this, mv[0], chm._pos, mv[1], 0);
      } else {
        alert("困毙");
      }
    }
  }

  GameUI.prototype.pickSpriteImpl = function(mid) {
    var brd = this.base;
    var chm = brd._mps[mid];
    if (chm != null && (this._turn == chm._isRed())) {
      brd._map[chm._pos] = 0;
    } else {
      this.spotted = null;
    }
  }

  GameUI.prototype.updateImpl = function() {
    this._coverage = this.base._queryAvailable(this._turn);
    this._rivalCoverage = this.base._queryAvailable(!this._turn);

    console.log(Evaluate(this.base, this._turn));
  }
  GameUI.prototype.dragSpriteImpl = function() {}

  GameUI.prototype.refreshImpl = function() {
    this.drawBoard();
    this.drawBlocks();
    this.drawHintRoot();
    this.drawSpotted();
  }
  GameUI.prototype.drawSpotted = function() {
    if (this.spotted) {
      var chm = this.base._mps[this.spotted];
      var pt = this.spottedPos;
      this.drawChessman(pt[0], pt[1], chm);
    }
  }
  GameUI.prototype.drawHintRoot = function() {
    if (this.noHint) return;
    var ctx = this.ctx;
    var lw = this.ctx.lineWidth;
    var ss = this.ctx.strokeStyle;
    var base = this.base;

    ctx.lineWidth = 0.025;
    for (var p = 11; p < 110; p++) {
      if (base._map[p] == WALL) continue;
      var x = p % 10 - 1,
        y = parseInt(p / 10) - 1;
      var chi = base._map[p];
      if (chi == 0) {

      } else {
        var cover, threat;
        if ((chi > 32) == this._turn) {
          cover = this._coverage._rootedPots.has(p),
            threat = this._rivalCoverage._attackPots.has(p);
        } else {
          cover = this._rivalCoverage._rootedPots.has(p),
            threat = this._coverage._attackPots.has(p);
        }
        if (cover && threat) {
          ctx.strokeStyle = "green";
          ctx.beginPath();
          ctx.moveTo(x + 0.5, y);
          ctx.arc(x, y, 0.5, 0, Math.PI);
          ctx.stroke();
          ctx.closePath();

          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.arc(x, y, 0.5, Math.PI, M2PI);
          ctx.stroke();
          ctx.closePath();
        } else if (cover || threat) {
          ctx.strokeStyle = cover ? "green" : "red";
          ctx.beginPath();
          ctx.moveTo(x + 0.5, y);
          ctx.ellipse(x, y, 0.5, 0.5, 0, 0, M2PI);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }

    ctx.strokeStyle = ss;
    ctx.lineWidth = lw;
  }
  GameUI.prototype.drawStar = function(x, y) {
    this.ctx.beginPath();
    if (x > 0) {
      this.ctx.moveTo(x - 0.1, y - 0.3);
      this.ctx.lineTo(x - 0.1, y - 0.1);
      this.ctx.lineTo(x - 0.3, y - 0.1);

      this.ctx.moveTo(x - 0.1, y + 0.3);
      this.ctx.lineTo(x - 0.1, y + 0.1);
      this.ctx.lineTo(x - 0.3, y + 0.1);
    }

    if (x < 8) {
      this.ctx.moveTo(x + 0.1, y + 0.3);
      this.ctx.lineTo(x + 0.1, y + 0.1);
      this.ctx.lineTo(x + 0.3, y + 0.1);

      this.ctx.moveTo(x + 0.1, y - 0.3);
      this.ctx.lineTo(x + 0.1, y - 0.1);
      this.ctx.lineTo(x + 0.3, y - 0.1);
    }

    this.ctx.stroke();
    this.ctx.closePath();
  }
  GameUI.prototype.drawBoard = function() {
    this.ctx.beginPath();
    this.ctx.lineWidth = 0.04;
    // Horizontal lines
    for (var i = 0; i < 10; i++) {
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(8, i);
    }

    // Vertical lines
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 9);
    this.ctx.moveTo(8, 0);
    this.ctx.lineTo(8, 9);

    // Vertical splitted by river
    for (var i = 1; i < 8; i++) {
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, 4);
      this.ctx.moveTo(i, 5);
      this.ctx.lineTo(i, 9);
    }

    // X cross
    this.ctx.moveTo(3, 0);
    this.ctx.lineTo(5, 2);
    this.ctx.moveTo(3, 2);
    this.ctx.lineTo(5, 0);

    // X cross
    this.ctx.moveTo(3, 7);
    this.ctx.lineTo(5, 9);
    this.ctx.moveTo(3, 9);
    this.ctx.lineTo(5, 7);

    this.ctx.stroke();
    this.ctx.closePath();

    this.drawStar(1, 2);
    this.drawStar(1, 7);
    this.drawStar(7, 2);
    this.drawStar(7, 7);
    for (var i = 0; i < 9; i += 2) {
      this.drawStar(i, 3);
      this.drawStar(i, 6);
    }
  }

  GameUI.prototype.drawChessman = function(x, y, chm) {
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, 0.45, 0.45, 0, 0, M2PI);
    this.ctx.fillStyle = "#ffe9ba";
    this.ctx.fill();
    this.ctx.lineWidth = 0.01;
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.save();
    var point = this.ctx.getTransform().transformPoint({
      x: x,
      y: y + 0.05
    });

    this.ctx.font = '10px sans-serif';
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.scale(0.06, 0.06);
    var pos = this.ctx.getTransform().inverse().transformPoint(point);

    var txt = ChessMarkTexts[chm._id > 30 ? 1 : 0][chm._kind()];
    this.ctx.fillStyle = "#fff";
    this.ctx.fillText(txt, pos.x + 0.8, pos.y + 0.8);

    this.ctx.fillStyle = chm._id > 30 ? "#f00" : "#000";
    this.ctx.fillText(txt, pos.x, pos.y);
    this.ctx.restore();
  }

  GameUI.prototype.drawBlocks = function() {
    var board = this.base._map;
    var base = this.base;
    for (var i = 11; i < 110; i++) {
      if (board[i] && board[i] != WALL) {
        var x = (i % 10) - 1,
          y = parseInt(i / 10) - 1;
        this.drawChessman(x, y, base._mps[board[i]]);
      }
    }
  }

  var g_ui;
  var st = 0;

  function setUp(canvas) {
    g_ui = new GameUI(canvas);
    g_ui.base = new Board();
    g_ui.updateImpl();
    g_ui.refresh();
  }

  exports['setUp'] = setUp;
  exports['reload'] = function(st) {}
  exports['next'] = function() {}
  exports['prev'] = function() {
    var base = g_ui.base;
    if (base._history.length > 0) {
      base._unmove();
      base._unmove();
      g_ui.updateImpl();
      g_ui.refresh();
    } else {
      alert("");
    }
  }
  exports['answer'] = function() {
    //if (g_ui.base.isOver()) return;

    //if (g_ui.answer) {
    //  g_ui.answer = null;
    //  return;
    //}

    //var answer = Travel(g_ui.game);
    //var mv = answer[0];

    //g_ui.refresh();
    //g_ui.answer = answer;
  }

  function ChessMan(id, pos) {
    this._pos = pos;
    this._id = id;
  }
  ChessMan.prototype.push = c2g.LinkList.prototype.push;
  ChessMan.prototype.pick = c2g.LinkList.prototype.pick;
  ChessMan.prototype._kind = function() {
    return this._id & 16 ? 7 : (this._id & 0xf) >> 1;
  }
  ChessMan.prototype._isRed = function() {
    return this._id > 32;
  }
  ChessMan.prototype._sameside = function(chm) {
    return this._samesideid(chm._id);
  }
  ChessMan.prototype._samesideid = function(chmid) {
    return ((this._id ^ chmid) & 0x20) == 0;
  }
  ChessMan.prototype._genmove = function(board) {
    var res = new Set();
    switch (this._kind()) {
      case 1:
        if (this._isRed()) {
          this.__shuaimove(res, board);
        } else {
          this.__jiangmove(res, board);
        }
        break;
      case 2:
        this.__shimove(res, board);
        break;
      case 3:
        this.__xiangmove(res, board);
        break;
      case 4:
        this.__mamove(res, board);
        break;
      case 5:
        this.__jumove(res, board);
        break;
      case 6:
        this.__paomove(res, board);
        break;
      case 7:
        if (this._isRed()) {
          this.__bingmove(res, board);
        } else {
          this.__zumove(res, board);
        }
        break;
    }
    return res;
  }

  ChessMan.prototype.__bingmove = function(res, board) {
    if (this._pos < 60) {
      if (board[this._pos + 1] != WALL) res.add(this._pos + 1);
      if (board[this._pos - 1] != WALL) res.add(this._pos - 1);
    }
    if (board[this._pos - 10] != WALL) res.add(this._pos - 10);
  }
  ChessMan.prototype.__zumove = function(res, board) {
    if (this._pos > 60) {
      if (board[this._pos + 1] != WALL) res.add(this._pos + 1);
      if (board[this._pos - 1] != WALL) res.add(this._pos - 1);
    }
    if (board[this._pos + 10] != WALL) res.add(this._pos + 10);
  }
  ChessMan.prototype.__mamove = function(res, board) {
    if (!board[this._pos + 1]) {
      if (board[this._pos + 12] != WALL) res.add(this._pos + 12);
      if (board[this._pos - 8] != WALL) res.add(this._pos - 8);
    }
    if (!board[this._pos - 1]) {
      if (board[this._pos - 12] != WALL) res.add(this._pos - 12);
      if (board[this._pos + 8] != WALL) res.add(this._pos + 8);
    }
    if (!board[this._pos - 10]) {
      if (board[this._pos - 21] != WALL) res.add(this._pos - 21);
      if (board[this._pos - 19] != WALL) res.add(this._pos - 19);
    }
    if (!board[this._pos + 10]) {
      if (board[this._pos + 21] != WALL) res.add(this._pos + 21);
      if (board[this._pos + 19] != WALL) res.add(this._pos + 19);
    }
  }
  ChessMan.prototype.__xiangmove = function(res, board) {
    var y = (this._pos + 3) >> 3;
    if (!board[this._pos + 11] && y != 7) res.add(this._pos + 22);
    if (!board[this._pos - 11] && y != 8) res.add(this._pos - 22);
    if (!board[this._pos + 9] && y != 7) res.add(this._pos + 18);
    if (!board[this._pos - 9] && y != 8) res.add(this._pos - 18);
  }
  ChessMan.prototype.__shimove = function(res, board) {
    var x = this._pos % 10;
    if (x == 5) {
      res.add(this._pos + 11).add(this._pos + 9);
      res.add(this._pos - 11).add(this._pos - 9);
    } else {
      res.add(this._isRed() ? 95 : 25);
    }
  }
  ChessMan.prototype.__jiangmove = function(res, board) {
    var x = this._pos % 10;
    if (x < 6) res.add(this._pos + 1);
    if (x > 4) res.add(this._pos - 1);
    if (this._pos > 20) res.add(this._pos - 10);
    if (this._pos < 30) res.add(this._pos + 10);
    for (x = this._pos + 10; x < 110 && board[x] == 0; x += 10);
    if (board[x] == 0x22) res.add(x);
  }
  ChessMan.prototype.__shuaimove = function(res, board) {
    var x = this._pos % 10;
    if (x < 6) res.add(this._pos + 1);
    if (x > 4) res.add(this._pos - 1);
    if (this._pos > 90) res.add(this._pos - 10);
    if (this._pos < 99) res.add(this._pos + 10);
    for (x = this._pos - 10; x > 10 && board[x] == 0; x -= 10);
    if (board[x] == 0x02) res.add(x);
  }
  ChessMan.prototype.__paomove = function(res, board) {
    var i, cn;
    for (cn = 0, i = this._pos + 1; cn < 2 && board[i] != WALL; i++) {
      if (board[i]) cn++;
      if (!(cn & 1)) res.add(i);
    }
    for (cn = 0, i = this._pos - 1; cn < 2 && board[i] != WALL; i--) {
      if (board[i]) cn++;
      if (!(cn & 1)) res.add(i);
    }
    for (cn = 0, i = this._pos + 10; cn < 2 && board[i] != WALL; i +=
      10) {
      if (board[i]) cn++;
      if (!(cn & 1)) res.add(i);
    }
    for (cn = 0, i = this._pos - 10; cn < 2 && board[i] != WALL; i -=
      10) {
      if (board[i]) cn++;
      if (!(cn & 1)) res.add(i);
    }
  }
  ChessMan.prototype.__paocontrol = function(res, board) {
    var i, cn;
    for (cn = 0, i = this._pos + 1; cn < 2 && board[i] != WALL; i++) {
      if (cn == 1) res.add(i);
      if (board[i]) cn++;
    }
    for (cn = 0, i = this._pos - 1; cn < 2 && board[i] != WALL; i--) {
      if (cn == 1) res.add(i);
      if (board[i]) cn++;
    }
    for (cn = 0, i = this._pos + 10; cn < 2 && board[i] != WALL; i +=
      10) {
      if (cn == 1) res.add(i);
      if (board[i]) cn++;
    }
    for (cn = 0, i = this._pos - 10; cn < 2 && board[i] != WALL; i -=
      10) {
      if (cn == 1) res.add(i);
      if (board[i]) cn++;
    }
  }
  ChessMan.prototype.__jumove = function(res, board) {
    var i;
    for (i = this._pos + 1; !board[i]; i++) res.add(i);
    if (board[i] != WALL) res.add(i);
    for (i = this._pos - 1; !board[i]; i--) res.add(i);
    if (board[i] != WALL) res.add(i);
    for (i = this._pos + 10; !board[i]; i += 10) res.add(i);
    if (board[i] != WALL) res.add(i);
    for (i = this._pos - 10; !board[i]; i -= 10) res.add(i);
    if (board[i] != WALL) res.add(i);
  }


  function Board() {
    this._clear();
    this._arrange();
  }

  Board.prototype._clear = function() {
    this._map = new Uint8Array(120);
    this._set_wall();
    this._mps = {};
    this._history = [];
    this._captive = new c2g.LinkList();
    this._blackchm = new c2g.LinkList();
    this._redchm = new c2g.LinkList();
  }
  Board.prototype._arrange = function() {
    var arr = [0x02, 15, 0x04, 14, 0x05, 16, 0x06, 13, //
      0x07, 17, 0x08, 12, 0x09, 18, 0x0a, 11, 0x0b, 19, //
      0x0c, 32, 0x0d, 38, //
      0x10, 41, 0x11, 43, 0x12, 45, 0x13, 47, 0x14, 49,
      //
      0x30, 71, 0x31, 73, 0x32, 75, 0x33, 77, 0x34, 79,
      0x2c, 82, 0x2d, 88, //
      0x27, 107, 0x28, 102, 0x29, 108, 0x2a, 101, 0x2b, 109, //
      0x22, 105, 0x24, 104, 0x25, 106, 0x26, 103 //
    ];
    for (var i = 0; i < arr.length; i += 2)
      this._loc(arr[i], arr[i + 1]);
  }
  Board.prototype._loc = function(id, pos) {
    this._map[pos] = id;
    var ch = this._mps[id] = new ChessMan(id, pos);
    (ch._isRed() ? this._redchm : this._blackchm).push(ch);
  }
  Board.prototype._general = function(isred) {
    return this._mps[isred ? 0x22 : 0x02];
  }

  Board.prototype._queryAvailable = function(side) {
    var seq = side ? this._redchm : this._blackchm;
    var avai = new Map();
    var cover = new Set();
    var control = new Set();
    var rooted = new Set();
    var attack = new Set();
    var base = this._map,
      pits = this._mps;

    var availCnt = 0;
    for (var chm = seq._next; chm != seq; chm = chm._next) {
      var res = chm._genmove(this._map);
      if (res && res.size) {
        avai[chm._pos] = res;
        res.forEach(function(x) {
          cover.add(x);
          if (base[x]) {
            if (chm._samesideid(base[x])) {
              rooted.add(x);
            } else {
              attack.add(x);
            }
          }
        });
        rooted.forEach(function(x) {
          res.delete(x);
        });
        availCnt += rooted.size;
      }
    }

    return new Coverage(availCnt, avai, cover, rooted, attack);
  }

  Board.prototype._move = function(mid, dst) {
    var did = this._map[dst];
    var chm = this._mps[mid],
      dchm = this._mps[did];
    var helem = [mid, chm._pos, dst, dchm];
    if (dchm) {
      dchm.pick();
      this._captive.push(dchm);
      dchm._pos = 0;
    }
    this._history.push(helem);
    this._map[chm._pos] = 0;
    this._map[dst] = chm._id;
    chm._pos = dst;
  }

  Board.prototype._unmove = function() {
    var mov = this._history.pop();
    var chm = this._mps[mov[0]];
    this._map[chm._pos = mov[1]] = mov[0];

    if (mov[3]) {
      var dchm = mov[3];
      dchm.pick();
      this._map[dchm._pos = mov[2]] = dchm._id;
      (dchm._isRed() ? this._redchm : this._blackchm).push(dchm);
    } else {
      this._map[mov[2]] = 0;
    }
  }

  Board.prototype.isOver = function() {
    return this._general(0x02)._pos == 0 || this._general(0x22)._pos ==
      0;
  }

  Board.prototype._set_wall = function() {
    for (var i = 0; i < 10; i++) {
      this._map[i] = this._map[i + 110] =
        this._map[(i + 1) * 10] = WALL;
    }
  }

  function Coverage(num, moves, cover, roots, attacks) {
    this._availCount = num;
    this._allowMoves = moves;
    this._coverPots = cover;
    this._rootedPots = roots;
    this._attackPots = attacks;
  }

  function Evaluate(base, current) {
    var cov1 = base._queryAvailable(current);
    var cov2 = base._queryAvailable(!current);
    var rivalEnemy = current ? 0x22 : 0x02;
    var rjs = base._mps[rivalEnemy],
      zjs = base._mps[rivalEnemy ^ 0x20];
    if (cov1._availCount == 0) return -Infinity;
    if (cov1._attackPots.has(rjs._pos)) return Infinity;
    if (cov2._attackPots.has(zjs._pos)) return -Infinity;

    var score = 0;
    score += staticChm(base._redchm) - staticChm(base._blackchm);
    score += (cov1._coverPots.size - cov2._coverPots.size) * 10;
    score += (cov1._rootedPots.size - cov2._rootedPots.size) * 5;
    score += (cov1._attackPots.size - cov2._attackPots.size) * 5;
    //score += (cov1._availCount - cov2._availCount) * 8;

    return score;
  }

  function staticChm(arr) {
    var staticScores = [0, 19999, 200, 200, 500, 1000, 550, 100];
    var score = 0;
    var meta = [],
      x, y, k;
    for (var chm = arr._next; chm != arr._next; chm = chm._next) {
      k = chm._kind();
      score += staticScores[k];
      switch (k) {
        case 2:
        case 3:
          meta[k] = meta[k] ? 1 : 2;
          break;
        case 7:
          if (chm._isRed() && chm._pos < 60) {
            x = (chm._pos % 10) - 5;
            x = 16 - x * x;
            score += x * 3;
            y = 1 - parseInt(chm._pos / 10);
            y = 17 - y * y
            score += y * 2;
          }
          if (!chm._isRed() && chm._pos > 60) {
            x = (chm._pos % 10) - 5;
            x = 16 - x * x;
            score += x * 3;
            y = 9 - parseInt(chm._pos / 10);
            y = 17 - y * y
            score += y * 2;
          }
          break;
      }
    }
    if (meta[2] == 2) score += 550;
    if (meta[3] == 2) score += 450;
    return score;
  }

  function AISearch(base, turn, depth) {
    var avaiables = base._queryAvailable(turn);
    var bestMove, val, bestScore = -Infinity;
    for (var ch in avaiables._allowMoves) {
      ch = parseInt(ch);
      var chm = base._map[ch];
      var mvs = avaiables._allowMoves[ch];
      for (var pt of mvs) {
        base._move(chm, pt);
        val = -AlphaBetaSearch(base, !turn, depth, 1000000, -1000000);
        base._unmove();
        if (val > bestScore) {
          bestScore = val;
          bestMove = [chm, pt, val]
        }
      }
    }

    return bestMove;
  }

  function AlphaBetaSearch(base, turn, depth, mxv, mnv) {
    if (!base._general(turn)._pos)
      return -Infinity;
    if (!base._general(!turn)._pos)
      return Infinity;
    if (depth <= 0) {
      return Evaluate(base, turn);
    }

    var avaiables = base._queryAvailable(turn);
    for (var ch in avaiables._allowMoves) {
      ch = parseInt(ch);
      var chm = base._map[ch];
      var mvs = avaiables._allowMoves[ch];
      for (var pt of mvs) {
        base._move(chm, pt);
        var val = -AlphaBetaSearch(base, !turn, depth - 1, -mnv, -mxv);
        base._unmove();
        if (val >= mnv) {
          if (val == mnv) {

            mnv = val;
          } else mnv = val;
        }

        if (val >= mxv) return mnv;
      }
    }
    return mnv;
  }
})();
