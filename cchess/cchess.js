(function() {
  var exports = window || {};
  var M2PI = Math.PI * 2;
  var CX = 9,
    CY = 10;
  var WALL = 0xff;
  var ChessMarkTexts = [[, "將", "士", "象", "馬", "車", "炮", "卒", ],
   [, "帥", "仕", "相", "馬", "車", "炮", "兵", ]];
  var ChineseNumber = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

  var GameUI = c2g.GameUI;
  var WINSCORE = 3e+12;
  var audio = new Audio("../WAVE_SOUND.mp3");

  GameUI.prototype.gameStart = function() {
    var bcode, st = c2g.queryArgs.st;
    if (st && qipu) {
      this.qipu = qipu[st - 1];
      this.qipuIdx = 0;
      bcode = this.qipu[1];
      var title = document.getElementById("title");
      if (title) title.innerHTML = this.qipu[0];
      console.log(this.qipu);
    }
    this.openingWalker = new OpeningWalker();
    this.base = new Board(bcode);
    this.stepnum = -1;
    this._upperTurn = this._onBlack;
    this.update();
  }
  GameUI.prototype.gameClear = function() {
    alert("Game over");
  }
  GameUI.prototype.finishAnimate = function() {
    alert("Game over");
  }
  GameUI.prototype.flip = function() {
    this.stepnum--;
    this.base._flip();
    if (this.qipu) {
      this.qipu[2] = this.qipu[2].map(function(a) { return a.map(flip); });
    }
    this.update();
  }
  GameUI.prototype.initImpl = function() {
    this.stepbar = document.getElementById("step");
    this._upperTurn = true;
    this.stepnum = 0;
    this._noHint = true;
    this._onBlack = false;
  }
  GameUI.prototype.putSpriteImpl = function(e) {
    if (!this.spotted) return;
    var pt = this.pointToPot(e);
    var brd = this.base;
    var chm = brd._mps[this.spotted];
    if (chm != null) {
      var allows = this._coverage._allowMoves[chm._pos];
      if (allows && allows.has(pt)) {
        this.base._move(this.spotted, pt); // Add pu
        this.openingWalker.focus(this.base.currentMove());
        this.spotted = null;
        this.update();
        console.log(this.base._history[this.base._history.length - 1]
          .explain(this.base));
      } else {
        this.base._map[chm._pos] = chm._id;
        this.spotted = null;
        this.refresh();
      }
    }
  }

  GameUI.prototype.pickSpriteImpl = function(mid) {
    var brd = this.base;
    var chm = brd._mps[mid];
    if (chm != null && (this._upperTurn == chm._isUpper())) {
      brd._map[chm._pos] = 0;

    } else {
      this.spotted = null;
    }
  }

  GameUI.prototype.updateImpl = function() {
    this.stepnum++;
    this.stepbar.innerHTML = "已行动:" + this.stepnum + "步";
    this._upperTurn = !this._upperTurn;
    this._coverage = this.base._queryAvailable(this._upperTurn);
    this._rivalCoverage = this.base._queryAvailable(!this._upperTurn);
    if (this.stepnum) audio.play();

    console.log(Evaluate(this.base, this._upperTurn));
    if (!this._coverage._availCount) {
      this.refresh();
      alert("Game Over");
      return;
    }

    if (!this._upperTurn) { // AI move
      c2g.DoEventsRun(this, this.autoAct);
    }
  }

  GameUI.prototype.autoAct = function() {
    if (this.actAsPu()) {
      return;
    }

    var mov = this.openingWalker.get(this.base);
    if (mov) {
      console.log(mov);
      this.base._map[mov._src] = 0;
      this.animate = new c2g.Animate(this, mov._id, {
        pos: mov._src,
        dst: mov._dst
      });
      this.openingWalker.focus(mov);
      return;
    }

    // Because of the capablity of the web browser, the search
    // depth is limited not greater than 2.
    var move = AISearch(this.base, this._upperTurn, 2);
    if (move) {
      var chm = this.base._mps[move[0]];
      console.log(move, chm._pos);
      this.base._map[chm._pos] = 0;
      this.animate = new c2g.Animate(this, move[0], {
        pos: chm._pos,
        dst: move[1]
      });
    } else {
      alert("困毙");
    }
  }
  GameUI.prototype.actAsPu = function() {
    if (this.qipu && this.qipuIdx < this.qipu[2].length) {
      if (this.stepnum == this.qipuIdx + 1 && this.base.currentMove()
        .match(this.qipu[2][this.qipuIdx])) {
        if (++this.qipuIdx == this.qipu[2].length) {
          alert("目标达成：" + this.qipu[3]);
          return true;
        }
      } else if (this.stepnum != this.qipuIdx) {
        return false;
      }

      var move = this.qipu[2][this.qipuIdx++];
      var mid = this.base._map[move[0]];
      console.log("good");
      this.base._map[move[0]] = 0;
      this.animate = new c2g.Animate(this, mid, {
        pos: move[0],
        dst: move[1]
      });
      if (this.qipuIdx == this.qipu[2].length) {
        alert("目标达成：" + this.qipu[3]);
      }
      return true;
    }
    return false;
  }

  GameUI.prototype.regret = function() {
    var base = this.base;
    if (base._history.length > 1) {
      base._unmove();
      base._unmove();
      if (this.qipu && this.qipuIdx == this.stepnum) {
        this.qipuIdx -= 2;
      }
      this.stepnum -= 3;
      this._upperTurn = !this._upperTurn;
      this.update();
    } else {
      alert("");
    }
  }
  GameUI.prototype.dragSpriteImpl = function() {}

  GameUI.prototype.refreshImpl = function() {
    this.drawBoard();
    this.drawChessmen();
    this.drawHintRoot();
    this.drawSpotted();
  }
  GameUI.prototype.drawSpotted = function() {
    if (this.spotted) {
      var chm = this.base._mps[this.spotted];
      var mvs = this._coverage._allowMoves[chm._pos];
      if (mvs && mvs.size) {
        var olw = this.ctx.lineWidth;
        this.ctx.lineWidth = this._noHint ? 0.05 : 0.1;
        this.ctx.strokeStyle = "#0f0";
        this.ctx.beginPath();
        for (var p of mvs) {
          var x = p % 10 - 1,
            y = parseInt(p / 10) - 1;
          this.ctx.moveTo(x + 0.3, y);
          this.ctx.ellipse(x, y, 0.3, 0.3, 0, 0, M2PI);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.lineWidth = olw;
      }

      var pt = this.spottedPos;
      if (pt) this.drawChessman(pt[0], pt[1], chm);
    }
  }
  GameUI.prototype.drawHintRoot = function() {
    if (this._noHint) return;
    var ctx = this.ctx;
    var lw = this.ctx.lineWidth;
    var ss = this.ctx.strokeStyle;
    var base = this.base;

    function drawbar(ma) {
      var r = 0.2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ma);
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arc(0, 0, r, 0, Math.PI / 4);
      ctx.moveTo(-r, 0);
      ctx.arc(0, 0, r, -Math.PI, -3 * Math.PI / 4);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    for (var p = 11; p < 110; p++) {
      if (base._map[p] == WALL) continue;
      var x = p % 10 - 1,
        y = parseInt(p / 10) - 1;
      var cover, threat;
      var chi = base._map[p];
      if (chi == 0) {
        ctx.lineWidth = 0.25;
        cover = this._coverage._coverPots.has(p);
        threat = this._rivalCoverage._coverPots.has(p);
        var ma = Math.PI / 8;
        if (cover) {
          ctx.strokeStyle = "#00ff00";
          drawbar(ma);
        }
        if (threat) {
          ctx.strokeStyle = "#ff0000";
          drawbar(ma + Math.PI / 2);
        }
      } else {
        ctx.lineWidth = 0.025;
        if ((chi > 32) == this._upperTurn) { //TODO
          cover = this._coverage._rootedPots.has(p),
            threat = this._rivalCoverage._attackPots.has(p);
        } else {
          cover = this._rivalCoverage._rootedPots.has(p),
            threat = this._coverage._attackPots.has(p);
        }
        var r = 0.5;
        if (cover && threat) {
          ctx.strokeStyle = "green";
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI);
          ctx.stroke();
          ctx.closePath();

          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.arc(x, y, r, Math.PI, M2PI);
          ctx.stroke();
          ctx.closePath();
        } else if (cover || threat) {
          ctx.strokeStyle = cover ? "green" : "red";
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.ellipse(x, y, r, r, 0, 0, M2PI);
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
    this.ctx.strokeStyle = "black";
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

    // Pao pot
    this.drawStar(1, 2);
    this.drawStar(1, 7);
    this.drawStar(7, 2);
    this.drawStar(7, 7);
    // Bing pot
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

    var showRed = chm._isUpper() ^ this._onBlack;
    var txt = ChessMarkTexts[showRed ? 1 : 0][chm._kind()];
    this.ctx.fillStyle = "#fff";
    this.ctx.fillText(txt, pos.x + 0.8, pos.y + 0.8);

    this.ctx.fillStyle = showRed ? "#f00" : "#000";
    this.ctx.fillText(txt, pos.x, pos.y);
    this.ctx.restore();
  }

  GameUI.prototype.drawChessmen = function() {
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
    g_ui.gameStart();
  }

  exports['setUp'] = setUp;
  exports['onCheck'] = function(v) {
    g_ui._noHint = !v.checked;
    g_ui.refresh();
  };
  exports['onBlack'] = function(v) {
    g_ui._onBlack = !v.checked;
    g_ui.flip();
    //g_ui.stepnum--;
    //g_ui._upperTurn = !g_ui._upperTurn;
    //g_ui.base._flip();
    //g_ui.update();
  };
  exports['reload'] = function(st) {};
  exports['restart'] = function(
    st) { g_ui.gameStart(); };
  exports['next'] = function() {};
  exports['prev'] =
    function() { g_ui.regret(); };
  exports['autoAct'] =
    function() {
      if (!g_ui.spotted)
        g_ui.autoAct();
    };
  exports['answer'] = function() {}

  function ChessMan(id, pos) {
    this._pos = pos;
    this._id = id;
  }
  ChessMan.prototype._kind = function() {
    return this._id & 16 ? 7 : (this._id & 0xf) >> 1;
  }
  ChessMan.prototype._isUpper = function() {
    return this._id > 32;
  }
  ChessMan.prototype._sameside = function(chm) {
    return this._samesideid(chm._id);
  }
  ChessMan.prototype._samesideid = function(chmid) {
    return ((this._id ^ chmid) & 0x20) == 0;
  }
  ChessMan.prototype.SameSideId = function(a, b) {
    return ((a ^ b) & 0x20) == 0;
  }
  ChessMan.prototype._genmove = function(board) {
    var res = new Set();
    switch (this._kind()) {
      case 1:
        if (this._isUpper()) {
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
        if (this._isUpper()) {
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
      res.add(this._isUpper() ? 95 : 25);
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


  function flip(i) { return 10 * (12 - parseInt(i / 10)) - (i % 10); }

  function flipX(i) { return i + 10 - 2 * (i % 10); }

  function Board(bcode) {
    this._clear();
    this._arrange(bcode);
  }
  Board.prototype._clear = function() {
    this._map = new Uint8Array(121);
    this._set_wall();
    this._mps = {};
    this._history = [];
    this._lowerchm = [];
    this._upperchm = [];
  }
  Board.prototype.startArrange = [
      // lower side
      0x02, 15, 0x04, 14, 0x05, 16, 0x06, 13, //
      0x07, 17, 0x08, 12, 0x09, 18, 0x0a, 11, 0x0b, 19, //
      0x0c, 32, 0x0d, 38, //
      0x10, 41, 0x11, 43, 0x12, 45, 0x13, 47, 0x14, 49,
      // upper side
      0x30, 71, 0x31, 73, 0x32, 75, 0x33, 77, 0x34, 79,
      0x2c, 82, 0x2d, 88, //
      0x27, 107, 0x28, 102, 0x29, 108, 0x2a, 101, 0x2b, 109, //
      0x22, 105, 0x24, 104, 0x25, 106, 0x26, 103 //
    ];
  Board.prototype._arrange = function(iarr) {
    var arr = iarr || this.startArrange;
    for (var i = 0; i < arr.length; i += 2)
      this._loc(arr[i], arr[i + 1]);
  }
  Board.prototype._flip = function() {
    var res = [];
    for (var i = 11; i < 110; i++) {
      if (this._map[i] == WALL || !this._map[i]) continue;
      res.push(this._map[i] ^ 0x20);
      res.push(flip(i));
    }
    this._clear();
    this._arrange(res);
  }
  Board.prototype._loc = function(id, pos) {
    this._map[pos] = id;
    var ch = this._mps[id] = new ChessMan(id, pos);
    (ch._isUpper() ? this._upperchm : this._lowerchm).push(ch);
  }
  Board.prototype._general = function(isred) {
    return this._mps[isred ? 0x22 : 0x02];
  }

  Board.prototype._ischeck = function(isUpperSide) {
    var gpos = this._mps[isUpperSide ? 0x02 : 0x22]._pos;
    if (!gpos) return true;

    {
      var ma;
      if (this._map[gpos + 11] == 0) {
        if ((ma = this._map[gpos + 21]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
        if ((ma = this._map[gpos + 12]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
      }
      if (this._map[gpos - 11] == 0) {
        if ((ma = this._map[gpos - 21]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
        if ((ma = this._map[gpos - 12]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
      }

      if (this._map[gpos + 9] == 0) {
        if ((ma = this._map[gpos + 19]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
        if ((ma = this._map[gpos + 8]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
      }

      if (this._map[gpos - 9] == 0) {
        if ((ma = this._map[gpos - 19]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
        if ((ma = this._map[gpos - 8]) && ma != WALL) {
          ma = this._mps[ma];
          if (ma._isUpper() == isUpperSide && ma._kind() === 4) {
            return true;
          }
        }
      }
    }

    for (var i = 1, p = gpos + 1, cnt = 0; cnt < 2; i++) {
      var ch = this._map[p++];
      if (!ch) continue;
      if (ch == WALL) break;
      cnt++;
      var chm = this._mps[ch];
      if (chm._isUpper() ^ isUpperSide) continue;
      var kind = chm._kind();
      if ((kind === 5 && cnt === 1) || (kind === 6 && cnt === 2) || (
          kind === 7 && i === 1)) return true;
    }

    for (var i = 1, p = gpos - 1, cnt = 0; cnt < 2; i++) {
      var ch = this._map[p--];
      if (!ch) continue;
      if (ch == WALL) break;
      cnt++;
      var chm = this._mps[ch];
      if (chm._isUpper() ^ isUpperSide) continue;
      var kind = chm._kind();
      if ((kind === 5 && cnt === 1) || (kind === 6 && cnt === 2) || (
          kind === 7 && i === 1)) return true;
    }

    for (var i = 1, p = gpos - 10, cnt = 0; cnt < 2; i++, p -= 10) {
      var ch = this._map[p];
      if (!ch) continue;
      if (ch == WALL) break;
      cnt++;
      var chm = this._mps[ch];
      if (chm._isUpper() ^ isUpperSide) continue;
      var kind = chm._kind();
      if (((kind === 5 || kind === 1) && cnt === 1) ||
        (kind === 6 && cnt === 2) ||
        (kind === 7 && i === 1 && !isUpperSide)) return true;
    }

    for (var i = 1, p = gpos + 10, cnt = 0; cnt < 2; i++, p += 10) {
      var ch = this._map[p];
      if (!ch) continue;
      if (ch == WALL) break;
      cnt++;
      var chm = this._mps[ch];
      if (chm._isUpper() ^ isUpperSide) continue;
      var kind = chm._kind();
      if (((kind === 5 || kind === 1) && cnt === 1) ||
        (kind === 6 && cnt === 2) ||
        (kind === 7 && i === 1 && isUpperSide)) return true;
    }

    return false;
  }
  Board.prototype._queryAvailable = function(isUpperSide) {
    var seq = isUpperSide ? this._upperchm : this._lowerchm;
    var avai = new Map();
    var availCnt = 0;
    var cover = new Set();
    var control = new Set();
    var rooted = new Set();
    var attack = new Set();
    var base = this._map,
      pits = this._mps;

    for (var chm, i = 0; chm = seq[i]; i++) {
      if (!chm._pos) continue;
      var res = chm._genmove(this._map);
      if (!res || !res.size) continue;

      var rres = new Set();
      for (var x of res) {
        this._move(chm._id, x);
        var checked = this._ischeck(!isUpperSide);
        this._unmove();
        if (checked) continue;

        if (6 !== chm._kind()) cover.add(x);
        if (base[x]) {
          if (ChessMan.prototype.SameSideId(chm._id, base[x])) {
            rooted.add(x);
          } else {
            attack.add(x);
            rres.add(x);
          }
        } else rres.add(x);
      }

      // It's the pao(canon)
      if (6 === chm._kind()) {
        res.clear();
        chm.__paocontrol(res, this._map);
        if (res.size) {
          for (var x of res) {
            this._move(chm._id, x);
            var checked = this._ischeck(!isUpperSide);
            this._unmove();
            if (checked) continue;

            cover.add(x);
          }
        }
      }

      if (rres.size) {
        availCnt += rres.size;
        avai[chm._pos] = rres;
      }
    }
    return new Coverage(availCnt, avai, cover, rooted, attack);
  }

  Board.prototype._newmove = function(src, dst, mid) {
    var did = this._map[dst];
    if (!mid) mid = this._map[src];
    var chm = this._mps[mid],
      dchm = this._mps[did];
    return new Move(chm, dst, dchm);
  }
  Board.prototype._move = function(mid, dst) {
    var did = this._map[dst];
    var chm = this._mps[mid],
      dchm = this._mps[did];
    var helem = new Move(chm, dst, dchm);
    this._history.push(helem);
    helem.do(this);
  }
  Board.prototype._unmove = function() {
    var mov = this._history.pop();
    mov.undo(this);
  }
  Board.prototype.currentMove = function() {
    if (this._history.length > 0) {
      return this._history[this._history.length - 1]
    }
    return null;
  }
  Board.prototype.isOver = function() {
    return this._general(0x02)._pos == 0 || this._general(0x22)._pos == 0;
  }
  Board.prototype._set_wall = function() {
    for (var i = 0; i < 10; i++) {
      this._map[i] = this._map[i + 110] =
        this._map[(i + 1) * 10] = WALL;
    }
    this._map[120] = WALL;
  }

  function Move(chm, dst, dchm) {
    this._chm = chm;
    this._id = chm._id;
    this._src = chm._pos;
    this._dst = dst;
    this._dchm = dchm;
  }
  Move.prototype.match = function(arr) {
    if (this._src == arr[0] && this._dst == arr[1]) return true;
    return false;
  }
  Move.prototype.do = function(base) {
    if (this._dchm) {
      this._dchm._pos = 0;
    }
    base._map[this._src] = 0;
    base._map[this._dst] = this._id;
    this._chm._pos = this._dst;
  }
  Move.prototype.undo = function(base) {
    var chm = base._mps[this._id];
    base._map[this._chm._pos = this._src] = this._id;

    if (this._dchm) {
      base._map[this._dchm._pos = this._dst] = this._dchm._id;
    } else {
      base._map[this._dst] = 0;
    }
  }
  Move.prototype.explain = function(base) {
    var isUpper = this._chm._isUpper();
    var showRed = isUpper ^ g_ui._onBlack;
    var kind = this._chm._kind();
    var ox = this._src % 10;
    var oy = (this._src - ox) / 10;
    var dx = this._dst % 10;
    var dy = (this._dst - dx) / 10;
    var dpos = this._dst - this._src;
    var msg = "";
    var vertDup = false;
    if (kind == 7) {

    } else {
      for (var y = 1, aim = this._id ^ 1, i = 10 + ox; y < 11; i += 10,
        y++) {
        if (base._map[i] == aim) {
          vertDup = true;
          msg += isUpper == (y > oy) ? "前" : "后";
          break;
        }
      }
    }

    msg += ChessMarkTexts[showRed ? 1 : 0][kind];
    if (!vertDup) {
      msg += ChineseNumber[isUpper ? 10 - ox : ox];
    }

    if (dy == oy) {
      msg += "平" + ChineseNumber[isUpper ? 10 - dx : dx];
    } else {
      msg += isUpper == (dy < oy) ? "进" : "退";
      if (ox == dx) {
        msg += ChineseNumber[Math.abs(dy - oy)];
      } else {
        msg += ChineseNumber[isUpper ? 10 - dx : dx];
      }
    }

    return msg;
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
    if (cov1._availCount == 0) return -WINSCORE;
    var rjs = base._general(!current);
    if (cov1._attackPots.has(rjs._pos)) return WINSCORE;
    var cov2 = base._queryAvailable(!current);
    var zjs = base._general(current);
    if (cov2._attackPots.has(zjs._pos)) return -WINSCORE;

    var score = 0;
    score += staticChm(base._upperchm) - staticChm(base._lowerchm);
    score += (cov1._coverPots.size - cov2._coverPots.size) * 2;
    score += (cov1._rootedPots.size - cov2._rootedPots.size) * 2;
    score += (cov1._attackPots.size - cov2._attackPots.size) * 2;
    //score += (cov1._availCount - cov2._availCount) * 8;

    return score;
  }

  function staticChm(arr) {
    var staticScores = [0, 19999, 200, 200, 500, 1000, 550, 100];
    var score = 0;
    var meta = [],
      x, y, k;
    //for (var chm = arr._next; chm != arr._next; chm = chm._next) {
    for (var i = 0, chm; chm = arr[i]; i++) {
      if (!chm._pos) continue;
      k = chm._kind();
      score += staticScores[k];
      switch (k) {
        case 2:
        case 3:
          meta[k] = meta[k] ? 1 : 2;
          break;
        case 7:
          if (chm._isUpper() && chm._pos < 60) {
            x = (chm._pos % 10) - 5;
            x = 16 - x * x;
            score += x * 3;
            y = 1 - parseInt(chm._pos / 10);
            y = 17 - y * y
            score += y * 2;
          }
          if (!chm._isUpper() && chm._pos > 60) {
            x = (chm._pos % 10) - 5;
            x = 16 - x * x;
            score += x * 3;
            y = 9 - parseInt(chm._pos / 10);
            y = 17 - y * y
            score += y * 2;
          }
          break;
        default:
          meta[k] = meta[k] ? 1 : 2;
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
    var alpha = Infinity,
      beta = -alpha;
    for (var ch in avaiables._allowMoves) {
      ch = parseInt(ch);
      var chm = base._map[ch];
      var mvs = avaiables._allowMoves[ch];
      for (var pt of mvs) {
        base._move(chm, pt);
        if (pt == 97 && chm == 13) {
          chm = chm;
        }
        val = -AlphaBetaSearch(base, !turn, depth, alpha, beta);
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
    if (!base._general(turn)._pos) return -WINSCORE - depth;
    if (!base._general(!turn)._pos) return WINSCORE + depth;
    if (depth <= 0) {
      var score = Evaluate(base, turn);
      return score + depth * Math.sign(score);
    }

    var avaiables = base._queryAvailable(turn);
    if (avaiables._availCount == 0) return -WINSCORE - depth;
    if (avaiables._attackPots.has(base._general(!turn)._pos))
      return WINSCORE + depth;
    for (var ch in avaiables._allowMoves) {
      ch = parseInt(ch);
      var chm = base._map[ch];
      var mvs = avaiables._allowMoves[ch];
      for (var pt of mvs) {
        base._move(chm, pt);
        var val = -AlphaBetaSearch(base, !turn, depth - 1, -mnv, -mxv);
        base._unmove();
        if (val >= mxv) return val;
        if (val > mnv) mnv = val;
      }
    }
    return mnv;
  }


  function OpeningWalker() {
    this._step = 0;
    this._start = 0;
    this._end = openningData.length;
    this._isMirror = false;
    this._history = "";
  }
  OpeningWalker.prototype.get = function(base) {
    if (this._start < this._end) {
      var sel = parseInt(this._start + (this._end - this._start) * Math
        .random());

      var cur = openningData[sel];
      var mov = cur.substr(this._step * 2, 2);

      var src = mov.charCodeAt(0);
      var dst = mov.charCodeAt(1);
      if (this._isMirror) {
        src = flipX(src);
        dst = flipX(dst);
      }

      return base._newmove(src, dst);
    }

    return null;
  }
  OpeningWalker.prototype.focus = function(move) {
    if (this._step == 0 && move._src % 10 > 5) {
      this._isMirror = true;
    }
    this._step++;
    if (this._start >= this._end) return false;

    var s;
    if (this._isMirror) {
      s = String.fromCharCode(flipX(move._src)) +
        String.fromCharCode(flipX(move._dst));
    } else {
      s = String.fromCharCode(move._src) +
        String.fromCharCode(move._dst);
    }

    var newhist = this._history + s;
    for (var found = 0, i = this._start; i < this._end; i++) {
      var cur = openningData[i];
      if (cur.length > newhist.length) {
        if (cur.substr(0, newhist.length) == newhist) {
          if (!found) {
            this._start = i;
            found++;
          }
        } else {
          if (found) {
            this._end = i;
            found++;
            break;
          }
        }
      } else {
        if (found) {
          this._end = i;
          found++;
          break;
        }
      }
    }

    if (!found) {
      this._start = this._end;
    }

    console.log(this._start, this._end);
    if (this._start < this._end) {
      this._history = newhist;
      return true;
    }
    return false;
  }


})();
