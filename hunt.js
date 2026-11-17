/* Kido's Treasure Hunt (v5c, 12 Nov 2026). The child finds every picture that fits the rule in Kido's bubble. A full basket
   is a finished board: star, then a new board. The toggle is a separate choice that belongs to the child: it switches the
   whole game between "by colour" and "by kind" at any moment and never stands between the child and the next star.
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
  function layout() {
    // try every sensible column count and keep the one that gives the biggest cards
    var L = LV[lv], r = board.getBoundingClientRect(), cs = getComputedStyle(board), gap = Math.max(8, Math.min(16, r.width * 0.02));
    var availH = r.height - parseFloat(cs.paddingBottom) - parseFloat(cs.paddingTop) - 8, availW = r.width - 8, best = 0, bestCols = L.cols;
    [2, 3, 4, 6].forEach(function (cols) { if (cols > L.n) return; var rows = Math.ceil(L.n / cols), t = Math.floor(Math.min((availW - gap * (cols - 1)) / cols, (availH - gap * (rows - 1)) / rows)); if (t > best) { best = t; bestCols = cols; } });
    best = Math.max(64, Math.min(best, 190));
    board.style.setProperty("--tile", best + "px"); board.style.setProperty("--gap", gap + "px"); board.style.gridTemplateColumns = "repeat(" + bestCols + ", " + best + "px)";
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
    basket.innerHTML = s; basket.setAttribute("aria-label", "Basket: " + got + " of " + want.length);
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
  toggle.innerHTML = "<i>" + A.icon("palette") + "</i><i>" + A.icon("things") + "</i>";

  KP.init({
    title: "For grown-ups: Kido's Treasure Hunt",
    howto: "Help Kido find everything that matches his bubble and fill the basket. Flip the switch to play by color or by shape. Need a hint? Look for the glowing frame.",
    howtoShort: "Help Kido find everything that matches his bubble. Flip the switch to play by color or by shape.",
    about: "<p>Your child finds every picture that fits the rule in Kido's bubble, and the rule changes with every board. The switch at the top is your child's own choice: it turns the game from <b>by color</b> to <b>by shape</b> and back, at any moment, on the same pictures. Looking at one thing in two ways is <b>flexible thinking</b>, a core executive-function skill that supports learning at school. Searching a busy board builds <b>focused attention</b>, and the basket invites <b>counting</b>.</p><h3>Play it at home</h3><p>\"I spy three blue things.\" Then switch: \"Now three things with wheels.\" Take turns choosing the rule.</p>",
    onStart: function () { boardNo = 0; firstBoard = true; flipped = false; mode = "color"; if (KP.level() === "hard") lv = 2; else if (KP.level() === "easy" || !started) { lv = 0; smooth = 0; } started = true; order = shuffle([0, 1, 2, 3, 4]); newBoard(); },
    onLevel: function (l) { lv = l === "hard" ? 2 : l === "easy" ? 0 : lv; },
    onIdle: hint,
    practice: "Today: looking closely, and seeing the same things in two ways (by color, by kind)."
  });
})();
