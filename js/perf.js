/* NS Gloss: performance tier + animation pausing. Sets html.perf-high / html.perf-low. */
(function () {
  if (window.NSPerf) return;
  var d = document.documentElement, n = navigator;
  var mm = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var sup = function (p, v) { return !!(window.CSS && CSS.supports && CSS.supports(p, v)); };
  var blur = sup('backdrop-filter', 'blur(1px)') || sup('-webkit-backdrop-filter', 'blur(1px)');
  var io = 'IntersectionObserver' in window;
  var low = (n.hardwareConcurrency > 0 && n.hardwareConcurrency <= 4) || (n.deviceMemory > 0 && n.deviceMemory <= 4) ||
    !!(n.connection && n.connection.saveData) || mm('(prefers-reduced-motion: reduce)') || !blur || !io;
  var P = window.NSPerf = {
    low: low, blur: blur,
    setLow: function () {
      if (P.low) return;
      P.low = true; apply();
      var ev; try { ev = new Event('nsperf'); } catch (e) { ev = document.createEvent('Event'); ev.initEvent('nsperf', false, false); }
      window.dispatchEvent(ev);
    },
    // average FPS over `ms`; below 40 → perf-low (ignored while the tab is hidden)
    probe: function (ms, cb) {
      if (P.low) return;
      var frames = 0, t0 = 0;
      var f = function (t) {
        if (!t0) t0 = t;
        frames++;
        if (t - t0 < ms) return requestAnimationFrame(f);
        var fps = frames * 1000 / (t - t0);
        if (cb) cb(fps);
      };
      requestAnimationFrame(f);
    }
  };
  function apply() { d.classList.remove(P.low ? 'perf-high' : 'perf-low'); d.classList.add(P.low ? 'perf-low' : 'perf-high'); }
  apply();
  document.addEventListener('visibilitychange', function () { d.classList.toggle('tab-hidden', document.hidden); });
  if (!io) return;
  // pause CSS animations in sections that are off screen
  var ob = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) e.target.removeAttribute('data-off'); else e.target.setAttribute('data-off', ''); });
  }, { rootMargin: '120px 0px' });
  var seen = typeof WeakSet !== 'undefined' ? new WeakSet() : null, tm = 0;
  var scan = function () {
    var els = document.querySelectorAll('section, [data-anim]');
    for (var i = 0; i < els.length; i++) { if (seen && seen.has(els[i])) continue; if (seen) seen.add(els[i]); ob.observe(els[i]); }
  };
  if ('MutationObserver' in window) new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(scan, 250); }).observe(d, { childList: true, subtree: true });
  scan();
})();
