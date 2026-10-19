/* NS Gloss loading screen for site pages: shown on first visit and on refresh, skipped on in-site navigation. */
(function () {
  var d = document, W = window, M = Math, h = d.documentElement, ss = null;
  try { ss = W.sessionStorage; ss.getItem('x'); } catch (e) { ss = null; }
  d.addEventListener('click', function (e) {
    if (e.defaultPrevented && !e.target.closest) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (a.target && a.target !== '_self')) return;
    var href = a.getAttribute('href') || ''; if (/^(https?:|mailto:|tel:|viber:|#)/i.test(href) || !/\.html([?#].*)?$/i.test(href)) return;
    try { if (ss) ss.setItem('nsgloss-int', '1'); } catch (er) {}
  }, true);
  var L = d.getElementById('ns-loader'); if (!L) return;
  if (h.classList.contains('ns-noload')) { L.parentNode.removeChild(L); return; }
  var RM = W.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MIN = RM ? 700 : 1400, MAX = 8000, T0 = performance.now();
  var c = '', g = '', i, j, x;
  for (j = 1; j < 7; j++) { c += '<path pathLength="1" d="'; for (i = 0; i < 49; i++) { var a = i * .1309, r = j * 58 * (1 + .12 * M.sin(3 * a + j) + .06 * M.cos(5 * a - j)); c += (i ? 'L' : 'M') + (500 + r * 1.6 * M.cos(a) | 0) + ' ' + (300 + r * M.sin(a) | 0); } c += 'Z"/>'; }
  L.querySelector('.nlt').innerHTML = c;
  for (x = 0; x < 221; x += 10) g += (x ? 'L' : 'M') + x + ' ' + (21 - 11 * M.exp(-M.pow((x - 140) / 38, 2)) - 7 * M.exp(-M.pow((x - 60) / 30, 2)) - 1.5 * M.sin(x / 9)).toFixed(1);
  var rp = L.querySelectorAll('.nlr path'); rp[0].setAttribute('d', g); rp[1].setAttribute('d', g);
  var A = rp[1], D = L.querySelector('.nld'), R = L.querySelector('.nlr'), len = A.getTotalLength();
  var loaded = d.readyState === 'complete', fonts = false, shown = 0, target = 10, leaving = false;
  W.addEventListener('load', function () { loaded = true; });
  (d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve()).then(function () { fonts = true; }, function () { fonts = true; });
  function progress() {
    var rendered = !!d.querySelector('header'), imgs = d.images, n = 0, ok = 0;
    for (var k = 0; k < imgs.length; k++) { var im = imgs[k]; if (im.closest('#ns-loader') || im.loading === 'lazy') continue; n++; if (im.complete) ok++; }
    var p = 10 + (rendered ? 25 : 0) + (fonts ? 15 : 0) + (n ? 40 * ok / n : (rendered ? 40 : 0)) + (loaded ? 10 : 0);
    var done = loaded && fonts && rendered && ok === n;
    if (done || performance.now() - T0 > MAX) p = 100;
    if (p > target) target = p;
  }
  (function frame(now) {
    progress();
    shown = M.min(target, shown + M.max((target - shown) * .07, .2));
    A.style.strokeDashoffset = String(1 - shown / 100);
    var pt = A.getPointAtLength(len * shown / 100), k = R.offsetWidth / 220;
    D.style.transform = 'translate(' + pt.x * k + 'px,' + pt.y * k + 'px)';
    if (shown >= 100 && now - T0 >= MIN) { if (!leaving) { leaving = true; setTimeout(leave, 150); } return; }
    requestAnimationFrame(frame);
  })(T0);
  function leave() {
    L.classList.add('nlx');
    setTimeout(function () {
      if (L.parentNode) L.parentNode.removeChild(L);
      W.__nsLoaderGone = 1; W.dispatchEvent(new CustomEvent('nsloader:gone'));
    }, RM ? 300 : 420);
  }
})();
