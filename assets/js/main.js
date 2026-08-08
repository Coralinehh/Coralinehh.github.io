document.addEventListener("DOMContentLoaded", () => {
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = Array.from(document.querySelectorAll("main .section"));
  const hero = document.querySelector(".hero");
  const canvas = document.querySelector(".particle-field");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id || (entry.target.classList.contains("hero") ? "home" : "");
          links.forEach((link) => {
            const active = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("active", active);
          });
        }
      });
    },
    { threshold: 0.35 },
  );

  sections.forEach((section) => observer.observe(section));

  const updateHeaderTone = () => {
    if (!hero) {
      return;
    }

    document.body.classList.toggle(
      "is-past-hero",
      window.scrollY > hero.offsetHeight * 0.72,
    );
  };

  updateHeaderTone();
  window.addEventListener("scroll", updateHeaderTone, { passive: true });

  const revealItems = Array.from(
    document.querySelectorAll(
      ".section-heading, .card, .timeline-item, .contact-card li",
    ),
  );

  if (!reduceMotion) {
    revealItems.forEach((item) => item.classList.add("reveal"));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if (hero && !reduceMotion) {
    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;

    const updateParallaxTarget = (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      targetX = 50 + x * 3.8;
      targetY = 50 + y * 3.2;
    };

    const settleParallax = () => {
      targetX = 50;
      targetY = 50;
    };

    const animateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      hero.style.setProperty("--parallax-x", `${currentX.toFixed(2)}%`);
      hero.style.setProperty("--parallax-y", `${currentY.toFixed(2)}%`);
      requestAnimationFrame(animateParallax);
    };

    hero.addEventListener("mousemove", updateParallaxTarget);
    hero.addEventListener("mouseleave", settleParallax);
    requestAnimationFrame(animateParallax);
  }

  if (!canvas || reduceMotion) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  const burstStart = performance.now() + 850;

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const emitParticle = (progress) => {
    const centerX = width * 0.25;
    const centerY = height * 0.32;
    const radius = Math.min(width, height) * 0.28;
    const angle = -0.82 + progress * Math.PI * 1.86;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius * 0.82;
    const speed = 0.45 + Math.random() * 1.25;

    particles.push({
      x,
      y,
      vx: Math.cos(angle + Math.PI / 2) * speed + (Math.random() - 0.5) * 0.8,
      vy: Math.sin(angle + Math.PI / 2) * speed + (Math.random() - 0.5) * 0.8,
      life: 42 + Math.random() * 26,
      age: 0,
      size: 1.3 + Math.random() * 2.8,
    });
  };

  const animateParticles = (now) => {
    ctx.clearRect(0, 0, width, height);

    const elapsed = now - burstStart;
    if (elapsed > 0 && elapsed < 2300) {
      const progress = elapsed / 2300;
      for (let i = 0; i < 5; i += 1) {
        emitParticle(progress);
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.age += 1;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.985;
      particle.vy *= 0.985;

      const alpha = Math.max(0, 1 - particle.age / particle.life);
      const gradient = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.size * 4,
      );
      gradient.addColorStop(0, `rgba(232, 252, 255, ${alpha})`);
      gradient.addColorStop(0.35, `rgba(110, 231, 255, ${alpha * 0.72})`);
      gradient.addColorStop(1, "rgba(110, 231, 255, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      ctx.fill();

      if (particle.age >= particle.life) {
        particles.splice(i, 1);
      }
    }

    if (elapsed < 2600 || particles.length > 0) {
      requestAnimationFrame(animateParticles);
    }
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(animateParticles);
});
