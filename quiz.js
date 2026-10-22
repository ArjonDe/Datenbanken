/**
 * Quiz-Modus: Konfiguration (Themen, Niveau, Fragetyp, Modus, Anzahl) und Durchlauf
 * mit sofortigem Feedback, Erklärung, Fundstelle und Leitner-Bewertung.
 *
 * Direktstart per URL, z.B. #/quiz?t=joins,select&mode=smart&n=10&l=4  oder  #/quiz?ids=sel-01,sel-02
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.quiz = (root, params, query) => {
  const { esc, $, $$, bar, pct } = DBT.util;
  const topics = DBT.data.topics;

  const startDirect = query.has('mode') || query.has('ids');
  if (!startDirect) return renderSetup();
  return run(buildSet());

  function buildSet() {
    if (query.get('ids')) {
      const ids = query.get('ids').split(',');
      return ids.map((id) => DBT.data.questions.find((q) => q.id === id)).filter(Boolean);
    }
    const opts = {
      topics: query.get('t') ? query.get('t').split(',') : [],
      levels: query.get('l') ? query.get('l').split(',').map(Number) : [],
      types: query.get('y') ? query.get('y').split(',') : [],
      count: Math.max(1, Math.min(100, +(query.get('n') || 10))),
      mode: query.get('mode') || 'smart'
    };
    return DBT.srs.pick(DBT.data.questions, 'q', opts);
  }

  /* ───────── Setup ───────── */
  function renderSetup() {
    const dueQ = DBT.srs.dueCount('q');
    root.innerHTML = `
      <div class="page-head"><h1>Quiz</h1><p class="muted">Stelle dir eine Übungsrunde zusammen. Falsch beantwortete Fragen wandern zurück in Box 1 und kommen häufiger dran.</p></div>
      <form class="card form" id="quiz-form">
        <fieldset>
          <legend>Modus</legend>
          <div class="seg">
            ${[['smart', '⚡ Smart', 'Fällige + Schwachstellen + Neues'], ['due', `🔁 Fällig (${dueQ})`, 'Nur fällige Wiederholungen'], ['new', '🆕 Neu', 'Nur unbekannte Fragen'], ['wrong', '❌ Fehler', 'Bisher falsch beantwortete'], ['random', '🎲 Zufall', 'Rein zufällig']]
              .map(([v, l, d], i) => `<label class="seg-opt" title="${d}"><input type="radio" name="mode" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}
          </div>
        </fieldset>
        <fieldset>
          <legend>Themen <button type="button" class="link small" id="all-topics">alle / keine</button></legend>
          <div class="checks">
            ${topics.map((t) => `<label class="check"><input type="checkbox" name="t" value="${t.id}"><span>${t.icon} ${esc(t.short)} <small class="muted">(${DBT.data.questions.filter((q) => q.t === t.id).length})</small></span></label>`).join('')}
          </div>
          <p class="hint">Keine Auswahl = alle Themen.</p>
        </fieldset>
        <div class="grid-2">
          <fieldset>
            <legend>Niveau</legend>
            <div class="checks">${[1, 2, 3, 4].map((l) => `<label class="check"><input type="checkbox" name="l" value="${l}"><span class="chip lvl-${l}">${DBT.question.LEVEL_LABEL[l]}</span></label>`).join('')}</div>
          </fieldset>
          <fieldset>
            <legend>Fragetyp</legend>
            <div class="checks">${Object.entries(DBT.question.TYPE_LABEL).map(([k, v]) => `<label class="check"><input type="checkbox" name="y" value="${k}"><span>${v}</span></label>`).join('')}</div>
          </fieldset>
        </div>
        <fieldset>
          <legend>Anzahl Fragen: <output id="n-out">10</output></legend>
          <input type="range" name="n" min="5" max="50" step="5" value="10" id="n-range">
        </fieldset>
        <button class="btn btn-primary btn-lg" type="submit">Quiz starten</button>
      </form>`;

    $('#n-range', root).addEventListener('input', (e) => { $('#n-out', root).textContent = e.target.value; });
    $('#all-topics', root).addEventListener('click', () => {
      const boxes = $$('input[name=t]', root);
      const anyOff = boxes.some((b) => !b.checked);
      boxes.forEach((b) => { b.checked = anyOff; });
    });
    $('#quiz-form', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const qs = new URLSearchParams();
      qs.set('mode', fd.get('mode'));
      qs.set('n', fd.get('n'));
      ['t', 'l', 'y'].forEach((k) => { const v = fd.getAll(k); if (v.length) qs.set(k, v.join(',')); });
      location.hash = `#/quiz?${qs}`;
    });
  }

  /* ───────── Durchlauf ───────── */
  function run(set) {
    if (!set.length) {
      root.innerHTML = `<div class="card empty"><h2>Keine passenden Fragen</h2><p class="muted">Für diese Auswahl gibt es (gerade) keine Fragen – z.B. weil nichts fällig ist oder noch keine Fehler vorliegen.</p><a class="btn btn-primary" href="#/quiz">Auswahl ändern</a></div>`;
      return;
    }
    let i = 0, score = 0;
    const results = [];
    let qc = null, checked = false;

    root.innerHTML = `
      <div class="quiz-top">
        <a class="btn btn-ghost btn-sm" href="#/quiz" aria-label="Quiz beenden">✕</a>
        <div class="quiz-progress">${bar(0, 'bar-lg')}</div>
        <span class="quiz-count" aria-live="polite"></span>
      </div>
      <article class="card q-card" id="q-root" tabindex="-1"></article>
      <div class="quiz-actions">
        <span class="muted small kbd-hint">Tastatur: <kbd>1</kbd>–<kbd>9</kbd> wählen · <kbd>Enter</kbd> prüfen/weiter</span>
        <button class="btn btn-primary btn-lg" id="q-btn" disabled>Prüfen</button>
      </div>`;
    const qRoot = $('#q-root', root), btn = $('#q-btn', root);

    function show() {
      const q = set[i];
      checked = false;
      btn.textContent = 'Prüfen';
      btn.disabled = true;
      $('.quiz-count', root).textContent = `${i + 1} / ${set.length}`;
      $('.quiz-progress .bar span', root).style.width = `${(i / set.length) * 100}%`;
      qRoot.classList.remove('pop'); void qRoot.offsetWidth; qRoot.classList.add('pop');
      qc = DBT.question.mount(q, qRoot, { onChange: () => { btn.disabled = !qc.isAnswered(); } });
      // Fokus nicht auf dem (jetzt deaktivierten) Button lassen
      if (!qRoot.contains(document.activeElement)) qRoot.focus({ preventScroll: true });
    }

    function check() {
      const q = set[i];
      const res = qc.reveal();
      checked = true;
      score += res.score;
      results.push({ q, ...res });
      DBT.srs.review('q', q.id, res.correct);
      btn.textContent = i + 1 < set.length ? 'Weiter →' : 'Auswertung';
      btn.disabled = false;
      btn.focus();
      qRoot.querySelector('.feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function next() {
      i++;
      if (i < set.length) show(); else finish();
    }

    btn.addEventListener('click', () => (checked ? next() : check()));

    const onKey = (e) => {
      if (!qc || e.target.closest('a, .topbar, .sidenav')) return;
      if (e.target.matches('input, select, textarea') && e.key !== 'Enter') return;
      if (/^[1-9]$/.test(e.key) && !checked) qc.choose(+e.key);
      else if (e.key === 'Enter' && !btn.disabled) { e.preventDefault(); btn.click(); }
    };
    document.addEventListener('keydown', onKey);

    function finish() {
      document.removeEventListener('keydown', onKey);
      const ratio = score / set.length;
      const wrong = results.filter((r) => !r.correct);
      const byTopic = {};
      results.forEach((r) => { (byTopic[r.q.t] ||= { n: 0, s: 0 }); byTopic[r.q.t].n++; byTopic[r.q.t].s += r.score; });
      const msg = ratio >= 0.9 ? 'Hervorragend! 🏆' : ratio >= 0.7 ? 'Stark! 💪' : ratio >= 0.5 ? 'Solide – dranbleiben! 📈' : 'Wiederholung lohnt sich 🔁';
      root.innerHTML = `
        <section class="card result">
          <div class="result-head">
            ${DBT.util.ring(ratio, 140, 12, 'Ergebnis')}
            <div><h1>${msg}</h1><p class="lead">${score.toFixed(1).replace('.0', '')} von ${set.length} Punkten (${pct(ratio)})</p></div>
          </div>
          <h2>Nach Thema</h2>
          <div class="topic-bars">${Object.entries(byTopic).map(([t, v]) => `<div class="tb-row"><span>${esc(DBT.question.topicTitle(t))}</span>${bar(v.s / v.n)}<span class="small muted">${Math.round(v.s * 10) / 10}/${v.n}</span></div>`).join('')}</div>
          <div class="row-actions">
            ${wrong.length ? `<a class="btn btn-primary" href="#/quiz?ids=${wrong.map((r) => r.q.id).join(',')}&r=${Date.now()}">❌ ${wrong.length} Fehler wiederholen</a>` : ''}
            <a class="btn" href="#/quiz?mode=smart&n=10&r=${Date.now()}">⚡ Neue Smart-Runde</a>
            <a class="btn btn-ghost" href="#/statistik">Statistik</a>
          </div>
        </section>
        <section class="card">
          <h2>Deine Antworten</h2>
          <ol class="review-list">${results.map((r) => `<li class="${r.correct ? 'ok' : r.score > 0 ? 'partial' : 'bad'}"><span class="rv-icon">${r.correct ? '✓' : r.score > 0 ? '◐' : '✗'}</span><div><div class="rv-q">${r.q.q}</div><div class="small muted">📖 ${esc(r.q.s)}</div></div></li>`).join('')}</ol>
        </section>`;
    }

    show();
    return () => document.removeEventListener('keydown', onKey);
  }
};
