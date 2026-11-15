/* preview switch: #hero-soft shows the softer hero background (kept outside the page so the security policy can forbid inline scripts) */
try { if (location.hash === "#hero-soft") document.documentElement.dataset.hero = "soft"; } catch (e) {}
