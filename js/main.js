const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false');
}));
document.querySelector('#year').textContent = new Date().getFullYear();
// No form: email links use the visitor’s own email application.
// Road-network isochrone: 60-minute drive from the business origin postcode.
(async () => {
  const element = document.getElementById('service-area-map');
  if (!element || typeof L === 'undefined') return;
  element.replaceChildren();
  const map = L.map(element, {scrollWheelZoom:false,attributionControl:true}).setView([51.40,-0.42],9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    maxZoom:18
  }).addTo(map);
  let boundaryLoaded = false;
  try {
    const response = await fetch('/api/service-isochrone', {signal:AbortSignal.timeout(45000)});
    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.message || 'Isochrone service unavailable');
    }
    const {geojson,origin} = await response.json();
    if (geojson?.type !== 'FeatureCollection' || !geojson.features?.length) throw new Error('Invalid boundary');
    const region = L.geoJSON(geojson, {
      style:{color:'#b91e8d',weight:3,opacity:.9,fillColor:'#b91e8d',fillOpacity:.18},
      interactive:false
    }).addTo(map);
    L.circleMarker([origin.latitude,origin.longitude], {
      radius:6,color:'#090022',weight:2,fillColor:'#29bde9',fillOpacity:1
    }).bindPopup('Starting postcode: TW16 6PQ').addTo(map);
    map.fitBounds(region.getBounds(),{padding:[20,20]});
    boundaryLoaded = true;
  } catch(error) {
    console.warn('Saved driving boundary unavailable:',error.message);
    const message = document.createElement('p');
    message.className = 'isochrone-error';
    message.textContent = 'Live 60-minute driving boundary unavailable. Showing an approximate local coverage guide instead; contact us with your postcode to confirm.';
    L.circle([51.411725,-0.424129],{radius:45000,color:'#b91e8d',weight:2,dashArray:'8 7',fillColor:'#b91e8d',fillOpacity:.12,interactive:false}).addTo(map);
    L.circleMarker([51.411725,-0.424129],{radius:6,color:'#090022',weight:2,fillColor:'#29bde9',fillOpacity:1}).bindPopup('Starting postcode: TW16 6PQ').addTo(map);
    map.setView([51.411725,-0.424129],9);
    element.insertAdjacentElement('afterend',message);
  }
  map.whenReady(() => setTimeout(() => map.invalidateSize(),0));
})();

(() => {
  const tabs = Array.from(document.querySelectorAll('.explorer-tab'));
  if (!tabs.length) return;
  const select = (target, focus = false) => {
    tabs.forEach(tab => {
      const active = tab === target;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
    if (focus) target.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
})();
