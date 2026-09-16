import {APPS, LANGUAGES, DEALERS, STATUS, MODULES, makeRows, initialTranslation} from './data.js';
import {accepted, entryKey, sourceFor, validate, stats, exportLng, migratedTranslation} from './core.js';

/* ------------------------------------------------------------------ utils */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => new Intl.NumberFormat('ru-RU').format(n);
const initials = name => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const avColor = name => ['--op-violet','--op-blue','--op-green','--op-yellow','--op-coral'][[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 5];

// Иконки: временный набор контурных 16px глифов в стиле Core. При подключении Figma
// заменить на реальные SVG из наборов icn_inspector / Filters icons (см. components.md).
const paths = {
  translate:'M3 5h8M7 3v2m3 0c0 4-3 7-7 8m1-4c1 2 3 3 5 4m2 6 3-8 3 8m-5-2.5h4',
  chart:'M3 13h10M4 11V7m3 4V4m3 7V6',
  shield:'m8 2 5 2v4c0 3-5 5-5 5S3 11 3 8V4zM6 8l1.5 1.5L10 6',
  book:'M2 3h4a2 2 0 0 1 2 2v8a2 2 0 0 0-2-2H2V3m12 0h-4a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h4V3',
  search:'M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9m3.2-1.3L14 14',
  down:'m4 6 4 4 4-4', right:'m6 4 4 4-4 4', left:'m10 4-4 4 4 4', up:'m4 10 4-4 4 4',
  download:'M8 2v8m-3-3 3 3 3-3M3 11v2h10v-2',
  sparkles:'m8 2 1.6 4.4L14 8l-4.4 1.6L8 14l-1.6-4.4L2 8l4.4-1.6L8 2',
  check:'m3 8 3 3 7-7', close:'m4 4 8 8M4 12l8-8', plus:'M8 3v10M3 8h10',
  copy:'M6 6h8v8H6zM10 6V2H2v8h4',
  warning:'m8 2 6.5 11.5h-13L8 2M8 6.5v3m0 2h.01',
  info:'M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0M8 7.5v4m0-7h.01',
  clock:'M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0M8 4.5V8l2.5 1.5',
  history:'M2 2v4h4M2.5 6A6 6 0 1 1 2 8.5M8 5v3l2.5 1.5',
  enter:'M13 3v6H3m3-3L3 9l3 3',
  eye:'M1.5 8s2.5-4.5 6.5-4.5 6.5 4.5 6.5 4.5-2.5 4.5-6.5 4.5S1.5 8 1.5 8m8.5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  eyeOff:'M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4 4.6C2.5 5.7 1.5 8 1.5 8s2.5 4.5 6.5 4.5c1.2 0 2.3-.4 3.2-.9M7 3.6c.3 0 .7-.1 1-.1 4 0 6.5 4.5 6.5 4.5s-.6 1.1-1.7 2.2',
  lock:'M3 7h10v7H3zM5 7V5a3 3 0 0 1 6 0v2',
  star:'m8 2 1.8 3.8 4.2.6-3 2.9.7 4.2L8 11.5l-3.7 2 .7-4.2-3-2.9 4.2-.6z',
  user:'M11 13v-1.5a3 3 0 0 0-3-3 3 3 0 0 0-3 3V13M8 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5',
  users:'M10 13v-1.2a2.5 2.5 0 0 0-2.5-2.5h-3A2.5 2.5 0 0 0 2 11.8V13m8-10.8a2.5 2.5 0 0 1 0 4.8m4 6v-1.2a2.5 2.5 0 0 0-2-2.4M8.5 5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0',
  box:'m8 2 6 3-6 3-6-3 6-3M2 5v6l6 3 6-3V5M8 8v6',
  layers:'m8 2 6 3-6 3-6-3 6-3M2 8l6 3 6-3M2 11l6 3 6-3',
  dots:'M4 8h.01M8 8h.01M12 8h.01',
  swap:'M3 5h9m-3-3 3 3-3 3m4 5H4m3 3-3-3 3-3',
  key:'M9.5 2.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8M7 9l-5 5m2-2 1.5 1.5',
  window:'M2 3h12v10H2zM2 6h12M4 4.5h.01M6 4.5h.01',
  arrow:'M3 8h10M9 4l4 4-4 4',
  hash:'M6 2 4 14M12 2l-2 12M2 6h12M2 10h12',
  sun:'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7',
  moon:'M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7'
};
const icon = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] || paths.dots}"/></svg>`;

/* ------------------------------------------------------------------ state */
const STORAGE = 'ency-localizer-v2';
let stored = {};
try { stored = JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch {}
const db = {
  apps: Array.isArray(stored.apps) ? stored.apps : structuredClone(APPS),
  languages: Array.isArray(stored.languages) ? stored.languages : structuredClone(LANGUAGES),
  dealers: Array.isArray(stored.dealers) ? stored.dealers : structuredClone(DEALERS),
  entries: stored.entries || {},
  ignored: stored.ignored || {},
  excludedModules: stored.excludedModules || ['GR32_portable'],
  theme: stored.theme || 'dark',
  layout: stored.layout || {tree: 232, insp: 380}
};
let rows = makeRows(db.apps);
const drafts = {}; // черновики живут только в сессии — сохраняется лишь применённый перевод

const ME = 'Алексей Морозов';
const PAGES = ['translations', 'progress', 'admin', 'guide'];
const S = {
  page: 'translations', app: 'CAM', lang: 'ru', version: '18.0',
  status: 'all', module: 'all', query: '', mine: false, showIgnored: false,
  selected: 'CAM.Toolpath.Calculate', tab: 'context', winOpen: false, progressSort: 'group', progressClosed: new Set(), matchSel: new Set(), matchSelFor: null,
  role: 'admin', dealer: 'dealer-a',
  openGroups: new Set(['ENCY']), editorOpen: false
};

let storageWarned = false;
function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(db)); }
  catch { if (!storageWarned) { storageWarned = true; toast('Память браузера недоступна: изменения живут до закрытия вкладки.', 'warning'); } }
}

/* ---------------------------------------------------------------- domain */
const currentLanguage = () => db.languages.find(l => l.code === S.lang) || db.languages[0];
const appById = id => db.apps.find(a => a.id === id);
const key = (row, lang = S.lang, version = S.version) => entryKey(version, lang, row.id);
const translation = (row, lang = S.lang, version = S.version) => db.entries[key(row, lang, version)] || initialTranslation(row, lang, version);
const ignored = row => db.excludedModules.includes(row.module) || (Object.hasOwn(db.ignored, row.id) ? db.ignored[row.id] : row.ignored);
const isAdmin = () => S.role === 'admin';
const canEdit = (lang = S.lang) => isAdmin() || !!db.dealers.find(d => d.id === S.dealer)?.languages.includes(lang);
const scopeRows = () => rows.filter(r => (S.app === 'all' || r.app === S.app) && (!S.mine || r.owner === ME));
const source = row => sourceFor(row, S.version);
const hasErrors = row => { const t = translation(row); return !!t.text && validate(source(row), t.text, db.dealers).some(c => !c.ok); };

function filteredRows() {
  const q = S.query.trim().toLowerCase();
  return scopeRows().filter(r => {
    const ig = ignored(r);
    if (!S.showIgnored && ig && S.status !== 'ignored') return false;
    if (S.status === 'ignored') { if (!ig) return false; }
    else if (S.status === 'errors') { if (ig || !hasErrors(r)) return false; }
    else if (S.status !== 'all' && (ig || translation(r).status !== S.status)) return false;
    if (S.module !== 'all' && r.module !== S.module) return false;
    if (q && ![r.id, r.code, source(r), translation(r).text, r.owner, r.context].join(' ').toLowerCase().includes(q)) return false;
    return true;
  });
}
const getStats = (list = scopeRows(), lang = S.lang) => stats(list, r => translation(r, lang), ignored);

function commit(row, text, status = 'translated', author = ME) {
  const old = translation(row);
  db.entries[key(row)] = {text, status, history: [...(old.history || []), {text, status, author, date: new Date().toISOString()}]};
  delete drafts[key(row)];
}

/* ------------------------------------------------------------ primitives */
const statusBadge = (s, label) => `<span class="status status--${s}" title="${esc(STATUS[s]?.en || '')}">${esc(label ?? STATUS[s]?.label ?? s)}</span>`;
const bar = st => `<span class="bar" role="img" aria-label="${st.percent}% переведено"><i class="b-translated" style="width:${st.total ? st.translated / st.total * 100 : 0}%"></i><i class="b-outdated" style="width:${st.total ? st.outdated / st.total * 100 : 0}%"></i><i class="b-auto" style="width:${st.total ? st.auto / st.total * 100 : 0}%"></i></span>`;
const avatar = name => `<span class="avatar" style="--av:var(${avColor(name)})" title="${esc(name)}">${esc(initials(name))}</span>`;
const dd = (id, label, options, extra = '') => `<label class="dd" ${extra}>${label ? `<span class="dd__label">${label}</span>` : ''}<select id="${id}" aria-label="${label || id}">${options}</select>${icon('down')}</label>`;
const opt = (value, label, selected) => `<option value="${esc(value)}" ${selected ? 'selected' : ''}>${esc(label)}</option>`;
const showNl = text => esc(text).replace(/\n/g, '<span class="nl">↵</span>\n');

