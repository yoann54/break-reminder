const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_SIZE_MB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
const QUOTE_CATEGORIES = ['hydration', 'eyes', 'stretch', 'breath', 'other'];
const GIF_CATEGORIES = ['auto', 'matin', 'aprem', 'soir', 'boost'];

const dom = {
  workInterval: document.getElementById('workInterval'),
  breakDuration: document.getElementById('breakDuration'),
  snoozeDuration: document.getElementById('snoozeDuration'),
  idleThreshold: document.getElementById('idleThreshold'),
  activeHoursEnabled: document.getElementById('activeHoursEnabled'),
  activeHoursStart: document.getElementById('activeHoursStart'),
  activeHoursEnd: document.getElementById('activeHoursEnd'),
  morningEnd: document.getElementById('morningEnd'),
  afternoonEnd: document.getElementById('afternoonEnd'),
  daysRow: document.getElementById('daysRow'),
  skipFullscreen: document.getElementById('skipFullscreen'),
  soundEnabled: document.getElementById('soundEnabled'),
  quotesEnabled: document.getElementById('quotesEnabled'),
  fileInput: document.getElementById('fileInput'),
  dropzone: document.getElementById('dropzone'),
  dropzoneSub: document.getElementById('dropzoneSub'),
  galleryEl: document.getElementById('gallery'),
  libraryCount: document.getElementById('libraryCount'),
  clearAll: document.getElementById('clearAll'),
  quoteCategoriesEl: document.getElementById('quoteCategories'),
  quotesList: document.getElementById('quotesList'),
  newQuoteCategory: document.getElementById('newQuoteCategory'),
  newQuoteText: document.getElementById('newQuoteText'),
  addQuoteBtn: document.getElementById('addQuoteBtn'),
  resetQuotesBtn: document.getElementById('resetQuotesBtn'),
  languageSelect: document.getElementById('languageSelect'),
  statTotal: document.getElementById('statTotal'),
  statSnoozed: document.getElementById('statSnoozed'),
  statSkipped: document.getElementById('statSkipped'),
  statStreak: document.getElementById('statStreak'),
  last7Bars: document.getElementById('last7Bars'),
  exportBtn: document.getElementById('exportBtn'),
  importBtn: document.getElementById('importBtn'),
  importInput: document.getElementById('importInput'),
  resetStatsBtn: document.getElementById('resetStatsBtn'),
  statusEl: document.getElementById('status')
};

let currentLang = 'fr';
let statusTimer = null;

function setStatus(text, type = 'info') {
  if (!text) {
    dom.statusEl.classList.remove('visible');
    return;
  }
  dom.statusEl.textContent = text;
  dom.statusEl.dataset.type = type;
  dom.statusEl.classList.add('visible');
  if (statusTimer) clearTimeout(statusTimer);
  const duration = type === 'warn' ? 6000 : 3000;
  statusTimer = setTimeout(() => dom.statusEl.classList.remove('visible'), duration);
}

function tt(key, params) { return tWith(currentLang, key, params); }

function cryptoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function getStorage() {
  return chrome.storage.local.get(null);
}

async function setStorage(obj) {
  return chrome.storage.local.set(obj);
}

function ensureGifId(g) { return g && g.id ? g : { ...g, id: cryptoId() }; }

async function getList() {
  const { gifList, gifData } = await chrome.storage.local.get(['gifList', 'gifData']);
  if (Array.isArray(gifList)) return gifList.map(ensureGifId);
  if (gifData) {
    const migrated = [{ id: cryptoId(), name: 'image', data: gifData, category: 'auto' }];
    await chrome.storage.local.set({ gifList: migrated });
    await chrome.storage.local.remove('gifData');
    return migrated;
  }
  return [];
}

function renderDaysRow(activeDays) {
  dom.daysRow.innerHTML = '';
  for (let i = 0; i < 7; i += 1) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day-pill' + (activeDays.includes(i) ? ' active' : '');
    btn.textContent = tt(`options.day.${i}`);
    btn.dataset.day = String(i);
    btn.addEventListener('click', async () => {
      const { activeHoursDays = [] } = await chrome.storage.local.get('activeHoursDays');
      const set = new Set(activeHoursDays);
      if (set.has(i)) set.delete(i); else set.add(i);
      const next = Array.from(set).sort();
      await setStorage({ activeHoursDays: next });
      renderDaysRow(next);
    });
    dom.daysRow.appendChild(btn);
  }
}

