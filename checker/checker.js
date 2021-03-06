(function() {
  var exports = window || {};


  var PJ_MAVSCORE = 0x7FFFFFFF;
  var kTwoPI = 2 * Math.PI;
  var SQRT3_2 = Math.sqrt(3) / 2;
  var kCCKR_NUM = 121;
  var kCCKR_LEN = kCCKR_NUM + 1;

  var cckr_table_y = [
    //      direction 0
    "\000\014\013\014\012\013\014\011\012\013\014\004\005\006\007\010\011\012\013\014\015\016\017\020\004\005\006\007\010\011\012\013\014\015\016\017\004\005\006\007\010\011\012\013\014\015\016\004\005\006\007\010\011\012\013\014\015\004\005\006\007\010\011\012\013\014\003\004\005\006\007\010\011\012\013\014\002\003\004\005\006\007\010\011\012\013\014\001\002\003\004\005\006\007\010\011\012\013\014\000\001\002\003\004\005\006\007\010\011\012\013\014\004\005\006\007\004\005\006\004\005\004",
    //      direction 1
    "\000\020\017\017\016\016\016\015\015\015\015\014\014\014\014\014\014\014\014\014\014\014\014\014\013\013\013\013\013\013\013\013\013\013\013\013\012\012\012\012\012\012\012\012\012\012\012\011\011\011\011\011\011\011\011\011\011\010\010\010\010\010\010\010\010\010\007\007\007\007\007\007\007\007\007\007\006\006\006\006\006\006\006\006\006\006\006\005\005\005\005\005\005\005\005\005\005\005\005\004\004\004\004\004\004\004\004\004\004\004\004\004\003\003\003\003\002\002\002\001\001\000",
    //      direction 2
    "\000\014\014\013\014\013\012\014\013\012\011\020\017\016\015\014\013\012\011\010\007\006\005\004\017\016\015\014\013\012\011\010\007\006\005\004\016\015\014\013\012\011\010\007\006\005\004\015\014\013\012\011\010\007\006\005\004\014\013\012\011\010\007\006\005\004\014\013\012\011\010\007\006\005\004\003\014\013\012\011\010\007\006\005\004\003\002\014\013\012\011\010\007\006\005\004\003\002\001\014\013\012\011\010\007\006\005\004\003\002\001\000\007\006\005\004\006\005\004\005\004\004",
    //      direction 3
    "\000\004\005\004\006\005\004\007\006\005\004\014\013\012\011\010\007\006\005\004\003\002\001\000\014\013\012\011\010\007\006\005\004\003\002\001\014\013\012\011\010\007\006\005\004\003\002\014\013\012\011\010\007\006\005\004\003\014\013\012\011\010\007\006\005\004\015\014\013\012\011\010\007\006\005\004\016\015\014\013\012\011\010\007\006\005\004\017\016\015\014\013\012\011\010\007\006\005\004\020\017\016\015\014\013\012\011\010\007\006\005\004\014\013\012\011\014\013\012\014\013\014",
    //      direction 4
    "\000\000\001\001\002\002\002\003\003\003\003\004\004\004\004\004\004\004\004\004\004\004\004\004\005\005\005\005\005\005\005\005\005\005\005\005\006\006\006\006\006\006\006\006\006\006\006\007\007\007\007\007\007\007\007\007\007\010\010\010\010\010\010\010\010\010\011\011\011\011\011\011\011\011\011\011\012\012\012\012\012\012\012\012\012\012\012\013\013\013\013\013\013\013\013\013\013\013\013\014\014\014\014\014\014\014\014\014\014\014\014\014\015\015\015\015\016\016\016\017\017\020",
    //      direction 5
    "\000\004\004\005\004\005\006\004\005\006\007\000\001\002\003\004\005\006\007\010\011\012\013\014\001\002\003\004\005\006\007\010\011\012\013\014\002\003\004\005\006\007\010\011\012\013\014\003\004\005\006\007\010\011\012\013\014\004\005\006\007\010\011\012\013\014\004\005\006\007\010\011\012\013\014\015\004\005\006\007\010\011\012\013\014\015\016\004\005\006\007\010\011\012\013\014\015\016\017\004\005\006\007\010\011\012\013\014\015\016\017\020\011\012\013\014\012\013\014\013\014\014"
  ];

  var cckr_table_x = [
    //      direction 0
    "\000\000\001\001\002\002\002\003\003\003\003\004\004\004\004\004\004\004\004\004\004\004\004\004\005\005\005\005\005\005\005\005\005\005\005\005\006\006\006\006\006\006\006\006\006\006\006\007\007\007\007\007\007\007\007\007\007\010\010\010\010\010\010\010\010\010\011\011\011\011\011\011\011\011\011\011\012\012\012\012\012\012\012\012\012\012\012\013\013\013\013\013\013\013\013\013\013\013\013\014\014\014\014\014\014\014\014\014\014\014\014\014\015\015\015\015\016\016\016\017\017\020",
    //      direction 1
    "\000\004\004\005\004\005\006\004\005\006\007\000\001\002\003\004\005\006\007\010\011\012\013\014\001\002\003\004\005\006\007\010\011\012\013\014\002\003\004\005\006\007\010\011\012\013\014\003\004\005\006\007\010\011\012\013\014\004\005\006\007\010\011\012\013\014\004\005\006\007\010\011\012\013\014\015\004\005\006\007\010\011\012\013\014\015\016\004\005\006\007\010\011\012\013\014\015\016\017\004\005\006\007\010\011\012\013\014\015\016\017\020\011\012\013\014\012\013\014\013\014\014",
    //      direction 2
    "\000\014\013\014\012\013\014\011\012\013\014\004\005\006\007\010\011\012\013\014\015\016\017\020\004\005\006\007\010\011\012\013\014\015\016\017\004\005\006\007\010\011\012\013\014\015\016\004\005\006\007\010\011\012\013\014\015\004\005\006\007\010\011\012\013\014\003\004\005\006\007\010\011\012\013\014\002\003\004\005\006\007\010\011\012\013\014\001\002\003\004\005\006\007\010\011\012\013\014\000\001\002\003\004\005\006\007\010\011\012\013\014\004\005\006\007\004\005\006\004\005\004",
    //      direction 3
    "\000\020\017\017\016\016\016\015\015\015\015\014\014\014\014\014\014\014\014\014\014\014\014\014\013\013\013\013\013\013\013\013\013\013\013\013\012\012\012\012\012\012\012\012\012\012\012\011\011\011\011\011\011\011\011\011\011\010\010\010\010\010\010\010\010\010\007\007\007\007\007\007\007\007\007\007\006\006\006\006\006\006\006\006\006\006\006\005\005\005\005\005\005\005\005\005\005\005\005\004\004\004\004\004\004\004\004\004\004\004\004\004\003\003\003\003\002\002\002\001\001\000",
    //      direction 4
    "\000\014\014\013\014\013\012\014\013\012\011\020\017\016\015\014\013\012\011\010\007\006\005\004\017\016\015\014\013\012\011\010\007\006\005\004\016\015\014\013\012\011\010\007\006\005\004\015\014\013\012\011\010\007\006\005\004\014\013\012\011\010\007\006\005\004\014\013\012\011\010\007\006\005\004\003\014\013\012\011\010\007\006\005\004\003\002\014\013\012\011\010\007\006\005\004\003\002\001\014\013\012\011\010\007\006\005\004\003\002\001\000\007\006\005\004\006\005\004\005\004\004",
    //      direction 5
    "\000\004\005\004\006\005\004\007\006\005\004\014\013\012\011\010\007\006\005\004\003\002\001\000\014\013\012\011\010\007\006\005\004\003\002\001\014\013\012\011\010\007\006\005\004\003\002\014\013\012\011\010\007\006\005\004\003\014\013\012\011\010\007\006\005\004\015\014\013\012\011\010\007\006\005\004\016\015\014\013\012\011\010\007\006\005\004\017\016\015\014\013\012\011\010\007\006\005\004\020\017\016\015\014\013\012\011\010\007\006\005\004\014\013\012\011\014\013\012\014\013\014"
  ];

  var cckr_table_next_move = [
    //      direction 0
    "\000\003\005\006\010\011\012\020\021\022\023\030\031\032\033\034\035\036\037\040\041\042\043\000\044\045\046\047\050\051\052\053\054\055\056\000\057\060\061\062\063\064\065\066\067\070\000\071\072\073\074\075\076\077\100\101\000\103\104\105\106\107\110\111\112\113\115\116\117\120\121\122\123\124\125\126\130\131\132\133\134\135\136\137\140\141\142\144\145\146\147\150\151\152\153\154\155\156\157\000\000\000\000\160\161\162\163\000\000\000\000\000\164\165\166\000\167\170\000\171\000\000",
    //      direction 1
    "\000\002\004\005\007\010\011\017\020\021\022\000\030\031\032\033\034\035\036\037\040\041\042\043\000\044\045\046\047\050\051\052\053\054\055\056\000\057\060\061\062\063\064\065\066\067\070\000\071\072\073\074\075\076\077\100\101\102\103\104\105\106\107\110\111\112\114\115\116\117\120\121\122\123\124\125\127\130\131\132\133\134\135\136\137\140\141\143\144\145\146\147\150\151\152\153\154\155\156\000\000\000\000\000\160\161\162\163\000\000\000\000\000\164\165\166\000\167\170\000\171\000",
    //      direction 2
    "\000\000\000\002\000\004\005\000\007\010\011\000\013\014\015\016\017\020\021\022\023\024\025\026\000\030\031\032\033\034\035\036\037\040\041\042\000\044\045\046\047\050\051\052\053\054\055\000\057\060\061\062\063\064\065\066\067\000\071\072\073\074\075\076\077\100\000\102\103\104\105\106\107\110\111\112\000\114\115\116\117\120\121\122\123\124\125\000\127\130\131\132\133\134\135\136\137\140\141\000\143\144\145\146\147\150\151\152\153\154\155\156\000\160\161\162\000\164\165\000\167\000",
    //      direction 3
    "\000\000\000\001\000\002\003\000\004\005\006\000\000\000\000\000\007\010\011\012\000\000\000\000\013\014\015\016\017\020\021\022\023\024\025\026\030\031\032\033\034\035\036\037\040\041\042\044\045\046\047\050\051\052\053\054\055\057\060\061\062\063\064\065\066\067\000\071\072\073\074\075\076\077\100\101\000\102\103\104\105\106\107\110\111\112\113\000\114\115\116\117\120\121\122\123\124\125\126\000\127\130\131\132\133\134\135\136\137\140\141\142\147\150\151\152\160\161\162\164\165\167",
    //      direction 4
    "\000\000\001\000\002\003\000\004\005\006\000\000\000\000\000\007\010\011\012\000\000\000\000\000\014\015\016\017\020\021\022\023\024\025\026\027\031\032\033\034\035\036\037\040\041\042\043\045\046\047\050\051\052\053\054\055\056\060\061\062\063\064\065\066\067\070\071\072\073\074\075\076\077\100\101\000\102\103\104\105\106\107\110\111\112\113\000\114\115\116\117\120\121\122\123\124\125\126\000\127\130\131\132\133\134\135\136\137\140\141\142\000\150\151\152\153\161\162\163\165\166\170",
    //      direction 5
    "\000\000\003\000\005\006\000\010\011\012\000\014\015\016\017\020\021\022\023\024\025\026\027\000\031\032\033\034\035\036\037\040\041\042\043\000\045\046\047\050\051\052\053\054\055\056\000\060\061\062\063\064\065\066\067\070\000\072\073\074\075\076\077\100\101\000\103\104\105\106\107\110\111\112\113\000\115\116\117\120\121\122\123\124\125\126\000\130\131\132\133\134\135\136\137\140\141\142\000\144\145\146\147\150\151\152\153\154\155\156\157\000\161\162\163\000\165\166\000\170\000\000"
  ];



  var cckr_table_rotate = [
    0,
    // direction 1
    "\000\027\026\043\025\042\056\024\041\055\070\001\003\006\012\023\040\054\067\101\113\126\142\157\002\005\011\022\037\053\066\100\112\125\141\156\004\010\021\036\052\065\077\111\124\140\155\007\020\035\051\064\076\110\123\137\154\017\034\050\063\075\107\122\136\153\016\033\047\062\074\106\121\135\152\163\015\032\046\061\073\105\120\134\151\162\166\014\031\045\060\072\104\117\133\150\161\165\170\013\030\044\057\071\103\116\132\147\160\164\167\171\102\115\131\146\114\130\145\127\144\143",
    // direction 2
    "\000\157\142\156\126\141\155\113\125\140\154\027\043\056\070\101\112\124\137\153\163\166\170\171\026\042\055\067\100\111\123\136\152\162\165\167\025\041\054\066\077\110\122\135\151\161\164\024\040\053\065\076\107\121\134\150\160\023\037\052\064\075\106\120\133\147\012\022\036\051\063\074\105\117\132\146\006\011\021\035\050\062\073\104\116\131\145\003\005\010\020\034\047\061\072\103\115\130\144\001\002\004\007\017\033\046\060\071\102\114\127\143\016\032\045\057\015\031\044\014\030\013",
    // direction 3
    "\000\171\170\167\166\165\164\163\162\161\160\157\156\155\154\153\152\151\150\147\146\145\144\143\142\141\140\137\136\135\134\133\132\131\130\127\126\125\124\123\122\121\120\117\116\115\114\113\112\111\110\107\106\105\104\103\102\101\100\077\076\075\074\073\072\071\070\067\066\065\064\063\062\061\060\057\056\055\054\053\052\051\050\047\046\045\044\043\042\041\040\037\036\035\034\033\032\031\030\027\026\025\024\023\022\021\020\017\016\015\014\013\012\011\010\007\006\005\004\003\002\001",
    // direction 4
    "\000\143\144\127\145\130\114\146\131\115\102\171\167\164\160\147\132\116\103\071\057\044\030\013\170\165\161\150\133\117\104\072\060\045\031\014\166\162\151\134\120\105\073\061\046\032\015\163\152\135\121\106\074\062\047\033\016\153\136\122\107\075\063\050\034\017\154\137\123\110\076\064\051\035\020\007\155\140\124\111\077\065\052\036\021\010\004\156\141\125\112\100\066\053\037\022\011\005\002\157\142\126\113\101\067\054\040\023\012\006\003\001\070\055\041\024\056\042\025\043\026\027",
    // direction 5
    "\000\013\030\014\044\031\015\057\045\032\016\143\127\114\102\071\060\046\033\017\007\004\002\001\144\130\115\103\072\061\047\034\020\010\005\003\145\131\116\104\073\062\050\035\021\011\006\146\132\117\105\074\063\051\036\022\012\147\133\120\106\075\064\052\037\023\160\150\134\121\107\076\065\053\040\024\164\161\151\135\122\110\077\066\054\041\025\167\165\162\152\136\123\111\100\067\055\042\026\171\170\166\163\153\137\124\112\101\070\056\043\027\154\140\125\113\155\141\126\156\142\157"
  ];


  var cckr_table_ruler_y =
    "\000\005\005\006\005\006\007\005\006\007\010\001\002\003\004\005\006\007\010\011\012\013\014\015\002\003\004\005\006\007\010\011\012\013\014\015\003\004\005\006\007\010\011\012\013\014\015\004\005\006\007\010\011\012\013\014\015\005\006\007\010\011\012\013\014\015\005\006\007\010\011\012\013\014\015\016\005\006\007\010\011\012\013\014\015\016\017\005\006\007\010\011\012\013\014\015\016\017\020\005\006\007\010\011\012\013\014\015\016\017\020\021\012\013\014\015\013\014\015\014\015\015";


  var cckr_table_reverse = [
    "\000\000\000\000\000\000\000\000\000\000\000\000\001\000\000\000\000", // \000
    "\000\000\000\000\000\000\000\000\000\000\000\002\003\000\000\000\000", // \001
    "\000\000\000\000\000\000\000\000\000\000\004\005\006\000\000\000\000", // \002
    "\000\000\000\000\000\000\000\000\000\007\010\011\012\000\000\000\000", // \003
    "\000\000\000\000\013\014\015\016\017\020\021\022\023\024\025\026\027", // \004
    "\000\000\000\000\030\031\032\033\034\035\036\037\040\041\042\043\000", // \005
    "\000\000\000\000\044\045\046\047\050\051\052\053\054\055\056\000\000", // \006
    "\000\000\000\000\057\060\061\062\063\064\065\066\067\070\000\000\000", // \007
    "\000\000\000\000\071\072\073\074\075\076\077\100\101\000\000\000\000", // \010
    "\000\000\000\102\103\104\105\106\107\110\111\112\113\000\000\000\000", // \011
    "\000\000\114\115\116\117\120\121\122\123\124\125\126\000\000\000\000", // \012
    "\000\127\130\131\132\133\134\135\136\137\140\141\142\000\000\000\000", // \013
    "\143\144\145\146\147\150\151\152\153\154\155\156\157\000\000\000\000", // \014
    "\000\000\000\000\160\161\162\163\000\000\000\000\000\000\000\000\000", // \015
    "\000\000\000\000\164\165\166\000\000\000\000\000\000\000\000\000\000", // \016
    "\000\000\000\000\167\170\000\000\000\000\000\000\000\000\000\000\000", // \017
    "\000\000\000\000\171\000\000\000\000\000\000\000\000\000\000\000\000" // \020
  ];


  var cckr_nest_indices = [
    "\102\143\146\114\115\127\130\131\144\145", // 1
    "\160\163\171\162\161\164\165\166\167\170", // 2

    "\113\154\157\125\126\140\141\142\156\155", // 3
    "\024\027\070\026\025\041\042\043\055\056", // 4

    "\001\007\012\002\003\004\005\006\010\011", // 5
    "\013\016\057\015\014\030\031\032\044\045", // 6
  ];

  var cckr_colors = ["blue", "green", "yellow", "red", "pink", "cyan"];

  function xy2i(x, y) { return cckr_table_reverse[x].charCodeAt(y); }

  function in2x(i, n = 0) { return cckr_table_x[n].charCodeAt(i); }

  function in2y(i, n = 0) { return cckr_table_y[n].charCodeAt(i); }

  function ineib(i, d = 0) { return cckr_table_next_move[d].charCodeAt(i); }

  function norm2x(x, y) { return x + (y / 2) - 5; }

  function norm2y(y) { return y * SQRT3_2; }



  function Board() {
    this._map = new Uint8Array(kCCKR_LEN);
  }
  Board.prototype.isOver = function() {
    return false;
  }
  Board.prototype.clone = function() {
    var b = new Board();
    b._map = Uint8Array.from(this._map);
    return b;
  }
  Board.prototype.move = function(o, d) {
    var chk = this._map[o];
    if (chk && !this._map[d]) {
      this._map[d] = chk;
      this._map[o] = 0;
      return true;
    }
    return false;
  }
  Board.prototype.unmove = function(o, d) {
    var chk = this._map[d];
    if (chk && !this._map[o]) {
      this._map[o] = chk;
      this._map[d] = 0;
      return true;
    }
    return false;
  }
  Board.prototype.put = function(array) {
    for (var elem of array) {
      var txt = cckr_nest_indices[elem - 1];
      for (var i = 0; i < txt.length; ++i) {
        this._map[txt.charCodeAt(i)] = elem;
      }
    }
  }
  Board.prototype.allMoves = function(side) {
    var moves = [];
    for (var i = 1; i < kCCKR_LEN; ++i) {
      if (this._map[i] == side) {
        var poss = this.moveForPit(i);
        poss.forEach(function(x) {
          moves.push([i, x]);
        });
      }
    }

    return moves;
  }
  Board.prototype.moveForPit = function(idx) {
    if (this._map[idx] == 0) return;

    var res = new Set();
    res.add(idx);
    for (var d = 0; d < 6; d++) {
      var nexti = cckr_table_next_move[d].charCodeAt(idx);
      if (nexti == 0) continue;

      if (this._map[nexti] == 0) {
        res.add(nexti);
      } else {
        var nextii = cckr_table_next_move[d].charCodeAt(nexti);
        if (nextii > 0 && this._map[nextii] == 0) {
          this._jumpsForPit(nextii, res);
        }
      }
    }

    res.delete(idx);

    return res;
  }

  Board.prototype._jumpsForPit = function(idx, visit) {
    if (this._map[idx] || visit.has(idx)) return;
    visit.add(idx);

    for (var d = 0; d < 6; d++) {
      var nexti = cckr_table_next_move[d].charCodeAt(idx);
      if (nexti && this._map[nexti]) {
        var nextii = cckr_table_next_move[d].charCodeAt(nexti);
        if (nextii && this._map[nextii] == 0) {
          this._jumpsForPit(nextii, visit);
        }
      }
    }

    return;
  }

  Board.prototype.searchPath = function(start, dest) {
    if (!start || !dest || !this._map[start] || this._map[dest]) return;

    var visit = new Set();
    var path = [];
    for (var d = 0; d < 6; ++d) {
      var nexti = cckr_table_next_move[d].charCodeAt(start);
      if (nexti == dest) {
        return [dest];
      }

      if (nexti && this._map[nexti]) {
        var nextii = cckr_table_next_move[d].charCodeAt(nexti);
        if (nextii && !this._map[nextii]) {
          if (nextii == dest) {
            path.push(dest);
            return path;
          }

          if (!visit.has(nextii)) {
            visit.add(nextii);
            path.push(nextii);

            var ret_path = this._jumpPath(nextii, dest, path, visit);
            if (ret_path) return ret_path;

            path.pop();
          }
        }
      }
    }

    return;
  }

  Board.prototype._jumpPath = function(start, dest, path, visit) {
    if (!start || !dest || this._map[start] || this._map[dest]) return;

    for (var d = 0; d < 6; ++d) {
      var nexti = cckr_table_next_move[d].charCodeAt(start);
      if (nexti && this._map[nexti]) {
        var nextii = cckr_table_next_move[d].charCodeAt(nexti);
        if (nextii && !this._map[nextii]) {
          if (nextii == dest) {
            path.push(dest);
            return path;
          }

          if (!visit.has(nextii)) {
            visit.add(nextii);
            path.push(nextii);

            var ret_path = this._jumpPath(nextii, dest, path, visit);
            if (ret_path) return ret_path;

            path.pop();
          }
        }
      }

    }

    return;
  }

  function Game() {
    this.base = new Board();
    this.turn = 0;
    this.side = 4;
    this.participates = [4, 1];
    this.base.put(this.participates);
  }
  Game.prototype.turnSide = function() {
    this.turn++;
    if (this.turn >= this.participates.length) this.turn = 0;

    this.side = this.participates[this.turn];

  }
  Game.prototype.getSide = function(t) {
    return this.participates[t % this.participates.length];
  }

  function GameAI(game, side) {
    this.game = game;
    this.base = game.base.clone();

    this.depth = 3;
    this.side = side;
    this.ps = 0;
  }
  //GameAI.prototype.getMen = function() {
  //  var pit = [];
  //  for (var i = 1; i < kCCKR_LEN; ++i) {
  //    var chk = this.base._map[i];
  //    if (chk) {
  //      //if
  //    }
  //  }
  //  return pit;
  //}
  GameAI.prototype.isGameWon = function(side) {
    var miny = {};
    for (var i = 1; i < kCCKR_LEN; ++i) {
      var chk = this.base._map[i];
      if (chk == side) {
        if (miny[chk] == null) {
          miny[chk] = 20;
        }
        miny[chk] = Math.min(miny[chk], in2y(i, chk - 1));
      }
    }

    for (var side in miny) {
      if (miny[side] = 13) {
        return side;
      }
    }

    return null;
  }

  GameAI.prototype.search = function(turn) {
    //this.test(turn, this.depth);

    var side = this.game.getSide(turn);
    this.searchSingle(side, this.depth);

    var bmv = this.best_move
    console.log(this.best_move);

    var path = this.base.searchPath(...bmv);
    console.log(path);
    return [bmv, path];
    //this.game.base.move(...bmv);
    //this.game.turnSide();
  }

  GameAI.prototype.test = function(turn, level) {
    var side = this.game.getSide(turn);
    if (level <= 0) {
      //return this.evaluate(side);
      return this.evalSingle(side);
    }

    var min_val = PJ_MAVSCORE;
    var moves = this.base.allMoves(side);
    for (var mv of moves) {
      var chk = this.base._map[mv[0]];
      // Move
      this.base._map[mv[0]] = 0;
      this.base._map[mv[1]] = chk;

      // Search
      var score = -this.test(turn + 1, level - 1);
      if (score < min_val) {
        score = min_val;
        if (level == this.depth) {
          this.best_move = mv;
        }
      }

      // Undo
      this.base._map[mv[1]] = 0;
      this.base._map[mv[0]] = chk;
    }

    return score;
  }

  GameAI.prototype.evaluate = function(side) {
    var score = {};
    for (var i = 1; i < kCCKR_LEN; ++i) {
      var chk = this.base._map[i];
      if (chk) {
        if (score[chk] == null) score[chk] = 0;
        score[chk] += in2y(i, chk - 1);
      }
    }

    var myscore = score[side];
    var oppov = 0;
    for (var v in score) {
      if (v != side) {
        v = score[v];
        if (v > oppov) {
          oppov = v;
        }
      }
    }

    return myscore - oppov;
  }

  GameAI.prototype.searchSingle = function(side, level) {
    if (level <= 0) {
      return this.evalSingle(side);
    }
    if (this.isGameWon()) {
      return PJ_MAVSCORE + level;
    }

    var best_score = -PJ_MAVSCORE;
    var moves = this.base.allMoves(side);
    for (var mv of moves) {
      // Move
      this.base.move(...mv);

      // Search
      var score = this.searchSingle(side, level - 1);
      if (score > best_score) {
        best_score = score;
        if (level == this.depth) {
          this.best_move = mv;
        }
      }

      // Undo
      this.base.unmove(...mv);
    }

    return best_score;
  }
  GameAI.prototype.evalSingle = function(side) {
    var score = 0;
    var ymin = 20,
      ymax = 0;
    for (var i = 1, cnt = 10; i < kCCKR_LEN; ++i) {
      var chk = this.base._map[i];
      if (chk == side) {
        var x = in2x(i, chk - 1);
        var y = in2y(i, chk - 1);
        x = norm2x(x, y);

        if (y >= 13)
          score += y + 80;
        else
          score += y * (5 - Math.abs(x - 6) / 3);

        if (ymin > y) ymin = y;
        if (ymax < y) ymax = y;

        if (--cnt == 0) break;
      }
    }

    return ymin == 13 ? Infinity : score * (ymax + (ymin + 2) * 90);
  }

  function Animate(ui, src, path) {
    this.ui = ui;
    this.path = path;
    this.segIdx = 0;
    this.idx = 0;
    this.frame_num = 5;
    this.dest = path[path.length - 1];
    this.chkside = ui.game.base._map[src];
    ui.game.base._map[src] = 0;

    var x = in2x(src),
      y = in2y(src);
    x = norm2x(x, y), y = norm2y(y);

    this.cur_x = this.from_x = x;
    this.cur_y = this.from_y = y;

    x = in2x(path[0]), y = in2y(path[0]);
    x = norm2x(x, y), y = norm2y(y);
    this.dest_x = x;
    this.dest_y = y;

    this.vx = (this.dest_x - this.from_x) / this.frame_num;
    this.vy = (this.dest_y - this.from_y) / this.frame_num;


    var anm = this;
    this.interval = setInterval(function() {
      if (++anm.idx >= anm.frame_num) {
        if (++anm.segIdx < anm.path.length) {
          anm.idx = 0;

          anm.cur_x = anm.from_x = anm.dest_x;
          anm.cur_y = anm.from_y = anm.dest_y;

          var x = in2x(path[anm.segIdx]),
            y = in2y(path[anm.segIdx]);
          x = norm2x(x, y), y = norm2y(y);

          anm.dest_x = x, anm.dest_y = y;

          anm.vx = (anm.dest_x - anm.from_x) / anm.frame_num;
          anm.vy = (anm.dest_y - anm.from_y) / anm.frame_num;

          sound();
        } else {
          sound();
          anm.ui.animate = null;
          clearInterval(anm.interval);
          anm.ui.game.base._map[anm.dest] = anm.chkside;
          anm.ui.game.turnSide();
        }
      } else {
        anm.cur_x = anm.from_x + anm.idx * anm.vx;
        anm.cur_y = anm.from_y + anm.idx * anm.vy;
      }
      anm.ui.refresh();
    }, 100);
  }


  var GameUI = c2g.GameUI;
  GameUI.prototype.initImpl = function() {
    this.game = new Game();
    this.base = this.game.base;
    this.current_possible = null;
    this.movingObject = null;

    this.radius = 0.4;
    this.offset = [0, 40];
  }

  //
  //function GameUI(canvas) {
  //  this.ctx = canvas.getContext('2d');

  //  this.game = new Game();
  //  this.current_possible = null;
  //  this.movingObject = null;
  //  this.animate = null;

  //  this.radius = 0.4;
  //  this._screenScale = 50;
  //  this.offsetX = 60;
  //  this.offsetY = 60;
  //  this.width = canvas.width;
  //  this.height = canvas.height;

  //  var ui = this;
  //  canvas.addEventListener("mousedown", function(e) {
  //    if (ui.animate) return;
  //    var idx = ui.pointToIdx(e.offsetX, e.offsetY);
  //    if (idx && ui.game.base._map[idx] == ui.game.side) {
  //      ui.current_possible = ui.game.base.moveForPit(idx);

  //      if (ui.current_possible.size) {
  //        ui.movingObject = {
  //          src: idx,
  //          clr: ui.game.base._map[idx],
  //          pt: [e.offsetX, e.offsetY]
  //        };
  //        ui.game.base._map[idx] = 0;
  //      }
  //      ui.refresh();
  //    }
  //  });
  //  canvas.addEventListener("mouseleave", function(e) {
  //    if (ui.movingObject) {
  //      ui.game.base._map[ui.movingObject.src] = ui.movingObject.clr;
  //      ui.movingObject = null;
  //      ui.current_possible = null;
  //      ui.refresh();
  //    }
  //  });
  //  canvas.addEventListener("mouseup", function(e) {
  //    if (ui.movingObject) {
  //      var idx = ui.pointToIdx(e.offsetX, e.offsetY);

  //      if (ui.current_possible.has(idx)) {
  //        ui.game.base._map[idx] = ui.movingObject.clr;
  //        ui.game.turnSide();

  //        idx = "good";
  //      } else {
  //        ui.game.base._map[ui.movingObject.src] = ui.movingObject.clr;
  //      }

  //      ui.movingObject = null;
  //      ui.current_possible = null;
  //      ui.refresh();

  //      if (idx == "good") {
  //        var ai = new GameAI(ui.game, ui.game.side);
  //        var move = ai.search(ui.game.turn);
  //        ui.animate = new Animate(ui, move[0][0], move[1]);
  //        //ui.refresh();

  //      }
  //    }
  //  });
  //  canvas.addEventListener("mousemove", function(e) {
  //    if (ui.movingObject) {
  //      ui.movingObject.pt[0] = e.offsetX;
  //      ui.movingObject.pt[1] = e.offsetY;
  //      ui.refresh();
  //    }
  //  });
  //}
  GameUI.prototype.pickSpriteImpl = function(mid) {
    var brd = this.base;
    var chm = brd._map[mid];
    if (chm != null && (this.side() == chm._isRed())) {
      brd._map[chm._pos] = 0;
    } else {
      this.spotted = null;
    }
  }
  GameUI.prototype.pointToIdx = function(px, py) {
    var x = parseInt((px - this.offset[0]) * 2 / this._screenScale + .5) /
      2;
    var y = parseInt((py - this.offset[1]) / this._screenScale / SQRT3_2 +
      .5);
    x = parseInt(x + 5 - (y / 2));

    return (x < 0 || y < 0 || x > 16 || y > 16) ? 0 : xy2i(x, y);
  }

  GameUI.prototype.refreshImpl = function() {
    this.drawBoard();

    this._drawCheckermen();
    this._drawPossiblePits();
    this._drawAnimate();

    this.drawMovingObject();

    this._drawCoordinate(0);
  }

  GameUI.prototype._drawNestTriangles = function() {
    for (var d = 0; d < 6; ++d) {
      var idxs = cckr_nest_indices[d];
      var idx = idxs.charCodeAt(2);
      var x = in2x(idx),
        y = in2y(idx);
      this.ctx.beginPath();
      this.ctx.moveTo(norm2x(x, y), norm2y(y));

      for (var i = 0; i < 3; ++i) {
        idx = idxs.charCodeAt(i);
        x = in2x(idx);
        y = in2y(idx);
        this.ctx.lineTo(norm2x(x, y), norm2y(y));
      }
      this.ctx.fillStyle = cckr_colors[d];
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  GameUI.prototype._drawLinks = function() {
    this.ctx.beginPath();
    for (var i = 1; i < kCCKR_LEN; ++i) {
      var x = in2x(i),
        y = in2y(i);
      for (var d = 0; d < 3; ++d) {
        var neighbor = ineib(i, d);
        if (neighbor) {
          var dx = in2x(neighbor),
            dy = in2y(neighbor);
          this.ctx.moveTo(norm2x(x, y), norm2y(y));
          this.ctx.lineTo(norm2x(dx, dy), norm2y(dy));
        }
      }
    }
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    this.ctx.closePath();
  }

  GameUI.prototype._drawPits = function() {
    this.ctx.beginPath();
    var R = this.radius;
    for (var i = 1; i < kCCKR_LEN; ++i) {
      var x = in2x(i),
        y = in2y(i);
      x = norm2x(x, y);
      y = norm2y(y);
      this.ctx.moveTo(x + R, y);
      this.ctx.arc(x, y, R, 0, kTwoPI);
    }
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    this.ctx.fillStyle = "white";
    this.ctx.fill();
    this.ctx.closePath();
  }
  GameUI.prototype._drawCheckermen = function() {
    var R = this.radius;
    var gr = 0.15;
    for (var i = 1; i < kCCKR_LEN; ++i) {
      var clr = this.game.base._map[i];
      if (clr == 0) continue;

      var x = in2x(i),
        y = in2y(i);
      x = norm2x(x, y);
      y = norm2y(y);

      var grad = this.ctx.createRadialGradient(x - gr, y - gr, 0.1, x -
        gr, y - gr, 0.2);

      grad.addColorStop(0, "white");
      grad.addColorStop(1, cckr_colors[clr - 1]);
      this.ctx.fillStyle = grad;

      this.ctx.beginPath();
      this.ctx.moveTo(x + R, y);
      this.ctx.arc(x, y, R, 0, kTwoPI);
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.closePath();
    }
  }

  GameUI.prototype._drawPossiblePits = function() {
    if (this.current_possible) {
      var array = Array.from(this.current_possible);
      this.ctx.strokeStyle = "red";
      this.ctx.beginPath();
      var R = 0.45;
      for (var idx of array) {
        var x = in2x(idx),
          y = in2y(idx);
        x = norm2x(x, y);
        y = norm2y(y);
        this.ctx.moveTo(x + R, y);
        this.ctx.arc(x, y, R, 0, kTwoPI);
      }

      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  GameUI.prototype.drawMovingObject = function() {
    if (this.movingObject == null) return;
    //this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    var R = this._screenScale * this.radius * 1.25;
    var gr = R / 2;
    var x = this.movingObject.pt[0],
      y = this.movingObject.pt[1];

    this.ctx.beginPath();
    this.ctx.moveTo(x + R, y);
    this.ctx.arc(x, y, R, 0, kTwoPI);

    var grad = this.ctx.createRadialGradient(x - gr, y - gr, R * 0.1, x -
      gr, y - gr, R * 0.2);

    grad.addColorStop(0, "white");
    grad.addColorStop(1, cckr_colors[this.movingObject.clr - 1]);
    this.ctx.fillStyle = grad;

    this.ctx.fill();
    this.ctx.closePath();
  }
  GameUI.prototype._drawAnimate = function() {
    if (this.animate == null) return;

    var R = this.radius * (1 + 0.25 / 2 * Math.abs(this.animate.idx - 3));

    var gr = R / 2;
    var x = this.animate.cur_x,
      y = this.animate.cur_y;

    this.ctx.beginPath();
    this.ctx.moveTo(x + R, y);
    this.ctx.arc(x, y, R, 0, kTwoPI);

    var grad = this.ctx.createRadialGradient(x - gr, y - gr, R * 0.1, x -
      gr, y - gr, R * 0.2);

    grad.addColorStop(0, "white");
    grad.addColorStop(1, cckr_colors[this.animate.chkside - 1]);
    this.ctx.fillStyle = grad;

    this.ctx.fill();
    this.ctx.closePath();
  }

  GameUI.prototype._drawCoordinate = function(d = 0) {
    //this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "black";
    this.ctx.font = "10px Verdana";
    for (var i = 1; i < kCCKR_LEN; i++) {
      var x = in2x(i, d),
        y = in2y(i, d);
      var txt = "" + x + "," + y;
      var meta = this.ctx.measureText(txt);
      var px = in2x(i),
        py = in2y(i);
      px = norm2x(px, py) * this._screenScale + this.offset[0] - meta
        .width /
        2;
      py = norm2y(py) * this._screenScale + this.offset[1] + 5;
      this.ctx.beginPath();
      this.ctx.fillText(txt, px, py);
      this.ctx.closePath();
    }
  }

  GameUI.prototype.drawBoard = function() {
    this.ctx.lineWidth = 1 / this._screenScale;

    this._drawNestTriangles();
    this._drawLinks();
    this._drawPits();
  }


  var g_ui;

  exports['setUp'] = function(canvas) {
    g_ui = new GameUI(canvas);
    g_ui.refresh();
  }

  function test() {
    for (var x = 0; x < 16; ++x) {
      for (var y = 0; y < 13; ++y) {
        var i = xy2i(x, y);
        var ox = in2x(i);
        var oy = in2y(i);
        if (i == 0) {
          continue;
        }

        if (x != ox)
          console.error(i, x, y, x, ox);

        if (y != oy)
          console.error(i, x, y, y, oy);

      }
    }
  }

  test();
})();
