/* KidoDino games – shared shell (v5, 12 Nov 2026). Builds the grape band (home, five stars, grown-ups gate), the opening
   cover, the ending and the grown-ups panel, and gives every game the same sounds, hints and helpers.
   No words for the child. No data leaves the device: only sound on/off and the level choice are kept in localStorage. */
(function (g) {
  "use strict";
  var A = g.KDArt, $ = function (s, r) { return (r || document).querySelector(s); };
  var reduce = g.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem("kd-" + k); localStorage.setItem("kd-" + k, v); } catch (e) { return null; } }
  var soundOn = store("sound") !== "off", level = store("level") || "auto", ac = null, cfg = null, stars = 0, idleT = null, handEl = null;

  // ---- sound: soft notes from one pentatonic scale, made in code
  var N = { C: 523.25, D: 587.33, E: 659.25, G: 783.99, A: 880, C2: 1046.5, E2: 1318.5, lo: 261.6, lo2: 220 };
  function tone(notes, dur, type, vol) {
    if (!soundOn) return;
    try { ac = ac || new (g.AudioContext || g.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); var t = ac.currentTime + 0.01;
      notes.forEach(function (f, i) { if (!f) return; var o = ac.createOscillator(), a = ac.createGain(); o.type = type || "sine"; o.frequency.value = f;
        a.gain.setValueAtTime(0.0001, t + i * dur); a.gain.exponentialRampToValueAtTime(vol || 0.16, t + i * dur + 0.02); a.gain.exponentialRampToValueAtTime(0.0001, t + (i + 1) * dur + 0.08);
        o.connect(a).connect(ac.destination); o.start(t + i * dur); o.stop(t + (i + 1) * dur + 0.1); }); } catch (e) {}
  }
  var sfx = {
    tap: function () { tone([N.E], 0.07); }, yes: function (i) { var s = [N.C, N.D, N.E, N.G, N.A, N.C2]; tone([s[(i || 0) % 6], s[((i || 0) + 2) % 6]], 0.09); },
    no: function () { tone([N.lo, N.lo2], 0.12, "triangle", 0.1); }, full: function () { tone([N.C, N.E, N.G, N.C2], 0.11); },
    swap: function () { tone([N.G, N.A, N.G, N.C2], 0.07, "triangle", 0.12); }, star: function () { tone([N.C2, N.E2], 0.14, "sine", 0.14); },
    tune: function () { tone([N.C, N.E, N.G, N.E, N.G, N.C2, 0, N.C2], 0.16, "triangle", 0.14); }
  };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  function build() {
    var stage = $(".stage"), band = el("header", "band");
    band.innerHTML = '<a class="round home" href="./#games" aria-label="Back to all games">' + A.icon("home") + '</a>' +
      '<div class="stars" role="img" aria-label="Stars: 0 of 5"></div>' +
      '<button class="round gate" type="button" aria-label="For grown-ups: press and hold for two seconds">' + A.icon("grownups") + '<svg class="ring" viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="34" pathLength="214"/></svg></button>';
    stage.insertBefore(band, stage.firstChild);
    drawStars();
    // no opening screen: the board is ready and the first touch is the first move (sound wakes up on that touch)
    var end = el("div", "ending"); end.id = "ending"; end.hidden = true;
    end.innerHTML = '<div class="end-card" role="dialog" aria-modal="true" aria-label="Well done! Five stars">' +
      '<div class="end-stars" aria-hidden="true">' + [0, 1, 2, 3, 4].map(function () { return "<span>" + A.icon("star") + "</span>"; }).join("") + "</div>" +
      '<div class="kido dance" aria-hidden="true"><span class="kido-art" data-kido-svg><img src="assets/img/kido-wave-420.png" width="420" height="588" alt=""></span></div>' +
      '<div class="choices"><button class="round big" type="button" id="again" aria-label="Play again">' + A.icon("again") + '</button><a class="round big" href="./#games" aria-label="Back to all games">' + A.icon("home") + "</a></div>" +
      '<p class="end-note">' + (cfg.practice || "") + "</p></div>";
    document.body.appendChild(end);
    $("#again", end).addEventListener("click", function () { end.hidden = true; document.body.classList.remove("done"); stars = 0; drawStars(); cfg.onStart(); });
    var panel = el("section", "panel"); panel.id = "panel"; panel.hidden = true; panel.setAttribute("aria-labelledby", "p-title");
    panel.innerHTML = '<div class="panel-in" role="dialog" aria-modal="true"><h2 id="p-title">' + cfg.title + "</h2>" + cfg.about +
      '<h3>Level</h3><p>On Auto the game gets harder after two smooth boards and easier when your child needs it.</p><div class="seg" role="group" aria-label="Level"><button type="button" data-lv="easy">Easier</button><button type="button" data-lv="auto">Auto</button><button type="button" data-lv="hard">Harder</button></div>' +
      '<h3>Sound</h3><div class="seg"><button type="button" id="snd"></button></div>' +
      '<h3>Good to know</h3><p>There are no words to read or hear, so children play it in any language. No ads, no sign-up, and nothing is saved or sent except your sound and level choice, which stay on this device.</p>' +
      '<div class="seg" style="margin-top:14px"><button type="button" class="btn" id="close">Back to the game</button></div></div>';
    document.body.appendChild(panel);
    function sync() { [].forEach.call(panel.querySelectorAll("[data-lv]"), function (b) { b.setAttribute("aria-pressed", String(b.dataset.lv === level)); });
      var s = $("#snd", panel); s.setAttribute("aria-pressed", String(soundOn)); s.textContent = soundOn ? "Sounds are on" : "Sounds are off"; }
    panel.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) { if (e.target === panel) close(); return; }
      if (b.dataset.lv) { level = b.dataset.lv; store("level", level); if (cfg.onLevel) cfg.onLevel(level); }
      else if (b.id === "snd") { soundOn = !soundOn; store("sound", soundOn ? "on" : "off"); if (soundOn) sfx.yes(0); }
      else if (b.id === "close") { close(); return; } sync(); });
    var gate = $(".gate"), holdT = null;
    function open() { sync(); panel.hidden = false; $("#close", panel).focus(); }
    function close() { panel.hidden = true; gate.focus(); }
    gate.addEventListener("pointerdown", function () { gate.classList.add("holding"); holdT = setTimeout(function () { gate.classList.remove("holding"); open(); }, reduce ? 600 : 2000); });
    ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { gate.addEventListener(ev, function () { clearTimeout(holdT); gate.classList.remove("holding"); }); });
    gate.addEventListener("click", function (e) { if (e.detail === 0) open(); });   // keyboard and screen readers open at once
    gate.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
    document.addEventListener("pointerdown", function () { resetIdle(); }, true);
    document.addEventListener("keydown", function () { resetIdle(); }, true);
  }
  function drawStars() { var h = "", i; for (i = 0; i < 5; i++) h += "<span" + (i === stars - 1 ? ' class="new"' : "") + ">" + A.icon(i < stars ? "star" : "starOff") + "</span>";
    var s = $(".stars"); s.innerHTML = h; s.setAttribute("aria-label", "Stars: " + stars + " of 5"); setTimeout(function () { var n = $(".stars .new"); if (n) n.classList.remove("new"); }, 500); }

  function resetIdle() { clearTimeout(idleT); hideHand(); if (cfg && cfg.onIdle) idleT = setTimeout(function () { if ($("#ending").hidden && $("#panel").hidden) cfg.onIdle(); }, 6000); }
  function hand(target) { hideHand(); if (!target) return; var r = target.getBoundingClientRect(); handEl = el("div", "hand", A.icon("hand")); handEl.setAttribute("aria-hidden", "true");
    handEl.style.left = (r.left + r.width * 0.5 - 32) + "px"; handEl.style.top = Math.max(4, r.top - 70) + "px"; document.body.appendChild(handEl); }
  function hideHand() { if (handEl) { handEl.remove(); handEl = null; } }
  function kido(anim) { var k = $(".side .kido") || $(".kido"); if (!k) return; k.classList.remove("hop", "wig", "dance", "nope"); void k.offsetWidth; k.classList.add(anim); }
  function sparkle(x, y) { var s = el("div", "sparkle", A.icon("star")); s.style.left = x + "px"; s.style.top = y + "px"; document.body.appendChild(s); setTimeout(function () { s.remove(); }, 600); }
  function fly(html, from, to, done) {
    var f = el("div", "flyer", html); f.style.left = from.left + "px"; f.style.top = from.top + "px"; f.style.width = from.width + "px"; f.style.height = from.height + "px"; document.body.appendChild(f);
    var dx = to.left - from.left, dy = to.top - from.top, sc = to.width / from.width;
    if (reduce || !f.animate) { f.remove(); done(); return; }
    f.animate([{ transform: "translate(0,0) scale(1)" }, { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 70) + "px) scale(" + (1 + sc) / 2 * 1.15 + ") rotate(-12deg)", offset: 0.5 }, { transform: "translate(" + dx + "px," + dy + "px) scale(" + sc + ")" }],
      { duration: 480, easing: "ease-in-out" }).onfinish = function () { f.remove(); done(); };
    f.style.transformOrigin = "0 0";
  }
  // the five volume colours of the brand book, each with its tint (stars) and a deeper tone (hills). The order keeps berry and orchid apart.
  var FIELDS = [["#E2F4FE", "#B5E3FC", "#CBEBFD"], ["#FCE9F1", "#F6C6DB", "#F8D9E6"], ["#DDF4F5", "#AFE5E8", "#C6EDEF"], ["#FDEADF", "#F8CFB6", "#FADDCB"], ["#F8E6F6", "#EBC4E7", "#F1D5EE"]];
  var HILLS = ["M0 60Q150 0 300 50T600 40T900 55T1200 30V120H0Z", "M0 50Q75 20 150 50T300 50T450 50T600 50T750 50T900 50T1050 50T1200 50V120H0Z",
    "M0 80Q100 20 220 70Q330 10 470 70Q600 20 720 70Q850 10 980 70Q1090 30 1200 70V120H0Z", "M0 40L200 70L420 30L640 75L860 35L1040 70L1200 40V120H0Z", "M0 70Q300 10 600 60T1200 50V120H0Z"];
  function field(n) { var f = FIELDS[n % 5], s = document.documentElement.style, h = document.getElementById("hills"); s.setProperty("--field", f[0]); s.setProperty("--tint", f[1]); s.setProperty("--field-d", f[2]);
    if (h) h.innerHTML = '<svg viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true" fill="currentColor"><path d="' + HILLS[n % 5] + '"/></svg>'; }
  function star() { stars++; drawStars(); sfx.star(); return stars; }
  function finish() { hideHand(); clearTimeout(idleT); var e = $("#ending"), i, h = "", cols = ["yellow", "pink", "blue", "white"];
    [].forEach.call(e.querySelectorAll(".confetti"), function (c) { c.remove(); });
    for (i = 0; i < 14; i++) { var c = el("div", "confetti", A.thing("star", cols[i % 4])), a = i / 14 * Math.PI * 2, d = 180 + Math.random() * 160;
      c.style.setProperty("--dx", Math.cos(a) * d + "px"); c.style.setProperty("--dy", Math.sin(a) * d * 0.8 + "px"); c.style.animationDelay = (Math.random() * 0.25) + "s"; e.appendChild(c); }
    document.body.classList.add("done"); e.hidden = false; sfx.tune(); $("#again").focus(); }

  g.KP = {
    init: function (c) { cfg = c; build(); resetIdle(); cfg.onStart(); },
    sfx: sfx, field: field, star: star, finish: finish, hand: hand, hideHand: hideHand, kido: kido, sparkle: sparkle, fly: fly, el: el, reduce: reduce,
    level: function () { return level; }, stars: function () { return stars; }, soundOn: function () { return soundOn; },
    say: function () { /* slot for recorded Kido lines; silent by design (wordless games, decided 12 Nov 2026) */ }
  };
})(window);
