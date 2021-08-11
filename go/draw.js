(function() {
  var exports = window || {};
  var TwoPI = Math.PI * 2;
  var LEN = 19;
  var LLEN;
  var scale = 50;

  function GoGame() {
    LLEN = LEN + 1;
    this.board = null;
    this._turn = 1;

    this.init();
  }
  exports.GoGame = GoGame;

  GoGame.prototype.init = function() {
    this.bottom = LLEN * LLEN;
    this.board = new Uint8Array(LLEN + this.bottom);
    this._block = new Int16Array(LLEN + this.bottom);
    for (var i = 0; i <= LEN; ++i) {
      this.board[i] = this.board[this.bottom + i] = 0xff;
      this.board[(i + 1) * LLEN] = 0xff;
    }
    console.log(this.board);
  }

  GoGame.prototype.drawGoes = function(ui) {
    for (var i = LLEN; i < this.bottom; i++) {
      if (!this.board[i]) continue;
      var pos = d(i);
      if (pos[0] > 0 && pos[1] > 0 && pos[0] <= LEN) {
        ui.drawGo(pos[0], pos[1], this.board[i]);
      }
    }
  }

  GoGame.prototype.setGo = function(x, y, c) {
    if (0 < c && c < 3 && x > 0 && x <= LEN && y > 0 && y <= LEN) {
      var info = this.checkGo(x, y, c);
      if (info) {
        this.board[info.base] = c;
        this._block[info.base] = info.blkid;
        info.tid.forEach(
          x => this.board[x] = 0
        );

        return true;
      }
    }
    return false;
  }

  GoGame.prototype.putGo = function(x, y) {
    if (this.setGo(x, y, this._turn)) {
      return this.putVoid();
    }
    return false;
  }

  GoGame.prototype.putVoid = function() {
    this._turn = 3 - this._turn;
    return true;
  }


  GoGame.prototype._searchBlock = function(i, iqi, ivi) {
    var c = this.board[i];
    if (c == 0 || c > 2) return;

    var visited = ivi || new Set();
    var qi = iqi || new Set();
    var queue = [i];
    var brd = this.board;

    function visit(ii) {
      if (brd[ii] == c) {
        if (!visited.has(ii))
          queue.push(ii);
      } else if (brd[ii] == 0) {
        qi.add(ii);
      }
    }

    while (queue.length) {
      i = queue.pop();
      visited.add(i);

      visit(i + LLEN);
      visit(i - LLEN);
      visit(i + 1);
      visit(i - 1);
    }

    return [visited, qi];
  }

  GoGame.prototype.checkGo = function(x, y, c) {
    var i = dd(x, y);
    if (this.board[i]) return false;
    var info = {
      base: i,
      qis: new Set(), // My qi
      tid: new Set(),
      neib: new Set(),
    };

    this._qimuCheck(i - LLEN, c, info);
    this._qimuCheck(i + LLEN, c, info);
    this._qimuCheck(i - 1, c, info);
    this._qimuCheck(i + 1, c, info);

    if (info.qis.size > 1 || info.tid.size > 1) {
      return info;
    } else if (info.qis.size == 1) {
      if (info.qis.has(i)) {
        // drown
        if (info.tid.size > 0 && info.neib.size > 0) {
          return info;
        }
      } else {
        return info;
      }

    } else if (info.tid.size == 1) {
      if (info.neib.size > 0) {
        return info;
      }
      // TODO(): 打劫
      return info;
    }

    return false;
  }

  GoGame.prototype._qimuCheck = function(i, c, info) {
    if (this.board[i] > 2) {
      // it's a wall
    } else if (this.board[i] == 0) {
      info.qis.add(i);
    } else {
      if (this.board[i] == c) {
        this._searchBlock(i, info.qis);
        info.neib.add(i);
      } else {
        var pars = this._searchBlock(i);
        if (pars) {
          if (pars[1].size == 1) {
            if (pars[1].has(info.base)) {
              pars[0].forEach(x => info.tid.add(x));
            } else {
              console.error("qimucheck: ", i, c);
            }
          }
        } else {
          console.error("qimucheck: ", i, c);
        }
      }
    }
  }

  GoGame.prototype.remove = function(x, y) {
    if (x > 0 && x < LLEN && y > 0 && y < LLEN)
      this.board[dd(x, y)] = 0;
  }

  function d(i) {
    return [parseInt(i / LLEN), i % LLEN];
  }

  function dd(x, y) {
    return x * LLEN + y;
  }

  function setUp(canvas) {
    game = new GoGame();
    var layout = getParam("layout")
    if (layout) {
      fill(game, parse(layout));
    }

    //fill(game, parse("EGFiY2RlTVI6JywtExUaAgcLT1BROz4oFBYYGQY="));
    //fill(game, parse("BycoKSoUGAQMYU1PUSssLRUWFwEC"));

    ui = new GameUI(canvas, game);
    ui.refresh();

  }
  exports.setUp = setUp;

  function fill(game, array) {
    for (var c = 1; c < 3; c++) {
      for (var n = array.shift(); n > 0; n--) {
        var pos = array.shift();
        var x = pos % 19,
          y = parseInt(pos / 19);
        game.setGo(x + 1, y + 1, c);
      }
    }

    return;
  }

  function parse(b64) {
    var bytes = atob(b64);
    var array = [];

    for (var i = 0; i < bytes.length; ++i) {
      array.push(bytes.charCodeAt(i));
    }
    return array;
  }

  function GameUI(canvas, game) {
    this.ctx = canvas.getContext('2d');
    this._game = game;
    this.play = true;

    this.side = 1;

    var me = this;
    canvas.addEventListener("mousedown", function(e) {
      var pos = me.screenToBoard(e.offsetX, e.offsetY);
      if (me.play) {
        if (me._game.putGo(...pos)) {
          me.refresh();
        }

      } else {
        if (me.side) {
          if (me._game.setGo(...pos, me.side)) {
            me.refresh();
          }
        } else {
          me._game.remove(...pos);
          me.refresh();
        }
      }
    });

    document.addEventListener("keypress", function(e) {
      switch (e.code) {
        case 'KeyP':
          me.play = true;
          break;
        case 'KeyE':
          me.side = 0;
          break;
        case 'KeyK':
          if (me.side)
            me.side = 3 - me.side;
          else me.side = 1;
          break;
        case 'KeyS':
          console.log(me._game.board);
          break;
      }
    });
  }

  GameUI.prototype.drawBoardGrid = function() {
    var hn = parseInt(LEN / 2);
    var hr = LEN > 13 ? hn - 3 : hn - 2;

    this.ctx.scale(scale, scale);
    this.ctx.translate(hn + 1, hn + 1);
    this.ctx.lineWidth = 0.05;

    this.ctx.strokeStyle = "black";
    this.ctx.beginPath();
    for (var i = -hn; i <= hn; ++i) {
      this.ctx.moveTo(i, -hn);
      this.ctx.lineTo(i, hn);
      this.ctx.moveTo(-hn, i);
      this.ctx.lineTo(hn, i);
    }
    this.ctx.stroke();
    this.ctx.closePath();

    var r = 0.15;
    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        this.ctx.moveTo(i * hr, j * hr);
        this.ctx.arc(i * hr, j * hr, r, 0, TwoPI);
      }
    }
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.translate(-hn - 1, -hn - 1);
  }

  GameUI.prototype.drawGo = function(x, y, c) {
    var r = 0.45;
    var gr = 0.35;

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 0.02;
    if (c == 1) {
      var grad = this.ctx.createRadialGradient(x - gr, y - gr, 0.3, x -
        gr,
        y -
        gr,
        0.35);

      grad.addColorStop(0, "#ccc");
      grad.addColorStop(1, "black");
      this.ctx.fillStyle = grad;
    } else {
      var grad = this.ctx.createRadialGradient(x - gr, y - gr, 0.3, x -
        gr,
        y -
        gr,
        0.35);

      grad.addColorStop(0, "white");
      grad.addColorStop(1, "#d0ccd0");
      this.ctx.fillStyle = grad;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arc(x, y, r, 0, TwoPI);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  GameUI.prototype.refresh = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "orange";
    this.ctx.fillRect(0, 0, 1000, 1000);
    this.drawBoardGrid();
    this._game.drawGoes(this);

    this.drawGo(1, LLEN, this._game._turn);
  }

  GameUI.prototype.screenToBoard = function(x, y) {
    return [parseInt(x / scale + 0.5), parseInt(y / scale + 0.5)];
  }



})();
