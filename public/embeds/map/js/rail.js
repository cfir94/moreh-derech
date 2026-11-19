// The map fills the screen; its layers are round buttons on the map's right edge (owner, 19.11).
// A layer with options opens a small popover; a layer with nothing to choose toggles from its button.
// The panels themselves are the ones app.js wires up: they are moved into the popover, not rebuilt,
// so every control keeps its listeners.

const RAIL = [
  { find: '#toggle-regions', icon: 'map', ring: '#b5651d', label: 'אזורים', direct: 'toggle-regions' },
  { find: '#toggle-visitor', icon: 'signpost', ring: '#3f7a3a', label: 'שמורות, גנים ואתרים', main: 'toggle-visitor' },
  { find: '#toggle-religions', icon: 'temple', ring: '#6a3a8c', label: 'אתרי דת', main: 'toggle-religions' },
  { find: '#toggle-periods', icon: 'sundial', ring: '#b5382a', label: 'ציר זמן היסטורי', main: 'toggle-periods' },
  { find: '#toggle-nature', icon: 'flower', ring: '#3f7a3a', label: 'חי וצומח', main: 'toggle-nature' },
  { find: '#toggle-geology', icon: 'strata', ring: '#c98a3a', label: 'מפה גיאולוגית', main: 'toggle-geology' },
  { find: '#toggle-topo', icon: 'hills', ring: '#6b4423', label: 'טופוגרפיה', main: 'toggle-topo' },
  { find: '#route-list', icon: 'footprint', ring: '#b5382a', label: 'המסלול שלי', route: true },
  { find: '#btn-cache-area', icon: 'canteen', ring: '#2a5a8c', label: 'שימוש בלי רשת' },
];

const ICON = name => `icons/ink/${name}.svg`;

function build() {
  const sidebar = document.getElementById('sidebar');
  const body = document.getElementById('app-body');
  if (!sidebar || !body) return;
  const panels = [...sidebar.querySelectorAll('section.panel')];

  const rail = document.createElement('nav');
  rail.id = 'layer-rail';
  rail.setAttribute('aria-label', 'שכבות המפה');
  const pop = document.createElement('div');
  pop.id = 'rail-pop';
  pop.hidden = true;
  pop.setAttribute('role', 'dialog');
  const popHead = document.createElement('div');
  popHead.className = 'rail-pop-head';
  const popTitle = document.createElement('h2');
  const popClose = document.createElement('button');
  popClose.type = 'button';
  popClose.className = 'rail-pop-close';
  popClose.setAttribute('aria-label', 'סגירה');
  popClose.textContent = '✕';
  popHead.append(popTitle, popClose);
  const popBody = document.createElement('div');
  popBody.className = 'rail-pop-body';
  pop.append(popHead, popBody);

  let openKey = null;
  const buttons = [];

  function close() {
    pop.hidden = true;
    pop.classList.remove('open');
    openKey = null;
    buttons.forEach(b => b.btn.setAttribute('aria-expanded', 'false'));
  }

  function open(item, panel) {
    if (openKey === item.label) { close(); return; }
    popBody.replaceChildren(panel);
    popTitle.textContent = item.label;
    pop.setAttribute('aria-label', item.label);
    pop.hidden = false;
    pop.classList.remove('open');
    void pop.offsetWidth; // restart the entrance
    pop.classList.add('open');
    openKey = item.label;
    buttons.forEach(b => b.btn.setAttribute('aria-expanded', String(b.item === item)));
  }

  RAIL.forEach(item => {
    const panel = panels.find(p => p.querySelector(item.find));
    if (!panel) return;
    // the old banner pictures and heading icons go; the popover has its own title
    panel.querySelectorAll('.panel-banner').forEach(el => el.remove());
    panel.querySelector('h2')?.remove();
    panel.classList.add('in-rail');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rail-btn';
    if (item.ring) btn.style.setProperty('--ring', item.ring);
    btn.title = item.label;
    btn.setAttribute('aria-label', item.label);
    btn.innerHTML = `<img src="${ICON(item.icon)}" alt="" /><span class="rail-label">${item.label}</span>`;
    rail.append(btn);
    const entry = { item, btn, panel };
    buttons.push(entry);

    if (item.direct) {
      const box = document.getElementById(item.direct);
      btn.setAttribute('aria-pressed', String(!!box?.checked));
      btn.addEventListener('click', () => {
        if (!box) return;
        box.checked = !box.checked;
        box.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } else {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.addEventListener('click', () => open(item, panel));
    }
    if (item.route) entry.routeButton = true;
  });

  // a button shows when its layer is on
  function syncOn() {
    buttons.forEach(({ item, btn }) => {
      const id = item.direct || item.main;
      const box = id && document.getElementById(id);
      const on = !!box?.checked;
      btn.classList.toggle('on', on);
      if (item.direct) btn.setAttribute('aria-pressed', String(on));
    });
    const count = document.querySelectorAll('#route-list li').length;
    const routeBtn = buttons.find(b => b.item.route)?.btn;
    if (routeBtn) routeBtn.dataset.count = count ? String(count) : '';
  }
  document.addEventListener('change', syncOn, true);
  new MutationObserver(syncOn).observe(document.getElementById('route-list') || document.body, { childList: true });

  popClose.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) close(); });
  document.getElementById('map')?.addEventListener('pointerdown', () => { if (!pop.hidden) close(); });

  // the header's "המסלול שלי" opens the route popover instead of the old side panel
  const routeEntry = buttons.find(b => b.item.route);
  document.getElementById('btn-toggle-route')?.addEventListener('click', e => {
    e.stopImmediatePropagation();
    if (routeEntry) open(routeEntry.item, routeEntry.panel);
  }, true);

  body.append(rail, pop);
  document.documentElement.classList.add('has-rail');
  // app.js restores the remembered layers after the map loads: catch up with it
  setTimeout(syncOn, 0);
  window.addEventListener('load', () => setTimeout(syncOn, 1500));
  setInterval(syncOn, 2500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
else build();
