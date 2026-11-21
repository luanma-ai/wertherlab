/* ============================================
   维特404的主页 — 交互
   ============================================ */
(function () {
  'use strict';

  /* ---------- 年份 ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 顶栏滚动 + 视差 ---------- */
  var header = document.getElementById('header');
  var heroBg = document.getElementById('heroBg');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle('scrolled', y > 40);
      if (heroBg && y < window.innerHeight * 1.2) {
        heroBg.style.transform = 'scale(1.04) translateY(' + (y * 0.16) + 'px)';
      }
      updateActiveNav(y);
      ticking = false;
    });
  }

  /* ---------- 导航高亮 ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var sections = navLinks.map(function (a) {
    var id = a.getAttribute('href').slice(1);
    return document.getElementById(id);
  }).filter(Boolean);

  function updateActiveNav(y) {
    if (!sections.length) return;
    var mid = y + window.innerHeight * 0.4;
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.offsetTop <= mid) current = s;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 滚动显现 ---------- */
  function observeReveal(els) {
    if (!els.length) return;
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el, i) {
        el.style.transitionDelay = ((i % 3) * 90) + 'ms';
        io.observe(el);
      });
    } else {
      els.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // 本地直接双击打开时 fetch 会被浏览器拦；这时用内联兜底数据
  function loadJSON(url, fallback) {
    return fetch(url)
      .then(function (r) { return r.json(); })
      .catch(function () { return fallback; });
  }

  var PHOTOS_FALLBACK = window.__PHOTOS__ || [];
  var POEMS_FALLBACK = window.__POEMS__ || [];

  /* ---------- 照片墙 ---------- */
  // 版面：按图片比例分配，宽图占 7/5，竖图占窄栏，全景通栏
  var layoutSeq = ['s1', 's2', 's3', 's4'];

  var gallery = document.getElementById('gallery');
  var shots = [];

  loadJSON('assets/data/photos.json', PHOTOS_FALLBACK).then(function (photos) {
    if (!photos || !photos.length) {
      gallery.innerHTML = '<p class="loading-hint">照片还没放上来。</p>';
      return;
    }
    var html = photos.map(function (p, i) {
      var cls;
      if (p.size === 'panorama') cls = 's5';
      else if (p.size === 'portrait') cls = 's6';
      else if (p.size === 'tall') cls = 's3';
      else cls = layoutSeq[i % layoutSeq.length];
      return '<figure class="shot ' + cls + '" data-index="' + i + '">' +
        '<img src="assets/img/thumb/' + esc(p.file) + '" data-full="assets/img/' + esc(p.file) + '" alt="' + esc(p.alt || p.title) + '" loading="lazy" decoding="async">' +
        '<span class="shot-index">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<figcaption class="shot-cap">' + esc(p.title || '') + '</figcaption>' +
        '</figure>';
    }).join('');
    gallery.innerHTML = html;

    shots = Array.prototype.slice.call(gallery.querySelectorAll('.shot'));
    observeReveal(shots);
    bindLightbox();
  });

  /* ---------- 灯箱 ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbBound = false;

  function bindLightbox() {
    if (lbBound || !lightbox || !shots.length) return;
    lbBound = true;

    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var current = 0;

    var openAt = function (i) {
      current = (i + shots.length) % shots.length;
      var fig = shots[current];
      var img = fig.querySelector('img');
      var cap = fig.querySelector('.shot-cap');
      lbImg.src = img.getAttribute('data-full') || img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt') || '';
      lbCap.textContent = (cap ? cap.textContent : '') +
        '　' + String(current + 1).padStart(2, '0') + ' / ' + String(shots.length).padStart(2, '0');
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    var closeLb = function () {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () { lbImg.src = ''; }, 400);
    };

    shots.forEach(function (fig, i) {
      fig.addEventListener('click', function () { openAt(i); });
    });

    var el;
    if ((el = document.getElementById('lbClose'))) el.addEventListener('click', closeLb);
    if ((el = document.getElementById('lbPrev'))) el.addEventListener('click', function (e) { e.stopPropagation(); openAt(current - 1); });
    if ((el = document.getElementById('lbNext'))) el.addEventListener('click', function (e) { e.stopPropagation(); openAt(current + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();
    });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') openAt(current - 1);
      if (e.key === 'ArrowRight') openAt(current + 1);
    });
  }

  /* ---------- 涌泉录 ---------- */
  var poemList = document.getElementById('poemList');

  loadJSON('assets/data/poems.json', POEMS_FALLBACK).then(function (poems) {
    if (!poems || !poems.length) {
      poemList.innerHTML = '<p class="loading-hint">诗还没写上来。</p>';
      return;
    }
    poemList.innerHTML = poems.map(function (p, i) {
      var rev = (i % 2 === 1) ? ' reverse' : '';
      var img = p.image
        ? '<div class="poem-side"><img src="assets/img/thumb/' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async"></div>'
        : '<div class="poem-side"></div>';
      var lines = (p.lines || []).map(function (l) {
        return '<p>' + esc(l) + '</p>';
      }).join('');
      return '<article class="poem' + rev + ' reveal">' + img +
        '<div class="poem-body"><h3 class="poem-title">' + esc(p.title) + '</h3>' +
        '<div class="poem-lines">' + lines + '</div></div></article>';
    }).join('');

    observeReveal(Array.prototype.slice.call(poemList.querySelectorAll('.reveal')));
  });

  /* ---------- 小v 内层 ---------- */
  var xvOpen = document.getElementById('xvOpen');
  if (xvOpen) {
    xvOpen.addEventListener('click', function (e) {
      e.preventDefault();
      // 内层还没写完，先给个诚实的话
      var veil = document.getElementById('xvVeil');
      var hidden = document.getElementById('xvHidden');
      if (veil) veil.style.display = 'none';
      if (hidden) hidden.removeAttribute('hidden');
    });
  }

  /* ---------- 隐着的门 ---------- */
  /*
    这不是加密，是道门。
    口令只以 salted SHA-256 的前 16 位存在这里，明文不落盘。
    但静态站点挡不住真想看的人 —— 要更严就得后端验证。
  */
  var GATE_SALT = 'werther-404-diary';
  var GATE_HASH = 'fde2bb6f1e6ea637';

  var quietToggle = document.getElementById('quietToggle');
  var gateWrap = document.getElementById('gateWrap');
  var gateInput = document.getElementById('gateInput');
  var gateBtn = document.getElementById('gateBtn');
  var gateMsg = document.getElementById('gateMsg');

  function sha256hex(str) {
    if (!window.crypto || !window.crypto.subtle) return Promise.resolve(null);
    var enc = new TextEncoder().encode(str);
    return window.crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ('0' + b.toString(16)).slice(-2);
      }).join('');
    });
  }

  function fail(msg) {
    if (!gateMsg) return;
    gateMsg.textContent = msg;
    gateMsg.classList.add('show');
  }

  function tryOpen() {
    var val = (gateInput.value || '').trim();
    if (!val) return;
    sha256hex(GATE_SALT + '::' + val).then(function (h) {
      if (!h) { fail('这个浏览器不支持'); return; }
      if (h.slice(0, 16) === GATE_HASH) {
        try { sessionStorage.setItem('diary_ok', h); } catch (err) {}
        location.href = 'diary.html';
      } else {
        fail('不对');
        gateInput.value = '';
        gateInput.focus();
      }
    });
  }

  if (quietToggle && gateWrap) {
    quietToggle.addEventListener('click', function (e) {
      e.preventDefault();
      if (gateWrap.hasAttribute('hidden')) {
        gateWrap.removeAttribute('hidden');
        gateInput.focus();
      } else {
        gateWrap.setAttribute('hidden', '');
      }
    });
  }

  if (gateBtn) gateBtn.addEventListener('click', tryOpen);
  if (gateInput) {
    gateInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); tryOpen(); }
    });
  }

  /* ---------- 起步 ---------- */
  observeReveal(Array.prototype.slice.call(document.querySelectorAll('.reveal')));
  onScroll();
})();
