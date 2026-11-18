/* Kido's Treasure Hunt (v5c, 12 Nov 2026). The child finds every picture that fits the rule in Kido's bubble. A full basket
   is a finished board: star, then a new board. The toggle is a separate choice that belongs to the child: it switches the
   whole game between "by colour" and "by shape" at any moment and never stands between the child and the next star.
   Now and then it wiggles for a second to say "there is another way to play"; ignoring it costs nothing. (Sivan, 12 Nov.) */
(function () {
  "use strict";
  var A = KDArt, $ = function (id) { return document.getElementById(id); };
  var THEMES = [A.FAMILIES.toys, A.FAMILIES.sea, A.FAMILIES.garden, A.FAMILIES.home, A.FAMILIES.food.concat(A.FAMILIES.toys.slice(0, 6))];
  // level: tiles, columns (landscape), kinds on the board, colours on the board
  var LV = [{ n: 6, cols: 3, kinds: 3, colors: ["red", "blue", "yellow", "green"], nc: 3 }, { n: 9, cols: 3, kinds: 4, colors: ["red", "blue", "yellow", "green"], nc: 4 },
    { n: 12, cols: 4, kinds: 5, colors: ["red", "blue", "yellow", "green", "orange", "purple"], nc: 5 }];
  var MOVES = ["hop", "wig", "dance", "hop"];
  var lv = 0, smooth = 0, boardNo = 0, tiles = [], mode = "color", target = {}, want = [], got = 0, misses = 0, boardMisses = 0, busy = false, firstBoard = true, flipped = false, order = [0, 1, 2, 3, 4], started = false;   // started: on Auto, Play again keeps the level reached in this visit
  var board = $("board"), basket = $("basket"), toggle = $("toggle"), bubbles = [$("rule")], live = $("live");

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function count(key, val) { return tiles.filter(function (t) { return t[key] === val; }).length; }
  function makeBoard() {
    var L = LV[lv], pool = THEMES[order[boardNo % order.length]], tries, kinds, cols, b, seen, k, c, key, ok, tc, tk;
    for (tries = 0; tries < 400; tries++) {
      kinds = shuffle(pool.slice()).slice(0, L.kinds); cols = shuffle(L.colors.slice()).slice(0, L.nc); b = []; seen = {};
      while (b.length < L.n) { k = kinds[Math.floor(Math.random() * kinds.length)]; c = cols[Math.floor(Math.random() * cols.length)]; key = k + c; if (seen[key]) { if (Object.keys(seen).length >= kinds.length * cols.length) break; continue; } seen[key] = 1; b.push({ kind: k, color: c }); }
      tiles = b; if (b.length < L.n) continue;
      tc = cols.filter(function (x) { var n = count("color", x); return n >= 2 && n <= 4; }); tk = kinds.filter(function (x) { var n = count("kind", x); return n >= 2 && n <= 4; });
      ok = tc.length && tk.length; if (ok) { target = { color: tc[0], kind: tk[0] }; return; }
    }
    // fallback (rare): never leave a short board. Build a full one from every kind x colour pair, then pick the targets
    // whose count comes closest to 2-4 matches.
    if (tiles.length < L.n) { b = []; kinds.forEach(function (k) { cols.forEach(function (c) { b.push({ kind: k, color: c }); }); }); tiles = shuffle(b).slice(0, L.n); }
    function best(key, list) { return list.slice().sort(function (x, y) { var a = count(key, x), z = count(key, y), da = a < 2 ? 2 - a : a > 4 ? a - 4 : 0, dz = z < 2 ? 2 - z : z > 4 ? z - 4 : 0; return da - dz; })[0]; }
    target = { color: best("color", cols), kind: best("kind", kinds) };
  }
  // Card layout – the rule (Sivan, 18 Nov 2026):
  //  1. Never sideways: the board keeps its inner padding from the screen edges, and cards break into another row by width.
  //  2. Everything fits the phone's screen without scrolling while there is any way to do it.
  //  3. A card is 64px or bigger. To fit, it may shrink, but never below FLOOR (52px, about 80%).
  //  4. Full rows first (9 cards = 3 x 3, 12 = 4 x 3) on every screen. If full rows at FLOOR size fit only when the
  //     grown-ups' How to play line moves below the screen, that is what we do: every card stays on screen (option B).
  //  5. Otherwise the biggest card that fits; only if nothing fits even at FLOOR does the page scroll down. Never sideways.
  // (Israel, 17 Nov: on his iPhone the cards ran off both edges.)
  var GOOD = 64, FLOOR = 52;
  function layout() {
    var L = LV[lv], stage = board.parentNode.parentNode;
    stage.classList.remove("tall"); board.style.height = "";              // measure the room the screen really has
    var r = board.getBoundingClientRect(), gap = r.width < 600 ? 12 : 16, availW = r.width - 8, availH = r.height - 4;
    var availVis = innerHeight - r.top - 12;                                // down to the bottom of the screen, under the How to play line
    var maxCols = Math.max(2, Math.min(L.n, Math.floor((availW + gap) / (FLOOR + gap)))), cand = [], cols, rows, full, ok, pick;
    for (cols = 2; cols <= maxCols; cols++) { rows = Math.ceil(L.n / cols);
      cand.push({ cols: cols, rows: rows, empty: rows * cols - L.n, tw: Math.floor((availW - gap * (cols - 1)) / cols),
        th: Math.floor((availH - gap * (rows - 1)) / rows), tv: Math.floor((availVis - gap * (rows - 1)) / rows) }); }
    cand.forEach(function (c) { c.t = Math.min(c.tw, c.th, 190); });
    full = cand.filter(function (c) { return c.empty === 0; });
    ok = cand.filter(function (c) { return c.t >= FLOOR; });
    pick = full.filter(function (c) { return c.t >= FLOOR; }).sort(function (x, y) { return y.t - x.t; })[0];     // full rows, no scroll
    if (!pick || pick.t < GOOD) {
      var vis = full.filter(function (c) { return c.t < FLOOR && Math.min(c.tw, c.tv) >= FLOOR; }).sort(function (x, y) { return x.rows - y.rows; })[0];
      if (!pick && vis) { pick = vis; pick.t = FLOOR; }                     // full rows at FLOOR, How to play below the screen
    }
    if (!pick && ok.length) pick = ok.sort(function (x, y) { return y.t - x.t || x.empty - y.empty; })[0];
    if (!pick) { pick = cand.slice().sort(function (x, y) { return x.empty - y.empty || x.rows - y.rows; })[0]; pick.t = Math.min(FLOOR, pick.tw); }
    board.style.setProperty("--tile", pick.t + "px"); board.style.setProperty("--gap", gap + "px"); board.style.gridTemplateColumns = "repeat(" + pick.cols + ", " + pick.t + "px)";
    var need = pick.rows * pick.t + gap * (pick.rows - 1) + 4;
    if (need > r.height + 1) { stage.classList.add("tall"); board.style.height = need + "px"; }
  }
  function fits(t) { return t[mode] === target[mode]; }
  function label(t) { return t.color + " " + t.kind; }
  function drawBoard() {
    var h = ""; tiles.forEach(function (t, i) { h += '<button type="button" class="card" style="animation-delay:' + i * 45 + 'ms" data-i="' + i + '" aria-label="' + label(t) + '">' + A.thing(t.kind, t.color) + "</button>"; });
    board.innerHTML = h; layout();
  }
  function setField() { KP.field(boardNo); }
  // kept: tiles already in the basket that also fit the rule (after a switch); a new board starts with none
  function startRound(kept) {
    kept = kept || []; busy = false; got = kept.length; misses = 0; want = tiles.filter(fits);
    [].forEach.call(board.children, function (c, i) { c.classList.remove("glow"); if (kept.indexOf(i) < 0) { c.classList.remove("gone"); c.disabled = false; } });
    var rule = mode === "color" ? A.splat(target.color) : A.silhouette(target.kind);
    bubbles.forEach(function (b) { b.innerHTML = rule; b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); });
    var s = ""; want.forEach(function (w, j) { s += j < got ? '<span class="slot full">' + A.thing(tiles[kept[j]].kind, tiles[kept[j]].color) + "</span>" : '<span class="slot"></span>'; });
    basket.innerHTML = s; basket.setAttribute("aria-label", "Basket: " + got + " of " + want.length); layout();   // the basket can grow a row, which takes room from the board
    toggle.setAttribute("aria-checked", String(mode === "kind"));
    live.textContent = mode === "color" ? "Find everything " + target.color + ". " + (want.length - got) + " to find." : "Find every " + target.kind + ", in any color. " + (want.length - got) + " to find.";
    if (got && got === want.length) { busy = true; roundDone(); }
  }
  function hint() { if (busy) return; var i, c; for (i = 0; i < tiles.length; i++) { c = board.children[i]; if (fits(tiles[i]) && !c.classList.contains("gone")) { KP.hand(c); return; } } }
  // a short, rare invitation: the toggle wiggles once after the second and fourth star if the child has never used it
  function nudge() { if (flipped || KP.reduce) return; toggle.classList.remove("nudge"); void toggle.offsetWidth; toggle.classList.add("nudge"); }
  function newBoard() { boardMisses = 0; setField(); makeBoard(); drawBoard(); startRound(); if (KP.stars() === 2 || KP.stars() === 4) setTimeout(nudge, 1400); }
  function pick(card) {
    if (busy || card.classList.contains("gone")) return; var t = tiles[+card.dataset.i], r = card.getBoundingClientRect();
    if (!fits(t)) { misses++; boardMisses++; KP.sfx.no(); card.classList.remove("wob"); void card.offsetWidth; card.classList.add("wob"); KP.kido("nope");
      bubbles.forEach(function (b) { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); });
      if (misses >= 2) [].forEach.call(board.children, function (c, i) { if (fits(tiles[i]) && !c.classList.contains("gone")) c.classList.add("glow"); });
      return; }
    var slot = basket.children[got], sr = slot.getBoundingClientRect(), svg = card.querySelector("svg"), fr = svg.getBoundingClientRect(), html = A.thing(t.kind, t.color);
    card.classList.add("gone"); card.classList.remove("glow"); card.disabled = true; KP.sfx.yes(got); KP.sparkle(r.left + r.width / 2, r.top + r.height / 2); got++;
    basket.setAttribute("aria-label", "Basket: " + got + " of " + want.length);
    var last = got === want.length; if (last) busy = true;
    KP.fly(html, fr, sr, function () { slot.innerHTML = html; slot.classList.add("full"); if (last) roundDone(); });
  }
  function roundDone() {
    KP.sfx.full(); KP.kido(MOVES[boardNo % MOVES.length]);
    setTimeout(function () { var n = KP.star(); firstBoard = false;
      if (boardMisses <= 1) { smooth++; if (smooth >= 2 && KP.level() === "auto" && lv < 2) { lv++; smooth = 0; } } else { smooth = 0; if (boardMisses >= 4 && KP.level() === "auto" && lv > 0) lv--; }
      if (n >= 5) { setTimeout(KP.finish, 900); return; } boardNo++; setTimeout(newBoard, 1100); }, 600);
  }
  // the child's own choice, at any moment: same board, the other way of looking at it
  function flip() { if (busy) return; flipped = true; toggle.classList.remove("nudge"); KP.hideHand(); KP.sfx.swap(); mode = mode === "color" ? "kind" : "color";
    // keep in the basket what fits the new rule too; only the rest goes back to the board (Sivan, 15 Nov)
    var kept = []; [].forEach.call(board.children, function (c, i) { if (c.classList.contains("gone") && fits(tiles[i])) kept.push(i); });
    startRound(kept); }

  KP.tap(board, ".card", pick);      // a choice counts only when the finger lifts on the same card it touched
  KP.tap(toggle, ".toggle", flip);
  $("kido").addEventListener("click", function () { KP.kido("hop"); hint(); });
  addEventListener("resize", layout);
  // the How to play line and the phone's browser bars change the room after the first layout
  if (window.ResizeObserver) { var seen = ""; new ResizeObserver(function () { var how = document.querySelector(".howto"), k = innerWidth + "x" + innerHeight + "x" + (how ? how.offsetHeight : 0); if (k !== seen) { seen = k; if (tiles.length) layout(); } }).observe(document.body); }
  toggle.innerHTML = "<i>" + A.icon("palette") + "</i><i>" + A.icon("things") + "</i>";

  KP.init({
    title: "For grown-ups: Kido's Treasure Hunt",
    howto: "Help Kido find everything that matches his bubble and fill the basket. Flip the switch to play by color or by shape. Need a hint? Look for the glowing frame.",
    howtoShort: "Help Kido find everything that matches his bubble. Flip the switch to play by color or by shape.",
    about: "<p>Your child finds every picture that fits the rule in Kido's bubble, and the rule changes with every board. The switch at the top is your child's own choice: it turns the game from <b>by color</b> to <b>by shape</b> and back, at any moment, on the same pictures. Looking at one thing in two ways is <b>flexible thinking</b>, a core executive-function skill that supports learning at school. Searching a busy board builds <b>focused attention</b>, and the basket invites <b>counting</b>.</p><h3>Play it at home</h3><p>\"I spy three blue things.\" Then switch: \"Now three things with wheels.\" Take turns choosing the rule.</p>",
    onStart: function () { boardNo = 0; firstBoard = true; flipped = false; mode = "color"; if (KP.level() === "hard") lv = 2; else if (KP.level() === "easy" || !started) { lv = 0; smooth = 0; } started = true; order = shuffle([0, 1, 2, 3, 4]); newBoard(); },
    onLevel: function (l) { lv = l === "hard" ? 2 : l === "easy" ? 0 : lv; },
    onIdle: hint,
    practice: "Today: looking closely, and seeing the same things in two ways (by color, by shape)."
  });
})();