function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast toast--' + type;
  el.innerHTML = icon(type === 'success' ? 'check' : 'info') + `<span>${esc(message)}</span>`;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 4200);
}

/* ---------------------------------------------------------------- header */
function header() {
  const nav = [['translations', 'translate', 'Переводы'], ['progress', 'chart', 'Прогресс'], ['admin', 'shield', 'Администрирование']];
  const langs = db.languages.map(l => opt(l.code, l.name, S.lang === l.code)).join('');
  return `<header class="header">
    <a class="brand" href="#translations"><span class="brand__mark">${icon('translate')}</span><span class="brand__name">ENCY<small>Localizer</small></span></a>
    <nav class="tabs" aria-label="Разделы">${nav.map(([id, i, label]) => `<button class="tabs__seg ${S.page === id ? 'is-active' : ''}" data-page="${id}">${icon(i)}<span>${label}</span></button>`).join('')}</nav>
    <span class="spacer"></span>
    ${dd('version-select', 'Версия', ['17.0', '18.0'].map(v => opt(v, v, S.version === v)).join(''))}
    ${dd('language-select', 'Язык', langs)}
    <span class="header__sep"></span>
    <button class="ibtn ibtn--24 ${S.page === 'guide' ? 'is-pressed' : ''}" data-page="guide" title="Руководство">${icon('book')}</button>
    <button class="ibtn ibtn--24" data-act="theme" title="Светлая / тёмная тема">${icon(db.theme === 'dark' ? 'sun' : 'moon')}</button>
    <button class="ibtn ibtn--24" data-act="profile" title="${isAdmin() ? 'Администратор' : 'Переводчик · ' + esc(db.dealers.find(d => d.id === S.dealer)?.name || '')} — сменить роль">${avatar(ME)}</button>
  </header>`;
}

/* ------------------------------------------------------ translations page */
const GROUPS = ['ENCY', 'Инструменты', 'Сервисы', 'Tuner', 'Другие'];

function todoLine(st) {
  if (!st.total) return '<span class="muted">нет строк</span>';
  if (st.percent === 100) return '<span class="is-done">всё переведено</span>';
  const parts = [];
  if (st.untranslated) parts.push(`<span class="todo todo--untranslated">${st.untranslated} без перевода</span>`);
  if (st.auto) parts.push(`<span class="todo todo--auto">${st.auto} авто</span>`);
  if (st.outdated) parts.push(`<span class="todo todo--outdated">${st.outdated} устарело</span>`);
  return parts.join('<i class="sep"></i>');
}
function appsTree() {
  const all = getStats(rows);
  return `<aside class="panel panel--tree"><div class="panel__head"><span class="panel__title">Приложения</span><span class="tag">${esc(currentLanguage().tag)}</span></div>
    <div class="panel__body tree">
      <button class="arow arow--all ${S.app === 'all' ? 'is-selected' : ''}" data-app="all"><span class="arow__top"><span class="arow__name">Все приложения</span><span class="pct">${all.percent}%</span></span>${bar(all)}<span class="arow__meta">${todoLine(all)}</span></button>
      ${GROUPS.map(g => {
        const apps = db.apps.filter(a => a.group === g);
        if (!apps.length) return '';
        const open = S.openGroups.has(g) || apps.some(a => a.id === S.app);
        const gst = getStats(rows.filter(r => apps.some(a => a.id === r.app)));
        return `<div class="tree__group ${open ? 'is-open' : ''}" data-group="${esc(g)}">${icon('right')}<span>${esc(g)}</span><span class="muted">${apps.length}</span><span class="pct">${gst.percent}%</span></div>
        ${open ? apps.map(a => { const st = getStats(rows.filter(r => r.app === a.id)); const mine = a.owner === ME; return `<button class="arow ${S.app === a.id ? 'is-selected' : ''}" data-app="${esc(a.id)}" title="${esc(a.id)} · ${esc(a.description)}">
          <span class="arow__top"><span class="arow__name">${esc(a.name)}</span>${mine ? `<span class="arow__me" title="Вы ответственный">${icon('user')}</span>` : ''}<span class="pct ${st.percent === 100 ? 'is-done' : ''}">${st.percent}%</span></span>
          ${bar(st)}<span class="arow__meta">${todoLine(st)}</span></button>`; }).join('') : ''}`;
      }).join('')}
    </div></aside>`;
}

function stringsPanel() {
  const st = getStats();
  const errors = scopeRows().filter(r => !ignored(r) && hasErrors(r)).length;
  const list = filteredRows();
  const app = appById(S.app);
  const chips = [['all', 'Все', st.total, ''], ['untranslated', 'Без перевода', st.untranslated, '--st-untranslated'], ['auto', 'Автоперевод', st.auto, '--st-auto'], ['outdated', 'Устарело', st.outdated, '--st-outdated'], ['translated', 'Переведено', st.translated, '--st-translated']];
  if (errors) chips.push(['errors', 'С ошибками', errors, '--st-error']);
  const filtered = S.status !== 'all' || S.module !== 'all' || S.query || S.mine;
  return `<section class="panel panel--strings">
    <div class="panel__head"><span class="panel__title">${esc(app ? app.name : 'Все приложения')}${app ? `<span class="panel__count">${esc(app.id)}</span>` : ''}</span>
      <span class="pct" title="Доля Translated среди строк без Ignored">${st.percent}%</span><span class="spacer"></span>
      <label class="field field--search">${icon('search')}<input id="string-search" type="search" value="${esc(S.query)}" placeholder="Поиск по тексту или ключу" autocomplete="off"><kbd>/</kbd></label></div>
    <div class="toolbar">
      <div class="toolbar__row toolbar__row--chips">${chips.map(([id, label, n, dot]) => `<button class="fchip ${S.status === id ? 'is-active' : ''}" data-status="${id}">${dot ? `<span class="fchip__dot" style="--dot:var(${dot})"></span>` : ''}<span class="fchip__label">${label}</span><span class="fchip__n">${n}</span></button>`).join('')}</div>
      <span class="spacer"></span>
      ${dd('module-select', '', [opt('all', 'Все модули', S.module === 'all'), ...Object.entries(MODULES).map(([id, m]) => opt(id, m.label, S.module === id))].join(''))}
      <button class="fchip ${S.mine ? 'is-active' : ''}" data-act="toggle-mine" title="Только строки, за которые отвечаю я">${icon('user')}<span class="fchip__label">Мои</span></button>
      ${filtered ? `<button class="ibtn" data-act="reset-filters" title="Сбросить фильтры">${icon('close')}</button>` : ''}
    </div>
    <div class="panel__body" id="strings-list">
      <div class="grid-head"><span>English</span><span class="col-tr">${esc(currentLanguage().name)}</span><span>Статус</span></div>
      ${list.length ? list.map(r => stringRow(r)).join('') : `<div class="empty-state">${icon('search')}<b>Строки не найдены</b><span>Измените запрос или фильтры</span></div>`}
    </div>
    <div class="panel__foot panel__foot--actions"><span>${fmt(list.length)} ${plural(list.length, 'строка', 'строки', 'строк')}</span>
      ${st.ignored ? `<label class="tgl"><input type="checkbox" id="ignored-toggle" ${S.showIgnored ? 'checked' : ''}><span class="tgl__track"></span><span>Ignored · ${st.ignored}</span></label>` : ''}
      <span class="spacer"></span>
      <button class="btn" data-act="autotranslate" ${!canEdit() || !st.untranslated ? 'disabled' : ''} title="Предложить автоперевод для строк без перевода">${icon('sparkles')}<span>Автоперевод</span>${st.untranslated ? `<span class="fchip__n">${st.untranslated}</span>` : ''}</button>
      <button class="btn" data-act="export" title="Скачать .lng: ${esc(app ? app.name : 'все приложения')} · ${esc(currentLanguage().name)}">${icon('download')}<span>Скачать .lng</span></button></div>
  </section>`;
}