function renderGallery(list) {
  dom.galleryEl.innerHTML = '';
  dom.libraryCount.textContent = list.length ? `${list.length} ${list.length > 1 ? tt('common.images') : tt('common.image')}` : tt('common.empty');
  dom.clearAll.style.visibility = list.length ? 'visible' : 'hidden';
  if (!list.length) {
    const empty = document.createElement('div');
    empty.className = 'gallery-empty';
    empty.textContent = tt('options.library.empty');
    dom.galleryEl.appendChild(empty);
    return;
  }
  list.forEach((item, idx) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.draggable = true;
    tile.dataset.index = String(idx);

    const img = document.createElement('img');
    img.src = item.data;
    img.alt = item.name || '';
    img.loading = 'lazy';

    const remove = document.createElement('button');
    remove.className = 'tile-remove';
    remove.type = 'button';
    remove.textContent = '×';
    remove.addEventListener('click', (e) => {
      e.stopPropagation();
      removeItem(item.id);
    });

    const catBar = document.createElement('div');
    catBar.className = 'tile-cat';
    const catSelect = document.createElement('select');
    GIF_CATEGORIES.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = tt(`options.library.category.${c}`);
      if ((item.category || 'auto') === c) opt.selected = true;
      catSelect.appendChild(opt);
    });
    catSelect.addEventListener('change', async () => {
      const all = await getList();
      const next = all.map((it) => it.id === item.id ? { ...it, category: catSelect.value } : it);
      await setStorage({ gifList: next });
    });
    catSelect.addEventListener('mousedown', (e) => e.stopPropagation());
    catBar.appendChild(catSelect);

    tile.appendChild(img);
    tile.appendChild(catBar);
    tile.appendChild(remove);

    tile.addEventListener('dragstart', (e) => {
      tile.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/br-index', String(idx));
    });
    tile.addEventListener('dragend', () => tile.classList.remove('dragging'));
    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      tile.classList.add('drag-over');
    });
    tile.addEventListener('dragleave', () => tile.classList.remove('drag-over'));
    tile.addEventListener('drop', async (e) => {
      e.preventDefault();
      tile.classList.remove('drag-over');
      const fromIdx = Number(e.dataTransfer.getData('text/br-index'));
      const toIdx = idx;
      if (Number.isNaN(fromIdx) || fromIdx === toIdx) return;
      const all = await getList();
      const moved = all.splice(fromIdx, 1)[0];
      if (!moved) return;
      all.splice(toIdx, 0, moved);
      await setStorage({ gifList: all });
    });

    dom.galleryEl.appendChild(tile);
  });
}

async function addFiles(files) {
  if (!files.length) return;
  const list = await getList();
  let added = 0;
  const tooBig = [];
  const invalid = [];
  const failed = [];

  for (const file of files) {
    if (!file.type.startsWith('image/')) { invalid.push(file.name); continue; }
    if (file.size > MAX_FILE_SIZE) { tooBig.push({ name: file.name, size: file.size }); continue; }
    try {
      const dataUrl = await readAsDataUrl(file);
      list.push({ id: cryptoId(), name: file.name, data: dataUrl, category: 'auto' });
      added += 1;
    } catch (err) {
      console.error('[BreakReminder] read failed', file.name, err);
      failed.push(file.name);
    }
  }
  try {
    await setStorage({ gifList: list });
  } catch (err) {
    setStatus(tt('status.writeError', { err: err?.message || err }), 'warn');
    return;
  }
  renderGallery(list);

  const messages = [];
  if (added) messages.push(tt('status.added', { n: added }));
  if (tooBig.length) {
    if (tooBig.length === 1) {
      messages.push(tt('status.tooBigOne', { name: tooBig[0].name, size: formatSize(tooBig[0].size), max: `${MAX_SIZE_MB} Mo` }));
    } else {
      messages.push(tt('status.tooBigMany', { n: tooBig.length, max: `${MAX_SIZE_MB} Mo` }));
    }
  }
  if (invalid.length) messages.push(tt('status.invalid', { n: invalid.length }));
  if (failed.length) messages.push(tt('status.failed', { n: failed.length }));
  const hasWarning = tooBig.length || invalid.length || failed.length;
  setStatus(messages.join(' · '), hasWarning ? 'warn' : 'info');
}

