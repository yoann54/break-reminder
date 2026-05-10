(() => {
  if (window.__breakReminderInjected) return;
  window.__breakReminderInjected = true;

  let overlayEl = null;
  let countdownTimer = null;
  let escHandler = null;

  function playBell(start = true) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = start ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.7);
      osc.onended = () => ctx.close();
    } catch (e) { /* noop */ }
  }

  function removeOverlay(opts = {}) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    if (escHandler) {
      document.removeEventListener('keydown', escHandler, true);
      escHandler = null;
    }
    if (overlayEl && overlayEl.parentNode) {
      overlayEl.parentNode.removeChild(overlayEl);
    }
    overlayEl = null;
    if (opts.playEnd && opts.soundEnabled) playBell(false);
    chrome.runtime.sendMessage({ type: 'BREAK_DISMISSED' }).catch(() => {});
  }

  function fmtCountdown(template, seconds) {
    return (template || 'Resuming in {s}s').replace('__S__', seconds).replace('{s}', seconds);
  }

  function showOverlay(payload) {
    if (overlayEl) return false;
    if (payload.skipFullscreen && document.fullscreenElement) return false;

    const duration = Number(payload.duration) || 60;
    const snoozeMin = Number(payload.snoozeDuration) || 5;
    const labels = payload.labels || {};

    overlayEl = document.createElement('div');
    overlayEl.id = 'break-reminder-overlay';

    const inner = document.createElement('div');
    inner.className = 'br-inner';

    const title = document.createElement('div');
    title.className = 'br-title';
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
    let remaining = duration;
    counter.textContent = fmtCountdown(labels.countdown, remaining);

    const actions = document.createElement('div');
    actions.className = 'br-actions';

    const resumeBtn = document.createElement('button');
    resumeBtn.className = 'br-btn';
    resumeBtn.textContent = labels.resume || 'Reprendre';
    resumeBtn.addEventListener('click', () => removeOverlay({ playEnd: true, soundEnabled: payload.soundEnabled }));

    const snoozeBtn = document.createElement('button');
    snoozeBtn.className = 'br-btn-secondary';
    snoozeBtn.textContent = labels.snooze || `Reporter ${snoozeMin} min`;
    snoozeBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'SNOOZE', minutes: snoozeMin }).catch(() => {});
      removeOverlay();
    });

    actions.appendChild(resumeBtn);
    actions.appendChild(snoozeBtn);

    inner.appendChild(counter);
    inner.appendChild(actions);
    overlayEl.appendChild(inner);
    document.documentElement.appendChild(overlayEl);

    countdownTimer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        removeOverlay({ playEnd: true, soundEnabled: payload.soundEnabled });
        return;
      }
      counter.textContent = fmtCountdown(labels.countdown, remaining);
    }, 1000);

    escHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        removeOverlay({ playEnd: true, soundEnabled: payload.soundEnabled });
      }
    };
    document.addEventListener('keydown', escHandler, true);

    if (payload.soundEnabled) playBell(true);
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
