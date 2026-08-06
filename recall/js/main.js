(function () {
  'use strict';

  var root = document.getElementById('recall-root');

  /* ═══════════════════════════════════════════════
     THEME TOGGLE
     ═══════════════════════════════════════════════ */
  var themeBtn = document.getElementById('themeToggle');
  var stored = localStorage.getItem('recall-theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.classList.replace('theme-light', 'theme-dark');
  }
  themeBtn.addEventListener('click', function () {
    var isDark = root.classList.contains('theme-dark');
    root.classList.replace(isDark ? 'theme-dark' : 'theme-light', isDark ? 'theme-light' : 'theme-dark');
    localStorage.setItem('recall-theme', isDark ? 'light' : 'dark');
  });

  /* ═══════════════════════════════════════════════
     HAMBURGER MENU
     ═══════════════════════════════════════════════ */
  var hamburger = document.getElementById('navHamburger');
  var navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.classList.contains('nav-link')) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ═══════════════════════════════════════════════
     NAV — settle onto the page once scrolling starts
     ═══════════════════════════════════════════════ */
  var navBar = document.querySelector('.nav-bar');
  var navTicking = false;
  function syncNav() {
    navBar.classList.toggle('nav-bar--scrolled', window.scrollY > 24);
    navTicking = false;
  }
  window.addEventListener('scroll', function () {
    if (!navTicking) {
      navTicking = true;
      window.requestAnimationFrame(syncNav);
    }
  }, { passive: true });
  syncNav();

  /* ═══════════════════════════════════════════════
     SCROLL REVEAL (IntersectionObserver)
     ═══════════════════════════════════════════════ */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = root.querySelectorAll('[data-reveal], [data-anim]');

  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('done'); });
  } else {
    // Elements that come into view together stagger in reading order, so the
    // cadence follows the content rather than a fixed rotation of variants.
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.sort(function (a, b) {
        return (a.target.compareDocumentPosition(b.target) &
          Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
      });
      batch.forEach(function (e, i) {
        e.target.style.setProperty('--reveal-i', i);
        e.target.classList.add('in');
        io.unobserve(e.target);
        setTimeout(function () { e.target.classList.add('done'); }, 1300 + i * 70);
      });
    }, { threshold: 0, rootMargin: '0px 0px 200px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add('done'); }); }, 4500);
  }

  /* ═══════════════════════════════════════════════
     REVIEW CARD STACK
     Pre-create all card DOM nodes so CSS transitions
     animate between states (like React key reconciliation).
     ═══════════════════════════════════════════════ */
  var DECK = [
    { id: 'k1', bucket: 'Statistics', title: 'Bayes\u2019 theorem',        pri: 0.74, rating: 'HARD',   rc: '#F5A623' },
    { id: 'k2', bucket: 'Biology',    title: 'The Krebs cycle',            pri: 0.92, rating: 'GOT IT', rc: '#46A758' },
    { id: 'k3', bucket: 'Spanish',    title: 'The subjunctive mood',       pri: 0.46, rating: 'GOT IT', rc: '#46A758' },
    { id: 'k4', bucket: 'Finance',    title: 'Compound interest',          pri: 0.30, rating: 'EASY',   rc: '#46A758' },
    { id: 'k5', bucket: 'Korean',     title: '\uC0AC\uB791\uD574 \u2014 love', pri: 0.62, rating: 'FORGOT', rc: '#E5484D' },
    { id: 'k6', bucket: 'Philosophy', title: 'The dichotomy of control',   pri: 0.52, rating: 'GOT IT', rc: '#46A758' },
  ];

  var POS = {
    '-1': { ty: 188, sc: 1.04, op: 0,    z: 8  },
    '0':  { ty: 120, sc: 1.0,  op: 1,    z: 20 },
    '1':  { ty: 78,  sc: 0.96, op: 0.92, z: 15 },
    '2':  { ty: 40,  sc: 0.92, op: 0.55, z: 10 },
    '3':  { ty: 6,   sc: 0.88, op: 0.28, z: 5  },
  };

  var cardStack = document.getElementById('cardStack');
  var heroRing = document.getElementById('heroRing');
  var heroDueCount = document.getElementById('heroDueCount');
  var step = 0;
  var len = DECK.length;

  function getPriority(pri) {
    if (pri >= 0.66) return { l: 'HIGH', c: '#E5484D' };
    if (pri >= 0.40) return { l: 'MED',  c: '#F5A623' };
    return { l: 'LOW', c: '#46A758' };
  }

  var cardEls = [];
  for (var i = 0; i < len; i++) {
    var c = DECK[i];
    var dotOp = (0.16 + c.pri * 0.8).toFixed(2);

    var card = document.createElement('div');
    card.className = 'review-card';

    card.innerHTML =
      '<div class="review-card__top">' +
        '<span class="review-card__bucket">' + c.bucket + '</span>' +
        '<span class="review-card__dot" style="opacity:' + dotOp + '"></span>' +
      '</div>' +
      '<div class="review-card__bottom">' +
        '<span class="review-card__title">' + c.title + '</span>' +
        '<span class="review-card__chip"></span>' +
      '</div>';

    cardStack.appendChild(card);
    cardEls.push({
      el: card,
      chip: card.querySelector('.review-card__chip'),
      data: c,
    });
  }

  function updateStack() {
    for (var i = 0; i < len; i++) {
      var entry = cardEls[i];
      var el = entry.el;
      var c = entry.data;
      var p = ((i - step) % len + len) % len;
      if (p === len - 1) p = -1;
      var pos = POS[p];

      if (!pos) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '0';
        continue;
      }

      var reviewed = (p === -1);
      var pri = getPriority(c.pri);
      var chip = reviewed ? { l: c.rating, c: c.rc } : pri;

      el.style.transform = 'translateY(' + pos.ty + 'px) scale(' + pos.sc + ')';
      el.style.transformOrigin = 'center bottom';
      el.style.opacity = pos.op;
      el.style.zIndex = pos.z;
      el.style.pointerEvents = 'auto';
      el.style.boxShadow = p === 0 ? '0 16px 34px var(--shadow)' : '0 8px 20px var(--shadow)';

      entry.chip.textContent = chip.l;
      entry.chip.style.background = chip.c;
      entry.chip.style.transform = reviewed ? 'scale(1.14)' : 'scale(1)';
    }
  }

  function updateRing() {
    var due = 24 - (step % 18);
    heroDueCount.textContent = due;
    heroRing.setAttribute('stroke-dashoffset', 540.4 * (1 - due / 24));
  }

  updateStack();
  updateRing();

  if (!reduce) {
    setInterval(function () {
      step++;
      updateStack();
      updateRing();
    }, 2600);
  }

  /* ═══════════════════════════════════════════════
     HEATMAP
     ═══════════════════════════════════════════════ */
  var heatmapEl = document.getElementById('heatmap');
  var seed = 7;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (var c = 0; c < 12; c++) {
    var col = document.createElement('div');
    col.className = 'heatmap-col';
    for (var r = 0; r < 7; r++) {
      var v = rand();
      var w = v * 0.55 + (c / 12) * 0.45;
      var o;
      if (w < 0.28) o = 0.07;
      else if (w < 0.48) o = 0.22;
      else if (w < 0.68) o = 0.45;
      else if (w < 0.86) o = 0.7;
      else o = 1;
      var cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      cell.style.opacity = o;
      col.appendChild(cell);
    }
    heatmapEl.appendChild(col);
  }

  /* ═══════════════════════════════════════════════
     SMOOTH SCROLL for anchor links
     ═══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
