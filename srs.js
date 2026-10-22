/**
 * Spaced Repetition nach dem Leitner-System + Lernanalytik.
 *
 * 5 Boxen. Richtig → eine Box weiter, falsch → zurück in Box 1.
 * Fälligkeit je Box (in Tagen): 1 → sofort, 2 → 1, 3 → 3, 4 → 7, 5 → 14.
 * Fehlerhafte Fragen landen also in Box 1 und erscheinen sofort wieder (häufiger).
 *
 * Die „Smart“-Auswahl priorisiert: fällige Wiederholungen > Schwachstellen-Themen > neue Fragen,
 * gewichtet mit der Klausurrelevanz des Themas.
 */
window.DBT = window.DBT || {};

DBT.srs = (() => {
  const { DAY, startOfDay, shuffle } = DBT.util;
  const INTERVAL_DAYS = [0, 0, 1, 3, 7, 14]; // Index = Box
  const MAX_BOX = 5;

  const topicById = () => Object.fromEntries(DBT.data.topics.map((t) => [t.id, t]));

  function newItem() {
    return { box: 1, due: 0, right: 0, wrong: 0, seen: 0, last: 0, lastOk: null };
  }

  /** Bewertet eine Antwort und plant die nächste Wiederholung. kind: 'q' | 'c' */
  function review(kind, id, correct) {
    DBT.store.update((s) => {
      const it = s[kind][id] || newItem();
      it.seen++;
      it.last = Date.now();
      it.lastOk = !!correct;
      if (correct) { it.right++; it.box = Math.min(MAX_BOX, it.box + 1); }
      else { it.wrong++; it.box = 1; }
      it.due = startOfDay() + INTERVAL_DAYS[it.box] * DAY;
      s[kind][id] = it;
      DBT.store.logActivity();
    });
  }

  const isDue = (it) => !!it && it.due <= Date.now();

  function dueCount(kind) {
    const s = DBT.store.get()[kind];
    const pool = kind === 'q' ? DBT.data.questions : DBT.data.flashcards;
    return pool.filter((x) => isDue(s[x.id])).length;
  }

  /** Statistik je Thema über Fragen (+ Karten für Mastery). */
  function topicStats(topicId) {
    const s = DBT.store.get();
    const qs = DBT.data.questions.filter((q) => q.t === topicId);
    const cs = DBT.data.flashcards.filter((c) => c.t === topicId);
    let right = 0, wrong = 0, seen = 0, boxSum = 0, due = 0;
    for (const q of qs) {
      const it = s.q[q.id];
      if (it) { right += it.right; wrong += it.wrong; seen++; boxSum += it.box; if (isDue(it)) due++; }
    }
    let cBox = 0, cSeen = 0;
    for (const c of cs) { const it = s.c[c.id]; if (it) { cBox += it.box; cSeen++; if (isDue(it)) due++; } }
    const attempts = right + wrong;
    const items = qs.length + cs.length || 1;
    // Mastery: mittlere Box über alle Items (ungesehen = 0) normiert auf 0..1
    const mastery = (boxSum + cBox) / (items * MAX_BOX);
    return {
      total: qs.length, seen, right, wrong, attempts, due,
      accuracy: attempts ? right / attempts : null,
      coverage: qs.length ? seen / qs.length : 0,
      mastery
    };
  }

  /**
   * Wiederholungsbedarf 0..1+ (höher = dringender).
   * Kombiniert Fehlerquote, geringe Abdeckung/Mastery und Klausurrelevanz.
   */
  function needScore(topicId) {
    const t = topicById()[topicId];
    const st = topicStats(topicId);
    const errorPart = st.accuracy === null ? 0.5 : 1 - st.accuracy;
    const gap = 1 - st.mastery;
    return (0.5 * errorPart + 0.5 * gap) * (0.4 + 0.6 * (t.relevance / 5));
  }

  function topicRanking() {
    return DBT.data.topics
      .map((t) => ({ topic: t, stats: topicStats(t.id), need: needScore(t.id) }))
      .sort((a, b) => b.need - a.need);
  }

  function overall() {
    const s = DBT.store.get();
    let right = 0, wrong = 0, boxSum = 0;
    for (const q of DBT.data.questions) { const it = s.q[q.id]; if (it) { right += it.right; wrong += it.wrong; boxSum += it.box; } }
    for (const c of DBT.data.flashcards) { const it = s.c[c.id]; if (it) boxSum += it.box; }
    const items = DBT.data.questions.length + DBT.data.flashcards.length;
    return {
      right, wrong, attempts: right + wrong,
      accuracy: right + wrong ? right / (right + wrong) : null,
      mastery: boxSum / (items * MAX_BOX),
      seenQ: Object.keys(s.q).length,
      totalQ: DBT.data.questions.length
    };
  }

  /** Verteilung der Fragen auf die Leitner-Boxen (0 = neu). */
  function boxDistribution(kind = 'q') {
    const s = DBT.store.get()[kind];
    const pool = kind === 'q' ? DBT.data.questions : DBT.data.flashcards;
    const dist = [0, 0, 0, 0, 0, 0];
    for (const x of pool) dist[s[x.id] ? s[x.id].box : 0]++;
    return dist;
  }

  /**
   * Fragen auswählen.
   * opts: { topics?: string[], levels?: number[], types?: string[], count, mode: 'smart'|'due'|'new'|'wrong'|'random' }
   */
  function pick(pool, kind, opts) {
    const s = DBT.store.get()[kind];
    const tmap = topicById();
    let cand = pool.filter((x) =>
      (!opts.topics || !opts.topics.length || opts.topics.includes(x.t)) &&
      (!opts.levels || !opts.levels.length || x.l === undefined || opts.levels.includes(x.l)) &&
      (!opts.types || !opts.types.length || opts.types.includes(x.y)));

    const mode = opts.mode || 'smart';
    if (mode === 'due') cand = cand.filter((x) => isDue(s[x.id]));
    if (mode === 'new') cand = cand.filter((x) => !s[x.id]);
    if (mode === 'wrong') cand = cand.filter((x) => s[x.id] && s[x.id].wrong > 0).sort((a, b) => (s[b.id].wrong - s[b.id].right) - (s[a.id].wrong - s[a.id].right));

    if (mode === 'smart') {
      const need = Object.fromEntries(DBT.data.topics.map((t) => [t.id, needScore(t.id)]));
      const scored = cand.map((x) => {
        const it = s[x.id];
        let p;
        if (!it) p = 1.0;                               // neu
        else if (isDue(it)) p = 2.0 + (MAX_BOX - it.box) * 0.2 + (it.lastOk === false ? 0.6 : 0); // fällig
        else p = 0.15 * (MAX_BOX - it.box);             // noch nicht fällig
        p *= 0.6 + need[x.t] + 0.1 * (tmap[x.t]?.relevance || 1);
        return { x, p: p * (0.75 + Math.random() * 0.5) };
      });
      return scored.sort((a, b) => b.p - a.p).slice(0, opts.count).map((o) => o.x);
    }
    if (mode === 'wrong') return cand.slice(0, opts.count);
    return shuffle(cand).slice(0, opts.count);
  }

  return { review, isDue, dueCount, topicStats, needScore, topicRanking, overall, boxDistribution, pick, MAX_BOX, INTERVAL_DAYS };
})();
