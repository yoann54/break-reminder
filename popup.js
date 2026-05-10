const els = {
  workInterval: document.getElementById('workInterval'),
  breakDuration: document.getElementById('breakDuration'),
  libraryCount: document.getElementById('libraryCount'),
  openOptionsBtn: document.getElementById('openOptions'),
  toggleBtn: document.getElementById('toggleBtn'),
  testBtn: document.getElementById('testBtn'),
  statusEl: document.getElementById('status'),
  nextBreak: document.getElementById('nextBreak'),
  todayCount: document.getElementById('todayCount')
};

let currentLang = 'fr';
let countdownTimer = null;

function tt(key, params) { return tWith(currentLang, key, params); }

function setStatus(text, type = 'info') {
  els.statusEl.textContent = text || '';
  els.statusEl.dataset.type = text ? type : '';
  if (!text) return;
  const duration = type === 'warn' ? 5000 : 2500;
  setTimeout(() => {
    if (els.statusEl.textContent === text) {
      els.statusEl.textContent = '';
      els.statusEl.dataset.type = '';
    }
  }, duration);
}

function renderToggle(isActive) {
  els.toggleBtn.textContent = isActive ? tt('common.stop') : tt('common.start');
  els.toggleBtn.classList.toggle('active', isActive);
}

function renderCount(list) {
  const n = Array.isArray(list) ? list.length : 0;
  els.libraryCount.textContent = n ? `${n} ${n > 1 ? tt('common.images') : tt('common.image')}` : tt('common.empty');
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtRemaining(ms, isActive) {
  if (!isActive || ms == null) return '—';
  if (ms <= 0) return '0s';
  const totalSec = Math.ceil(ms / 1000);
  if (totalSec >= 3600) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.ceil((totalSec - h * 3600) / 60);
    return `${h}h ${m}m`;
  }
  if (totalSec >= 60) return `${Math.ceil(totalSec / 60)}m`;
  return `${totalSec}s`;
}

async function refreshNextBreak() {
  const { isActive, nextBreakAt } = await chrome.storage.local.get(['isActive', 'nextBreakAt']);
  if (!isActive || !nextBreakAt) {
    els.nextBreak.textContent = '—';
    return;
  }
  const remaining = nextBreakAt - Date.now();
  els.nextBreak.textContent = fmtRemaining(remaining, true);
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(refreshNextBreak, 1000);
}

async function load() {
  currentLang = await getCurrentLang();
  applyDomI18n(document, currentLang);
  const data = await chrome.storage.local.get(['workInterval', 'breakDuration', 'isActive', 'gifList', 'stats', 'nextBreakAt']);
  els.workInterval.value = data.workInterval ?? 25;
  els.breakDuration.value = data.breakDuration ?? 60;
  renderToggle(!!data.isActive);
  renderCount(data.gifList);
  const tk = todayKey();
  els.todayCount.textContent = String((data.stats && data.stats.history && data.stats.history[tk]) || 0);
  await refreshNextBreak();
  startCountdown();
}

async function saveField(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

els.workInterval.addEventListener('change', async () => {
  const v = Math.max(1, Math.min(240, Number(els.workInterval.value) || 25));
  els.workInterval.value = v;
  await saveField('workInterval', v);
  setStatus(tt('status.intervalUpdated'));
});

els.breakDuration.addEventListener('change', async () => {
  const v = Math.max(5, Math.min(3600, Number(els.breakDuration.value) || 60));
  els.breakDuration.value = v;
  await saveField('breakDuration', v);
  setStatus(tt('status.durationUpdated'));
});

els.openOptionsBtn.addEventListener('click', () => {
  if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
  else window.open(chrome.runtime.getURL('options.html'));
  window.close();
});

els.toggleBtn.addEventListener('click', async () => {
  const { isActive } = await chrome.storage.local.get('isActive');
  const next = !isActive;
  await saveField('isActive', next);
  renderToggle(next);
  setStatus(next ? tt('popup.statusActivated') : tt('popup.statusStopped'));
  await refreshNextBreak();
});

els.testBtn.addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id) return;
  if (tab.url && /^(chrome|edge|about|chrome-extension):/i.test(tab.url)) {
    setStatus(tt('popup.unsupportedPage'), 'warn');
    return;
  }
  try {
    await chrome.runtime.sendMessage({ type: 'TRIGGER_BREAK_NOW', force: true });
  } catch {
    setStatus(tt('popup.cantShowOverlay'), 'warn');
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.gifList) renderCount(changes.gifList.newValue);
  if (changes.isActive) {
    renderToggle(!!changes.isActive.newValue);
    refreshNextBreak();
  }
  if (changes.nextBreakAt) refreshNextBreak();
  if (changes.stats) {
    const tk = todayKey();
    const h = changes.stats.newValue && changes.stats.newValue.history;
    els.todayCount.textContent = String((h && h[tk]) || 0);
  }
  if (changes.language) load();
});

window.addEventListener('unload', () => {
  if (countdownTimer) clearInterval(countdownTimer);
});

load();
