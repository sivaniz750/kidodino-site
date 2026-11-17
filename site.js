/* KidoDino site helpers (v6, 15 Nov 2026): our own illustrations for the page, the floating "free pages" button
   and the free-pages modal. The modal opens from the button, or once per visit when a desktop pointer heads for
   the top edge to leave. It offers the pages directly: no email, no sign-up, nothing stored about the visitor. */
(function () {
  "use strict";
  var A = window.KDArt;
  if (A) {
    [].forEach.call(document.querySelectorAll("[data-art]"), function (el) { var p = el.dataset.art.split(":"); el.innerHTML = A.thing(p[0], p[1]); });
    [].forEach.call(document.querySelectorAll("[data-badge]"), function (el) { el.innerHTML = A.badge(el.dataset.badge); });
    // small, quiet scenes of the games themselves (Sivan, 15 Nov: show the game, not a symbol; keep it simple)
    var at = function (svg, x, y, w, h) { return svg.replace("<svg ", '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" '); };
    var card = function (x, y, w, h, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="14" fill="#FFFDF6" stroke="#2B2D5C" stroke-width="3"' + (extra || "") + "/>"; };
    var SC = {
      // the rule card, and three pictures: the one that fits the rule is lit up
      hunt: function () { // the rule on top; three pictures, and only the one that fits is lit up
        return card(124, 6, 68, 68) + at(A.splat("blue"), 132, 14, 52, 52) +
          '<rect x="117" y="98" width="82" height="82" rx="18" fill="none" stroke="rgb(96 64 176 / .28)" stroke-width="6"/>' +
          card(28, 102, 74, 74) + at(A.thing("ball", "red"), 35, 109, 60, 60) +
          card(121, 102, 74, 74) + at(A.thing("boat", "blue"), 128, 109, 60, 60) +
          card(214, 102, 74, 74) + at(A.thing("duck", "yellow"), 221, 109, 60, 60);
      },
      // a picture being built: the roof's place glows, and two shapes wait beside it
      builds: function () {
        var I = 'stroke="#2B2D5C" stroke-linejoin="round"';
        return card(18, 10, 176, 180) +
          '<rect x="52" y="104" width="108" height="72" rx="5" fill="#FFC73A" ' + I + ' stroke-width="4"/>' +
          '<rect x="68" y="122" width="24" height="24" rx="3" fill="#DFF3FF" ' + I + ' stroke-width="3.5"/><path d="M80 122V146M68 134H92" stroke="#2B2D5C" stroke-width="2.5"/>' +
          '<rect x="114" y="126" width="28" height="50" rx="4" fill="#1FA8F5" ' + I + ' stroke-width="3.5"/><circle cx="136" cy="152" r="2.6" fill="#2B2D5C"/>' +
          '<path d="M106 30L170 96H42Z" fill="#DFD9EF" ' + I + ' stroke-width="3.5" stroke-dasharray="9 7"/>' +
          card(222, 16, 76, 76) + '<path d="M260 30L284 76H236Z" fill="#F2564B" ' + I + ' stroke-width="5"/>' +
          card(222, 108, 76, 76) + '<circle cx="260" cy="146" r="22" fill="#1FA8F5" ' + I + ' stroke-width="5"/>';
      }
    };
    [].forEach.call(document.querySelectorAll("[data-scene]"), function (el) { el.innerHTML = '<svg viewBox="0 0 316 200" aria-hidden="true">' + SC[el.dataset.scene]() + "</svg>"; });
  }

  var modal = document.getElementById("free-modal"), float = document.getElementById("float");
  if (!modal) return;
  var lastFocus = null, shown = false;
  function seen(v) { try { if (v) sessionStorage.setItem("kd-free", "1"); return sessionStorage.getItem("kd-free") === "1"; } catch (e) { return shown; } }

  // the window eases in (200ms) and leaves quicker (150ms); hidden stays the source of truth for screen readers
  var leaveT = null;
  function open() {
    lastFocus = document.activeElement; shown = true; seen(true); clearTimeout(leaveT);
    modal.classList.remove("leave"); modal.classList.add("enter"); modal.hidden = false;
    void modal.offsetWidth; modal.classList.remove("enter"); document.getElementById("modal-get").focus();
  }
  function close() { modal.classList.add("leave"); leaveT = setTimeout(function () { modal.hidden = true; modal.classList.remove("leave"); }, 150); if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  document.getElementById("float-open").addEventListener("click", open);
  document.getElementById("float-x").addEventListener("click", function () { float.hidden = true; });
  document.getElementById("modal-x").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") { // keep focus inside the dialog
      var f = modal.querySelectorAll("a[href], button"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // the floating button shows once the first screen is behind the visitor
  var freeOn = false, fs = document.getElementById("free");
  if (fs && "IntersectionObserver" in window) new IntersectionObserver(function (es) { freeOn = es[0].isIntersecting; peek(); }, { threshold: 0.15 }).observe(fs);
  // hidden on the first screen, and while the free pages themselves are in view
  function peek() { float.classList.toggle("wait", window.scrollY < window.innerHeight * 0.7 || freeOn); }
  addEventListener("scroll", peek, { passive: true }); peek();
  // leaving intent: a mouse moving out through the top of the window, after at least 8 seconds on the page
  var ready = false; setTimeout(function () { ready = true; }, 8000);
  document.addEventListener("mouseout", function (e) {
    if (!ready || e.relatedTarget || e.clientY > 0 || seen() || !modal.hidden) return;
    open();
  });
})();

/* a download confirms itself: the button shows a tick for a moment (it cannot tell when the file arrives, so it only says "got it") */
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a[download]"); if (!a || !a.classList.contains("btn")) return;
  a.classList.add("got"); setTimeout(function () { a.classList.remove("got"); }, 1600);
});
