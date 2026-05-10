try { importScripts('i18n.js'); } catch (e) { console.error('[BreakReminder] failed to load i18n', e); }

const ALARM_BREAK = 'break-reminder-alarm';
const ALARM_BADGE = 'break-reminder-badge-tick';

const DEFAULTS = {
  workInterval: 25,
  breakDuration: 60,
  isActive: false,
  idleThreshold: 5,
  snoozeDuration: 5,
  skipFullscreen: true,
  activeHoursEnabled: false,
  activeHoursStart: '09:00',
  activeHoursEnd: '18:00',
  activeHoursDays: [1, 2, 3, 4, 5],
  morningEnd: '12:00',
  afternoonEnd: '19:00',
  soundEnabled: false,
  quotesEnabled: true,
  quoteCategories: { hydration: true, eyes: true, stretch: true, breath: true, other: true },
  quotes: [],
  language: 'auto',
  gifList: [],
  stats: { totalBreaks: 0, snoozedBreaks: 0, skippedBreaks: 0, history: {} }
};

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseHM(hm) {
  const [h, m] = String(hm || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function isWithinActiveHours(settings, now = new Date()) {
  if (!settings.activeHoursEnabled) return true;
  const day = now.getDay();
  const days = Array.isArray(settings.activeHoursDays) ? settings.activeHoursDays : [1, 2, 3, 4, 5];
  if (!days.includes(day)) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  const start = parseHM(settings.activeHoursStart);
  const end = parseHM(settings.activeHoursEnd);
  if (start === end) return true;
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}

function minutesUntilActiveStart(settings, now = new Date()) {
  if (!settings.activeHoursEnabled) return null;
  const days = Array.isArray(settings.activeHoursDays) ? settings.activeHoursDays : [1, 2, 3, 4, 5];
  if (!days.length) return null;
  const start = parseHM(settings.activeHoursStart);
  for (let offset = 0; offset < 8; offset += 1) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    if (!days.includes(d.getDay())) continue;
    d.setHours(0, 0, 0, 0);
    const target = new Date(d.getTime() + start * 60 * 1000);
    if (target.getTime() > now.getTime()) {
      return Math.max(1, Math.round((target.getTime() - now.getTime()) / 60000));
    }
  }
  return null;
}

async function getSettings() {
  const data = await chrome.storage.local.get(Object.keys(DEFAULTS).concat(['nextBreakAt']));
  const merged = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) {
    if (data[k] !== undefined) merged[k] = data[k];
  }
  merged.nextBreakAt = data.nextBreakAt || null;
  return merged;
}

async function setBadge(text, color = '#7a4dff') {
  try {
    await chrome.action.setBadgeText({ text });
    if (text) await chrome.action.setBadgeBackgroundColor({ color });
  } catch (e) { /* noop */ }
}

async function updateBadge() {
  const s = await getSettings();
  if (!s.isActive || !s.nextBreakAt) {
    await setBadge('');
    return;
  }
  const remainingMs = s.nextBreakAt - Date.now();
  if (remainingMs <= 0) {
    await setBadge('!', '#ff5d7c');
    return;
  }
  const totalSeconds = Math.ceil(remainingMs / 1000);
  let text;
  if (totalSeconds >= 3600) text = `${Math.floor(totalSeconds / 3600)}h`;
  else if (totalSeconds >= 60) text = `${Math.ceil(totalSeconds / 60)}m`;
  else text = `${totalSeconds}s`;
  await setBadge(text);
}

async function ensureBadgeTick() {
  const existing = await chrome.alarms.get(ALARM_BADGE);
  if (!existing) {
    chrome.alarms.create(ALARM_BADGE, { delayInMinutes: 0.5, periodInMinutes: 0.5 });
  }
}

async function clearBadgeTick() {
  await chrome.alarms.clear(ALARM_BADGE);
}

async function scheduleNextBreak(overrideMinutes) {
  await chrome.alarms.clear(ALARM_BREAK);
  const s = await getSettings();
  if (!s.isActive) {
    await chrome.storage.local.remove('nextBreakAt');
    await clearBadgeTick();
    await setBadge('');
    return;
  }
  let minutes = overrideMinutes ?? Number(s.workInterval) ?? 25;
  if (s.activeHoursEnabled && !isWithinActiveHours(s)) {
    const wait = minutesUntilActiveStart(s);
    if (wait != null) minutes = Math.max(minutes, wait);
  }
  const nextBreakAt = Date.now() + minutes * 60 * 1000;
  await chrome.storage.local.set({ nextBreakAt });
  chrome.alarms.create(ALARM_BREAK, { delayInMinutes: minutes });
  await ensureBadgeTick();
  await updateBadge();
}

async function recordStat(key) {
  const { stats } = await chrome.storage.local.get('stats');
  const next = stats || { totalBreaks: 0, snoozedBreaks: 0, skippedBreaks: 0, history: {} };
  if (typeof next[key] === 'number') next[key] += 1;
  if (key === 'totalBreaks') {
    const t = todayKey();
    next.history = next.history || {};
    next.history[t] = (next.history[t] || 0) + 1;
  }
  await chrome.storage.local.set({ stats: next });
}

