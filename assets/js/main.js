(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const motionOK = hasGSAP && !prefersReducedMotion;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Nav active-section + scroll progress rail ---------- */
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

      if (!motionOK) {
        blobs.forEach((blob) => {
          const factor = parseFloat(blob.dataset.parallax || '0');
          blob.style.transform = 'translateY(' + Math.round(scrollTop * factor) + 'px)';
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ([data-reveal]) ---------- */
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

    const lineEls = document.querySelectorAll('[data-line]');
    const lineIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('line-in');
          lineIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
    lineEls.forEach((el) => lineIo.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('[data-line]').forEach((el) => el.classList.add('line-in'));
  }

  /* ---------- Number counters (vanilla, GSAP-independent) ---------- */
  const counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    const counterIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterIo.observe(el));
  } else {
    counters.forEach((el) => animateCounter(el));
  }

  /* ---------- Custom '+' cursor ---------- */
  const cursor = document.getElementById('customCursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
    });
    function follow() {
      cx += (tx - cx) * 0.25;
      cy += (ty - cy) * 0.25;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(follow);
    }
    requestAnimationFrame(follow);

    const hoverTargets = 'a, button, .hover-card, input, textarea';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(hoverTargets);
      if (target) {
        cursor.classList.add('is-hover');
        cursor.classList.toggle('is-hover-dark', !!target.closest('.curriculum, .instructor, .proof, .final-cta'));
      }
    });
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest(hoverTargets);
      if (target) {
        cursor.classList.remove('is-hover');
        cursor.classList.remove('is-hover-dark');
      }
    });
  }

  /* ---------- Card spotlight (mouse-follow highlight) ---------- */
  document.querySelectorAll('.hover-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
    });
  });

  /* ---------- Mobile hamburger nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    function closeMobileNav() {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function openMobileNav() {
      navToggle.setAttribute('aria-expanded', 'true');
      mobileNav.setAttribute('aria-hidden', 'false');
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('is-open');
      if (isOpen) closeMobileNav(); else openMobileNav();
    });
    mobileNav.querySelectorAll('[data-mobile-nav-link]').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeMobileNav();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1240 && mobileNav.classList.contains('is-open')) closeMobileNav();
    });
  }

  /* ---------- Coupon code ---------- */
  const PRICING = {
    regular: { current: '₹2499', was: '₹10,999' },
    coupon: { current: '₹1195', was: '₹2499' }
  };
  const VALID_COUPON = 'BHAKTIHISHAKTIHAI';
  const COUPON_STORAGE_KEY = 'tds_coupon_applied';

  function setPricingState(applied) {
    const state = applied ? PRICING.coupon : PRICING.regular;
    document.querySelectorAll('[data-price-role="current"]').forEach((el) => { el.textContent = state.current; });
    document.querySelectorAll('[data-price-role="was"]').forEach((el) => { el.textContent = state.was; });
  }

  const couponBox = document.getElementById('couponBox');
  const couponInput = document.getElementById('couponInput');
  const couponApplyBtn = document.getElementById('couponApplyBtn');
  const couponMessage = document.getElementById('couponMessage');

  function showAppliedState() {
    if (!couponBox) return;
    couponBox.classList.add('is-applied');
    if (couponMessage) { couponMessage.textContent = ''; couponMessage.className = 'coupon-message'; }
    const label = couponBox.querySelector('.coupon-label');
    label.innerHTML = 'Coupon applied. ₹1195 unlocked. <button type="button" class="coupon-remove-btn" id="couponRemoveBtn">Remove</button>';
    const removeBtn = document.getElementById('couponRemoveBtn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        localStorage.removeItem(COUPON_STORAGE_KEY);
        setPricingState(false);
        couponBox.classList.remove('is-applied');
        label.textContent = 'Have an early-bird code?';
        if (couponInput) couponInput.value = '';
      });
    }
  }

  function getAppliedCouponCode() {
    const stored = localStorage.getItem(COUPON_STORAGE_KEY);
    return stored === VALID_COUPON ? stored : null;
  }

  if (couponBox && couponInput && couponApplyBtn) {
    if (getAppliedCouponCode()) {
      setPricingState(true);
      showAppliedState();
    }

    function tryApplyCoupon() {
      const value = couponInput.value.trim().toUpperCase();
      if (!value) {
        couponMessage.textContent = 'Enter a code first.';
        couponMessage.className = 'coupon-message is-error';
        return;
      }
      if (value === VALID_COUPON) {
        localStorage.setItem(COUPON_STORAGE_KEY, VALID_COUPON);
        setPricingState(true);
        showAppliedState();
      } else {
        couponMessage.textContent = 'That code isn’t valid. Double-check and try again.';
        couponMessage.className = 'coupon-message is-error';
      }
    }

    couponApplyBtn.addEventListener('click', tryApplyCoupon);
    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        tryApplyCoupon();
      }
    });
  }

  /* ---------- Checkout (Razorpay) ---------- */
  const RAZORPAY_KEY_ID = 'rzp_live_TFQZmmWyRcrxtD';

  const reserveSeatBtn = document.getElementById('reserveSeatBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutModalBackdrop = document.getElementById('checkoutModalBackdrop');
  const checkoutModalClose = document.getElementById('checkoutModalClose');
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutModalError = document.getElementById('checkoutModalError');
  const checkoutSubmitBtn = document.getElementById('checkoutSubmitBtn');
  const priceCardBody = document.getElementById('priceCardBody');
  const checkoutSuccess = document.getElementById('checkoutSuccess');
  const checkoutSuccessText = document.getElementById('checkoutSuccessText');

  if (reserveSeatBtn && checkoutModal && checkoutForm) {
    function openCheckoutModal() {
      checkoutModal.classList.add('is-open');
      checkoutModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      const nameInput = document.getElementById('checkoutName');
      if (nameInput) nameInput.focus();
    }
    function closeCheckoutModal() {
      checkoutModal.classList.remove('is-open');
      checkoutModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    reserveSeatBtn.addEventListener('click', openCheckoutModal);
    checkoutModalBackdrop.addEventListener('click', closeCheckoutModal);
    checkoutModalClose.addEventListener('click', closeCheckoutModal);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && checkoutModal.classList.contains('is-open')) closeCheckoutModal();
    });

    function setSubmitting(isSubmitting) {
      checkoutSubmitBtn.disabled = isSubmitting;
      checkoutSubmitBtn.textContent = isSubmitting ? 'Please wait…' : 'Continue to payment';
    }

    function showModalError(message) {
      checkoutModalError.textContent = message;
    }

    async function verifyAndFinish(razorpayResponse, buyer, amountInr) {
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            name: buyer.name,
            email: buyer.email,
            whatsapp: buyer.whatsapp,
            amountInr
          })
        });
        const data = await res.json();
        if (!res.ok || !data.verified) {
          throw new Error(data.error || 'Payment could not be verified.');
        }
        closeCheckoutModal();
        if (priceCardBody && checkoutSuccess) {
          priceCardBody.hidden = true;
          checkoutSuccess.hidden = false;
          if (checkoutSuccessText) {
            checkoutSuccessText.textContent = `A confirmation email is on its way to ${buyer.email}. We'll send the session links and the WhatsApp group invite closer to the start date.`;
          }
        }
      } catch (err) {
        showModalError(err.message || 'We could not confirm your payment. If money was deducted, please contact us and we will sort it out.');
      } finally {
        setSubmitting(false);
      }
    }

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function setFieldError(inputId, errorId, message) {
      const input = document.getElementById(inputId);
      const errorEl = document.getElementById(errorId);
      if (input) input.classList.toggle('is-invalid', !!message);
      if (errorEl) { errorEl.textContent = message; errorEl.style.display = message ? 'block' : 'none'; }
    }

    function clearAllFieldErrors() {
      ['checkoutName','checkoutEmail','checkoutWhatsapp'].forEach(id => setFieldError(id, id + 'Error', ''));
    }

    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showModalError('');
      clearAllFieldErrors();

      const name = document.getElementById('checkoutName').value.trim();
      const email = document.getElementById('checkoutEmail').value.trim();
      const whatsapp = document.getElementById('checkoutWhatsapp').value.trim();

      let hasError = false;

      if (!name || name.length < 2) {
        setFieldError('checkoutName', 'checkoutNameError', 'Please enter your full name.');
        hasError = true;
      }

      if (!email || !EMAIL_RE.test(email)) {
        setFieldError('checkoutEmail', 'checkoutEmailError', 'Please enter a valid email address (e.g. you@example.com).');
        hasError = true;
      }

      // WhatsApp must start with + followed by country code + at least 7 digits (min 9 chars total)
      const wpClean = whatsapp.replace(/[\s\-().]/g, '');
      if (!whatsapp) {
        setFieldError('checkoutWhatsapp', 'checkoutWhatsappError', 'Please enter your WhatsApp number.');
        hasError = true;
      } else if (!wpClean.startsWith('+')) {
        setFieldError('checkoutWhatsapp', 'checkoutWhatsappError', 'Include your country code (e.g. +91 98765 43210). Numbers without a country code are not accepted.');
        hasError = true;
      } else if (!/^\+\d{8,15}$/.test(wpClean)) {
        setFieldError('checkoutWhatsapp', 'checkoutWhatsappError', 'Please enter a valid WhatsApp number with country code (e.g. +91 98765 43210).');
        hasError = true;
      }

      if (hasError) return;

      if (!window.Razorpay) {
        showModalError('Payment is temporarily unavailable. Please refresh the page and try again, or reach out to us directly.');
        return;
      }

      setSubmitting(true);

      try {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, whatsapp, couponCode: getAppliedCouponCode() })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not start checkout.');
        }

        const rzp = new window.Razorpay({
          key: data.keyId || RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: 'The Design Shop',
          description: 'The Design Session #4: The hire-ready portfolio',
          prefill: { name: data.buyer.name, email: data.buyer.email, contact: data.buyer.whatsapp },
          theme: { color: '#FF4B24' },
          handler: function (response) {
            verifyAndFinish(response, data.buyer, data.amountInr);
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
            }
          }
        });
        rzp.on('payment.failed', function (response) {
          showModalError((response.error && response.error.description) || 'Payment failed. Please try again.');
          setSubmitting(false);
        });
        rzp.open();
      } catch (err) {
        showModalError(err.message || 'Something went wrong. Please try again.');
        setSubmitting(false);
      }
    });
  }

  /* ---------- GSAP-enhanced motion (hero reveal, heading stagger, blob scrub) ---------- */
  if (motionOK) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    heroTl
      .from('.hero .eyebrow', { opacity: 0, y: 12, duration: 0.6 })
      .from('.hero-title .line-inner', { yPercent: 110, duration: 1, stagger: 0.12 }, '-=0.3')
      .from('.hero-sub', { opacity: 0, y: 16, duration: 0.7 }, '-=0.5')
      .from('.hero-actions .btn', { opacity: 0, y: 16, duration: 0.6, stagger: 0.08 }, '-=0.4')
      .from('.hero-note', { opacity: 0, duration: 0.6 }, '-=0.3');

    function splitWords(el) {
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((w) => '<span class="word-mask"><span class="word-inner">' + w + '</span></span>')
        .join(' ');
      return el.querySelectorAll('.word-inner');
    }

    document.querySelectorAll('.section-title, .final-cta-title, .who-heading').forEach((heading) => {
      const words = splitWords(heading);
      gsap.from(words, {
        yPercent: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.025,
        ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 85%' }
      });
    });

    blobs.forEach((blob) => {
      const factor = parseFloat(blob.dataset.parallax || '0') * 8;
      const section = blob.closest('.section');
      gsap.to(blob, {
        y: () => factor * 40,
        scale: 1.15,
        filter: 'blur(120px) hue-rotate(12deg)',
        ease: 'none',
        scrollTrigger: {
          trigger: section || blob,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });
  }
})();
