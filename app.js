'use strict';

/* ───── NAV ───── */
const navbar    = document.getElementById('navbar');
const navLinks  = document.getElementById('navLinks');
const navBurger = document.getElementById('navBurger');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

let _menuScrollY = 0;

function toggleNav() {
  const isOpen = navLinks.classList.toggle('open');
  if (isOpen) {
    _menuScrollY = window.scrollY;
    document.body.style.top = `-${_menuScrollY}px`;
    document.body.classList.add('menu-open');
  } else {
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, _menuScrollY);
  }
}
function closeNav() {
  if (navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, _menuScrollY);
  }
}

/* ───── BARRIER SVG BUILDER ───── */
function buildBarrierSVG() {
  const NS   = 'http://www.w3.org/2000/svg';
  const wrap = document.getElementById('barrierSvgWrap');

  const VW     = 500, VH = 320;
  const RAIL_W = 22;
  const PLK_H  = 76;
  const PLK_X  = RAIL_W;
  const PLK_W  = VW - RAIL_W * 2;   // 456
  const plankY = [244, 168, 92, 16]; // i=0 bottom → i=3 top
  const RX     = VW - RAIL_W;       // 478

  const svg  = el(NS, 'svg', { viewBox:`0 0 ${VW} ${VH}`, width:'100%', preserveAspectRatio:'xMidYMax meet' });
  const defs = el(NS, 'defs');

  // Silver aluminum rail gradient
  defs.appendChild(mkLG(NS, 'railGrad', 'x', [
    ['0%','#787878'], ['22%','#c0c0c0'], ['50%','#e4e4e4'], ['78%','#bcbcbc'], ['100%','#808080']
  ]));

  // Aluminum plank gradient
  defs.appendChild(mkLG(NS, 'plankGrad', 'y', [
    ['0%','#e8eaec'], ['50%','#d8dadc'], ['100%','#c8cdd2']
  ]));

  // Hazard stripe pattern
  const hz = el(NS, 'pattern', { id:'hz', patternUnits:'userSpaceOnUse', width:'20', height:'20', patternTransform:'rotate(-45)' });
  hz.appendChild(el(NS, 'rect', { width:'20', height:'20', fill:'#f5c518' }));
  hz.appendChild(el(NS, 'rect', { x:'0', y:'0', width:'10', height:'20', fill:'#1a1a1a' }));
  defs.appendChild(hz);

  // Drop shadow filter
  const filt = el(NS, 'filter', { id:'barrierShadow', x:'-20%', y:'-10%', width:'140%', height:'130%' });
  filt.appendChild(el(NS, 'feDropShadow', { dx:'0', dy:'8', stdDeviation:'12', 'flood-opacity':'0.6' }));
  defs.appendChild(filt);

  // Clip path: inner opening between rails
  const oc = el(NS, 'clipPath', { id:'oc' });
  oc.appendChild(el(NS, 'rect', { x:String(RAIL_W), y:'0', width:String(PLK_W), height:String(VH) }));
  defs.appendChild(oc);

  svg.appendChild(defs);

  // Main group with drop shadow
  const barrierG = el(NS, 'g', { filter:'url(#barrierShadow)' });

  /* ── LEFT RAIL ── */
  const leftRailG = el(NS, 'g', { id:'leftRail' });
  setStyle(leftRailG, 'transform:translateX(-32px);opacity:0;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s ease');
  leftRailG.appendChild(el(NS, 'rect', { x:'0', y:'0', width:String(RAIL_W), height:String(VH), fill:'url(#railGrad)' }));
  leftRailG.appendChild(el(NS, 'rect', { x:String(RAIL_W-6), y:'0', width:'6', height:String(VH), fill:'rgba(0,0,0,0.25)' }));
  [92, 168, 244].forEach(by => {
    leftRailG.appendChild(el(NS, 'circle', { cx:String(RAIL_W/2), cy:String(by), r:'5', fill:'#909090', stroke:'#606060', 'stroke-width':'1' }));
  });
  barrierG.appendChild(leftRailG);

  /* ── RIGHT RAIL ── */
  const rightRailG = el(NS, 'g', { id:'rightRail' });
  setStyle(rightRailG, 'transform:translateX(32px);opacity:0;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s ease');
  rightRailG.appendChild(el(NS, 'rect', { x:String(RX), y:'0', width:String(RAIL_W), height:String(VH), fill:'url(#railGrad)' }));
  rightRailG.appendChild(el(NS, 'rect', { x:String(RX), y:'0', width:'6', height:String(VH), fill:'rgba(0,0,0,0.25)' }));
  [92, 168, 244].forEach(by => {
    rightRailG.appendChild(el(NS, 'circle', { cx:String(RX + RAIL_W/2), cy:String(by), r:'5', fill:'#909090', stroke:'#606060', 'stroke-width':'1' }));
  });
  barrierG.appendChild(rightRailG);

  /* ── PLANKS (clipped to inner opening) ── */
  const planksG = el(NS, 'g', { id:'planksG', 'clip-path':'url(#oc)' });

  plankY.forEach((py, i) => {
    const pg = el(NS, 'g', { id:`plank${i}` });
    setStyle(pg, 'transform:translateY(340px)');

    // Plank body
    pg.appendChild(el(NS, 'rect', { x:String(PLK_X), y:String(py), width:String(PLK_W), height:String(PLK_H), fill:'url(#plankGrad)' }));

    // Horizontal line texture (2 grooves)
    for (let t = 1; t <= 2; t++) {
      pg.appendChild(el(NS, 'line', {
        x1:String(PLK_X), y1:String(py + t*(PLK_H/3)),
        x2:String(PLK_X+PLK_W), y2:String(py + t*(PLK_H/3)),
        stroke:'rgba(0,0,0,0.06)', 'stroke-width':'1'
      }));
    }

    // Top highlight
    pg.appendChild(el(NS, 'line', {
      x1:String(PLK_X), y1:String(py+1),
      x2:String(PLK_X+PLK_W), y2:String(py+1),
      stroke:'rgba(255,255,255,0.6)', 'stroke-width':'1.5'
    }));

    // 3px dark separator on bottom edge
    pg.appendChild(el(NS, 'rect', {
      x:String(PLK_X), y:String(py+PLK_H-3),
      width:String(PLK_W), height:'3', fill:'rgba(0,0,0,0.22)'
    }));

    // Hazard stripe on TOP edge of topmost plank (i=3), 14px tall
    if (i === 3) {
      pg.appendChild(el(NS, 'rect', {
        id:'hazardRect', x:String(PLK_X), y:String(py),
        width:String(PLK_W), height:'14', fill:'url(#hz)'
      }));
    }

    // Metallic sheen overlay (animated via JS)
    pg.appendChild(el(NS, 'rect', {
      id:`sheen${i}`, x:String(PLK_X), y:String(py),
      width:String(PLK_W), height:String(PLK_H), fill:'white', opacity:'0'
    }));

    planksG.appendChild(pg);
  });

  barrierG.appendChild(planksG);
  svg.appendChild(barrierG);
  wrap.appendChild(svg);
}