function stringRow(r) {
  const t = translation(r), ig = ignored(r), err = !ig && hasErrors(r);
  const nl = (source(r).match(/\n/g) || []).length;
  return `<button class="srow ${S.selected === r.id ? 'is-selected' : ''} ${ig ? 'is-ignored' : ''}" data-row="${esc(r.id)}" title="${esc(r.id)}">
    <span class="srow__src"><span class="ellipsis">${esc(source(r).replace(/\n/g, ' ↵ '))}</span>${nl ? `<span class="srow__nl" title="Переносы строк">↵${nl}</span>` : ''}</span>
    <span class="srow__tr">${t.text ? `<span class="ellipsis">${esc(t.text.replace(/\n/g, ' ↵ '))}</span>` : '<span class="empty">—</span>'}${err ? `<span class="srow__warn" title="Есть ошибки проверки">${icon('warning')}</span>` : ''}</span>
    <span>${ig ? statusBadge('ignored', 'Ignored') : statusBadge(t.status)}</span>
  </button>`;
}

function inspector() {
  const row = rows.find(r => r.id === S.selected);
  if (!row) return `<aside class="panel panel--insp"><div class="panel__head"><span class="panel__title">Перевод</span></div><div class="empty-state">${icon('translate')}<b>Выберите строку</b><span>Слева список, здесь перевод</span></div></aside>`;
  const t = translation(row), ig = ignored(row), text = drafts[key(row)] ?? t.text, edit = canEdit() && !ig;
  const checks = validate(source(row), text, db.dealers), failed = checks.filter(c => !c.ok);
  const matches = rows.filter(r => r.id !== row.id && !ignored(r) && source(r) === source(row));
  const pending = matches.filter(r => !accepted(translation(r).status));
  if (S.matchSelFor !== row.id) { S.matchSelFor = row.id; S.matchSel = new Set(pending.map(r => r.id)); }
  const app = appById(row.app);
  const dirty = text !== t.text;
  const suggestion = row.suggestions[S.lang];
  const showSuggestion = edit && !text.trim() && suggestion;
  const moduleLocked = db.excludedModules.includes(row.module);
  return `<aside class="panel panel--insp">
    <div class="panel__head"><span class="panel__title">Перевод</span>${ig ? statusBadge('ignored', 'Ignored') : statusBadge(t.status)}<span class="spacer"></span>
      ${isAdmin() ? `<button class="ibtn ${ig ? 'is-pressed' : ''}" data-act="ignore" ${moduleLocked ? 'disabled' : ''} title="${moduleLocked ? 'Модуль исключён из перевода' : ig ? 'Ignored: вернуть в перевод' : 'Отметить как Ignored — не переводить'}">${icon(ig ? 'eyeOff' : 'eye')}</button>` : ''}<button class="ibtn" data-act="previous" title="Предыдущая (K)">${icon('up')}</button><button class="ibtn" data-act="next" title="Следующая (J)">${icon('down')}</button>
      <button class="ibtn" data-act="close-editor" title="Закрыть">${icon('close')}</button></div>
    <div class="insp"><div class="insp__scroll">
      <div class="sect"><div class="sect__head"><span class="lang">EN</span><b>${esc(app?.name || row.app)}</b><span class="muted ellipsis">${esc(row.context)}</span><button class="ibtn" data-act="copy-source" title="Скопировать эталон">${icon('copy')}</button></div>
        <div class="srcbox srcbox--lg">${showNl(source(row))}</div>
        ${t.status === 'outdated' && row.previousSource && S.version === '18.0' ? `<div class="notice notice--amber">${icon('history')}<span>Эталон изменился. Было: <del>${esc(row.previousSource)}</del></span></div>` : ''}
        ${row.note ? `<div class="notice">${icon('info')}<span>${esc(row.note)}</span></div>` : ''}</div>

      <div class="sect"><div class="sect__head"><span class="lang is-target">${esc(currentLanguage().tag)}</span><b>${esc(currentLanguage().name)}</b>${dirty ? '<span class="tag tag--amber">не применено</span>' : ''}<span class="spacer"></span>
          <button class="ibtn" data-act="insert-newline" title="Перенос строки (Shift+Enter)" ${edit ? '' : 'disabled'}>${icon('enter')}</button>
          <button class="ibtn" data-act="copy-source-to" title="Скопировать эталон в перевод" ${edit ? '' : 'disabled'}>${icon('arrow')}</button></div>
        <div class="editor"><textarea id="translation-input" rows="3" lang="${esc(S.lang)}" spellcheck="true" placeholder="${edit ? 'Перевод…' : ''}" ${edit ? '' : 'disabled'}>${esc(text)}</textarea></div>
        ${showSuggestion ? `<button class="suggest" data-act="suggest">${icon('sparkles')}<span class="suggest__text">${esc(suggestion)}</span><span class="suggest__cta">Вставить</span></button>` : ''}
        ${ig ? `<div class="notice">${icon('eyeOff')}<span>Строка не переводится${row.reason ? ': ' + esc(row.reason).toLowerCase() : ''}${moduleLocked ? ' (модуль исключён)' : ''}.</span></div>` : ''}
        ${!canEdit() ? `<div class="notice">${icon('lock')}<span>Язык доступен вашей компании только для чтения.</span></div>` : ''}
        <div class="checks" id="validation-checks">${renderChecks(checks)}</div>${t.status === 'auto' && !dirty && !failed.length ? `<div class="check auto">${icon('sparkles')}<span>Автоперевод: подтвердите, чтобы строка попала в .lng</span></div>` : ''}</div>

      <div class="sect sect--tabs"><div class="seg" role="tablist">${[['context', 'Контекст'], ['matches', 'Совпадения', matches.length], ['history', 'История', t.history.length]].map(([id, label, n]) => `<button role="tab" class="${S.tab === id ? 'is-active' : ''}" data-tab="${id}">${label}${n ? `<small>${n}</small>` : ''}</button>`).join('')}</div>
        <div class="tabpane">${inspectorTab(row, t, matches, pending, ig, moduleLocked)}</div></div>
    </div>
    <div class="insp__foot">${ig
      ? `<button class="btn btn--wide" data-act="ignore" ${!isAdmin() || moduleLocked ? 'disabled' : ''}>Вернуть в перевод</button>`
      : `<div class="row"><button class="btn btn--primary" id="apply-button" data-act="apply-next" ${!edit || failed.length || !text.trim() ? 'disabled' : ''}>${icon('check')}Применить<kbd>Ctrl ↵</kbd></button>${matches.length ? `<button class="btn btn--secondary" data-act="apply-matches" ${!edit || failed.length || !text.trim() || !S.matchSel.size ? 'disabled' : ''} title="Применить этот перевод к отмеченным строкам с таким же текстом">${icon('copy')}И ещё ${S.matchSel.size}</button>` : ''}</div>`}
    </div></div></aside>`;
}
const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
const renderChecks = checks => { const f = checks.filter(c => !c.ok); return f.length ? f.map(c => `<div class="check fail">${icon('warning')}<span>${esc(c.label)}</span></div>`).join('') : `<div class="check ok">${icon('check')}<span>Параметры, переносы и контакты в порядке</span></div>`; };

const windowScheme = row => `<div class="win"><div class="win__bar"><i></i><i></i><i></i><span>${esc(appById(row.app)?.name || row.app)} — ${esc(row.context.split(' → ')[0])}</span></div><div class="win__body"><div class="win__row"><span>${esc(row.context.split(' → ')[1] || 'Параметр')}</span><span class="win__ctl is-hl">${esc(source(row).split('\n')[0])}</span></div><div class="win__row"><span>Значение</span><span class="win__ctl"></span></div><div class="win__row"><span>Режим</span><span class="win__ctl"></span></div><div class="win__btns"><span>OK</span><span>Cancel</span></div></div></div>`;

