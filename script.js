/**
 * Ali Kamil — personal site (ledger/dossier book edition)
 *  - light/dark theme toggle (persisted)
 *  - opens/closes the front cover
 *  - flips each of the three inner spreads independently
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

  // ---- Cover open/close ----
  var coverFront = document.getElementById('coverFront');
  var closeBookBtn = document.getElementById('closeBook');
  var wrapper = document.getElementById('wrapper');
  var leaves = Array.prototype.slice.call(document.querySelectorAll('.leaf-flip'));

  function openCover() {
    if (coverFront) coverFront.classList.add('turn');
  }
  function closeEverything() {
    if (coverFront) coverFront.classList.remove('turn');
    leaves.forEach(function (leaf) { leaf.classList.remove('turn'); });
  }

  if (coverFront) {
    coverFront.addEventListener('click', openCover);
    coverFront.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCover();
      }
    });
  }
  if (closeBookBtn) {
    closeBookBtn.addEventListener('click', closeEverything);
  }

  // ---- Page turning ----
  document.querySelectorAll('.page-nav').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-target');
      var leaf = document.getElementById(id);
      if (leaf) leaf.classList.toggle('turn');
    });
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
