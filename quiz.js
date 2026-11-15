/* "Which Kido are you today?" — three picture questions for ages 3–6.
   Each answer votes for one Kido; the most votes wins (a tie goes to the latest answer). */
(function () {
  var card = document.getElementById("quiz-card");
  if (!card) return;
  var dots = document.querySelectorAll(".quiz-dots li");

  var QUESTIONS = [
    { q: "How does my body feel?", a: [
      ["bouncy", "ball:orange", "Bouncy!"], ["builder", "block:red", "Strong!"], ["cozy", "teddy:wood", "Snuggly"], ["explorer", "magnifier:blue", "Curious"] ] },
    { q: "Where do I want to go?", a: [
      ["builder", "truck:yellow", "The building site"], ["explorer", "tent:green", "Camping"], ["bouncy", "kite:pink", "The playground"], ["cozy", "book:blue", "A cozy corner"] ] },
    { q: "What sound do I make?", a: [
      ["cozy", "moon:yellow", "Shhh…"], ["bouncy", "balloon:red", "BOING!"], ["explorer", "star:yellow", "Ooooh!"], ["builder", "car:green", "VROOM!"] ] }
  ];
  var KIDOS = {
    bouncy: { name: "I am bouncy!", line: "I have happy feet, and I love to move.", say: "I am bouncy!", page: "dance" },
    builder: { name: "I am strong!", line: "I can push, lift and build big things.", say: "I am strong!", page: "bulldozer" },
    cozy: { name: "I am calm.", line: "I like quiet moments and soft snuggles.", say: "I am calm.", page: "goodnight" },
    explorer: { name: "I am curious!", line: "I ask questions and find new things.", say: "I am curious!", page: "telescope" }
  };

  var step = 0, votes = [];

  function setDots(n) {
    Array.prototype.forEach.call(dots, function (d, i) { d.className = i < n ? "done" : (i === n ? "now" : ""); });
  }

  function showQuestion() {
    var Q = QUESTIONS[step];
    setDots(step);
    var html = '<p class="visually-hidden">Question ' + (step + 1) + ' of ' + QUESTIONS.length + '</p>' +
      '<p class="quiz-title quiz-q" tabindex="-1">' + Q.q + '</p>' +
      '<ul class="answers">';
    Q.a.forEach(function (a) {
      html += '<li><button type="button" class="answer" data-kido="' + a[0] + '">' +
        (window.KDArt ? KDArt.thing(a[1].split(":")[0], a[1].split(":")[1]) : "") + '<span>' + a[2] + '</span></button></li>';
    });
    html += "</ul>";
    card.innerHTML = html; card.querySelector(".answers").classList.add("q-in"); card.querySelector(".quiz-q").classList.add("q-in");
    if (step > 0) card.querySelector(".quiz-q").focus();
  }

  function winner() {
    var count = {}, best = null;
    votes.forEach(function (v) { count[v] = (count[v] || 0) + 1; });
    votes.forEach(function (v) { if (best === null || count[v] >= count[best]) best = v; });
    return best;
  }

  function showResult() {
    setDots(QUESTIONS.length);
    var K = KIDOS[winner()];
    card.innerHTML =
      '<div class="result">' +
        '<div class="result-copy">' +
          '<p class="t-small">Today:</p>' +
          '<p class="t-h3 quiz-q result-name" tabindex="-1">' + K.name + '</p>' +
          '<p>' + K.line + '</p>' +
          '<p class="t-small say">Say it together: “' + K.say + '”</p>' +
          '<div class="result-actions">' +
            '<a class="btn" href="downloads/kido-' + K.page + '-coloring-page.pdf" download>Get my coloring page</a>' +
            '<button type="button" class="btn btn-2" id="quiz-again">Play again</button>' +
          '</div>' +
        '</div>' +
        '<img src="assets/img/pages/' + K.page + '-600.jpg" width="600" height="776" alt="Your coloring page">' +
      '</div>';
    card.querySelector(".result").classList.add("q-in");
    card.querySelector(".result-name").focus();
    document.getElementById("quiz-again").addEventListener("click", function () { step = 0; votes = []; showQuestion(); card.querySelector(".quiz-q").focus(); });
  }

  // the chosen answer lights up for a moment, so the child sees what they picked, then the next question slides in
  var busy = false, reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".answer");
    if (!btn || busy) return;
    busy = true; btn.classList.add("picked");
    votes.push(btn.dataset.kido);
    step++;
    setTimeout(function () { busy = false; if (step < QUESTIONS.length) showQuestion(); else showResult(); }, reduce ? 60 : 160);
  });

  showQuestion();
})();
