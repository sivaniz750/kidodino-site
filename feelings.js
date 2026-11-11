/* Kido's Feelings — name a friend's feeling from the story and face, then choose a helpful thing to do.
   Kido stays cheerful and helps; the faces belong to generic round friends (brand rule: Kido is never sad or angry). */
(function () {
  var board = document.getElementById("board");
  // generic friend face: body colour + mouth/eyes per feeling
  var MOUTH = {
    happy: '<path d="M34 60 Q50 76 66 60" fill="none" stroke="#2B2D5C" stroke-width="5" stroke-linecap="round"/>',
    sad: '<path d="M34 70 Q50 56 66 70" fill="none" stroke="#2B2D5C" stroke-width="5" stroke-linecap="round"/>',
    mad: '<path d="M36 68 L64 68" stroke="#2B2D5C" stroke-width="5" stroke-linecap="round"/>',
    scared: '<ellipse cx="50" cy="67" rx="8" ry="10" fill="#2B2D5C"/>',
    surprised: '<circle cx="50" cy="66" r="9" fill="#2B2D5C"/>'
  };
  var BROWS = {
    sad: '<path d="M28 34 L40 30 M72 34 L60 30" stroke="#2B2D5C" stroke-width="4" stroke-linecap="round"/>',
    mad: '<path d="M28 30 L41 36 M72 30 L59 36" stroke="#2B2D5C" stroke-width="4" stroke-linecap="round"/>',
    scared: '<path d="M29 32 Q35 26 41 30 M71 32 Q65 26 59 30" fill="none" stroke="#2B2D5C" stroke-width="4" stroke-linecap="round"/>',
    surprised: '<path d="M29 28 Q35 22 41 27 M71 28 Q65 22 59 27" fill="none" stroke="#2B2D5C" stroke-width="4" stroke-linecap="round"/>'
  };
  function face(f, body) {
    var eye = f === "surprised" || f === "scared" ? 6 : 5;
    var tear = f === "sad" ? '<path d="M36 50 q-3 7 0 9 q3 -2 0 -9z" fill="#02A9F7"/>' : "";
    return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><circle cx="50" cy="52" r="42" fill="' + (body || "#FFC73A") + '" stroke="#2B2D5C" stroke-width="4"/>' +
      '<circle cx="36" cy="44" r="' + eye + '" fill="#2B2D5C"/><circle cx="64" cy="44" r="' + eye + '" fill="#2B2D5C"/>' + (BROWS[f] || "") + MOUTH[f] + tear + "</svg>";
  }
  var LABEL = { happy: "Happy", sad: "Sad", mad: "Mad", scared: "Scared", surprised: "Surprised" };
  // scenes: who, colour, story, feeling, distractor feelings, ideas [text, icon, good?]
  var SCENES = [
    { who: "Mia", body: "#E96FA3", pic: "🧱", story: "Mia built a tall tower. Oh no! It fell down.", f: "sad", opts: ["sad", "happy"],
      ideas: [["Build it again together", "🤝", 1], ["Take a big breath, then try", "🌬️", 1], ["Knock down a friend's tower", "💥", 0]] },
    { who: "Leo", body: "#02A9F7", pic: "🎁", story: "Leo opens a box. There is a puppy inside!", f: "surprised", opts: ["surprised", "sad"],
      ideas: [["Say thank you with a big hug", "🤗", 1], ["Pet the puppy gently", "🐶", 1], ["Pull the puppy's tail", "🙅", 0]] },
    { who: "Noa", body: "#19B3A6", pic: "🚗", story: "Noa was playing with a car. A friend grabbed it away!", f: "mad", opts: ["mad", "happy", "scared"],
      ideas: [["Say: Please give it back", "🗣️", 1], ["Ask a grown-up for help", "🙋", 1], ["Hit the friend", "✋", 0]] },
    { who: "Sam", body: "#8CC84B", pic: "⛈️", story: "There is a loud BOOM of thunder. Sam jumps.", f: "scared", opts: ["scared", "happy", "mad"],
      ideas: [["Hug a grown-up or a teddy", "🧸", 1], ["Breathe slowly with Kido", "🌬️", 1], ["Hide and cry alone", "🚪", 0]] },
    { who: "Ella", body: "#FFC73A", pic: "🖍️", story: "Ella finished her coloring page. Her friend says: Wow, I love it!", f: "happy", opts: ["happy", "sad", "scared", "surprised"],
      ideas: [["Say thank you", "💬", 1], ["Make a picture for the friend too", "🎨", 1], ["Rip up the picture", "📄", 0]] }
  ];

  var list, si, big;

  function begin(choice) { big = choice === 1; list = big ? SCENES : SCENES.slice(0, 4); si = 0; scene(); }

  function opts(S) { var o = big ? S.opts : S.opts.slice(0, 2); if (o.indexOf(S.f) < 0) o = [S.f].concat(o); return KG.shuffle(o); }

  function scene() {
    var S = list[si];
    KG.steps(si, list.length);
    var h = '<div class="scene"><div class="scene-art" role="img" aria-label="' + S.who + '"><span aria-hidden="true">' + S.pic + '</span></div><p class="scene-q">' + S.story + " How does " + S.who + ' feel?</p><div class="answers" role="group" aria-label="Feelings">';
    opts(S).forEach(function (f) { h += '<button type="button" class="answer" data-f="' + f + '">' + face(f, S.body) + LABEL[f] + "</button>"; });
    board.innerHTML = h + "</div></div>";
    board.querySelectorAll(".answer").forEach(function (b) { b.addEventListener("click", function () { feel(b); }); });
    KG.say(S.story + " How does " + S.who + " feel?");
    KG.focus(board.querySelector(".answer"));
  }

  function feel(b) {
    var S = list[si];
    if (b.dataset.f !== S.f) {
      KG.flash(b, "shake");
      KG.say("Hmm, look at " + S.who + "'s face. Is " + S.who + " " + LABEL[b.dataset.f].toLowerCase() + "? Look at the eyes and the mouth.");
      return;
    }
    KG.flash(b, "pop");
    var q = S.f === "happy" || S.f === "surprised" ? "What a nice feeling! What could " + S.who + " do now?" : S.who + " feels " + LABEL[S.f].toLowerCase() + ". That's OK, everyone does sometimes. What could help?";
    setTimeout(function () { help(q); }, KG.reduce ? 300 : 700);
  }

  function help(q) {
    var S = list[si];
    var h = '<div class="scene"><div class="scene-art" role="img" aria-label="' + S.who + " feels " + LABEL[S.f].toLowerCase() + '">' + face(S.f, S.body) + '</div><p class="scene-q">' + q + '</p><div class="answers" role="group" aria-label="Ideas">';
    KG.shuffle(S.ideas).forEach(function (d) { h += '<button type="button" class="answer" data-g="' + d[2] + '"><span class="em" aria-hidden="true">' + d[1] + "</span>" + d[0] + "</button>"; });
    board.innerHTML = h + "</div></div>";
    board.querySelectorAll(".answer").forEach(function (b) { b.addEventListener("click", function () { idea(b); }); });
    KG.say(q);
    KG.focus(board.querySelector(".answer"));
  }

  function idea(b) {
    if (b.dataset.g !== "1") { KG.flash(b, "shake"); KG.say("Hmm, would that help? It might make someone feel worse. Let's choose another idea."); return; }
    KG.flash(b, "pop"); KG.hop();
    var S = list[si];
    if (S.f === "scared" || S.f === "mad") return calm();
    next("Good idea! That really helps.");
  }

  function calm() { // short guided breath with Kido after big feelings
    board.innerHTML = '<div class="scene"><div class="breathe on" aria-hidden="true"></div><p class="scene-q">Let\'s breathe together. Smell the flower… blow out the candle.</p><button type="button" class="btn" id="calm-done">I feel calmer</button></div>';
    KG.say("Good idea! Let's breathe together. Smell the flower. Now blow out the candle. One more time.");
    document.getElementById("calm-done").addEventListener("click", function () { next("Well done!"); });
    KG.focus(document.getElementById("calm-done"));
  }

  function next(msg) {
    si++;
    if (si < list.length) { KG.say(msg); return setTimeout(scene, KG.reduce ? 600 : 1300); }
    KG.finish(board, {
      title: "You are a feelings helper!", total: list.length,
      say: "You are a great feelings helper! Thank you!",
      skill: "Naming feelings from faces and stories, and choosing a kind, helpful way to handle them. Naming a feeling is the first step to managing it.",
      ask: "Tell each other about a time today you felt happy, and a time you felt a little mad or sad. What helped?",
      again: function () { begin(big ? 1 : 0); }
    });
  }

  KG.start(board, {
    intro: "Kido's friends have big feelings today. Can you help Kido find out how they feel, and what could help?",
    say: "My friends need a helper. Will you help me?",
    levels: [{ icon: "🙂", label: "Little helper (3–4)" }, { icon: "💛", label: "Big helper (5–6)" }]
  }, begin);
})();
