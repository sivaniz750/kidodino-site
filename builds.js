/* Kido Builds — choose the shape that fits each gap in a silhouette.
   Think-and-choose: pick a piece, then the gap it fits. Big builders also rotate pieces.
   Shapes live in a 100x100 box per slot; each slot has its own place on a 400x300 board. */
(function () {
  var board = document.getElementById("board");
  var C = { sun: "#FFC73A", azure: "#02A9F7", berry: "#E96FA3", teal: "#19B3A6", grape: "#6040B0", green: "#8CC84B" };
  // shape outlines in a 0..100 box (rot rotates around the center)
  var SHAPES = {
    square: '<rect x="8" y="8" width="84" height="84" rx="6"/>',
    rect: '<rect x="4" y="26" width="92" height="48" rx="6"/>',
    tri: '<polygon points="50,8 94,90 6,90"/>',
    circle: '<circle cx="50" cy="50" r="42"/>',
    semi: '<path d="M6 34 A44 44 0 0 0 94 34 Z"/>'
  };
  var NAMES = { square: "square", rect: "rectangle", tri: "triangle", circle: "circle", semi: "half circle" };
  // levels: slots {s: shape, x, y, w, h (board units), r: rotation, c: color}, decoys, rotate (big builders)
  var LEVELS = [
    { name: "a house", done: "Home sweet home!", slots: [{ s: "square", x: 140, y: 140, w: 120, h: 120, c: C.azure }, { s: "tri", x: 120, y: 40, w: 160, h: 110, c: C.berry }] },
    { name: "a truck", done: "Vroom! The truck drives!", anim: "drive", slots: [
      { s: "rect", x: 60, y: 90, w: 190, h: 150, c: C.sun }, { s: "square", x: 250, y: 120, w: 90, h: 90, c: C.azure },
      { s: "circle", x: 85, y: 205, w: 70, h: 70, c: C.grape }, { s: "circle", x: 255, y: 205, w: 70, h: 70, c: C.grape }] },
    { name: "a rocket", done: "3, 2, 1… blast off!", anim: "launch", decoys: ["square"], slots: [
      { s: "tri", x: 160, y: 10, w: 80, h: 70, c: C.berry }, { s: "rect", x: 140, y: 80, w: 120, h: 160, r: 90, c: C.azure },
      { s: "circle", x: 175, y: 115, w: 50, h: 50, c: C.sun }, { s: "tri", x: 95, y: 190, w: 60, h: 80, c: C.teal }, { s: "tri", x: 245, y: 190, w: 60, h: 80, c: C.teal }] },
    { name: "a boat", done: "The boat sails away!", anim: "drive", big: true, decoys: ["circle"], slots: [
      { s: "semi", x: 70, y: 160, w: 260, h: 150, c: C.grape }, { s: "rect", x: 150, y: 40, w: 160, h: 30, r: 90, c: C.sun },
      { s: "tri", x: 200, y: 50, w: 110, h: 120, r: 90, c: C.berry }] }
  ];

  function svgShape(s, r, fill, stroke, dash) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g transform="rotate(' + (r || 0) + ' 50 50)" fill="' + fill + '" stroke="' + stroke +
      '" stroke-width="4" ' + (dash ? 'stroke-dasharray="8 6"' : "") + ' vector-effect="non-scaling-stroke">' + SHAPES[s] + "</g></svg>";
  }

  var level = 0, big = false, list = [], pieces = [], picked = null, placed = 0, tries = 0;

  function begin(choice) { big = choice === 1; list = big ? LEVELS : LEVELS.slice(0, 3); level = 0; build(); }

  function build() {
    var L = list[level]; placed = 0; picked = null; tries = 0;
    KG.steps(level, list.length);
    // pieces: one per slot (+ decoys); big builders get pieces turned the wrong way
    pieces = L.slots.map(function (sl, i) { return { id: i, s: sl.s, r: sl.r || 0, c: sl.c, cur: (big && (sl.s === "tri" || sl.s === "rect" || sl.s === "semi")) ? ((sl.r || 0) + 90) % 360 : (sl.r || 0) }; });
    (L.decoys || []).forEach(function (d, i) { pieces.push({ id: "d" + i, s: d, r: 0, c: C.green, cur: 0, decoy: true }); });
    pieces = KG.shuffle(pieces);
    var h = '<div class="build-area"><div class="build-board" id="bb" role="group" aria-label="Kido\'s ' + L.name.replace("a ", "") + ' outline">';
    L.slots.forEach(function (sl, i) {
      h += '<button type="button" class="slot" data-i="' + i + '" style="left:' + (sl.x / 4) + '%;top:' + (sl.y / 3) + '%;width:' + (sl.w / 4) + '%;height:' + (sl.h / 3) + '%" aria-label="Empty gap: ' + NAMES[sl.s] + ' shape">' +
        svgShape(sl.s, sl.r, "transparent", "currentColor", true) + "</button>";
    });
    h += '</div><div class="tray" role="group" aria-label="Shapes to choose from">';
    pieces.forEach(function (p) { h += '<button type="button" class="piece" data-id="' + p.id + '" aria-label="' + NAMES[p.s] + '">' + svgShape(p.s, p.cur, p.c, "#2B2D5C") + "</button>"; });
    h += '</div>' + (big ? '<button type="button" class="icon-btn rotate-btn" id="rot" disabled><span aria-hidden="true">↻</span> Turn the shape</button>' : "") + "</div>";
    board.innerHTML = h;
    board.querySelectorAll(".piece").forEach(function (b) { b.addEventListener("click", function () { pick(b); }); });
    board.querySelectorAll(".slot").forEach(function (b) { b.addEventListener("click", function () { place(b); }); });
    var rot = document.getElementById("rot"); if (rot) rot.addEventListener("click", turn);
    KG.say("Let's build " + L.name + "! First, tap a shape. Then tap the gap where it fits.");
    KG.focus(board.querySelector(".piece"));
  }

  function find(id) { return pieces.filter(function (p) { return String(p.id) === String(id); })[0]; }

  function pick(b) {
    board.querySelectorAll(".piece").forEach(function (x) { x.classList.remove("picked"); x.setAttribute("aria-pressed", "false"); });
    b.classList.add("picked"); b.setAttribute("aria-pressed", "true");
    picked = find(b.dataset.id);
    var rot = document.getElementById("rot"); if (rot) rot.disabled = false;
    KG.say("A " + NAMES[picked.s] + "! Where does it fit?");
  }

  function turn() {
    if (!picked) return;
    picked.cur = (picked.cur + 90) % 360;
    var b = board.querySelector('.piece[data-id="' + picked.id + '"]');
    b.innerHTML = svgShape(picked.s, picked.cur, picked.c, "#2B2D5C");
    KG.say("Turned!", true);
  }

  function same(a, b, s) { // rotation equality allowing shape symmetry
    var d = ((a - b) % 360 + 360) % 360;
    if (s === "circle" || s === "square") return true;
    if (s === "rect") return d % 180 === 0;
    return d === 0;
  }

  function place(slotBtn) {
    var sl = list[level].slots[+slotBtn.dataset.i];
    if (slotBtn.classList.contains("filled")) return;
    if (!picked) { KG.say("First tap a shape from the bottom."); KG.flash(board.querySelector(".tray"), "shake"); return; }
    if (picked.s !== sl.s) {
      tries++;
      KG.flash(slotBtn, "shake");
      KG.say(tries > 1 ? "This gap needs a " + NAMES[sl.s] + ". Can you find it?" : "Hmm, that shape doesn't fit here. Look at the corners!");
      return;
    }
    if (!same(picked.cur, sl.r || 0, sl.s)) { KG.flash(slotBtn, "shake"); KG.say("Right shape! Now turn it so it fits."); return; }
    slotBtn.classList.add("filled"); slotBtn.innerHTML = svgShape(sl.s, sl.r, sl.c, "#2B2D5C"); slotBtn.setAttribute("aria-label", NAMES[sl.s] + " placed");
    KG.flash(slotBtn, "pop");
    var pb = board.querySelector('.piece[data-id="' + picked.id + '"]'); pb.disabled = true; pb.classList.remove("picked"); pb.classList.add("used");
    picked = null; placed++; tries = 0;
    var rot = document.getElementById("rot"); if (rot) rot.disabled = true;
    if (placed === list[level].slots.length) return complete();
    KG.say(KG.praise() + " What's next?");
    KG.focus(board.querySelector(".piece:not([disabled])"));
  }

  function complete() {
    var L = list[level];
    var bb = document.getElementById("bb");
    if (!KG.reduce && L.anim) bb.classList.add(L.anim);
    KG.hop();
    KG.say(L.done);
    setTimeout(function () {
      level++;
      if (level < list.length) return build();
      KG.finish(board, {
        title: "You built them all!", total: list.length,
        say: "You built them all! You are a great builder!",
        skill: "Spatial thinking: seeing how shapes fit together" + (big ? " and turning them in the mind" : "") + ". Spatial skills like these are linked to later math learning.",
        ask: "Look around the room together. Which things are made of circles? Of rectangles?",
        again: function () { begin(big ? 1 : 0); }
      });
    }, KG.reduce ? 900 : 1700);
  }

  KG.start(board, {
    intro: "Kido has shapes, and lots of ideas. Who is building today?",
    say: "Hi! I love to build. Choose your builder!",
    levels: [{ icon: "🧱", label: "Little builder (3–4)" }, { icon: "🏗️", label: "Big builder (5–6)" }]
  }, begin);
})();
