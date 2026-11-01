// Show eight random existing portfolio photos, balanced across project categories.
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

  const selected = [];
  projects.forEach(project => {
    const photos = [...new Set((project.gallery || []).filter(path =>
      path.startsWith('images/portfolio/') && path.endsWith('.webp')
    ))];
    shuffle(photos).slice(0, 2).forEach(path => {
      selected.push({path, title: project.title});
    });
  });

  shuffle(selected).slice(0, 8).forEach(({path, title}) => {
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
