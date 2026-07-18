(() => {
  const sectionIds = ['home', 'issue', 'curriculum', 'outcomes', 'instructor', 'pricing', 'faq'];
  const sections = sectionIds.map((id) => document.getElementById(id));
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));
  const railDots = Array.from(document.querySelectorAll('[data-rail-dot]'));
  const railFill = document.getElementById('scrollRailFill');
  const blobs = Array.from(document.querySelectorAll('.section-blob'));

  let activeIdx = 0;
  let ticking = false;

  function setActive(idx) {
    if (idx === activeIdx) return;
    activeIdx = idx;
    navLinks.forEach((link, i) => link.classList.toggle('is-active', i === idx));
    railDots.forEach((dot, i) => dot.classList.toggle('is-active', i <= idx));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
      if (railFill) railFill.style.height = pct + '%';

      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        const el = sections[i];
        if (el && el.getBoundingClientRect().top - 140 <= 0) idx = i;
      }
      setActive(idx);

      blobs.forEach((blob) => {
        const factor = parseFloat(blob.dataset.parallax || '0');
        blob.style.transform = 'translateY(' + Math.round(scrollTop * factor) + 'px)';
      });
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();