function inspectorTab(row, t, matches, pending, ig, moduleLocked) {
  if (S.tab === 'history') {
    if (!t.history.length) return `<div class="empty-state empty-state--sm">${icon('history')}<span>Перевод ещё не применялся</span></div>`;
    const list = [...t.history].reverse();
    const when = d => { const x = new Date(d), now = new Date(), sameYear = x.getFullYear() === now.getFullYear(); return x.toLocaleString('ru-RU', {day: 'numeric', month: 'short', ...(sameYear ? {} : {year: 'numeric'}), hour: '2-digit', minute: '2-digit'}); };
    const verb = h => h.status === 'auto' ? 'предложил автоперевод' : h.status === 'outdated' ? 'перенёс как устаревший' : h.status === 'translated' ? 'применил перевод' : 'изменил строку';
    return `<ol class="tl">${list.map((h, i) => `<li class="tl__e ${i === 0 ? 'is-current' : ''}"><span class="tl__dot status--${h.status}"></span>
      <div class="tl__head">${avatar(h.author)}<span class="tl__who"><b>${esc(h.author)}</b> <span class="muted">${verb(h)}</span></span><time class="tl__when">${when(h.date)}</time></div>
      <div class="tl__text">${esc(h.text) || '<i class="muted">пусто</i>'}</div>${i === 0 ? '' : `<button class="tl__restore" data-restore="${esc(h.text)}" title="Подставить этот вариант в поле перевода">${icon('history')}Вернуть этот вариант</button>`}</li>`).join('')}</ol>`;
  }
  if (S.tab === 'matches') {
    if (!matches.length) return `<p class="muted">Такого же текста в других местах нет.</p>`;
    const n = S.matchSel.size, text = currentDraft(row);
    return `<div class="mtoolbar"><label class="tgl"><input type="checkbox" id="match-all" ${n === matches.length ? 'checked' : ''}><span class="tgl__track"></span><span>${n ? `Отмечено ${n} из ${matches.length}` : 'Отметить все'}</span></label><span class="spacer"></span>
        <button class="btn btn--secondary" data-act="apply-matches" ${!n || !text.trim() || !canEdit() ? 'disabled' : ''} title="Применить текущий перевод к отмеченным строкам">${icon('copy')}Применить к ${n}</button></div>
      ${matches.map(r => { const mt = translation(r), on = S.matchSel.has(r.id); return `<div class="mcard ${on ? 'is-on' : ''}"><input type="checkbox" class="ck" name="match-id" value="${esc(r.id)}" ${on ? 'checked' : ''} aria-label="Отметить">
        <button class="mcard__body" data-goto="${esc(r.id)}" title="Открыть строку"><span class="mcard__text ${mt.text ? '' : 'is-empty'}">${mt.text ? esc(mt.text) : 'нет перевода'}</span><span class="mcard__where"><span>${esc(appById(r.app)?.name || r.app)}</span><i></i><span>${esc(MODULES[r.module]?.label || r.module)}</span></span></button>
        ${statusBadge(mt.status)}</div>`; }).join('')}`;
  }
  return `<div class="ctx">
    <div class="ctx__group">
      <div class="irow"><span class="irow__label">Ключ</span><span class="irow__val"><code class="ellipsis" title="${esc(row.id)}">${esc(row.id)}</code><button class="ibtn" data-act="copy-key" title="Скопировать ключ">${icon('copy')}</button></span></div>
      <div class="irow"><span class="irow__label">Модуль</span><span class="irow__val"><span class="ellipsis">${esc(MODULES[row.module]?.label || row.module)}</span><span class="muted">${esc(row.module)}</span></span></div>
      <div class="irow"><span class="irow__label">Ответственный</span><span class="irow__val">${avatar(row.owner)}<span class="ellipsis">${esc(row.owner)}</span>${row.owner === ME ? '<span class="tag tag--green">вы</span>' : ''}</span></div>
    </div>
    <details class="acc acc--ctx" ${S.winOpen ? 'open' : ''} id="win-acc"><summary class="acc__head">${icon('right')}<b>Где в окне</b><span class="muted">${esc(row.context)}</span></summary>
      <div class="acc__body">${windowScheme(row)}<p class="muted">В производственной версии здесь снимок окна ENCY с подсветкой элемента.</p></div></details>
  </div>`;
}

function translationsPage() {
  return `<div class="workspace workspace--rows" style="--tree-w:${db.layout.tree}px;--insp-w:${db.layout.insp}px">${appsTree()}<div class="gutter" data-gutter="tree" title="Потянуть, чтобы изменить ширину"></div>${stringsPanel()}<div class="gutter" data-gutter="insp"></div>${inspector()}</div>`;
}

/* ---------------------------------------------------------- progress page */
function progressPage() {
  return `<div class="workspace"><div class="progress">
    <aside class="panel panel--langs"><div class="panel__head"><span class="panel__title">Языки<span class="panel__count">${db.languages.length}</span></span><span class="spacer"></span>${isAdmin() ? `<button class="ibtn" data-act="add-language" title="Добавить язык">${icon('plus')}</button>` : ''}</div>
      <div class="panel__body langlist">${db.languages.map(l => { const st = getStats(rows, l.code); const editors = db.dealers.filter(d => d.languages.includes(l.code)); return `<div class="lcard ${l.code === S.lang ? 'is-selected' : ''}" data-lang="${esc(l.code)}" role="button" tabindex="0">
        <div class="lcard__head"><span class="card__tag">${esc(l.tag)}</span><div class="lcard__t"><div class="card__title">${esc(l.name)}</div><div class="card__sub">${esc(l.native)}</div></div><span class="lcard__pct">${st.percent}<small>%</small></span></div>
        ${bar(st)}
        <div class="lcard__legend"><span title="Переведено"><i class="dot" style="--dot:var(--st-translated)"></i>${fmt(st.translated)}</span><span title="Устарело"><i class="dot" style="--dot:var(--st-outdated)"></i>${fmt(st.outdated)}</span><span title="Автоперевод"><i class="dot" style="--dot:var(--st-auto)"></i>${fmt(st.auto)}</span><span title="Без перевода"><i class="dot" style="--dot:var(--st-untranslated)"></i>${fmt(st.untranslated)}</span></div>
        <div class="lcard__foot"><span class="muted ellipsis">${editors.length ? editors.map(d => esc(d.name)).join(', ') : 'переводчики не назначены'}</span><button class="ibtn" data-open-lang="${esc(l.code)}" title="Открыть строки на этом языке">${icon('arrow')}</button></div></div>`; }).join('')}</div></aside>
    <section class="panel"><div class="panel__head"><span class="panel__title">Готовность по приложениям<span class="panel__count">ENCY ${esc(S.version)}</span></span>
        <span class="spacer"></span>
        <span class="muted">Сортировка</span><div class="seg seg--sm"><button class="${S.progressSort === 'group' ? 'is-active' : ''}" data-psort="group">По группам</button><button class="${S.progressSort === 'worst' ? 'is-active' : ''}" data-psort="worst">Сначала отстающие</button></div>
        <span class="header__sep"></span><span class="heat-legend"><i style="--h:0"></i><i style="--h:.25"></i><i style="--h:.5"></i><i style="--h:.75"></i><i style="--h:1"></i><span class="muted">0 → 100%</span></span></div>
      <div class="panel__body"><table class="table heat"><thead><tr><th>Приложение</th><th>Имя .lng</th><th class="num">Строк</th>${db.languages.map(l => `<th class="num ${l.code === S.lang ? 'is-cur' : ''}">${esc(l.tag)}</th>`).join('')}</tr></thead><tbody>
        ${(() => {
          const cell = (a, l) => { const st = getStats(rows.filter(r => r.app === a.id), l.code); const h = st.percent / 100; return `<td class="num ${l.code === S.lang ? 'is-cur' : ''}"><button class="heat__cell ${st.percent === 100 ? 'is-done' : ''}" style="--h:${h}" data-progress-app="${esc(a.id)}" data-progress-lang="${esc(l.code)}" title="${esc(a.name)} · ${esc(l.name)}: переведено ${st.translated}, устарело ${st.outdated}, авто ${st.auto}, без перевода ${st.untranslated}"><b>${st.percent}%</b>${st.untranslated ? `<small>${st.untranslated}</small>` : ''}</button></td>`; };
          const rowHtml = a => `<tr><td>${esc(a.name)}</td><td class="mono muted">${esc(a.id)}</td><td class="num muted">${fmt(getStats(rows.filter(r => r.app === a.id)).total)}</td>${db.languages.map(l => cell(a, l)).join('')}</tr>`;
          if (S.progressSort === 'worst') return [...db.apps].sort((x, y) => getStats(rows.filter(r => r.app === x.id)).percent - getStats(rows.filter(r => r.app === y.id)).percent).map(rowHtml).join('');
          return GROUPS.map(g => { const apps = db.apps.filter(x => x.group === g); if (!apps.length) return ''; const open = !S.progressClosed.has(g); const grows = rows.filter(r => apps.some(x => x.id === r.app)); return `<tr class="heat__group ${open ? 'is-open' : ''}" data-pgroup="${esc(g)}"><td><span class="heat__gname">${icon('right')}<b>${esc(g)}</b><span class="muted">${apps.length} ${plural(apps.length, 'приложение', 'приложения', 'приложений')}</span></span></td><td></td><td class="num muted">${fmt(getStats(grows).total)}</td>${db.languages.map(l => { const st = getStats(grows, l.code); return `<td class="num ${l.code === S.lang ? 'is-cur' : ''}"><span class="heat__cell heat__cell--sum" style="--h:${st.percent / 100}" title="${esc(g)} · ${esc(l.name)}: без перевода ${st.untranslated}"><b>${st.percent}%</b>${st.untranslated ? `<small>${st.untranslated}</small>` : ''}</span></td>`; }).join('')}</tr>` + (open ? apps.map(rowHtml).join('') : ''); }).join('');
        })()}
      </tbody></table></div>
      <div class="panel__foot"><span class="muted">В ячейке: процент Translated и мелко — сколько строк без перевода. Ignored исключены. Клик открывает строки приложения на этом языке.</span></div></section>
  </div></div>`;
}

