/**
 * App-Shell: Hash-Router, Navigation, Theme (Hell/Dunkel/System), Badge-Aktualisierung.
 *
 * Routen (zusätzlich #/sql…, #/erm…, #/nosql):
 *   #/                 Dashboard
 *   #/lernen[/:id]     Lernmodus
 *   #/quiz?…           Quiz
 *   #/karten?…         Karteikarten
 *   #/aufgaben[/:id]   Klausuraufgaben
 *   #/pruefung?…       Prüfungsmodus
 *   #/statistik        Lernanalytik
 */
window.DBT = window.DBT || {};

DBT.app = (() => {
  const { $, $$ } = DBT.util;
  const routes = {
    '': DBT.views.dashboard,
    lernen: DBT.views.learn,
    quiz: DBT.views.quiz,
    karten: DBT.views.cards,
    aufgaben: DBT.views.tasks,
    pruefung: DBT.views.exam,
    statistik: DBT.views.stats,
    sql: DBT.views.sql,
    erm: DBT.views.erm,
    nosql: DBT.views.nosql
  };
  const TITLES = { '': 'Übersicht', lernen: 'Lernmodus', quiz: 'Quiz', karten: 'Karteikarten', aufgaben: 'Klausuraufgaben', pruefung: 'Prüfung', statistik: 'Statistik', sql: 'SQL-Labor', erm: 'ERM-Werkstatt', nosql: 'NoSQL' };

  let cleanup = null;
  let currentHash = location.hash;
  const app = { leaveGuard: null };

  function parse(hash) {
    const h = hash.replace(/^#\/?/, '');
    const [path, qs = ''] = h.split('?');
    const [name = '', id, sub] = path.split('/');
    const dec = (x) => (x ? decodeURIComponent(x) : undefined);
    return { name, params: { id: dec(id), sub: dec(sub) }, query: new URLSearchParams(qs) };
  }

  function render() {
    if (app.leaveGuard && location.hash !== currentHash) {
      if (!app.leaveGuard()) { history.replaceState(null, '', currentHash); return; }
    }
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    app.leaveGuard = null;
    window.onbeforeunload = null;
    currentHash = location.hash;

    const { name, params, query } = parse(location.hash);
    const view = routes[name] || routes[''];
    // Hauptbereich ersetzen, damit Event-Listener der vorherigen Ansicht nicht weiterleben
    const old = $('#view');
    const main = old.cloneNode(false);
    old.replaceWith(main);
    main.classList.add('enter');
    try {
      cleanup = view(main, params, query);
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="card empty"><h2>Da ist etwas schiefgelaufen</h2><p class="muted">${DBT.util.esc(err.message)}</p><a class="btn" href="#/">Zur Übersicht</a></div>`;
    }
    document.title = `${TITLES[name] ?? 'Übersicht'} · DB-Klausurtrainer`;
    $$('[data-nav]').forEach((a) => {
      const active = a.dataset.nav === (routes[name] ? name : '');
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    updateBadges();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  function updateBadges() {
    const due = DBT.srs.dueCount('q') + DBT.srs.dueCount('c');
    $$('[data-badge=due]').forEach((b) => { b.textContent = due; b.hidden = !due; });
  }

  /* ───────── Theme ───────── */
  const THEMES = ['auto', 'light', 'dark'];
  const THEME_ICON = { auto: '🌓', light: '☀️', dark: '🌙' };
  function applyTheme() {
    const t = DBT.store.get().settings.theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const btn = $('#theme-toggle');
    if (btn) { btn.textContent = THEME_ICON[t]; btn.setAttribute('aria-label', `Design: ${t === 'auto' ? 'System' : t === 'light' ? 'Hell' : 'Dunkel'} – umschalten`); }
  }
  function cycleTheme() {
    DBT.store.update((s) => { s.settings.theme = THEMES[(THEMES.indexOf(s.settings.theme) + 1) % THEMES.length]; });
    applyTheme();
  }

  function init() {
    applyTheme();
    $('#theme-toggle').addEventListener('click', cycleTheme);
    window.addEventListener('hashchange', render);
    DBT.store.subscribe(updateBadges);
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
  return app;
})();
