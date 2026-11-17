/* Kido Builds (v5c, 12 Nov 2026) – re-specified with Sivan after the first build failed.
   One rule for the whole game: a place in the picture glows, and the child taps the shape that belongs there; it flies in.
   Every open place is always drawn on top of what is already built, so nothing waiting can hide. There is no silhouette level
   and no "tap, then tap a place". Difficulty never changes how you play: it only adds pieces and makes the shapes in the tray
   more alike (level 1: different kinds of shape; level 2: same kind, other size or direction; level 3: four to choose from).
   The tray always offers 3 shapes (4 on level 3), never two that look alike. First come shapes still missing from this picture; if those
   run out, shapes already placed in it; only if still short, shapes from other pictures that look like nothing in this one.
   Choosing any of these extras is an ordinary miss (wobble, soft sound). (Sivan, 15 Nov.) Based on the shape-composition
   trajectory of Clements & Sarama. */
(function () {
  "use strict";
  var A = KDArt, $ = function (id) { return document.getElementById(id); };
  // Drawing rules for these pictures (Sivan, 12 Nov): thin contour so lines do not clump; pieces either overlap clearly
  // (the upper one is listed later) or keep at least 12 units of air; nothing closer than 14 units to the page edge;
  // a piece inside another one stays 4 units or more away from its edge.
  var PICS = [
    { name: "house", move: "jump", p: [["square", 52, 80, 96, 76, "yellow"], ["tri", 36, 22, 128, 62, "red", "up"], ["rect", 106, 106, 28, 46, "blue"], ["square", 64, 96, 28, 28, "blue"], ["circle", 156, 14, 30, 30, "orange"]] },
    { name: "car", move: "drive", p: [["half", 50, 40, 100, 50, "red", "up"], ["rect", 18, 84, 164, 40, "red"], ["circle", 36, 104, 40, 40, "blue"], ["circle", 124, 104, 40, 40, "blue"], ["square", 87, 54, 26, 26, "yellow"]] },
    { name: "boat", move: "bob", p: [["rect", 95, 22, 10, 92, "orange"], ["half", 24, 106, 152, 50, "blue", "down"], ["tri", 114, 26, 54, 72, "yellow", "right"], ["tri", 36, 46, 48, 52, "red", "left"]] },
    { name: "rocket", move: "launch", p: [["tri", 80, 124, 40, 32, "orange", "down"], ["tri", 44, 86, 46, 46, "red", "up"], ["tri", 110, 86, 46, 46, "red", "up"], ["rect", 76, 46, 48, 84, "blue"], ["tri", 70, 12, 60, 40, "red", "up"], ["circle", 86, 60, 28, 28, "yellow"]] },
    { name: "train", move: "drive", p: [["rect", 34, 48, 22, 40, "blue"], ["rect", 16, 82, 112, 46, "green"], ["rect", 120, 44, 64, 84, "red"], ["circle", 24, 112, 36, 36, "yellow"], ["circle", 72, 112, 36, 36, "yellow"], ["circle", 134, 112, 36, 36, "yellow"], ["square", 138, 58, 28, 28, "blue"]] },
    { name: "castle", move: "jump", p: [["rect", 18, 58, 40, 98, "orange"], ["rect", 142, 58, 40, 98, "orange"], ["rect", 52, 82, 96, 74, "yellow"], ["tri", 12, 16, 52, 46, "red", "up"], ["tri", 136, 16, 52, 46, "red", "up"], ["half", 82, 112, 36, 40, "blue", "up"]] },
    { name: "fish", move: "bob", p: [["tri", 116, 48, 62, 84, "yellow", "left"], ["half", 52, 28, 60, 34, "yellow", "up"], ["oval", 22, 48, 114, 84, "orange"], ["circle", 42, 70, 20, 20, "blue"], ["tri", 76, 88, 30, 26, "yellow", "right"]] },
    { name: "ice cream", move: "jump", p: [["tri", 64, 90, 72, 66, "orange", "down"], ["circle", 52, 46, 54, 54, "red"], ["circle", 94, 46, 54, 54, "yellow"], ["circle", 73, 14, 54, 54, "blue"]] }
  ];
  var order = [], n = 0, lv = 0, smooth = 0, pic, step = 0, filled = [], misses = 0, picMisses = 0, busy = false, first = true, opts = [], started = false;   // started: on Auto, Play again keeps the level reached in this visit
  var svg = $("canvas"), tray = $("tray"), live = $("live");
  var NAMES = { tri: "triangle", half: "half circle", rect: "rectangle", square: "square", circle: "circle", oval: "oval" };

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function shape(p, x, y, w, h) { // element markup for a piece, optionally re-boxed
    var t = p[0], d = p[6]; x = x === undefined ? p[1] : x; y = y === undefined ? p[2] : y; w = w || p[3]; h = h || p[4];
    if (t === "circle" || t === "oval") return 'ellipse cx="' + (x + w / 2) + '" cy="' + (y + h / 2) + '" rx="' + w / 2 + '" ry="' + h / 2 + '"';
    if (t === "square" || t === "rect") return 'rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5"';
    if (t === "tri") return 'path d="' + (d === "down" ? "M" + x + " " + y + "H" + (x + w) + "L" + (x + w / 2) + " " + (y + h) : d === "left" ? "M" + (x + w) + " " + y + "V" + (y + h) + "L" + x + " " + (y + h / 2) : d === "right" ? "M" + x + " " + y + "V" + (y + h) + "L" + (x + w) + " " + (y + h / 2) : "M" + (x + w / 2) + " " + y + "L" + (x + w) + " " + (y + h) + "H" + x) + 'Z"';
    return 'path d="' + (d === "down" ? "M" + x + " " + y + "H" + (x + w) + "A" + w / 2 + " " + h + " 0 0 1 " + x + " " + y : "M" + x + " " + (y + h) + "A" + w / 2 + " " + h + " 0 0 1 " + (x + w) + " " + (y + h)) + 'Z"';
  }
  function drawn(p) { return A.B(p[5], shape(p)).replace('stroke-width="13"', 'stroke-width="7"') + A.H(p[1] + p[3] * 0.3, p[2] + p[4] * (p[0] === "tri" && p[6] !== "down" ? 0.62 : 0.26), Math.max(3, p[3] * 0.09), Math.max(2, p[4] * 0.05), -25); }
  function tile(p) { // the piece alone, fitted in a 120 box, for the tray and for flying
    var s = 96 / Math.max(p[3], p[4]), w = p[3] * s, h = p[4] * s, q = p.slice(); q[1] = 60 - w / 2; q[2] = 60 - h / 2; q[3] = w; q[4] = h; return A.svg(drawn(q)); }
  // how a piece looks in the tray: every tile is scaled to the same box, so size does not show, only kind, direction and
  // proportions (a square looks like a rect, a circle like an oval). Two tray shapes must never look alike. (review, 15 Nov)
  function look(p) { var t = p[0] === "square" ? "rect" : p[0] === "circle" ? "oval" : p[0]; return t + (p[6] || "") + Math.round(p[3] / p[4] * 5); }
  function same(a, b) { return a[0] === b[0] && (a[6] || "") === (b[6] || "") && Math.abs(a[3] - b[3]) < 6 && Math.abs(a[4] - b[4]) < 6; }
  function render() {
    // built pieces first, then the glowing place, then the dashed outlines of every other open place on top, so no waiting place is ever covered
    var h = '<g id="art">';
    pic.p.forEach(function (p, i) { if (filled[i]) h += '<g class="piece' + (filled[i] === 2 ? "" : " old") + '">' + drawn(p) + "</g>"; });
    if (step < pic.p.length) h += "<" + shape(pic.p[step]) + ' class="gap now"/>';
    pic.p.forEach(function (p, i) { if (!filled[i] && i !== step) h += "<" + shape(p) + ' class="gap"/>'; });
    svg.innerHTML = h + "</g>"; pic.p.forEach(function (p, i) { if (filled[i] === 2) filled[i] = 1; });
    [].forEach.call(svg.querySelectorAll(".old"), function (g) { g.style.animation = "none"; });
  }
  function fillTray() {
    var need = pic.p[step], size = lv === 2 ? 4 : 3, h = "", picked = [];
    function fresh(p) { return look(p) !== look(need) && !picked.some(function (r) { return look(r) === look(p); }); }
    // level 1 prefers other kinds of shape; levels 2 and 3 prefer the same kind in another size or direction
    function pref(a, b) { var x = a[0] === need[0] ? 1 : 0, y = b[0] === need[0] ? 1 : 0; return lv === 0 ? x - y : y - x; }
    function take(list) { shuffle(list).sort(pref).forEach(function (p) { if (picked.length < size - 1 && fresh(p)) picked.push(p); }); }
    take(pic.p.filter(function (p, i) { return !filled[i] && i !== step; }));          // 1. still missing from this picture
    take(pic.p.filter(function (p, i) { return filled[i]; }));                          // 2. already placed in this picture
    if (picked.length < size - 1) {                                                     // 3. from other pictures, unlike anything here
      var other = []; PICS.forEach(function (q) { if (q !== pic) q.p.forEach(function (p) { if (!pic.p.some(function (r) { return same(r, p); })) other.push(p); }); });
      take(other);
    }
    opts = shuffle([need].concat(picked));
    opts.forEach(function (o, k) { h += '<button type="button" style="animation-delay:' + k * 60 + 'ms" data-k="' + k + '" aria-label="' + o[5] + " " + NAMES[o[0]] + '">' + tile(o) + "</button>"; });
    tray.innerHTML = h; live.textContent = "Building a " + pic.name + ". Which shape fits the glowing place?";
  }
  function slotRect(i) { var p = pic.p[i], m = svg.getScreenCTM(); return { left: m.e + p[1] * m.a, top: m.f + p[2] * m.d, width: p[3] * m.a, height: p[4] * m.d }; }
  function hint() { if (busy) return; var k = opts.indexOf(pic.p[step]); if (k > -1 && tray.children[k]) { tray.children[k].classList.add("glow"); KP.hand(tray.children[k]); } }
  function pickTray(btn) {
    if (busy) return; var o = opts[+btn.dataset.k], i = step;
    if (!same(o, pic.p[i])) { misses++; picMisses++; KP.sfx.no(); KP.kido("nope"); btn.classList.remove("wob"); void btn.offsetWidth; btn.classList.add("wob"); if (misses >= 2) hint(); return; }
    var from = btn.querySelector("svg").getBoundingClientRect(), to = slotRect(i), s = Math.max(to.width, to.height) * 120 / 96; busy = true; KP.hideHand();
    to = { left: to.left + to.width / 2 - s / 2, top: to.top + to.height / 2 - s / 2, width: s, height: s }; btn.style.visibility = "hidden"; KP.sfx.yes(i);
    KP.fly(tile(pic.p[i]), from, to, function () { filled[i] = 2; misses = 0; KP.sparkle(to.left + s / 2, to.top + s / 2);
      step = 0; while (step < pic.p.length && filled[step]) step++;
      render(); if (step >= pic.p.length) { tray.innerHTML = ""; done(); return; } fillTray(); busy = false; });
  }
  function done() {
    KP.sfx.full(); KP.kido("dance"); $("art").classList.add("alive", pic.move); live.textContent = "You built a " + pic.name + "!";
    setTimeout(function () { var s = KP.star(); first = false;
      if (picMisses <= 1) { smooth++; if (smooth >= 2 && KP.level() === "auto" && lv < 2) { lv++; smooth = 0; } } else { smooth = 0; if (picMisses >= 4 && KP.level() === "auto" && lv > 0) lv--; }
      if (s >= 5) { setTimeout(KP.finish, 900); return; } n++; setTimeout(next, 700); }, KP.reduce ? 600 : 2100);
  }
  function next() { pic = PICS[order[n % order.length]]; step = 0; filled = []; misses = 0; picMisses = 0; busy = false; KP.field(n + 3); render(); fillTray(); }

  KP.tap(tray, "button", pickTray);   // a choice counts only when the finger lifts on the same shape it touched
  $("kido").addEventListener("click", function () { KP.kido("hop"); hint(); });

  KP.init({
    title: "For grown-ups: Kido Builds",
    howto: "Help Kido build! Tap the shape that fits the blinking spot, and watch the picture come alive.",
    howtoShort: "Help Kido build! Tap the shape that fits the blinking spot.",
    about: "<p>Your child builds a picture out of simple shapes. One place in the picture glows, and your child chooses the shape that belongs there. As the game goes on there are more pieces, and the shapes to choose from look more alike: a big and a small triangle, a tall and a wide rectangle. Seeing how small shapes make a bigger one is <b>spatial thinking</b>, one of the strongest early foundations for math.</p><h3>Play it at home</h3><p>Cut a circle, a square and a few triangles from paper. What can you build together? Name the shapes as you go.</p>",
    onStart: function () { n = 0; first = true; if (KP.level() === "hard") lv = 2; else if (KP.level() === "easy" || !started) { lv = 0; smooth = 0; } started = true; order = shuffle([0, 1, 2, 3, 4, 5, 6, 7]); next(); },
    onLevel: function (l) { if (l !== "auto") { lv = l === "hard" ? 2 : 0; if (pic && !busy) fillTray(); } },
    onIdle: hint,
    practice: "Today: putting shapes together to make a bigger picture, an early building block of math."
  });
})();
