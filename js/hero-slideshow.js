// Portfolio hero: equal exposure for each project category, regardless of photo count.
(() => {
  const image = document.querySelector('#hero-project-image');
  const projects = window.AIR_HVAC_PROJECTS;
  if (!image || !Array.isArray(projects) || !projects.length) return;

  const shuffle = items => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const groups = projects.map(project => ({
    title: project.title,
    source: project.slug,
    all: [...new Set((project.gallery || []).filter(path => /^images\\/portfolio\\/[a-z0-9-]+\\.webp$/.test(path)))],
    remaining: []
  })).filter(group => group.all.length);
  if (!groups.length) return;

  let queue = [];
  let lastGroup = null;
  let lastPhoto = null;
  let timer;
  let generation = 0;
  const interval = 5000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function nextGroup() {
    if (!queue.length) {
      queue = shuffle(groups);
      if (queue.length > 1 && queue[0] === lastGroup) {
        const swap = 1 + Math.floor(Math.random() * (queue.length - 1));
        [queue[0], queue[swap]] = [queue[swap], queue[0]];
      }
    }
    const group = queue.shift();
    lastGroup = group;
    return group;
  }
  function nextPhoto(group) {
    if (!group.remaining.length) group.remaining = shuffle(group.all);
    if (group.remaining.length > 1 && group.remaining[group.remaining.length - 1] === lastPhoto) {
      [group.remaining[0], group.remaining[group.remaining.length - 1]] = [group.remaining[group.remaining.length - 1], group.remaining[0]];
    }
    return group.remaining.pop();
  }
  function advance() {
    if (document.hidden) return;
    const group = nextGroup();
    const path = nextPhoto(group);
    const token = ++generation;
    const preload = new Image();
    preload.onload = () => {
      if (token !== generation) return;
      image.src = path;
      image.alt = group.title + ' — AIR HVAC installation photograph';
      lastPhoto = path;
      if (!reducedMotion) timer = window.setTimeout(advance, interval);
    };
    preload.onerror = () => {
      if (token !== generation) return;
      if (!reducedMotion) timer = window.setTimeout(advance, 500);
    };
    preload.src = path;
  }
  document.addEventListener('visibilitychange', () => {
    window.clearTimeout(timer);
    if (!document.hidden && !reducedMotion) advance();
  });
  advance();
})();
