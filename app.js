(() => {
  "use strict";

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("scrollProgress");
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("primaryNav");

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
      menuToggle.focus();
    }
  });

  function updateScrollUi() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
    progress.style.width = `${percent}%`;
    progress.setAttribute("aria-valuenow", String(Math.round(percent)));
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", updateScrollUi, { passive: true });
  updateScrollUi();

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(item => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5%" });
    revealItems.forEach(item => observer.observe(item));
  }

  const numberItems = document.querySelectorAll("[data-count]");
  const animateNumber = element => {
    if (element.dataset.animated) return;
    element.dataset.animated = "true";
    const target = Number(element.dataset.count);
    const suffix = target === 100 ? "%" : "+";
    if (reducedMotion) {
      element.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 1300;
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      element.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
      else element.textContent = `${target}${suffix}`;
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateNumber(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    numberItems.forEach(item => counterObserver.observe(item));
  } else numberItems.forEach(animateNumber);

  const canvas = document.getElementById("particleCanvas");
  const context = canvas.getContext("2d", { alpha: true });
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let width = 0;
  let height = 0;
  let particles = [];
  const particleCount = reducedMotion ? 0 : (coarsePointer ? 20 : 48);

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.r = Math.random() * 1.6 + .45;
      this.vx = (Math.random() - .5) * .18;
      this.vy = (Math.random() - .5) * .18;
      this.alpha = Math.random() * .28 + .08;
      this.hue = Math.random() > .55 ? 36 : 168;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -5 || this.x > width + 5 || this.y < -5 || this.y > height + 5) this.reset();
    }
    draw() {
      context.beginPath();
      context.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      context.fillStyle = `hsla(${this.hue}, 72%, 62%, ${this.alpha})`;
      context.fill();
    }
  }

  function drawParticles() {
    context.clearRect(0, 0, width, height);
    particles.forEach(particle => { particle.update(); particle.draw(); });
    if (!coarsePointer) {
      const maxDistance = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance >= maxDistance) continue;
          context.beginPath();
          context.moveTo(particles[i].x, particles[i].y);
          context.lineTo(particles[j].x, particles[j].y);
          context.strokeStyle = `rgba(212,168,67,${.065 * (1 - distance / maxDistance)})`;
          context.lineWidth = .5;
          context.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  if (particleCount) {
    resizeCanvas();
    particles = Array.from({ length: particleCount }, () => new Particle());
    window.addEventListener("resize", resizeCanvas, { passive: true });
    requestAnimationFrame(drawParticles);
  }

  const audioButton = document.getElementById("audioToggle");
  let audioContext;
  let gain;
  let oscillator;
  audioButton.addEventListener("click", async () => {
    if (reducedMotion) return;
    const active = audioButton.getAttribute("aria-pressed") === "true";
    if (!active) {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (!oscillator) {
        oscillator = audioContext.createOscillator();
        gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = 110;
        gain.gain.value = 0;
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start();
      }
      await audioContext.resume();
      gain.gain.setTargetAtTime(.022, audioContext.currentTime, .8);
      audioButton.setAttribute("aria-pressed", "true");
      audioButton.setAttribute("aria-label", "Turn ambient sound off");
    } else {
      gain.gain.setTargetAtTime(0, audioContext.currentTime, .3);
      audioButton.setAttribute("aria-pressed", "false");
      audioButton.setAttribute("aria-label", "Turn ambient sound on");
    }
  });
})();
