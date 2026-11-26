document.documentElement.classList.add('js');

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Theme toggle ---------- */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('themeBtn');

  function label() {
    var dark = root.getAttribute('data-theme') === 'dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }
  label();

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
    window.dispatchEvent(new Event('themechange'));
  });
})();

/* ---------- Header: solid on scroll, mobile menu ---------- */
(function () {
  var bar = document.getElementById('topbar');
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');

  function onScroll() { bar.classList.toggle('scrolled', window.scrollY > 24 || nav.classList.contains('open')); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    onScroll();
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
})();

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Typing roles ---------- */
(function () {
  var el = document.getElementById('typed');
  var roles = ['CSE Graduate', 'Deep Learning for Medical Imaging', 'Aspiring AI Researcher', 'Master\'s Applicant'];
  if (reduceMotion) return;

  var r = 0, c = roles[0].length, deleting = true;
  function tick() {
    var word = roles[r];
    if (deleting) {
      c--;
      if (c <= 0) { deleting = false; r = (r + 1) % roles.length; c = 0; }
    } else {
      c++;
      if (c >= roles[r].length) { deleting = true; el.textContent = roles[r]; return setTimeout(tick, 1900); }
    }
    el.textContent = roles[r].slice(0, c) || '\u00A0';
    setTimeout(tick, deleting ? 38 : 70);
  }
  setTimeout(tick, 1900);
})();

/* ---------- Scroll reveal ---------- */
(function () {
  var items = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (i) { i.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(function (i, n) {
    i.style.transitionDelay = (n % 4) * 70 + 'ms';
    io.observe(i);
  });
})();

/* ---------- Stat count-up ---------- */
(function () {
  var nums = document.querySelectorAll('.count');
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      var el = en.target;
      var to = parseFloat(el.dataset.to);
      var dec = parseInt(el.dataset.dec, 10) || 0;
      var start = performance.now();
      var dur = 1200;
      function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  nums.forEach(function (n) { io.observe(n); });
})();

/* ---------- Contact form: opens the visitor's email app ---------- */
(function () {
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');
  var to = 'bejoy2596@gmail.com';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('cName');
    var email = document.getElementById('cEmail');
    var msg = document.getElementById('cMsg');
    var ok = true;

    [name, email, msg].forEach(function (f) {
      var valid = f.value.trim() !== '' && (f !== email || /^\S+@\S+\.\S+$/.test(f.value.trim()));
      f.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (!valid) ok = false;
    });

    note.classList.toggle('error', !ok);
    if (!ok) {
      note.textContent = 'Fill in your name, a valid email and a message.';
      return;
    }

    var subject = 'Portfolio message from ' + name.value.trim();
    var body = msg.value.trim() + '\n\n' + name.value.trim() + '\n' + email.value.trim();
    window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    note.textContent = 'Your email app should open with the message ready to send.';
  });
})();

