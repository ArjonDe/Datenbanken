/**
 * Persistenz in localStorage.
 *
 * Gespeichert werden: Lernfortschritt je Frage/Karte (Leitner-Box, Fälligkeit, Statistik),
 * selbstbewertete Aufgaben, Prüfungsergebnisse, abgeschlossene Kapitel, Tagesaktivität,
 * Einstellungen (Theme). Alle Zugriffe sind abgesichert, damit die App auch ohne Storage
 * (z.B. privater Modus) funktioniert – dann nur für die laufende Sitzung.
 */
window.DBT = window.DBT || {};

DBT.store = (() => {
  const KEY = 'dbtrainer.v1';
  const VERSION = 1;

  const empty = () => ({
    v: VERSION,
    created: Date.now(),
    q: {},          // questionId -> SRS-Item
    c: {},          // flashcardId -> SRS-Item
    tasks: {},      // taskId -> { best, last, attempts, pts }
    exams: [],      // Prüfungsergebnisse
    sql: {},        // SQL-Labor: exerciseId -> { solved, attempts, viewed }
    erm: {},        // ERM-Werkstatt: { trainerBest, tasks: { id -> % } }
    done: {},       // topicId -> Zeitstempel „als gelernt markiert“
    days: {},       // 'YYYY-MM-DD' -> Anzahl Aktionen
    settings: { theme: 'auto' }
  });

  let state = load();
  let saveTimer = null;
  const listeners = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return empty();
      const parsed = JSON.parse(raw);
      return migrate(parsed);
    } catch (e) {
      console.warn('Speicher konnte nicht gelesen werden – starte leer.', e);
      return empty();
    }
  }

  /** Zukunftssicher: fehlende Felder ergänzen. */
  function migrate(s) {
    const base = empty();
    return { ...base, ...s, settings: { ...base.settings, ...(s.settings || {}) }, v: VERSION };
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { console.warn('Speichern fehlgeschlagen', e); }
    }, 150);
  }

  function emit() { listeners.forEach((fn) => fn(state)); }

  /** Mutiert den Zustand über eine Funktion und speichert. */
  function update(fn) {
    fn(state);
    persist();
    emit();
  }

  function logActivity(n = 1) {
    const k = DBT.util.dayKey();
    state.days[k] = (state.days[k] || 0) + n;
  }

  /** Aktuelle Serie aufeinanderfolgender Lerntage (heute oder gestern beginnend). */
  function streak() {
    let n = 0;
    let t = Date.now();
    if (!state.days[DBT.util.dayKey(t)]) t -= DBT.util.DAY;
    while (state.days[DBT.util.dayKey(t)]) { n++; t -= DBT.util.DAY; }
    return n;
  }

  function exportJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (typeof parsed !== 'object' || !parsed || !('q' in parsed)) throw new Error('Ungültige Sicherungsdatei');
    state = migrate(parsed);
    persist();
    emit();
  }

  function reset() {
    const theme = state.settings.theme;
    state = empty();
    state.settings.theme = theme;
    persist();
    emit();
  }

  return {
    get: () => state,
    update,
    logActivity,
    streak,
    exportJSON,
    importJSON,
    reset,
    subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn))
  };
})();
