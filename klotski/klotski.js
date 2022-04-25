(function() {
  var exports = window || {};
  //       3
  //       ^
  //       |
  //  1 <--+--> 0
  //       |
  //       V
  //       2

  var CX = 4,
    CY = 5;
  var UX = CX + 1,
    UY = CY + 1;
  var WX = CX + 2,
    WY = CY + 2
  var U2X = UX << 1,
    U2Y = UY << 1;
  var ALL_LEN = UX * WY + 1;
  var NIL = 0,
    WALL = 0xff,
    CAO = 0x01,
    VERT_SAT = 0x20,
    HORI_SAT = 0x40,
    PAWN = 0x80;
  var BEGIN = WX,
    END = UY * UX;
  var DIR_DIFF = [1, -1, UX, -UX, 2, -2, U2X, -U2X];

  var Data = [
    [15, 0, "似远实近", "2348dlmoijns6"],
    [19, 0, "周易六十四卦-艮为山", "308bgilmnoqrst8"],
    [19, 0, "周易六十四卦-风山渐", "406bgilnoqrst8"],
    [19, 0, "单兵种的没落", "05467den89org"],
    [22, 0, "周易六十四卦-风地观", "308bglijnoqrst8"],
    [22, 0, "近在咫尺4", "144i67gh89den"],
    [24, 0, "周易六十四卦-天地否", "406bglqijnost8"],
    [24, 0, "周易六十四卦-水泽节", "308lns6bghijqr7"],
    [24, 0, "周易六十四卦-火雷噬嗑", "316gqs6ijlmno7"],
    [26, 0, "周易六十四卦-坎为水", "218ln6ghijqrst7"],
    [27, 0, "周易六十四卦-泽地萃", "218lq6ghijnost7"],
    [27, 0, "紫罗兰", "03869ghijmnoqt7"],
    [28, 0, "周易六十四卦-离为火", "406giqs6blmno7"],
    [28, 0, "比翼横空", "4146bgiolnqs8"],
    [28, 0, "蝴蝶花", "04669gjhimnqt7"],
    [29, 0, "周易六十四卦-山火贲", "308gis6blmnoqr7"],
    [30, 1, "周易六十四卦-水雷屯", "218ls6ghijnoqr7"],
    [32, 1, "周易六十四卦-水山骞", "218il6ghnoqrst7"],
    [32, 1, "周易六十四卦-雷泽归妹", "316nqs6ghijlm7"],
    [32, 1, "捷足先登", "144hlmno69be7"],
    [33, 1, "四横定式1", "4148bnsg67hmd"],
    [34, 1, "兵临曹营", "144hgjmn69be7"],
    [35, 1, "周易六十四卦-兑为泽", "406lnqsbeghij7"],
    [36, 1, "五将逼宫", "32468mbeloqtc"],
    [38, 1, "一横定式1", "144i6lno9emr7"],
    [38, 1, "六兵", "226mr69ghijlo7"],
    [38, 1, "四横定式2", "4148glq67cdei"],
    [39, 1, "一路顺风", "144h6gjn9emr7"],
    [39, 1, "周易六十四卦-风水涣", "316gln6ijqrst7"],
    [39, 1, "四将连关", "3248dighnoqt6"],
    [40, 1, "一横定式2", "144i9mno8dlq6"],
    [40, 1, "周易六十四卦-山泽损", "308gnsbeijlmqr7"],
    [40, 1, "奖杯", "32468mbeqrstc"],
    [40, 1, "罂粟", "128h69gjlmnoqt7"],
    [40, 1, "阻塞要道", "324inrgh69be7"],
    [41, 1, "气势汹汹", "3246bgijqrst8"],
    [42, 1, "一横定式3", "144djlmn89it6"],
    [42, 1, "周易六十四卦-水火既济", "308ilsbeghnoqr7"],
    [42, 1, "周易六十四卦-雷风恒", "308inqbeghlmst7"],
    [42, 1, "前挡后阻", "2348rdghejno6"],
    [44, 1, "六将之近在咫尺B", "2417n69cdgl"],
    [44, 1, "四横定式3", "4146insbchmr8"],
    [45, 1, "一横定式4", "144s6gij9ehm7"],
    [46, 1, "四横定式4", "414binsg67hm8"],
    [46, 2, "雪花莲", "136h69gjmnoqt7"],
    [47, 2, "雨声淅沥", "144h6gjm9eqt7"],
    [49, 1, "二横定式1", "234iqgno9ehm6"],
    [49, 2, "扰敌之策", "144sijlm9egh7"],
    [50, 2, "一字长蛇2", "324glqdn89ej6"],
    [50, 2, "一字长蛇", "324insbl9ehm7"],
    [50, 2, "星罗棋布", "3247crbe69loh"],
    [51, 2, "二横定式2", "234iqgho9ens6"],
    [53, 2, "四横定式5", "414glqs7689bi"],
    [53, 2, "四面八方", "3247crgjbeqth"],
    [54, 2, "左右步兵", "144rghij69be7"],
    [54, 2, "牛气冲天", "324bdrgj69qth"],
    [54, 2, "背水列阵", "3247qs69cdloh"],
    [56, 2, "四面楚歌", "144m69jl78gtc"],
    [58, 2, "一路进军", "144r6ghi9ejo7"],
    [60, 2, "齐头并进", "144m69loghij7"],
    [61, 2, "砝码", "324cqsgj6789h"],
    [62, 2, "三羊开泰1", "324hmrgj69be7"],
    [62, 2, "互不相让", "4148mqs67gjoc"],
    [62, 2, "周易六十四卦-雷地豫", "144qghijbest7"],
    [62, 2, "六将之近在咫尺A", "42268inbcdel"],
    [62, 2, "围而不歼", "144h6gmn9ejo7"],
    [62, 2, "插翅难飞", "234gm6lo9eij7"],
    [63, 2, "六将之步步高1", "241nr9dhlg6"],
    [63, 2, "六将守关1", "241ns9dlmjb"],
    [63, 2, "插翅难飞2", "3247qsbe69loc"],
    [63, 2, "节节高升", "144q6cioglms8"],
    [64, 2, "一夫当关", "144q6789losth"],
    [65, 2, "三军联防", "324gim89loqt6"],
    [65, 2, "三横定式A", "324imqgo9ehs6"],
    [66, 2, "四路进兵2", "414lnqs6ghij7"],
    [68, 2, "井底之蛙", "3247mrbe69loc"],
    [69, 2, "层层设防3", "324hmr9j6bgl7"],
    [70, 3, "周易六十四卦-地山谦", "144ilmno6bgh7"],
    [70, 3, "周易六十四卦-风雷益", "324glsij6bqr7"],
    [70, 3, "匹马嘶风", "144glmno89de6"],
    [70, 3, "指挥若定", "144h69logjmn7"],
    [70, 3, "桃花园中", "144rbehi69lo7"],
    [71, 3, "周易六十四卦-天雷无妄", "414glqs6ijno7"],
    [71, 3, "屯兵东路", "144g89lmijno6"],
    [72, 3, "六将之步步高2", "241ns9dhl86"],
    [72, 3, "兵分三路", "144hbelo69mn7"],
    [72, 3, "将拥曹营", "144qbehilost7"],
    [72, 3, "胡马窥江", "4146lnr9gjqtc"],
    [73, 3, "周易六十四卦-火泽睽", "414gnqs6ijlm7"],
    [73, 3, "勿入歧途", "144m69gohirs7"],
    [73, 3, "双将挡路", "234hm6gj9eqt7"],
    [73, 3, "马首是瞻", "4146bnqh89gsd"],
    [74, 3, "左兵右将", "144i89noghlm6"],
    [75, 3, "六将守关2", "241nsdelm9b"],
    [75, 3, "夹道藏兵", "414giln98dqt6"],
    [76, 3, "殊途同归", "144m67logirs8"],
    [77, 3, "四路进兵", "414inqsg69be7"],
    [77, 3, "逆时风车", "234hq9gnjmot6"],
    [79, 3, "周易六十四卦-天水讼", "414glnq6ijst7"],
    [79, 3, "水泄不通", "414giln69eqt7"],
    [80, 3, "周易六十四卦-风泽中孚", "414glns6ijqr7"],
    [81, 3, "三横定式B", "324imrgo9ehq6"],
    [81, 3, "云遮雾障", "234hm69gjoqt7"],
    [81, 3, "六将守关3", "241ns69lm8c"],
    [81, 3, "守口如瓶", "234qs69hgjlo7"],
    [81, 3, "异地同心", "4146lqsc89bnd"],
    [81, 3, "横刀立马", "144h69gjmnqt7"],
    [82, 3, "周易六十四卦-地天泰", "324inslmbegh7"],
    [83, 3, "周易六十四卦-火山旅", "324giqno6blm7"],
    [83, 3, "横马当关", "234gi69mloqt7"],
    [84, 3, "乱石崩云", "144i9bho6lnq7"],
    [85, 3, "周易六十四卦-泽山咸", "324ilqnobegh7"],
    [86, 3, "周易六十四卦-天山遁", "414gilqn6bot7"],
    [87, 3, "入地无门", "414hlnr69egj7"],
    [87, 3, "兵挡将阻", "324hmr9g6bjo7"],
    [87, 3, "顺时风车", "234gr9ildjot6"],
    [88, 3, "大渡桥横铁索寒", "324hmrboejlq7"],
    [88, 3, "独辟蹊径", "324insgm8deh6"],
    [89, 4, "周易六十四卦-地泽临", "234ns6lmghij7"],
    [90, 3, "三羊开泰2", "324lnrbe69hi7"],
    [90, 3, "穷途末路", "234lqenodghi6"],
    [94, 3, "歧路亡羊", "234gl7io6bjq8"],
    [94, 3, "鱼游春水", "414imqsg8deh6"],
    [95, 3, "周易六十四卦-雷山小过", "234iq6ghnost7"],
    [95, 3, "困于赤绂", "324lns698gqrc"],
    [96, 3, "周易六十四卦-山水蒙", "234gn6lmijst7"],
    [96, 3, "颠倒九六[阴]", "2347s9dj6bcrg"],
    [96, 3, "颠倒九六[阳]", "2348reio7lmqb"],
    [97, 3, "周易六十四卦-雷水解", "234nq6ghijst7"],
    [97, 3, "横行之将", "414dgnsm89il6"],
    [98, 3, "层峦叠嶂", "324hln69gjqt7"],
    [98, 3, "近在咫尺", "234gl7896bijn"],
    [99, 3, "以退为进", "234lqden789ob"],
    [99, 3, "周易六十四卦-地火明夷", "234is6lmghno7"],
    [99, 3, "列队欢送2", "234ns789ghijl"],
    [99, 3, "守口如瓶2", "234qsbeh69lo7"],
    [99, 3, "数字象形之8", "234qs69g78dhi"],
    [99, 3, "暗渡陈仓", "324lnr9b678jc"],
    [100, 4, "三羊开泰3", "324hlnbe69rs7"],
    [100, 4, "周易六十四卦-地风升", "234in6lmghst7"],
    [100, 4, "古堡藏龙", "234qs89j67bcg"],
    [100, 4, "百花盛开", "234lq6798dijn"],
    [100, 4, "相看两不厌", "234qs679gjloh"],
    [101, 4, "孤雁难飞", "324imq69ghlt7"],
    [101, 4, "奇门遁甲", "324hmr8g9ejo6"],
    [102, 4, "列队欢送", "234gl6789eijn"],
    [102, 4, "层层设防", "324hmr69gjlo7"],
    [102, 4, "数字象形之0", "324mqsbj69el7"],
    [103, 4, "瓮中之鳖", "324gim69loqt7"],
    [104, 4, "离而不坎", "324gnq69jlmt7"],
    [105, 4, "近在咫尺2", "234gl67d89ejn"],
    [105, 4, "近在咫尺3", "234lq7bd89ehn"],
    [106, 4, "数字象形之6", "324inr8l9ght6"],
    [106, 4, "花车", "324hlnbeqrst7"],
    [107, 4, "山在虚无缥缈间", "234qs7gj69beh"],
    [107, 4, "陈兵西陲", "234hq9jn6bgl7"],
    [108, 4, "周易六十四卦-山雷颐", "234gs6lmijno7"],
    [108, 4, "水浒聚义", "234qs6897jloh"],
    [109, 4, "冯京马涼2", "324imqgo69es7"],
    [109, 4, "小汽车", "234nr6cl78mtd"],
    [109, 4, "拳头", "234il9no6bgh7"],
    [111, 4, "单身的小兵", "234mr8eo79ilb"],
    [112, 4, "前后夹攻", "234qs79g8bhmi"],
    [120, 4, "层层设防2", "324hmrbe69lo7"],
    [121, 4, "数字象形之2", "324hmreg69qt7"],
    [121, 4, "数字象形之5", "324hmrbj69qt7"],
    [122, 4, "冯京马涼", "324imqgo9deh6"],
    [125, 4, "琼瑶敲碎", "324gnrel9bmt7"],
    [126, 4, "数字象形之3", "324hnsem69gq7"],
    [126, 4, "数字象形之7", "234greio89dm6"],
    [128, 4, "虚与委蛇1", "234lreio89dq6"],
    [130, 4, "数字象形之9", "324gmr6o7ijq8"],
    [131, 4, "数字象形之1", "234lreio78dqb"],
    [131, 4, "虚与委蛇2", "324ins9m8glq6"],
    [133, 4, "数字象形之4", "324glr6icjot8"],
    [135, 4, "小兵探路", "324ins9h8lqr6"],
    [138, 4, "峰回路转", "234ms9dj678rb"]
  ];

  var Images = {};

  function Game(opening) {
    this.base = new Board();
    this.limit = 150;
    this.stepnum = 0;
    this.stepbar = document.getElementById("step");
    if (opening != null) {
      opening += Data.length;
      opening %= Data.length;
      this.limit = Data[opening][0] * 2;
      this.base.setFingerPrint(Data[opening][3]);
      this.title = Data[opening][2];
      var pbar = document.getElementById("title");
      pbar.innerHTML = "第" + (opening + 1) + "局： " + Data[opening][2];
      pbar = document.getElementById("level");
      pbar.innerHTML = "难度：" + ["★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"][
        Data[opening][1]];
    }

    console.log(this.base.listPossible(), this.base._board);
    this.update();
  }
  Game.prototype.update = function() {
    this.stepbar.innerHTML = "已行动:" + this.stepnum + "步";
  }


  //var GameUI = c2g.GameUI;

  //GameUI.prototype.initImpl = function() {
  function GameUI(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.game = null;
    this.pressed = false;
    this.offset = [50, 50];
    this.answer = null;

    var ui = this;
    var canvas = this.canvas;
    canvas.addEventListener("mousedown", function(e) {
      if (ui.animate) return;

      var mid = ui.pointToManID(e);
      if (mid != ui.spotted) {
        ui.spotted = mid;
        ui.refresh();
        if (mid != null) {
          ui.possible = ui.queryPossible(mid);
        }
      }
      ui.pressed = true;
    });
    canvas.addEventListener("mouseleave", function(e) {
      ui.pressed = false;
    });
    canvas.addEventListener("mouseup", function(e) {
      ui.pressed = false;
    });

    canvas.addEventListener("mousemove", function(e) {
      if (ui.pressed && !ui.animate && ui.possible && ui.possible
        .length >
        0) {
        var x = e.movementX,
          y = e.movementY;
        var len = Math.hypot(x, y);
        if (len > 3) {
          if (y == 0 || Math.abs(x) / Math.abs(y) > 3) {
            x = Math.sign(x), y = 0;
          } else if (x == 0 || Math.abs(y) / Math.abs(x) > 3) {
            x = 0, y = Math.sign(y);
          }

          for (var p of ui.possible) {
            if (p[1][0] == x && p[1][1] == y) {
              ui.animate = new Animate(ui, ui.spotted, p[0]);
              break;
            }
          }
        }
      }
    });
  }

  GameUI.prototype.queryPossible = function(mid) {
    var pos = this.game.base._pieces[mid];
    var board = this.game.base._board;
    var xy = decode_pos(pos);
    var x = xy[0],
      y = xy[1];
    var w = wfromid(mid),
      h = hfromid(mid);

    var result = [];
    if (!board[pos - 1] && (h == 1 || (h == 2 && !board[pos - 1 + UX]))) {
      result.push([pos - 1, [-1, 0]]);
    }

    if (!board[pos - UX] && (w == 1 || (w == 2 && !board[pos - UX + 1]))) {
      result.push([pos - UX, [0, -1]]);
    }

    if (!board[pos + w] && (h == 1 || (h == 2 && !board[pos + w + UX]))) {
      result.push([pos + 1, [1, 0]]);
    }


    if (!board[pos + UX * h] && (w == 1 || (w == 2 && !board[pos + 1 + h *
        UX]))) {
      result.push([pos + UX, [0, 1]]);
    }

    return result;
  }

  GameUI.prototype.pointToManID = function(e) {
    var p = this.pointToPos(e);
    var pos = encode_pos(...p);
    return this.game.base._board[pos];
  }

  GameUI.prototype.pointToPos = function(e) {
    var x = parseInt((e.offsetX - this.offset[0]) / 100);
    var y = parseInt((e.offsetY - this.offset[1]) / 100);
    return [x, y];
  }

  GameUI.prototype.refresh = function() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, 800, 800);

    this.ctx.translate(...this.offset);
    this.ctx.scale(100, 100);
    if (typeof this.refreshImpl === 'function') this.refreshImpl();
  }

  GameUI.prototype.refreshImpl = function() {
    this.drawBoard();
    this.drawBlocks();
  }
  GameUI.prototype.drawBoard = function() {
    var gap = 0.05;
    this.ctx.beginPath();
    this.ctx.lineWidth = 0.04;
    this.ctx.moveTo(1, 5 + gap);
    this.ctx.lineTo(0 - gap, 5 + gap);
    this.ctx.lineTo(0 - gap, 0 - gap);
    this.ctx.lineTo(4 + gap, 0 - gap);
    this.ctx.lineTo(4 + gap, 5 + gap);
    this.ctx.lineTo(3, 5 + gap);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  GameUI.prototype.drawBlocks = function() {
    var gap = 0.05;
    var pcs = this.game.base._pieces;
    for (var mid in pcs) {
      var pos = decode_pos(pcs[mid]);
      var x = pos[0],
        y = pos[1];
      var tid = type(mid);
      var w = wfromid(mid) - gap * 2;
      var h = hfromid(mid) - gap * 2;
      var img = Images[mid];

      if (this.spotted == mid) {
        if (this.animate) {
          x = this.animate.cx;
          y = this.animate.cy;
        }

        this.ctx.fillStyle = "rgba(25,255,0,0.3)";
      } else {
        this.ctx.fillStyle = "#222";
      }

      x += gap;
      y += gap;
      if (img) {
        this.ctx.drawImage(img, x, y, w, h);

        if (this.spotted == mid) {
          this.ctx.beginPath();
          this.ctx.rect(x, y, w, h);
          this.ctx.fill();
          this.ctx.closePath();
        }
      } else {
        this.ctx.beginPath();
        this.ctx.rect(x, y, w, h);
        this.ctx.fill();
        this.ctx.closePath();
      }

      this.ctx.beginPath();
      this.ctx.fillStyle = "#ddd";
      this.ctx.moveTo(x, y + h);
      this.ctx.lineTo(x, y);
      this.ctx.lineTo(x + w, y);
      this.ctx.lineTo(x + w - gap, y + gap);
      this.ctx.lineTo(x + gap, y + gap);
      this.ctx.lineTo(x + gap, y + h - gap);
      this.ctx.fill();
      this.ctx.closePath();

      this.ctx.beginPath();
      this.ctx.fillStyle = "#000";
      this.ctx.moveTo(x + w, y);
      this.ctx.lineTo(x + w, y + h);
      this.ctx.lineTo(x, y + h);
      this.ctx.lineTo(x + gap, y + h - gap);
      this.ctx.lineTo(x + w - gap, y + h - gap);
      this.ctx.lineTo(x + w - gap, y + gap);
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  function Animate(ui, mid, dst, idx = null) {
    var pos = ui.game.base._pieces[mid];
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
    this.done = idx == null ? this.manualDone : this.answerDone;
    this.ansIdx = idx;

    var anm = this;
    this.interval = setInterval(function() {
      if (++anm.idx > anm.num) {
        clearInterval(anm.interval);
        ui.animate = null;
        ui.spotted = null;

        anm.ui.game.stepnum++;
        anm.ui.game.update();

        anm.done();
        return;
      }

      anm.cx = anm.sx + anm.dx * (anm.idx / anm.num);
      anm.cy = anm.sy + anm.dy * (anm.idx / anm.num);
      anm.ui.refresh();

    }, 100);
  }

  Animate.prototype.manualDone = function() {
    if (this.ui.game.base.isOver()) {
      alert("棒棒哒");
      return;
    }

    this.ui.game.base._move(this.mid, this.dst);

    console.log(this.ui.game.base.getFingerPrint(), this.ui.game.base
      .listPossible());

    if (this.ui.game.base.isOver()) {
      this.ui.spotted = 1;
      this.ui.animate = new Animate(this.ui, 1, 32);
    }
  }
  Animate.prototype.answerDone = function() {
    if (this.ui.game.base.isOver()) {
      alert("棒棒哒");
      this.ui.answer = null;
      return;
    }

    this.ui.game.base._move(this.mid, this.dst);

    console.log(this.ui.game.base.getFingerPrint(), this.ui.game.base
      .listPossible());

    if (this.ui.game.base.isOver()) {
      this.ui.spotted = 1;
      this.ui.animate = new Animate(this.ui, 1, 32);
    } else if (this.ui.answer && this.ansIdx + 1 < this.ui.answer.length) {
      var next_idx = this.ansIdx + 1;
      var mv = this.ui.answer[next_idx];

      this.ui.spotted = mv[0];
      this.ui.animate = new Animate(this.ui, mv[0], mv[1], next_idx);
    }
  }


  function loadImage(ui) {
    var image_data = {
      // Square block
      "caocao": CAO,
      // Horizontal block
      "guanyu": HORI_SAT,
      "zhaoyun": HORI_SAT + 1,
      "machao": HORI_SAT + 2,
      "huanggai": HORI_SAT + 3,
      // Vertical block
      "zhangfei": VERT_SAT,
      "huangzhong": VERT_SAT + 1,
      "zhoutai": VERT_SAT + 2,
      "handang": VERT_SAT + 3,
      "lvmeng": VERT_SAT + 4,
      // Point
      "zhouyu": PAWN,
      "ganning": PAWN + 1,
      "xusheng": PAWN + 2,
      "lingtong": PAWN + 3,
      "chengpu": PAWN + 4,
      "dongxi": PAWN + 5,
      "sunqian": PAWN + 6,
      "luxun": PAWN + 7,
    };

    var lest = 18;
    for (var pic in image_data) {
      var img = new Image()
      img.src = "img/" + pic + ".png";
      Images[image_data[pic]] = img;
      img.onload = function() {
        if (--lest == 0) {
          ui.refresh();
        }
      };
    }
  }

  var g_ui;
  var st = 0;

  function setUp(canvas) {
    g_ui = new GameUI(canvas);
    loadImage(g_ui);

    st = parseInt(c2g.queryArgs.st || 0);
    var game = new Game(st);
    g_ui.game = game;
    g_ui.base = game.base;
    g_ui.refresh();

  }
  exports['setUp'] = setUp;
  exports['reload'] = function(st) {
    var game = new Game(st);
    g_ui.game = game;
    g_ui.answer = null;
    g_ui.refresh();
  }
  exports['next'] = function() {
    var game = new Game(++st);
    g_ui.game = game;
    g_ui.answer = null;
    g_ui.refresh();
  }
  exports['prev'] = function() {
    var game = new Game(--st);
    g_ui.game = game;
    g_ui.answer = null;
    g_ui.refresh();
  }
  exports['answer'] = function() {
    if (g_ui.game.base.isOver()) return;

    if (g_ui.answer) {
      g_ui.answer = null;
      return;
    }

    var answer = Travel(g_ui.game);
    var mv = answer[0];

    g_ui.refresh();
    g_ui.answer = answer;
    g_ui.animate = new Animate(g_ui, mv[0], mv[1], 0);
  }


  function encode_pos(x, y) {
    return (y + 1) * UX + (x + 1);
  }

  function decode_pos(pos) {
    return [(pos % UX) - 1, parseInt(pos / UX) - 1];
  }

  function type(v) {
    return v == CAO ? CAO : (v & 0xe0);
  }

  function wfromid(v) {
    var vt = type(v);
    return vt == CAO || vt == HORI_SAT ? 2 : 1;
  }

  function hfromid(v) {
    var vt = type(v);
    return vt == CAO || vt == VERT_SAT ? 2 : 1;
  }

  function Board() {
    this.clear();
  }

  Board.prototype._move = function(mid, dst) {
    // assert move is legal, no judge here
    var pos = this._pieces[mid];
    var w = wfromid(mid),
      h = hfromid(mid);
    var board = this._board;
    var pits = this._pits;

    function addPit(p) { pits.add(p); }

    function delPit(p) { pits.delete(p); }

    function set(p, val, f) {
      board[p] = val;
      f(p);
      if (w == 2) {
        board[p + 1] = val;
        f(p + 1);
        if (h == 2) {
          board[p + UX + 1] = val;
          f(p + UX + 1);
        }
      }

      if (h == 2) {
        board[p + UX] = val;
        f(p + UX);
      }
    }

    // Take
    set(pos, NIL, addPit);
    set(dst, mid, delPit);
    this._pieces[mid] = dst;

    return [mid, pos];
  }

  Board.prototype.isOver = function() {
    return this._pieces[CAO] == 22;
  }

  Board.prototype.clear = function() {
    this._board = new Uint8Array(ALL_LEN);
    this._pieces = {};
    this._pits = new Set();
    for (var i = 0; i < ALL_LEN; ++i)
      this._pits.add(i);
    this.set_wall()
  }

  Board.prototype.isChm = function(x, y) {
    var pos = encode_pos(x, y);
    return CAO <= this._board[pos] && this._board[pos] < WALL;
  }

  Board.prototype.set_wall = function() {
    var top = UX * UY;
    for (var i = 0; i < UX; ++i) {
      this._board[i] = WALL;
      this._board[i + top] = WALL;
      this._pits.delete(i);
      this._pits.delete(i + top);
    }

    for (var i = 1; i < UY; ++i) {
      this._board[i * UX] = WALL;
      this._pits.delete(i * UX);
    }

    this._board[ALL_LEN - 1] = WALL;
    this._pits.delete(this._board.length - 1);
  }

  Board.prototype.getStringFromBoard = function() {
    var dic = {};
    dic[VERT_SAT] = [];
    dic[HORI_SAT] = [];
    dic[PAWN] = [];
    dic[CAO] = [];

    for (var mid in this._pieces) {
      var xy = Board.decode_pos(this._pieces[mid]);
      dic[type(mid)].push(xy[0].toString() + xy[1].toString());
    }

    dic[VERT_SAT].sort();
    dic[PAWN].sort();
    dic[HORI_SAT].sort();

    text = dic[VERT_SAT].length.toString() + dic[PAWN].length.toString() +
      dic[HORI_SAT].length.toString();
    text += dic[VERT_SAT].join("") + dic[PAWN].join("") + dic[HORI_SAT]
      .join("") + dic[CAO][0];

    return text;
  }

  Board.prototype.getFingerPrint = function() {
    var dic = {};
    dic[VERT_SAT] = [];
    dic[HORI_SAT] = [];
    dic[PAWN] = [];
    dic[CAO] = [];

    for (var mid in this._pieces) {
      dic[type(mid)].push(this._pieces[mid].toString(36));
    }

    dic[VERT_SAT].sort();
    dic[PAWN].sort();
    dic[HORI_SAT].sort();

    text = dic[HORI_SAT].length.toString() + dic[VERT_SAT].length
      .toString() + dic[PAWN].length.toString();
    text += dic[HORI_SAT].join("") + dic[VERT_SAT].join("") + dic[PAWN]
      .join("") + dic[CAO][0];

    return text;
  }


  Board.prototype.setBoardByString = function(string) {
    if (string.length < 3) return;

    this.clear();
    plrs = [parseInt(string[0]), parseInt(string[1]), parseInt(string[2])];
    idxs = [VERT_SAT, PAWN, HORI_SAT, 0];
    for (i = 3, man = 0, man_id = VERT_SAT; i < string.length; i += 2,
      man_id++) {
      while (man < 3 && plrs[man] == 0) {
        man_id = idxs[++man];
      }

      var pos = encode_pos(parseInt(string[i]), parseInt(string[i + 1]));
      if (man == 3) {
        this._board[pos] = this._board[pos + 1] = this._board[pos +
          UX] = this._board[pos + WX] = CAO;
        this._pieces[CAO] = pos
        this._pits.delete(pos);
        this._pits.delete(pos + 1);
        this._pits.delete(pos + UX);
        this._pits.delete(pos + WX);
        break;
      }

      plrs[man] -= 1;
      this._pieces[man_id] = pos;
      this._board[pos] = man_id;
      this._pits.delete(pos);
      if (man == 0) {
        this._board[pos + UX] = man_id;
        this._pits.delete(pos + UX);
      } else if (man == 2) {
        this._board[pos + 1] = man_id;
        this._pits.delete(pos + 1);
      }
    }
  }

  Board.prototype.setFingerPrint = function(string) {
    if (string.length < 3) return;

    this.clear();
    plrs = [parseInt(string[0]), parseInt(string[1]), parseInt(string[2])];
    idxs = [HORI_SAT, VERT_SAT, PAWN, 0];
    for (var i = 3, man = 0, man_id = idxs[man]; i < string.length; i++,
      man_id++) {
      for (; man < 3 && plrs[man] == 0;) {
        man_id = idxs[++man];
      }

      var pos = parseInt(string[i], 36);
      if (man == 3) {
        this._board[pos] = this._board[pos + 1] = this._board[pos +
          UX] = this._board[pos + WX] = CAO;
        this._pieces[CAO] = pos
        this._pits.delete(pos);
        this._pits.delete(pos + 1);
        this._pits.delete(pos + UX);
        this._pits.delete(pos + WX);
        break;
      }

      plrs[man] -= 1;
      this._pieces[man_id] = pos;
      this._board[pos] = man_id;
      this._pits.delete(pos);
      if (idxs[man] == VERT_SAT) {
        this._board[pos + UX] = man_id;
        this._pits.delete(pos + UX);
      } else if (idxs[man] == HORI_SAT) {
        this._board[pos + 1] = man_id;
        this._pits.delete(pos + 1);
      }
    }
  }

  Board.prototype.listPossible = function() {
    var result = [];
    var me = this;
    this._pits.forEach(function(pos) {
      var mid = me._board[pos - 1];
      if (NIL < mid && mid < WALL) {
        var w = wfromid(mid),
          h = hfromid(mid);
        var mp = me._pieces[mid];

        if ((h == 1) || (h == 2 && mp == pos - w && me._board[pos +
            UX] == NIL)) {
          result.push([mid, pos - w + 1, mp]);
        }
      }

      mid = me._board[pos + 1];
      if (NIL < mid && mid < WALL) {
        var w = wfromid(mid),
          h = hfromid(mid);
        var mp = me._pieces[mid];

        if ((h == 1) || (h == 2 && mp == pos + 1 && me._board[pos +
            UX] == NIL)) {
          result.push([mid, pos, mp]);
        }
      }

      mid = me._board[pos + UX];
      if (NIL < mid && mid < WALL) {
        var w = wfromid(mid),
          h = hfromid(mid);
        var mp = me._pieces[mid];

        if ((w == 1) || (w == 2 && mp == pos + UX && me._board[pos +
            1] == NIL)) {
          result.push([mid, pos, mp]);
        }
      }

      mid = me._board[pos - UX];
      if (NIL < mid && mid < WALL) {
        var w = wfromid(mid),
          h = hfromid(mid);
        var mp = me._pieces[mid];

        if ((w == 1) || (w == 2 && mp == pos - h * UX && me._board[pos +
            1] == NIL)) {
          result.push([mid, pos - (h - 1) * UX, mp]);
        }
      }
    });

    return result;
  }

  function Move(mid, dst, src) {
    this.mid = mid;
    this.dst = dst;
    this.src = src;
  }
  Move.prototype.move = function(board) {
    board._move(this.mid, this.dst);
  }
  Move.prototype.unmove = function(board) {
    board._move(this.mid, this.src);
  }

  function TreeNode(ptn) {
    this.parent = ptn;
    this.level = 0;
    this.move = null;
    this.tree = [];
    this.terminate = false;
  }

  TreeNode.prototype.fillTree = function(ctx) {
    if (this.terminate) return;
    var board = ctx.board;
    var res = board.listPossible();

    for (var node of res) {
      var mv = new Move(...node);
      var tn = new TreeNode(this);

      tn.level = this.level + 1;
      tn.move = mv;

      this.tree.push(tn);

      mv.move(board);
      ctx.steps.push(mv);
      if (board.isOver()) {
        tn.terminate = true;
        ctx.settle = tn;
        mv.unmove(board);
        return;
      }

      var fp = board.getFingerPrint();
      var pretn = ctx.visit[fp];
      if (pretn) {
        if (tn.level < pretn.level) {
          pretn.terminate = true;
        } else {
          tn.terminate = true;
        }
      } else {
        ctx.visit[fp] = tn;
      }

      ctx.steps.pop();
      mv.unmove(board);
    }
  }

  TreeNode.prototype.familyTree = function() {
    var stack = [];
    var treenode = this;
    var parent = treenode.parent;
    while (parent) {
      stack.push(treenode.move);
      treenode = parent;
      parent = treenode.parent;
    }

    return stack;
  }


  function TravelContext(board) {
    this.visit = {};
    this.steps = [];
    this.settle = null;
    this.board = board;
    this.root = null;

    this.current_steps = null;
  }
  TravelContext.prototype.prepare = function(treenode) {
    var stack = treenode.familyTree();

    this.current_steps = stack.concat();
    while (stack.length) {
      var mv = stack.pop();
      mv.move(this.board);
    }
  }
  TravelContext.prototype.restore = function() {
    for (var mv of this.current_steps) {
      mv.unmove(this.board);
    }
  }

  function Travel(game) {
    var ctx = new TravelContext(game.base);
    ctx.root = new TreeNode(null);
    ctx.visit[game.base.getFingerPrint()] = ctx.root;

    var limit = 0;
    var queue = [ctx.root];
    while (queue.length) {
      var nd = queue.shift();
      if (nd.terminate) continue;

      ctx.prepare(nd);
      nd.fillTree(ctx);
      queue.push(...nd.tree);
      ctx.restore();
      if (ctx.settle || ++limit > 90000)
        break;
    }

    if (ctx.settle) {
      var path = ctx.settle.familyTree();
      path.reverse();
      path = path.map(x => [x.mid, x.dst]);
      console.log(limit, path, ctx.settle);


      return path;
    }

    console.log(limit, ctx.settle);
    return null;
  }

})();