/* SVG creation helpers */
function el(ns, tag, attrs) {
  const e = document.createElementNS(ns, tag);
  if (attrs) Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v));
  return e;
}
function setStyle(el, style) { el.setAttribute('style', style); }
function mkLG(ns, id, dir, stops) {
  const lg = document.createElementNS(ns, 'linearGradient');
  lg.setAttribute('id', id);
  if (dir === 'x') { lg.setAttribute('x1','0'); lg.setAttribute('y1','0'); lg.setAttribute('x2','1'); lg.setAttribute('y2','0'); }
  else             { lg.setAttribute('x1','0'); lg.setAttribute('y1','0'); lg.setAttribute('x2','0'); lg.setAttribute('y2','1'); }
  stops.forEach(([offset, color]) => {
    const s = document.createElementNS(ns, 'stop');
    s.setAttribute('offset', offset); s.setAttribute('stop-color', color);
    lg.appendChild(s);
  });
  return lg;
}

/* Build progress dots */
function buildDots() {
  const container = document.getElementById('asmDots');
  const N = 7;
  for (let i = 0; i < N; i++) {
    const d = document.createElement('div');
    d.className = 'asm-dot';
    d.dataset.step = i;
    container.appendChild(d);
  }
}

/* ───── BARRIER SCROLL ANIMATION ───── */
function updateBarrier(progress) {
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function getP(p, s, e) {
    if (p <= s) return 0;
    if (p >= e) return 1;
    return easeOutCubic((p - s) / (e - s));
  }

  const housePhoto = document.getElementById('housePhoto');
  const leftRail   = document.getElementById('leftRail');
  const rightRail  = document.getElementById('rightRail');
  const dots       = document.querySelectorAll('.asm-dot');

  // Photo fades in: 0.0–0.10
  if (housePhoto) housePhoto.style.opacity = getP(progress, 0, 0.10).toFixed(3);
  dots[0] && dots[0].classList.toggle('lit', progress >= 0.05);

  // Rails slide in: 0.12–0.22
  const rp = getP(progress, 0.12, 0.22);
  const ro = (1 - rp) * 32;
  if (leftRail)  { leftRail.style.transform  = `translateX(${-ro}px)`;  leftRail.style.opacity  = rp.toFixed(3); }
  if (rightRail) { rightRail.style.transform = `translateX(${ro}px)`;   rightRail.style.opacity = rp.toFixed(3); }
  dots[1] && dots[1].classList.toggle('lit', progress >= 0.17);

  // Planks rise: staggered eased timing
  [[0.25, 0.40], [0.38, 0.52], [0.50, 0.64], [0.62, 0.76]].forEach(([s, e], i) => {
    const pg = document.getElementById(`plank${i}`);
    if (pg) pg.style.transform = `translateY(${((1 - getP(progress, s, e)) * 340).toFixed(1)}px)`;
    if (dots[i+2]) dots[i+2].classList.toggle('lit', progress >= (s+e)/2);
  });

  // Metallic sheen pulse: 0.78–0.90
  const sp = getP(progress, 0.78, 0.90);
  const so = (sp < 0.5 ? sp * 0.8 : (1 - sp) * 0.8).toFixed(3);
  for (let i = 0; i < 4; i++) {
    const s = document.getElementById(`sheen${i}`);
    if (s) s.setAttribute('opacity', so);
  }
  dots[6] && dots[6].classList.toggle('lit', progress >= 0.84);

  // Hazard stripe brightness pulse: 0.88–1.0
  const hr = document.getElementById('hazardRect');
  if (hr) {
    const hp = getP(progress, 0.88, 1.0);
    hr.style.opacity = (0.7 + 0.3 * Math.sin(hp * Math.PI * 4)).toFixed(3);
  }
}

