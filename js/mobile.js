/* NS Gloss: shared mobile chrome (header switch, full-screen menu, bottom bar, footer layout, base touch rules). */
(function () {
  if (window.NSMobile) return;
  var W = window, d = document.documentElement;
  var RM = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EO = 'cubic-bezier(0.22, 1, 0.36, 1)', EIO = 'cubic-bezier(0.65, 0, 0.35, 1)';
  var css =
    'html,body{overflow-x:clip}html{-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}' +
    '@media (min-width:1024px){[data-nav-mob]{display:none!important}}' +
    '@media (max-width:1023px){[data-nav-desk]{display:none!important}[data-hdr-row]{height:64px!important;padding-left:20px!important;padding-right:20px!important}header{padding-top:env(safe-area-inset-top)}' +
    'header a[aria-label^="NS Gloss"]{font-size:18px!important}header a[aria-label^="NS Gloss"] svg{width:22px;height:auto}}' +
    '@media (max-width:1023px){[id]{scroll-margin-top:calc(64px + env(safe-area-inset-top) + 16px)}}' +
    '@media (max-width:1023px){h1,h2,h3{text-wrap:balance}}' +
    '@media (min-width:768px) and (max-width:1023px){[data-hdr-row]{padding-left:32px!important;padding-right:32px!important}}' +
    '@media (max-width:379px){[data-hdr-row]{padding-left:16px!important;padding-right:16px!important}}' +
    '[data-dd-list]{scrollbar-width:thin;scrollbar-color:#3E5A4C transparent}[data-dd-list]::-webkit-scrollbar{width:4px}[data-dd-list]::-webkit-scrollbar-thumb{background:#3E5A4C;border-radius:4px}[data-dd-list]::-webkit-scrollbar-track{background:transparent}[data-dd-list]::-webkit-scrollbar-button{display:none;width:0;height:0}' +
    '[data-hb]{transition:transform 300ms ' + EIO + ',opacity 200ms ' + EIO + '}' +
    'html.ns-menu-open [data-hb]:nth-child(1){transform:translateY(8px) rotate(45deg)}html.ns-menu-open [data-hb]:nth-child(2){opacity:0}html.ns-menu-open [data-hb]:nth-child(3){transform:translateY(-8px) rotate(-45deg)}' +
    // bottom bar (phone only)
    '[data-mbar]{transform:translateY(100%);opacity:0;pointer-events:none;transition:transform 250ms ' + EO + ',opacity 250ms ' + EO + '}[data-mbar].on{transform:none;opacity:1;pointer-events:auto}' +
    '@media (min-width:768px){[data-mbar],[data-mbar-sp]{display:none!important}}' +
    '@media (orientation:landscape) and (max-height:500px){[data-mbar]{padding-top:4px!important;padding-bottom:calc(4px + env(safe-area-inset-bottom))!important}[data-mbar-sp]{height:calc(56px + env(safe-area-inset-bottom))!important}}' +
    // footer on phone
    '@media (max-width:767px){[data-ft-grid]{grid-template-columns:1fr 1fr!important;gap:32px 20px!important}[data-ft-grid]>:first-child,[data-ft-grid]>:nth-child(4){grid-column:1/-1}' +
    '[data-ft-bottom]{flex-direction:column!important;justify-content:center!important;text-align:center;gap:8px!important}[data-ft-copy]{flex-direction:column;align-items:center}[data-ft-sep],[data-ft-cta]{display:none!important}}' +
    // touch: active instead of hover
    '@media (hover:none),(pointer:coarse){a,button,[role="button"]{transition-property:transform,background-color,color,border-color,box-shadow,opacity}a:active,button:active{transform:scale(.98);transition-duration:100ms}}' +
    // menu
    '#ns-menu{position:fixed;inset:0;z-index:99;height:100vh;height:100svh;background:#0F1412;padding:calc(64px + env(safe-area-inset-top) + 24px) 20px calc(24px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:24px;overflow-y:auto;overscroll-behavior:contain;visibility:hidden;transform:translateX(100%);transition:transform 400ms ' + EO + ',visibility 0s 400ms}' +
    '#ns-menu.on{visibility:visible;transform:none;transition:transform 400ms ' + EO + ',visibility 0s}#ns-menu.off{transition:transform 250ms ' + EIO + ',visibility 0s 250ms}' +
    '#ns-menu-dim{position:fixed;inset:0;z-index:98;background:#000;opacity:0;pointer-events:none;transition:opacity 400ms ' + EO + '}#ns-menu-dim.on{opacity:.6}' +
    '#ns-menu .mi{display:flex;align-items:center;gap:12px;height:56px;font-family:inherit;font-weight:600;font-size:28px;letter-spacing:-.02em;color:#F4F6F3;text-decoration:none}#ns-menu .mi[aria-current]{color:#E0A23B}' +
    '#ns-menu .mi[aria-current]::before{content:"";width:3px;height:20px;background:#E0A23B;border-radius:2px}' +
    '#ns-menu .st{opacity:0;transform:translateY(16px)}#ns-menu.on .st{opacity:1;transform:none;transition:opacity 400ms ' + EO + ',transform 400ms ' + EO + '}#ns-menu.off .st{transition:opacity 150ms,transform 150ms}' +
    '#ns-menu .bt{height:52px;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:600;font-size:16px;text-decoration:none}' +
    '#ns-menu .topo{position:absolute;left:0;right:0;bottom:0;height:45%;opacity:.3;pointer-events:none;z-index:-1}' +
    '@media (orientation:landscape) and (max-height:500px){#ns-menu{display:grid;grid-template-columns:1fr 1fr;align-content:start;column-gap:32px}#ns-menu .mi{height:44px;font-size:22px}}' +
    '@media (min-width:1024px){#ns-menu,#ns-menu-dim{display:none!important}}' +
    // touch targets >= 44px: real min-height for controls, invisible hit area for text links (no layout change)
    '@media (max-width:1023px){button:not([data-hb]):not([data-menu-btn] *):not([role="checkbox"]),[role="tab"],select,input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden]){min-height:44px}input,select,textarea{font-size:max(16px,1em)}' +
    '[data-hit]{position:relative}[data-hit="b"]::before,[data-hit="a"]::after{content:"";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%)}}' +
    '@media (max-width:767px){[data-cta-row]{flex-direction:column!important;align-items:stretch!important;gap:12px!important}[data-cta-row]>a{min-height:52px;box-sizing:border-box;display:flex!important;align-items:center;justify-content:center;gap:10px;padding-top:0!important;padding-bottom:0!important;white-space:normal!important;text-align:center}' +
    '[data-cta-row]:has(>a[href^="viber"]){display:grid!important;grid-template-columns:1fr 1fr}[data-cta-row]>a:not([href*="wa.me"]):not([href^="viber"]){grid-column:1/-1}[data-cta-row]>a[href*="wa.me"],[data-cta-row]>a[href^="viber"]{min-width:0;height:52px;padding:0 12px!important;font-size:15px!important;white-space:nowrap!important}}' +
    // phone typography + shared controls
    '@media (max-width:767px){h1{font-size:clamp(36px,10vw,48px)!important;line-height:1.05!important;letter-spacing:-.03em!important}h2{font-size:clamp(28px,7.5vw,36px)!important;line-height:1.1!important;letter-spacing:-.02em!important}' +
    'h1{white-space:normal!important}h1,h2,h3{overflow-wrap:break-word}p{text-wrap:pretty}' +
    '[role="radiogroup"]>button[role="radio"]{min-width:0;height:44px;min-height:44px;padding:0 10px!important;font-size:14px!important;gap:6px!important}' +
    '[data-row-wrap]{flex-wrap:wrap!important;row-gap:6px!important}[data-row-wrap]>*{flex-basis:auto!important}[data-row-wrap]>:last-child{margin-left:auto}' +
    '@media (max-width:429px){[role="radiogroup"][aria-labelledby]{display:flex!important}[role="radiogroup"][aria-labelledby]>button{flex:1 1 auto;padding:0 6px!important}}' +
    '[role="radiogroup"]>button[role="radio"]{white-space:nowrap!important}[data-noicon]>*>svg{display:none!important}' +
    '[data-tri]>a{min-width:0}}' +
    '@media (max-width:479px),(min-width:900px) and (max-width:1199px){[data-tri]{grid-template-columns:1fr 1fr!important;gap:10px!important}[data-tri]>:first-child{grid-column:1/-1}[data-tri]>a{height:52px;min-height:52px!important;box-sizing:border-box;padding:0 12px!important;font-size:15px!important;gap:8px!important;white-space:nowrap}[data-tri]>a svg{width:20px!important;height:20px!important;flex:0 0 20px}}' +
    '@media (max-width:359px){[role="radiogroup"]>button[role="radio"]{padding:0 4px!important;letter-spacing:-.01em}[role="radiogroup"]>button[role="radio"] svg{display:none!important}[data-short-xs]{display:inline!important}[data-long-xs]{display:none!important}}' +
    '@media (max-width:767px){[data-short]{display:inline!important}[data-long]{display:none!important}}[data-short],[data-short-xs]{display:none}' +
    '@media (prefers-reduced-motion:reduce){#ns-menu,#ns-menu .st,[data-mbar],[data-hb]{transition:opacity 150ms!important}#ns-menu{transform:none;opacity:0}#ns-menu.on{opacity:1}}';
  var st = document.createElement('style'); st.id = 'ns-mobile'; st.textContent = css; (document.head || d).appendChild(st);

  /* opening hours: Mon–Fri 08–19, Sat 09–15, Sun closed */
  function status() {
    var n = new Date(), day = n.getDay(), m = n.getHours() * 60 + n.getMinutes();
    var h = day >= 1 && day <= 5 ? [480, 1140] : day === 6 ? [540, 900] : null;
    if (h && m >= h[0] && m < h[1]) return { open: true, t: 'Otvoreno do ' + (h[1] / 60) + ':00' };
    var next = day === 6 && (!h || m >= h[1]) ? 'u ponedeljak u 08:00' : day === 0 ? 'u ponedeljak u 08:00' : (h && m < h[0]) ? 'danas u ' + String(h[0] / 60).padStart(2, '0') + ':00' : (day === 5 ? 'u subotu u 09:00' : 'sutra u 08:00');
    return { open: false, t: 'Zatvoreno · otvaramo ' + next };
  }
  var WA = 'https://wa.me/381641234567?text=Zdravo%2C%20imam%20pitanje%20u%20vezi%20sa%20detailingom.';
  var WAP = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';
  var VBP = 'M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.027-1.175-.33-2.193-1.067-2.994-.733-.795-1.763-1.25-3.05-1.34h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z';
  var PAGES = [['index.html', 'Početna'], ['usluge.html', 'Usluge'], ['cenovnik.html', 'Cenovnik'], ['galerija.html', 'Galerija'], ['o-nama.html', 'O nama'], ['kontakt.html', 'Kontakt']];
  var here = decodeURIComponent(location.pathname.split('/').pop() || 'index.html');

  var menu, dim, lockY = 0, open = false;
  function build() {
    if (menu) return;
    dim = document.createElement('div'); dim.id = 'ns-menu-dim'; dim.addEventListener('click', close);
    menu = document.createElement('nav'); menu.id = 'ns-menu'; menu.setAttribute('aria-label', 'Glavni meni');
    var s = status(), i = 0, dl = function () { return 'transition-delay:' + (60 + 50 * i++) + 'ms;'; };
    var links = PAGES.map(function (p) { return '<a class="mi st" style="transition-delay:' + (60 + 50 * i++) + 'ms" href="' + p[0] + '"' + (p[0] === here ? ' aria-current="page"' : '') + '>' + p[1] + '</a>'; }).join('');
    menu.innerHTML =
      '<svg class="topo" viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" fill="none" stroke="#3E5A4C" stroke-width="1">' +
      [40, 70, 100, 130, 160, 190].map(function (r) { return '<ellipse cx="300" cy="300" rx="' + r * 1.5 + '" ry="' + r + '"></ellipse>'; }).join('') + '</svg>' +
      '<div style="display:flex;flex-direction:column;gap:4px">' + links + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:12px;border-top:1px solid #2A3530;padding-top:24px">' +
      '<a class="bt st" href="kontakt.html" style="' + dl() + 'background:#E0A23B;color:#0F1412">Zakaži termin</a>' +
      '<div class="st" style="' + dl() + 'display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
      '<a class="bt" href="' + WA + '" target="_blank" rel="noopener" style="border:1px solid #3E5A4C;color:#F4F6F3"><svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="' + WAP + '"></path></svg>WhatsApp</a>' +
      '<a class="bt" href="viber://chat?number=%2B381641234567" style="border:1px solid #3E5A4C;color:#F4F6F3"><svg width="20" height="20" viewBox="0 0 24 24" fill="#7360F2" aria-hidden="true"><path d="' + VBP + '"></path></svg>Viber</a></div>' +
      '<div class="st" style="' + dl() + 'display:flex;flex-direction:column;gap:6px;padding-top:8px;font-size:14px"><span style="display:flex;align-items:center;gap:8px;color:#C9D1CB"><span style="width:8px;height:8px;border-radius:50%;background:' + (s.open ? '#4CAF7A' : '#5E6A63') + '"></span>' + s.t + '</span><span style="color:#8A968F">Bulevar Evrope 112, Novi Sad</span></div></div>';
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    var sx = null, sy = 0;
    menu.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    menu.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null; if (dx > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) close(); }, { passive: true });
    document.body.appendChild(dim); document.body.appendChild(menu);
  }
  function btns() { return document.querySelectorAll('[data-menu-btn]'); }
  function setOpen(v) {
    if (v === open) return; open = v; build();
    d.classList.toggle('ns-menu-open', v);
    btns().forEach(function (b) { b.setAttribute('aria-expanded', String(v)); b.setAttribute('aria-label', v ? 'Zatvori meni' : 'Otvori meni'); });
    if (v) {
      lockY = W.scrollY; var b = document.body.style; b.position = 'fixed'; b.top = -lockY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
      menu.classList.remove('off'); void menu.offsetWidth; menu.classList.add('on'); dim.classList.add('on');
      var f = menu.querySelector('a'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 50);
    } else {
      menu.classList.add('off'); menu.classList.remove('on'); dim.classList.remove('on');
      var s = document.body.style; s.position = s.top = s.left = s.right = s.width = '';
      var html = d.style.scrollBehavior; d.style.scrollBehavior = 'auto'; W.scrollTo(0, lockY); d.style.scrollBehavior = html;
    }
    update();
  }
  function close() { setOpen(false); }
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-menu-btn]'); if (b) { e.preventDefault(); setOpen(!open); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { close(); var b = btns()[0]; if (b) b.focus(); } });
  W.addEventListener('resize', function () { if (open && W.innerWidth >= 1024) close(); });

  /* bottom bar visibility */
  var heroOut = false, footIn = false, ctaIn = false, typing = false, io, io2, ov = false, ovY = 0;
  /* phone overlays (bottom sheet, calendar) mark themselves with [data-ns-ov]: lock page scroll, hide bottom bar */
  function lockOv(v) {
    if (open) return; var b = document.body.style;
    if (v) { ovY = W.scrollY; b.position = 'fixed'; b.top = -ovY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%'; }
    else { b.position = b.top = b.left = b.right = b.width = ''; var h = d.style.scrollBehavior; d.style.scrollBehavior = 'auto'; W.scrollTo(0, ovY); d.style.scrollBehavior = h; }
  }
  function lightbox() { var x = document.querySelector('[role="dialog"]'); return !!(x && x.offsetParent !== null && x.getBoundingClientRect().height > 0); }
  function update() {
    var o = !!document.querySelector('[data-ns-ov]'), fl = !!document.querySelector('[data-ns-float]'); if (o !== ov) { ov = o; lockOv(o); } d.classList.toggle('ns-ov', o || fl);
    var bar = document.querySelector('[data-mbar]'); if (!bar) return;
    bar.classList.toggle('on', heroOut && !footIn && !ctaIn && !typing && !open && !ov && !fl && !lightbox());
  }
  var foot = null, cta = null, TH = []; for (var ti = 0; ti <= 50; ti++) TH.push(ti / 50);
  function bindEnd() {
    if (!io2) return;
    var f = document.querySelector('footer'), secs = document.querySelectorAll('section'), c = null, h = document.querySelector('section');
    for (var i = secs.length - 1; i >= 0; i--) if (secs[i] !== h && !secs[i].closest('footer') && (!f || (secs[i].compareDocumentPosition(f) & 4))) { c = secs[i]; break; }
    if (f !== foot) { if (foot) io2.unobserve(foot); foot = f; footIn = false; if (f) io2.observe(f); }
    if (c !== cta) { if (cta) io2.unobserve(cta); cta = c; ctaIn = false; if (c) io2.observe(c); }
  }
  function watch() {
    /* end zone = last section before the footer (closing CTA block / home form) + footer; bar hides when >=15% of either is on screen */
    var hero = document.querySelector('section');
    if (!('IntersectionObserver' in W)) { heroOut = true; update(); return; }
    var end = function () { d.classList.toggle('ns-end', footIn || ctaIn); update(); };
    io = new IntersectionObserver(function (es) { es.forEach(function (e) { heroOut = !e.isIntersecting; }); update(); }, { threshold: 0 });
    io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.isIntersecting && e.intersectionRect.height >= 0.15 * Math.min(e.boundingClientRect.height, W.innerHeight); if (e.target === foot) footIn = v; else ctaIn = v; }); end(); }, { threshold: TH });
    if (hero) io.observe(hero); else heroOut = true;
    bindEnd();
  }
  var field = function (el) { return el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]),textarea,select'); };
  document.addEventListener('focusin', function (e) {
    if (!field(e.target)) return; typing = true; update();
    if (W.visualViewport && W.innerWidth < 768) setTimeout(function () {
      var r = e.target.getBoundingClientRect(), vv = W.visualViewport;
      if (r.bottom > vv.height - 16 || r.top < 72) W.scrollBy({ top: r.top + r.height / 2 - vv.height / 2, behavior: RM ? 'auto' : 'smooth' });
    }, 300);
  });
  document.addEventListener('focusout', function (e) { if (field(e.target)) { typing = false; setTimeout(update, 50); } });
  var mT; new MutationObserver(function () { clearTimeout(mT); mT = setTimeout(function () { bindEnd(); update(); }, 60); }).observe(document.documentElement, { childList: true, subtree: true });

  var started = false;
  (function poll(n) {
    if (!started && document.querySelector('header') && document.querySelector('section')) { started = true; watch(); return; }
    if (n < 600) requestAnimationFrame(function () { poll(n + 1); });
  })(0);

  /* button rows (2–3 CTA links side by side) stack full width on phones */
  function ctaRows() {
    document.querySelectorAll('section div, footer div').forEach(function (g) {
      if (g.hasAttribute('data-cta-row') || g.children.length < 1 || g.children.length > 3) return;
      var s = getComputedStyle(g); if (s.display !== 'flex' || s.flexWrap !== 'wrap') return;
      var ok = Array.prototype.every.call(g.children, function (c) { if (c.tagName !== 'A') return false; var k = getComputedStyle(c); return parseFloat(k.paddingTop) >= 12 && parseFloat(k.borderRadius) >= 6 && k.whiteSpace === 'nowrap'; });
      if (ok) g.setAttribute('data-cta-row', '');
    });
  }
  function fit() {
    if (W.innerWidth > 1023) return;
    document.querySelectorAll('[role="radiogroup"],[data-tri]').forEach(function (g) {
      g.removeAttribute('data-noicon');
      if (Array.prototype.some.call(g.children, function (c) { return c.scrollWidth > c.clientWidth + 1; })) g.setAttribute('data-noicon', '');
    });
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.closest('svg') || !el.firstChild) return;
      var own = false; for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.textContent.trim()) { own = true; break; }
      if (!own) return;
      if (parseFloat(getComputedStyle(el).fontSize) < 12) el.style.fontSize = '12px';
    });
    if (W.innerWidth > 767) return;
    document.querySelectorAll('section div, section figcaption, footer div').forEach(function (row) {
      if (row.hasAttribute('data-row-wrap') || row.children.length < 2) return;
      var s = getComputedStyle(row); if (s.display !== 'flex' || s.flexDirection !== 'row' || s.flexWrap === 'wrap') return;
      var last = row.lastElementChild; if (getComputedStyle(last).whiteSpace !== 'nowrap') return;
      var over = Array.prototype.some.call(row.querySelectorAll('*'), function (x) { return x.scrollWidth > x.clientWidth + 1 && getComputedStyle(x).overflowX === 'visible' && x.clientWidth > 0; });
      if (over || row.scrollWidth > row.clientWidth + 1) row.setAttribute('data-row-wrap', '');
    });
  }
  /* tag small links/buttons so their hit area is expanded to 44x44 */
  function hits() {
    ctaRows(); fit();
    if (W.innerWidth > 1023) return;
    document.querySelectorAll('a[href],button,[role="button"]').forEach(function (el) {
      if (el.hasAttribute('data-hit') || el.closest('#ns-menu')) return;
      var r = el.getBoundingClientRect(); if (!r.width) return;
      if (r.height >= 44 && r.width >= 44) return;
      var s = getComputedStyle(el); if (s.position !== 'static' && s.position !== 'relative') return;
      var k = getComputedStyle(el, '::before').content === 'none' ? 'b' : getComputedStyle(el, '::after').content === 'none' ? 'a' : '';
      if (k) el.setAttribute('data-hit', k);
    });
  }
  var hT; new MutationObserver(function () { clearTimeout(hT); hT = setTimeout(hits, 200); }).observe(document.documentElement, { childList: true, subtree: true });
  W.addEventListener('resize', function () { clearTimeout(hT); hT = setTimeout(hits, 200); });

  W.NSMobile = { open: function () { setOpen(true); }, close: close, update: update };
})();
