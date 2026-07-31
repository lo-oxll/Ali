/**
 * Ali Kamil — personal site (book edition, matches the reference structure)
 *  - opens the cover on click
 *  - flips each of the three inner spreads independently via the
 *    next/prev corner buttons
 *  - "back to profile" resets everything
 */
(function () {
  'use strict';

  var coverFront = document.getElementById('coverFront');
  var backProfileBtn = document.getElementById('backProfile');
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.book-page.page-flip'));

  function openCover() {
    if (coverFront) coverFront.classList.add('turn');
  }

  function resetAll() {
    if (coverFront) coverFront.classList.remove('turn');
    spreads.forEach(function (s) { s.classList.remove('turn'); });
  }

  if (coverFront) {
    coverFront.addEventListener('click', openCover);
  }

  document.querySelectorAll('.nextprev-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-page');
      var spread = document.getElementById(id);
      if (spread) spread.classList.toggle('turn');
    });
  });

  if (backProfileBtn) {
    backProfileBtn.addEventListener('click', resetAll);
  }

  // ---- Register service worker for offline support ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
