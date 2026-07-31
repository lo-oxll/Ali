/**
 * Ali Kamil — personal site (book edition, matching the coding.stella
 * "3D Portfolio Book" tutorial structure/behaviour, mirrored for RTL
 * Arabic reading).
 *
 * Page flip is done in two 90 degree stages with a content swap at
 * the midpoint (when the leaf is edge-on and invisible) instead of
 * the classic CSS-only backface-visibility technique. Safari has a
 * long-standing bug where backface-visibility fails on *nested*
 * rotating 3D elements (a page rotating inside a leaf that is also
 * rotating), which shows the wrong face mirrored. Because this leaf
 * always rests at 0deg -- it only ever passes briefly through 90deg
 * during the animation, never staying rotated -- that bug never has
 * a chance to trigger, on any browser.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobileLayout = window.matchMedia('(max-width: 880px)').matches;
  var HALF_MS = 260;

  var coverFront = document.getElementById('coverFront');
  var spreads = Array.prototype.slice.call(document.querySelectorAll('.book-page.page-flip'));
  var totalSpreads = spreads.length;

  spreads.forEach(function (s, i) {
    s.style.zIndex = String(totalSpreads - i);
    s.dataset.state = 'front';
    s.dataset.animating = '0';
  });

  function flipLeaf(leaf, callback) {
    if (isMobileLayout || leaf.dataset.animating === '1') { if (callback) callback(); return; }
    var front = leaf.querySelector('.page-front');
    var back = leaf.querySelector('.page-back');
    var showingFront = leaf.dataset.state !== 'back';

    if (prefersReducedMotion) {
      if (showingFront) { front.style.display = 'none'; back.style.display = 'block'; leaf.dataset.state = 'back'; }
      else { back.style.display = 'none'; front.style.display = 'block'; leaf.dataset.state = 'front'; }
      if (callback) callback();
      return;
    }

    leaf.dataset.animating = '1';
    leaf.style.transition = 'transform ' + HALF_MS + 'ms ease-in';
    leaf.style.transform = 'rotateY(90deg)';

    setTimeout(function () {
      if (showingFront) { front.style.display = 'none'; back.style.display = 'block'; leaf.dataset.state = 'back'; }
      else { back.style.display = 'none'; front.style.display = 'block'; leaf.dataset.state = 'front'; }

      leaf.style.transition = 'none';
      leaf.style.transform = 'rotateY(-90deg)';
      void leaf.offsetWidth;

      leaf.style.transition = 'transform ' + HALF_MS + 'ms ease-out';
      leaf.style.transform = 'rotateY(0deg)';

      setTimeout(function () {
        leaf.dataset.animating = '0';
        if (callback) callback();
      }, HALF_MS);
    }, HALF_MS);
  }

  document.querySelectorAll('.nextprev-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-page');
      var spread = document.getElementById(id);
      if (spread) flipLeaf(spread);
    });
  });

  var contactMeBtn = document.getElementById('contactMeBtn');
  if (contactMeBtn) {
    contactMeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      function step(i) {
        if (i >= spreads.length) return;
        var spread = spreads[i];
        if (spread.dataset.state === 'front') {
          flipLeaf(spread, function () { step(i + 1); });
        } else {
          step(i + 1);
        }
      }
      step(0);
    });
  }

  var backProfileBtn = document.getElementById('backProfile');
  if (backProfileBtn) {
    backProfileBtn.addEventListener('click', function () {
      var order = spreads.slice().reverse();
      function step(i) {
        if (i >= order.length) {
          if (coverFront) coverFront.classList.remove('turn');
          return;
        }
        var spread = order[i];
        if (spread.dataset.state === 'back') {
          flipLeaf(spread, function () { step(i + 1); });
        } else {
          step(i + 1);
        }
      }
      step(0);
    });
  }

  if (coverFront) {
    coverFront.addEventListener('click', function () {
      coverFront.classList.toggle('turn');
    });
  }

  if (!isMobileLayout && !prefersReducedMotion && coverFront) {
    setTimeout(function () {
      coverFront.classList.add('turn');
    }, 900);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
