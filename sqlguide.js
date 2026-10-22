/**
 * „SQL für Einsteiger“ – bebilderte Schritt-für-Schritt-Anleitung.
 * Jedes Beispiel ist live ausführbar (Comic-Datenbank aus dem Skript).
 * Inhalte nach Skript Kap. 2–7, 9.8, 11; Signalwörter aus den Klausuraufgaben abgeleitet.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.sqlGuide = (root) => {
  const { esc, $, $$, codeBlock } = DBT.util;

  /* ───────── Grafik-Bausteine ───────── */
  const mini = (cols, rows, opts = {}) => `<table class="viz-table ${opts.cls || ''}">
    <thead><tr>${cols.map((c, i) => `<th class="${(opts.hiCols || []).includes(i) ? 'hi' : ''} ${(opts.dimCols || []).includes(i) ? 'dim' : ''}">${opts.pk === i ? '🔑 ' : ''}${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r, ri) => `<tr class="${(opts.hiRows || []).includes(ri) ? 'hi' : ''} ${(opts.dimRows || []).includes(ri) ? 'dim' : ''} ${opts.groups ? 'g' + opts.groups[ri] : ''}">${r.map((v, i) => `<td class="${(opts.hiCols || []).includes(i) ? 'hi' : ''} ${(opts.dimCols || []).includes(i) ? 'dim' : ''} ${v === null ? 'null' : ''}">${v === null ? 'NULL' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  const ALBEN_COLS = ['titel', 'reihe', 'preis', 'jahr'];
  const ALBEN = [
    ['Asterix, der Gallier', 2, '2.80', 1968],
    ['Die Trabantenstadt', 2, '3.80', 1974],
    ['Der große Graben', 2, '5.00', 1980],
    ['Das Kriminalmuseum', 4, '8.80', 1985],
    ['Das Meisterwerk', 4, '8.80', 1986],
    ['Der geheimnisvolle Stern', 3, null, 1972]
  ];
  const arrow = (label = '') => `<div class="viz-arrow" aria-hidden="true"><span>${label}</span></div>`;

  function venn(kind, label) {
    const fill = 'var(--accent)', id = 'v' + kind;
    const A = '<circle cx="70" cy="60" r="45"/>', B = '<circle cx="130" cy="60" r="45"/>';
    let shapes = '';
    if (kind === 'inner') shapes = `<clipPath id="${id}">${A}</clipPath><circle cx="130" cy="60" r="45" fill="${fill}" clip-path="url(#${id})"/>`;
    if (kind === 'left') shapes = `<circle cx="70" cy="60" r="45" fill="${fill}"/>`;
    if (kind === 'right') shapes = `<circle cx="130" cy="60" r="45" fill="${fill}"/>`;
    if (kind === 'leftonly') shapes = `<circle cx="70" cy="60" r="45" fill="${fill}"/><circle cx="130" cy="60" r="45" fill="var(--surface)"/>`;
    return `<figure class="venn"><svg viewBox="0 0 200 125" role="img" aria-label="${esc(label)}">
      ${shapes}
      <g fill="none" stroke="var(--text)" stroke-width="2">${A}${B}</g>
      <text x="45" y="64" class="venn-t">A</text><text x="148" y="64" class="venn-t">B</text>
    </svg><figcaption>${label}</figcaption></figure>`;
  }

  /** Live-Beispiel: Code + Ausführen-Knopf + Ergebnis */
  let rid = 0;
  const runner = (sql, db = 'comics') => {
    const id = 'r' + (rid++);
    return `<div class="runner" data-runner="${id}" data-db="${db}" data-q="${esc(sql)}">
      ${codeBlock(sql)}
      <div class="row-actions"><button class="btn btn-sm btn-primary" data-run="${id}">▶ Ausführen</button>
      <a class="btn btn-sm btn-ghost" href="#/sql/spielwiese?db=${db}&q=${encodeURIComponent(sql)}">✏️ Selbst verändern</a></div>
      <div class="runner-out" id="${id}"></div>
    </div>`;
  };

  /* ───────── Inhalte ───────── */
  const S = [
    {
      id: 'tabelle', title: '1 · Was ist eine Tabelle?', html: `
        <p>Eine Datenbank speichert Daten in <b>Tabellen</b> – wie ein Excel-Blatt, aber mit festen Regeln.</p>
        <div class="anno">
          ${mini(ALBEN_COLS, ALBEN.slice(0, 3), { pk: 0 })}
          <div class="anno-notes">
            <span class="note n1">⬆ <b>Spalte</b> = Attribut (z.B. <code>preis</code>)</span>
            <span class="note n2">➡ <b>Zeile</b> = ein Datensatz (ein Album)</span>
            <span class="note n3">🔑 <b>Primärschlüssel</b> – macht jede Zeile eindeutig</span>
          </div>
        </div>
        <p class="small muted">Vokabelliste (Skript S. 11): Relation = Tabelle · Attribut = Spalte · Tupel = Zeile/Datensatz.</p>
        <div class="tip">🧠 <b>Merke:</b> SQL ist <b>deklarativ</b> – du sagst, <i>was</i> du willst, nicht <i>wie</i> der Computer es suchen soll.</div>` },
    {
      id: 'select', title: '2 · SELECT … FROM – Spalten auswählen', html: `
        <p>Die wichtigste Anweisung. Sie hat immer diese Form:</p>
        <div class="formula"><span class="kw">SELECT</span> <span class="slot">welche Spalten</span> <span class="kw">FROM</span> <span class="slot">welche Tabelle</span> ;</div>
        <div class="viz-flow">
          ${mini(ALBEN_COLS, ALBEN.slice(0, 4), { hiCols: [0, 3], dimCols: [1, 2] })}
          ${arrow('SELECT titel, jahr')}
          ${mini(['titel', 'jahr'], ALBEN.slice(0, 4).map((r) => [r[0], r[3]]), { cls: 'result' })}
        </div>
        <p>Der Stern <code>*</code> heißt „alle Spalten“. Mit <code>DISTINCT</code> fliegen doppelte Zeilen raus.</p>
        ${runner('SELECT titel, jahr FROM alben;')}
        ${runner('SELECT DISTINCT reihe FROM alben;')}
        <div class="tip">🏷️ <b>Neue Spaltenüberschrift:</b> <code>preis AS brutto</code> – das heißt <b>Alias</b>. In Klausuraufgaben steht dann „mit der Spaltenüberschrift …“.</div>
        ${runner('SELECT titel, preis AS brutto, ROUND(preis/1.19, 2) AS netto FROM alben;')}` },
    {
      id: 'where', title: '3 · WHERE – Zeilen filtern', html: `
        <p>WHERE ist ein <b>Sieb</b>: Nur Zeilen, für die die Bedingung <b>wahr</b> ist, kommen durch.</p>
        <div class="viz-flow">
          ${mini(ALBEN_COLS, ALBEN, { hiRows: [2, 3, 4], dimRows: [0, 1, 5] })}
          ${arrow('WHERE jahr >= 1980')}
          ${mini(ALBEN_COLS, ALBEN.slice(2, 5), { cls: 'result' })}
        </div>
        <div class="op-grid">
          ${[['=', 'gleich'], ['<>', 'ungleich'], ['>', 'größer'], ['<', 'kleiner'], ['>=', 'größer gleich'], ['<=', 'kleiner gleich']].map(([o, t]) => `<span class="op"><code>${esc(o)}</code>${t}</span>`).join('')}
        </div>
        <p>Mehrere Bedingungen verbindest du mit <code>AND</code> (beide müssen stimmen) oder <code>OR</code> (eine reicht). Für Bereiche gibt es <code>BETWEEN … AND …</code> (Grenzen gehören dazu).</p>
        ${runner("SELECT titel, jahr FROM alben WHERE jahr BETWEEN 1970 AND 1980;")}
        <div class="tip warn">⚠️ Texte und Datumswerte immer in <b>einfache Apostrophe</b>: <code>'Asterix'</code>, <code>'2020-12-31'</code>. Kommazahlen mit <b>Punkt</b>: <code>2.80</code>.</div>` },
    {
      id: 'order', title: '4 · ORDER BY – sortieren', html: `
        <p>Kommt <b>immer ganz ans Ende</b>. Standard ist aufsteigend (A→Z, 1→9). <code>DESC</code> = absteigend – gilt nur für die Spalte davor.</p>
        <div class="sort-viz"><span>1968</span><span>1974</span><span>1980</span><b>ASC ⬆</b><span>1980</span><span>1974</span><span>1968</span><b>DESC ⬇</b></div>
        ${runner('SELECT reihe, titel, jahr FROM alben ORDER BY reihe, jahr DESC;')}` },
    {
      id: 'like', title: '5 · LIKE – Textmuster suchen', html: `
        <p>Mit LIKE suchst du nach Mustern. Zwei Platzhalter:</p>
        <div class="like-legend">
          <span class="lk lk-any">%</span> beliebig viele Zeichen (auch gar keins)
          <span class="lk lk-one">_</span> genau <b>ein</b> Zeichen
        </div>
        <div class="like-grid">
          ${[["'D%'", 'beginnt mit D', ['D', '%']], ["'%n'", 'endet mit n', ['%', 'n']], ["'%x%'", 'enthält x', ['%', 'x', '%']], ["'_e%'", '2. Buchstabe ist e', ['_', 'e', '%']], ["'%a%a%'", 'mind. zweimal a', ['%', 'a', '%', 'a', '%']]]
            .map(([p, t, parts]) => `<div class="like-row"><code>${esc(p)}</code><span class="like-boxes">${parts.map((x) => `<span class="lk ${x === '%' ? 'lk-any' : x === '_' ? 'lk-one' : 'lk-lit'}">${esc(x)}</span>`).join('')}</span><span>${t}</span></div>`).join('')}
        </div>
        ${runner("SELECT titel FROM alben WHERE titel LIKE '_e%';")}
        <p class="small muted">In MS Access heißen die Zeichen <code>*</code> und <code>?</code> (Skript S. 25).</p>` },
    {
      id: 'null', title: '6 · NULL – „weiß ich nicht“', html: `
        <p><b>NULL</b> ist kein Wert, sondern bedeutet <b>unbekannt</b>. Darum ist jeder Vergleich mit NULL ebenfalls unbekannt – auch <code>NULL = NULL</code>!</p>
        <div class="null-viz"><span class="q">❓</span><span>= 5</span><span class="eq">→</span><span class="q">❓ unbekannt</span></div>
        <div class="vs">
          <div class="bad-box">❌ <code>WHERE preis = NULL</code><br><span class="small">findet <b>nie</b> etwas</span></div>
          <div class="ok-box">✅ <code>WHERE preis IS NULL</code><br><span class="small">richtig!</span></div>
        </div>
        ${runner('SELECT titel, preis FROM alben WHERE preis IS NULL;')}` },
    {
      id: 'agg', title: '7 · Zählen & Rechnen: Aggregatfunktionen', html: `
        <p>Aggregatfunktionen machen aus <b>vielen</b> Werten <b>einen</b>:</p>
        <div class="funnel">
          <div class="funnel-in">${['2.80', '3.80', '5.00', '8.80', '8.80'].map((v) => `<span>${v}</span>`).join('')}</div>
          <div class="funnel-mid">AVG( )</div>
          <div class="funnel-out">5.84</div>
        </div>
        <div class="op-grid">
          ${[['COUNT(*)', 'Anzahl Zeilen'], ['SUM(x)', 'Summe'], ['AVG(x)', 'Durchschnitt'], ['MIN(x)', 'kleinster'], ['MAX(x)', 'größter']].map(([o, t]) => `<span class="op"><code>${o}</code>${t}</span>`).join('')}
        </div>
        <p class="small">NULL-Werte werden dabei <b>ignoriert</b> (Skript Bem. 6.4).</p>
        ${runner('SELECT COUNT(*), MIN(preis), MAX(preis), AVG(preis) FROM alben;')}` },
    {
      id: 'group', title: '8 · GROUP BY & HAVING – pro Gruppe rechnen', html: `
        <p>Sobald in der Aufgabe <b>„je“, „pro“</b> oder <b>„für jede(n)“</b> steht, brauchst du <b>GROUP BY</b>. SQL sortiert die Zeilen in <b>Eimer</b> und rechnet pro Eimer.</p>
        <div class="viz-flow">
          ${mini(['titel', 'reihe', 'preis'], ALBEN.slice(0, 5).map((r) => [r[0], r[1], r[2]]), { groups: [2, 2, 2, 4, 4] })}
          ${arrow('GROUP BY reihe')}
          <div class="buckets">
            <div class="bucket g2"><b>reihe 2</b><span>2.80 · 3.80 · 5.00</span><em>AVG = 3.87</em></div>
            <div class="bucket g4"><b>reihe 4</b><span>8.80 · 8.80</span><em>AVG = 8.80</em></div>
          </div>
        </div>
        ${runner('SELECT reihe, COUNT(*), AVG(preis) FROM alben GROUP BY reihe;')}
        <h3>WHERE oder HAVING?</h3>
        <div class="pipeline">
          <div class="pl-step">📦<b>FROM</b><span>Tabelle</span></div><i>→</i>
          <div class="pl-step">🧽<b>WHERE</b><span>filtert <u>Zeilen</u></span></div><i>→</i>
          <div class="pl-step">🪣<b>GROUP BY</b><span>bildet Eimer</span></div><i>→</i>
          <div class="pl-step">🔍<b>HAVING</b><span>filtert <u>Eimer</u></span></div><i>→</i>
          <div class="pl-step">↕️<b>ORDER BY</b><span>sortiert</span></div>
        </div>
        <div class="tip">📏 <b>Faustregel (Regel 3):</b> Steht in der Bedingung COUNT, SUM, AVG, MIN oder MAX → <b>HAVING</b>. Sonst → <b>WHERE</b>.<br>
        📏 <b>Regel 2:</b> Jede Spalte im SELECT, die keine Aggregatfunktion ist, muss auch ins GROUP BY.</div>
        ${runner('SELECT reihe, COUNT(*) FROM alben WHERE jahr > 1970 GROUP BY reihe HAVING COUNT(*) >= 2;')}` },
    {
      id: 'join', title: '9 · JOIN – Tabellen verbinden', html: `
        <p>In echten Datenbanken sind die Infos auf mehrere Tabellen verteilt. Der <b>Fremdschlüssel</b> zeigt auf den <b>Primärschlüssel</b> der anderen Tabelle – über ihn verbindest du.</p>
        <div class="join-viz">
          ${mini(['name', 'dienstwagen'], [['Anna', 2], ['Otto', null], ['Alice', 1], ['Bob', 1]], { cls: 'jl' })}
          <div class="join-lines" aria-hidden="true">🔗<span>angestellte.dienstwagen<br>= dienstwagen.id</span></div>
          ${mini(['id', 'kennzeichen'], [[1, 'HA-FH 1234'], [2, 'HA-FH 2345'], [3, 'HA-FH 3456']], { cls: 'jr', pk: 0 })}
        </div>
        <div class="formula"><span class="kw">FROM</span> <span class="slot">A</span> <span class="kw">INNER JOIN</span> <span class="slot">B</span> <span class="kw">ON</span> <span class="slot">A.fremdschlüssel = B.id</span></div>
        <div class="venn-row">
          ${venn('inner', 'INNER JOIN: nur Paare, die zusammenpassen')}
          ${venn('left', 'LEFT JOIN: alle aus A (+ Partner, sonst NULL)')}
          ${venn('right', 'RIGHT JOIN: alle aus B')}
          ${venn('leftonly', 'LEFT JOIN … WHERE B.id IS NULL: A ohne Partner')}
        </div>
        ${runner('SELECT angestellte.name, dienstwagen.kennzeichen\nFROM angestellte\nINNER JOIN dienstwagen ON angestellte.dienstwagen = dienstwagen.id;')}
        ${runner('SELECT angestellte.name, dienstwagen.kennzeichen\nFROM angestellte\nLEFT JOIN dienstwagen ON angestellte.dienstwagen = dienstwagen.id;')}
        <div class="tip">🔎 Bei <b>M:N</b> (z.B. Produkt ↔ Material) gibt es eine <b>Beziehungstabelle</b> dazwischen – dann brauchst du <b>zwei</b> JOINs hintereinander.</div>
        ${runner('SELECT DISTINCT autoren.name, reihen.name\nFROM autoren\nINNER JOIN albenautoren ON autoren.id = albenautoren.autor\nINNER JOIN alben ON albenautoren.titel = alben.titel\nINNER JOIN reihen ON reihen.id = alben.reihe;')}` },
    {
      id: 'sub', title: '10 · Unterabfragen – SELECT im SELECT', html: `
        <p>Manchmal brauchst du erst ein Zwischenergebnis (z.B. den Durchschnitt), um dann damit zu filtern. Die innere Abfrage läuft <b>zuerst</b>.</p>
        <div class="nest"><div class="nest-outer"><span>SELECT titel FROM alben WHERE preis &lt;</span><div class="nest-inner">( SELECT AVG(preis) FROM alben ) <b>→ 4,58</b></div></div></div>
        ${runner('SELECT titel, preis FROM alben\nWHERE preis < (SELECT AVG(preis) FROM alben);')}
        <div class="tip warn">⚠️ <code>WHERE preis = MAX(preis)</code> ist <b>verboten</b> – immer als Unterabfrage schreiben!</div>` },
    {
      id: 'rezept', title: '11 · Das Klausur-Rezept 🍳', html: `
        <ol class="recipe">
          <li><b>Ausgabe lesen:</b> Welche Spalten sollen raus? → kommt hinter <code>SELECT</code>.</li>
          <li><b>Tabellen finden:</b> In welchen Tabellen stehen diese Spalten? Mehr als eine → <code>JOIN</code> (im Diagramm den Weg über die Schlüssel suchen).</li>
          <li><b>Filtern:</b> Bedingung auf einzelne Zeilen → <code>WHERE</code>.</li>
          <li><b>Gruppieren:</b> „je/pro“ oder Anzahl/Summe pro … → <code>GROUP BY</code>; Bedingung darauf → <code>HAVING</code>.</li>
          <li><b>Feinschliff:</b> Doppelte weg → <code>DISTINCT</code>; Überschrift → <code>AS</code>; Sortierung → <code>ORDER BY</code>.</li>
        </ol>
        <h3>Signalwörter-Spickzettel</h3>
        <div class="table-wrap"><table class="table signal">
          <thead><tr><th>Steht in der Aufgabe …</th><th>… dann schreibst du</th></tr></thead>
          <tbody>
            ${[['„ohne doppelte Datensätze“', 'SELECT DISTINCT'], ['„mit der Spaltenüberschrift X“', '… AS X'], ['„absteigend sortiert“', 'ORDER BY … DESC'], ['„zwischen dem … und dem …“', "BETWEEN '…' AND '…'"], ['„beginnt mit / enthält / 2. Buchstabe“', "LIKE 'x%' / '%x%' / '_x%'"], ['„hat ein … / bereits …“ (Wert vorhanden)', 'IS NOT NULL'], ['„alle … und falls/sofern vorhanden …“', 'LEFT JOIN'], ['„… die keine/nie …“', 'LEFT JOIN … WHERE … IS NULL'], ['„wie viele / Anzahl“', 'COUNT(…)'], ['„je / pro / für jede(n)“', 'GROUP BY'], ['„mindestens / öfter als N-mal“', 'HAVING COUNT(*) >= / > N'], ['„in der Summe über …“', 'HAVING SUM(…) > …'], ['„den höchsten / niedrigsten …“', '= (SELECT MAX/MIN(…) FROM …)'], ['„durchschnittlich“', 'AVG(…)']]
              .map(([a, b]) => `<tr><td>${a}</td><td><code>${esc(b)}</code></td></tr>`).join('')}
          </tbody></table></div>
        <div class="row-actions"><a class="btn btn-primary" href="#/sql">Jetzt Aufgaben lösen →</a></div>` },
    {
      id: 'dialekt', title: '12 · Kleingedrucktes: SQL-Dialekte', html: `
        <p>SQL ist standardisiert, aber jedes System hat einen eigenen „Dialekt“ (Skript S. 13). Das Labor hier nutzt <b>SQLite</b>. Für die Klausur zählt die Schreibweise aus dem Skript.</p>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Was</th><th>Skript / Standard</th><th>MS Access</th><th>Hier (SQLite)</th></tr></thead>
          <tbody>
            <tr><td>Platzhalter</td><td><code>%</code> <code>_</code></td><td><code>*</code> <code>?</code></td><td><code>%</code> <code>_</code></td></tr>
            <tr><td>ungleich</td><td><code>&lt;&gt;</code> oder <code>!=</code></td><td>nur <code>&lt;&gt;</code></td><td>beides</td></tr>
            <tr><td>Datum</td><td><code>'yyyy-mm-dd'</code></td><td><code>#mm/dd/yyyy#</code></td><td><code>'yyyy-mm-dd'</code></td></tr>
            <tr><td>NULL ersetzen</td><td><code>IFNULL</code></td><td><code>Nz</code></td><td><code>IFNULL</code></td></tr>
            <tr><td>Standardabweichung</td><td><code>STDDEV</code></td><td><code>STDEV</code></td><td>– (nicht vorhanden)</td></tr>
          </tbody></table></div>` }
  ];

  const read = () => { try { return JSON.parse(localStorage.getItem('dbtrainer.guide') || '{}'); } catch (e) { return {}; } };
  const markRead = (id) => { const r = read(); r[id] = 1; try { localStorage.setItem('dbtrainer.guide', JSON.stringify(r)); } catch (e) { /* egal */ } };
  const done = read();

  root.innerHTML = `
    <nav class="crumbs"><a href="#/sql">SQL-Labor</a> › <span>Anleitung</span></nav>
    <header class="card guide-hero">
      <div><p class="eyebrow">Keine Vorkenntnisse nötig</p><h1>SQL für Einsteiger 🐣</h1>
      <p class="lead">12 kurze Schritte mit Bildern. Drück bei jedem Beispiel auf <b>▶ Ausführen</b> – du siehst sofort, was passiert.</p></div>
      <div class="guide-badge">${S.filter((s) => done[s.id]).length}/${S.length}<span>gelesen</span></div>
    </header>
    <div class="guide">
      <nav class="guide-toc card" aria-label="Inhalt">${S.map((s) => `<a href="#g-${s.id}" data-toc="${s.id}">${done[s.id] ? '✅' : '⬜'} ${esc(s.title)}</a>`).join('')}</nav>
      <div class="guide-body">${S.map((s) => `<section class="card guide-sec" id="g-${s.id}" data-sec="${s.id}"><h2>${esc(s.title)}</h2>${s.html}</section>`).join('')}</div>
    </div>`;

  // TOC-Links scrollen ohne den Hash-Router zu stören
  $$('[data-toc]', root).forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('g-' + a.dataset.toc).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  // Gelesen-Markierung beim Scrollen
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) {
      const id = en.target.dataset.sec;
      markRead(id);
      const link = root.querySelector(`[data-toc="${id}"]`);
      if (link) link.textContent = '✅ ' + link.textContent.slice(2).trim();
    }
  }), { threshold: 0.6 });
  $$('[data-sec]', root).forEach((s) => io.observe(s));

  // Live-Beispiele
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-run]');
    if (!btn) return;
    const id = btn.dataset.run;
    const out = document.getElementById(id);
    const sql = btn.closest('[data-runner]').dataset.q;
    const dbName = btn.closest('[data-runner]').dataset.db;
    out.innerHTML = '<p class="muted small">⏳ Lädt SQL-Engine …</p>';
    try {
      await DBT.sql.ready();
      const db = DBT.sql.open(dbName);
      const r = DBT.sql.run(db, sql);
      db.close();
      out.innerHTML = r.ok ? DBT.sql.tableHTML(DBT.sql.lastResult(r)) : `<div class="sql-error">⚠️ ${esc(r.error)}</div>`;
    } catch (err) {
      out.innerHTML = `<div class="sql-error">${esc(err.message)}</div>`;
    }
  });

  return () => io.disconnect();
};
