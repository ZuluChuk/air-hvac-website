// Shuffle the actual on-disk installation photos indexed during the Cloudflare build.
// If the generated manifest is unavailable, keep the eight real fallback photos in index.html.
(() => {
  const container = document.getElementById('home-project-grid');
  const manifest = window.AIR_HVAC_GALLERY_IMAGES;
  if (!container || !Array.isArray(manifest) || !manifest.length) return;

  const photos = [...new Set(manifest.filter(path =>
    typeof path === 'string' &&
    /^images\/(?:[a-z0-9-]+\/)*[a-z0-9-]+\.(?:webp|jpg|jpeg|png|avif)$/i.test(path)
  ))];
  for (let i = photos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [photos[i], photos[j]] = [photos[j], photos[i]];
  }
  if (!photos.length) return;

  const titleFromPath = path => path.split('/').pop()
    .replace(/-\d+\.[^.]+$/, '').replace(/\.[^.]+$/, '').replace(/-/g, ' ');
  const maximum = Math.min(8, photos.length);
  let next = 0;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < maximum; i++) {
    const link = document.createElement('a');
    link.className = 'gallery-card';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = 440;
    img.height = 330;
    const tryNextPhoto = () => {
      if (next >= photos.length) {
        link.remove();
        return;
      }
      const src = photos[next++];
      const label = titleFromPath(src);
      link.href = src;
      link.setAttribute('aria-label', 'Open ' + label + ' installation photo');
      img.alt = 'AIR HVAC ' + label + ' installation';
      img.src = src;
    };
    img.onerror = tryNextPhoto;
    link.append(img);
    fragment.append(link);
    tryNextPhoto();
  }
  container.replaceChildren(fragment);
})();
