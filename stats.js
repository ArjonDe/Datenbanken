/**
 * Lernanalytik: Kennzahlen, Themen-Ranking nach Wiederholungsbedarf, Fehleranalyse,
 * Leitner-Verteilung, Aktivität, Prüfungsverlauf, Datensicherung.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.stats = (root) => {
  const { esc, $, bar, pct, ring, fmtDate, toast, dayKey, DAY } = DBT.util;
  const s = DBT.store.get();
  const ov = DBT.srs.overall();
  const ranking = DBT.srs.topicRanking();
  const distQ = DBT.srs.boxDistribution('q');
  const distC = DBT.srs.boxDistribution('c');

  // Fehleranalyse: Fragen mit den meisten Fehlversuchen
  const errors = DBT.data.questions
    .map((q) => ({ q, it: s.q[q.id] }))
    .filter((x) => x.it && x.it.wrong > 0)
    .sort((a, b) => (b.it.wrong - b.it.right * 0.5) - (a.it.wrong - a.it.right * 0.5))
    .slice(0, 12);

  // Aktivität der letzten 28 Tage
  const days = Array.from({ length: 28 }, (_, k) => {
    const ts = Date.now() - (27 - k) * DAY;
    return { key: dayKey(ts), n: s.days[dayKey(ts)] || 0, ts };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.n));

  // Prüfungsverlauf als kleines SVG-Liniendiagramm
  const exams = s.exams.slice(-12);
  const chart = exams.length >= 2 ? (() => {
    const W = 600, H = 160, P = 24;
    const pts = exams.map((e, k) => [P + (k * (W - 2 * P)) / (exams.length - 1), H - P - (e.score / e.max) * (H - 2 * P)]);
    return `<svg viewBox="0 0 ${W} ${H}" class="line-chart" role="img" aria-label="Verlauf der Prüfungsergebnisse">
      ${[0, 0.5, 1].map((g) => `<line x1="${P}" x2="${W - P}" y1="${H - P - g * (H - 2 * P)}" y2="${H - P - g * (H - 2 * P)}" class="grid"/><text x="2" y="${H - P - g * (H - 2 * P) + 4}" class="axis">${g * 100}%</text>`).join('')}
      <polyline points="${pts.map((p) => p.join(',')).join(' ')}" class="line"/>
      ${pts.map((p, k) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" class="dot"><title>${fmtDate(exams[k].date)}: ${pct(exams[k].score / exams[k].max)}</title></circle>`).join('')}
    </svg>`;
  })() : '<p class="muted small">Ab zwei Prüfungen erscheint hier dein Verlauf.</p>';

  const taskEntries = Object.entries(s.tasks);
  const taskPts = taskEntries.reduce((a, [id, r]) => a + r.best, 0);
  const taskMax = taskEntries.reduce((a, [id]) => a + (DBT.data.tasks.find((t) => t.id === id)?.points || 0), 0);

  root.innerHTML = `
    <div class="page-head"><h1>Statistik</h1><p class="muted">Dein Lernstand – alles lokal in deinem Browser gespeichert.</p></div>

    <section class="kpis">
      <div class="kpi card"><span class="kpi-val">${ov.attempts}</span><span class="kpi-lbl">Antworten gesamt</span></div>
      <div class="kpi card"><span class="kpi-val">${ov.accuracy === null ? '–' : pct(ov.accuracy)}</span><span class="kpi-lbl">Erfolgsquote</span></div>
      <div class="kpi card"><span class="kpi-val">${Object.keys(s.done).length}/${DBT.data.topics.length}</span><span class="kpi-lbl">Kapitel gelernt</span></div>
      <div class="kpi card"><span class="kpi-val">${taskEntries.length ? pct(taskPts / taskMax) : '–'}</span><span class="kpi-lbl">Klausuraufgaben (${taskEntries.length}/${DBT.data.tasks.length})</span></div>
    </section>

    <div class="grid-2">
      <section class="card center">
        <h2>Mastery</h2>
        ${ring(ov.mastery, 150, 14, 'Mastery')}
        <p class="small muted">Mittlere Leitner-Box über alle ${DBT.data.questions.length} Fragen und ${DBT.data.flashcards.length} Karten (Box 5 = sicher).</p>
      </section>
      <section class="card">
        <h2>Leitner-Boxen</h2>
        ${[['Fragen', distQ], ['Karten', distC]].map(([label, d]) => `
          <p class="small"><b>${label}</b></p>
          <div class="boxes">${d.map((n, b) => `<div class="box-col"><div class="box-bar" style="height:${n ? 8 + (n / Math.max(1, ...d)) * 72 : 3}px" title="${n}"></div><span class="small">${n}</span><span class="tiny muted">${b === 0 ? 'neu' : 'Box ' + b}</span></div>`).join('')}</div>`).join('')}
        <p class="tiny muted">Wiederholung nach: Box 1 sofort · 2 → 1 Tag · 3 → 3 Tage · 4 → 7 Tage · 5 → 14 Tage. Fehler → zurück in Box 1.</p>
      </section>
    </div>

    <section class="card">
      <div class="section-head"><h2>🏁 Themen-Ranking nach Wiederholungsbedarf</h2></div>
      <p class="small muted">Kombiniert Fehlerquote, Lernstand und Klausurrelevanz. Oben = zuerst wiederholen.</p>
      <div class="table-wrap"><table class="table rank">
        <thead><tr><th>#</th><th>Thema</th><th>Relevanz</th><th>Quote</th><th>Mastery</th><th>fällig</th><th></th></tr></thead>
        <tbody>${ranking.map((r, k) => `<tr>
          <td>${k + 1}</td>
          <td><a href="#/lernen/${r.topic.id}">${r.topic.icon} ${esc(r.topic.title)}</a></td>
          <td class="relevance">${DBT.util.stars(r.topic.relevance)}</td>
          <td>${r.stats.accuracy === null ? '–' : pct(r.stats.accuracy)}</td>
          <td class="w-bar">${bar(r.stats.mastery)}</td>
          <td>${r.stats.due}</td>
          <td><a class="btn btn-sm" href="#/quiz?t=${r.topic.id}&mode=smart&n=10">Üben</a></td>
        </tr>`).join('')}</tbody>
      </table></div>
    </section>

    <section class="card">
      <h2>🔍 Fehleranalyse</h2>
      ${errors.length ? `<ol class="review-list">${errors.map(({ q, it }) => `<li class="bad"><span class="rv-icon">${it.wrong}×</span><div><div class="rv-q">${q.q}</div><div class="small muted">${esc(DBT.question.topicTitle(q.t))} · ✓ ${it.right} / ✗ ${it.wrong} · Box ${it.box} · 📖 ${esc(q.s)}</div></div></li>`).join('')}</ol>
        <a class="btn btn-primary" href="#/quiz?ids=${errors.map((x) => x.q.id).join(',')}">Diese ${errors.length} Fragen üben</a>` : '<p class="muted">Noch keine Fehler erfasst. 👍</p>'}
    </section>

    <div class="grid-2">
      <section class="card">
        <h2>📅 Aktivität (28 Tage)</h2>
        <div class="heat">${days.map((d) => `<span class="heat-cell" style="--a:${d.n ? 0.25 + 0.75 * (d.n / maxDay) : 0}" title="${fmtDate(d.ts)}: ${d.n} Aktionen"></span>`).join('')}</div>
        <p class="small muted">🔥 Serie: ${DBT.store.streak()} Tag(e)</p>
      </section>
      <section class="card">
        <h2>📈 Prüfungsverlauf</h2>
        ${chart}
      </section>
    </div>

    <section class="card">
      <h2>💾 Daten</h2>
      <p class="small muted">Fortschritt als Datei sichern oder auf einem anderen Gerät wiederherstellen.</p>
      <div class="row-actions">
        <button class="btn" id="export">Exportieren</button>
        <label class="btn">Importieren<input type="file" id="import" accept="application/json" hidden></label>
        <button class="btn btn-bad" id="reset">Fortschritt zurücksetzen</button>
      </div>
    </section>`;

  $('#export', root).addEventListener('click', () => {
    const blob = new Blob([DBT.store.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `db-trainer-backup-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#import', root).addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { DBT.store.importJSON(await f.text()); toast('Fortschritt importiert ✓'); DBT.views.stats(root); }
    catch (err) { toast('Import fehlgeschlagen: ' + err.message); }
  });
  $('#reset', root).addEventListener('click', () => {
    if (confirm('Wirklich den gesamten Lernfortschritt löschen? Das kann nicht rückgängig gemacht werden.')) {
      DBT.store.reset();
      toast('Fortschritt zurückgesetzt');
      DBT.views.stats(root);
    }
  });
};
