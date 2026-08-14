/* ============================================
   NANDU KUMAR — Deep Universe HR Portfolio
   React Bits <TargetCursor /> & <Antigravity />
   ============================================ */

(() => {
  'use strict';

  // ── DOM References ──
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('navToggle');
  const navMenu     = document.getElementById('navMenu');
  const navLinks    = document.querySelectorAll('.nav-link');
  const backToTop   = document.getElementById('backToTop');
  const sections    = document.querySelectorAll('section[id]');

  // ── Mobile Navigation Toggle ──
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('nav-menu--open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('no-scroll', isOpen);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('nav-menu--open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    });
  });

  // ── Smooth Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (!target) return;
      const offset = navbar ? navbar.offsetHeight + 10 : 80;
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── Navbar Scroll Highlight ──
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.pageYOffset;
      if (navbar) {
        navbar.classList.toggle('navbar--scrolled', scrollY > 40);
      }
      if (backToTop) {
        backToTop.classList.toggle('visible', scrollY > 500);
      }

      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (scrollY >= top) {
          current = section.getAttribute('id');
        }
      });
      navLinks.forEach(link => {
        link.classList.toggle('nav-link--active', link.getAttribute('href') === `#${current}`);
      });

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Scroll Reveal IntersectionObserver ──
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── Animated Counters ──
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target) && target > 0) {
          animateCounter(el, target);
        }
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 1600;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(update);
  }

  // ── Glare Hover 3D Card Tilt Effect ──
  const glareCards = document.querySelectorAll('.skill-card, .metric-card, .cert-card, .summary-card, .timeline-card, .sw-card, .pillar-card, .quote-card, .edu-card, .contact-item');

  glareCards.forEach(card => {
    card.classList.add('glare-card');
    let overlay = card.querySelector('.glare-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'glare-overlay';
      card.appendChild(overlay);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      const percentX = (x / rect.width) * 100;
      const percentY = (y / rect.height) * 100;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
      card.style.setProperty('--glare-x', `${percentX.toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${percentY.toFixed(1)}%`);
      card.style.setProperty('--glare-opacity', '0.25');
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.setProperty('--glare-opacity', '0');
    });
  });

  // =============================================
  // REACT BITS <TargetCursor /> GSAP ENGINE
  // =============================================
  function initTargetCursorEngine() {
    if (typeof gsap === 'undefined') return;

    const isMobile = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth <= 768;
    const cursor = document.getElementById('targetCursor');
    if (!cursor || isMobile) return;

    document.body.style.cursor = 'none';

    const dot = cursor.querySelector('.target-cursor-dot');
    const corners = Array.from(cursor.querySelectorAll('.target-cursor-corner'));
    const targetSelector = '.cursor-target';
    const spinDuration = 2;
    const hoverDuration = 0.2;
    const cornerSize = 12;
    const borderWidth = 2;

    let spinTl = null;
    let activeTarget = null;
    let targetCornerPositions = null;
    const activeStrength = { current: 0 };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    function createSpinTimeline() {
      if (spinTl) spinTl.kill();
      spinTl = gsap.timeline({ repeat: -1 })
        .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    }

    createSpinTimeline();

    window.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power3.out'
      });
    });

    function tickerFn() {
      if (!targetCornerPositions || activeStrength.current === 0) return;
      const cursorX = gsap.getProperty(cursor, 'x');
      const cursorY = gsap.getProperty(cursor, 'y');

      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');
        const targetX = targetCornerPositions[i].x - cursorX;
        const targetY = targetCornerPositions[i].y - cursorY;

        const finalX = currentX + (targetX - currentX) * activeStrength.current;
        const finalY = currentY + (targetY - currentY) * activeStrength.current;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: 0.05,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      });
    }

    window.addEventListener('mousedown', () => {
      if (dot) gsap.to(dot, { scale: 0.7, duration: 0.3 });
      gsap.to(cursor, { scale: 0.9, duration: 0.2 });
    });

    window.addEventListener('mouseup', () => {
      if (dot) gsap.to(dot, { scale: 1, duration: 0.3 });
      gsap.to(cursor, { scale: 1, duration: 0.2 });
    });

    window.addEventListener('mouseover', (e) => {
      const target = e.target.closest(targetSelector);
      if (!target || activeTarget === target) return;

      activeTarget = target;
      corners.forEach(corner => gsap.killTweensOf(corner, 'x,y'));
      gsap.killTweensOf(cursor, 'rotation');
      spinTl?.pause();
      gsap.set(cursor, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      targetCornerPositions = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize }
      ];

      gsap.ticker.add(tickerFn);
      gsap.to(activeStrength, { current: 1, duration: hoverDuration, ease: 'power2.out' });

      const cursorX = gsap.getProperty(cursor, 'x');
      const cursorY = gsap.getProperty(cursor, 'y');

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositions[i].x - cursorX,
          y: targetCornerPositions[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFn);
        targetCornerPositions = null;
        activeStrength.current = 0;
        activeTarget = null;

        const positions = [
          { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
          { x: cornerSize * 0.5, y: cornerSize * 0.5 },
          { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
        ];

        corners.forEach((corner, index) => {
          gsap.to(corner, {
            x: positions[index].x,
            y: positions[index].y,
            duration: 0.3,
            ease: 'power3.out'
          });
        });

        setTimeout(() => {
          if (!activeTarget && spinTl) {
            createSpinTimeline();
          }
        }, 50);

        target.removeEventListener('mouseleave', leaveHandler);
      };

      target.addEventListener('mouseleave', leaveHandler);
    }, { passive: true });
  }

  // =============================================
  // REACT BITS <Antigravity /> DEEP UNIVERSE ENGINE
  // =============================================
  function initAntigravityEngine() {
    const container = document.getElementById('antigravityCanvas');
    if (!container || typeof THREE === 'undefined') return;

    const count = 350;
    const magnetRadius = 12;
    const ringRadius = 9;
    const waveSpeed = 0.4;
    const waveAmplitude = 1;
    const particleSize = 1.7;
    const lerpSpeed = 0.08;
    const autoAnimate = true;
    const particleVariance = 1;
    const rotationSpeed = 0.12;
    const depthFactor = 1;
    const pulseSpeed = 3;
    const fieldStrength = 10;

    const cosmicColors = ['#a855f7', '#38bdf8', '#06b6d4', '#fbbf24'];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const geometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.85 });
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    // Assign multi-colored cosmic stardust colors
    const colorObj = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const hex = cosmicColors[i % cosmicColors.length];
      colorObj.set(hex);
      mesh.setColorAt(i, colorObj);
    }
    mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);

    const dummy = new THREE.Object3D();

    const lastMousePos = { x: 0, y: 0 };
    let lastMouseMoveTime = Date.now();
    const virtualMouse = { x: 0, y: 0 };
    const pointer = { x: 0, y: 0 };

    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      lastMouseMoveTime = Date.now();
      lastMousePos.x = pointer.x;
      lastMousePos.y = pointer.y;
    });

    const particles = [];
    const aspect = window.innerWidth / window.innerHeight;
    const vWidth = 35 * aspect;
    const vHeight = 35;

    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * vWidth;
      const y = (Math.random() - 0.5) * vHeight;
      const z = (Math.random() - 0.5) * 20;
      const randomRadiusOffset = (Math.random() - 0.5) * 2;

      particles.push({
        t,
        speed,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset
      });
    }

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      let destX = (pointer.x * vWidth) / 2;
      let destY = (pointer.y * vHeight) / 2;

      if (autoAnimate && Date.now() - lastMouseMoveTime > 2000) {
        destX = Math.sin(time * 0.5) * (vWidth / 4);
        destY = Math.cos(time * 0.5 * 2) * (vHeight / 4);
      }

      virtualMouse.x += (destX - virtualMouse.x) * 0.05;
      virtualMouse.y += (destY - virtualMouse.y) * 0.05;

      const targetX = virtualMouse.x;
      const targetY = virtualMouse.y;
      const globalRotation = time * rotationSpeed;

      particles.forEach((particle, i) => {
        particle.t += particle.speed / 2;
        const t = particle.t;

        const projectionFactor = 1 - particle.cz / 50;
        const projectedTargetX = targetX * projectionFactor;
        const projectedTargetY = targetY * projectionFactor;

        const dx = particle.mx - projectedTargetX;
        const dy = particle.my - projectedTargetY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetPos = { x: particle.mx, y: particle.my, z: particle.mz * depthFactor };

        if (dist < magnetRadius) {
          const angle = Math.atan2(dy, dx) + globalRotation;
          const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
          const deviation = particle.randomRadiusOffset * (5 / (fieldStrength + 0.1));
          const currentRingRadius = ringRadius + wave + deviation;

          targetPos.x = projectedTargetX + currentRingRadius * Math.cos(angle);
          targetPos.y = projectedTargetY + currentRingRadius * Math.sin(angle);
          targetPos.z = particle.mz * depthFactor + Math.sin(t) * (1 * waveAmplitude * depthFactor);
        }

        particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
        particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
        particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

        dummy.position.set(particle.cx, particle.cy, particle.cz);
        dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
        dummy.rotateX(Math.PI / 2);

        const currentDistToMouse = Math.sqrt(
          Math.pow(particle.cx - projectedTargetX, 2) + Math.pow(particle.cy - projectedTargetY, 2)
        );

        const distFromRing = Math.abs(currentDistToMouse - ringRadius);
        let scaleFactor = Math.max(0, Math.min(1, 1 - distFromRing / 10));
        const finalScale = scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;

        dummy.scale.set(finalScale, finalScale, finalScale);
        dummy.updateMatrix();

        mesh.setMatrixAt(i, dummy.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    }

    animate();
  }

  // Initialize Engines
  initTargetCursorEngine();
  initAntigravityEngine();

  // ── Contact Form mailto Handler ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName').value.trim();
      const email = document.getElementById('contactEmail').value.trim();
      const message = document.getElementById('contactMessage').value.trim();
      if (!name || !email || !message) return;

      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:hr.nandukumar@gmail.com?subject=${subject}&body=${body}`;
    });
  }

})();
