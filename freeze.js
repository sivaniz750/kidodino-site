/* Kido Says: Freeze! — inhibitory control (go / no-go), like the "Freeze game" from Harvard's executive-function activities.
   Tap game: tap the drum on GREEN, hold still on RED. Big players get "opposite day" (the rule flips).
   Move game: a grown-up and child dance on green and freeze on red, away from the screen. No scores, no losing. */
(function () {
  var board = document.getElementById("board");
  var MOVES = [["🦘", "Jump like a frog!"], ["💃", "Dance!"], ["🦖", "Stomp like a dino!"], ["🙌", "Wave your arms!"], ["🐢", "Walk slowly like a turtle!"], ["🌀", "Spin around!"]];
  var mode, flip, seq, k, stars, timer, waiting;

  function clear() { clearTimeout(timer); waiting = false; }

  function begin(choice) {
    clear();
    if (choice === 2) return moveGame();
    flip = false; mode = choice; tapRound(0);
  }

  // ----- tap game -----
  function tapRound(r) {
    var rounds = mode === 1 ? 2 : 1;
    flip = r === 1;
    KG.steps(r, rounds);
    var rule = flip ? "Opposite day! Tap the drum when the light is RED. Freeze when it is GREEN!" : "Tap the drum when the light is GREEN. Freeze when the light is RED!";
    board.innerHTML = '<div class="start"><p class="rule-sign">' + (flip ? "🔄 Opposite day" : "🟢 Tap · 🔴 Freeze") + "</p><p>" + rule + '</p><button type="button" class="btn" id="go">Ready!</button></div>';
    KG.say(rule);
    document.getElementById("go").addEventListener("click", function () { play(r, rounds); });
    KG.focus(document.getElementById("go"));
  }

  function play(r, rounds) {
    // 10 lights, about 60% "tap" lights; never more than 3 of the same in a row
    seq = []; var run = 0, last = null;
    for (var i = 0; i < 10; i++) { var g = Math.random() < 0.6; if (g === last && run >= 3) g = !g; run = g === last ? run + 1 : 1; last = g; seq.push(g); }
    k = 0; stars = 0;
    board.innerHTML = '<div class="light" id="light" aria-live="assertive">…</div><button type="button" class="tap-big" id="drum">🥁 Tap!</button><p class="stars" id="stars" aria-label="Stars: 0"></p>';
    document.getElementById("drum").addEventListener("click", tap);
    KG.focus(document.getElementById("drum"));
    timer = setTimeout(function () { show(r, rounds); }, 1200);
  }

  function shouldTap() { return flip ? !seq[k] : seq[k]; }

  function show(r, rounds) {
    if (k >= seq.length) return endTap(r, rounds);
    var L = document.getElementById("light"), green = seq[k];
    L.className = "light " + (green ? "go" : "stop");
    L.textContent = green ? "GO" : "STOP";
    waiting = true;
    KG.say(green ? "Green!" : "Red!", true);
    // generous 3 second window; holding still through a "freeze" light earns a star too
    timer = setTimeout(function () {
      if (waiting && !shouldTap()) { star("You froze! Great self-control!"); }
      else if (waiting) { KG.say(flip ? "That light meant tap!" : "Green means tap!"); }
      waiting = false; L.className = "light"; L.textContent = "…"; k++;
      timer = setTimeout(function () { show(r, rounds); }, 800);
    }, 3000);
  }

  function tap() {
    var d = document.getElementById("drum");
    KG.flash(d, "pop");
    if (!waiting) return;
    waiting = false;
    if (shouldTap()) star(KG.praise());
    else { KG.flash(d, "shake"); KG.say(flip ? "Oops! On opposite day, green means freeze." : "Oops! Red means freeze. Next time!"); }
  }

  function star(msg) { stars++; var s = document.getElementById("stars"); if (s) { s.textContent = "⭐".repeat(stars); s.setAttribute("aria-label", "Stars: " + stars); } KG.say(msg); }

  function endTap(r, rounds) {
    clear();
    if (r + 1 < rounds) { KG.hop(); KG.say("You got " + stars + " stars! Now something tricky…"); return setTimeout(function () { tapRound(r + 1); }, 1500); }
    done();
  }

  // ----- move game (away from the screen, with a grown-up) -----
  function moveGame() {
    var order = KG.shuffle(MOVES); k = 0;
    KG.steps(0, 1);
    board.innerHTML = '<div class="start"><p>Stand up with a grown-up! When the light is <b>green</b>, do what Kido says. When it turns <b>red</b>, freeze like a statue!</p><button type="button" class="btn" id="go">We are ready!</button></div>';
    KG.say("Stand up with a grown-up! On green, do what I say. On red, freeze like a statue!");
    document.getElementById("go").addEventListener("click", function () {
      board.innerHTML = '<div class="light" id="light">…</div><p class="cmd" id="cmd" aria-live="assertive"></p><button type="button" class="btn btn-ghost-ink" id="stop-move">Stop the game</button>';
      document.getElementById("stop-move").addEventListener("click", function () { clear(); done(); });
      step(order);
    });
    KG.focus(document.getElementById("go"));
  }

  function step(order) {
    if (k >= order.length) return done();
    var L = document.getElementById("light"), c = document.getElementById("cmd"), m = order[k];
    L.className = "light go"; L.textContent = "GO";
    c.innerHTML = '<span class="em" aria-hidden="true">' + m[0] + "</span>" + m[1];
    KG.say(m[1], true);
    timer = setTimeout(function () {
      L.className = "light stop"; L.textContent = "STOP"; c.textContent = "Freeze!";
      KG.say("Freeze!", true);
      timer = setTimeout(function () { k++; step(order); }, 3000 + Math.random() * 2000);
    }, 4000 + Math.random() * 2000);
  }

  function done() {
    clear();
    KG.finish(board, {
      title: "Freeze champion!", total: 1,
      say: "Wow! You can stop your body when you want to. That's a super power!",
      skill: "Self-control (inhibition): stopping an action on purpose, and on opposite day, holding a rule in mind while doing the opposite of what feels natural. These skills support attention and learning.",
      ask: "Play freeze dance with music at home: one of you stops the song, everyone freezes. Take turns being the one who stops it.",
      again: function () { KG.start(board, startOpts, begin); }
    });
  }

  var startOpts = {
    intro: "Kido loves to move, and to freeze! Choose a game.",
    say: "Let's play! Choose a game.",
    levels: [{ icon: "🥁", label: "Tap game (3–4)" }, { icon: "🔄", label: "Tap + opposite day (5–6)" }, { icon: "💃", label: "Move game with a grown-up" }]
  };
  KG.start(board, startOpts, begin);
})();
