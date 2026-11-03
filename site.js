/* KidoDino sign-up form.
   To connect Kit: paste the numeric form ID from Kit (Grow > Landing Pages & Forms > your form > Embed > HTML)
   into KIT_FORM_ID below. Until then the form checks the input and explains that sign-up opens soon. */
(function () {
  var KIT_FORM_ID = ""; // e.g. "1234567"

  var form = document.getElementById("signup-form");
  if (!form) return;
  var email = document.getElementById("signup-email");
  var parent = document.getElementById("signup-parent");
  var emailErr = document.getElementById("signup-email-error");
  var parentErr = document.getElementById("signup-parent-error");
  var status = document.getElementById("signup-status");

  if (KIT_FORM_ID) {
    form.action = "https://app.kit.com/forms/" + KIT_FORM_ID + "/subscriptions";
    form.method = "post";
  }

  function setError(input, box, msg) {
    box.textContent = msg;
    box.hidden = !msg;
    if (msg) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  form.addEventListener("submit", function (e) {
    var ok = true, first = null;
    var v = email.value.trim();
    if (!v) { setError(email, emailErr, "Please enter your email address."); ok = false; first = first || email; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError(email, emailErr, "This email address looks incomplete. Check it has an @ and a domain, like name@example.com."); ok = false; first = first || email; }
    else setError(email, emailErr, "");

    if (!parent.checked) { setError(parent, parentErr, "Please confirm you are a parent or guardian, 18 or older."); ok = false; first = first || parent; }
    else setError(parent, parentErr, "");

    if (!ok) { e.preventDefault(); status.textContent = ""; first.focus(); return; }
    if (!KIT_FORM_ID) {
      e.preventDefault();
      status.textContent = "Thank you! Sign-up opens very soon. Until then, write to kido@kidodino.com and we will add you by hand.";
    }
  });
})();
