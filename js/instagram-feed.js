// Keep Instagram live posts independent of the local eight-photo portfolio.
(() => {
  const gallery = document.getElementById('instagram-gallery');
  if (!gallery) return;

  const fallback = () => {
    const p = document.createElement('p');
    p.className = 'instagram-status';
    p.append('Our latest Instagram photos are currently unavailable here. ');
    const link = document.createElement('a');
    link.href = 'https://www.instagram.com/airhvac_uk/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'View recent posts on Instagram ↗';
    p.append(link);
    gallery.replaceChildren(p);
    gallery.setAttribute('aria-busy', 'false');
  };

  const imageUrlOk = url => {
    try { return new URL(url).protocol === 'https:'; }
    catch { return false; }
  };
  const permalinkOk = url => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' &&
        (parsed.hostname === 'instagram.com' || parsed.hostname === 'www.instagram.com');
    } catch { return false; }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/instagram', {
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error('Instagram feed status ' + response.status);
      const result = await response.json();
      const posts = Array.isArray(result.posts) ? result.posts.filter(post =>
        post && imageUrlOk(post.imageUrl) && permalinkOk(post.permalink)
      ).slice(0, 4) : [];
      if (posts.length === 0) { fallback(); return; }

      const fragment = document.createDocumentFragment();
      posts.forEach(post => {
        const link = document.createElement('a');
        link.className = 'gallery-card';
        link.href = post.permalink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('aria-label', 'Open AIR HVAC Instagram post');

        const img = document.createElement('img');
        img.src = post.imageUrl;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = (post.caption || 'AIR HVAC Instagram installation').slice(0, 130);
        img.width = 400;
        img.height = 400;
        img.onerror = () => {
          link.remove();
          if (!gallery.querySelector('.gallery-card')) fallback();
        };

        const label = document.createElement('span');
        label.className = 'gallery-label';
        label.textContent = (post.caption || 'View on Instagram').trim().slice(0, 80);
        link.append(img, label);
        fragment.append(link);
      });
      gallery.replaceChildren(fragment);
      gallery.setAttribute('aria-busy', 'false');
    } catch (error) {
      console.warn('Instagram gallery unavailable:', error);
      fallback();
    }
  };

  // Posts are below the initial viewport; fetch them only as visitors approach.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadPosts();
    }, { rootMargin: '500px 0px' });
    observer.observe(gallery);
  } else {
    window.addEventListener('load', loadPosts, { once: true });
  }
})();
