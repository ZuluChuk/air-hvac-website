// Render up to eight random working portfolio images, balanced across categories.
// Missing/deleted images are skipped and replaced from the remaining candidates.
(() => {
  const container = document.querySelector('#home-project-grid');
  const projects = window.AIR_HVAC_PROJECTS;
  if (!container || !Array.isArray(projects)) return;
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const groups = projects.map(project => shuffle([...new Set((project.gallery || []).filter(path =>
    typeof path === 'string' && /^images\\/portfolio\\/[\\w-]+\\.webp$/.test(path)
  ))]).map(path => ({path, title:project.title})));
  const candidates = [];
  // Interleave categories for variety even if some categories have missing files.
  while (groups.some(group => group.length)) {
    shuffle(groups).forEach(group => {if (group.length) candidates.push(group.shift());});
  }
  const target = 8;
  let next = 0;
  let loaded = 0;
  let inFlight = 0;
  const fill = () => {
    while (loaded + inFlight < target && next < candidates.length) {
      const {path,title} = candidates[next++];
      inFlight++;
      const img = new Image();
      img.alt = title;
      img.loading = 'eager';
      img.decoding = 'async';
      img.onload = () => {
        inFlight--;
        loaded++;
        const link = document.createElement('a');
        link.href = path;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'home-project-photo';
        link.setAttribute('aria-label','View installation photo: '+title);
        link.append(img);
        container.append(link);
        fill();
      };
      img.onerror = () => {inFlight--;fill();};
      img.src = path;
    }
  };
  fill();
})();
