/**
 * Prüfungsmodus.
 *
 *  • Schnelltest: zufällige, automatisch bewertete Fragen mit Zeitlimit und Punkten.
 *  • Klausur-Simulation (90 min, 100 P.): exakt die Struktur der Klausuren 2023/2024 –
 *    ERM (30), Tabellen ableiten (15), Normalisierung (5), 8 × SQL (40), Wahr/Falsch (5),
 *    CREATE TABLE (5). Offene Aufgaben werden nach Abgabe per Checkliste selbst bewertet.
 *
 * Ergebnisanalyse: Punkte je Teil und Thema, Zeit, Fehlerliste; gespeichert in localStorage.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.exam = (root, params, query) => {
  const { esc, $, $$, shuffle, fmtDuration, bar, pct, fmtDateTime } = DBT.util;
  const Q = DBT.data.questions, T = DBT.data.tasks;
  const LEVEL_POINTS = { 1: 1, 2: 2, 3: 3, 4: 3 };
  let timer = null;

  const cleanup = () => { clearInterval(timer); DBT.app.leaveGuard = null; window.onbeforeunload = null; };

  const mode = query.get('mode');
  if (mode === 'quick') startQuick();
  else if (mode === 'full') startFull();
  else renderIntro();
  return cleanup;

  /* ───────── Einstieg ───────── */
  function renderIntro() {
    const hist = DBT.store.get().exams.slice().reverse().slice(0, 8);
    root.innerHTML = `
      <div class="page-head"><h1>Prüfungsmodus</h1><p class="muted">Teste dich unter Zeitdruck. Ergebnisse fließen in deine Statistik ein.</p></div>
      <div class="grid-2">
        <section class="card mode-card">
          <h2>📝 Klausur-Simulation</h2>
          <p>90 Minuten · 100 Punkte · gleiche Struktur wie die Klausuren 2023 und 2024:</p>
          <ul class="exam-structure small">
            <li><span>ERM erstellen</span><b>30</b></li><li><span>Tabellen ableiten</span><b>15</b></li>
            <li><span>Normalisierung</span><b>5</b></li><li><span>8 SQL-Statements</span><b>40</b></li>
            <li><span>Wahr / Falsch</span><b>5</b></li><li><span>CREATE TABLE wählen</span><b>5</b></li>
          </ul>
          <p class="small muted">ERM, Tabellen und SQL bewertest du nach der Abgabe selbst mit Musterlösung und Checkliste. Tipp: ERM auf Papier zeichnen.</p>
          <a class="btn btn-primary btn-lg" href="#/pruefung?mode=full">Simulation starten</a>
        </section>
        <section class="card mode-card">
          <h2>⚡ Schnelltest</h2>
          <form id="quick-form" class="form">
            <label>Fragen <select name="n">${[10, 20, 30, 40].map((n) => `<option ${n === 20 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label>Zeit (Minuten) <select name="min">${[10, 20, 30, 45].map((n) => `<option ${n === 20 ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
            <label>Niveau <select name="l"><option value="">gemischt</option><option value="4">nur klausurähnlich</option><option value="3,4">schwer + klausurähnlich</option></select></label>
            <p class="small muted">Punkte: einfach 1 · mittel 2 · schwer/klausurähnlich 3. Feedback erst nach Abgabe.</p>
            <button class="btn btn-primary btn-lg" type="submit">Schnelltest starten</button>
          </form>
        </section>
      </div>
      <section class="card">
        <h2>Bisherige Prüfungen</h2>
        ${hist.length ? `<table class="table"><thead><tr><th>Datum</th><th>Art</th><th>Punkte</th><th>Quote</th><th>Zeit</th></tr></thead><tbody>
          ${hist.map((e) => `<tr><td>${fmtDateTime(e.date)}</td><td>${e.mode === 'full' ? 'Simulation' : 'Schnelltest'}</td><td>${e.score.toFixed(1)}/${e.max}</td><td>${pct(e.score / e.max)}</td><td>${fmtDuration(e.duration)}</td></tr>`).join('')}
        </tbody></table>` : '<p class="muted">Noch keine Prüfungen absolviert.</p>'}
      </section>`;
    $('#quick-form', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      location.hash = `#/pruefung?mode=quick&n=${fd.get('n')}&min=${fd.get('min')}${fd.get('l') ? '&l=' + fd.get('l') : ''}`;
    });
  }

  /* ───────── Zusammenstellung ───────── */
  function startQuick() {
    const n = +(query.get('n') || 20), min = +(query.get('min') || 20);
    const levels = query.get('l') ? query.get('l').split(',').map(Number) : [];
    const pool = Q.filter((q) => !levels.length || levels.includes(q.l));
    const items = shuffle(pool).slice(0, n).map((q) => ({ type: 'q', ref: q, pts: LEVEL_POINTS[q.l], section: 'Fragen' }));
    runExam({ mode: 'quick', title: 'Schnelltest', minutes: min, items });
  }

  function startFull() {
    const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const ermId = pickOne(['task-erm-schule', 'task-erm-getraenke']);
    const tabId = ermId === 'task-erm-schule' ? 'task-tab-schule' : 'task-tab-getraenke';
    const nfSet = pickOne([['nf-07', 'nf-08', 'nf-09', 'nf-10', 'nf-11'], ['nf-12', 'nf-13', 'nf-14', 'nf-15', 'nf-16']]);
    const sqlTasks = shuffle(T.filter((t) => t.kind === 'sql' && t.schema)).slice(0, 8);
    const tfQs = shuffle(Q.filter((q) => q.y === 'tf' && q.l >= 2)).slice(0, 5);
    const ddl = pickOne(['der-11', 'der-12']);
    const byId = (id) => Q.find((q) => q.id === id);
    const items = [
      { type: 'task', ref: T.find((t) => t.id === ermId), pts: 30, section: '1 · ERM' },
      { type: 'task', ref: T.find((t) => t.id === tabId), pts: 15, section: '2 · Tabellen' },
      ...nfSet.map((id) => ({ type: 'q', ref: byId(id), pts: 1, section: '3 · Normalisierung' })),
      ...sqlTasks.map((t) => ({ type: 'task', ref: t, pts: 5, section: '4 · SQL' })),
      ...tfQs.map((q) => ({ type: 'q', ref: q, pts: 1, section: '5 · Wahr/Falsch' })),
      { type: 'q', ref: byId(ddl), pts: 5, section: '6 · CREATE TABLE' }
    ];
    runExam({ mode: 'full', title: 'Klausur-Simulation', minutes: 90, items });
  }

  /* ───────── Durchführung ───────── */
  function runExam(exam) {
    const { items } = exam;
    const max = items.reduce((s, it) => s + it.pts, 0);
    const started = Date.now();
    const endAt = started + exam.minutes * 60 * 1000;
    let cur = 0;

    DBT.app.leaveGuard = () => confirm('Prüfung abbrechen? Dein Fortschritt in dieser Prüfung geht verloren.');
    window.onbeforeunload = (e) => { e.preventDefault(); e.returnValue = ''; };

    root.innerHTML = `
      <div class="exam-bar">
        <strong>${exam.title}</strong>
        <span class="timer" id="timer" aria-live="off">--:--</span>
        <button class="btn btn-primary btn-sm" id="submit">Abgeben</button>
      </div>
      <nav class="exam-nav" id="exam-nav" aria-label="Aufgabenübersicht">
        ${items.map((it, i) => `<button class="nav-dot" data-go="${i}" title="${esc(it.section)}">${i + 1}</button>`).join('')}
      </nav>
      <p class="exam-section muted small" id="sec"></p>
      <div id="items">${items.map((_, i) => `<article class="card q-card exam-item" data-i="${i}" hidden></article>`).join('')}</div>
      <div class="quiz-actions">
        <button class="btn" id="prev">← Zurück</button>
        <span class="muted small" id="pos"></span>
        <button class="btn btn-primary" id="next">Weiter →</button>
      </div>`;

    const containers = $$('.exam-item', root);
    const mounted = items.map((it, i) => it.type === 'q'
      ? DBT.question.mount(it.ref, containers[i], { onChange: refreshNav })
      : DBT.task.mount(it.ref, containers[i], { practice: false }));
    containers.forEach((c, i) => {
      if (items[i].type === 'q') c.querySelector('.q-meta')?.insertAdjacentHTML('beforeend', `<span class="chip chip-pts">${items[i].pts} P.</span>`);
      c.addEventListener('input', refreshNav);
    });

    function answered(i) {
      return items[i].type === 'q' ? mounted[i].isAnswered() : mounted[i].getAnswer().trim().length > 0;
    }
    function refreshNav() {
      $$('.nav-dot', root).forEach((d, i) => { d.classList.toggle('done', answered(i)); d.classList.toggle('cur', i === cur); });
    }
    function go(i) {
      cur = Math.max(0, Math.min(items.length - 1, i));
      containers.forEach((c, k) => { c.hidden = k !== cur; });
      $('#sec', root).textContent = `Teil ${items[cur].section}`;
      $('#pos', root).textContent = `${cur + 1} / ${items.length}`;
      $('#prev', root).disabled = cur === 0;
      $('#next', root).textContent = cur === items.length - 1 ? 'Abgeben' : 'Weiter →';
      refreshNav();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    $('#exam-nav', root).addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) go(+b.dataset.go); });
    $('#prev', root).addEventListener('click', () => go(cur - 1));
    $('#next', root).addEventListener('click', () => (cur === items.length - 1 ? submit() : go(cur + 1)));
    $('#submit', root).addEventListener('click', () => submit());

    function tick() {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      const el = $('#timer', root);
      if (!el) return;
      el.textContent = `⏱ ${fmtDuration(left)}`;
      el.classList.toggle('warn', left <= 300);
      if (left === 0) { DBT.util.toast('Zeit abgelaufen – Prüfung wird abgegeben'); submit(true); }
    }
    timer = setInterval(tick, 1000);
    tick();
    go(0);

    function submit(force = false) {
      const open = items.filter((_, i) => !answered(i)).length;
      if (!force && !confirm(open ? `Noch ${open} Aufgabe(n) unbeantwortet. Trotzdem abgeben?` : 'Prüfung jetzt abgeben?')) return;
      clearInterval(timer);
      const duration = Math.round((Date.now() - started) / 1000);
      const taskIdx = items.map((it, i) => (it.type === 'task' ? i : -1)).filter((i) => i >= 0);
      const answers = mounted.map((m, i) => (items[i].type === 'task' ? m.getAnswer() : null));
      // Auto-Bewertung der geschlossenen Fragen (+ Leitner)
      const autoRes = items.map((it, i) => {
        if (it.type !== 'q') return null;
        const res = mounted[i].isAnswered() ? mounted[i].evaluate() : { correct: false, score: 0 };
        DBT.srs.review('q', it.ref.id, res.correct);
        return res;
      });
      if (taskIdx.length) gradeTasks(exam, items, answers, autoRes, duration, mounted, containers);
      else showResult(exam, items, autoRes, [], duration, containers, mounted);
    }
  }

  /* ───────── Selbstbewertung offener Aufgaben ───────── */
  function gradeTasks(exam, items, answers, autoRes, duration, mounted, containers) {
    const tIdx = items.map((it, i) => (it.type === 'task' ? i : -1)).filter((i) => i >= 0);
    root.innerHTML = `
      <div class="page-head"><h1>Selbstbewertung</h1><p class="muted">Vergleiche deine Antworten mit der Musterlösung und hake die erfüllten Kriterien ab. Danach siehst du dein Gesamtergebnis.</p></div>
      <div id="grade-list">${tIdx.map((i) => `<article class="card q-card" data-gi="${i}"></article>`).join('')}</div>
      <div class="sticky-cta"><button class="btn btn-primary btn-lg" id="finish">Ergebnis berechnen</button></div>`;
    const graders = {};
    tIdx.forEach((i) => {
      graders[i] = DBT.task.mount(items[i].ref, root.querySelector(`[data-gi="${i}"]`), { phase: 'grade', answer: answers[i] });
    });
    $('#finish', root).addEventListener('click', () => {
      const taskPts = tIdx.map((i) => ({ i, pts: graders[i].points() }));
      taskPts.forEach(({ i, pts }) => DBT.store.update((s) => {
        const r = s.tasks[items[i].ref.id] || { best: 0, attempts: 0 };
        r.attempts++; r.last = pts; r.best = Math.max(r.best, pts); r.date = Date.now();
        s.tasks[items[i].ref.id] = r;
      }));
      showResult(exam, items, autoRes, taskPts, duration, containers, mounted);
    });
  }

  /* ───────── Ergebnisanalyse ───────── */
  function showResult(exam, items, autoRes, taskPts, duration, containers, mounted) {
    cleanup();
    const ptsOf = (i) => (items[i].type === 'q' ? autoRes[i].score * items[i].pts : (taskPts.find((t) => t.i === i)?.pts || 0));
    const score = items.reduce((s, _, i) => s + ptsOf(i), 0);
    const max = items.reduce((s, it) => s + it.pts, 0);
    const bySection = {}, byTopic = {};
    items.forEach((it, i) => {
      (bySection[it.section] ||= { s: 0, m: 0 }); bySection[it.section].s += ptsOf(i); bySection[it.section].m += it.pts;
      const t = it.ref.t;
      (byTopic[t] ||= { s: 0, m: 0 }); byTopic[t].s += ptsOf(i); byTopic[t].m += it.pts;
    });
    DBT.store.update((s) => {
      s.exams.push({ date: Date.now(), mode: exam.mode, score, max, duration, byTopic });
      DBT.store.logActivity(3);
    });
    const ratio = score / max;
    const weakest = Object.entries(byTopic).filter(([, v]) => v.m > 0).sort((a, b) => a[1].s / a[1].m - b[1].s / b[1].m).slice(0, 3);
    const wrongQ = items.map((it, i) => ({ it, i })).filter(({ it, i }) => it.type === 'q' && !autoRes[i].correct);

    root.innerHTML = `
      <section class="card result">
        <div class="result-head">
          ${DBT.util.ring(ratio, 140, 12, 'Ergebnis')}
          <div>
            <p class="eyebrow">${esc(exam.title)} · ${fmtDuration(duration)} min benötigt</p>
            <h1>${score.toFixed(1).replace('.', ',')} / ${max} Punkte</h1>
            <p class="lead">${pct(ratio)} erreicht</p>
            <p class="small muted">Eine Notenskala ist in den Unterlagen nicht angegeben – daher wird keine Note berechnet.</p>
          </div>
        </div>
        <div class="grid-2">
          <div><h2>Nach Aufgabenteil</h2><div class="topic-bars">${Object.entries(bySection).map(([k, v]) => `<div class="tb-row"><span>${esc(k)}</span>${bar(v.s / v.m)}<span class="small muted">${v.s.toFixed(1).replace('.', ',')}/${v.m}</span></div>`).join('')}</div></div>
          <div><h2>Nach Thema</h2><div class="topic-bars">${Object.entries(byTopic).map(([k, v]) => `<div class="tb-row"><span>${esc(DBT.question.topicTitle(k))}</span>${bar(v.s / v.m)}<span class="small muted">${pct(v.s / v.m)}</span></div>`).join('')}</div></div>
        </div>
        ${weakest.length ? `<aside class="callout warn"><b>Empfehlung</b><p>Am meisten Punkte verloren hast du bei: ${weakest.map(([t]) => `<a href="#/lernen/${t}">${esc(DBT.question.topicTitle(t))}</a>`).join(', ')}. Diese Themen werden im Smart-Training jetzt stärker gewichtet.</p></aside>` : ''}
        <div class="row-actions">
          ${wrongQ.length ? `<a class="btn btn-primary" href="#/quiz?ids=${wrongQ.map(({ it }) => it.ref.id).join(',')}">❌ Fehler als Quiz wiederholen</a>` : ''}
          <a class="btn" href="#/pruefung">Neue Prüfung</a>
          <a class="btn btn-ghost" href="#/statistik">Statistik</a>
        </div>
      </section>
      ${items.some((it) => it.type === 'q') ? `<section class="card"><h2>Lösungen der automatisch bewerteten Fragen</h2><div id="review"></div></section>` : ''}`;

    const review = $('#review', root);
    if (review) {
      items.forEach((it, i) => {
        if (it.type !== 'q') return;
        const c = containers[i];
        c.hidden = false;
        mounted[i].reveal();
        review.appendChild(c);
      });
    }
  }
};
