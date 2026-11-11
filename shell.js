/* Kido game shell: speech, progress, start and finish screens. Every game page uses window.KG.
   No data is stored except the sound on/off choice (localStorage, optional). */
(function () {
  var text = document.getElementById("talk-text");
  var stepsEl = document.getElementById("steps");
  var soundBtn = document.getElementById("sound-btn");
  var againBtn = document.getElementById("say-again");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var last = "";
  var soundOn = true;
  try { soundOn = localStorage.getItem("kido-sound") !== "off"; } catch (e) {}
  var canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  var voice = null;
  function pickVoice() {
    if (!canSpeak) return;
    var vs = window.speechSynthesis.getVoices() || [];
    var pref = ["Samantha", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Karen", "Moira"];
    for (var i = 0; i < pref.length && !voice; i++) voice = vs.filter(function (v) { return v.name.indexOf(pref[i]) === 0; })[0] || null;
    if (!voice) voice = vs.filter(function (v) { return /^en(-|_)/i.test(v.lang); })[0] || null;
  }
  if (canSpeak) { pickVoice(); window.speechSynthesis.onvoiceschanged = pickVoice; }

  function speak(t) {
    if (!canSpeak || !soundOn) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t.replace(/[^\w\s.,!?'’-]/g, ""));
      u.lang = "en-US"; u.rate = 0.92; u.pitch = 1.15; if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function setSound(on) {
    soundOn = on;
    try { localStorage.setItem("kido-sound", on ? "on" : "off"); } catch (e) {}
    if (soundBtn) { soundBtn.setAttribute("aria-pressed", on ? "true" : "false"); soundBtn.querySelector(".lbl").textContent = "Sound"; var ic = soundBtn.querySelector(".ico"); if (ic) ic.textContent = on ? "🔊" : "🔇"; }
    if (!on && canSpeak) window.speechSynthesis.cancel();
  }
  if (soundBtn) { if (!canSpeak) soundBtn.hidden = true; setSound(soundOn); soundBtn.addEventListener("click", function () { setSound(!soundOn); }); }
  if (againBtn) { if (!canSpeak) againBtn.hidden = true; againBtn.addEventListener("click", function () { speak(last); }); }

  var praise = ["Great thinking!", "You did it!", "Wow, nice work!", "That's it!", "Super!"];
  var KG = {
    reduce: reduce,
    say: function (t, spokenOnly) { last = t; if (!spokenOnly && text) text.textContent = t; speak(t); },
    praise: function () { return praise[Math.floor(Math.random() * praise.length)]; },
    steps: function (n, total) {
      if (!stepsEl) return;
      var h = ""; for (var i = 0; i < total; i++) h += '<li class="' + (i < n ? "done" : i === n ? "now" : "") + '"></li>';
      stepsEl.innerHTML = h;
    },
    shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    flash: function (el, cls) { if (reduce || !el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); },
    hop: function () { var k = document.querySelector(".talk .kido-art"); KG.flash(k, "pop"); },
    focus: function (el) { if (el) { if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: false }); } },
    // start screen: optional level choice; calls cb(level)
    start: function (board, opts, cb) {
      var h = '<div class="start"><p>' + opts.intro + '</p><div class="choice-row">';
      opts.levels.forEach(function (l, i) { h += '<button type="button" class="big-choice" data-i="' + i + '"><span class="em" aria-hidden="true">' + l.icon + '</span>' + l.label + '</button>'; });
      board.innerHTML = h + "</div></div>";
      KG.say(opts.say);
      board.querySelectorAll(".big-choice").forEach(function (b) { b.addEventListener("click", function () { cb(+b.dataset.i); }); });
      KG.focus(board.querySelector(".big-choice"));
    },
    finish: function (board, o) {
      board.innerHTML = '<div class="finish"><p class="talk-big" style="font:700 var(--step-2)/1.2 var(--f-display)">' + o.title + '</p>' +
        '<div class="choice-row"><button type="button" class="btn" id="play-again">Play again</button><a class="btn btn-ghost-ink" href="./#games">More games</a></div>' +
        '<section class="grownups" aria-labelledby="gu-t"><h2 id="gu-t">For grown-ups</h2><p><b>What your child practiced:</b> ' + o.skill + '</p><p><b>Talk about it:</b> ' + o.ask + '</p></section></div>';
      KG.say(o.say);
      KG.steps(o.total, o.total);
      document.getElementById("play-again").addEventListener("click", o.again);
      KG.focus(board.querySelector(".talk-big"));
    }
  };
  window.KG = KG;
})();