/* ---------- Convolution demo ---------- */
(function () {
  var inCv = document.getElementById('scanIn');
  var outCv = document.getElementById('scanOut');
  if (!inCv || !outCv) return;

  var N = 14;
  var M = N - 2;
  var TOTAL = M * M;
  var STEP_MS = 80;
  var HOLD_MS = 2200;

  function hash(x, y) {
    var h = (Math.imul(x + 1, 374761393) ^ Math.imul(y + 7, 668265263)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }

  var img = [];
  for (var y = 0; y < N; y++) {
    img[y] = [];
    for (var x = 0; x < N; x++) {
      var a = Math.exp(-((Math.pow(x - 5.2, 2) / 9) + (Math.pow(y - 5.6, 2) / 12)));
      var b = Math.exp(-((Math.pow(x - 8.2, 2) / 10) + (Math.pow(y - 8.6, 2) / 12)));
      var v = (a + b) * 0.9 + hash(x, y) * 0.14;
      img[y][x] = Math.max(0, Math.min(1, v));
    }
  }

  var KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  var KY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
  var out = [];
  var max = 0;
  for (var oy = 0; oy < M; oy++) {
    out[oy] = [];
    for (var ox = 0; ox < M; ox++) {
      var gx = 0, gy = 0;
      for (var j = 0; j < 3; j++) {
        for (var i = 0; i < 3; i++) {
          gx += KX[j][i] * img[oy + j][ox + i];
          gy += KY[j][i] * img[oy + j][ox + i];
        }
      }
      var m = Math.sqrt(gx * gx + gy * gy);
      out[oy][ox] = m;
      if (m > max) max = m;
    }
  }
  for (oy = 0; oy < M; oy++) for (ox = 0; ox < M; ox++) out[oy][ox] /= max;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function fit(cv) {
    var d = window.devicePixelRatio || 1;
    var w = cv.clientWidth || 200;
    cv.width = Math.round(w * d);
    cv.height = Math.round(w * d);
    return { ctx: cv.getContext('2d'), size: cv.width, d: d };
  }

  var A, B;
  var k = 0;

  function draw(current, showMarker) {
    var gap = Math.max(1, A.d);
    var ctx, cell, i, j;

    ctx = A.ctx;
    cell = A.size / N;
    ctx.clearRect(0, 0, A.size, A.size);
    for (j = 0; j < N; j++) {
      for (i = 0; i < N; i++) {
        var v = img[j][i];
        ctx.fillStyle = 'rgb(' + Math.round(11 + v * 203) + ',' + Math.round(24 + v * 204) + ',' + Math.round(36 + v * 204) + ')';
        ctx.fillRect(i * cell, j * cell, cell - gap + 0.5, cell - gap + 0.5);
      }
    }
    if (showMarker) {
      var kx = current % M, ky = Math.floor(current / M);
      ctx.lineWidth = 2.5 * A.d;
      ctx.strokeStyle = cssVar('--marker');
      ctx.strokeRect(kx * cell + ctx.lineWidth / 2, ky * cell + ctx.lineWidth / 2, 3 * cell - ctx.lineWidth, 3 * cell - ctx.lineWidth);
    }

    ctx = B.ctx;
    cell = B.size / M;
    ctx.clearRect(0, 0, B.size, B.size);
    ctx.fillStyle = cssVar('--surface');
    ctx.fillRect(0, 0, B.size, B.size);
    ctx.fillStyle = cssVar('--accent');
    for (var idx = 0; idx <= current; idx++) {
      var ox2 = idx % M, oy2 = Math.floor(idx / M);
      ctx.globalAlpha = Math.min(1, 0.06 + out[oy2][ox2] * 0.94);
      ctx.fillRect(ox2 * cell, oy2 * cell, cell - gap + 0.5, cell - gap + 0.5);
    }
    ctx.globalAlpha = 1;
    if (showMarker) {
      var cx = current % M, cy = Math.floor(current / M);
      ctx.lineWidth = 2.5 * B.d;
      ctx.strokeStyle = cssVar('--marker');
      ctx.strokeRect(cx * cell + ctx.lineWidth / 2, cy * cell + ctx.lineWidth / 2, cell - ctx.lineWidth, cell - ctx.lineWidth);
    }
  }

  function setup() {
    A = fit(inCv);
    B = fit(outCv);
    draw(reduceMotion ? TOTAL - 1 : k, !reduceMotion);
  }

  setup();
  window.addEventListener('resize', setup);
  window.addEventListener('themechange', function () { draw(reduceMotion ? TOTAL - 1 : k, !reduceMotion); });

  if (reduceMotion) return;

  var last = performance.now();
  var holdUntil = 0;

  function tick(now) {
    if (holdUntil) {
      if (now >= holdUntil) { holdUntil = 0; k = 0; last = now; draw(k, true); }
    } else if (now - last >= STEP_MS) {
      last = now;
      if (k < TOTAL - 1) {
        k++;
        draw(k, true);
      } else {
        draw(TOTAL - 1, false);
        holdUntil = now + HOLD_MS;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
