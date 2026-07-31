/**
 * Ali Kamil — personal site (book edition, matching the coding.stella
 * "3D Portfolio Book" tutorial structure/behaviour, mirrored for RTL
 * Arabic reading and with backface-visibility fixed so pages never
 * show mirrored text mid-flip).
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobileLayout = window.matchMedia('(max-width: 880px)').matches;

  var coverFront = document.getElementById('coverFront');
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.book-page.page-flip'));
  var totalSpreads = spreads.length;

  // stack spreads so turn-1 sits on top, then turn-2, then turn-3
  spreads.forEach(function (s, i) { s.style.zIndex = String(totalSpreads - i); });

  // ---- next/prev buttons on every page ----
  document.querySelectorAll('.nextprev-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-page');
      var spread = document.getElementById(id);
      if (spread) spread.classList.toggle('turn');
    });
  });

  // ---- "راسلني" (contact-me) on the profile page: flips through
  //      every spread in sequence to land on the contact page ----
  var contactMeBtn = document.getElementById('contactMeBtn');
  if (contactMeBtn) {
    contactMeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      spreads.forEach(function (spread, index) {
        setTimeout(function () {
          spread.classList.add('turn');
        }, prefersReducedMotion ? 0 : (index + 1) * 180);
      });
    });
  }

  // ---- "الملف الشخصي" (back-profile) resets the whole book ----
  var backProfileBtn = document.getElementById('backProfile');
  if (backProfileBtn) {
    backProfileBtn.addEventListener('click', function () {
      // close in reverse order for a natural closing motion
      spreads.slice().reverse().forEach(function (spread, index) {
        setTimeout(function () {
          spread.classList.remove('turn');
        }, prefersReducedMotion ? 0 : (index + 1) * 180);
      });
      if (coverFront) {
        setTimeout(function () {
          coverFront.classList.add('turn');
        }, prefersReducedMotion ? 0 : (totalSpreads + 1) * 180);
      }
    });
  }

  // ---- cover open/close ----
  if (coverFront) {
    coverFront.addEventListener('click', function () {
      coverFront.classList.toggle('turn');
    });
  }

  // ---- opening animation: cover swings open shortly after load,
  //      then each spread's front page reveals in turn (skipped on
  //      mobile, where everything is already laid out in one column,
  //      and skipped for people who prefer reduced motion) ----
  if (!isMobileLayout && !prefersReducedMotion && coverFront) {
    setTimeout(function () {
      coverFront.classList.add('turn');
    }, 900);
  }

  // ---- Register service worker for offline support ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
