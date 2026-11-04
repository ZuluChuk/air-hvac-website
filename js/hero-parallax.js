// Subtle, scroll-linked parallax on the rotating hero photograph.
(() => {
  const hero = document.querySelector('.hero--parallax');
  if (!hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let scheduled = false;
  function update() {
    scheduled = false;
    const rect = hero.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= innerHeight) return;
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    hero.style.setProperty('--hero-parallax-y', Math.round(progress * 85) + 'px');
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  schedule();
})();
