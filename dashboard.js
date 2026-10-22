/**
 * Startseite: Fortschritt, fällige Wiederholungen, Schwachstellen, Klausurstruktur, Themenübersicht.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.dashboard = (root) => {
  const { esc, ring, bar, pct } = DBT.util;
  const ov = DBT.srs.overall();
  const dueQ = DBT.srs.dueCount('q');
  const dueC = DBT.srs.dueCount('c');
  const streak = DBT.store.streak();
  const ranking = DBT.srs.topicRanking();
  const exams = DBT.store.get().exams;
  const lastExam = exams[exams.length - 1];
  const hour = new Date().getHours();
  const greet = hour < 11 ? 'Guten Morgen' : hour < 18 ? 'Hallo' : 'Guten Abend';

  const weak = ranking.filter((r) => r.stats.attempts > 0).slice(0, 3);
  const fresh = !ov.attempts;

  root.innerHTML = `
  <section class="hero card">
    <div class="hero-main">
      <p class="eyebrow">${greet} 👋</p>
      <h1>Datenbanken – Klausurtrainer</h1>
      <p class="muted">Alle Inhalte stammen ausschließlich aus deinem Vorlesungsskript, den Übungsblättern und den beiden Klausuren (2023 / Probeklausur 2024).</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="#/quiz?mode=smart&n=10">${fresh ? '🚀 Jetzt starten' : '⚡ Smart-Training (10)'}</a>
        <a class="btn" href="#/quiz?mode=due&n=20" ${dueQ ? '' : 'aria-disabled="true"'}>🔁 Wiederholen <span class="badge">${dueQ}</span></a>
        <a class="btn" href="#/pruefung">⏱️ Prüfung simulieren</a>
      </div>
    </div>
    <div class="hero-ring">${ring(ov.mastery, 132, 12, 'Gesamtfortschritt')}<span class="muted small">Gesamt-Mastery</span></div>
  </section>

  <section class="focus-cards">
    <a class="focus card f-erm" href="#/erm"><span class="focus-ico">🧩</span><div><b>ERM-Werkstatt</b><span>kommt zu 100 % · 30 P.</span></div><span class="focus-go">→</span></a>
    <a class="focus card f-sql" href="#/sql"><span class="focus-ico">🧪</span><div><b>SQL-Labor</b><span>${(DBT.store.get().sql ? Object.values(DBT.store.get().sql).filter((x) => x.solved).length : 0)}/${DBT.data.sqlExercises.length} gelöst · 40 P.</span></div><span class="focus-go">→</span></a>
    <a class="focus card f-nosql" href="#/nosql"><span class="focus-ico">🌐</span><div><b>NoSQL & CAP</b><span>laut Dozent sehr wichtig</span></div><span class="focus-go">→</span></a>
  </section>

  <section class="kpis">
    <div class="kpi card"><span class="kpi-val">🔥 ${streak}</span><span class="kpi-lbl">Tage in Folge</span></div>
    <div class="kpi card"><span class="kpi-val">${ov.seenQ}/${ov.totalQ}</span><span class="kpi-lbl">Fragen gesehen</span></div>
    <div class="kpi card"><span class="kpi-val">${ov.accuracy === null ? '–' : pct(ov.accuracy)}</span><span class="kpi-lbl">Erfolgsquote</span></div>
    <div class="kpi card"><span class="kpi-val">${dueQ + dueC}</span><span class="kpi-lbl">fällig (Fragen + Karten)</span></div>
  </section>

  <div class="grid-2">
    <section class="card">
      <h2>🎯 So ist die Klausur aufgebaut</h2>
      <p class="muted small">Beide vorliegenden Klausuren (06.02.2023 und 19.07.2024): 90 Minuten, gleiche Struktur.</p>
      <ul class="exam-structure">
        <li><span>1 · ER-Modell erstellen</span><b>30 P.</b></li>
        <li><span>2 · Tabellen aus dem ERM ableiten</span><b>15 P.</b></li>
        <li><span>3 · Normalisierung (5 Tabellen)</span><b>5 P.</b></li>
        <li><span>4 · 8 SQL-Statements à 5 P.</span><b>40 P.</b></li>
        <li><span>5 · Begriffe / Wahr-Falsch</span><b>5 P.</b></li>
        <li><span>6 · Richtiges CREATE TABLE wählen</span><b>5 P.</b></li>
      </ul>
      <p class="small">➡️ <b>85 von 100 Punkten</b> entfallen auf ERM, Tabellenableitung und SQL. Dort liegt der Fokus dieses Trainers.</p>
      <div class="row-actions"><a class="btn btn-sm" href="#/aufgaben">Klausuraufgaben üben</a><a class="btn btn-sm" href="#/pruefung">Klausur-Simulation</a></div>
    </section>

    <section class="card">
      <h2>🩺 Deine Schwachstellen</h2>
      ${weak.length ? `<ol class="weak-list">${weak.map((r) => `
        <li>
          <div class="weak-head"><span>${r.topic.icon} ${esc(r.topic.title)}</span><span class="muted small">${r.stats.accuracy === null ? '–' : pct(r.stats.accuracy)} richtig</span></div>
          ${bar(r.stats.mastery)}
          <div class="row-actions"><a class="btn btn-sm" href="#/quiz?t=${r.topic.id}&mode=smart&n=10">Gezielt üben</a><a class="btn btn-sm btn-ghost" href="#/lernen/${r.topic.id}">Nachlesen</a></div>
        </li>`).join('')}</ol>` : `<p class="muted">Noch keine Daten. Beantworte ein paar Fragen – dann erkennt der Trainer automatisch, wo du Wiederholungsbedarf hast.</p>
        <a class="btn btn-sm" href="#/quiz?mode=smart&n=10">Erste Runde starten</a>`}
      ${lastExam ? `<p class="small muted">Letzte Prüfung: ${DBT.util.fmtDate(lastExam.date)} · <b>${lastExam.score.toFixed(1)}/${lastExam.max} P.</b> (${pct(lastExam.score / lastExam.max)})</p>` : ''}
    </section>
  </div>

  <section>
    <div class="section-head"><h2>📚 Themen</h2><a class="link" href="#/lernen">Alle Kapitel →</a></div>
    <div class="topic-grid">
      ${DBT.data.topics.map((t) => {
        const st = DBT.srs.topicStats(t.id);
        const done = DBT.store.get().done[t.id];
        return `<a class="topic-card card" href="#/lernen/${t.id}">
          <div class="topic-top"><span class="topic-icon">${t.icon}</span><span class="relevance" title="Klausurrelevanz ${t.relevance}/5">${DBT.util.stars(t.relevance)}</span></div>
          <h3>${esc(t.title)}</h3>
          <p class="muted small">Kap. ${t.nr} · ${st.total} Fragen${done ? ' · ✅ gelernt' : ''}</p>
          ${bar(st.mastery)}
        </a>`;
      }).join('')}
    </div>
  </section>`;
};