/* ------------------------------------------------------------- admin page */
function adminPage() {
  const ro = !isAdmin();
  return `<div class="workspace"><div class="page page--narrow">
    ${ro ? `<div class="notice">${icon('lock')}<span>Вы смотрите раздел как переводчик. Изменения доступны администратору — переключите роль в шапке.</span></div>` : ''}
    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Компании и доступ к языкам<span class="panel__count">${db.dealers.length}</span></span><span class="spacer"></span><button class="btn" data-act="add-dealer" ${ro ? 'disabled' : ''}>${icon('plus')}Компания</button></div>
      <div class="panel__body"><p class="muted" style="margin-bottom:6px">Один язык могут переводить несколько компаний, одна компания — несколько языков. Отметьте языки прямо в таблице.</p>
      <table class="table"><thead><tr><th>Компания</th><th>Регион</th><th class="num">Участники</th><th>Языки для перевода</th></tr></thead><tbody>
        ${db.dealers.map(d => `<tr><td><span class="cell-app">${avatar(d.name)}${esc(d.name)}</span></td><td class="muted">${esc(d.region)}</td><td class="num">${d.people}</td><td><span class="cell-langs">${db.languages.map(l => `<label class="${d.languages.includes(l.code) ? 'is-on' : ''}"><input type="checkbox" class="ck" data-access="${esc(d.id)}" value="${esc(l.code)}" ${d.languages.includes(l.code) ? 'checked' : ''} ${ro ? 'disabled' : ''}>${esc(l.tag)}</label>`).join('')}</span></td></tr>`).join('')}
      </tbody></table></div></section>

    <div class="split">
    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Языки<span class="panel__count">${db.languages.length}</span></span><span class="spacer"></span><button class="btn" data-act="add-language" ${ro ? 'disabled' : ''}>${icon('plus')}Язык</button></div>
      <div class="panel__body"><table class="table"><thead><tr><th>Код</th><th>Название</th><th class="num">Готовность</th></tr></thead><tbody>
        ${db.languages.map(l => { const st = getStats(rows, l.code); return `<tr><td class="mono">${esc(l.code)}</td><td>${esc(l.name)} <span class="muted">${esc(l.native)}</span></td><td class="num"><span class="cell-pct">${bar(st)}<button data-open-lang="${esc(l.code)}">${st.percent}%</button></span></td></tr>`; }).join('')}
      </tbody></table></div></section>

    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Приложения<span class="panel__count">${db.apps.length}</span></span><span class="spacer"></span><button class="btn" data-act="add-app" ${ro ? 'disabled' : ''}>${icon('plus')}Приложение</button></div>
      <div class="panel__body" style="max-height:320px;overflow:auto"><table class="table"><thead><tr><th>Приложение</th><th>Группа</th><th>Ответственный</th></tr></thead><tbody>
        ${db.apps.map(a => `<tr><td><span class="cell-app">${esc(a.name)}<small>${esc(a.id)}</small></span></td><td class="muted">${esc(a.group)}</td><td><span class="cell-app">${avatar(a.owner)}${esc(a.owner)}</span></td></tr>`).join('')}
      </tbody></table></div></section>
    </div>

    <div class="split">
    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Перенос переводов</span></div>
      <div class="panel__body prose">
        <p><b>Между приложениями.</b> Перевод копируется по совпадению ключа ресурса из одного .lng в другой. Подтверждённые строки в приёмнике по умолчанию защищены.</p>
        <button class="btn" data-act="copy-translations" ${ro ? 'disabled' : ''}>${icon('copy')}Скопировать перевод между приложениями</button>
        <p style="margin-top:12px"><b>Между версиями 17.0 → 18.0.</b> Если эталон не изменился, статус сохраняется. Если английская строка изменилась, перевод переносится как <b>Outdated</b>. Автоперевод не переносится.</p>
        <button class="btn" data-act="migrate" ${ro ? 'disabled' : ''}>${icon('swap')}Перенести 17.0 → 18.0</button>
      </div></section>
    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Исключаемые модули</span><span class="spacer"></span><button class="btn" data-act="exclusions" ${ro ? 'disabled' : ''}>Изменить</button></div>
      <div class="panel__body prose"><p>Строки этих модулей получают статус Ignored автоматически, не переводятся и не попадают в .lng.</p>
        <p>${db.excludedModules.map(m => `<span class="tag">${esc(m)}</span>`).join(' ')}</p>
        <p class="muted">Отдельные строки (оси Rx/Ry, формулы, идентификаторы вида StPanel) отмечаются флагом Ignored в инспекторе строки.</p></div></section>
    </div>
  </div></div>`;
}

/* ------------------------------------------------------------- guide page */
function guidePage() {
  return `<div class="workspace"><div class="page page--narrow">
    <div class="split">
    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Первый перевод за пять шагов</span></div><div class="panel__body"><ol class="steps">
      <li><div><b>Выберите версию и язык в шапке</b><p>Слева — приложения по группам с готовностью. Тумблер «Мои» оставляет только строки, за которые отвечаете вы.</p></div></li>
      <li><div><b>Найдите строку</b><p>Поиск идёт по ключу, эталону, переводу и ответственному. Кнопки OK/Cancel ищите по ключу, а не по тексту. Чипы фильтруют по статусу, список «Модуль» — по типу: формы, XML, подсказки.</p></div></li>
      <li><div><b>Переведите в инспекторе справа</b><p>Проверки срабатывают на ходу: параметры %s/%d, число переносов строк, контакты и названия дилеров. Перенос строки — кнопка ↵ или Shift+Enter. Орфографию подчёркивает браузер.</p></div></li>
      <li><div><b>Примените</b><p>Ctrl+Enter. «Применить и далее» переходит к следующей строке. Если такой же эталон встречается ещё где-то, кнопка «Перевести так же» закрывает все одинаковые строки за раз.</p></div></li>
      <li><div><b>Скачайте .lng</b><p>В файл попадают только Translated и Outdated. Скопируйте его в папку Languages и проверьте в приложении.</p></div></li>
    </ol></div></section>
    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Статусы строк</span></div><div class="panel__body">
      ${[['translated', 'Переведено и подтверждено. Попадает в .lng.'], ['outdated', 'Перевод есть, но английский эталон изменился. Попадает в .lng, требует подтверждения.'], ['untranslated', 'Перевода нет, автоперевод ещё не предложен.'], ['auto', 'Переведено автоматически по контексту CAM/CAD и ранее подтверждённым строкам. В .lng не попадает до подтверждения.']].map(([s, d]) => `<div class="kv"><span class="kv__k">${statusBadge(s)}</span><span class="kv__v">${d}</span></div>`).join('')}
      <div class="kv"><span class="kv__k">${statusBadge('ignored', 'Ignored')}</span><span class="kv__v">Переводить не нужно: технический идентификатор, обозначение оси, формула. Не считается в проценте, не экспортируется.</span></div>
    </div></section>
    </div>

    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Перенос между версиями</span></div><div class="panel__body prose">
      <p>Переводы сопоставляются по приложению и ключу. Если эталон в новой версии совпадает со старым, перевод и статус сохраняются. Если эталон изменился, перевод приходит как <b>Outdated</b>: он остаётся в .lng, но помечен к проверке, а в инспекторе видно старый эталон. Автоперевод и пустые строки не переносятся: в новой версии они получают статус «Без перевода» и уходят в очередь автоперевода.</p>
    </div></section>

    <section class="panel panel--static"><div class="panel__head"><span class="panel__title">Перевод из интерфейса ENCY и Tuner</span><span class="spacer"></span><span class="tag">проект публичного API</span></div><div class="panel__body prose">
      <p>Сценарий: пользователь наводит курсор на элемент в ENCY и нажимает сочетание клавиш. Открывается окно: слева эталон на английском, справа поле перевода. Кнопка «Отправить» вызывает API локализатора с токеном пользователя; после перезапуска приложения перевод применяется. Правила проверок и прав те же, что на сайте.</p>
      <table class="table"><thead><tr><th>Метод</th><th>Ресурс</th><th>Назначение</th></tr></thead><tbody>
        <tr><td><code>GET</code></td><td><code>/api/v1/strings?app=&key=&version=&language=</code></td><td>Эталон, текущий перевод, статус, ответственный</td></tr>
        <tr><td><code>PUT</code></td><td><code>/api/v1/strings/{app}/{key}/{language}</code></td><td>Применить перевод; ответ 422 с кодами ошибок проверок</td></tr>
        <tr><td><code>GET</code></td><td><code>/api/v1/export/{app}/{language}.lng</code></td><td>Скачать актуальный .lng</td></tr>
        <tr><td><code>POST</code></td><td><code>/api/v1/auth/token</code></td><td>Токен доступа; права определяются компанией и её языками</td></tr>
      </tbody></table>
      <p class="muted">Планируется: уведомление разработчику, когда его строки попали в локализатор, и определение автора строки по истории репозитория.</p>
    </div></section>
    <p class="muted">Все переводы являются собственностью ENCY Software / Спрут Технологии. Прототип: данные демонстрационные и хранятся в этом браузере.</p>
  </div></div>`;
}

