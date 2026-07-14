document.addEventListener('DOMContentLoaded', () => {

  /* ============ NAVBAR SCROLL STATE + PROGRESS BAR ============ */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 12);

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';

    updateActiveNav();
    toggleBackToTop();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============ MOBILE NAV TOGGLE ============ */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ ACTIVE NAV HIGHLIGHTING ============ */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navItems = Array.from(document.querySelectorAll('.nav-link'));

  function updateActiveNav() {
    const scrollPos = window.scrollY + 140;
    let currentId = sections[0] ? sections[0].id : '';

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === '#' + currentId);
    });
  }

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll('.reveal');

  // Only hide elements once we know JS is actually running.
  // If anything above this point had failed, elements stay visible (safe default).
  revealEls.forEach(el => el.classList.add('pending'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending');
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ ANIMATED STATISTICS COUNTERS ============ */
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(el => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1600;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(tick);
    });
  }

  const statsSection = document.getElementById('stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsSection);
  }

  /* ============ BACK TO TOP ============ */
  const backToTop = document.getElementById('backToTop');
  function toggleBackToTop() {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============ HERO TYPING EFFECT ============ */
  const typedCodeEl = document.getElementById('typedCode');
  const codeSnippet =
`function deploy(project) {
  build(project);
  test(project);
  ship(project);

  return "Live in production";
}

deploy("your idea");`;

  let charIndex = 0;
  function typeCode() {
    if (charIndex <= codeSnippet.length) {
      typedCodeEl.textContent = codeSnippet.slice(0, charIndex);
      charIndex++;
      setTimeout(typeCode, 28);
    }
  }
  typeCode();

  /* ============ CONTACT FORM VALIDATION ============ */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fields = {
    name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
    phone: { el: document.getElementById('phone'), error: document.getElementById('phoneError') },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError') }
  };

  function validateField(key) {
    const { el, error } = fields[key];
    const value = el.value.trim();
    let message = '';

    if (key === 'name') {
      if (!value) message = 'Please enter your name.';
      else if (value.length < 2) message = 'Name looks too short.';
    }
    if (key === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) message = 'Please enter your email.';
      else if (!emailRegex.test(value)) message = 'Please enter a valid email address.';
    }
    if (key === 'phone') {
      const phoneRegex = /^[0-9+\-\s()]{7,}$/;
      if (value && !phoneRegex.test(value)) message = 'Please enter a valid phone number.';
    }
    if (key === 'message') {
      if (!value) message = 'Please enter a message.';
      else if (value.length < 10) message = 'Message should be at least 10 characters.';
    }

    error.textContent = message;
    el.classList.toggle('invalid', Boolean(message));
    return !message;
  }

  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      if (fields[key].el.classList.contains('invalid')) validateField(key);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccess.classList.remove('show');

    const results = Object.keys(fields).map(key => validateField(key));
    const allValid = results.every(Boolean);

    if (allValid) {
      formSuccess.classList.add('show');
      form.reset();
      Object.values(fields).forEach(f => f.el.classList.remove('invalid'));
    } else {
      const firstInvalid = Object.keys(fields).find(key => fields[key].el.classList.contains('invalid'));
      if (firstInvalid) fields[firstInvalid].el.focus();
    }
  });

});
