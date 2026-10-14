(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      }
    }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const phrases = ['Artificial Intelligence', 'Machine Learning', 'creative solutions', 'data-driven ideas'];
  const typed = document.getElementById('typed-text');
  if (typed && !reducedMotion) {
    let phraseIndex = 0, charIndex = phrases[0].length, deleting = true;
    const tick = () => {
      const phrase = phrases[phraseIndex];
      if (deleting) {
        charIndex--;
        typed.textContent = phrase.slice(0, Math.max(0, charIndex));
        if (charIndex <= 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
        setTimeout(tick, 45);
      } else {
        const next = phrases[phraseIndex];
        charIndex++;
        typed.textContent = next.slice(0, charIndex);
        if (charIndex >= next.length) { deleting = true; setTimeout(tick, 1500); }
        else setTimeout(tick, 72);
      }
    };
    setTimeout(tick, 1800);
  }

  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(pointer:fine)').matches && !reducedMotion) {
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
      glow.style.opacity = '1';
    }, { passive: true });
    document.addEventListener('pointerleave', () => glow.style.opacity = '0');
  }

  // Lightweight animated particle network background, with a click ripple.
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (canvas && ctx && !reducedMotion) {
    let width, height, particles = [], frame;
    const pointer = { x: -1000, y: -1000 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(85, Math.max(35, Math.floor(width / 17)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.5 + .5
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p, i) => {
        const dx = pointer.x - p.x, dy = pointer.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 115 && dist > 0) { p.x -= dx / dist * .18; p.y -= dy / dist * .18; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = width + 10; if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10; if (p.y > height + 10) p.y = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(173,190,255,.65)'; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 115) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(132,161,237,${(1 - d / 115) * .13})`;
            ctx.lineWidth = .7; ctx.stroke();
          }
        }
      });
      frame = requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.x = -1000; pointer.y = -1000; });
    window.addEventListener('click', e => {
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      ripple.style.left = `${e.clientX}px`; ripple.style.top = `${e.clientY}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 750);
    });
    resize(); draw();
    window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  }

  const copyButton = document.getElementById('copy-email');
  const copyHint = document.getElementById('copy-hint');
  if (copyButton) copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      if (copyHint) copyHint.textContent = `Copied: ${email} — remember to replace the placeholder with your real email.`;
    } catch {
      if (copyHint) copyHint.textContent = `Email placeholder: ${email}. Replace it in index.html before publishing.`;
    }
  });
})();