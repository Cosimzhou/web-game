(function() {
  var exports = window || {};

  function Range(pts) {
    var minv = [Infinity, Infinity],
      maxv = [-Infinity, -Infinity];

    for (var pt of pts) {
      if (pt[0] > maxv[0]) maxv[0] = pt[0];
      if (pt[0] < minv[0]) minv[0] = pt[0];
      if (pt[1] > maxv[1]) maxv[1] = pt[1];
      if (pt[1] < minv[1]) minv[1] = pt[1];
    }
    return [minv, maxv];
  }
  exports.Range = Range;

  function Viewer2DBase() {
    this.strokes = [];
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this._rate = this._zoom = 1;
    this._transX = this._transY = 0;
    this._mouseX = this._mouseY = 0;
    this._rotate = 0;
    this._cw = this._ch = 0;
    this._dragging = false;
    this._envelop = [
      [Infinity, Infinity],
      [-Infinity, -Infinity]
    ];
  }
  exports.Viewer2DBase = Viewer2DBase;

  Viewer2DBase.prototype.adapt = function(canvas) {
    document.oncontextmenu = function() {
      return false;
    }
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext("2d");
    this.ctx.lineJoin = "round";
    if (canvas._refreshers == null)
      canvas._refreshers = [];
    canvas._refreshers.push(this);

    var me = this;
    canvas.addEventListener("mousedown", function(e) {
      me._updateMouse(e);
      me._dragging = true;
    });
    canvas.addEventListener("mousemove", function(e) {
      if (e.movementX || e.movementY);
      else return;
      var need_refresh = false;
      me._updateMouse(e);
      if (me._dragging) {
        me._transX += e.movementX;
        me._transY += e.movementY;
        need_refresh = true;
      }

      if (need_refresh) me.refresh();
    });
    canvas.addEventListener("mouseup", function(e) {
      me._dragging = false;
    });
    canvas.addEventListener("mouseleave", function(e) {
      me._dragging = false;
    });
    canvas.addEventListener("mousewheel", function(e) {
      me._updateMouse(e);
      var pt = [e.offsetX, e.offsetY];
      if (e.altKey) {
        me.rotate(me._rotate + (e.deltaY > 0 ? 0.1 : -0.1), pt);
      } else {
        me.zoom(me._zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1), pt);
      }

      me.refresh();
    });
  }

  Viewer2DBase.prototype.autoTransform = function(data, autoResize) {
    var MINV = this._envelop[0],
      MAXV = this._envelop[1];

    var range = data;
    if (MINV[0] > range[0]) MINV[0] = range[0];
    if (MINV[1] > range[1]) MINV[1] = range[1];
    if (MAXV[0] < range[0]) MAXV[0] = range[0];
    if (MAXV[1] < range[1]) MAXV[1] = range[1];

    this.strokes.push(data);

    if (autoResize) {
      this.transformForWholeView();
    } else {
      this.transformForSameView();
    }
  }

  Viewer2DBase.prototype.transformForWholeView = function() {
    var MINV = this._envelop[0],
      MAXV = this._envelop[1];

    // Update center
    this._cw = (MAXV[0] + MINV[0]) / 2;
    this._ch = (MAXV[1] + MINV[1]) / 2;

    // Update zoom rate
    var rw = this.width / (MAXV[0] - MINV[0]),
      rh = this.height / (MAXV[1] - MINV[1]);

    this._rate = Math.min(rw, rh) * this._zoom;
  }

  Viewer2DBase.prototype.transformForSameView = function() {
    var MINV = this._envelop[0],
      MAXV = this._envelop[1];

    var ncw = (MAXV[0] + MINV[0]) / 2,
      nch = (MAXV[1] + MINV[1]) / 2;
    var x = (ncw - this._cw) * this._rate,
      y = (this._ch - nch) * this._rate;

    if (this._rotate) {
      var cosA = Math.cos(this._rotate),
        sinA = Math.sin(this._rotate);
      this._transX += x * cosA - y * sinA;
      this._transY += x * sinA + y * cosA;
    } else {
      this._transX += x;
      this._transY += y;
    }

    // Update center
    this._cw = ncw;
    this._ch = nch;
  }

  Viewer2DBase.prototype._updateMouse = function(e) {
    this._mouseX = e["offsetX"];
    this._mouseY = e["offsetY"];
  }

  Viewer2DBase.prototype.drawItem = function(data) {
    if (data.length == 0) return;
    this.ctx.beginPath();
    this.ctx.save();
    this.ctx.translate(data[0] - this._cw, data[1] - this._ch);
    //this.drawPolyline(data);
    this.ctx.rect(-0.5, -0.5, 1, 1);
    this.ctx.fill();

    this.ctx.restore();
    this.ctx.closePath();
  }

  Viewer2DBase.prototype.refresh = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.translate(this.width / 2 + this._transX,
      this.height / 2 + this._transY);
    this.ctx.rotate(this._rotate);
    this.ctx.scale(this._rate, -this._rate);
    this.ctx.lineWidth = 1;

    for (var i = 0; i < this.strokes.length; i++) {
      this.drawItem(this.strokes[i]);
    }
  }


  Viewer2DBase.prototype.getCoordinate = function(x, y) {
    if (x == null) {
      x = this._mouseX;
      y = this._mouseY;
    }

    var ox = x - (this.width / 2 + this._transX),
      oy = y - (this.height / 2 + this._transY);
    ox /= this._rate, oy /= -this._rate;
    if (this._rotate) {
      var cosA = Math.cos(this._rotate),
        sinA = Math.sin(this._rotate);
      x = ox * cosA - oy * sinA;
      y = ox * sinA + oy * cosA;
    } else {
      x = ox, y = oy;
    }

    return [x + this._cw, y + this._ch];
  }

  Viewer2DBase.prototype.getRect = function() {
    var pt0 = this.getCoordinate(0, 0),
      pt1 = this.getCoordinate(this.width, this.height);

    return [pt0, pt1];
  }


  Viewer2DBase.prototype.centerPosition = function() {
    return this.getCoordinate(this.width / 2, this.height / 2);
  }

  Viewer2DBase.prototype.reset = function() {
    var MAXV = this._envelop[1],
      MINV = this._envelop[0];
    this._cw = (MAXV[0] + MINV[0]) / 2,
      this._ch = (MAXV[1] + MINV[1]) / 2;
    this._rate = Math.min(this.width / (MAXV[0] - MINV[0]),
      this.height / (MAXV[1] - MINV[1]));

    this._zoom = 1;
    this._transX = this._transY = this._rotate = 0;
    this.refresh();
  }

  Viewer2DBase.prototype.clear = function(data) {
    this._envelop = [
      [Infinity, Infinity],
      [-Infinity, -Infinity]
    ];
    this.strokes = [];
    this.reset();
  }

  Viewer2DBase.prototype.append = function(data, autoResize = false) {
    this.autoTransform(data, autoResize);
  }

  Viewer2DBase.prototype.zoom = function(nzoom, pt = null) {
    var x, y;
    if (pt) {
      x = pt[0], y = pt[1];
    } else {
      x = this.width / 2, y = this.height / 2;
    }

    var hw = this.width / 2,
      hh = this.height / 2;
    var ratio = nzoom / this._zoom - 1;
    this._rate = this._rate / this._zoom * nzoom;
    this._zoom = nzoom;
    this._transX += (hw + this._transX - x) * ratio;
    this._transY += (hh + this._transY - y) * ratio;
  }

  Viewer2DBase.prototype.rotate = function(nrotate, pt = null) {
    var x, y;
    if (pt) {
      x = pt[0], y = pt[1];
    } else {
      x = this.width / 2, y = this.height / 2;
    }

    var hw = this.width / 2,
      hh = this.height / 2;
    var cx1 = x - hw - this._transX,
      cy1 = hh + this._transY - y;
    var cos1 = Math.cos(this._rotate),
      sin1 = Math.sin(this._rotate);
    var Px = cx1 * cos1 - cy1 * sin1,
      Py = cx1 * sin1 + cy1 * cos1;

    this._rotate = nrotate;

    var cos2 = Math.cos(this._rotate),
      sin2 = Math.sin(this._rotate);
    var cy2 = y - (Px * sin2 - Py * cos2),
      cx2 = x - (Px * cos2 + Py * sin2);
    this._transX = cx2 - hw;
    this._transY = cy2 - hh;
  }


})();
