/* "Which Kido are you today?" — three picture questions for ages 3–6.
   Each answer votes for one Kido; the most votes wins (a tie goes to the latest answer). */
(function () {
  var card = document.getElementById("quiz-card");
  if (!card) return;
  var dots = document.querySelectorAll(".quiz-dots li");

  var QUESTIONS = [
    { q: "How does your body feel today?", a: [
      ["bouncy", "🤸", "Bouncy!"], ["builder", "💪", "Strong!"], ["cozy", "🧸", "Snuggly"], ["explorer", "🔍", "Curious"] ] },
    { q: "Where do you want to go?", a: [
      ["builder", "🚧", "The building site"], ["explorer", "⛺", "The forest"], ["bouncy", "🛝", "The playground"], ["cozy", "📚", "A cozy reading corner"] ] },
    { q: "Pick a sound!", a: [
      ["cozy", "🌙", "Shhh…"], ["bouncy", "🦘", "BOING!"], ["explorer", "✨", "Ooooh!"], ["builder", "🚜", "VROOM!"] ] }
  ];
  var KIDOS = {
    builder: { name: "Builder Kido", line: "You are strong and ready to dig! Today you drive the mini excavator with Kido.", page: "builder" },
    bouncy: { name: "Bouncy Kido", line: "Boing, boing! You have happy feet today. Jump on the trampoline with Kido.", page: "bouncy" },
    cozy: { name: "Cozy Kido", line: "Today is a calm day for a good story. Snuggle up and read with Kido.", page: "cozy" },
    explorer: { name: "Explorer Kido", line: "You want to discover new things! Go camping under the stars with Kido.", page: "explorer" }
  };

  var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  function say(text) {
    if (!canSpeak) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; u.rate = 0.9; u.pitch = 1.2;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech is a bonus; the text is always on screen */ }
  }

  var step = 0, votes = [];

  function setDots(n) {
    Array.prototype.forEach.call(dots, function (d, i) { d.className = i < n ? "done" : (i === n ? "now" : ""); });
  }

  function speakerButton(text) {
    if (!canSpeak) return "";
    return '<button type="button" class="speak" data-say="' + text.replace(/"/g, "&quot;") + '">' +
      '<span aria-hidden="true">🔊</span> Read it to me</button>';
  }

  function showQuestion() {
    var Q = QUESTIONS[step];
    setDots(step);
    var html = '<p class="quiz-step">Question ' + (step + 1) + ' of ' + QUESTIONS.length + '</p>' +
      '<h3 class="quiz-q" tabindex="-1">' + Q.q + '</h3>' + speakerButton(Q.q + " " + Q.a.map(function (a) { return a[2]; }).join(", ")) +
      '<ul class="answers">';
    Q.a.forEach(function (a) {
      html += '<li><button type="button" class="answer" data-kido="' + a[0] + '">' +
        '<span class="answer-icon" aria-hidden="true">' + a[1] + '</span><span class="answer-label">' + a[2] + '</span></button></li>';
    });
    html += "</ul>";
    card.innerHTML = html;
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
          '<p class="quiz-step">Today you are…</p>' +
          '<h3 class="quiz-q result-name" tabindex="-1">' + K.name + '!</h3>' +
          '<p>' + K.line + '</p>' +
          speakerButton("Today you are " + K.name + "! " + K.line) +
          '<div class="result-actions">' +
            '<a class="btn" href="downloads/kido-' + K.page + '-coloring-page.pdf" download>Get my coloring page <span class="small">(PDF)</span></a>' +
            '<button type="button" class="btn btn-ghost-ink" id="quiz-again">Play again</button>' +
          '</div>' +
        '</div>' +
        '<img class="result-page" src="assets/img/pages/' + K.page + '-600.jpg" width="600" height="776" alt="Coloring page preview: ' + K.name + '.">' +
      '</div>';
    card.querySelector(".result-name").focus();
    document.getElementById("quiz-again").addEventListener("click", function () { step = 0; votes = []; showQuestion(); card.querySelector(".quiz-q").focus(); });
  }

  card.addEventListener("click", function (ev) {
    var sp = ev.target.closest(".speak");
    if (sp) { say(sp.dataset.say); return; }
    var btn = ev.target.closest(".answer");
    if (!btn) return;
    votes.push(btn.dataset.kido);
    step++;
    if (step < QUESTIONS.length) showQuestion(); else showResult();
  });

  showQuestion();
})();
