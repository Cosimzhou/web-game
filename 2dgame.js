(function() {
  var exports = window || {};
  var Kit = {};
  exports['c2g'] = Kit;

  var CX = 9,
    CY = 10;
  var UX = CX + 1,
    UY = CY + 1;
  var encode_pos = function(x, y) {
      return (y + 1) * UX + (x + 1);
    },
    decode_pos = function(pos) {
      return [(pos % UX) - 1, parseInt(pos / UX) - 1];
    };
  Kit['setSize'] = function(x, y) {
    CX = x;
    CY = y;
    UX = CX + 1;
    UY = CY + 1;
  }
  Kit['posFuncs'] = () => [encode_pos, decode_pos];

  function GameUI(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.spotted = null;
    this.spottedPos = null;
    this.pressed = false;
    this.offset = [50, 50];
    this.answer = null;
    this._screenScale = opts.scale || 50;
    this._gridInner = opts.gridInner;
    this._screenWidth = canvas.width;
    this._screenHeight = canvas.height;

    var ui = this;
    canvas.addEventListener("mousedown", function(e) {
      if (ui.animate) return;
      if (ui.base.isOver()) return;
      if (ui.spotted || ui.pressed) return;

      var mid = ui.pointToManID(e);
      if (mid != ui.spotted) {
        ui.spotted = mid;
        ui.spottedPos = ui.pointToFPos(e);
        if (mid != null) {
          ui.pickSpriteImpl(mid);
        }
        ui.refresh();
      }
      ui.pressed = true;
    });
    var mouserelease = function(e) {
      ui.pressed = false;
      ui.putSpriteImpl(e);
    }
    canvas.addEventListener("mouseleave", mouserelease);
    canvas.addEventListener("mouseup", mouserelease);
    canvas.addEventListener("mousemove", function(e) {
      if (ui.pressed && !ui.animate) {
        ui.spottedPos = ui.pointToFPos(e);
        ui.dragSpriteImpl(e);
        ui.refresh();
      }
    });
    this.initImpl();
  }
  Kit['GameUI'] = GameUI;

  GameUI.prototype.initImpl = function() {
    console.log("implement initImpl");
  }
  GameUI.prototype.dragSpriteImpl = function() {
    console.log("implement dragSpriteImpl");
  }
  GameUI.prototype.pickSpriteImpl = function() {
    console.log("implement pickSpriteImpl");
  }
  GameUI.prototype.putSpriteImpl = function() {
    console.log("implement putSpriteImpl");
  }
  GameUI.prototype.updateImpl = function() {
    console.log("implement updateImpl");
  }

  GameUI.prototype.gameClear = function() {
    alert("棒棒哒");
    this.answer = null;
  }

  GameUI.prototype.pointToManID = function(e) {
    var p = this.pointToPos(e);
    var pos = encode_pos(...p);
    return this.base._map[pos];
  }
  GameUI.prototype.pointToPot = function(e) {
    var p = this.pointToPos(e);
    return encode_pos(...p);
  }
  GameUI.prototype.pointToFPos = function(e) {
    var x = (e.offsetX - this.offset[0]) / this._screenScale;
    var y = (e.offsetY - this.offset[1]) / this._screenScale;
    return [x, y];
  }
  GameUI.prototype.pointToPos = function(e) {
    var ex = this._gridInner ? 0 : 0.5;
    return this.pointToFPos(e).map(function(x) {
      return parseInt(x + ex);
    });
  }

  GameUI.prototype.update = function() {
    this.updateImpl();
    this.refresh();
  }
  GameUI.prototype.refresh = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this._screenWidth, this._screenHeight);

    this.ctx.translate(...this.offset);
    this.ctx.scale(this._screenScale, this._screenScale);
    if (typeof this.refreshImpl === 'function') this.refreshImpl();
  }


  function Animate(ui, mid, opts) {
    var pos = opts.pos || ui.base._mps[mid];
    var dst = opts.dst;
    var xy = decode_pos(pos);
    var dxy = decode_pos(dst);

    this.ui = ui;
    this.mid = ui.spotted = mid;
    this.dst = dst;
    this.idx = 0;
    this.num = 5;
    this.sx = xy[0];
    this.sy = xy[1];
    this.dx = dxy[0] - xy[0];
    this.dy = dxy[1] - xy[1];
    this.ansIdx = opts.idx;
    this.spottedPos = xy;

    var anm = this;
    this.interval = setInterval(function() {
      if (++anm.idx > anm.num) {
        clearInterval(anm.interval);
        ui.animate = null;
        ui.spottedPos = null;
        anm.doneFunc();
        if (!ui.animate) ui.spotted = null;
        return;
      }

      ui.spottedPos = [
        anm.sx + anm.dx * (anm.idx / anm.num),
        anm.sy + anm.dy * (anm.idx / anm.num)
      ];

      anm.ui.refresh();
    }, 100);
  }
  Kit['Animate'] = Animate;
  Animate.prototype.doneFunc = function() {
    if (this.ui.base.isOver()) {
      if (typeof this.ui.gameClear === 'function') {
        this.ui.gameClear();
      }
      return;
    }

    this.ui.base._move(this.mid, this.dst);
    this.ui.update();

    if (this.ui.base.isOver()) {
      if (typeof this.ui.finishAnimate === 'function') {
        this.ui.finishAnimate();
      }
    } else if (this.ui.answer && this.ansIdx + 1 < this.ui.answer.length) {
      var next_idx = this.ansIdx + 1;
      var mv = this.ui.answer[next_idx];

      this.ui.spotted = mv[0];
      this.ui.animate = new Animate(this.ui, mv[0], {
        dst: mv[1],
        idx: next_idx
      });
    }
  }

  function LinkList() {
    this._next = this._prev = this;
  }
  Kit['LinkList'] = LinkList;
  Kit['ApplyLinkList'] = function(cls) {
    cls.prototype.push = LinkList.prototype.push;
    cls.prototype.pick = LinkList.prototype.pick;
    cls.prototype.recover = LinkList.prototype.recover;
  }
  LinkList.prototype.push = function(node) {
    node._next = this;
    node._prev = this._prev;
    this._prev._next = node;
    this._prev = node;
  }
  LinkList.prototype.pick = function() {
    this._next._prev = this._prev;
    this._prev._next = this._next;
  }
  LinkList.prototype.recover = function() {
    if (this._next && this._prev) {
      if (this._prev._next === this._next && this._next._prev === this
        ._prev) {
        this._prev._next = this;
        this._next._prev = this;
      }
    }
    //node._next = this;
    //node._prev = this._prev;
    //this._prev._next = node;
    //this._prev = node;
  }

  function getParam() {
    var paramObj = {};
    if (location.search.length > 1) {
      var params = location.search.substr(1).split("&");
      for (var p of params) {
        var pos = p.indexOf("=");
        if (pos < 0) continue;

        var pname = p.substr(0, pos),
          value = p.substr(pos + 1);
        paramObj[pname] = value;
      }
    }
    return paramObj;
  }
  Kit['queryArgs'] = getParam();

  function DoEventsRun(obj, func) {
    var flag = "_x_" + func.name;
    if (obj[flag]) return;
    obj[flag] = setTimeout(function() {
      func.bind(obj)();
      delete obj[flag];
    }, 10);
  }
  Kit['DoEventsRun'] = DoEventsRun;

  document.oncontextmenu = function() { return false };
})();
