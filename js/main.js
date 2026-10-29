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
// Optional gallery integration: add /api/instagram on Cloudflare Pages later.
// It should return { posts: [{ imageUrl, permalink, caption }] }.
// Images are never requested directly from Instagram in browser JavaScript with a secret token.
(async () => {
  try {
    const response = await fetch('/api/instagram', { signal: AbortSignal.timeout(4500) });
    if (!response.ok) return;
    const { posts } = await response.json();
    if (!Array.isArray(posts) || !posts.length) return;
    const gallery = document.querySelector('#instagram-gallery');
    const validPosts = posts.filter(post => /^https:\/\//.test(post.imageUrl || '') && /^https:\/\/(www\.)?instagram\.com\//.test(post.permalink || ''));
    if (!validPosts.length) return;
    gallery.replaceChildren();
    validPosts.slice(0, 4).forEach(post => {
      if (!/^https:\/\//.test(post.imageUrl || '') || !/^https:\/\/(www\.)?instagram\.com\//.test(post.permalink || '')) return;
      const a = document.createElement('a'); a.className = 'gallery-card';
      a.href = post.permalink; a.target = '_blank'; a.rel = 'noopener noreferrer';
      const img = document.createElement('img'); img.src = post.imageUrl;
      img.loading = 'lazy'; img.alt = (post.caption || 'AIR HVAC Instagram project').slice(0, 130);
      const label = document.createElement('span'); label.className = 'gallery-label';
      label.textContent = (post.caption || 'View project on Instagram').slice(0, 55) + ' ↗';
      a.append(img, label); gallery.append(a);
    });
  } catch { /* Preserve the curated fallback gallery */ }
})();

// Accessible services explorer: mouse, touch, and arrow-key tab navigation.
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
