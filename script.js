(() => {
  'use strict';

  /* ========================================================================
     1. Verified Store Photos Catalog (Real Store Photos Stored Locally)
     ======================================================================== */
  const STORE_PHOTOS = [
    {
      src: 'images/storefront-sign.jpg',
      title: 'חזית החנות טכנו עידן — בן גוריון 10',
      caption: 'השלט האדום־צהוב המוכר ותצוגת החד־פעמי, המפות, כלי המטבח והניקיון בכניסה לחנות.',
      alt: 'חזית החנות טכנו עידן בשדרות בן גוריון 10, הרצליה עם השלט האדום-צהוב ומדפי כלי הבית'
    },
    {
      src: 'images/baskets-tubs-cleaning.jpg',
      title: 'אחסון, ארגון, כביסה וניקיון',
      caption: 'גיגיות סיליקון מתקפלות, סלי כביסה קלועים, מתקני ייבוש, מטאטאים, מגבים ונייר טואלט.',
      alt: 'גיגיות מתקפלות, סלי כביסה, מתקני ייבוש ומטאטאים בחנות טכנו עידן'
    },
    {
      src: 'images/shelves-coolers-bins.jpg',
      title: 'צידניות, פחי אשפה וחד־פעמי',
      caption: 'צידניות פיקניק, פחי דוושה מנירוסטה ושחור מט, פחי פלסטיק וצלחות אירוח על המדפים.',
      alt: 'מדפי צידניות אדומות, פחי אשפה מנירוסטה ופלסטיק וכלים חד-פעמיים בטכנו עידן'
    },
    {
      src: 'images/drinks-fridge.jpg',
      title: 'מקרר השתייה הקלה',
      caption: 'פחיות צוננות של קוקה־קולה, קולה זירו, ספרייט, פאנטה, פפסי ומשקאות אנרגיה XL.',
      alt: 'מקרר שתייה קלה בחנות טכנו עידן עם פחיות קוקה קולה, ספרייט, פאנטה, פפסי ו-XL'
    },
    {
      src: 'images/street-facade.jpg',
      title: 'מבט מרחוב שדרות בן גוריון 10, הרצליה',
      caption: 'תחת הסוכך הצהוב בלב מרכז הרצליה (ליד הסנדלריה), עם כניסה נגישה ישירות מהמדרכה.',
      alt: 'מבט מרחוב שדרות בן גוריון 10 בהרצליה על בניין מספר 10 והסוכך הצהוב של טכנו עידן'
    }
  ];

  /* ========================================================================
     2. Live Open / Closed Status (Asia/Jerusalem Timezone)
     Sun–Thu: 08:00–20:00 | Fri: 08:00–15:30 | Sat: Closed
     ======================================================================== */
  const SCHEDULE = {
    0: { open: 8 * 60, close: 20 * 60, label: 'ראשון', closeText: '20:00' },
    1: { open: 8 * 60, close: 20 * 60, label: 'שני', closeText: '20:00' },
    2: { open: 8 * 60, close: 20 * 60, label: 'שלישי', closeText: '20:00' },
    3: { open: 8 * 60, close: 20 * 60, label: 'רביעי', closeText: '20:00' },
    4: { open: 8 * 60, close: 20 * 60, label: 'חמישי', closeText: '20:00' },
    5: { open: 8 * 60, close: 15 * 60 + 30, label: 'שישי', closeText: '15:30' },
    6: null
  };

  const WEEKDAY_MAP = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  function getIsraelNow() {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jerusalem',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      hour12: false
    });
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date()).map((part) => [part.type, part.value])
    );
    const dayIndex = WEEKDAY_MAP[parts.weekday] ?? new Date().getDay();
    const hour = Number(parts.hour) % 24;
    const minute = Number(parts.minute);
    return {
      dayIndex,
      minutes: hour * 60 + minute,
      year: parts.year
    };
  }

  function updateStoreStatus() {
    const { dayIndex, minutes, year } = getIsraelNow();
    const today = SCHEDULE[dayIndex];

    const isOpen = Boolean(today && minutes >= today.open && minutes < today.close);
    let shortText = '';
    let fullText = '';

    if (isOpen) {
      shortText = `פתוח עד ${today.closeText}`;
      fullText = `פתוח עכשיו · עד ${today.closeText}`;
    } else if (today && minutes < today.open) {
      shortText = 'סגור · נפתח ב־08:00';
      fullText = 'סגור עכשיו · נפתח היום ב־08:00';
    } else {
      // Find next open day (Saturday skips to Sunday)
      const nextDayIndex = (dayIndex + 1) % 7;
      const nextIsTomorrow = Boolean(SCHEDULE[nextDayIndex]);
      if (nextIsTomorrow) {
        shortText = 'סגור · נפתח מחר ב־08:00';
        fullText = 'סגור עכשיו · נפתח מחר ב־08:00';
      } else {
        shortText = 'סגור · נפתח בראשון ב־08:00';
        fullText = 'סגור עכשיו · נפתח ביום ראשון ב־08:00';
      }
    }

    document.querySelectorAll('[data-live-status]').forEach((pill) => {
      pill.dataset.state = isOpen ? 'open' : 'closed';
      const shortEl = pill.querySelector('[data-status-short]');
      const fullEl = pill.querySelector('[data-status-full]');
      if (shortEl) shortEl.textContent = shortText;
      if (fullEl) fullEl.textContent = fullText;
    });

    document.querySelectorAll('#hours-list .hours-row').forEach((row) => {
      row.classList.toggle('is-today', Number(row.dataset.day) === dayIndex);
    });

    const yearEl = document.getElementById('current-year');
    if (yearEl && year) yearEl.textContent = year;
  }

  /* ========================================================================
     3. Mobile Navigation Drawer Toggle
     ======================================================================== */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');

  function setMobileMenu(open) {
    if (!menuToggle || !mobileNav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'סגור תפריט ניווט' : 'פתח תפריט ניווט');
    mobileNav.hidden = !open;
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setMobileMenu(!isExpanded);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMobileMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        setMobileMenu(false);
        menuToggle.focus();
      }
    });
  }

  /* ========================================================================
     4. Toast Feedback Helper
     ======================================================================== */
  const toastEl = document.getElementById('toast');
  let toastTimer;

  function showToast(message) {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2600);
  }

  async function copyText(text, successMsg) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
      showToast(successMsg);
    }
  }

  const copyAddressBtn = document.getElementById('copy-address-btn');
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      copyText(copyAddressBtn.dataset.copy || 'שדרות בן גוריון 10, הרצליה', 'הכתובת הועתקה ללוח');
    });
  }

  /* ========================================================================
     5. Modal Photo Lightbox (<dialog closedby="any"> + Top-Layer Fallbacks)
     ======================================================================== */
  const lightbox = document.getElementById('photo-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');

  let currentPhotoIndex = 0;

  let supportsDisplayTransition;
  function canTransitionDisplay() {
    if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
    if (!window.CSS?.supports?.('transition-behavior', 'allow-discrete') || !document.body) {
      return false;
    }
    const probe = document.createElement('div');
    probe.style.cssText = 'transition: display 1s allow-discrete !important; display: block;';
    document.body.appendChild(probe);
    getComputedStyle(probe).display;
    probe.style.display = 'none';
    supportsDisplayTransition = getComputedStyle(probe).display === 'block';
    probe.remove();
    return supportsDisplayTransition;
  }

  function supportsTopLayerExit() {
    return Boolean(window.CSS?.supports?.('overlay', 'auto') && canTransitionDisplay());
  }

  async function closeTopLayer(element) {
    if (!element || !element.open) return;
    if (!supportsTopLayerExit()) {
      element.setAttribute('data-closing', '');
      const animations = element.getAnimations({ subtree: true });
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((resolve) => setTimeout(resolve, 600))
        ]);
      }
      if (!element.hasAttribute('data-closing')) return;
      element.removeAttribute('data-closing');
    }
    element.close();
  }

  function renderLightboxPhoto(index) {
    const safeIndex = ((index % STORE_PHOTOS.length) + STORE_PHOTOS.length) % STORE_PHOTOS.length;
    currentPhotoIndex = safeIndex;
    const item = STORE_PHOTOS[safeIndex];
    if (!item || !lightboxImg) return;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) lightboxCounter.textContent = `${safeIndex + 1} / ${STORE_PHOTOS.length}`;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lightbox.removeAttribute('data-closing');
    renderLightboxPhoto(index);
    if (!lightbox.open) {
      lightbox.showModal();
    }
  }

  if (lightbox) {
    document.querySelectorAll('.photo-trigger[data-photo-index]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        openLightbox(Number(trigger.dataset.photoIndex) || 0);
      });
    });

    lightboxCloseBtn?.addEventListener('click', () => closeTopLayer(lightbox));
    lightboxPrevBtn?.addEventListener('click', () => renderLightboxPhoto(currentPhotoIndex - 1));
    lightboxNextBtn?.addEventListener('click', () => renderLightboxPhoto(currentPhotoIndex + 1));

    // Route native close requests (Esc, closedby light dismiss) through top-layer exit helper
    lightbox.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeTopLayer(lightbox);
    });

    // Mandatory fallback for browsers without native <dialog closedby="any"> support (e.g. Safari)
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      lightbox.addEventListener('click', (event) => {
        if (event.target !== lightbox) return;
        const rect = lightbox.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        closeTopLayer(lightbox);
      });
    }

    // Keyboard navigation while lightbox is open (RTL-aware: ArrowLeft advances forward, ArrowRight goes back)
    lightbox.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        renderLightboxPhoto(currentPhotoIndex + 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        renderLightboxPhoto(currentPhotoIndex - 1);
      }
    });
  }

  /* ========================================================================
     6. Accessible Form Validation (:user-invalid + ARIA Sync + Fallback)
        & Quick WhatsApp Stock-Check Builder
     ======================================================================== */
  const stockForm = document.getElementById('whatsapp-stock-form');
  const deptSelect = document.getElementById('wa-dept');
  const itemInput = document.getElementById('wa-item');
  const nameInput = document.getElementById('wa-name');
  const previewText = document.getElementById('wa-preview-text');
  const copyWaMsgBtn = document.getElementById('copy-wa-msg');

  const WHATSAPP_NUMBER = '972533766733';

  function buildWhatsAppMessage() {
    const dept = deptSelect?.value?.trim() || '';
    const item = itemInput?.value?.trim() || '';
    const name = nameInput?.value?.trim() || '';

    const greeting = name ? `שלום טכנו עידן, כאן ${name}.` : 'שלום טכנו עידן,';
    const deptPart = dept ? ` במחלקת ${dept}` : '';
    const itemPart = item ? `: ${item}` : '...';
    return `${greeting} אשמח לבדוק אם יש אצלכם במלאי${deptPart}${itemPart}`;
  }

  function updateWhatsAppPreview() {
    if (previewText) {
      previewText.textContent = buildWhatsAppMessage();
    }
  }

  // Link each field's error message in aria-describedby only while invalid
  const linkError = (el, shown) => {
    const errorId = el.dataset.error;
    if (!errorId) return;
    const ids = (el.getAttribute('aria-describedby') || '')
      .split(/\s+/)
      .filter((id) => id && id !== errorId);
    if (shown) ids.push(errorId);
    if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
    else el.removeAttribute('aria-describedby');
  };

  function setupAccessibleValidation(form) {
    if (!form) return;

    const supportsUserInvalid = window.CSS?.supports?.('selector(:user-invalid)');

    // One polite live region for the page announces errors after blur/change
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.classList.add('visually-hidden');
    document.body.append(announcer);
    let announceTimer;
    let announcedField;

    const spokenText = (node) => {
      const copy = node.cloneNode(true);
      copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
      copy.querySelectorAll('[role="img"][aria-label]').forEach((n) => {
        n.replaceWith(`${n.getAttribute('aria-label')}: `);
      });
      return copy.textContent.replace(/\s+/g, ' ').trim();
    };

    const announceError = (el) => {
      const error = document.getElementById(el.dataset.error);
      if (!error) return;
      const label = el.labels?.[0] ? `${spokenText(el.labels[0])}: ` : '';
      clearTimeout(announceTimer);
      announcer.textContent = '';
      announcedField = el;
      announceTimer = setTimeout(() => {
        announcer.textContent = label + spokenText(error);
      }, 500);
    };

    if (supportsUserInvalid) {
      const flagged = new WeakSet();
      const announced = new WeakSet();

      const syncAria = (el, announce = false) => {
        if (!el.matches?.('input, select, textarea')) return;
        if (el.validity?.valid) {
          el.classList.remove('user-invalid-fallback');
        }
        const invalid = el.matches(':user-invalid') ||
          (el.classList.contains('user-invalid-fallback') && !el.validity?.valid);
        if (invalid) {
          if (announce && !announced.has(el)) {
            announceError(el);
            announced.add(el);
          }
          el.setAttribute('aria-invalid', 'true');
          linkError(el, true);
          flagged.add(el);
        } else if (flagged.has(el) || el.getAttribute('aria-invalid') !== 'true') {
          el.setAttribute('aria-invalid', 'false');
          linkError(el, false);
          flagged.delete(el);
          announced.delete(el);
          if (announcedField === el) {
            clearTimeout(announceTimer);
            announcer.textContent = '';
          }
        }
      };

      form.querySelectorAll('input, select, textarea').forEach((el) => syncAria(el));
      form.addEventListener('blur', (e) => syncAria(e.target, true), true);
      form.addEventListener('input', (e) => {
        if (e.target.hasAttribute('aria-invalid')) syncAria(e.target);
      });
      form.addEventListener('change', (e) => syncAria(e.target, true), true);
      form.addEventListener('invalid', (e) => {
        e.target.classList.add('user-invalid-fallback');
        announced.add(e.target);
        syncAria(e.target);
      }, true);
      form.addEventListener('reset', (e) => {
        setTimeout(() => [...e.target.elements].forEach((el) => {
          el.classList.remove('user-invalid-fallback');
          syncAria(el);
        }));
      }, true);
    } else {
      // WeakMap fallback for older browsers without :user-invalid
      const dirtyState = new WeakMap();
      const updateFallback = (input, announce = false) => {
        const isValid = input.validity.valid;
        input.classList.toggle('user-invalid-fallback', !isValid);
        input.classList.toggle('user-valid-fallback', isValid);
        input.setAttribute('aria-invalid', isValid ? 'false' : 'true');
        linkError(input, !isValid);
        if (!isValid && announce) announceError(input);
      };

      form.querySelectorAll('input, select, textarea').forEach((el) => {
        if (!el.hasAttribute('aria-invalid')) el.setAttribute('aria-invalid', 'false');
      });

      const handleFallbackEvent = (event) => {
        const input = event.target;
        if (!input.checkValidity) return;
        if (event.type === 'invalid') {
          dirtyState.set(input, { hasInteracted: true, hasBlurred: true });
          updateFallback(input, false);
          return;
        }
        if (event.type === 'input' || event.type === 'change') {
          const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
          state.hasInteracted = true;
          dirtyState.set(input, state);
          if (state.hasBlurred || event.type === 'change') updateFallback(input, event.type === 'change');
        } else if (event.type === 'blur') {
          const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
          state.hasBlurred = true;
          dirtyState.set(input, state);
          if (state.hasInteracted) updateFallback(input, true);
        }
      };

      form.addEventListener('blur', handleFallbackEvent, true);
      form.addEventListener('input', handleFallbackEvent);
      form.addEventListener('change', handleFallbackEvent);
      form.addEventListener('invalid', handleFallbackEvent, true);
    }
  }

  if (stockForm) {
    setupAccessibleValidation(stockForm);
    updateWhatsAppPreview();

    [deptSelect, itemInput, nameInput].forEach((control) => {
      control?.addEventListener('input', updateWhatsAppPreview);
      control?.addEventListener('change', updateWhatsAppPreview);
    });

    stockForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!stockForm.checkValidity()) {
        // checkValidity() dispatches 'invalid' on every failing field; focus the first one
        const firstInvalid = stockForm.querySelector(':invalid');
        firstInvalid?.focus();
        return;
      }

      const message = buildWhatsAppMessage();
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast('פותח את ההודעה בוואטסאפ...');
    });

    copyWaMsgBtn?.addEventListener('click', () => {
      copyText(buildWhatsAppMessage(), 'נוסח ההודעה הועתק ללוח');
    });
  }

  // Quick-fill chips & Department card buttons
  document.querySelectorAll('[data-select-dept]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dept = btn.dataset.selectDept;
      if (deptSelect && dept) {
        deptSelect.value = dept;
        deptSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      document.getElementById('stock-check')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => itemInput?.focus(), 420);
    });
  });

  document.querySelectorAll('.chip-btn').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (deptSelect && chip.dataset.chipDept) {
        deptSelect.value = chip.dataset.chipDept;
        deptSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (itemInput && chip.dataset.chipItem) {
        itemInput.value = chip.dataset.chipItem;
        itemInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      updateWhatsAppPreview();
      itemInput?.focus();
    });
  });

  /* ========================================================================
     7. Init & Periodic Live Status Refresh
     ======================================================================== */
  updateStoreStatus();
  setInterval(updateStoreStatus, 60 * 1000);
})();
