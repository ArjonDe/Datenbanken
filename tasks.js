/**
 * Klausuraufgaben (offen, selbstbewertet): Liste mit Filtern und Einzelansicht.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.tasks = (root, params, query) => {
  const { esc, $, toast } = DBT.util;
  const all = DBT.data.tasks;

  if (params.id) return detail(all.find((x) => x.id === params.id));

  const kind = query.get('k') || '';
  const topic = query.get('t') || '';
  const list = all.filter((x) => (!kind || x.kind === kind) && (!topic || x.t === topic));
  const st = DBT.store.get().tasks;

  root.innerHTML = `
    <div class="page-head"><h1>Klausuraufgaben</h1><p class="muted">Originalaufgaben aus Klausur 2023 und Probeklausur 2024 plus Skript-/Übungsaufgaben. Schreibe deine Lösung, vergleiche mit der Musterlösung und bewerte dich anhand der Checkliste.</p></div>
    <aside class="callout info"><b>ℹ️ Zu den Musterlösungen</b><p>Für die Klausuren liegen keine offiziellen Lösungen vor. Die Musterlösungen sind mit den Regeln des Skripts hergeleitet; Annahmen und Stellen, die das Skript nicht abdeckt, sind markiert. Die handschriftlichen Einträge im PDF der Klausur 2023 enthalten Fehler und wurden nicht übernommen.</p></aside>
    <div class="card filters">
      <div class="chips-scroll">
        ${[['', 'Alle'], ['erm', '🧩 ERM'], ['tables', '🗂️ Tabellen ableiten'], ['sql', '🔎 SQL']].map(([k, l]) =>
          `<a class="chip-link ${kind === k ? 'active' : ''}" href="#/aufgaben${k ? '?k=' + k : ''}">${l}</a>`).join('')}
      </div>
    </div>
    <div class="task-list">
      ${list.map((x) => {
        const r = st[x.id];
        return `<a class="task-item card" href="#/aufgaben/${x.id}">
          <span class="task-kind kind-${x.kind}">${DBT.task.KIND[x.kind]}</span>
          <div class="task-item-body"><h3>${esc(x.title)}</h3><p class="small muted">${esc(x.s)}</p></div>
          <span class="task-pts">${r ? `<b>${(Math.round(r.best * 10) / 10).toString().replace('.', ',')}</b>/${x.points}` : `${x.points} P.`}</span>
        </a>`;
      }).join('') || '<p class="muted">Keine Aufgaben für diese Auswahl.</p>'}
    </div>`;

  function detail(task) {
    if (!task) { root.innerHTML = '<p>Aufgabe nicht gefunden.</p>'; return; }
    const idx = all.indexOf(task);
    const next = all[idx + 1];
    root.innerHTML = `
      <nav class="crumbs"><a href="#/aufgaben">Klausuraufgaben</a> › <span>${esc(task.title)}</span></nav>
      <article class="card" id="task-root"></article>
      <div class="row-actions" id="task-actions" hidden>
        <button class="btn btn-primary" id="save">Bewertung speichern</button>
        ${next ? `<a class="btn" href="#/aufgaben/${next.id}">Nächste Aufgabe →</a>` : ''}
      </div>`;
    const tc = DBT.task.mount(task, $('#task-root', root), {
      onGrade: () => { $('#task-actions', root).hidden = false; }
    });
    // Aktionen sichtbar machen, sobald die Lösung angezeigt wird
    $('#task-root', root).addEventListener('click', (e) => {
      if (e.target.closest('[data-act=solve]')) setTimeout(() => { $('#task-actions', root).hidden = false; }, 0);
    });
    $('#save', root).addEventListener('click', () => {
      const pts = tc.points();
      DBT.store.update((s) => {
        const r = s.tasks[task.id] || { best: 0, attempts: 0 };
        r.attempts++;
        r.last = pts;
        r.best = Math.max(r.best, pts);
        r.date = Date.now();
        s.tasks[task.id] = r;
        DBT.store.logActivity();
      });
      toast(`Gespeichert: ${(Math.round(pts * 10) / 10).toString().replace('.', ',')} / ${task.points} P.`);
    });
  }
};
