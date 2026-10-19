/* NS Gloss: site-wide motion system (tokens, load sequence, reveals, page transitions, micro-interactions). */
(function () {
  if (window.NSMotion) return;
  var d = document.documentElement, W = window;
  var mq = function (q) { return !!(W.matchMedia && W.matchMedia(q).matches); };
  var RM = mq('(prefers-reduced-motion: reduce)');
  var LOW = function () { return RM || !!(W.NSPerf && W.NSPerf.low); };
  var MOB = function () { return W.innerWidth < 768; };
  var FINE = mq('(hover: hover) and (pointer: fine)');
  var WA = !!Element.prototype.animate;
  var E = { out: 'cubic-bezier(0.22, 1, 0.36, 1)', io: 'cubic-bezier(0.65, 0, 0.35, 1)', std: 'cubic-bezier(0.4, 0, 0.2, 1)' };
  var T = function () { var m = MOB(); return { fast: 150, base: 250, med: 400, slow: m ? 550 : 700, xslow: m ? 900 : 1200, stagger: 70, dist: m ? 16 : 24, line: m ? 60 : 90 }; };
  var AMBER = 'rgb(224, 162, 59)', SAGE = 'rgb(127, 163, 142)';
  var params = location.hash || /filter=/.test(location.search);
  var fromSite = false; try { fromSite = !!document.referrer && new URL(document.referrer).host === location.host; } catch (e) {}
  var VT = 'startViewTransition' in document || 'onpagereveal' in W;

  var quiet = function (e) {
    var vt = e.viewTransition; if (!vt) return;
    ['ready', 'finished', 'updateCallbackDone'].forEach(function (k) { if (vt[k] && vt[k].catch) vt[k].catch(function () {}); });
    if (e.type === 'pagereveal') { var nv = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]; if (nv && nv.type === 'reload') try { vt.skipTransition(); } catch (x) {} }
  };
  W.addEventListener('pagereveal', quiet);
  W.addEventListener('pageswap', quiet);
  W.addEventListener('unhandledrejection', function (e) { var r = e.reason; if (r && /transition was (skipped|aborted)|skipTransition/i.test(String(r.message || r))) e.preventDefault(); });
  if (!RM) d.classList.add('js', 'm-intro');
  else d.classList.add('js');
  var LOADING = function () { return d.classList.contains('from-loader') && !W.__nsLoaderDone; };
  if (LOADING()) (function () {
    var ready = new Promise(function (r) { if (document.readyState !== 'loading') r(); else document.addEventListener('DOMContentLoaded', r, { once: true }); })
      .then(function () { return Promise.race([document.fonts ? document.fonts.ready : 0, new Promise(function (r) { setTimeout(r, 800); })]); })
      .then(function () { return new Promise(function (r) { if (W.__nsLoaderGone || !document.getElementById('ns-loader')) r(); else { W.addEventListener('nsloader:gone', r, { once: true }); setTimeout(r, 10000); } }); });
    ready.then(function () {
      var wave = function (Y, O) { for (var s = '0 0,100% 0', i = 10; i >= 0; i--) s += ',' + i * 10 + '% calc(' + Y + '% + ' + ((i % 2 ? 40 : 12) + i % 3 * 6 - O) + 'px)'; return 'polygon(' + s + ')'; };
      var cs = document.createElement('style');
      var clip = W.CSS && CSS.supports('clip-path', 'polygon(0 0,1px 0,1px 1px)');
      cs.textContent = RM ? 'html.from-loader body::before{transition:opacity 300ms}html.from-loader.lift body::before{opacity:0}'
        : clip ? 'html.from-loader body::before{clip-path:' + wave(100, 0) + ';transition:clip-path 700ms cubic-bezier(0.65,0,0.35,1)}html.from-loader.lift body::before{clip-path:' + wave(0, 60) + '}'
        : 'html.from-loader body::before{transition:transform 700ms cubic-bezier(0.65,0,0.35,1)}html.from-loader.lift body::before{transform:translateY(-100%)}';
      document.head.appendChild(cs);
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        d.classList.add('lift');
        setTimeout(function () { W.__nsLoaderDone = 1; W.dispatchEvent(new CustomEvent('nsloader:done')); }, RM ? 150 : 350);
        setTimeout(function () { d.classList.remove('from-loader', 'lift'); cs.remove(); }, RM ? 320 : 720);
      }); });
    });
  })();
  var safety = function () { setTimeout(function () { d.classList.remove('m-intro'); }, 3200); };
  if (LOADING()) W.addEventListener('nsloader:done', safety, { once: true }); else safety();

  var H = 'section:first-of-type';
  var css =
    ':root{--ease-out:cubic-bezier(0.22,1,0.36,1);--ease-in-out:cubic-bezier(0.65,0,0.35,1);--ease-standard:cubic-bezier(0.4,0,0.2,1);--dur-fast:150ms;--dur-base:250ms;--dur-medium:400ms;--dur-slow:700ms;--dur-xslow:1200ms;--stagger:70ms;--reveal-distance:24px}' +
    '@media (max-width:767px){:root{--reveal-distance:16px;--dur-slow:550ms;--dur-xslow:900ms}}' +
        '::view-transition-old(root){animation:m-vt-out 250ms var(--ease-standard) both}::view-transition-new(root){animation:m-vt-in 400ms var(--ease-out) both}' +
    '@keyframes m-vt-out{to{opacity:0;translate:0 -12px}}@keyframes m-vt-in{from{opacity:0;translate:0 12px}}' +
    '@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}}' +
    // initial states (only with JS)
    'html.m-intro header{translate:0 -100%}' +
    'html.m-intro ' + H + ' :is(h1,p,a,button,img,svg,[style*="uppercase"]),html.m-intro ' + H + '>svg,html.m-intro [data-blur="bar"]:not(header):not(header *){opacity:0!important}' +
    'html.js .m-pre{opacity:0!important}html.js .m-pre-img{clip-path:inset(100% 0 0 0)!important}' +
    '.m-split{position:relative;color:transparent!important}.m-split>:not(.m-ov){color:transparent!important}' +
    '.m-ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:stretch;pointer-events:none;user-select:none;clip-path:inset(-0.3em -100vw -0.25em -100vw)}html.js .m-hpre{visibility:hidden}.m-l{display:block;overflow:hidden;padding-top:.18em;padding-bottom:.12em;margin-top:-.18em;margin-bottom:-.12em;white-space:nowrap}.m-li{display:block}' +
    // eyebrow line
    '.m-eb{position:relative}.m-eb::before{content:"";position:absolute;right:100%;top:50%;width:12px;height:1px;margin-right:8px;background:#7FA38E;transform-origin:0 50%;transition:scale 400ms var(--ease-out)}.m-eb.m-eb0::before{scale:0 1}@media (max-width:639px){.m-eb::before{display:none}}' +
    // header
    'header nav a{position:relative}header nav a:not([aria-current])::after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:2px;background:rgba(224,162,59,.5);scale:0 1;transition:scale 250ms var(--ease-standard)}header nav a:not([aria-current]):hover::after{scale:1 1}' +
    'header nav a{transition:color 150ms var(--ease-standard)}' +
    'header a[aria-label^="NS Gloss"] svg{overflow:visible}header a[aria-label^="NS Gloss"] svg path{transition:translate 250ms var(--ease-out)}header a[aria-label^="NS Gloss"] svg path:first-child{transition-delay:60ms}header a[aria-label^="NS Gloss"]:hover svg path{translate:0 -2px}' +
    '@media (hover:hover){a[href^="tel:"]:hover svg{animation:m-ring 400ms var(--ease-standard)}}@keyframes m-ring{25%{rotate:-12deg}60%{rotate:12deg}100%{rotate:0deg}}' +
    '.m-prog{position:fixed;left:0;right:0;height:2px;background:#E0A23B;transform-origin:0 50%;scale:0 1;z-index:101;pointer-events:none}' +
    // buttons
    '.m-btn{position:relative;overflow:hidden;isolation:isolate;transition:background-color 250ms var(--ease-standard),box-shadow 250ms var(--ease-standard),translate 250ms var(--ease-standard),scale 100ms var(--ease-standard)}' +
    '@media (hover:hover){.m-btn:hover{box-shadow:0 8px 24px rgba(224,162,59,.25);translate:0 -1px}}.m-btn:active{scale:.98;translate:0 0}' +
    '.m-btn::after{content:"";position:absolute;top:0;bottom:0;left:0;width:45%;z-index:-1;border-radius:inherit;background:linear-gradient(105deg,transparent 0%,rgba(255,255,255,.55) 50%,transparent 100%);transform:translateX(-150%) skewX(-20deg);pointer-events:none}.m-btn.m-sheen::after{animation:m-sheen 1100ms cubic-bezier(0.25,0.8,0.25,1)}@keyframes m-sheen{from{transform:translateX(-150%) skewX(-20deg)}to{transform:translateX(350%) skewX(-20deg)}}' +
    '@media (hover:hover){.m-btn:hover{background-color:#D69A33!important;background:#D69A33!important}}' +
    '.m-err{background:#1F2824 url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2728%27 height=%2728%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%233E5A4C%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Crect x=%273%27 y=%274%27 width=%2718%27 height=%2716%27 rx=%272%27/%3E%3Ccircle cx=%279%27 cy=%2710%27 r=%271.6%27/%3E%3Cpath d=%27m21 16-5-5-9 9%27/%3E%3C/svg%3E") center/28px no-repeat!important}' +
    'a[href*="wa.me"] svg,a[href^="viber:"] svg{transition:scale 200ms var(--ease-standard)}a[href*="wa.me"]:hover svg,a[href^="viber:"]:hover svg{scale:1.1}' +
    '.m-ul{background-image:linear-gradient(currentColor,currentColor);background-repeat:no-repeat;background-size:0% 1px;background-position:100% 100%;transition:background-size 250ms var(--ease-standard);text-decoration:none!important}.m-ul:hover{background-size:100% 1px;background-position:0 100%}' +
    ':focus-visible:not(input):not(select):not(textarea):not([aria-haspopup="listbox"]):not([aria-haspopup="dialog"]){outline:2px solid #E0A23B!important;outline-offset:3px!important}' +
    'input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea,button[aria-haspopup="listbox"],button[aria-haspopup="dialog"]{transition:border-color 200ms var(--ease-standard),box-shadow 200ms var(--ease-standard)!important}' +
    ':is(input:not([type=checkbox]):not([type=radio]):not([type=range]),select,textarea,button[aria-haspopup="listbox"],button[aria-haspopup="dialog"]):focus{outline:none!important;outline-offset:0!important;border-color:#E0A23B!important;box-shadow:0 0 0 1px #E0A23B,0 0 16px rgba(224,162,59,.25)!important}' +
    ':is(input,select,textarea,button)[aria-invalid="true"]:focus{border-color:#D9574A!important;box-shadow:0 0 0 1px #D9574A,0 0 16px rgba(217,87,74,.25)!important}' +
    '[data-slider]{cursor:col-resize}' +
    // back to top
    '.m-top{position:fixed;right:20px;bottom:20px;z-index:80;width:44px;height:44px;border-radius:50%;background:#1F2824;border:1px solid #2A3530;color:#F4F6F3;display:grid;place-items:center;padding:0;cursor:pointer;opacity:0;translate:0 8px;pointer-events:none;transition:opacity 250ms var(--ease-out),translate 250ms var(--ease-out),bottom 250ms var(--ease-standard)}.m-top.on{opacity:1;translate:0 0;pointer-events:auto}.m-top:hover{border-color:#3E5A4C}.m-top svg{position:absolute;inset:-1px;pointer-events:none}' +
    // scroll-linked drift for closing CTA contours
    '@supports (animation-timeline:view()){html.perf-high .m-drift{animation:m-drift linear both;animation-timeline:view()}}@keyframes m-drift{from{translate:0 0}to{translate:0 -20px}}' +
    'html.perf-low .m-btn::after{display:none}html.perf-low .m-eb::before{transition:none}' +
    '@media (prefers-reduced-motion:reduce){.m-btn::after{display:none}.m-top{transition:opacity 150ms}}';
  var st = document.createElement('style'); st.id = 'ns-motion'; st.textContent = css;
  (document.head || d).appendChild(st);

  var anim = function (el, kf, o) {
    if (!WA || !el) return null;
    o.fill = o.fill || 'backwards';
    try { var a = el.animate(kf, o); el.style.willChange = 'transform, opacity'; a.onfinish = a.oncancel = function () { setTimeout(function () { el.style.willChange = ''; }, 100); }; return a; } catch (e) { return null; }
  };
  var rise = function (el, delay, dist, dur) {
    var t = T();
    if (LOW()) return anim(el, [{ offset: 0, opacity: 0 }], { duration: RM ? 150 : 200, delay: delay || 0, easing: 'linear' });
    return anim(el, [{ offset: 0, opacity: 0, translate: '0 ' + (dist == null ? t.dist : dist) + 'px' }], { duration: dur || t.slow, delay: delay || 0, easing: E.out });
  };
  var cs = function (el) { return getComputedStyle(el); };
  var skipZone = function (el) { return el.closest('header,[role="dialog"],.m-ov,.m-top'); };

  /* ---------- heading split (non-destructive overlay; removed after reveal) ---------- */
  function split(h) {
    if (h._mOv) h._mOv.remove();
    var toks = [], walk = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, null), n, r = document.createRange();
    while ((n = walk.nextNode())) {
      if (n.parentNode.closest('.m-ov')) continue;
      var parts = n.data.split(/(\s+)/), off = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; if (!p) continue;
        var top = null;
        if (/\S/.test(p)) { r.setStart(n, off); r.setEnd(n, off + p.length); var rc = r.getClientRects()[0]; top = rc ? rc.top : null; }
        var chain = [], a = n.parentNode; while (a && a !== h) { chain.unshift(a); a = a.parentNode; }
        toks.push({ t: p, top: top, chain: chain }); off += p.length;
      }
    }
    var lines = [], cur = null, last = null;
    toks.forEach(function (k) {
      if (k.top != null && (last == null || Math.abs(k.top - last) > 4)) { cur = []; lines.push(cur); last = k.top; }
      if (cur) cur.push(k);
    });
    var lh = parseFloat(cs(h).lineHeight) || parseFloat(cs(h).fontSize) * 1.1, exp = Math.max(1, Math.round(h.clientHeight / lh));
    if (lines.length > exp && exp === 1) lines = [[].concat.apply([], lines)];
    var ov = document.createElement('span'); ov.className = 'm-ov'; ov.setAttribute('aria-hidden', 'true');
    ov.style.color = cs(h).color;
    var ambers = [], outs = [];
    lines.forEach(function (ln) {
      while (ln.length && !/\S/.test(ln[ln.length - 1].t)) ln.pop();
      var L = document.createElement('span'); L.className = 'm-l';
      var I = document.createElement('span'); I.className = 'm-li'; L.appendChild(I);
      var stack = [];
      ln.forEach(function (k) {
        var j = 0; while (j < stack.length && stack[j].src === k.chain[j]) j++;
        stack.length = j;
        for (; j < k.chain.length; j++) {
          var c = k.chain[j].cloneNode(false); c.removeAttribute('id');
          if (cs(k.chain[j]).color === AMBER) { c.style.color = '#F4F6F3'; ambers.push(c); }
          (stack.length ? stack[stack.length - 1].el : I).appendChild(c); stack.push({ src: k.chain[j], el: c });
        }
        (stack.length ? stack[stack.length - 1].el : I).appendChild(document.createTextNode(k.t));
      });
      ov.appendChild(L); outs.push(I);
    });
    h.classList.add('m-split'); h.appendChild(ov); h._mOv = ov;
    return { lines: outs, ambers: ambers };
  }
  var splitList = new Set();
  function resplit(h) { var s = split(h); s.ambers.forEach(function (c) { c.style.color = '#E0A23B'; }); h._mW = h.clientWidth; }
  function unsplit(h) { if (h._mOv) { h._mOv.remove(); h._mOv = null; } h.classList.remove('m-split'); }
  function revealHeading(h, delay) {
    var t = T();
    if (LOW() || !WA) { h.classList.remove('m-pre', 'm-hpre'); rise(h, delay); return; }
    var s = split(h); h.classList.remove('m-pre', 'm-hpre');
    if (!s.lines.length) { unsplit(h); rise(h, delay); return; }
    var end = 0;
    s.lines.forEach(function (I, i) {
      var dl = (delay || 0) + i * t.line;
      anim(I, [{ transform: 'translateY(115%)' }, { transform: 'translateY(0)' }], { duration: t.slow, delay: dl, easing: E.out, fill: 'backwards' });
      anim(I, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: dl, easing: E.out, fill: 'backwards' });
      end = dl + t.slow;
    });
    s.ambers.forEach(function (c) { var a = anim(c, [{ color: '#F4F6F3' }, { color: '#E0A23B' }], { duration: 400, delay: end - t.slow + 200 + t.slow * 0.5, easing: E.std, fill: 'both' }); var fin = function () { c.style.color = '#E0A23B'; if (a) a.cancel(); }; if (a) a.onfinish = fin; else fin(); });
    splitList.add(h); h._mW = h.clientWidth;
  }
  // re-split pending (not yet revealed) headings on resize
  var rzT; W.addEventListener('resize', function () { clearTimeout(rzT); rzT = setTimeout(function () { splitList.forEach(function (h) { if (!h.isConnected) { splitList.delete(h); return; } if (h.clientWidth !== h._mW) resplit(h); }); }, 150); });
  if ('MutationObserver' in W) new MutationObserver(function (list) { var hs = new Set(); list.forEach(function (mu) { if (mu.type === 'childList') { var own = function (x) { return x.nodeType === 1 && x.classList.contains('m-ov'); }; if ([].every.call(mu.addedNodes, own) && [].every.call(mu.removedNodes, own)) return; } var n = mu.target.nodeType === 1 ? mu.target : mu.target.parentElement; if (!n || n.closest('.m-ov')) return; var h = n.closest('.m-split'); if (h && splitList.has(h)) hs.add(h); }); hs.forEach(resplit); }).observe(document.documentElement, { characterData: true, childList: true, subtree: true });

  /* ---------- classification ---------- */
  function isEyebrow(el) {
    var s = cs(el); if (s.textTransform !== 'uppercase' || s.color !== SAGE) return false;
    var fs = parseFloat(s.fontSize), ls = parseFloat(s.letterSpacing);
    return fs <= 15 && ls / fs >= 0.09 && !!el.textContent.trim() && !el.closest('a,button,footer,nav,label');
  }
  function isPrimary(el) { return cs(el).backgroundColor === AMBER && el.offsetHeight >= 36; }
  function eyebrowLine(el) {
    if (el.classList.contains('m-eb') || el.querySelector('svg,img') || /text-align:\s*center/.test(el.getAttribute('style') || '') || cs(el).textAlign === 'center') return;
    if (el.children.length && !el.textContent.trim()) return;
    el.classList.add('m-eb');
  }
  function revealEyebrow(el, delay) {
    el.classList.remove('m-pre');
    if (LOW()) { rise(el, delay); el.classList.remove('m-eb0'); return; }
    anim(el, [{ offset: 0, opacity: 0, translate: '-8px 0' }], { duration: 600, delay: delay || 0, easing: E.out });
    setTimeout(function () { el.classList.remove('m-eb0'); }, delay || 0);
  }
  function drawPath(p, delay, dur) {
    if (LOW() || !WA) return;
    p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1';
    var a = anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: dur, delay: delay || 0, easing: E.io, fill: 'both' });
    if (a) a.onfinish = function () { p.style.strokeDasharray = ''; p.removeAttribute('pathLength'); a.cancel(); };
  }

  /* ---------- load sequence ---------- */
  function intro() {
    var hero = document.querySelector('section'), home = !!(hero && hero.querySelector('img[src*="hero-"]'));
    var k = params ? (home ? 400 / 1400 : 0.4) : 1, D = function (ms) { return Math.round(ms * k); };
    var t = T();
    var header = document.querySelector('header');
    if (header && !(fromSite && VT)) anim(header, [{ offset: 0, translate: '0 -100%' }], { duration: LOW() ? 1 : 600, delay: D(100), easing: E.out });
    if (!hero) { d.classList.remove('m-intro'); return; }
    var done = new Set();
    var mark = function (el) { done.add(el); return el; };
    // photo + contours
    var img = hero.querySelector('img');
    if (img) { mark(img); LOW() ? rise(img, 0, 0, 400) : anim(img, [{ offset: 0, opacity: 0, scale: 1.08 }], { duration: 1600, easing: E.out }); }
    hero.querySelectorAll(':scope > svg, :scope > div > svg[preserveAspectRatio*="slice"]').forEach(function (s) {
      mark(s); anim(s, [{ offset: 0, opacity: 0 }], { duration: LOW() ? 200 : 1200, easing: E.out });
      if (!home) s.querySelectorAll('path').forEach(function (p) { drawPath(p, 0, 1600); });
    });
    var h1 = hero.querySelector('h1');
    var base = home ? { eb: 250, h1: 350, p: 700, btn: 850, rest: 1000, step: 100 } : { eb: 200, h1: 280, p: 560, btn: 700, rest: 800, step: 60 };
    hero.querySelectorAll('[style*="uppercase"]').forEach(function (el) {
      if (!h1 || (el.compareDocumentPosition(h1) & 4)) { mark(el); if (isEyebrow(el)) { eyebrowLine(el); el.classList.add('m-eb0'); revealEyebrow(el, D(base.eb)); } else rise(el, D(base.eb)); }
    });
    if (h1) { mark(h1); revealHeading(h1, D(base.h1)); }
    var after = [], seen = function (el) { for (var a = el; a && a !== hero; a = a.parentElement) if (done.has(a)) return true; return false; };
    hero.querySelectorAll('p, a, button, [role="tablist"], [style*="uppercase"], div:has(> svg + svg + svg + svg + svg)').forEach(function (el) {
      if (seen(el) || (h1 && h1.contains(el))) return;
      if (h1 && !(h1.compareDocumentPosition(el) & 4)) return;
      after.push(el); mark(el);
    });
    var pi = 0, ri = 0, bi = 0;
    after.forEach(function (el) {
      if (el.tagName === 'P') { rise(el, D(base.p + 120 * pi++)); return; }
      var svgs = el.tagName === 'DIV' ? el.querySelectorAll(':scope > svg') : [];
      if (svgs.length >= 5) {
        var dl = D(base.rest + ri++ * base.step);
        el.querySelectorAll(':scope > svg').forEach(function (s, i) { LOW() ? rise(s, dl) : anim(s, [{ offset: 0, opacity: 0, scale: 0.6 }], { duration: 300, delay: dl + i * 60, easing: E.out }); });
        Array.prototype.forEach.call(el.children, function (c) { if (c.tagName !== 'svg') rise(c, dl + 300, 8, 400); });
        return;
      }
      var row = el.parentElement && cs(el.parentElement).display.indexOf('flex') >= 0 && el.parentElement.querySelectorAll(':scope > a, :scope > button').length > 1;
      var btn = (el.tagName === 'A' || el.tagName === 'BUTTON') && (isPrimary(el) || parseFloat(cs(el).borderTopWidth) > 0);
      if (row && btn) { rise(el, D(base.btn + 80 * bi++), 16); return; }
      rise(el, D(base.rest + ri++ * base.step), 12);
    });
    // floating filter bar / pill switch on inner pages
    document.querySelectorAll('[data-blur="bar"]').forEach(function (b) {
      if (b.closest('header')) return;
      rise(b, D(800), 16, 400);
      var ind = b.querySelector('[style*="E0A23B"], [style*="224, 162, 59"]');
      if (ind && !LOW()) anim(ind, [{ offset: 0, scale: '0 1' }], { duration: 300, delay: D(950), easing: E.std });
    });
    // ridge right below hero
    var nx = hero.nextElementSibling;
    if (nx && nx.getAttribute('aria-hidden') === 'true') nx.querySelectorAll('svg[preserveAspectRatio="none"] path').forEach(function (p) { p._mDrawn = 1; drawPath(p, D(900), 1400); });
    // LED sweep on the home hero photo
    if (home && img && !LOW()) setTimeout(function () { ledSweep(hero, img); }, D(1200));
    // mobile bottom bar
    d.classList.remove('m-intro');
    if (home && img && FINE && !LOW()) heroParallax(hero, img);
    if (home && !LOW()) setTimeout(function () { var b = Array.prototype.find.call(hero.querySelectorAll('a,button'), isPrimary); if (b) { b.classList.add('m-btn'); b.classList.remove('m-sheen'); void b.offsetWidth; b.classList.add('m-sheen'); } }, params ? 600 : 1600);
  }
  function ledSweep(hero, img) {
    var r = img.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    var o = document.createElement('div'); o.setAttribute('aria-hidden', 'true');
    o.style.cssText = 'position:absolute;pointer-events:none;z-index:1;overflow:hidden;left:' + (r.left - hr.left) + 'px;top:' + (r.top - hr.top) + 'px;width:' + r.width + 'px;height:' + r.height + 'px;-webkit-mask-image:linear-gradient(180deg,#000 0%,#000 26%,transparent 42%);mask-image:linear-gradient(180deg,#000 0%,#000 26%,transparent 42%)';
    var s = document.createElement('div');
    s.style.cssText = 'position:absolute;inset:0;background:linear-gradient(100deg,transparent 38%,rgba(255,255,255,0.25) 50%,transparent 62%);mix-blend-mode:screen';
    o.appendChild(s); img.insertAdjacentElement('afterend', o);
    var a = anim(s, [{ translate: '-100% 0' }, { translate: '100% 0' }], { duration: 900, easing: E.io, fill: 'both' });
    if (a) a.onfinish = function () { o.remove(); }; else o.remove();
  }
  function heroParallax(hero, img) {
    var tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    var loop = function () { x += (tx - x) * 0.08; y += (ty - y) * 0.08; img.style.translate = x.toFixed(2) + 'px ' + y.toFixed(2) + 'px'; raf = (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) ? requestAnimationFrame(loop) : 0; };
    hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); tx = -((e.clientX - r.left) / r.width - 0.5) * 16; ty = -((e.clientY - r.top) / r.height - 0.5) * 16; if (!raf) raf = requestAnimationFrame(loop); });
    hero.addEventListener('mouseleave', function () { tx = ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
  }
  function bottomBar() { var b = document.querySelector('[data-mbar].on'); return b && b.offsetHeight > 0 ? b : null; }

  /* ---------- scroll reveals ---------- */
  var io, queue = [], qT = 0;
  function flush() {
    qT = 0;
    var groups = new Map();
    queue.sort(function (a, b) { var r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect(); return (r1.top - r2.top) || (r1.left - r2.left); });
    queue.forEach(function (el) {
      var m = el._m, g = m.group || el, i = groups.get(g) || 0; groups.set(g, i + 1);
      var dl = (m.delay || 0) + (m.group ? Math.min(i, 5) * (m.step || T().stagger) : 0);
      if (m.kind === 'h') revealHeading(el, dl);
      else if (m.kind === 'eb') revealEyebrow(el, dl);
      else if (m.kind === 'img') revealImg(el, dl);
      else if (m.kind === 'line') drawPath(el, dl, m.dur || 1600);
      else { el.classList.remove('m-pre'); rise(el, dl, m.dist); }
    });
    queue = [];
  }
  function revealImg(img, delay) {
    var done = false;
    var go = function () {
      if (done) return; done = true;
      img.classList.remove('m-pre-img');
      if (LOW()) { rise(img, delay, 0, 200); return; }
      anim(img, [{ offset: 0, clipPath: 'inset(100% 0 0 0)', scale: 1.12 }], { duration: T().xslow, delay: delay || 0, easing: E.out });
    };
    if (!img._mErr) { img._mErr = 1; img.addEventListener('error', function () {
      var p = img.parentElement; if (p) p.classList.add('m-err'); img.style.opacity = '0';
      (function(){})('[NS Gloss] Slika nije učitana: ' + (img.currentSrc || img.getAttribute('src')));
    }, { once: true }); }
    go();
  }
  function hScroll(el) { for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) { var o = cs(a).overflowX; if ((o === 'auto' || o === 'scroll') && a.scrollWidth > a.clientWidth + 2) return true; } return false; }
  function add(el, m, pre) {
    if (el._m) return; el._m = m;
    var r = el.getBoundingClientRect();
    if (!r.height && !r.width) { el._m = null; return; }
    if (r.top < W.innerHeight * 0.92) { if (m.kind === 'eb') eyebrowLine(el); return; } // already visible on load: no jump
    if (m.kind === 'img') el.classList.add('m-pre-img');
    else if (m.kind === 'line') { if (LOW()) return; el.setAttribute('pathLength', '1'); el.style.strokeDasharray = '1'; el.style.strokeDashoffset = '1'; }
    else el.classList.add(m.kind === 'h' ? 'm-hpre' : 'm-pre');
    if (m.kind === 'eb') { eyebrowLine(el); el.classList.add('m-eb0'); }
    io.observe(el);
  }
  function sweep() {
    var vh = W.innerHeight;
    document.querySelectorAll('.m-pre-img').forEach(function (img) { if (img._mQ) return; var r = img.getBoundingClientRect(); if (r.top < vh && (r.bottom > 0 || r.height > 0)) { img._mQ = 1; io && io.unobserve(img); revealImg(img, 0); } });
  }
    function bottomSweep() {
    var se = document.scrollingElement || document.documentElement, vh = W.innerHeight;
    if (!io) return;
    // safety net: anything vertically in view is released even if the observer missed it
    // (horizontal carousels, page bottom where the -10% margin can't be crossed)
    var lim = se.scrollTop + vh >= se.scrollHeight - 4 ? vh : vh * 0.9, n = 0;
    document.querySelectorAll('.m-pre,.m-hpre').forEach(function (el) { if (el._mQ || !el._m) return; var r = el.getBoundingClientRect(); if (r.top < lim) { io.unobserve(el); el._mQ = 1; queue.push(el); n++; } });
    if (n && !qT) qT = requestAnimationFrame(flush);
    sweep();
  }
  var bsT = 0; W.addEventListener('scroll', function () { if (bsT) return; bsT = setTimeout(function () { bsT = 0; bottomSweep(); }, 120); }, { passive: true });
  function scan() {
    if (RM || !('IntersectionObserver' in W)) return;
    if (!io) io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        if (e.target._m.kind === 'line') { e.target.style.strokeDashoffset = ''; }
        e.target._mQ = 1;
        queue.push(e.target);
      });
      if (queue.length && !qT) qT = requestAnimationFrame(flush);
      sweep();
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    var hero = document.querySelector('section');
    var out = function (el) { return (hero && hero.contains(el)) || skipZone(el); };
    // groups: grids / wrapping rows / lists
    var items = new Set();
    document.querySelectorAll('section div, section ul, footer div, footer ul').forEach(function (g) {
      if (out(g) || g.closest('[data-slider]')) return;
      var s = cs(g), ok = s.display === 'grid' || (s.display === 'flex' && s.flexWrap === 'wrap') || g.tagName === 'UL';
      if (!ok || g.children.length < 2) return;
      for (var a = g.parentElement; a; a = a.parentElement) if (items.has(a)) return;
      var kids = Array.prototype.filter.call(g.children, function (c) { return c.offsetHeight > 40 && !c.querySelector('h1,h2') && !/^(H1|H2|P)$/.test(c.tagName); });
      if (kids.length < 2) return;
      var foot = !!g.closest('footer'), rows = /\b(li|LI)\b/.test(g.children[0].tagName) && kids.length > 6;
      kids.forEach(function (c) { items.add(c); add(c, { kind: 'item', group: g, dist: foot ? 12 : null, step: rows ? 40 : null }); });
    });
    var inItem = function (el) { for (var a = el.parentElement; a; a = a.parentElement) if (items.has(a)) return true; return false; };
    document.querySelectorAll('section h1, section h2, footer h2').forEach(function (h) {
      if (out(h) || inItem(h) || h.textContent.length > 140) return;
      add(h, { kind: 'h', delay: 80 });
      var sib = h.nextElementSibling ? h : h.parentElement, n = 0;
      for (var x = sib.nextElementSibling; x && n < 3; x = x.nextElementSibling, n++) if (x.tagName === 'P' && !items.has(x)) add(x, { kind: 'p', delay: 230 + n * 60 });
    });
    document.querySelectorAll('section div, section span, section p').forEach(function (el) {
      if (el._m || out(el) || inItem(el) || items.has(el) || !isEyebrow(el)) return;
      add(el, { kind: 'eb', delay: 0 });
    });
    document.querySelectorAll('section img, footer img').forEach(function (img) {
      var cp = false; for (var a = img.parentElement, n = 0; a && n < 3; a = a.parentElement, n++) if (a.querySelector('img[style*="clip-path"], [style*="clip-path"] img')) { cp = true; break; }
      if (cp || hScroll(img) || out(img) || img.closest('[data-slider]') || /clip-path/.test(img.getAttribute('style') || '') || img.width < 80) return;
      add(img, { kind: 'img' });
    });
    document.querySelectorAll('div[aria-hidden="true"] > svg[preserveAspectRatio="none"] path').forEach(function (p) {
      if (p._mDrawn || out(p)) return; p._mDrawn = 1; add(p, { kind: 'line', dur: 1600 });
    });
    document.querySelectorAll('section > svg[preserveAspectRatio*="slice"]').forEach(function (s) { if (!out(s) && !s.classList.contains('m-drift')) s.classList.add('m-drift'); });
    enhance();
  }

  /* ---------- micro-interactions ---------- */
  function enhance() {
    document.querySelectorAll('a, button').forEach(function (el) {
      if (el._mE) return; el._mE = 1;
      if (isPrimary(el)) {
        el.classList.add('m-btn');
        if (FINE) el.addEventListener('mouseenter', function () { if (LOW()) return; el.classList.remove('m-sheen'); void el.offsetWidth; el.classList.add('m-sheen'); });
        el.addEventListener('animationend', function () { el.classList.remove('m-sheen'); });
        return;
      }
      if (el.tagName === 'A' && !el.closest('header,nav') && cs(el).backgroundColor === 'rgba(0, 0, 0, 0)' && parseFloat(cs(el).borderTopWidth) === 0 && cs(el).display.indexOf('inline') === 0 && (el.closest('p') || /→\s*$/.test(el.textContent))) el.classList.add('m-ul');
    });
  }

  /* ---------- header progress + back to top ---------- */
  function chrome() {
    var hdr = document.querySelector('header');
    var bar = document.createElement('div'); bar.className = 'm-prog'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
    var top = document.createElement('button'); top.type = 'button'; top.className = 'm-top'; top.setAttribute('aria-label', 'Nazad na vrh');
    top.innerHTML = '<svg width="46" height="46" viewBox="0 0 46 46" aria-hidden="true"><circle cx="23" cy="23" r="21.5" fill="none" stroke="#E0A23B" stroke-width="1.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="rotate(-90 23 23)"></circle></svg><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#F4F6F3" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="position:static"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"></path></svg>';
    top.addEventListener('click', function () { W.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
    document.body.appendChild(top);
    var ring = top.querySelector('circle'), raf = 0, bb = null, bbT = 0;
    var upd = function () {
      raf = 0;
      var h = d.scrollHeight - W.innerHeight, p = h > 0 ? Math.min(1, W.scrollY / h) : 0;
      var desk = W.innerWidth >= 1024 && FINE;
      bar.style.display = desk ? '' : 'none';
      if (desk && hdr) { bar.style.top = (hdr.getBoundingClientRect().bottom - 2) + 'px'; bar.style.scale = p + ' 1'; }
      var ft = document.querySelector('footer'), dlg = document.querySelector('[role="dialog"]');
      var show = W.scrollY > W.innerHeight * 1.5 && !d.classList.contains('ns-menu-open') && !d.classList.contains('ns-ov') && !(dlg && dlg.getBoundingClientRect().height > 0) && !(W.innerWidth < 768 && d.classList.contains('ns-end')) && !(W.innerWidth >= 768 && W.innerWidth < 1024 && ft && ft.getBoundingClientRect().top < W.innerHeight);
      if (show && W.innerWidth < 1024) { var tr = top.getBoundingClientRect(), hit = [], cx = tr.left + tr.width / 2, cy = tr.top + tr.height / 2;
        [[cx, cy], [tr.left + 2, tr.top + 2], [tr.right - 2, tr.top + 2], [tr.left + 2, tr.bottom - 2], [tr.right - 2, tr.bottom - 2], [cx, tr.top - 6], [tr.left - 6, cy]].forEach(function (q) { hit = hit.concat(document.elementsFromPoint(q[0], q[1])); }); for (var hi = 0; hi < hit.length; hi++) { var x = hit[hi]; if (x !== top && !top.contains(x) && x.closest && x.closest('a,button,input,textarea,select') && !x.closest('[data-mbar]')) { show = false; break; } } }
      top.classList.toggle('on', show);
      ring.setAttribute('stroke-dashoffset', String(1 - p));
      bb = bottomBar();
      top.style.bottom = bb ? (bb.offsetHeight + 12) + 'px' : (W.innerWidth < 768 ? 'calc(76px + env(safe-area-inset-bottom))' : '20px');
      top.style.right = W.innerWidth < 768 ? '16px' : '20px';
    };
    var req = function () { if (!raf) raf = requestAnimationFrame(upd); };
    W.addEventListener('scroll', req, { passive: true }); W.addEventListener('resize', req); req();
    new MutationObserver(req).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    new MutationObserver(req).observe(d, { attributes: true, attributeFilter: ['class'] });
  }


  /* ---------- price count (old → new) via text mutations ---------- */
  var NUM = /\d{1,3}(?:\.\d{3})+|\d{4,}/;
  var fmt = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  var parse = function (s) { var x = s.match(NUM); return x ? parseInt(x[0].replace(/\./g, ''), 10) : null; };
  var near = function (el) { for (var a = el, i = 0; a && i < 3; a = a.parentElement, i++) if (/RSD/.test(a.textContent) && a.textContent.length < 400) return true; return false; };
  var priceRuns = new WeakMap(), selfTween = new WeakSet(), lastExt = new WeakMap();
  function countText(node, oldV, newV) {
    var el = node.parentElement, from = parse(oldV), to = parse(newV);
    var run = priceRuns.get(node);
    if (run) { from = run.cur; cancelAnimationFrame(run.raf); }
    if (from == null || to == null || from === to) { priceRuns.delete(node); return; }
    el.style.fontVariantNumeric = 'tabular-nums';
    if (cs(el).display !== 'inline') el.style.minWidth = Math.max(el.offsetWidth, parseFloat(el.style.minWidth) || 0) + 'px';
    if (to > from) anim(el, [{ color: '#E0A23B' }, { color: cs(el).color }], { duration: 600, easing: E.std, fill: 'none' });
    var tpl = newV, t0 = performance.now(), r = { cur: from, raf: 0, last: null };
    priceRuns.set(node, r);
    var step = function (now) {
      var k = Math.min(1, (now - t0) / 600), e = 1 - Math.pow(1 - k, 3);
      var v = k < 1 ? Math.round((from + (to - from) * e) / 100) * 100 : to;
      r.cur = v; r.last = tpl.replace(NUM, k < 1 ? fmt(v) : tpl.match(NUM)[0]);
      if (node.data !== r.last) node.data = r.last;
      if (k < 1) r.raf = requestAnimationFrame(step); else priceRuns.delete(node);
    };
    r.last = oldV.replace(NUM, fmt(from)); node.data = r.last;
    r.raf = requestAnimationFrame(step);
  }
  function watchPrices() {
    if (!('MutationObserver' in W)) return;
    new MutationObserver(function (list) {
      if (LOW()) return;
      var lastBy = new Map(); list.forEach(function (mu) { lastBy.set(mu.target, mu); });
      lastBy.forEach(function (mu) {
        var n = mu.target, el = n.parentElement, run = priceRuns.get(n);
        if (!el || mu.oldValue == null || skipZone(el)) return;
        if (run && n.data === run.last) return;
        if (selfTween.has(n) || (el.closest && el.closest('[data-no-count]'))) return;
        var now = performance.now(), prev = lastExt.get(n); lastExt.set(n, now);
        if (prev != null && now - prev < 150) { selfTween.add(n); if (run) { cancelAnimationFrame(run.raf); priceRuns.delete(n); } return; }
        var o = mu.oldValue, v = n.data;
        if (run && o === run.last) o = run.last;
        if (o === v || !near(el)) return;
        if (NUM.test(o) && NUM.test(v) && o.replace(NUM, '#') === v.replace(NUM, '#')) { countText(n, o, v); return; }
        if (!NUM.test(v) && v.length < 40 && o.length < 40) anim(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: E.std, fill: 'none' });
      });
    }).observe(document.body, { characterData: true, characterDataOldValue: true, subtree: true });
  }

  /* ---------- prefetch other pages' images when idle ---------- */
  var NS_IMGS = {"index.html":["images/hero-600.webp 600w, images/hero-1200.webp 1200w, images/hero-1672.webp 1672w","images/studio-led-600.webp 600w, images/studio-led-1200.webp 1200w, images/studio-led-1600.webp 1600w","images/ig-1-300.webp 300w, images/ig-1-600.webp 600w","images/ig-2-300.webp 300w, images/ig-2-600.webp 600w","images/ig-3-300.webp 300w, images/ig-3-600.webp 600w","images/ig-4-300.webp 300w, images/ig-4-600.webp 600w","images/ig-5-300.webp 300w, images/ig-5-600.webp 600w","images/ig-6-300.webp 300w, images/ig-6-600.webp 600w","images/lak-pre-600.webp 600w, images/lak-pre-1200.webp 1200w, images/lak-pre-1800.webp 1800w","images/lak-posle-600.webp 600w, images/lak-posle-1200.webp 1200w, images/lak-posle-1800.webp 1800w","images/gle-enterijer-pre-600.webp 600w, images/gle-enterijer-pre-1200.webp 1200w, images/gle-enterijer-pre-1800.webp 1800w","images/gle-enterijer-posle-600.webp 600w, images/gle-enterijer-posle-1200.webp 1200w, images/gle-enterijer-posle-1800.webp 1800w","images/mx5-far-pre-600.webp 600w, images/mx5-far-pre-1200.webp 1200w, images/mx5-far-pre-1800.webp 1800w","images/mx5-far-posle-600.webp 600w, images/mx5-far-posle-1200.webp 1200w, images/mx5-far-posle-1800.webp 1800w"],"usluge.html":["images/rucno-pranje-600.webp 600w, images/rucno-pranje-1120.webp 1040w","images/zadnja-sedista-600.webp 600w, images/zadnja-sedista-1120.webp 1120w","images/polirka-hauba-600.webp 600w, images/polirka-hauba-1120.webp 1120w","images/kapi-keramika-600.webp 600w, images/kapi-keramika-1120.webp 1120w","images/ppf-branik-600.webp 600w, images/ppf-branik-1120.webp 1120w","images/koza-ciscenje-600.webp 600w, images/koza-ciscenje-1120.webp 1120w","images/far-pola-pola-600.webp 600w, images/far-pola-pola-1120.webp 1120w"],"galerija.html":["images/ig-1-300.webp 300w, images/ig-1-600.webp 600w","images/ig-2-300.webp 300w, images/ig-2-600.webp 600w","images/ig-3-300.webp 300w, images/ig-3-600.webp 600w","images/ig-4-300.webp 300w, images/ig-4-600.webp 600w","images/ig-5-300.webp 300w, images/ig-5-600.webp 600w","images/ig-6-300.webp 300w, images/ig-6-600.webp 600w","images/galerija-bmw-m4-600.webp 600w, images/galerija-bmw-m4.webp 1200w","images/galerija-porsche-macan-600.webp 600w, images/galerija-porsche-macan.webp 1200w","images/galerija-tesla-model3-600.webp 600w, images/galerija-tesla-model3.webp 1200w","images/gle-enterijer-posle-600.webp 600w, images/gle-enterijer-posle-1200.webp 1200w, images/gle-enterijer-posle-1800.webp 1800w","images/galerija-audi-a6-600.webp 600w, images/galerija-audi-a6.webp 1200w","images/galerija-golf-gti-600.webp 600w, images/galerija-golf-gti.webp 1200w","images/galerija-bmw-x5-600.webp 600w, images/galerija-bmw-x5.webp 1200w","images/galerija-velar-600.webp 600w, images/galerija-velar.webp 1200w","images/galerija-audi-rs3-600.webp 600w, images/galerija-audi-rs3.webp 1200w","images/galerija-mercedes-c-600.webp 600w, images/galerija-mercedes-c.webp 1200w","images/galerija-volvo-xc60-600.webp 600w, images/galerija-volvo-xc60.webp 1200w","images/galerija-toyota-rav4-600.webp 600w, images/galerija-toyota-rav4.webp 1200w","images/galerija-peugeot-3008-600.webp 600w, images/galerija-peugeot-3008.webp 1200w","images/galerija-skoda-octavia-600.webp 600w, images/galerija-skoda-octavia.webp 1200w","images/mx5-far-posle-600.webp 600w, images/mx5-far-posle-1200.webp 1200w, images/mx5-far-posle-1800.webp 1800w","images/lak-pre-600.webp 600w, images/lak-pre-1200.webp 1200w, images/lak-pre-1800.webp 1800w","images/lak-posle-600.webp 600w, images/lak-posle-1200.webp 1200w, images/lak-posle-1800.webp 1800w","images/rav4-enterijer-pre-960.webp 960w, images/rav4-enterijer-pre.webp 1920w","images/rav4-enterijer-posle-960.webp 960w, images/rav4-enterijer-posle.webp 1920w","images/mx5-far-pre-600.webp 600w, images/mx5-far-pre-1200.webp 1200w, images/mx5-far-pre-1800.webp 1800w","images/audi-a6-bez-zastite-600.webp 600w, images/audi-a6-bez-zastite.webp 1200w","images/audi-a6-keramika-600.webp 600w, images/audi-a6-keramika.webp 1200w","images/gle-enterijer-posle-43-600.webp 600w, images/gle-enterijer-posle-43-1200.webp 1200w","images/mx5-far-posle-43-600.webp 600w, images/mx5-far-posle-43-1200.webp 1200w"],"o-nama.html":["images/marko-studio-600.webp 600w, images/marko-studio-1120.webp 1120w","images/tim-marko-600.webp 600w, images/tim-marko-800.webp 800w","images/tim-nikola-600.webp 600w, images/tim-nikola-800.webp 800w","images/tim-jelena-600.webp 600w, images/tim-jelena-800.webp 800w","images/studio-sirok-600.webp 600w, images/studio-sirok-1200.webp 1200w, images/studio-sirok-1600.webp 1600w","images/led-hauba-600.webp 600w, images/led-hauba-1200.webp 1200w","images/ppf-zona-600.webp 600w, images/ppf-zona-1200.webp 1200w","images/mapa-grad.webp","images/mapa-studio.webp"],"kontakt.html":["images/mapa-grad.webp","images/mapa-studio.webp"]};
  function prefetchOthers() {
    if (navigator.connection && navigator.connection.saveData) return;
    var here = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');
    var need = Math.min(W.innerWidth, 1200) * (W.devicePixelRatio || 1) * 0.55, seen = {};
    document.querySelectorAll('img').forEach(function (i) { if (i.currentSrc) seen[i.currentSrc] = 1; });
    Object.keys(NS_IMGS).forEach(function (pg) {
      if (pg === here) return;
      NS_IMGS[pg].forEach(function (set) {
        var c = set.split(',').map(function (x) { x = x.trim().split(/\s+/); return { u: x[0], w: parseInt(x[1], 10) || 9999 }; }).sort(function (a, b) { return a.w - b.w; });
        var pick = c.filter(function (x) { return x.w >= need; })[0] || c[c.length - 1];
        var href = new URL(pick.u, location.href).href; if (seen[href]) return; seen[href] = 1;
        var l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'image'; l.href = pick.u; document.head.appendChild(l);
      });
    });
  }
  var schedulePrefetch = function () { var go = function () { (W.requestIdleCallback || function (f) { setTimeout(f, 1200); })(prefetchOthers, { timeout: 4000 }); }; if (document.readyState === 'complete') go(); else W.addEventListener('load', go, { once: true }); };

  /* ---------- boot ---------- */
  var started = false;
  function boot() {
    if (started) return;
    var hero = document.querySelector('section');
    if (!hero || !hero.querySelector('h1')) return;
    started = true;
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var loader = LOADING() ? new Promise(function (r) { W.addEventListener('nsloader:done', r, { once: true }); setTimeout(r, 8000); }) : Promise.resolve();
    loader.then(function () { return Promise.race([fonts, new Promise(function (r) { setTimeout(r, 600); })]); }).then(function () {
      requestAnimationFrame(function () {
        var deep = W.scrollY > 40;
        if (RM || deep) d.classList.remove('m-intro'); else intro();
        chrome(); watchPrices(); schedulePrefetch();
        setTimeout(scan, 60);
        if ('MutationObserver' in W) { var mT; new MutationObserver(function () { clearTimeout(mT); mT = setTimeout(scan, 300); }).observe(document.body, { childList: true, subtree: true }); }
      });
    });
  }
  var poll = function (n) { boot(); if (!started && n < 300) requestAnimationFrame(function () { poll(n + 1); }); else if (!started) d.classList.remove('m-intro'); };
  poll(0);
  document.addEventListener('visibilitychange', function () { if (WA && document.getAnimations) document.getAnimations().forEach(function (a) { if (a.effect && a.effect.getComputedTiming && a.effect.getComputedTiming().iterations === Infinity) document.hidden ? a.pause() : a.play(); }); });

  W.NSMotion = { E: E, T: T, rise: rise, anim: anim, low: LOW };
})();
