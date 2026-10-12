(() => {
  if (window.__breakReminderInjected) return;
  window.__breakReminderInjected = true;

  // The overlay lives in a closed shadow root: page CSS can't restyle it and
  // page scripts can't reach its nodes (and the user's image).
  const OVERLAY_CSS = `
    :host {
      all: initial;
    }

    .br-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background:
        radial-gradient(60% 60% at 20% 20%, rgba(255, 92, 138, 0.45), transparent 60%),
        radial-gradient(60% 60% at 80% 80%, rgba(120, 90, 255, 0.45), transparent 60%),
        rgba(10, 6, 18, 0.85);
      backdrop-filter: blur(14px) saturate(140%);
      -webkit-backdrop-filter: blur(14px) saturate(140%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #fff;
      animation: br-fade-in 360ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    @keyframes br-fade-in {
      from { opacity: 0; transform: scale(1.01); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes br-rise {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .br-inner {
      position: relative;
      max-width: 92vw;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 22px;
      padding: 36px 40px;
      background: rgba(28, 18, 38, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      box-shadow:
        0 30px 80px rgba(0, 0, 0, 0.55),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
      animation: br-rise 480ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .br-inner::before {
      content: "";
      position: absolute;
      inset: -1px;
      border-radius: 24px;
      padding: 1px;
      background: linear-gradient(135deg, rgba(255, 142, 178, 0.6), rgba(176, 124, 255, 0.5), rgba(120, 200, 255, 0.4));
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude;
      pointer-events: none;
      opacity: 0.65;
    }

    .br-title {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: linear-gradient(90deg, #ff8fb1 0%, #c79bff 60%, #8ad8ff 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    .br-media {
      max-width: 70vw;
      max-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .br-media img {
      max-width: 70vw;
      max-height: 60vh;
      object-fit: contain;
      display: block;
    }

    .br-media-empty {
      padding: 60px 40px;
      color: rgba(255, 255, 255, 0.65);
      font-size: 14px;
      text-align: center;
    }

    .br-quote {
      max-width: 70vw;
      margin: 0;
      padding: 10px 18px;
      font-size: 16px;
      font-style: italic;
      line-height: 1.4;
      text-align: center;
      color: rgba(255, 255, 255, 0.92);
      border-left: 2px solid rgba(255, 142, 178, 0.6);
      border-right: 2px solid rgba(120, 200, 255, 0.5);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
    }

    .br-counter {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.4px;
      color: rgba(255, 255, 255, 0.7);
      padding: 6px 14px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .br-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .br-btn,
    .br-btn-secondary {
      appearance: none;
      border: none;
      cursor: pointer;
      padding: 13px 26px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
      transition: transform 140ms ease, filter 200ms ease, box-shadow 200ms ease, background 200ms ease;
    }

    .br-btn {
      background: linear-gradient(135deg, #ff7aa6 0%, #b07cff 100%);
      color: #1b0d24;
      box-shadow: 0 12px 28px rgba(176, 124, 255, 0.4);
    }

    .br-btn:hover {
      transform: translateY(-1px);
      filter: brightness(1.06);
      box-shadow: 0 14px 32px rgba(176, 124, 255, 0.5);
    }

    .br-btn-secondary {
      background: rgba(45, 30, 65, 0.85);
      color: #f6f1ff;
      border: 1px solid rgba(199, 155, 255, 0.4);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    }

    .br-btn-secondary:hover {
      background: rgba(60, 42, 88, 0.95);
      border-color: rgba(199, 155, 255, 0.7);
      color: #fff;
      transform: translateY(-1px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }

    .br-btn:active,
    .br-btn-secondary:active {
      transform: translateY(0);
    }

    .br-btn:focus-visible,
    .br-btn-secondary:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }
  `;

  // Inline !important declarations outrank any page stylesheet targeting the host.
  const HOST_STYLE = [
    'all: initial',
    'position: fixed',
    'inset: 0',
    'z-index: 2147483647',
    'display: block'
  ].map((d) => `${d} !important`).join('; ');

  let hostEl = null;
  let shadow = null;
  let countdownTimer = null;
  let keyHandler = null;
  let visibilityHandler = null;
  let previousFocus = null;
  let isTest = false;

  function removeOverlay(opts = {}) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler, true);
      keyHandler = null;
    }
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    if (hostEl && hostEl.parentNode) {
      hostEl.parentNode.removeChild(hostEl);
    }
    hostEl = null;
    shadow = null;
    if (previousFocus && typeof previousFocus.focus === 'function') {
      try { previousFocus.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    }
    previousFocus = null;
    if (opts.notify !== false) {
      chrome.runtime.sendMessage({ type: 'BREAK_DISMISSED', completed: !!opts.completed, test: isTest }).catch(() => {});
    }
  }

  function fmtCountdown(template, seconds) {
    return (template || 'Resuming in {s}s').replace('__S__', seconds).replace('{s}', seconds);
  }

  function showOverlay(payload) {
    if (hostEl) return false;
    if (payload.skipFullscreen && document.fullscreenElement) return false;

    const duration = Number(payload.duration) || 60;
    const snoozeMin = Number(payload.snoozeDuration) || 5;
    const labels = payload.labels || {};
    isTest = !!payload.test;

    hostEl = document.createElement('div');
    hostEl.setAttribute('style', HOST_STYLE);
    shadow = hostEl.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = OVERLAY_CSS;
    shadow.appendChild(style);

    const overlayEl = document.createElement('div');
    overlayEl.className = 'br-overlay';

    const inner = document.createElement('div');
    inner.className = 'br-inner';
    inner.setAttribute('role', 'dialog');
    inner.setAttribute('aria-modal', 'true');
    inner.setAttribute('aria-labelledby', 'br-title');

    const title = document.createElement('div');
    title.className = 'br-title';
    title.id = 'br-title';
    title.textContent = labels.title || 'Pause !';

    const media = document.createElement('div');
    media.className = 'br-media';
    if (payload.gif && payload.gif.data) {
      const img = document.createElement('img');
      img.src = payload.gif.data;
      img.alt = payload.gif.name || 'Break';
      media.appendChild(img);
    } else {
      media.textContent = labels.empty || '';
      media.classList.add('br-media-empty');
    }

    inner.appendChild(title);
    inner.appendChild(media);

    if (payload.quote) {
      const quote = document.createElement('div');
      quote.className = 'br-quote';
      quote.textContent = payload.quote;
      inner.appendChild(quote);
    }

    const counter = document.createElement('div');
    counter.className = 'br-counter';
    counter.setAttribute('role', 'timer');
    counter.textContent = fmtCountdown(labels.countdown, duration);

    const actions = document.createElement('div');
    actions.className = 'br-actions';

    const resumeBtn = document.createElement('button');
    resumeBtn.type = 'button';
    resumeBtn.className = 'br-btn';
    resumeBtn.textContent = labels.resume || 'Reprendre';
    resumeBtn.addEventListener('click', () => removeOverlay({ completed: true }));

    const snoozeBtn = document.createElement('button');
    snoozeBtn.type = 'button';
    snoozeBtn.className = 'br-btn-secondary';
    snoozeBtn.textContent = labels.snooze || `Reporter ${snoozeMin} min`;
    snoozeBtn.addEventListener('click', () => {
      // SNOOZE schedules the next break itself; a BREAK_DISMISSED would race it.
      chrome.runtime.sendMessage({ type: 'SNOOZE', minutes: snoozeMin }).catch(() => {});
      removeOverlay({ notify: false });
    });

    actions.appendChild(resumeBtn);
    actions.appendChild(snoozeBtn);

    inner.appendChild(counter);
    inner.appendChild(actions);
    overlayEl.appendChild(inner);
    shadow.appendChild(overlayEl);
    document.documentElement.appendChild(hostEl);

    previousFocus = document.activeElement;
    resumeBtn.focus({ preventScroll: true });

    // Timers are throttled in background tabs: derive the remaining time from
    // the end timestamp instead of counting ticks.
    const endAt = Date.now() + duration * 1000;
    const tick = () => {
      const remaining = Math.ceil((endAt - Date.now()) / 1000);
      if (remaining <= 0) {
        removeOverlay({ completed: true });
        return;
      }
      counter.textContent = fmtCountdown(labels.countdown, remaining);
    };
    countdownTimer = setInterval(tick, 250);
    visibilityHandler = () => { if (!document.hidden) tick(); };
    document.addEventListener('visibilitychange', visibilityHandler);

    const focusables = [resumeBtn, snoozeBtn];
    keyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        removeOverlay({ completed: true });
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        const idx = focusables.indexOf(shadow.activeElement);
        const step = e.shiftKey ? -1 : 1;
        const next = idx === -1 ? 0 : (idx + step + focusables.length) % focusables.length;
        focusables[next].focus();
      }
    };
    document.addEventListener('keydown', keyHandler, true);

    return true;
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.type) return;
    if (msg.type === 'SHOW_BREAK') {
      const ok = showOverlay(msg);
      sendResponse({ shown: ok });
      return false;
    }
    if (msg.type === 'HIDE_BREAK') {
      removeOverlay();
      sendResponse({ ok: true });
      return false;
    }
  });
})();
