/* KidoDino play art v2 (12 Nov 2026) – one visual language for every game picture and icon.
   Built to sit next to Kido: thick ink contour around the whole object, thinner ink lines inside,
   two-tone flat colour (base + a deeper tone on the lower right, like Kido's deeper green), one soft shine top-left.
   One play colour per object; every other part is ink, white, cream, glass or wood, so colour games stay honest.
   No faces on things. Animals get a glossy dot eye and, where it fits, Kido's pink cheek. */
(function (g) {
  "use strict";
  var INK = "#2B2D5C", CREAM = "#FFF3D6", CREAM_D = "#EBD7A8", WHITE = "#FFFFFF", GLASS = "#DFF3FF", WOOD = "#DDA568", WOOD_D = "#BE8346", CHEEK = "#F3A7A1";
  var COLORS = {
    red: ["#F2564B", "#C93B37"], orange: ["#F78B3A", "#D56A1F"], yellow: ["#FFC73A", "#E8A01D"], green: ["#4FB86A", "#2F9450"],
    blue: ["#1FA8F5", "#0D84CC"], purple: ["#8A63D6", "#6844B4"], pink: ["#EE7FAE", "#D05A8E"],
    cream: [CREAM, CREAM_D], wood: [WOOD, WOOD_D], white: [WHITE, "#DCE3F2"], ink: [INK, INK]
  };
  var uid = 0;
  function tag(e, extra) { return "<" + e + (extra ? " " + extra : "") + "/>"; }
  function all(els, extra) { return els.map(function (e) { return tag(e, extra); }).join(""); }
  // body: union silhouette with thick ink contour + two-tone fill
  function B(c) {
    var els = [].slice.call(arguments, 1), col = COLORS[c] || [c, c], id = "kd" + (++uid);
    return '<g fill="' + INK + '" stroke="' + INK + '" stroke-width="13" stroke-linejoin="round" stroke-linecap="round">' + all(els) + "</g>" +
      '<g fill="' + col[1] + '">' + all(els) + "</g>" +
      '<clipPath id="' + id + '">' + all(els) + '</clipPath><g clip-path="url(#' + id + ')"><g fill="' + col[0] + '" transform="translate(-5 -6)">' + all(els) + "</g></g>";
  }
  // part: smaller piece on top, thinner contour
  function P(c) { var els = [].slice.call(arguments, 1), col = COLORS[c] || [c, c];
    return '<g fill="' + INK + '" stroke="' + INK + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round">' + all(els) + '</g><g fill="' + col[0] + '">' + all(els) + "</g>"; }
  function L(d, w) { return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + (w || 4) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function H(x, y, rx, ry, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".6"' + (rot ? ' transform="rotate(' + rot + " " + x + " " + y + ')"' : "") + "/>"; }
  function E(x, y, r) { r = r || 5; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + INK + '"/><circle cx="' + (x - r * 0.3) + '" cy="' + (y - r * 0.35) + '" r="' + (r * 0.36).toFixed(1) + '" fill="#fff"/>'; }
  function K(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="6" ry="4" fill="' + CHEEK + '"/>'; }
  function Wh(x, y, r) { r = r || 12; return '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 3) + '" fill="' + INK + '"/><circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.45).toFixed(1) + '" fill="' + CREAM + '"/>'; }
  function star(cx, cy, R, r, n) { var p = "", i, a, rad; n = n || 5; for (i = 0; i < n * 2; i++) { a = (i * 180 / n - 90) * Math.PI / 180; rad = i % 2 ? r : R; p += (i ? "L" : "M") + (cx + rad * Math.cos(a)).toFixed(1) + " " + (cy + rad * Math.sin(a)).toFixed(1); } return p + "Z"; }
  function petals(n, R, r) { var a = [], i, t; for (i = 0; i < n; i++) { t = (i * 360 / n - 90) * Math.PI / 180; a.push('circle cx="' + (60 + R * Math.cos(t)).toFixed(1) + '" cy="' + (60 + R * Math.sin(t)).toFixed(1) + '" r="' + r + '"'); } return a; }

  var T = {
    // ---- toys
    car: function (c) { return B(c, 'path d="M12 76Q12 62 26 60L36 40Q40 32 50 32H74Q84 32 88 40L96 60Q110 62 110 76V80Q110 88 102 88H20Q12 88 12 80Z"') + P(GLASS, 'path d="M45 43H57V57H39Z"', 'path d="M65 43H75L81 57H65Z"') + P("cream", 'circle cx="102" cy="72" r="4"') + Wh(36, 90) + Wh(86, 90) + H(24, 68, 6, 3, -10); },
    truck: function (c) { return B(c, 'path d="M10 44H62V84H10Z"', 'path d="M68 50H90Q96 50 99 56L108 70V84H68Z"') + P(GLASS, 'path d="M78 59H90L96 70H78Z"') + L("M22 54V74M36 54V74M50 54V74") + Wh(30, 90) + Wh(88, 90) + H(18, 50, 5, 2.5); },
    bus: function (c) { return B(c, 'rect x="10" y="30" width="100" height="56" rx="14"') + P(GLASS, 'rect x="20" y="42" width="18" height="16" rx="3"', 'rect x="46" y="42" width="18" height="16" rx="3"', 'rect x="72" y="42" width="18" height="16" rx="3"') + L("M12 68H108") + Wh(34, 90) + Wh(86, 90) + H(22, 35, 8, 2.5); },
    train: function (c) { return B(c, 'rect x="12" y="52" width="72" height="34" rx="8"', 'rect x="62" y="24" width="40" height="62" rx="8"', 'rect x="26" y="32" width="16" height="22" rx="3"') + P(GLASS, 'rect x="72" y="34" width="20" height="18" rx="3"') + P("cream", 'rect x="20" y="24" width="28" height="9" rx="4"') + Wh(30, 92, 10) + Wh(56, 92, 10) + Wh(86, 92, 10) + H(20, 58, 6, 2.5); },
    plane: function (c) { return B(c, 'path d="M54 52L46 26H62L76 52Z"', 'path d="M24 54L14 28H30L42 52Z"', 'path d="M12 64Q12 50 40 50H86Q108 50 110 64Q108 78 86 78H40Q12 78 12 64Z"', 'path d="M52 66L42 100H60L78 66Z"') + P(GLASS, 'circle cx="66" cy="61" r="5"', 'circle cx="82" cy="61" r="5"', 'path d="M94 56Q104 58 106 64H94Z"') + H(30, 56, 8, 2.5); },
    rocket: function (c) { return P("cream", 'path d="M48 88Q60 116 72 88Z"') + B(c, 'path d="M38 62L18 94H40Z"', 'path d="M82 62L102 94H80Z"', 'path d="M60 8Q86 30 86 66V88H34V66Q34 30 60 8Z"') + P(GLASS, 'circle cx="60" cy="50" r="11"') + L("M36 74H84") + H(47, 28, 4, 9, 25); },
    boat: function (c) { return L("M60 68V16", 6) + P("cream", 'path d="M66 22L98 60H66Z"', 'path d="M54 30L30 60H54Z"') + B(c, 'path d="M10 68H110L98 94Q96 100 90 100H30Q24 100 22 94Z"') + L("M20 80H100") + H(24, 73, 7, 2.5); },
    ball: function (c) { return B(c, 'circle cx="60" cy="60" r="44"') + L("M18 54Q60 76 102 54M60 16Q40 60 60 104") + H(40, 36, 9, 5, -35); },
    balloon: function (c) { return L("M60 92Q48 102 62 112", 4) + B(c, 'path d="M60 10C82 10 96 26 96 46C96 66 74 82 60 82C46 82 24 66 24 46C24 26 38 10 60 10Z"', 'path d="M53 82H67L63 92H57Z"') + H(44, 32, 6, 11, 22) + H(52, 20, 3, 3); },
    hat: function (c) { return B(c, 'path d="M60 18L94 90H26Z"') + P("cream", 'rect x="18" y="84" width="84" height="12" rx="6"') + P("white", 'circle cx="60" cy="16" r="9"') + L("M46 50L54 58M62 40L74 54M52 70L66 80") + H(50, 46, 3.5, 9, 25); },
    kite: function (c) { return L("M60 100Q50 108 62 116", 4) + B(c, 'path d="M60 8L98 52L60 100L22 52Z"') + L("M60 10V98M24 52H96") + H(46, 36, 4, 9, 40); },
    drum: function (c) { return L("M84 22L104 8M36 22L16 8", 6) + B(c, 'path d="M20 42V84Q20 100 60 100Q100 100 100 84V42Z"') + P("cream", 'ellipse cx="60" cy="42" rx="40" ry="13"') + L("M22 58L40 86L60 62L80 86L98 58"); },
    block: function (c) { return B(c, 'rect x="18" y="18" width="84" height="84" rx="12"') + P("cream", 'path d="' + star(60, 62, 24, 11) + '"') + H(32, 28, 8, 3); },
    teddy: function (c) { return B(c, 'circle cx="34" cy="22" r="12"', 'circle cx="86" cy="22" r="12"', 'circle cx="60" cy="40" r="28"', 'ellipse cx="60" cy="78" rx="27" ry="22"', 'circle cx="27" cy="70" r="10"', 'circle cx="93" cy="70" r="10"', 'ellipse cx="38" cy="100" rx="15" ry="13"', 'ellipse cx="82" cy="100" rx="15" ry="13"') + P("cream", 'ellipse cx="60" cy="49" rx="12" ry="9"', 'ellipse cx="60" cy="80" rx="12" ry="11"', 'ellipse cx="36" cy="103" rx="8" ry="7"', 'ellipse cx="84" cy="103" rx="8" ry="7"') + '<ellipse cx="60" cy="45" rx="5" ry="3.5" fill="' + INK + '"/>' + E(48, 34, 4.5) + E(72, 34, 4.5) + H(42, 22, 6, 3, -30); },   // option A, sitting with feet forward (Sivan, 15 Nov)
    crayon: function (c) { return B(c, 'path d="M48 34L60 8L72 34Z"', 'rect x="42" y="32" width="36" height="76" rx="6"') + P("cream", 'rect x="42" y="52" width="36" height="34"') + L("M42 60H78M42 78H78", 3) + H(50, 40, 3, 5); },
    gift: function (c) { return B(c, 'rect x="20" y="50" width="80" height="54" rx="6"', 'rect x="13" y="34" width="94" height="22" rx="6"') + P("cream", 'rect x="52" y="34" width="16" height="70"', 'circle cx="46" cy="24" r="10"', 'circle cx="74" cy="24" r="10"') + L("M13 56H107") + H(24, 40, 6, 2.5); },
    // ---- sea
    fish: function (c) { return B(c, 'path d="M10 60Q40 20 76 48L106 28Q98 60 106 92L76 72Q40 100 10 60Z"') + E(34, 55, 6) + L("M54 44Q63 60 54 76") + K(40, 68) + H(48, 40, 7, 3, -18); },
    whale: function (c) { return L("M44 26Q40 14 30 16M46 26Q52 14 62 18", 4) + B(c, 'path d="M10 68Q10 38 48 38Q82 38 90 62Q98 58 100 44Q114 56 108 74Q102 88 90 84Q76 100 48 100Q10 100 10 68Z"') + E(32, 64, 5) + L("M22 80Q36 88 50 80") + K(26, 74) + H(36, 46, 9, 3.5, -8); },
    crab: function (c) { return L("M30 84L16 98M40 92L32 106M90 84L104 98M80 92L88 106", 6) + B(c, 'circle cx="20" cy="42" r="13"', 'circle cx="100" cy="42" r="13"', 'path d="M28 52L38 62H32Z"', 'path d="M92 52L82 62H88Z"', 'ellipse cx="60" cy="72" rx="36" ry="26"') + L("M48 48V40M72 48V40") + E(48, 38, 5) + E(72, 38, 5) + L("M50 80Q60 88 70 80") + K(40, 78) + K(80, 78) + H(42, 56, 7, 3, -15); },
    starfish: function (c) { return B(c, 'path d="' + star(60, 64, 50, 24) + '"') + '<g fill="' + CREAM + '"><circle cx="60" cy="38" r="4"/><circle cx="60" cy="64" r="5"/><circle cx="38" cy="58" r="4"/><circle cx="82" cy="58" r="4"/><circle cx="46" cy="84" r="4"/><circle cx="74" cy="84" r="4"/></g>'; },
    shell: function (c) { return B(c, 'path d="M60 102Q16 90 12 52Q14 18 60 18Q106 18 108 52Q104 90 60 102Z"', 'path d="M46 98H74V108H46Z"') + L("M60 100V22M60 100L34 28M60 100L86 28M60 100L18 50M60 100L102 50") + H(34, 34, 6, 3, -40); },
    bucket: function (c) { return L("M26 44Q60 -6 94 44", 6) + B(c, 'path d="M22 40H98L88 98Q87 104 80 104H40Q33 104 32 98Z"') + P("cream", 'rect x="18" y="36" width="84" height="12" rx="6"') + H(36, 60, 4, 10, 8); },
    duck: function (c) { return P("cream", 'path d="M94 40L114 46L96 56Z"') + B(c, 'path d="M14 74L4 60Q16 60 22 68Z"', 'ellipse cx="54" cy="80" rx="42" ry="24"', 'circle cx="76" cy="44" r="24"') + E(84, 40, 5) + L("M34 78Q48 92 64 78") + K(74, 54) + H(64, 28, 6, 3, -30); },
    // ---- garden
    flower: function (c) { return B.apply(null, [c].concat(petals(5, 27, 19))) + P("cream", 'circle cx="60" cy="60" r="15"') + H(52, 24, 6, 3, -25); },
    tulip: function (c) { return L("M60 70V112M60 96Q42 94 38 80M60 100Q78 98 82 84", 6) + B(c, 'path d="M30 26Q44 30 46 40Q52 20 60 16Q68 20 74 40Q76 30 90 26Q96 70 60 74Q24 70 30 26Z"') + H(42, 42, 4, 8, 10); },
    butterfly: function (c) { return L("M56 24Q50 10 42 12M64 24Q70 10 78 12", 4) + B(c, 'circle cx="34" cy="46" r="24"', 'circle cx="86" cy="46" r="24"', 'circle cx="40" cy="84" r="17"', 'circle cx="80" cy="84" r="17"') + P("cream", 'circle cx="32" cy="46" r="8"', 'circle cx="88" cy="46" r="8"') + P("ink", 'ellipse cx="60" cy="62" rx="6" ry="30"') + H(22, 32, 6, 3, -35); },
    apple: function (c) { return L("M60 32Q60 20 66 12", 6) + P("cream", 'path d="M66 20Q80 6 94 16Q82 30 66 20Z"') + B(c, 'path d="M60 34Q42 22 26 34Q10 50 20 78Q30 106 48 104Q56 104 60 100Q64 104 72 104Q90 106 100 78Q110 50 94 34Q78 22 60 34Z"') + H(34, 50, 5, 10, 20); },
    umbrella: function (c) { return L("M60 60V98Q60 110 49 110Q40 110 40 100", 7) + L("M60 18V8", 6) + B(c, 'path d="M8 64Q10 20 60 18Q110 20 112 64Q98 52 86 64Q72 52 60 64Q48 52 34 64Q22 52 8 64Z"') + L("M60 20Q46 40 34 62M60 20Q74 40 86 62") + H(30, 36, 8, 3.5, -40); },
    mushroom: function (c) { return P("cream", 'path d="M44 66H76L82 100Q82 108 74 108H46Q38 108 38 100Z"') + B(c, 'path d="M8 60Q8 14 60 14Q112 14 112 60Q112 70 102 70H18Q8 70 8 60Z"') + '<g fill="' + CREAM + '"><circle cx="40" cy="40" r="8"/><circle cx="72" cy="32" r="6"/><circle cx="88" cy="52" r="7"/><circle cx="58" cy="56" r="5"/></g>' + H(26, 34, 5, 3, -40); },
    bird: function (c) { return P("cream", 'path d="M22 54L4 60L22 68Z"') + L("M50 96V108M66 96V108", 5) + B(c, 'path d="M84 56L112 40L106 76Z"', 'circle cx="56" cy="62" r="36"') + E(38, 52, 5) + L("M50 64Q64 84 80 62") + K(34, 66) + H(46, 36, 7, 3, -25); },
    leaf: function (c) { return L("M22 100L10 112", 6) + B(c, 'path d="M18 102Q8 36 104 14Q112 96 40 106Z"') + L("M24 98L94 28M44 78V54M44 78H70M64 58V38M64 58H86") + H(38, 50, 4, 9, 40); },
    cloud: function (c) { return B(c, 'path d="M30 92Q8 92 8 72Q8 54 28 52Q30 28 56 28Q76 28 82 46Q112 44 112 70Q112 92 90 92Z"') + H(40, 40, 9, 3.5, -15); },
    moon: function (c) { return B(c, 'path d="M82 12Q40 18 40 60Q40 102 82 108Q28 116 14 60Q28 4 82 12Z"') + H(28, 44, 4, 10, 15); },
    // ---- food
    cupcake: function (c) { return P("cream", 'path d="M26 62H94L86 102Q85 108 78 108H42Q35 108 34 102Z"') + L("M46 68L49 104M60 68V104M74 68L71 104", 3) + B(c, 'path d="M22 64Q12 46 30 40Q28 20 50 22Q60 6 74 22Q96 20 92 42Q110 48 98 64Z"') + H(38, 34, 7, 3, -25); },
    icecream: function (c) { return P("wood", 'path d="M34 60H86L60 114Z"') + L("M44 66L66 100M76 66L54 100", 3) + B(c, 'circle cx="60" cy="40" r="30"', 'path d="M30 54Q32 66 42 62Q50 72 60 62Q70 72 78 62Q88 66 90 54Z"') + H(46, 24, 8, 4, -30); },
    lollipop: function (c) { return P("cream", 'rect x="56" y="74" width="8" height="40" rx="4"') + B(c, 'circle cx="60" cy="46" r="36"') + L("M60 46Q60 34 72 36Q84 42 80 58Q72 72 54 68Q36 60 40 40Q46 22 66 22", 4) + H(38, 26, 7, 3, -40); },
    pear: function (c) { return L("M60 22Q58 12 64 6", 6) + B(c, 'path d="M60 20Q76 20 78 40Q80 52 92 66Q104 86 90 100Q78 110 60 108Q42 110 30 100Q16 86 28 66Q40 52 42 40Q44 20 60 20Z"') + H(42, 66, 5, 10, 15); },
    cookie: function (c) { return B(c, 'circle cx="60" cy="60" r="44"') + '<g fill="' + INK + '"><circle cx="44" cy="44" r="5"/><circle cx="72" cy="38" r="4"/><circle cx="80" cy="64" r="5"/><circle cx="54" cy="70" r="4"/><circle cx="36" cy="72" r="4"/><circle cx="66" cy="88" r="5"/></g>' + H(34, 30, 7, 3, -40); },
    // ---- home and clothes
    boot: function (c) { return B(c, 'path d="M36 12H70V64Q100 66 104 88V98Q104 106 96 106H36Q28 106 28 98V20Q28 12 36 12Z"') + P("cream", 'rect x="26" y="10" width="46" height="14" rx="6"') + L("M30 94H102") + H(38, 40, 4, 10); },
    sock: function (c) { return B(c, 'path d="M40 12H76V58L100 80Q110 94 96 104Q82 112 68 100L40 72Z"') + P("cream", 'rect x="36" y="10" width="44" height="16" rx="6"') + L("M70 100Q82 96 88 84") + H(48, 42, 4, 9); },
    mitten: function (c) { return B(c, 'path d="M36 100V60Q18 54 18 42Q22 30 36 40Q36 12 64 12Q92 12 92 44V100Z"') + P("cream", 'rect x="30" y="92" width="68" height="16" rx="7"') + H(50, 28, 5, 9, 15); },
    shirt: function (c) { return B(c, 'path d="M40 14Q60 30 80 14L110 36L96 56L86 50V104H34V50L24 56L10 36Z"') + L("M42 16Q60 34 78 16") + H(28, 34, 6, 3, -35); },
    cup: function (c) { return L("M82 44Q106 44 106 62Q106 82 82 80", 7) + B(c, 'path d="M20 28H84V86Q84 102 68 102H36Q20 102 20 86Z"') + P("cream", 'rect x="16" y="24" width="72" height="12" rx="6"') + H(32, 54, 4, 10); },
    backpack: function (c) { return L("M46 18Q60 0 74 18", 6) + B(c, 'path d="M26 42Q26 16 60 16Q94 16 94 42V98Q94 106 86 106H34Q26 106 26 98Z"') + P("cream", 'rect x="40" y="62" width="40" height="30" rx="8"') + L("M28 48H92M40 74H80") + H(38, 28, 7, 3, -25); },
    book: function (c) { return P("cream", 'path d="M30 94H100V106H30Q22 106 22 100Q22 94 30 94Z"') + B(c, 'path d="M22 18H96Q100 18 100 22V94H30Q22 94 22 100V22Q22 18 22 18Z"') + P("cream", 'rect x="42" y="34" width="42" height="22" rx="5"') + L("M34 20V92") + H(48, 26, 8, 2.5); },
    bell: function (c) { return P("cream", 'circle cx="60" cy="100" r="9"') + B(c, 'circle cx="60" cy="16" r="6"', 'path d="M60 18Q90 22 90 58Q90 78 104 86V94H16V86Q30 78 30 58Q30 22 60 18Z"') + L("M18 86H102") + H(44, 40, 4, 10, 15); },
    house: function (c) { return P("cream", 'rect x="24" y="54" width="72" height="50" rx="4"') + P(GLASS, 'rect x="34" y="66" width="18" height="18" rx="3"') + P("wood", 'path d="M64 104V76Q64 68 72 68Q80 68 80 76V104Z"') + B(c, 'path d="M60 12L110 58H10Z"') + H(46, 36, 3.5, 8, 45); },
    magnifier: function (c) { return '<path d="M78 78L102 102" stroke="' + INK + '" stroke-width="26" stroke-linecap="round"/><path d="M78 78L102 102" stroke="' + COLORS[c][0] + '" stroke-width="13" stroke-linecap="round"/>' + B(c, 'circle cx="50" cy="50" r="36"') + P(GLASS, 'circle cx="50" cy="50" r="23"') + H(42, 41, 7, 4, -35); },
    tent: function (c) { return B(c, 'path d="M60 14L108 100H12Z"') + P("cream", 'path d="M60 50L80 100H40Z"') + L("M60 14V100", 4) + H(48, 46, 3.5, 10, 30); },
    heart: function (c) { return B(c, 'path d="M60 104C24 80 10 60 10 42C10 26 22 16 34 16C46 16 54 22 60 32C66 22 74 16 86 16C98 16 110 26 110 42C110 60 96 80 60 104Z"') + H(32, 36, 8, 5, -35); },
    star: function (c) { return B(c, 'path d="' + star(60, 64, 50, 23) + '"') + H(50, 40, 3.5, 8, 20); }
  };
  var FAMILIES = {
    toys: ["car", "truck", "bus", "train", "plane", "rocket", "boat", "ball", "balloon", "hat", "kite", "drum", "block", "teddy", "crayon", "gift"],
    sea: ["fish", "whale", "crab", "starfish", "shell", "bucket", "duck"],
    garden: ["flower", "tulip", "butterfly", "apple", "umbrella", "mushroom", "bird", "leaf", "cloud", "moon"],
    food: ["cupcake", "icecream", "lollipop", "pear", "cookie"],
    home: ["boot", "sock", "mitten", "shirt", "cup", "backpack", "book", "bell", "house", "heart", "star"]
  };
  function svg(inner, label, vb) { return '<svg viewBox="' + (vb || "0 0 120 120") + '" ' + (label ? 'role="img" aria-label="' + label + '"' : 'aria-hidden="true"') + ">" + inner + "</svg>"; }
  g.KDArt = {
    INK: INK, COLORS: COLORS, FAMILIES: FAMILIES, kinds: Object.keys(T), playColors: ["red", "blue", "yellow", "green", "orange", "purple"],
    B: B, P: P, L: L, H: H, E: E, K: K, starPath: star, svg: svg,
    thing: function (kind, color, label) { return svg(T[kind](color), label); },
    inner: function (kind, color) { return T[kind](color); },
    silhouette: function (kind, label) { return svg('<g class="kd-sil">' + T[kind]("ink") + "</g>", label); },
    splat: function (color, label) { return svg(B(color, 'path d="M60 8c10 0 12 14 22 12s19-7 22 5-10 14-5 24 17 12 10 24-17 2-22 12-2 22-17 22-12-14-22-14-19 10-24-2 10-14 5-24-17-10-12-22 17-5 22-12S50 8 60 8z"') + H(44, 34, 8, 4, -30), label); }
  };
})(window);
/* ---- interface icons and game badges, same language ---- */
(function (A) {
  "use strict";
  var B = A.B, P = A.P, L = A.L, H = A.H, sp = A.starPath;
  var I = {
    home: function () { return P("cream", 'rect x="28" y="56" width="64" height="46" rx="6"') + P("wood", 'path d="M52 102V80Q52 72 60 72Q68 72 68 80V102Z"') + B("yellow", 'path d="M60 14L108 58H12Z"') + H(46, 38, 3.5, 8, 45); },
    grownups: function () { return B("white", 'circle cx="44" cy="34" r="17"', 'path d="M14 104Q14 62 44 62Q74 62 74 104Z"') + B("yellow", 'circle cx="86" cy="60" r="12"', 'path d="M64 104Q64 80 86 80Q108 80 108 104Z"'); },
    soundOn: function () { return B("yellow", 'path d="M14 46H32L56 24V96L32 74H14Z"') + L("M74 44Q86 60 74 76M88 30Q110 60 88 90", 7); },
    soundOff: function () { return B("white", 'path d="M14 46H32L56 24V96L32 74H14Z"') + L("M76 60H104", 7); },
    play: function () { return B("ink", 'path d="M44 28L92 60L44 92Z"'); },
    again: function () { return '<path d="M81.9 38A34 34 0 1 1 45.6 33.2" fill="none" stroke="#2B2D5C" stroke-width="13" stroke-linecap="round"/><path d="M69.2 22.2L39.7 20.5L51.5 45.9Z" fill="#2B2D5C" stroke="#2B2D5C" stroke-width="7" stroke-linejoin="round"/>'; },
    hand: function () { return '<g fill="#2B2D5C" stroke="#2B2D5C" stroke-width="13" stroke-linejoin="round"><path d="M46 14H74V58H96L60 104L24 58H46Z"/></g><path d="M46 14H74V58H96L60 104L24 58H46Z" fill="#4F7F3E"/><path d="M46 14H70V60H90L58 98L28 60H46Z" fill="#A3C26B"/>' + H(54, 26, 3, 9); },
    star: function () { return B("yellow", 'path d="' + sp(60, 64, 50, 23) + '"') + H(50, 40, 3.5, 8, 20); },
    starOff: function () { return '<path d="' + sp(60, 64, 50, 23) + '" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.55)" stroke-width="6" stroke-linejoin="round"/>'; },
    palette: function () { return B("cream", 'path d="M60 14C32 14 12 34 12 60C12 86 32 104 54 104C68 104 68 94 63 87C58 79 64 70 74 70H86C102 70 110 60 110 50C110 28 88 14 60 14Z"') + '<circle cx="36" cy="50" r="9" fill="' + A.COLORS.red[0] + '"/><circle cx="57" cy="34" r="9" fill="' + A.COLORS.yellow[0] + '"/><circle cx="82" cy="40" r="9" fill="' + A.COLORS.blue[0] + '"/><circle cx="34" cy="76" r="9" fill="' + A.COLORS.green[0] + '"/>'; },
    things: function () { return '<g transform="translate(58 0) scale(.5)">' + A.inner("star", "white") + '</g><g transform="translate(0 4) scale(.56)">' + A.inner("ball", "white") + '</g><g transform="translate(22 42) scale(.74)">' + A.inner("car", "white") + "</g>"; }
  };
  var BD = {
    hunt: function () { return B("red", 'circle cx="40" cy="40" r="18"') + B("yellow", 'path d="' + sp(78, 36, 22, 10) + '"') + B("wood", 'path d="M14 54H106V62H100L92 100Q91 106 84 106H36Q29 106 28 100L20 62H14Z"') + L("M22 62H98M40 62L44 104M60 62V104M80 62L76 104", 3); },
    builds: function () { return B("blue", 'rect x="16" y="56" width="50" height="50" rx="6"') + B("red", 'path d="M41 10L72 56H10Z"') + B("yellow", 'circle cx="88" cy="84" r="22"') + H(24, 64, 6, 2.5) + H(80, 72, 6, 3, -30); },
    feelings: function () { return B("pink", 'path d="M60 104C24 80 10 60 10 42C10 26 22 16 34 16C46 16 54 22 60 32C66 22 74 16 86 16C98 16 110 26 110 42C110 60 96 80 60 104Z"') + H(32, 36, 8, 5, -35); },
    freeze: function () { return L("M88 22L108 8M32 22L12 8", 6) + B("orange", 'path d="M20 42V84Q20 100 60 100Q100 100 100 84V42Z"') + P("cream", 'ellipse cx="60" cy="42" rx="40" ry="13"') + L("M22 58L40 86L60 62L80 86L98 58"); }
  };
  A.icon = function (name, label) { return A.svg(I[name](), label); };
  A.badge = function (name, label) { return A.svg(BD[name](), label); };
  A.iconNames = Object.keys(I); A.badgeNames = Object.keys(BD);
})(window.KDArt);
