/* Vector Kido: every [data-kido-svg] gets assets/img/kido/kido.svg injected (the picture inside
   is the fallback when scripts are off). The eyes follow the pointer or a tap, Kido blinks now
   and then, and the hero Kido hops and talks when pressed. data-viewbox crops the drawing
   (the footer Kido shows only his top half). */
(function () {
  var hosts = document.querySelectorAll("[data-kido-svg]");
  if (!hosts.length || !window.fetch) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var eyes = [];
  var lastMove = 0;

  fetch("assets/img/kido/kido.svg").then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (txt) {
    Array.prototype.forEach.call(hosts, function (host, n) {
      var t = txt.replace(/eyeclip-/g, "eyeclip" + n + "-").replace(/<title>[^<]*<\/title>/, "");
      host.innerHTML = t;
      var svg = host.querySelector("svg");
      svg.removeAttribute("width"); svg.removeAttribute("height");
      svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
      if (host.dataset.viewbox) svg.setAttribute("viewBox", host.dataset.viewbox);
      Array.prototype.forEach.call(svg.querySelectorAll(".eye"), function (g) {
        var bb = g.getBBox();
        eyes.push({ g: g, look: g.querySelector(".look"), lid: g.querySelector(".lid"), mx: bb.width * 0.16, my: bb.height * 0.13 });
      });
    });
    start();
  }).catch(function () { /* keep the picture fallback */ });

  function lookAt(px, py) {
    eyes.forEach(function (e) {
      var r = e.g.getBoundingClientRect();
      if (!r.width) return;
      var dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy) || 1, f = Math.min(1, d / 260);
      e.look.setAttribute("transform", "translate(" + (dx / d * f * e.mx).toFixed(1) + " " + (dy / d * f * e.my).toFixed(1) + ")");
    });
  }
  function lookHome() { eyes.forEach(function (e) { e.look.removeAttribute("transform"); }); }

  function blink() {
    eyes.forEach(function (e) {
      if (e.lid.animate) e.lid.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: 180, easing: "ease-in-out" });
    });
  }

  function start() {
    window.addEventListener("pointermove", function (ev) { lastMove = Date.now(); lookAt(ev.clientX, ev.clientY); }, { passive: true });
    window.addEventListener("pointerdown", function (ev) { lastMove = Date.now(); lookAt(ev.clientX, ev.clientY); }, { passive: true });
    document.addEventListener("mouseleave", lookHome);
    window.addEventListener("focusin", function (ev) {
      var r = ev.target.getBoundingClientRect && ev.target.getBoundingClientRect();
      if (r && r.width) { lastMove = Date.now(); lookAt(r.left + r.width / 2, r.top + r.height / 2); }
    });
    if (reduce) return;
    (function nextBlink() { setTimeout(function () { if (!document.hidden) blink(); nextBlink(); }, 2500 + Math.random() * 3500); })();
    // when nobody moves the pointer (phones, tablets), Kido looks around by himself
    setInterval(function () {
      if (Date.now() - lastMove < 4000 || document.hidden) return;
      if (Math.random() < 0.3) { lookHome(); return; }
      var a = Math.random() * Math.PI * 2;
      lookAt(window.innerWidth / 2 + Math.cos(a) * 600, window.innerHeight / 2 + Math.sin(a) * 400);
    }, 2200);
  }

  var kido = document.getElementById("kido");
  var bubble = document.getElementById("kido-bubble");
  if (kido && bubble) {
    var lines = ["Hi! I'm Kido!", "Let's color together!", "Roar! A tiny one.", "Which Kido are you today?", "I love big crayons!"];
    var i = 0;
    kido.addEventListener("click", function () {
      i = (i + 1) % lines.length;
      bubble.textContent = lines[i];
      if (!reduce) { kido.classList.remove("hop"); void kido.offsetWidth; kido.classList.add("hop"); blink(); }
    });
  }
})();