/* ---------------------------------------------------------------- render */
function render() {
  const active = document.activeElement, focusedId = active?.id, start = active?.selectionStart, end = active?.selectionEnd;
  const listScroll = $('#strings-list')?.scrollTop || 0, inspScroll = $('.insp__scroll')?.scrollTop || 0;
  document.documentElement.dataset.theme = db.theme;
  const app = $('#app');
  app.className = 'app' + (S.editorOpen ? ' is-editor-open' : '');
  app.innerHTML = header() + ({translations: translationsPage, progress: progressPage, admin: adminPage, guide: guidePage}[S.page] || translationsPage)();
  if (focusedId && $('#' + focusedId)) { const el = $('#' + focusedId); el.focus({preventScroll: true}); if (typeof start === 'number' && el.setSelectionRange) try { el.setSelectionRange(start, end); } catch {} }
  if ($('#strings-list')) $('#strings-list').scrollTop = listScroll;
  if ($('.insp__scroll')) $('.insp__scroll').scrollTop = inspScroll;
  document.title = 'ENCY Localizer — ' + {translations: 'Переводы', progress: 'Прогресс', admin: 'Администрирование', guide: 'Руководство'}[S.page];
}

/* ----------------------------------------------------------------- modal */
let modalReturnFocus = null;
function openModal(title, body, footer = '') {
  modalReturnFocus = document.activeElement;
  const modal = $('#modal');
  modal.innerHTML = `<div class="modal__head"><h2 id="modal-title">${title}</h2><button class="ibtn ibtn--24" data-act="close-modal" aria-label="Закрыть">${icon('close')}</button></div><div class="modal__body">${body}</div>${footer ? `<div class="modal__foot">${footer}</div>` : ''}`;
  if (!modal.open) modal.showModal();
}
function closeModal() { $('#modal').close(); modalReturnFocus?.isConnected && modalReturnFocus.focus(); }
const cancelBtn = '<button class="btn" data-act="close-modal">Отмена</button>';
const submitBtn = (form, label) => `<button class="btn btn--primary" type="submit" form="${form}">${label}</button>`;
const fld = (label, control, help = '') => `<div class="kv"><span class="kv__k">${label}</span><span class="kv__v">${control}${help ? `<small>${help}</small>` : ''}</span></div>`;
const input = (name, attrs = '') => `<label class="field"><input name="${name}" ${attrs}></label>`;
const select = (name, options) => `<label class="dd"><select name="${name}">${options}</select>${icon('down')}</label>`;
const langOptions = (sel = S.lang) => db.languages.map(l => opt(l.code, l.name, l.code === sel)).join('');
const appOptions = (sel = S.app) => GROUPS.map(g => { const a = db.apps.filter(x => x.group === g); return a.length ? `<optgroup label="${esc(g)}">${a.map(x => opt(x.id, `${x.name} (${x.id})`, x.id === sel)).join('')}</optgroup>` : ''; }).join('');
function adminOnly() { if (isAdmin()) return true; toast('Это действие доступно администратору.', 'warning'); return false; }

/* --------------------------------------------------------------- actions */
const editorRow = () => rows.find(r => r.id === S.selected);
const currentDraft = (row = editorRow()) => row ? (drafts[key(row)] ?? translation(row).text) : '';

