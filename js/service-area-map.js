// Load the heavy Leaflet map only when its section is near the viewport.
// The versioned map library is not part of the initial mobile render path.
(() => {
  const element = document.getElementById('service-area-map');
  if (!element) return;

  let started = false;
  const origin = { latitude: 51.411725, longitude: -0.424129, postcode: 'TW16 6PQ' };

  const showError = () => {
    const message = document.createElement('p');
    message.className = 'map-fallback';
    message.textContent = 'Interactive map unavailable. We cover Surrey and much of Greater London; contact us with your postcode to confirm availability.';
    element.replaceChildren(message);
  };

  const loadLeaflet = async () => {
    if (window.L) return;
    const styleReady = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.onload = resolve;
      css.onerror = reject;
      document.head.append(css);
    });
    const scriptReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = 'anonymous';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    await Promise.all([styleReady, scriptReady]);
    if (!window.L) throw new Error('Leaflet was not loaded');
  };

  const fetchBoundary = async () => {
    // Stored boundary avoids a slow routing API call on every site visit.
    for (const url of ['/data/service-isochrone.geojson', '/api/service-isochrone']) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) throw new Error('Boundary HTTP ' + response.status);
        const value = await response.json();
        if (value.geojson?.type === 'FeatureCollection' && value.geojson.features?.length) {
          return value;
        }
      } catch (error) {
        console.warn('Boundary data unavailable:', url, error);
      }
    }
    throw new Error('No valid service-area boundary');
  };

  const render = async () => {
    try {
      await loadLeaflet();
    } catch (error) {
      console.warn('Map library unavailable:', error);
      showError();
      return;
    }
    const map = L.map(element, { scrollWheelZoom: false, attributionControl: true })
      .setView([origin.latitude, origin.longitude], 9);
    element.replaceChildren(); // Remove fallback text after map has initialized.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
      maxZoom: 18
    }).addTo(map);
    try {
      const data = await fetchBoundary();
      const region = L.geoJSON(data.geojson, {
        style: { color: '#b91e8d', weight: 3, opacity: .9, fillColor: '#b91e8d', fillOpacity: .18 },
        interactive: false
      }).addTo(map);
      const place = data.origin || origin;
      L.circleMarker([place.latitude, place.longitude], {
        radius: 6, color: '#090022', weight: 2, fillColor: '#29bde9', fillOpacity: 1
      }).bindPopup('Starting postcode: TW16 6PQ').addTo(map);
      map.fitBounds(region.getBounds(), { padding: [20, 20] });
    } catch (error) {
      console.warn('Stored service area unavailable:', error);
      L.circle([origin.latitude, origin.longitude], {
        radius: 45000, color: '#b91e8d', weight: 2, dashArray: '8 7',
        fillColor: '#b91e8d', fillOpacity: .12, interactive: false
      }).addTo(map);
      L.circleMarker([origin.latitude, origin.longitude], {
        radius: 6, color: '#090022', weight: 2, fillColor: '#29bde9', fillOpacity: 1
      }).bindPopup('Starting postcode: TW16 6PQ').addTo(map);
      const note = document.createElement('p');
      note.className = 'isochrone-error';
      note.textContent = 'The saved driving boundary is unavailable. Showing an approximate guide only; contact us to confirm your postcode.';
      element.insertAdjacentElement('afterend', note);
    }
    map.whenReady(() => requestAnimationFrame(() => map.invalidateSize()));
  };

  const begin = () => {
    if (started) return;
    started = true;
    render();
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      begin();
    }, { rootMargin: '500px 0px', threshold: 0 });
    observer.observe(element);
  } else {
    // Old browsers still get the map when they visit.
    window.addEventListener('load', begin, { once: true });
  }
})();
