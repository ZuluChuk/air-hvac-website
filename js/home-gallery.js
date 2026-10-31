// A compact, balanced selection of existing portfolio photographs.
(() => {
  const container = document.querySelector('#home-project-grid');
  const projects = window.AIR_HVAC_PROJECTS;
  if (!container || !Array.isArray(projects)) return;
  const selected = [];
  const maxPerProject = 2;
  projects.forEach(project => {
    (project.gallery || []).filter(path => path.startsWith('images/portfolio/') && path.endsWith('.webp')).slice(0, maxPerProject).forEach(path => {
      selected.push({path, title: project.title});
    });
  });
  selected.forEach(({path, title}, index) => {
    const link = document.createElement('a');
    link.href = path;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'home-project-photo';
    link.setAttribute('aria-label', 'View installation photo: ' + title);
    const img = document.createElement('img');
    img.src = path;
    img.alt = title;
    img.loading = 'lazy';
    img.decoding = 'async';
    link.append(img);
    container.append(link);
  });
})();
