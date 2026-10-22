/**
 * Lernmodus: Kapitelübersicht und Kapitelansicht mit Zusammenfassung, Stichpunkten,
 * Definitionen, Code-Beispielen, typischen Fehlern und Klausurhinweisen.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.learn = (root, params) => {
  const { esc, bar, codeBlock, stars, toast } = DBT.util;
  const topics = DBT.data.topics;

  if (!params.id) {
    root.innerHTML = `
      <div class="page-head"><h1>Lernmodus</h1><p class="muted">Kapitelstruktur entlang des Skripts. Sternchen = Klausurrelevanz (abgeleitet aus der Punkteverteilung der Klausuren und der Modulbeschreibung).</p></div>
      <div class="chapter-list">
        ${topics.map((t) => {
          const st = DBT.srs.topicStats(t.id);
          const done = DBT.store.get().done[t.id];
          return `<a class="chapter card" href="#/lernen/${t.id}">
            <span class="chapter-nr">${esc(t.nr)}</span>
            <div class="chapter-body">
              <div class="chapter-title"><h3>${t.icon} ${esc(t.title)}</h3>${done ? '<span class="chip chip-ok">✓ gelernt</span>' : ''}</div>
              <p class="muted small">${esc(t.pages)}</p>
              <p class="small">${esc(t.summary)}</p>
              <div class="chapter-foot"><span class="relevance" title="Klausurrelevanz">${stars(t.relevance)}</span>${bar(st.mastery)}</div>
            </div></a>`;
        }).join('')}
      </div>`;
    return;
  }

  const idx = topics.findIndex((t) => t.id === params.id);
  const t = topics[idx];
  if (!t) { root.innerHTML = '<p>Kapitel nicht gefunden.</p>'; return; }
  const prev = topics[idx - 1], next = topics[idx + 1];
  const st = DBT.srs.topicStats(t.id);
  const done = !!DBT.store.get().done[t.id];
  const cardCount = DBT.data.flashcards.filter((c) => c.t === t.id).length;
  const taskCount = DBT.data.tasks.filter((x) => x.t === t.id).length;

  root.innerHTML = `
    <nav class="crumbs"><a href="#/lernen">Lernmodus</a> › <span>Kap. ${esc(t.nr)}</span></nav>
    <header class="topic-header card">
      <div>
        <p class="eyebrow">Kapitel ${esc(t.nr)} · ${esc(t.pages)}</p>
        <h1>${t.icon} ${esc(t.title)}</h1>
        <p class="lead">${esc(t.summary)}</p>
        <div class="row-actions">
          <a class="btn btn-primary" href="#/quiz?t=${t.id}&mode=smart&n=10">Quiz (${st.total})</a>
          ${cardCount ? `<a class="btn" href="#/karten?t=${t.id}">Karteikarten (${cardCount})</a>` : ''}
          ${taskCount ? `<a class="btn" href="#/aufgaben?t=${t.id}">Klausuraufgaben (${taskCount})</a>` : ''}
          <button class="btn btn-ghost" id="toggle-done">${done ? '↺ Als ungelernt markieren' : '✓ Als gelernt markieren'}</button>
        </div>
      </div>
      <div class="topic-side">
        <div><span class="muted small">Klausurrelevanz</span><div class="relevance big">${stars(t.relevance)}</div></div>
        <div><span class="muted small">Dein Stand</span>${bar(st.mastery)}<span class="small muted">${st.seen}/${st.total} Fragen gesehen</span></div>
      </div>
    </header>

    <aside class="callout exam">
      <b>🎯 Klausurbezug</b>
      <p>${t.examNote}</p>
    </aside>

    <section class="card">
      <h2>Das Wichtigste in Stichpunkten</h2>
      <ul class="keypoints">${t.points.map((p) => `<li>${p}</li>`).join('')}</ul>
    </section>

    ${t.defs.length ? `<section class="card">
      <h2>Definitionen</h2>
      <dl class="defs">${t.defs.map((d) => `<div class="def"><dt>${esc(d.term)}</dt><dd>${esc(d.def)} <span class="src">${esc(d.src)}</span></dd></div>`).join('')}</dl>
    </section>` : ''}

    ${t.code.length ? `<section class="card">
      <h2>Beispiele aus dem Skript</h2>
      ${t.code.map((c) => codeBlock(c.sql, `${esc(c.title)} <span class="src">${esc(c.src)}</span>`)).join('')}
    </section>` : ''}

    ${t.pitfalls.length ? `<aside class="callout warn">
      <b>⚠️ Typische Fehler</b>
      <ul>${t.pitfalls.map((p) => `<li>${p}</li>`).join('')}</ul>
    </aside>` : ''}

    <nav class="pager">
      ${prev ? `<a class="btn btn-ghost" href="#/lernen/${prev.id}">← ${esc(prev.short)}</a>` : '<span></span>'}
      ${next ? `<a class="btn btn-ghost" href="#/lernen/${next.id}">${esc(next.short)} →</a>` : '<span></span>'}
    </nav>`;

  root.querySelector('#toggle-done').addEventListener('click', () => {
    DBT.store.update((s) => { if (s.done[t.id]) delete s.done[t.id]; else { s.done[t.id] = Date.now(); DBT.store.logActivity(); } });
    toast(DBT.store.get().done[t.id] ? 'Kapitel als gelernt markiert ✓' : 'Markierung entfernt');
    DBT.views.learn(root, params);
  });
};
