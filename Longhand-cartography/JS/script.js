(function () {
  'use strict';

  // Progressive enhancement flag
  document.documentElement.classList.remove('no-js');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Mobile nav toggle
     ------------------------------------------------------------------ */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileNav.hidden = isOpen;
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ------------------------------------------------------------------
     Chart ruler — ticks a fictional coordinate range as the page scrolls
     ------------------------------------------------------------------ */
  var rulerCoordStart = document.querySelector('[data-ruler-coord]');
  var rulerCoordEnd = document.querySelector('[data-ruler-coord-end]');

  // A short lat/long sweep, purely decorative, framed as the page's own graticule
  var LAT_START = 51.5073; // degrees
  var LAT_END = 51.4780;
  var LNG_START = -0.1276;
  var LNG_END = -0.1655;

  function toDMS(deg, isLat) {
    var abs = Math.abs(deg);
    var d = Math.floor(abs);
    var minFloat = (abs - d) * 60;
    var m = Math.floor(minFloat);
    var s = Math.round((minFloat - m) * 60);
    var dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
    return d + '\u00B0' + String(m).padStart(2, '0') + '\u2032' + String(s).padStart(2, '0') + '\u2033' + dir;
  }

  function updateRuler() {
    if (!rulerCoordStart || !rulerCoordEnd) return;

    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var scrollHeight = (doc.scrollHeight - window.innerHeight) || 1;
    var progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);

    var lat = LAT_START + (LAT_END - LAT_START) * progress;
    var lng = LNG_START + (LNG_END - LNG_START) * progress;

    rulerCoordStart.textContent = toDMS(lat, true);
    rulerCoordEnd.textContent = toDMS(lng, false);
  }

  var rulerTicking = false;
  window.addEventListener('scroll', function () {
    if (!rulerTicking) {
      window.requestAnimationFrame(function () {
        updateRuler();
        rulerTicking = false;
      });
      rulerTicking = true;
    }
  }, { passive: true });

  updateRuler();

  /* ------------------------------------------------------------------
     Header state on scroll (subtle border strengthening)
     ------------------------------------------------------------------ */
  var header = document.querySelector('[data-header]');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     Commission form — static demo submit handling
     ------------------------------------------------------------------ */
  var form = document.querySelector('[data-commission-form]');
  var status = document.querySelector('[data-form-status]');

  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var required = form.querySelectorAll('[required]');
      var firstInvalid = null;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (firstInvalid) {
        status.textContent = 'Please fill in every field before sending.';
        firstInvalid.focus();
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending\u2026';

      window.setTimeout(function () {
        status.textContent = 'Thank you \u2014 your inquiry has been sent. We reply within two business days.';
        submitBtn.textContent = originalLabel;
        submitBtn.disabled = false;
        form.reset();
      }, 700);
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

})();