/**
 * Ali Kamil — personal site (flipbook edition)
 *  - light/dark theme toggle (persisted)
 *  - single-page flipbook: tap right half / swipe right-to-left = next,
 *    tap left half / swipe left-to-right = previous
 *  - arrow buttons + progress dots as an explicit fallback
 *  - loads projects.json into the "Projects" page
 *  - respects prefers-reduced-motion
 */
(function () {
  'use strict';

  // ---- Theme toggle ----
  var root = document.documentElement;
  var toggleBtn = document.getElementById('themeToggle');

  function getTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي');
    }
  }
  setTheme(getTheme());
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    });
  }

  // ---- Flipbook ----
  var book = document.getElementById('book');
  var leaves = book ? Array.prototype.slice.call(book.querySelectorAll('.leaf')) : [];
  var total = leaves.length;
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var progress = document.getElementById('progress');
  var restartBtn = document.getElementById('restartBtn');
  var turned = 0; // number of leaves currently flipped open (0..total-1)

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // stack leaves so leaf 0 sits on top, each following leaf underneath
  leaves.forEach(function (leaf, i) {
    leaf.style.zIndex = String(total - i);
  });

  // build progress dots
  if (progress) {
    for (var d = 0; d < total; d++) {
      var dot = document.createElement('span');
      progress.appendChild(dot);
    }
  }

  function render() {
    leaves.forEach(function (leaf, i) {
      leaf.classList.toggle('turned', i < turned);
    });
    if (progress) {
      Array.prototype.forEach.call(progress.children, function (dot, i) {
        dot.classList.toggle('is-active', i === turned);
      });
    }
    if (prevBtn) prevBtn.disabled = turned === 0;
    if (nextBtn) nextBtn.disabled = turned === total - 1;
  }

  function next() {
    if (turned < total - 1) { turned++; render(); }
  }
  function prev() {
    if (turned > 0) { turned--; render(); }
  }
  function restart() {
    turned = 0;
    render();
  }

  render();

  if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next(); });
  if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev(); });
  if (restartBtn) restartBtn.addEventListener('click', function (e) { e.stopPropagation(); restart(); });

  // ---- Tap zones + swipe, unified via Pointer Events ----
  if (book) {
    var startX = 0, startY = 0, tracking = false, moved = false;

    book.addEventListener('pointerdown', function (e) {
      // ignore interactive elements inside the page content
      if (e.target.closest('a, button, input, textarea, select')) return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
      moved = false;
    });

    book.addEventListener('pointermove', function (e) {
      if (!tracking) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) moved = true;
    });

    book.addEventListener('pointerup', function (e) {
      if (!tracking) return;
      tracking = false;
      if (e.target.closest('a, button, input, textarea, select')) return;

      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var horizontal = Math.abs(dx) > Math.abs(dy);

      if (moved && horizontal && Math.abs(dx) > 40) {
        // swipe: right-to-left (dx negative) advances, left-to-right goes back
        if (dx < 0) next(); else prev();
        return;
      }

      if (!moved) {
        // simple tap: right half of the book = next, left half = previous
        var rect = book.getBoundingClientRect();
        var relX = e.clientX - rect.left;
        if (relX > rect.width / 2) next(); else prev();
      }
    });

    book.addEventListener('pointercancel', function () { tracking = false; });
  }

  // ---- Keyboard support ----
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') next();
    else if (e.key === 'ArrowRight') prev();
  });

  // ---- Projects: read the pre-built, ordered list from projects.json ----
  var projectGrid = document.getElementById('projectGrid');
  if (projectGrid) {
    var GITHUB_USER = 'lo-oxll';
    var langColors = { JavaScript: 'lang-js', HTML: 'lang-html', CSS: 'lang-css' };

    function showEmptyState() {
      var p = document.createElement('p');
      p.className = 'project-card__desc';
      p.textContent = 'تعذر تحميل المشاريع حالياً. يمكنك تصفحها مباشرة على GitHub من الزر أدناه.';
      projectGrid.innerHTML = '';
      projectGrid.appendChild(p);
    }

    function renderRepos(repos) {
      if (!Array.isArray(repos) || !repos.length) return false;
      var frag = document.createDocumentFragment();
      repos.forEach(function (repo) {
        var a = document.createElement('a');
        a.className = 'project-card';
        if (repo.homepage) a.href = repo.homepage;
        else if (repo.has_pages) a.href = 'https://' + GITHUB_USER + '.github.io/' + repo.name + '/';
        else a.href = repo.html_url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        var top = document.createElement('div');
        top.className = 'project-card__top';

        var name = document.createElement('span');
        name.className = 'project-card__name';
        name.setAttribute('lang', 'en');
        name.setAttribute('dir', 'ltr');
        name.textContent = repo.name;

        var lang = document.createElement('span');
        lang.className = 'project-card__lang';
        if (repo.language) {
          var dot = document.createElement('span');
          dot.className = 'lang-dot ' + (langColors[repo.language] || '');
          lang.appendChild(dot);
          lang.appendChild(document.createTextNode(' ' + repo.language));
        }

        top.appendChild(name);
        top.appendChild(lang);
        a.appendChild(top);

        if (repo.description) {
          var desc = document.createElement('p');
          desc.className = 'project-card__desc';
          desc.textContent = repo.description;
          a.appendChild(desc);
        }
        frag.appendChild(a);
      });
      if (!frag.childNodes.length) return false;
      projectGrid.innerHTML = '';
      projectGrid.appendChild(frag);
      return true;
    }

    fetch('projects.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('projects.json not found');
        return res.json();
      })
      .then(function (repos) { if (!renderRepos(repos)) showEmptyState(); })
      .catch(function () { showEmptyState(); });
  }

  // ---- Register service worker for offline support ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
