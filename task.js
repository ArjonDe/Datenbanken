/**
 * Komponente für offene Aufgaben (ERM, Tabellenableitung, SQL) mit Selbstbewertung.
 *
 *   DBT.task.mount(task, root, { answer, phase })
 *     phase 'work'  → Aufgabe + Eingabefeld (+ „Lösung zeigen“ im Übungsmodus)
 *     phase 'grade' → eigene Antwort, Musterlösung, Checkliste zum Abhaken
 *   → { getAnswer(), points(), showSolution() }
 */
window.DBT = window.DBT || {};

DBT.task = (() => {
  const { esc, $, $$, codeBlock } = DBT.util;
  const KIND = { erm: 'ER-Modell', tables: 'Tabellenableitung', sql: 'SQL' };

  const schemaFigure = () => `<details class="schema"><summary>🗺️ Tabellendiagramm der Klausur (Seite 10) anzeigen</summary>
    <a href="assets/img/klausur-schema.png" target="_blank" rel="noopener"><img src="assets/img/klausur-schema.png" alt="Tabellendiagramm aus der Klausur: Kunde, Angebot, AngebotsProdukte, AuftragsAngebot, Auftrag, AuftragsProdukte, Mitarbeiter, Produkt, Produktpreis, ProduktMaterial, Material, MaterialLieferung, Haendler" loading="lazy"></a>
    <p class="small muted">Zum Vergrößern antippen. Quelle: Klausur 2023 / Probeklausur 2024, S. 10.</p></details>`;

  function mount(task, root, opts = {}) {
    const phase = opts.phase || 'work';
    const practice = opts.practice !== false;
    const placeholder = task.kind === 'sql' ? 'SELECT …' : task.kind === 'tables' ? 'Tabelle | Primärschlüssel | Attribute (FK markieren)' : 'Entitätstypen, Beziehungen (Verb), Kardinalitäten …\n(Am besten auf Papier skizzieren und hier stichpunktartig notieren)';

    root.innerHTML = `
      <div class="q-meta"><span class="chip chip-topic">${KIND[task.kind]}</span><span class="chip chip-ghost">${task.points} P.</span><span class="chip chip-ghost">📖 ${esc(task.s)}</span></div>
      <h2 class="task-title">${esc(task.title)}</h2>
      <div class="task-prompt">${task.prompt}</div>
      ${task.schema ? schemaFigure() : ''}
      <label class="task-answer-label" for="ans-${task.id}">Deine Lösung</label>
      <textarea id="ans-${task.id}" class="task-answer ${task.kind === 'sql' ? 'mono' : ''}" rows="${task.kind === 'sql' ? 6 : 9}" spellcheck="false" placeholder="${esc(placeholder)}" ${phase === 'grade' ? 'readonly' : ''}>${esc(opts.answer || '')}</textarea>
      ${phase === 'work' && practice ? '<div class="row-actions"><button class="btn btn-primary" data-act="solve">Lösung zeigen &amp; selbst bewerten</button></div>' : ''}
      <div class="task-solution" ${phase === 'grade' ? '' : 'hidden'}></div>`;

    const sol = $('.task-solution', root);

    function showSolution() {
      sol.hidden = false;
      sol.innerHTML = `
        <h3>Musterlösung</h3>
        ${codeBlock(task.solution)}
        ${task.solutionNote ? `<p class="small">${task.solutionNote}</p>` : ''}
        <h3>Selbstbewertung</h3>
        <p class="small muted">Hake ab, was deine Lösung erfüllt. Jedes Kriterium zählt ${(task.points / task.checklist.length).toFixed(2).replace('.00', '')} P.</p>
        <ul class="checklist">${task.checklist.map((c, i) => `<li><label class="check"><input type="checkbox" data-ci="${i}"><span>${esc(c)}</span></label></li>`).join('')}</ul>
        <p class="task-score">Punkte: <b data-score>0</b> / ${task.points}</p>`;
      $$('[data-ci]', sol).forEach((cb) => cb.addEventListener('change', () => {
        $('[data-score]', sol).textContent = fmt(points());
        opts.onGrade?.(points());
      }));
      root.querySelector('[data-act=solve]')?.remove();
    }

    const fmt = (x) => (Math.round(x * 10) / 10).toString().replace('.', ',');

    function points() {
      const n = $$('[data-ci]:checked', sol).length;
      return (n / task.checklist.length) * task.points;
    }

    root.querySelector('[data-act=solve]')?.addEventListener('click', showSolution);
    if (phase === 'grade') showSolution();

    return { getAnswer: () => $('.task-answer', root).value, points, showSolution };
  }

  return { mount, KIND };
})();
