/**
 * SQL-Labor: Übersicht, Übungsaufgaben mit automatischer Auswertung, Spielwiese.
 * Die Einsteiger-Anleitung liegt in sqlguide.js.
 *
 * Routen:  #/sql   ·   #/sql/uebung/:id   ·   #/sql/spielwiese?db=…&q=…   ·   #/sql/anleitung
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.sql = (root, params, query) => {
  const { esc, $, $$, toast, bar } = DBT.util;
  const EX = DBT.data.sqlExercises;
  const LEVEL = DBT.question.LEVEL_LABEL;

  if (params.id === 'anleitung') return DBT.views.sqlGuide(root, params, query);
  if (params.id === 'uebung' && params.sub) return exercise(EX.find((e) => e.id === params.sub));
  if (params.id === 'spielwiese') return playground();
  return hub();

  /* ───────── Übersicht ───────── */
  function hub() {
    const st = DBT.store.get().sql || {};
    const solved = EX.filter((e) => st[e.id]?.solved).length;
    const groups = [...new Set(EX.map((e) => e.group))];
    root.innerHTML = `
      <div class="page-head"><h1>SQL-Labor 🧪</h1><p class="muted">Schreib dein eigenes SQL, führ es aus und lass es automatisch prüfen. Läuft komplett im Browser (SQLite).</p></div>
      <div class="lab-cards">
        <a class="lab-card card" href="#/sql/anleitung">
          <span class="lab-ico">🐣</span><h2>SQL für Einsteiger</h2>
          <p class="muted small">Schritt für Schritt mit Bildern: Tabellen, SELECT, WHERE, GROUP BY, JOIN – jedes Beispiel live ausprobieren.</p>
          <span class="btn btn-primary btn-sm">Anleitung starten →</span>
        </a>
        <a class="lab-card card" href="#/sql/spielwiese?db=klausur">
          <span class="lab-ico">🏖️</span><h2>Spielwiese</h2>
          <p class="muted small">Freies Ausprobieren auf der Klausur-Datenbank oder der Comic-Datenbank aus dem Skript.</p>
          <span class="btn btn-sm">Öffnen →</span>
        </a>
        <div class="lab-card card">
          <span class="lab-ico">🏆</span><h2>Dein Stand</h2>
          <p class="lead"><b>${solved}</b> / ${EX.length} Aufgaben gelöst</p>
          ${bar(solved / EX.length)}
          <p class="tiny muted">Alle ${EX.filter((e) => e.src.startsWith('Probeklausur') || e.src.startsWith('Klausur')).length} SQL-Aufgaben aus Klausur 2023 und Probeklausur 2024 sind dabei.</p>
        </div>
      </div>
      ${groups.map((g) => `
        <section class="ex-group">
          <h2>${esc(g)}</h2>
          <div class="ex-list">
            ${EX.filter((e) => e.group === g).map((e) => {
              const s = st[e.id];
              return `<a class="ex-item card ${s?.solved ? 'solved' : ''}" href="#/sql/uebung/${e.id}">
                <span class="ex-state">${s?.solved ? '✓' : s?.attempts ? '…' : '○'}</span>
                <span class="ex-body"><b>${esc(e.title)}</b><span class="tiny muted">${esc(e.src)} · ${e.db === 'klausur' ? 'Klausur-DB' : 'Comic-DB'}</span></span>
                <span class="chip lvl-${e.l}">${LEVEL[e.l]}</span>
              </a>`;
            }).join('')}
          </div>
        </section>`).join('')}`;
  }

  /* ───────── gemeinsame Bausteine ───────── */
  function schemaPanel(db, onPick, dbName) {
    const tables = DBT.sql.schema(db);
    return `<div class="schema-panel">
      <div class="schema-head"><b>📋 Tabellen</b><span class="tiny muted">Klick = einfügen</span></div>
      ${tables.map((t) => `<details class="sp-table">
        <summary><span data-ins="${esc(t.name)}">${esc(t.name)}</span><button class="sp-peek" data-peek="${esc(t.name)}" title="Inhalt anzeigen" type="button">👁</button></summary>
        <ul>${t.cols.map((c) => `<li data-ins="${esc(t.name)}.${esc(c.name)}" class="${c.pk ? 'pk' : ''}">${c.pk ? '🔑 ' : c.fk ? '🔗 ' : ''}${esc(c.name)} <span class="tiny muted">${esc(c.type.toLowerCase())}</span></li>`).join('')}</ul>
      </details>`).join('')}
      ${dbName === 'klausur' ? `<p class="tiny muted">⚠️ Fiktive Übungsdaten (Schema aus der Klausur).</p>
        <button class="btn btn-sm btn-ghost" type="button" data-diagram>🗺️ Diagramm der Klausur</button>` : '<p class="tiny muted">Daten aus dem Skript.</p>'}
    </div>`;
  }

  function wireSchema(scope, ed, showPeek) {
    scope.addEventListener('click', (e) => {
      const peek = e.target.closest('[data-peek]');
      if (peek) { e.preventDefault(); showPeek(peek.dataset.peek); return; }
      const ins = e.target.closest('[data-ins]');
      if (ins) {
        e.preventDefault();
        const v = ins.dataset.ins;
        const short = ins.tagName === 'LI' && e.altKey ? v.split('.')[1] : v;
        ed.insert(short + ' ');
      }
      if (e.target.closest('[data-diagram]')) {
        const d = $('#diagram-dlg');
        d?.showModal();
      }
    });
  }

  function diagramDialog() {
    return `<dialog id="diagram-dlg" class="dlg">
      <form method="dialog"><button class="btn btn-sm dlg-close" aria-label="Schließen">✕</button></form>
      <img src="assets/img/klausur-schema.png" alt="Tabellendiagramm der Klausuren (S. 10)">
    </dialog>`;
  }

  function loadingShell() {
    root.innerHTML = '<div class="card empty"><div class="spinner" aria-hidden="true"></div><p class="muted">SQL-Engine wird geladen …</p></div>';
  }
  function loadError(err) {
    root.innerHTML = `<div class="card empty"><h2>SQL-Engine nicht verfügbar</h2><p class="muted">${esc(err.message)}</p><button class="btn" onclick="location.reload()">Neu laden</button></div>`;
  }

  /* ───────── Übungsaufgabe ───────── */
  function exercise(ex) {
    if (!ex) { root.innerHTML = '<p>Aufgabe nicht gefunden.</p>'; return; }
    loadingShell();
    let alive = true;
    DBT.sql.ready().then(() => { if (alive) render(); }).catch(loadError);
    return () => { alive = false; };

    function render() {
      let db = DBT.sql.open(ex.db);
      let hintIdx = 0;
      const idx = EX.indexOf(ex);
      const prev = EX[idx - 1], next = EX[idx + 1];
      const saved = DBT.store.get().sql?.[ex.id];
      const draftKey = `dbtrainer.draft.${ex.id}`;
      let draft = '';
      try { draft = localStorage.getItem(draftKey) || ''; } catch (e) { /* ohne Storage */ }

      root.innerHTML = `
        <nav class="crumbs"><a href="#/sql">SQL-Labor</a> › <span>${esc(ex.title)}</span></nav>
        <div class="lab">
          <div class="lab-main">
            <article class="card task-card">
              <div class="q-meta"><span class="chip lvl-${ex.l}">${LEVEL[ex.l]}</span><span class="chip chip-ghost">${ex.db === 'klausur' ? 'Klausur-DB' : 'Comic-DB'}</span><span class="chip chip-ghost">📖 ${esc(ex.src)}</span>${saved?.solved ? '<span class="chip chip-ok">✓ gelöst</span>' : ''}</div>
              <h1 class="ex-title">${esc(ex.title)}</h1>
              <p class="ex-prompt">${ex.prompt}</p>
              ${ex.note ? `<p class="small callout warn">${ex.note}</p>` : ''}
            </article>
            <div id="ed"></div>
            <div class="lab-actions">
              <button class="btn" id="run" title="Strg/Cmd + Enter">▶ Ausführen</button>
              <button class="btn btn-primary" id="check">✓ Prüfen</button>
              <button class="btn btn-ghost" id="hint">💡 Hinweis (${ex.hints.length})</button>
              <button class="btn btn-ghost" id="reset">↺ Zurücksetzen</button>
              <button class="btn btn-ghost" id="solution">👁 Lösung</button>
            </div>
            <div id="hints"></div>
            <div id="verdict" aria-live="polite"></div>
            <section class="card result-card" id="out" hidden></section>
            <nav class="pager">
              ${prev ? `<a class="btn btn-ghost" href="#/sql/uebung/${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}
              ${next ? `<a class="btn btn-ghost" href="#/sql/uebung/${next.id}">${esc(next.title)} →</a>` : '<span></span>'}
            </nav>
          </div>
          <aside class="lab-side card" id="side">${schemaPanel(db, null, ex.db)}</aside>
        </div>
        ${diagramDialog()}`;

      const ed = DBT.editor.mount($('#ed', root), {
        value: draft,
        placeholder: 'Schreibe hier dein SQL …\nStrg/Cmd + Enter = Ausführen',
        onRun: runIt,
        onInput: (v) => { try { localStorage.setItem(draftKey, v); } catch (e) { /* egal */ } }
      });
      const out = $('#out', root), verdict = $('#verdict', root);

      wireSchema($('#side', root), ed, (t) => showResult(DBT.sql.run(db, `SELECT * FROM "${t}"`), `Inhalt von ${t}`));

      function showResult(r, title) {
        out.hidden = false;
        out.innerHTML = `<div class="out-head"><b>${esc(title)}</b>${r.ok ? `<span class="tiny muted">${r.ms.toFixed(1)} ms</span>` : ''}</div>` +
          (r.ok ? DBT.sql.tableHTML(DBT.sql.lastResult(r)) : `<div class="sql-error">⚠️ ${esc(r.error)}<details><summary class="tiny">Originalmeldung</summary><code>${esc(r.raw)}</code></details></div>`);
      }

      function runIt() {
        if (!ed.value.trim()) { toast('Schreib zuerst eine SQL-Anweisung'); return; }
        showResult(DBT.sql.run(db, ed.value), 'Deine Ergebnismenge');
      }

      function check() {
        if (!ed.value.trim()) { toast('Schreib zuerst eine SQL-Anweisung'); return; }
        // Immer auf frischen Datenbanken prüfen – Änderungen durch INSERT/DELETE zählen nicht
        const dbE = DBT.sql.open(ex.db), dbA = DBT.sql.open(ex.db);
        const expected = DBT.sql.run(dbE, ex.solution);
        const actual = DBT.sql.run(dbA, ed.value);
        dbE.close(); dbA.close();
        const res = DBT.sql.compare(expected, actual, ex);
        DBT.store.update((s) => {
          s.sql = s.sql || {};
          const r = s.sql[ex.id] || { attempts: 0 };
          r.attempts++;
          if (res.ok) { r.solved = true; r.date = Date.now(); }
          s.sql[ex.id] = r;
          DBT.store.logActivity();
        });
        verdict.innerHTML = `<div class="verdict ${res.ok ? 'ok' : res.partial ? 'partial' : 'bad'}">${res.msg}
          ${res.ok && next ? `<a class="btn btn-sm btn-primary" href="#/sql/uebung/${next.id}">Nächste Aufgabe →</a>` : ''}</div>`;
        if (res.ok) celebrate();
        showResult(actual, 'Deine Ergebnismenge');
        if (!res.ok && actual.ok) {
          out.insertAdjacentHTML('beforeend', `<details class="expected"><summary>Erwartete Ergebnismenge ansehen (ohne Lösung)</summary>${DBT.sql.tableHTML(DBT.sql.lastResult(expected))}</details>`);
        }
      }

      function celebrate() {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.innerHTML = Array.from({ length: 24 }, (_, i) => `<i style="--x:${Math.random() * 100}%;--d:${0.6 + Math.random() * 0.8}s;--r:${Math.random() * 360}deg;--c:${['#4f46e5', '#7c3aed', '#059669', '#f59e0b', '#ec4899'][i % 5]}"></i>`).join('');
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1800);
      }

      $('#run', root).addEventListener('click', runIt);
      $('#check', root).addEventListener('click', check);
      $('#hint', root).addEventListener('click', (e) => {
        if (hintIdx >= ex.hints.length) { toast('Keine weiteren Hinweise – schau dir die Lösung an'); return; }
        $('#hints', root).insertAdjacentHTML('beforeend', `<p class="hint-box">💡 <b>Hinweis ${hintIdx + 1}:</b> ${ex.hints[hintIdx]}</p>`);
        hintIdx++;
        e.currentTarget.textContent = `💡 Hinweis (${ex.hints.length - hintIdx})`;
      });
      $('#reset', root).addEventListener('click', () => {
        if (ed.value.trim() && !confirm('Editor leeren und Datenbank auf den Ausgangszustand zurücksetzen?')) return;
        db.close();
        db = DBT.sql.open(ex.db);
        ed.setValue('');
        try { localStorage.removeItem(draftKey); } catch (e) { /* egal */ }
        out.hidden = true; verdict.innerHTML = ''; $('#hints', root).innerHTML = ''; hintIdx = 0;
        $('#hint', root).textContent = `💡 Hinweis (${ex.hints.length})`;
        toast('Zurückgesetzt – Editor leer, Datenbank frisch');
        ed.focus();
      });
      $('#solution', root).addEventListener('click', () => {
        if (!confirm('Musterlösung anzeigen? Versuch es ruhig vorher mit den Hinweisen 😉')) return;
        DBT.store.update((s) => { s.sql = s.sql || {}; s.sql[ex.id] = { ...(s.sql[ex.id] || { attempts: 0 }), viewed: true }; });
        verdict.innerHTML = `<div class="verdict info"><b>Musterlösung</b>${DBT.util.codeBlock(ex.solution)}
          <div class="row-actions"><button class="btn btn-sm" id="take">In den Editor übernehmen</button></div></div>`;
        $('#take', root).addEventListener('click', () => { ed.setValue(ex.solution); runIt(); });
      });
    }
  }

  /* ───────── Spielwiese ───────── */
  function playground() {
    loadingShell();
    let alive = true;
    DBT.sql.ready().then(() => { if (alive) render(); }).catch(loadError);
    return () => { alive = false; };

    function render() {
      const dbName = DBT.data.sqlDatabases[query.get('db')] ? query.get('db') : 'klausur';
      let db = DBT.sql.open(dbName);
      const start = query.get('q') || (dbName === 'klausur' ? 'SELECT * FROM Kunde;' : 'SELECT * FROM alben;');
      root.innerHTML = `
        <nav class="crumbs"><a href="#/sql">SQL-Labor</a> › <span>Spielwiese</span></nav>
        <div class="page-head"><h1>Spielwiese 🏖️</h1><p class="muted">Probier alles aus – auch INSERT, UPDATE, DELETE oder CREATE TABLE. „Zurücksetzen“ stellt die Datenbank wieder her.</p></div>
        <div class="card filters">
          <div class="chips-scroll">
            ${Object.entries(DBT.data.sqlDatabases).map(([k, d]) => `<a class="chip-link ${k === dbName ? 'active' : ''}" href="#/sql/spielwiese?db=${k}">${esc(d.title)}</a>`).join('')}
          </div>
          <span class="tiny muted">${esc(DBT.data.sqlDatabases[dbName].desc)}</span>
        </div>
        <div class="lab">
          <div class="lab-main">
            <div id="ed"></div>
            <div class="lab-actions">
              <button class="btn btn-primary" id="run">▶ Ausführen <kbd>Strg+Enter</kbd></button>
              <button class="btn btn-ghost" id="reset">↺ Datenbank zurücksetzen</button>
              <button class="btn btn-ghost" id="clear">🧹 Editor leeren</button>
            </div>
            <section class="card result-card" id="out" hidden></section>
          </div>
          <aside class="lab-side card" id="side">${schemaPanel(db, null, dbName)}</aside>
        </div>
        ${diagramDialog()}`;
      const ed = DBT.editor.mount($('#ed', root), { value: start, onRun: runIt });
      const out = $('#out', root);
      const show = (r, title) => {
        out.hidden = false;
        out.innerHTML = `<div class="out-head"><b>${esc(title)}</b>${r.ok ? `<span class="tiny muted">${r.ms.toFixed(1)} ms</span>` : ''}</div>` +
          (r.ok ? (r.results.length ? r.results.map((x) => DBT.sql.tableHTML(x)).join('') : '<p class="muted small">✓ Anweisung ausgeführt (keine Ergebnismenge, z.B. bei INSERT/UPDATE).</p>') : `<div class="sql-error">⚠️ ${esc(r.error)}</div>`);
      };
      function runIt() { show(DBT.sql.run(db, ed.value), 'Ergebnis'); $('#side', root).innerHTML = schemaPanel(db, null, dbName); }
      wireSchema($('#side', root), ed, (t) => show(DBT.sql.run(db, `SELECT * FROM "${t}"`), `Inhalt von ${t}`));
      $('#run', root).addEventListener('click', runIt);
      $('#clear', root).addEventListener('click', () => { ed.setValue(''); ed.focus(); });
      $('#reset', root).addEventListener('click', () => {
        db.close(); db = DBT.sql.open(dbName);
        $('#side', root).innerHTML = schemaPanel(db, null, dbName);
        out.hidden = true;
        toast('Datenbank zurückgesetzt');
      });
      runIt();
    }
  }
};
