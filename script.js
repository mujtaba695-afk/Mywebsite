/* =====================================================================
   Mujtaba Sajawal — Portfolio
   Vanilla JS (ES6+) · IntersectionObserver · counters · timeline fill
   ===================================================================== */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Footer year
  --------------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------
     2. Mobile nav toggle
  --------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu when a link is tapped
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------------
     3. Header shadow + scroll progress bar
  --------------------------------------------------------------- */
  const header = document.getElementById('site-header');
  const progress = document.getElementById('scroll-progress');

  function onScrollChrome() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (header) header.classList.toggle('scrolled', scrollTop > 8);

    if (progress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progress.style.width = pct + '%';
    }
  }

  /* ---------------------------------------------------------------
     4. Animated timeline track fill
  --------------------------------------------------------------- */
  const timelineWrap = document.getElementById('timeline-wrap');
  const timelineFill = document.getElementById('timeline-fill');
  const timelineItems = Array.prototype.slice.call(
    document.querySelectorAll('.timeline-item')
  );

  function updateTimelineFill() {
    if (!timelineWrap || !timelineFill) return;

    const rect = timelineWrap.getBoundingClientRect();
    const viewportMid = window.innerHeight * 0.55;

    // How far the viewport midline has travelled through the timeline (0 → 1)
    const distance = viewportMid - rect.top;
    let ratio = distance / rect.height;
    ratio = Math.max(0, Math.min(1, ratio));

    timelineFill.style.height = (ratio * 100) + '%';

    // Light up each node once the fill line passes it
    const fillY = rect.top + rect.height * ratio;
    timelineItems.forEach(function (item) {
      const node = item.querySelector('.timeline-node');
      if (!node) return;
      const nodeRect = node.getBoundingClientRect();
      item.classList.toggle('active', nodeRect.top <= fillY);
    });
  }

  /* ---------------------------------------------------------------
     5. Throttled scroll handler (rAF)
  --------------------------------------------------------------- */
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScrollChrome();
      updateTimelineFill();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------------------------------------------------------------
     6. Number counter (0 → target over 1.5s, linear)
  --------------------------------------------------------------- */
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-count-to')) || 0;
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1500; // 1.5s
    const start = performance.now();

    if (prefersReducedMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }

    function frame(now) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1); // linear ease
      const current = Math.round(target * t);
      el.textContent = prefix + current + suffix;
      if (t < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }
    window.requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------
     7. Single IntersectionObserver: reveal + counters + chart
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        // Buttery fade-in-up
        el.classList.add('active');

        // Kick off counters living inside this element
        el.querySelectorAll('[data-count-to]').forEach(function (counter) {
          if (!counter.dataset.counted) {
            counter.dataset.counted = 'true';
            animateCounter(counter);
          }
        });

        obs.unobserve(el); // animate once
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: reveal everything, run counters immediately
    revealEls.forEach(function (el) { el.classList.add('active'); });
    document.querySelectorAll('[data-count-to]').forEach(animateCounter);
  }

  /* ---------------------------------------------------------------
     8. Rotating sync status text in the hero dashboard
  --------------------------------------------------------------- */
  const syncText = document.getElementById('sync-text');
  if (syncText && !prefersReducedMotion) {
    const messages = [
      'Syncing with n8n…',
      'Pushing leads to Dynamics 365…',
      'Optimizing Meta Ads bids…',
      'Gemini drafting creative…'
    ];
    let i = 0;
    setInterval(function () {
      i = (i + 1) % messages.length;
      syncText.style.opacity = '0';
      setTimeout(function () {
        syncText.textContent = messages[i];
        syncText.style.opacity = '1';
      }, 220);
    }, 2600);
    syncText.style.transition = 'opacity 0.22s ease';
  }

  /* ---------------------------------------------------------------
     9. Live conversions ticker in the hero dashboard
  --------------------------------------------------------------- */
  const liveConv = document.getElementById('live-conversions');
  if (liveConv && !prefersReducedMotion) {
    let count = 1284;
    setInterval(function () {
      count += Math.floor(Math.random() * 4) + 1;
      liveConv.textContent = count.toLocaleString('en-US');
    }, 3200);
  }

  /* ---------------------------------------------------------------
     10. Floating-label support for the <select>
  --------------------------------------------------------------- */
  const objectiveSelect = document.getElementById('brief-objective');
  if (objectiveSelect) {
    const syncSelectState = function () {
      objectiveSelect.classList.toggle('has-value', objectiveSelect.value !== '');
    };
    objectiveSelect.addEventListener('change', syncSelectState);
    syncSelectState();
  }

  /* ---------------------------------------------------------------
     11. Contact form: validation + sending → success states
  --------------------------------------------------------------- */
  const form = document.getElementById('brief-form');
  const submitBtn = document.getElementById('submit-brief');
  const successMsg = document.getElementById('form-success');

  function setError(input, errorEl, message) {
    input.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      if (message) errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }
  function clearError(input, errorEl) {
    input.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.hidden = true;
  }

  function validUrl(value) {
    try {
      // Prepend protocol if the user omitted it
      const candidate = /^https?:\/\//i.test(value) ? value : 'https://' + value;
      // eslint-disable-next-line no-new
      new URL(candidate);
      return /\./.test(value);
    } catch (e) {
      return false;
    }
  }

  if (form && submitBtn) {
    const nameInput = document.getElementById('brief-name');
    const emailInput = document.getElementById('brief-email');
    const websiteInput = document.getElementById('brief-website');

    // Live clearing of errors as the user types
    [nameInput, emailInput, websiteInput, objectiveSelect].forEach(function (input) {
      if (!input) return;
      const errEl = document.getElementById(input.id + '-error');
      input.addEventListener('input', function () { clearError(input, errEl); });
      input.addEventListener('change', function () { clearError(input, errEl); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      // Name
      const nameErr = document.getElementById('brief-name-error');
      if (!nameInput.value.trim()) { setError(nameInput, nameErr); valid = false; }
      else { clearError(nameInput, nameErr); }

      // Email
      const emailErr = document.getElementById('brief-email-error');
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailInput.value.trim())) { setError(emailInput, emailErr); valid = false; }
      else { clearError(emailInput, emailErr); }

      // Website (optional, but must be valid if provided)
      const webErr = document.getElementById('brief-website-error');
      if (websiteInput.value.trim() && !validUrl(websiteInput.value.trim())) {
        setError(websiteInput, webErr); valid = false;
      } else { clearError(websiteInput, webErr); }

      // Objective
      const objErr = document.getElementById('brief-objective-error');
      if (!objectiveSelect.value) { setError(objectiveSelect, objErr); valid = false; }
      else { clearError(objectiveSelect, objErr); }

      if (!valid) {
        const firstInvalid = form.querySelector('.invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Sending state
      submitBtn.classList.add('is-sending');
      submitBtn.disabled = true;
      if (successMsg) successMsg.hidden = true;

      // Simulate an async submission
      setTimeout(function () {
        submitBtn.classList.remove('is-sending');
        submitBtn.classList.add('is-success');
        const label = submitBtn.querySelector('.btn-label');
        if (label) label.textContent = 'Brief Sent';
        if (successMsg) successMsg.hidden = false;

        // Reset back to default after a few seconds
        setTimeout(function () {
          submitBtn.classList.remove('is-success');
          submitBtn.disabled = false;
          if (label) label.textContent = 'Submit Brief';
          form.reset();
          if (objectiveSelect) objectiveSelect.classList.remove('has-value');
          if (successMsg) successMsg.hidden = true;
        }, 4200);
      }, 1500);
    });
  }

  /* ---------------------------------------------------------------
     12. Generate a downloadable resume on the fly
  --------------------------------------------------------------- */
  const resumeBtn = document.getElementById('download-resume');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const resume = [
        'MUJTABA SAJAWAL',
        'Performance Marketing Lead & Automation Architect — Dubai, UAE',
        'Email: mujtaba695@gmail.com',
        '',
        'PROFILE',
        'Senior performance marketer blending paid-media mastery with custom AI automation',
        '(Vibe Coding via Google Antigravity, VS Code, Gemini & Claude). Managed AED 35M+ in',
        'budgets, automated 40% of manual workflows, and drove 30%+ average ROI improvement.',
        '',
        'KEY METRICS',
        '- AED 35M+ budgets managed',
        '- 30%+ average ROI improvement',
        '- 40% of manual workflows automated (n8n & Zapier)',
        '- 31% faster lead response time',
        '',
        'EXPERIENCE',
        'Cushman & Wakefield | Core — Performance Marketing Lead (Aug 2025 - Present)',
        '  Managing high-budget B2B & B2C real estate campaigns. Drove a 34% increase in',
        '  qualified lead volume while optimizing CPL. Leading CRM migrations (Salesforce to',
        '  Dynamics 365) and automating workflows via Power Automate/n8n to reduce manual',
        '  effort by 40%.',
        '',
        'RNS Realty — Digital Marketing Manager (Feb 2025 - Aug 2025)',
        '  Spearheaded brand visibility, local SEO, social content creation, and creator',
        '  partnerships. Designed and executed targeted email, WhatsApp, and CRM campaigns.',
        '',
        'Knight Frank MENA — Performance Marketing Lead (Sep 2023 - Apr 2025)',
        '  Led international B2B & B2C marketing operations covering London, Singapore, Dubai,',
        '  and Saudi markets. Managed integrated paid media campaigns across search, display,',
        '  and social.',
        '',
        'Footprint Real Estate — Digital Marketing Specialist (Feb 2023 - Sep 2023)',
        '  Managed high-budget luxury campaigns targeting ultra-high-net-worth individuals',
        '  using multi-channel paid ad strategies (Yandex, Snapchat, Meta, Google).',
        '',
        'Abhi (YC S21) — Corporate Sales Manager (Jun 2022 - Jan 2023)',
        '  Closed 20 key corporate clients, facilitating 2.4M USD in lending, achieving a 90%',
        '  success rate and a consistent 5:1 to 6:1 campaign ROI.',
        '',
        'STACK',
        'Paid Media: Meta, Google, LinkedIn, TikTok, Yandex, Snapchat, YouTube, Bing Ads',
        'Automation: n8n, Make, Zapier, Power Automate',
        'CRM & Data: Microsoft Dynamics 365, Salesforce, HubSpot, Zoho, Bitrix24, Attribution Modeling',
        'AI & Dev: Google Antigravity IDE, Gemini, Claude, Copilot 365, VS Code, Gamma'
      ].join('\n');

      const blob = new Blob([resume], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Mujtaba-Sajawal-Resume.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Run once on load to set initial chrome/timeline state
  onScrollChrome();
  updateTimelineFill();
})();
