/* Sorting Switch — sort toys by one rule, then the rule changes (cognitive flexibility, like the DCCS task).
   Little sorters: color game, then shape game. Big sorters: a third round where a sign on each toy says which rule to use. */
(function () {
  var board = document.getElementById("board");
  var COL = { yellow: "#FFC73A", blue: "#02A9F7" };
  var SH = {
    ball: function (c) { return '<circle cx="50" cy="50" r="40" fill="' + c + '" stroke="#2B2D5C" stroke-width="5"/><path d="M14 44 Q50 62 86 44" fill="none" stroke="#2B2D5C" stroke-width="4"/>'; },
    star: function (c) { return '<polygon points="50,6 62,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 38,38" fill="' + c + '" stroke="#2B2D5C" stroke-width="5" stroke-linejoin="round"/>'; }
  };
  function art(shape, color) { return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' + SH[shape](COL[color]) + "</svg>"; }
  var BINS = [{ shape: "ball", color: "yellow" }, { shape: "star", color: "blue" }]; // bin pictures (classic DCCS: toys mix the two)
  var TOYS = [{ shape: "ball", color: "blue" }, { shape: "star", color: "yellow" }]; // conflict toys: color and shape point to different bins
  var RULE = { color: { icon: "🎨", name: "Color game", say: "This is the color game. Put each toy in the box with the same color!" },
    shape: { icon: "🔷", name: "Shape game", say: "Now it's the shape game! Put each toy in the box with the same shape. Not the color, the shape!" } };

  var rounds, ri, items, ii, misses, big;

  function makeItems(n, rule) { var out = []; for (var i = 0; i < n; i++) out.push({ toy: TOYS[i % 2], rule: rule || (Math.random() < .5 ? "color" : "shape") }); return KG.shuffle(out); }

  function begin(choice) {
    big = choice === 1;
    rounds = [{ rule: "color", items: makeItems(big ? 6 : 5, "color") }, { rule: "shape", items: makeItems(big ? 6 : 5, "shape") }];
    if (big) rounds.push({ rule: "mixed", items: makeItems(8) });
    ri = 0; intro();
  }

  function intro() {
    var R = rounds[ri];
    KG.steps(ri, rounds.length);
    var r = R.rule === "mixed" ? { icon: "🎨🔷", name: "Switch game", say: "The trickiest game! Look at the sign on each toy. Paint means color. Shape means shape." } : RULE[R.rule];
    board.innerHTML = '<div class="start"><p class="rule-sign"><span aria-hidden="true">' + r.icon + "</span> " + r.name + "</p><p>" + r.say + '</p><button type="button" class="btn" id="go">Let\'s sort!</button></div>';
    KG.say(r.say);
    document.getElementById("go").addEventListener("click", function () { ii = 0; misses = 0; item(); });
    KG.focus(document.getElementById("go"));
  }

  function item() {
    var R = rounds[ri], it = R.items[ii], rule = it.rule;
    var sign = rule === "color" ? "🎨 Color" : "🔷 Shape";
    var h = '<p class="rule-sign" id="rs"><span aria-hidden="true">' + sign.split(" ")[0] + "</span> " + sign.split(" ")[1] + " game</p>" +
      '<div class="sort-item pop" role="img" aria-label="A ' + it.toy.color + " " + it.toy.shape + '">' + art(it.toy.shape, it.toy.color) + "</div>" +
      '<div class="bins" role="group" aria-label="Boxes">';
    BINS.forEach(function (b, i) { h += '<button type="button" class="bin" data-i="' + i + '" aria-label="Box with the ' + b.color + " " + b.shape + '">' + art(b.shape, b.color) + '<span aria-hidden="true">' + b.color + " " + b.shape + "</span></button>"; });
    board.innerHTML = h + "</div>";
    board.querySelectorAll(".bin").forEach(function (b) { b.addEventListener("click", function () { choose(+b.dataset.i, b); }); });
    var lead = ii === 0 ? "" : (R.rule === "mixed" ? "Look at the sign! " : "");
    KG.say(lead + (rule === "color" ? "Color game. " : "Shape game. ") + "Where does the " + it.toy.color + " " + it.toy.shape + " go?");
    KG.focus(board.querySelector(".bin"));
  }

  function choose(i, btn) {
    var R = rounds[ri], it = R.items[ii], b = BINS[i];
    var ok = it.rule === "color" ? b.color === it.toy.color : b.shape === it.toy.shape;
    if (!ok) {
      misses++;
      KG.flash(btn, "shake"); KG.flash(document.getElementById("rs"), "pop");
      KG.say(it.rule === "color" ? "Remember, it's the color game! Which box has " + it.toy.color + "?" : "Remember, it's the shape game! Which box has a " + it.toy.shape + "?");
      return;
    }
    KG.flash(btn, "pop");
    ii++;
    if (ii < R.items.length) { KG.say(KG.praise()); return setTimeout(item, KG.reduce ? 500 : 900); }
    ri++;
    if (ri < rounds.length) { KG.hop(); return setTimeout(intro, 700); }
    KG.finish(board, {
      title: "Super sorter!", total: rounds.length,
      say: "You switched the rules like a super sorter!",
      skill: "Cognitive flexibility: keeping a rule in mind, then letting it go when the rule changes. This is one of the executive-function skills that help children learn at school.",
      ask: "Sort the laundry or the toy box together: first by color, then switch to sorting by kind. Who can switch fastest?",
      again: function () { begin(big ? 1 : 0); }
    });
  }

  KG.start(board, {
    intro: "Kido's toys got all mixed up! Help him sort them. Listen carefully: the rule can change.",
    say: "Help me sort my toys! Choose your sorter.",
    levels: [{ icon: "🧺", label: "Little sorter (3–4)" }, { icon: "🔀", label: "Big sorter (5–6)" }]
  }, begin);
})();