function pickGif(list, now, morningEnd, afternoonEnd) {
  if (!Array.isArray(list) || !list.length) return null;
  const d = now || new Date();
  const minutes = d.getHours() * 60 + d.getMinutes();
  const me = parseHM(morningEnd || '12:00');
  const ae = parseHM(afternoonEnd || '19:00');
  let period;
  if (minutes < me) period = 'matin';
  else if (minutes < ae) period = 'aprem';
  else period = 'soir';
  const eligible = list.filter((g) => {
    const c = g.category || 'auto';
    if (c === 'auto') return true;
    if (c === 'boost') return true;
    return c === period;
  });
  const pool = eligible.length ? eligible : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickQuote(list, categories, enabled) {
  if (!enabled) return '';
  if (!Array.isArray(list) || !list.length) return '';
  const cats = categories || {};
  const eligible = list.filter((q) => {
    const c = (q && q.category) || 'other';
    return cats[c] !== false;
  });
  const pool = eligible.length ? eligible : list;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return typeof picked === 'string' ? picked : (picked?.text || '');
}

async function triggerBreak(opts = {}) {
  const s = await getSettings();
  const force = !!opts.force;
  if (!s.isActive && !force) return;

  if (!force && s.activeHoursEnabled && !isWithinActiveHours(s)) {
    await recordStat('skippedBreaks');
    await scheduleNextBreak();
    return;
  }

  if (!force && s.idleThreshold && s.idleThreshold > 0) {
    try {
      const seconds = Math.max(15, Math.round(s.idleThreshold * 60));
      const state = await chrome.idle.queryState(seconds);
      if (state !== 'active') {
        await recordStat('skippedBreaks');
        await scheduleNextBreak();
        return;
      }
    } catch (e) { /* noop */ }
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab || !tab.id) {
    await scheduleNextBreak();
    return;
  }
  if (tab.url && /^(chrome|edge|about|chrome-extension):/i.test(tab.url)) {
    await recordStat('skippedBreaks');
    await scheduleNextBreak();
    return;
  }

  const picked = pickGif(s.gifList, new Date(), s.morningEnd, s.afternoonEnd);
  const quote = pickQuote(s.quotes, s.quoteCategories, s.quotesEnabled);
  const lang = (typeof resolveLang === 'function') ? resolveLang(s.language) : 'fr';
  const labels = {
    title: tWith(lang, 'overlay.title'),
    resume: tWith(lang, 'overlay.resume'),
    snooze: tWith(lang, 'overlay.snooze', { min: Number(s.snoozeDuration) || 5 }),
    countdown: tWith(lang, 'overlay.countdown', { s: '__S__' }),
    empty: tWith(lang, 'overlay.empty')
  };
  const payload = {
    type: 'SHOW_BREAK',
    duration: Number(s.breakDuration) || 60,
    snoozeDuration: Number(s.snoozeDuration) || 5,
    skipFullscreen: !!s.skipFullscreen,
    soundEnabled: !!s.soundEnabled,
    gif: picked ? { data: picked.data, name: picked.name } : null,
    quote,
    labels
  };

  let shown = false;
  try {
    const res = await chrome.tabs.sendMessage(tab.id, payload);
    shown = !!(res && res.shown);
  } catch (e) {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      const res = await chrome.tabs.sendMessage(tab.id, payload);
      shown = !!(res && res.shown);
    } catch (err) {
      console.warn('[BreakReminder] inject/send failed', err);
    }
  }

  if (shown) {
    await recordStat('totalBreaks');
  } else if (!force) {
    await recordStat('skippedBreaks');
  }
  if (!force) await scheduleNextBreak();
}

async function snooze(minutesArg) {
  const s = await getSettings();
  const minutes = Number(minutesArg) || Number(s.snoozeDuration) || 5;
  await recordStat('snoozedBreaks');
  await scheduleNextBreak(minutes);
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(Object.keys(DEFAULTS));
  const toSet = {};
  for (const [k, v] of Object.entries(DEFAULTS)) {
    if (stored[k] === undefined) toSet[k] = v;
  }
  if (Object.keys(toSet).length) await chrome.storage.local.set(toSet);
  const fresh = await chrome.storage.local.get(['quotes', 'language']);
  if (!Array.isArray(fresh.quotes) || !fresh.quotes.length) {
    const lang = (typeof resolveLang === 'function') ? resolveLang(fresh.language) : 'fr';
    const defaults = (typeof buildDefaultQuotes === 'function') ? buildDefaultQuotes(lang) : [];
    await chrome.storage.local.set({ quotes: defaults });
  }
  await scheduleNextBreak();
});

chrome.runtime.onStartup.addListener(async () => {
  await scheduleNextBreak();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_BADGE) {
    await updateBadge();
    return;
  }
  if (alarm.name === ALARM_BREAK) {
    await triggerBreak();
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-active') {
    const { isActive } = await chrome.storage.local.get('isActive');
    await chrome.storage.local.set({ isActive: !isActive });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === 'SNOOZE') {
    snooze(msg.minutes).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'TRIGGER_BREAK_NOW') {
    triggerBreak({ force: !!msg.force }).then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg.type === 'BREAK_DISMISSED') {
    sendResponse({ ok: true });
    return false;
  }
  if (msg.type === 'GET_STATE') {
    getSettings().then(sendResponse);
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (
    changes.workInterval || changes.isActive ||
    changes.activeHoursEnabled || changes.activeHoursStart ||
    changes.activeHoursEnd || changes.activeHoursDays
  ) {
    scheduleNextBreak();
  }
});