async function removeItem(id) {
  const list = await getList();
  const next = list.filter((it) => it.id !== id);
  await setStorage({ gifList: next });
  renderGallery(next);
  setStatus(tt('status.removed'));
}

async function clearAllImages() {
  const list = await getList();
  if (!list.length) return;
  const ok = confirm(tt('common.confirmRemoveAll', { n: list.length }));
  if (!ok) return;
  await setStorage({ gifList: [] });
  renderGallery([]);
  setStatus(tt('status.cleared'));
}

function renderQuoteCategoryToggles(quoteCategories) {
  dom.quoteCategoriesEl.innerHTML = '';
  QUOTE_CATEGORIES.forEach((c) => {
    const enabled = quoteCategories[c] !== false;
    const wrap = document.createElement('label');
    wrap.className = 'cat-toggle' + (enabled ? ' active' : '');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = enabled;
    cb.addEventListener('change', async () => {
      const { quoteCategories: cur = {} } = await chrome.storage.local.get('quoteCategories');
      const next = { ...cur, [c]: cb.checked };
      await setStorage({ quoteCategories: next });
      renderQuoteCategoryToggles(next);
    });
    const dot = document.createElement('span');
    dot.className = 'dot';
    const label = document.createElement('span');
    label.textContent = tt(`options.quote.category.${c}`);
    wrap.appendChild(cb);
    wrap.appendChild(dot);
    wrap.appendChild(label);
    dom.quoteCategoriesEl.appendChild(wrap);
  });
}

function renderQuotesList(quotes) {
  dom.quotesList.innerHTML = '';
  if (!Array.isArray(quotes) || !quotes.length) return;
  quotes.forEach((q) => {
    const cat = q.category || 'other';
    const row = document.createElement('div');
    row.className = `quote-row cat-${cat}`;
    const tag = document.createElement('span');
    tag.className = 'quote-cat-tag';
    tag.textContent = tt(`options.quote.category.${cat}`);
    const text = document.createElement('span');
    text.className = 'quote-text';
    text.textContent = q.text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'link-btn';
    remove.textContent = tt('common.remove');
    remove.addEventListener('click', async () => {
      const { quotes: cur = [] } = await chrome.storage.local.get('quotes');
      const next = cur.filter((x) => x.id !== q.id);
      await setStorage({ quotes: next });
      renderQuotesList(next);
    });
    row.appendChild(tag);
    row.appendChild(text);
    row.appendChild(remove);
    dom.quotesList.appendChild(row);
  });
}

function fillQuoteCategorySelect() {
  dom.newQuoteCategory.innerHTML = '';
  QUOTE_CATEGORIES.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = tt(`options.quote.category.${c}`);
    dom.newQuoteCategory.appendChild(opt);
  });
}

function fillLanguageSelect(currentValue) {
  dom.languageSelect.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = 'auto';
  auto.textContent = tt('options.lang.auto');
  dom.languageSelect.appendChild(auto);
  I18N_SUPPORTED.forEach((code) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = tt(`options.lang.${code}`);
    dom.languageSelect.appendChild(opt);
  });
  dom.languageSelect.value = currentValue || 'auto';
}

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeStreak(history) {
  if (!history || typeof history !== 'object') return 0;
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = ymd(d);
    if ((history[k] || 0) > 0) streak += 1;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

function renderStats(stats) {
  const s = stats || { totalBreaks: 0, snoozedBreaks: 0, skippedBreaks: 0, history: {} };
  dom.statTotal.textContent = String(s.totalBreaks || 0);
  dom.statSnoozed.textContent = String(s.snoozedBreaks || 0);
  dom.statSkipped.textContent = String(s.skippedBreaks || 0);
  dom.statStreak.textContent = `${computeStreak(s.history)} ${tt('options.stats.days')}`;

  dom.last7Bars.innerHTML = '';
  const today = new Date();
  const counts = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = ymd(d);
    counts.push({ d, count: (s.history && s.history[k]) || 0 });
  }
  const max = Math.max(1, ...counts.map((c) => c.count));
  counts.forEach(({ d, count }) => {
    const bar = document.createElement('div');
    bar.className = 'last7-bar';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.height = `${Math.max(2, (count / max) * 80)}%`;
    fill.title = `${count}`;
    const lbl = document.createElement('div');
    lbl.className = 'bar-label';
    lbl.textContent = tt(`options.day.${d.getDay()}`);
    bar.appendChild(fill);
    bar.appendChild(lbl);
    dom.last7Bars.appendChild(bar);
  });
}