function updateDraft(text) {
  const row = editorRow(); if (!row) return;
  drafts[key(row)] = text;
  const checks = validate(source(row), text, db.dealers);
  if ($('#validation-checks')) $('#validation-checks').innerHTML = renderChecks(checks);
  if ($('#char-count')) $('#char-count').textContent = text.length + ' симв.';
  const bad = checks.some(c => !c.ok);
  $$('#apply-button, [data-act="apply-next"]').forEach(b => { b.disabled = bad; });
  const m = $('[data-act="apply-matches"]'); if (m) m.disabled = !text.trim();
}
function applyCurrent(next = false) {
  const row = editorRow(); if (!row || !canEdit() || ignored(row)) return;
  const text = currentDraft(row), checks = validate(source(row), text, db.dealers);
  if (checks.some(c => !c.ok)) { toast(checks.find(c => !c.ok).label, 'warning'); return; }
  commit(row, text); persist();
  if (next) moveRow(1); else render();
  $('#translation-input')?.focus();
  toast('Перевод применён');
}
function moveRow(delta) {
  const list = filteredRows(); if (!list.length) return;
  const i = list.findIndex(r => r.id === S.selected);
  S.selected = list[(Math.max(0, i) + delta + list.length) % list.length].id;
  render();
  $(`[data-row="${CSS.escape(S.selected)}"]`)?.scrollIntoView({block: 'nearest'});
}
function goApp(id, lang) {
  S.page = 'translations'; S.app = id; if (lang) S.lang = lang;
  S.status = 'all'; S.query = ''; S.module = 'all'; S.showIgnored = false;
  S.selected = rows.find(r => (id === 'all' || r.app === id) && !ignored(r))?.id;
  location.hash = 'translations'; render();
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Скопировано'); }
  catch { openModal('Скопировать', `<textarea class="form" readonly rows="3" style="width:100%">${esc(text)}</textarea>`, '<button class="btn btn--primary" data-act="close-modal">Готово</button>'); }
}
function download(name, content) {
  const blob = new Blob(['\uFEFF', content], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function applyBatch(list, textProvider) {
  let done = 0, skipped = 0;
  for (const row of list) {
    const text = textProvider(row);
    if (ignored(row) || !text || validate(source(row), text, db.dealers).some(c => !c.ok)) { skipped++; continue; }
    commit(row, text); done++;
  }
  persist(); closeModal(); render();
  toast(`Применено: ${done}${skipped ? `, пропущено с ошибками: ${skipped}` : ''}`);
}

function action(name) {
  const row = editorRow();
  switch (name) {
    case 'close-modal': closeModal(); return;
    case 'close-editor': S.editorOpen = false; render(); return;
    case 'theme': db.theme = db.theme === 'dark' ? 'light' : 'dark'; persist(); render(); return;
    case 'apply': applyCurrent(); return;
    case 'toggle-mine': S.mine = !S.mine; render(); return;
    case 'apply-next': applyCurrent(true); return;
    case 'next': moveRow(1); return;
    case 'previous': moveRow(-1); return;
    case 'copy-key': if (row) copy(row.id); return;
    case 'copy-source': if (row) copy(source(row)); return;
    case 'copy-source-to': if (row && canEdit()) { updateDraft(source(row)); render(); } return;
    case 'insert-newline': {
      const el = $('#translation-input'); if (!el || el.disabled) return;
      const s = el.selectionStart, e = el.selectionEnd;
      el.value = el.value.slice(0, s) + '\n' + el.value.slice(e); updateDraft(el.value); el.focus(); el.setSelectionRange(s + 1, s + 1); return;
    }
    case 'suggest': {
      if (!row || !canEdit() || ignored(row)) return;
      const s = row.suggestions[S.lang];
      if (!s) { toast('В демо-словаре нет варианта для этого языка.', 'warning'); return; }
      updateDraft(s); render(); toast('Автоперевод подставлен в черновик. Проверьте и примените.'); return;
    }
    case 'reset-filters': S.query = ''; S.status = 'all'; S.module = 'all'; S.mine = false; S.showIgnored = false; render(); return;
    case 'ignore': if (!adminOnly() || !row) return; db.ignored[row.id] = !ignored(row); delete drafts[key(row)]; persist(); render(); toast(ignored(row) ? 'Строка исключена из перевода и экспорта' : 'Строка возвращена в перевод'); return;
    case 'export': {
      const list = rows.filter(r => S.app === 'all' || r.app === S.app), st = getStats(list);
      openModal('Скачать .lng', `<div class="kv"><span class="kv__k">Файл</span><span class="kv__v"><code>${esc(S.app === 'all' ? 'ENCY' : S.app.replaceAll(' ', '_'))}_${esc(S.lang)}_${esc(S.version)}.lng</code></span></div>
        <div class="kv"><span class="kv__k">В файл попадут</span><span class="kv__v">${statusBadge('translated')} ${fmt(st.translated)} &nbsp; ${statusBadge('outdated')} ${fmt(st.outdated)}</span></div>
        <div class="kv"><span class="kv__k">Не попадут</span><span class="kv__v">${statusBadge('auto')} ${fmt(st.auto)} &nbsp; ${statusBadge('untranslated')} ${fmt(st.untranslated)} &nbsp; ${statusBadge('ignored', 'Ignored')} ${fmt(st.ignored)}</span></div>
        <p class="muted">Скопируйте файл в папку Languages приложения для проверки. Формат демонстрационный: UTF-8 BOM, секции по приложениям, переносы экранированы как \\n.</p>`,
        cancelBtn + `<button class="btn btn--primary" data-act="download-lng">${icon('download')}Скачать ${fmt(st.exportable)} строк</button>`);
      return;
    }
    case 'download-lng': {
      const out = exportLng(rows.filter(r => S.app === 'all' || r.app === S.app), r => translation(r), ignored, S.version, S.lang);
      download(`${S.app === 'all' ? 'ENCY' : S.app.replaceAll(' ', '_')}_${S.lang}_${S.version}.lng`, out.content); closeModal(); toast(`Выгружено ${out.count} строк`); return;
    }
    case 'autotranslate': {
      if (!canEdit()) return;
      const avail = scopeRows().filter(r => !ignored(r) && translation(r).status === 'untranslated');
      openModal('Автоперевод', `<p>Для ${avail.length} строк без перевода будет предложен вариант с учётом контекста CAM/CAD и ранее подтверждённых переводов.</p><p>Строки получат статус ${statusBadge('auto')} и не попадут в .lng до подтверждения переводчиком.</p><p class="muted">В прототипе используется заранее подготовленный словарь. В производственной версии новые эталонные строки ставятся в очередь автоперевода автоматически.</p>`,
        cancelBtn + `<button class="btn btn--primary" data-act="run-autotranslate" ${avail.length ? '' : 'disabled'}>${icon('sparkles')}Предложить переводы</button>`);
      return;
    }
    case 'run-autotranslate': {
      if (!canEdit()) return; let n = 0;
      for (const r of scopeRows()) if (!ignored(r) && translation(r).status === 'untranslated' && r.suggestions[S.lang]) { commit(r, r.suggestions[S.lang], 'auto', 'Автоперевод'); n++; }
      persist(); closeModal(); render(); toast(n ? `Предложено ${n} переводов. Проверьте и подтвердите.` : 'В демо-словаре нет вариантов для выбранных строк.', n ? 'success' : 'warning'); return;
    }
    case 'apply-matches': {
      if (!row || !canEdit()) return;
      const targets = rows.filter(r => S.matchSel.has(r.id));
      const text = currentDraft(row);
      if (!targets.length) { toast('Отметьте строки на вкладке «Совпадения».', 'warning'); return; }
      openModal('Перевести одинаковые строки', `<p>Перевод «${esc(text)}» будет применён к текущей строке и ещё ${targets.length} ${plural(targets.length, 'строке', 'строкам', 'строкам')} с таким же эталоном на языке «${esc(currentLanguage().name)}».</p><p class="muted">Строки с ошибками проверки будут пропущены. Одна кнопка вместо пятисот повторов «OK».</p>`,
        cancelBtn + `<button class="btn btn--primary" data-act="confirm-matches" data-ids="${esc(targets.map(t => t.id).join('|'))}">${icon('copy')}Применить ко всем</button>`);
      return;
    }
    case 'confirm-matches': {
      if (!row || !canEdit()) return;
      const ids = ($('[data-act="confirm-matches"]')?.dataset.ids || '').split('|').filter(Boolean);
      const text = currentDraft(row);
      applyBatch([row, ...rows.filter(r => ids.includes(r.id))], () => text); return;
    }
    case 'context': if (row) openModal('Где строка в интерфейсе', windowScheme(row) + `<p><b>${esc(appById(row.app)?.name || row.app)}</b> → ${esc(row.context)}</p><p>В производственной версии к ключу привязывается реальный снимок окна ENCY или Tuner с подсветкой элемента. Это снимает вопрос «что имелось в виду» у переводчика и разработчика.</p>`, '<button class="btn btn--primary" data-act="close-modal">Понятно</button>'); return;
    case 'profile':
      openModal('Роль в прототипе', `<p class="muted">Демонстрация прав доступа без реальной авторизации.</p><form id="role-form" class="form">
        <label class="match"><input type="radio" class="ck" name="role" value="admin" ${isAdmin() ? 'checked' : ''}><span>Администратор — все языки, приложения и настройки</span></label>
        ${db.dealers.map(d => `<label class="match"><input type="radio" class="ck" name="role" value="${esc(d.id)}" ${!isAdmin() && S.dealer === d.id ? 'checked' : ''}><span>Переводчик ${esc(d.name)} — ${d.languages.length ? d.languages.map(c => db.languages.find(l => l.code === c)?.tag || c).join(', ') : 'без языков'}</span></label>`).join('')}</form>`,
        cancelBtn + submitBtn('role-form', 'Переключить')); return;
    case 'add-language': if (!adminOnly()) return;
      openModal('Добавить язык', `<form id="language-form" class="form">${fld('Название', input('name', 'placeholder="Итальянский" required maxlength="40"'))}${fld('Код', input('code', 'placeholder="it" required pattern="[a-z]{2,3}(-[A-Z]{2})?" maxlength="6"'), 'ISO 639: it, pt-BR')}${fld('Самоназвание', input('native', 'placeholder="Italiano" required maxlength="40"'))}<div class="form__err" id="form-error"></div></form>`, cancelBtn + submitBtn('language-form', 'Добавить')); return;
    case 'add-app': if (!adminOnly()) return;
      openModal('Добавить приложение', `<form id="app-form" class="form">${fld('Техническое имя', input('id', 'placeholder="NewApplication" required pattern="[A-Za-z][A-Za-z0-9_ -]{1,39}"'), 'Как называется .lng-файл')}${fld('Понятное название', input('name', 'placeholder="Название для переводчика" required maxlength="60"'))}${fld('Группа', select('group', GROUPS.map(g => opt(g, g, g === 'ENCY')).join('')))}${fld('Ответственный', input('owner', `value="${esc(ME)}" required maxlength="60"`))}<div class="form__err" id="form-error"></div></form>`, cancelBtn + submitBtn('app-form', 'Добавить')); return;
    case 'add-dealer': if (!adminOnly()) return;
      openModal('Добавить компанию', `<form id="dealer-form" class="form">${fld('Название', input('name', 'placeholder="Название компании" required maxlength="60"'))}${fld('Регион', input('region', 'placeholder="Европа" required maxlength="60"'))}${fld('Языки', `<span class="cell-langs">${db.languages.map(l => `<label><input type="checkbox" class="ck" name="languages" value="${esc(l.code)}">${esc(l.tag)}</label>`).join('')}</span>`)}<div class="form__err" id="form-error"></div></form>`, cancelBtn + submitBtn('dealer-form', 'Добавить')); return;
    case 'copy-translations': if (!adminOnly()) return;
      openModal('Скопировать перевод между приложениями', `<form id="copy-form" class="form">${fld('Язык', select('lang', langOptions()))}${fld('Из приложения', select('from', appOptions(S.app)))}${fld('В приложение', select('to', appOptions(db.apps.find(a => a.id !== S.app)?.id)))}${fld('', `<label class="tgl"><input type="checkbox" name="overwrite"><span class="tgl__track"></span><span>Перезаписывать подтверждённые переводы</span></label>`)}<p class="muted">Строки сопоставляются по ключу ресурса. Переводы с ошибками проверки пропускаются.</p><div class="form__err" id="form-error"></div></form>`, cancelBtn + submitBtn('copy-form', 'Скопировать')); return;
    case 'migrate': if (!adminOnly()) return;
      openModal('Перенести переводы 17.0 → 18.0', `<form id="migrate-form" class="form">${fld('Язык', select('lang', langOptions()))}${fld('', `<label class="tgl"><input type="checkbox" name="overwrite"><span class="tgl__track"></span><span>Перезаписывать уже подтверждённые в 18.0</span></label>`)}<p class="muted">Сохраняется статус, если эталон не изменился; иначе строка становится Outdated. Автоперевод не переносится.</p></form>`, cancelBtn + submitBtn('migrate-form', 'Перенести')); return;
    case 'exclusions': if (!adminOnly()) return;
      openModal('Исключаемые модули', `<form id="exclusions-form" class="form"><textarea name="modules" rows="4">${esc(db.excludedModules.join('\n'))}</textarea><small>По одному имени в строке. Строки этих модулей получают статус Ignored.</small></form>`, cancelBtn + submitBtn('exclusions-form', 'Сохранить')); return;
  }
}

/* ---------------------------------------------------------------- events */
document.addEventListener('click', e => {
  const t = e.target.closest('button, a.brand, .tree__group, .lcard, .heat__group'); if (!t || t.disabled) return;
  const d = t.dataset;
  if (d.act) { action(d.act); return; }
  if (d.page) { S.page = d.page; location.hash = d.page; render(); return; }
  if (d.app) { goApp(d.app); return; }
  if (d.group !== undefined) { S.openGroups.has(d.group) ? S.openGroups.delete(d.group) : S.openGroups.add(d.group); render(); return; }
  if (d.tab) { S.tab = d.tab; render(); return; }
  if (d.psort) { S.progressSort = d.psort; render(); return; }
  if (d.pgroup !== undefined) { S.progressClosed.has(d.pgroup) ? S.progressClosed.delete(d.pgroup) : S.progressClosed.add(d.pgroup); render(); return; }
  if (d.restore !== undefined) { if (canEdit()) { updateDraft(d.restore); render(); $('#translation-input')?.focus(); } return; }
  if (d.goto) { const r = rows.find(x => x.id === d.goto); if (r) { S.app = r.app; S.selected = r.id; render(); $(`[data-row="${CSS.escape(r.id)}"]`)?.scrollIntoView({block: 'nearest'}); } return; }
  if (d.row) { S.selected = d.row; S.editorOpen = true; render(); $('#translation-input')?.focus(); return; }
  if (d.status) { S.status = S.status === d.status && d.status !== 'all' ? 'all' : d.status; S.showIgnored = S.status === 'ignored'; render(); return; }
  if (d.openLang) { goApp('all', d.openLang); return; }
  if (d.lang !== undefined && !e.target.closest('[data-open-lang]')) { S.lang = d.lang; render(); return; }
  if (d.progressApp) { goApp(d.progressApp, d.progressLang); return; }
});
document.addEventListener('input', e => {
  if (e.target.id === 'translation-input') updateDraft(e.target.value);
  if (e.target.id === 'string-search') { S.query = e.target.value; render(); }
});
document.addEventListener('toggle', e => { if (e.target.id === 'win-acc') S.winOpen = e.target.open; }, true);
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'language-select') { S.lang = el.value; render(); }
  if (el.id === 'version-select') { S.version = el.value; render(); }
  if (el.id === 'module-select') { S.module = el.value; render(); }
  if (el.name === 'match-id') { el.checked ? S.matchSel.add(el.value) : S.matchSel.delete(el.value); render(); }
  if (el.id === 'match-all') { const row = editorRow(); S.matchSel = el.checked ? new Set(rows.filter(r => r.id !== row.id && !ignored(r) && source(r) === source(row)).map(r => r.id)) : new Set(); render(); }
  if (el.id === 'ignored-toggle') { S.showIgnored = el.checked; render(); }
  if (el.dataset.access) {
    if (!adminOnly()) { el.checked = !el.checked; return; }
    const dealer = db.dealers.find(x => x.id === el.dataset.access);
    dealer.languages = el.checked ? [...new Set([...dealer.languages, el.value])] : dealer.languages.filter(c => c !== el.value);
    persist(); render(); toast(`${dealer.name}: доступ к языкам обновлён`);
  }
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target, f = new FormData(form), val = n => String(f.get(n) || '').trim();
  const fail = msg => { const el = $('#form-error'); if (el) el.textContent = msg; };
  if (form.id === 'role-form') { const v = val('role'); if (v === 'admin') S.role = 'admin'; else { S.role = 'translator'; S.dealer = v; } closeModal(); render(); toast('Роль переключена'); return; }
  if (!adminOnly()) return;
  if (form.id === 'language-form') {
    if (db.languages.some(l => l.code.toLowerCase() === val('code').toLowerCase())) return fail('Язык с таким кодом уже есть.');
    db.languages.push({code: val('code'), name: val('name'), native: val('native'), tag: val('code').toUpperCase()}); persist(); closeModal(); render(); toast('Язык добавлен. Назначьте его компаниям.'); return;
  }
  if (form.id === 'app-form') {
    if (db.apps.some(a => a.id.toLowerCase() === val('id').toLowerCase())) return fail('Приложение с таким именем уже есть.');
    db.apps.push({id: val('id'), name: val('name'), group: val('group'), owner: val('owner'), description: 'Добавлено вручную', mine: false});
    rows = makeRows(db.apps); persist(); closeModal(); render(); toast('Приложение добавлено с демонстрационными строками'); return;
  }
  if (form.id === 'dealer-form') {
    if (db.dealers.some(d => d.name.toLowerCase() === val('name').toLowerCase())) return fail('Компания с таким названием уже есть.');
    db.dealers.push({id: 'dealer-' + Date.now(), name: val('name'), region: val('region'), people: 0, languages: f.getAll('languages')}); persist(); closeModal(); render(); toast('Компания добавлена'); return;
  }
  if (form.id === 'copy-form') {
    if (val('from') === val('to')) return fail('Выберите разные приложения.');
    const lang = val('lang'); let done = 0;
    const src = rows.filter(r => r.app === val('from') && !ignored(r));
    for (const target of rows.filter(r => r.app === val('to') && !ignored(r))) {
      const s = src.find(r => r.code === target.code); if (!s) continue;
      const old = translation(s, lang), existing = translation(target, lang);
      if (!accepted(old.status) || (!f.has('overwrite') && accepted(existing.status))) continue;
      if (validate(sourceFor(target, S.version), old.text, db.dealers).some(c => !c.ok)) continue;
      const status = sourceFor(s, S.version) === sourceFor(target, S.version) ? old.status : 'outdated';
      db.entries[key(target, lang)] = {text: old.text, status, history: [...(existing.history || []), {text: old.text, status, author: `Копия из ${s.app}`, date: new Date().toISOString()}]}; done++;
    }
    persist(); closeModal(); render(); toast(done ? `Скопировано ${done} переводов` : 'Нечего копировать: совпадений по ключу нет или подтверждённые строки защищены.', done ? 'success' : 'warning'); return;
  }
  if (form.id === 'migrate-form') {
    const lang = val('lang'); let done = 0, outdated = 0;
    for (const r of rows) {
      if (ignored(r)) continue;
      const existing = translation(r, lang, '18.0'); if (!f.has('overwrite') && accepted(existing.status)) continue;
      const m = migratedTranslation(r, '17.0', '18.0', translation(r, lang, '17.0'));
      if (!m || validate(sourceFor(r, '18.0'), m.text, db.dealers).some(c => !c.ok)) continue;
      db.entries[key(r, lang, '18.0')] = m; done++; if (m.status === 'outdated') outdated++;
    }
    persist(); S.version = '18.0'; closeModal(); render(); toast(`Перенесено: ${done}. Стали Outdated: ${outdated}.`); return;
  }
  if (form.id === 'exclusions-form') { db.excludedModules = [...new Set(val('modules').split('\n').map(x => x.trim()).filter(Boolean))]; persist(); closeModal(); render(); toast('Список исключаемых модулей обновлён'); }
});
document.addEventListener('keydown', e => {
  if ($('#modal').open) return;
  const inField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && S.page === 'translations') { e.preventDefault(); applyCurrent(true); return; }
  if (e.target.id === 'translation-input' && e.key === 'Enter' && e.shiftKey) { e.preventDefault(); action('insert-newline'); return; }
  if (inField) { if (e.key === 'Escape') e.target.blur(); return; }
  if (S.page !== 'translations') return;
  if (e.key === '/') { e.preventDefault(); $('#string-search')?.focus(); }
  if (e.key === 'j') moveRow(1);
  if (e.key === 'k') moveRow(-1);
  if (e.key === 'Escape') { S.editorOpen = false; render(); }
});
document.addEventListener('pointerdown', e => {
  const g = e.target.closest('.gutter'); if (!g) return;
  const ws = g.parentElement, which = g.dataset.gutter, startX = e.clientX, start = db.layout[which];
  const min = which === 'tree' ? 160 : 300, max = which === 'tree' ? 400 : 640;
  g.classList.add('is-active'); document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
  const move = ev => { const d = ev.clientX - startX; db.layout[which] = Math.round(Math.min(max, Math.max(min, which === 'tree' ? start + d : start - d))); ws.style.setProperty(`--${which}-w`, db.layout[which] + 'px'); };
  const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); g.classList.remove('is-active'); document.body.style.cursor = ''; document.body.style.userSelect = ''; persist(); };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); e.preventDefault();
});
document.addEventListener('dblclick', e => { const g = e.target.closest('.gutter'); if (!g) return; db.layout[g.dataset.gutter] = g.dataset.gutter === 'tree' ? 232 : 380; persist(); render(); });
$('#modal').addEventListener('click', e => { if (e.target === $('#modal')) closeModal(); });
window.addEventListener('hashchange', () => { const p = location.hash.slice(1); if (PAGES.includes(p) && p !== S.page) { S.page = p; render(); } });
const initial = location.hash.slice(1); if (PAGES.includes(initial)) S.page = initial;
render();
