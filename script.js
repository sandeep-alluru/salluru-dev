/* ===== DARK MODE TOGGLE ===== */
(function () {
  const STORAGE_KEY = 'salluru-theme';
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');

  function applyTheme(theme) {
    body.classList.remove('dark', 'light');
    body.classList.add(theme);
    if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function getSavedTheme() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function saveTheme(theme) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { }
  }

  // Init theme
  const saved = getSavedTheme();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  if (toggle) {
    toggle.addEventListener('click', function () {
      const current = body.classList.contains('dark') ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      saveTheme(next);
    });
  }
})();

/* ===== TERMINAL ANIMATION ===== */
(function () {
  const terminalBody = document.getElementById('terminal-body');
  if (!terminalBody) return;

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const LINES = [
    { type: 'input', text: '$ claude' },
    { type: 'input', text: '> /scaffold-saas-app' },
    { type: 'output', text: '✓ Next.js + Tailwind + Clerk + Convex', delay: 500 },
    { type: 'input', text: '> /auth-flow' },
    { type: 'output', text: '✓ Sign-in, sign-up, reset, sessions' },
    { type: 'input', text: '> /billing-stripe' },
    { type: 'output', text: '✓ Subscriptions + webhooks + portal' },
    { type: 'input', text: '> /deploy-prod' },
    { type: 'output', text: '✓ Live at salluru.dev — done in 8m 23s' },
  ];

  const CHAR_DELAY = 50;     // ms per character for typing
  const LINE_PAUSE = 300;    // ms between lines
  const END_PAUSE = 1500;    // ms before restart

  if (prefersReducedMotion) {
    // Show all lines statically
    terminalBody.innerHTML = '';
    LINES.forEach(function (line) {
      const el = document.createElement('div');
      el.className = 'terminal-line' + (line.type === 'output' ? ' terminal-success' : '');
      el.textContent = line.text;
      terminalBody.appendChild(el);
    });
    return;
  }

  let animTimeout = null;
  let stopped = false;

  function clearTerminal() {
    terminalBody.innerHTML = '';
  }

  function createLineEl(isOutput) {
    const el = document.createElement('div');
    el.className = 'terminal-line' + (isOutput ? ' terminal-success' : '');
    terminalBody.appendChild(el);
    return el;
  }

  function typeLine(el, text, charDelay, onDone) {
    let i = 0;

    // Create cursor
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    el.appendChild(cursor);

    function typeNext() {
      if (stopped) return;
      if (i < text.length) {
        // Insert character before cursor
        const textNode = document.createTextNode(text[i]);
        el.insertBefore(textNode, cursor);
        i++;
        animTimeout = setTimeout(typeNext, charDelay);
      } else {
        // Remove cursor when done
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        onDone();
      }
    }

    typeNext();
  }

  function runAnimation() {
    if (stopped) return;
    clearTerminal();
    let lineIndex = 0;

    function nextLine() {
      if (stopped) return;
      if (lineIndex >= LINES.length) {
        // All lines done — pause then restart
        animTimeout = setTimeout(runAnimation, END_PAUSE);
        return;
      }

      const line = LINES[lineIndex];
      lineIndex++;

      const extraDelay = line.delay || 0;

      animTimeout = setTimeout(function () {
        if (stopped) return;
        const el = createLineEl(line.type === 'output');

        if (line.type === 'output') {
          // Output lines appear instantly
          el.textContent = line.text;
          animTimeout = setTimeout(nextLine, LINE_PAUSE);
        } else {
          // Input lines get typed character by character
          typeLine(el, line.text, CHAR_DELAY, function () {
            animTimeout = setTimeout(nextLine, LINE_PAUSE);
          });
        }

        // Auto-scroll terminal
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, extraDelay);
    }

    nextLine();
  }

  // Start animation when terminal is in viewport
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !animTimeout && !stopped) {
          runAnimation();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(terminalBody);
  } else {
    runAnimation();
  }

  // Pause animation when page is hidden (battery / perf)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopped = true;
      clearTimeout(animTimeout);
      animTimeout = null;
    } else {
      stopped = false;
      runAnimation();
    }
  });
})();

/* ===== EMAIL FORM HANDLING ===== */
(function () {
  function handleForm(formId, messageId) {
    const form = document.getElementById(formId);
    const msgEl = document.getElementById(messageId);
    if (!form || !msgEl) return;

    form.addEventListener('submit', function (e) {
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';

      // Basic client-side validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        msgEl.textContent = 'Please enter a valid email address.';
        msgEl.className = 'form-message error';
        if (emailInput) emailInput.focus();
        return;
      }

      // Submit happens to hidden iframe (target="form-target")
      // Show optimistic success after short delay
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending…';
      }

      setTimeout(function () {
        msgEl.textContent = 'Check your email — your commands are on the way.';
        msgEl.className = 'form-message success';
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Get the commands';
        }
        if (emailInput) emailInput.value = '';
      }, 1200);

      // Listen for iframe load error (best-effort)
      const iframe = document.getElementById('form-target');
      if (iframe) {
        iframe.addEventListener('error', function () {
          msgEl.textContent = 'Something went wrong. Try again or email salluru.work@gmail.com.';
          msgEl.className = 'form-message error';
          if (btn) {
            btn.disabled = false;
            btn.textContent = 'Get the commands';
          }
        }, { once: true });
      }
    });
  }

  handleForm('hero-form', 'hero-form-message');
  handleForm('cta-form', 'cta-form-message');
})();