async function exportData() {
  const data = await getStorage();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `break-reminder-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
}

async function importData(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object') throw new Error('invalid');
    const allowed = [
      'workInterval', 'breakDuration', 'isActive', 'idleThreshold',
      'snoozeDuration', 'skipFullscreen',
      'activeHoursEnabled', 'activeHoursStart', 'activeHoursEnd', 'activeHoursDays',
      'soundEnabled', 'quotesEnabled', 'quoteCategories', 'quotes',
      'gifList', 'language', 'stats'
    ];
    const toSet = {};
    for (const k of allowed) if (k in data) toSet[k] = data[k];
    await setStorage(toSet);
    const summary = [];
    if (Array.isArray(toSet.gifList)) summary.push(`${toSet.gifList.length} ${toSet.gifList.length > 1 ? tt('common.images') : tt('common.image')}`);
    if (Array.isArray(toSet.quotes)) summary.push(`${toSet.quotes.length} messages`);
    setStatus(tt('options.import.success', { summary: summary.join(', ') || 'OK' }));
    await loadAll();
  } catch (e) {
    console.error('[BreakReminder] import failed', e);
    setStatus(tt('options.import.invalid'), 'warn');
  }
}

async function applyLanguage() {
  currentLang = await getCurrentLang();
  applyDomI18n(document, currentLang);
  dom.dropzoneSub.textContent = tWith(currentLang, 'options.dropzone.sub', { max: MAX_SIZE_MB });
  fillQuoteCategorySelect();
  const { language } = await chrome.storage.local.get('language');
  fillLanguageSelect(language || 'auto');
  const { quotes, quoteCategories, gifList, stats, activeHoursDays } = await chrome.storage.local.get(['quotes', 'quoteCategories', 'gifList', 'stats', 'activeHoursDays']);
  renderQuoteCategoryToggles(quoteCategories || {});
  renderQuotesList(quotes || []);
  renderGallery(Array.isArray(gifList) ? gifList : []);
  renderStats(stats);
  renderDaysRow(Array.isArray(activeHoursDays) ? activeHoursDays : [1, 2, 3, 4, 5]);
}

async function loadAll() {
  const data = await chrome.storage.local.get(null);
  dom.workInterval.value = data.workInterval ?? 25;
  dom.breakDuration.value = data.breakDuration ?? 60;
  dom.snoozeDuration.value = data.snoozeDuration ?? 5;
  dom.idleThreshold.value = data.idleThreshold ?? 5;
  dom.activeHoursEnabled.checked = !!data.activeHoursEnabled;
  dom.activeHoursStart.value = data.activeHoursStart || '09:00';
  dom.activeHoursEnd.value = data.activeHoursEnd || '18:00';
  dom.morningEnd.value = data.morningEnd || '12:00';
  dom.afternoonEnd.value = data.afternoonEnd || '19:00';
  dom.skipFullscreen.checked = data.skipFullscreen !== false;
  dom.soundEnabled.checked = !!data.soundEnabled;
  dom.quotesEnabled.checked = data.quotesEnabled !== false;
  await applyLanguage();
}

function bindNumberInput(el, key, min, max, msgKey) {
  el.addEventListener('change', async () => {
    const v = Math.max(min, Math.min(max, Number(el.value) || min));
    el.value = v;
    await setStorage({ [key]: v });
    setStatus(tt(msgKey || 'status.saved'));
  });
}

function bindCheckbox(el, key) {
  el.addEventListener('change', async () => {
    await setStorage({ [key]: el.checked });
    setStatus(tt('status.saved'));
  });
}

bindNumberInput(dom.workInterval, 'workInterval', 1, 240, 'status.intervalUpdated');
bindNumberInput(dom.breakDuration, 'breakDuration', 5, 3600, 'status.durationUpdated');
bindNumberInput(dom.snoozeDuration, 'snoozeDuration', 1, 120);
bindNumberInput(dom.idleThreshold, 'idleThreshold', 0, 120);

dom.activeHoursStart.addEventListener('change', async () => {
  await setStorage({ activeHoursStart: dom.activeHoursStart.value });
  setStatus(tt('status.saved'));
});

dom.activeHoursEnd.addEventListener('change', async () => {
  await setStorage({ activeHoursEnd: dom.activeHoursEnd.value });
  setStatus(tt('status.saved'));
});

dom.morningEnd.addEventListener('change', async () => {
  await setStorage({ morningEnd: dom.morningEnd.value });
  setStatus(tt('status.saved'));
});

dom.afternoonEnd.addEventListener('change', async () => {
  await setStorage({ afternoonEnd: dom.afternoonEnd.value });
  setStatus(tt('status.saved'));
});

bindCheckbox(dom.activeHoursEnabled, 'activeHoursEnabled');
bindCheckbox(dom.skipFullscreen, 'skipFullscreen');
bindCheckbox(dom.soundEnabled, 'soundEnabled');
bindCheckbox(dom.quotesEnabled, 'quotesEnabled');

dom.fileInput.addEventListener('change', async () => {
  const files = Array.from(dom.fileInput.files || []);
  await addFiles(files);
  dom.fileInput.value = '';
});

['dragenter', 'dragover'].forEach((evt) => {
  dom.dropzone.addEventListener(evt, (e) => {
    if (!e.dataTransfer || ![...e.dataTransfer.types].includes('Files')) return;
    e.preventDefault();
    e.stopPropagation();
    dom.dropzone.classList.add('dragging');
  });
});

['dragleave', 'drop'].forEach((evt) => {
  dom.dropzone.addEventListener(evt, (e) => {
    if (evt === 'dragleave' && dom.dropzone.contains(e.relatedTarget)) return;
    e.preventDefault();
    e.stopPropagation();
    dom.dropzone.classList.remove('dragging');
  });
});

dom.dropzone.addEventListener('drop', async (e) => {
  const files = Array.from(e.dataTransfer?.files || []);
  await addFiles(files);
});

dom.clearAll.addEventListener('click', clearAllImages);

dom.addQuoteBtn.addEventListener('click', async () => {
  const text = dom.newQuoteText.value.trim();
  if (!text) return;
  const cat = dom.newQuoteCategory.value;
  const { quotes = [] } = await chrome.storage.local.get('quotes');
  const next = [...quotes, { id: cryptoId(), text, category: cat }];
  await setStorage({ quotes: next });
  dom.newQuoteText.value = '';
  renderQuotesList(next);
  setStatus(tt('status.saved'));
});

dom.newQuoteText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') dom.addQuoteBtn.click();
});

dom.resetQuotesBtn.addEventListener('click', async () => {
  if (!confirm(tt('options.quote.confirmReset'))) return;
  const lang = await getCurrentLang();
  const defaults = buildDefaultQuotes(lang);
  await setStorage({ quotes: defaults });
  renderQuotesList(defaults);
  setStatus(tt('status.saved'));
});

dom.languageSelect.addEventListener('change', async () => {
  await setStorage({ language: dom.languageSelect.value });
  await applyLanguage();
  setStatus(tt('status.saved'));
});

dom.exportBtn.addEventListener('click', exportData);

dom.importBtn.addEventListener('click', () => dom.importInput.click());
dom.importInput.addEventListener('change', async () => {
  const file = dom.importInput.files?.[0];
  if (file) await importData(file);
  dom.importInput.value = '';
});

dom.resetStatsBtn.addEventListener('click', async () => {
  if (!confirm(tt('options.stats.confirmReset'))) return;
  await setStorage({ stats: { totalBreaks: 0, snoozedBreaks: 0, skippedBreaks: 0, history: {} } });
  renderStats(null);
  setStatus(tt('status.saved'));
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.gifList) renderGallery(Array.isArray(changes.gifList.newValue) ? changes.gifList.newValue : []);
  if (changes.quotes) renderQuotesList(changes.quotes.newValue || []);
  if (changes.quoteCategories) renderQuoteCategoryToggles(changes.quoteCategories.newValue || {});
  if (changes.stats) renderStats(changes.stats.newValue);
  if (changes.activeHoursDays) renderDaysRow(Array.isArray(changes.activeHoursDays.newValue) ? changes.activeHoursDays.newValue : []);
});

loadAll();