function initProductScroll() {
  const section = document.getElementById('product');
  let active = false;

  const io = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
    if (active) tick();
    else window.removeEventListener('scroll', onScroll);
  }, { threshold: 0 });

  io.observe(section);

  function onScroll() { tick(); }

  function tick() {
    const rect   = section.getBoundingClientRect();
    const travel = section.offsetHeight - window.innerHeight;
    const progress = travel > 0 ? Math.max(0, Math.min(1, -rect.top / travel)) : 0;
    updateBarrier(progress);

    if (progress > 0.04) document.getElementById('productHeader').classList.add('visible');
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  tick();
}

/* ───── GENERIC INTERSECTION OBSERVER FOR ANIMATIONS ───── */
function initAnimObservers() {
  const genericOpts = { threshold: 0.14, rootMargin: '0px 0px -40px 0px' };

  new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, genericOpts).observe = (() => {
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, genericOpts);
    document.querySelectorAll('.anim').forEach(el => ob.observe(el));
    return ob.observe.bind(ob);
  })();

  const cardOb = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || 0) * 105;
      setTimeout(() => e.target.classList.add('visible'), delay);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.b-card').forEach(c => cardOb.observe(c));

  const mOb = new IntersectionObserver(entries => {
    entries.forEach((e, idx) => {
      if (!e.isIntersecting) return;
      const i = [...document.querySelectorAll('.m-card')].indexOf(e.target);
      setTimeout(() => e.target.classList.add('visible'), (i < 0 ? 0 : i) * 160);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.m-card').forEach(c => mOb.observe(c));

  const sOb = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || 0) * 115;
      setTimeout(() => e.target.classList.add('visible'), delay);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.step').forEach(s => sOb.observe(s));

  const calcOb = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  const cc = document.getElementById('calcCard');
  if (cc) calcOb.observe(cc);
}

/* ───── QUOTE CTA LINKS ───── */
function buildQuoteMessage() {
  const rows = document.querySelectorAll('.barrier-row');
  const valid = [];
  rows.forEach((row, i) => {
    const wInput = row.querySelector('.bw');
    const hInput = row.querySelector('.bh');
    const w = parseFloat(wInput ? wInput.value : '');
    const h = parseFloat(hInput ? hInput.value : '');
    if (!isNaN(w) && !isNaN(h) && w >= 50 && w <= 1000 && h >= 20 && h <= 120 && h % 20 === 0) {
      valid.push({ num: i + 1, w, h });
    }
  });
  if (valid.length === 0) {
    return 'Hola, quiero solicitar presupuesto para barreras anti DANA. ¿Podríais informarme sobre precios y plazos?';
  }
  let subtotal = 0;
  const lines = valid.map(b => {
    subtotal += b.w * b.h * 0.024 * 1.50;
    return `- Barrera ${b.num}: ${b.w} × ${b.h} cm`;
  });
  const totalFmt = (subtotal * 1.21).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `Hola,\nQuiero solicitar presupuesto para las siguientes barreras:\n${lines.join('\n')}\nTotal estimado: ${totalFmt} €\n\n¿Podríais informarme sobre precios y plazos?\nQuedo a la espera de presupuesto oficial.\n\nUn saludo.`;
}

function updateCtaLinks() {
  const msg = buildQuoteMessage();

  const waLink = document.getElementById('whatsappCTA');
  if (waLink) {
    waLink.href = `https://wa.me/34675323517?text=${encodeURIComponent(msg)}`; // TODO: replace with real WhatsApp number
  }

  const emailLink = document.getElementById('emailCTA');
  if (emailLink) {
    emailLink.href = `mailto:info@upstore2022.com?subject=${encodeURIComponent('Solicitud de presupuesto')}&body=${encodeURIComponent(msg)}`;
  }
}

/* ───── MULTI-BARRIER CALCULATOR ───── */
function initCalculator() {
  const rowsContainer = document.getElementById('barrierRows');
  const addBtn        = document.getElementById('addBarrierBtn');
  const summariesEl   = document.getElementById('barrierSummaries');
  const calcDivider   = document.getElementById('calcDivider');
  const rBase         = document.getElementById('rBase');
  const rIva          = document.getElementById('rIva');
  const rPrice        = document.getElementById('rPrice');

  let rowCount = 0;

  function fmt(n) {
    return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function validateWidth(input, errEl) {
    const v = parseFloat(input.value);
    if (input.value === '' || isNaN(v)) { errEl.textContent = ''; input.classList.remove('err'); return null; }
    if (v < 50 || v > 1000) { errEl.textContent = 'Entre 50 y 1000 cm'; input.classList.add('err'); return null; }
    errEl.textContent = ''; input.classList.remove('err'); return v;
  }

  function validateHeight(input, errEl) {
    const v = parseFloat(input.value);
    if (input.value === '' || isNaN(v)) { errEl.textContent = ''; input.classList.remove('err'); return null; }
    if (v < 20 || v > 120) { errEl.textContent = 'Entre 20 y 120 cm'; input.classList.add('err'); return null; }
    if (v % 20 !== 0) { errEl.textContent = 'Múltiplo de 20 cm'; input.classList.add('err'); return null; }
    errEl.textContent = ''; input.classList.remove('err'); return v;
  }

  function updateRowLabels() {
    rowsContainer.querySelectorAll('.barrier-row').forEach((row, i) => {
      row.querySelector('.barrier-row-label').textContent = `Barrera ${i + 1}`;
      row.querySelector('.remove-btn').setAttribute('aria-label', `Eliminar barrera ${i + 1}`);
    });
  }

  function updateControls() {
    const rows = rowsContainer.querySelectorAll('.barrier-row');
    const single = rows.length <= 1;
    rows.forEach(row => {
      row.querySelector('.remove-btn').style.display = single ? 'none' : '';
    });
    addBtn.style.display = rows.length >= 10 ? 'none' : '';
  }

  function recalc() {
    updateControls();

    const rows = rowsContainer.querySelectorAll('.barrier-row');
    let subtotal = 0;
    const valid = [];

    rows.forEach((row, i) => {
      const wInput = row.querySelector('.bw');
      const hInput = row.querySelector('.bh');
      const wErr   = row.querySelector('.bw-err');
      const hErr   = row.querySelector('.bh-err');
      const w = validateWidth(wInput, wErr);
      const h = validateHeight(hInput, hErr);

      if (w && h) {
        const withMargin = w * h * 0.024 * 1.50;
        subtotal += withMargin;
        valid.push({ num: i + 1, w, h, withMargin });
      }
    });

    // Per-barrier summary lines
    summariesEl.innerHTML = '';
    if (valid.length > 0) {
      valid.forEach(b => {
        const line = document.createElement('div');
        line.className = 'res-row barrier-summary-row';
        line.innerHTML =
          `<span class="res-lbl">Barrera ${b.num}: ${b.w} × ${b.h} cm</span>` +
          `<span class="res-val">${fmt(b.withMargin)}</span>`;
        summariesEl.appendChild(line);
      });

      calcDivider.style.display = '';

      const iva   = subtotal * 0.21;
      const total = subtotal + iva;

      rBase.textContent  = fmt(subtotal);
      rIva.textContent   = fmt(iva);
      rPrice.textContent = fmt(total);

      updateCtaLinks();

    } else {
      calcDivider.style.display = 'none';
      rBase.textContent = rIva.textContent = rPrice.textContent = '—';
      updateCtaLinks();
    }
  }

  function addRow() {
    if (rowsContainer.querySelectorAll('.barrier-row').length >= 10) return;
    rowCount++;

    const row = document.createElement('div');
    row.className = 'barrier-row';

    row.innerHTML =
      `<div class="barrier-row-label">Barrera ${rowCount}</div>` +
      `<div class="barrier-row-fields">` +
        `<div class="inp-group">` +
          `<label>Anchura</label>` +
          `<div class="inp-wrap"><input type="number" class="bw" min="50" max="1000" placeholder="200"></div>` +
          `<span class="inp-error bw-err"></span>` +
        `</div>` +
        `<div class="inp-group">` +
          `<label>Altura</label>` +
          `<div class="inp-wrap"><input type="number" class="bh" min="20" max="120" step="20" placeholder="60"></div>` +
          `<span class="inp-error bh-err"></span>` +
        `</div>` +
        `<button type="button" class="remove-btn" aria-label="Eliminar barrera ${rowCount}">✕</button>` +
      `</div>`;

    const wInput = row.querySelector('.bw');
    const hInput = row.querySelector('.bh');

    wInput.addEventListener('input', recalc);
    hInput.addEventListener('input', recalc);
    hInput.addEventListener('blur', () => {
      const v = parseFloat(hInput.value);
      if (!isNaN(v) && v > 0 && v % 20 !== 0) { hInput.value = Math.round(v / 20) * 20; recalc(); }
    });

    row.querySelector('.remove-btn').addEventListener('click', () => {
      row.remove();
      updateRowLabels();
      recalc();
    });

    rowsContainer.appendChild(row);
    updateControls();
    recalc();
  }

  addBtn.addEventListener('click', addRow);
  addRow(); // initialise with one row
}

/* ───── BOOT ───── */
document.addEventListener('DOMContentLoaded', () => {
  buildBarrierSVG();
  buildDots();
  initProductScroll();
  initAnimObservers();
  initCalculator();
  updateCtaLinks();
});
