(() => {
  const projects = window.AIR_HVAC_PROJECTS || [];
  const grid = document.getElementById('portfolio-grid');
  const make = (tag, className, text) => { const el = document.createElement(tag); if (className) el.className = className; if (text) el.textContent = text; return el; };
  if (grid) {
    const empty = document.getElementById('portfolio-empty');
    const render = category => {
      const matches = projects.filter(p => category === 'All' || p.category === category);
      grid.replaceChildren();
      matches.forEach(p => {
        const card = make('article', 'portfolio-card');
        const link = make('a', 'portfolio-card-link');
        link.href = 'project.html?slug=' + encodeURIComponent(p.slug);
        const img = make('img', 'portfolio-card-image'); img.src = p.image; img.alt = 'Illustration representing ' + p.title; img.loading = 'lazy'; img.onerror = () => { img.onerror = null; img.src = p.fallback; }; img.width = 640; img.height = 420;
        const content = make('div', 'portfolio-card-body');
        content.append(make('span', 'portfolio-category', p.category), make('h2', '', p.title), make('p', '', p.summary), make('span', 'portfolio-more', 'Explore project →'));
        link.append(img, content); card.append(link); grid.append(card);
      });
      empty.hidden = matches.length > 0;
    };
    document.querySelectorAll('.portfolio-filter').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('.portfolio-filter').forEach(b => { const active = b === button; b.classList.toggle('is-active', active); b.setAttribute('aria-pressed', String(active)); });
      render(button.dataset.filter);
    }));
    render('All');
  }
  const detail = document.getElementById('project-detail');
  if (detail) {
    const slug = new URLSearchParams(window.location.search).get('slug');
    const p = projects.find(item => item.slug === slug);
    if (!p) { document.title = 'Project not found | AIR HVAC'; detail.append(make('h1', '', 'Project not found'), make('p', '', 'Return to the project portfolio to browse our work.')); return; }
    document.title = p.title + ' | AIR HVAC';
    const heading = make('h1', '', p.title);
    const intro = make('p', 'portfolio-detail-intro', p.summary);
    const layout = make('div', 'portfolio-detail-grid');
    const figure = make('figure', 'portfolio-figure');
    const img = make('img'); img.src = p.image; img.alt = 'Illustration representing ' + p.title; img.width = 720; img.height = 480; img.onerror = () => { img.onerror = null; img.src = p.fallback; };
    figure.append(img, make('figcaption', '', 'Photographs supplied by AIR HVAC. Equipment and site details will be added after review.')); const gallery = make('div', 'portfolio-photo-strip'); p.gallery.forEach((src, index) => { const a = make('a'); a.href = src; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', 'Open photo ' + (index + 1)); const thumb = make('img'); thumb.src = src; thumb.loading = 'lazy'; thumb.alt = p.title + ' photograph ' + (index + 1); thumb.onerror = () => { a.hidden = true; }; a.append(thumb); gallery.append(a); }); figure.append(gallery);
    const aside = make('div', 'portfolio-detail-info');
    aside.append(make('h2', '', 'Typical scope'), make('p', '', p.location));
    const ul = make('ul'); p.scope.forEach(item => ul.append(make('li', '', item)));
    aside.append(ul, make('h3', '', 'Equipment'), make('p', '', p.equipment));
    layout.append(figure, aside);
    detail.append(make('span', 'portfolio-category', p.category), heading, intro, layout);
  }
})();
