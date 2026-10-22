/**
 * NoSQL-Reiter: interaktive, bebilderte Erklärung von Skript Kap. 14–15
 * (Skalierung, CAP-Theorem mit Beweis-Simulation, ACID/BASE, NoSQL-Typen,
 * Entscheidungshilfe, MapReduce, konsistentes Hashing, Vektoruhren).
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.nosql = (root) => {
  const { esc, $, $$ } = DBT.util;
  const nQ = DBT.data.questions.filter((q) => q.t === 'nosql').length;
  const nC = DBT.data.flashcards.filter((c) => c.t === 'nosql').length;

  const CAP = {
    CA: { title: 'C + A (ohne P)', text: 'Daten sind auf allen Knoten, die online sind, jederzeit konsistent; man kann stets lesen und schreiben. Bei einer Verbindungsstörung muss aber das <b>gesamte System blockieren</b> – es ist nicht partitionstolerant.', ex: 'relationale Datenbanken (MySQL, Postgres), Neo4j' },
    CP: { title: 'C + P (ohne A)', text: 'Daten sind jederzeit konsistent. Knoten, die von einer Verbindungsstörung betroffen sind, werden <b>vom Netz genommen</b> und sind nicht verfügbar.', ex: 'Online-Banking; BigTable, HBase, MongoDB, Redis' },
    AP: { title: 'A + P (ohne C)', text: 'Die Knoten sind <b>immer verfügbar</b>, auch bei Störungen. Es gibt aber keine Garantie, dass alle Knoten jederzeit denselben Datenstand haben.', ex: 'DNS, Clouds; Cassandra, CouchDB, SimpleDB' }
  };

  const SCEN = [
    { q: 'Überweisungen einer Bank', a: 'Konsistenz ist geschäftskritisch → <b>C–P</b> (bzw. relational C–A). Beispiel 14.2 zeigt, wie sonst 1000 € „verschwinden“.', src: 'S. 116–117, 119' },
    { q: 'Soziales Netzwerk mit Millionen Nutzern', a: 'Verfügbarkeit und Zugriffszeit wichtiger als strenge Konsistenz → <b>A–P</b>, verteilte NoSQL-DB mit <b>BASE</b>. Beziehungen der Nutzer → <b>Graphdatenbank</b>.', src: 'S. 117, 119, 121' },
    { q: 'Straßennetz oder Busfahrplan', a: 'Knoten + Beziehungen → <b>Graphdatenbank</b> (z.B. Neo4j). Achtung: schwer horizontal skalierbar.', src: 'S. 121' },
    { q: 'Auswertungen/Aggregationen über riesige Datenmengen', a: '<b>Spaltenorientierte</b> Datenbank – Effizienzvorteile bei Analyse, Aggregation, Kompression (z.B. BigTable, HBase; SAP HANA für Reporting).', src: 'S. 120' },
    { q: 'Semistrukturierte Daten mit wechselnden Feldern (z.B. JSON)', a: '<b>Dokumentbasierte</b> Datenbank (CouchDB, MongoDB) – schemafrei, Dokumente in JSON/BSON/XML.', src: 'S. 120' },
    { q: 'Klassische betriebliche Daten (Kunden, Aufträge, Rechnungen) auf einem Server', a: '<b>Relationale</b> Datenbank – seit den 1970ern der wichtigste Typ für betriebswirtschaftliche Anwendungen; vertikal gut skalierbar.', src: 'S. 9, 115–116' }
  ];

  root.innerHTML = `
    <div class="page-head"><h1>NoSQL & verteilte Datenbanken 🌐</h1>
      <p class="muted">Skript Kap. 14–15. Laut Modulbeschreibung Lernziel: „NoSQL Datenbanken und CAP Theorem“ – und laut deinem Dozenten sehr wahrscheinlich klausurrelevant.</p></div>
    <div class="row-actions" style="margin-bottom:16px">
      <a class="btn btn-primary" href="#/quiz?t=nosql&mode=smart&n=10">❓ NoSQL-Quiz (${nQ} Fragen)</a>
      <a class="btn" href="#/karten?t=nosql">🃏 Karteikarten (${nC})</a>
      <a class="btn btn-ghost" href="#/lernen/nosql">📚 Zusammenfassung</a>
    </div>

    <section class="card">
      <h2>1 · Warum überhaupt NoSQL? – Skalierung</h2>
      <p><b>Big Data</b> = extrem große Datenmengen an den Grenzen der Speicher- und Verarbeitungskapazität. Zwei Wege, mehr Kapazität zu bekommen:</p>
      <div class="scale-viz">
        <figure><svg viewBox="0 0 200 150" role="img" aria-label="Vertikale Skalierung: ein Server wird größer">
          <rect x="70" y="95" width="60" height="45" rx="6" class="srv dim"/><rect x="60" y="20" width="80" height="120" rx="8" class="srv"/>
          ${[40, 60, 80, 100, 120].map((y) => `<line x1="72" y1="${y}" x2="128" y2="${y}" class="srv-l"/>`).join('')}
          <path d="M160 120 L160 30" class="arrow-l"/><polygon points="154,36 160,24 166,36" class="arrow-h"/></svg>
          <figcaption><b>Vertikal (scale-up)</b><br>größerer Rechner: mehr Speicher, mehr CPU. Gut für relationale DBs.</figcaption></figure>
        <figure><svg viewBox="0 0 200 150" role="img" aria-label="Horizontale Skalierung: viele Server">
          ${[[20, 50], [80, 50], [140, 50], [50, 100], [110, 100]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="40" height="40" rx="6" class="srv ${i > 2 ? 'new' : ''}"/>`).join('')}
          <path d="M40 70 L100 70 L160 70 M70 120 L130 120 M40 90 L70 100 M160 90 L130 100" class="net"/></svg>
          <figcaption><b>Horizontal (scale-out)</b><br>mehr Rechner → <b>verteiltes</b> System. Relationale DBs schaffen das nicht effizient.</figcaption></figure>
      </div>
      <h3>Zeilen- vs. spaltenorientiert gespeichert (S. 116, 120)</h3>
      <div class="store-viz">
        <div><b>relational (zeilenweise)</b><div class="cells">${['1', 'Peter', '42', '2', 'Paul', '18', '3', 'Mary', '36'].map((v, i) => `<span class="cell r${Math.floor(i / 3)}">${v}</span>`).join('')}</div></div>
        <div><b>spaltenorientiert</b><div class="cells">${['1', '2', '3', 'Peter', 'Paul', 'Mary', '42', '18', '36'].map((v, i) => `<span class="cell r${['1', 'Peter', '42'].includes(v) ? 0 : ['2', 'Paul', '18'].includes(v) ? 1 : 2}">${v}</span>`).join('')}</div></div>
      </div>
    </section>

    <section class="card">
      <h2>2 · Das CAP-Theorem</h2>
      <p class="lead">In einem verteilten Datenbanksystem können nur <b>zwei</b> der drei Eigenschaften gleichzeitig erfüllt sein (Satz 14.3). Klick auf eine Kante!</p>
      <div class="cap">
        <svg viewBox="0 0 320 280" class="cap-svg" role="group" aria-label="CAP-Dreieck">
          <line x1="160" y1="30" x2="40" y2="240" class="cap-edge" data-cap="CP" tabindex="0"/>
          <line x1="160" y1="30" x2="280" y2="240" class="cap-edge" data-cap="AP" tabindex="0"/>
          <line x1="40" y1="240" x2="280" y2="240" class="cap-edge" data-cap="CA" tabindex="0"/>
          <circle cx="160" cy="30" r="24" class="cap-v"/><text x="160" y="31" class="cap-l" text-anchor="middle" dominant-baseline="central">P</text>
          <circle cx="40" cy="240" r="24" class="cap-v"/><text x="40" y="241" class="cap-l" text-anchor="middle" dominant-baseline="central">C</text>
          <circle cx="280" cy="240" r="24" class="cap-v"/><text x="280" y="241" class="cap-l" text-anchor="middle" dominant-baseline="central">A</text>
          <text x="82" y="128" class="cap-e" text-anchor="middle">CP</text><text x="238" y="128" class="cap-e" text-anchor="middle">AP</text><text x="160" y="262" class="cap-e" text-anchor="middle">CA</text>
        </svg>
        <div class="cap-info" id="cap-info">
          <dl class="cap-defs">
            <dt><span class="code-pill cC">C</span> Consistency – Konsistenz</dt><dd>Jederzeit konsistenter Zustand; eine Transaktion wird komplett oder gar nicht ausgeführt. Geänderte Werte erst lesbar, wenn <b>alle</b> Knoten aktualisiert sind.</dd>
            <dt><span class="code-pill c1">A</span> Availability – Verfügbarkeit</dt><dd>Stets schnelle, akzeptable Reaktionszeit auf jede Anfrage.</dd>
            <dt><span class="code-pill cM">P</span> Partition tolerance – Partitionstoleranz</dt><dd>Ausfall eines Knotens oder einer Verbindung führt nicht zum Ausfall des Gesamtsystems.</dd>
          </dl>
        </div>
      </div>
      <p class="small muted">Vermutung: Eric Brewer (2000) · Beweis: Seth Gilbert & Nancy Lynch (2002).</p>
    </section>

    <section class="card">
      <h2>3 · Probier den Beweis selbst aus</h2>
      <p>Zwei Knoten speichern dieselbe Datenbank. <b>N1</b> nimmt Schreibzugriffe an, <b>N2</b> beantwortet Lesezugriffe. Normalerweise synchronisiert die Nachricht <b>M</b> beide.</p>
      <div class="sim">
        <svg viewBox="0 0 520 170" class="sim-svg" id="sim">
          <g class="node" id="n1"><rect x="40" y="50" width="140" height="80" rx="12"/><text x="110" y="78" text-anchor="middle">N1 (schreiben)</text><text x="110" y="108" text-anchor="middle" class="state" id="s1">D0</text></g>
          <g class="node" id="n2"><rect x="340" y="50" width="140" height="80" rx="12"/><text x="410" y="78" text-anchor="middle">N2 (lesen)</text><text x="410" y="108" text-anchor="middle" class="state" id="s2">D0</text></g>
          <line x1="180" y1="90" x2="340" y2="90" class="link" id="link"/>
          <text x="260" y="80" text-anchor="middle" class="msg" id="msg"></text>
          <text x="260" y="122" text-anchor="middle" class="cut" id="cut"></text>
        </svg>
        <div class="row-actions">
          <button class="btn" data-sim="write">✍️ Auf N1 schreiben (D0 → D1)</button>
          <button class="btn" data-sim="cut">✂️ Verbindung stören</button>
          <button class="btn btn-ghost" data-sim="reset">↺ Neu</button>
        </div>
        <div class="sim-choice" id="sim-choice" hidden>
          <p><b>Die Verbindung ist gestört und N1 hat D1, N2 noch D0. Ein Nutzer will von N2 lesen. Was tust du?</b></p>
          <div class="row-actions"><button class="btn" data-sim="cp">🔒 Konsistenz zuerst</button><button class="btn" data-sim="ap">⚡ Verfügbarkeit zuerst</button></div>
        </div>
        <div id="sim-out" aria-live="polite"></div>
      </div>
    </section>

    <section class="card">
      <h2>4 · Warum Konsistenz zählt (Bsp. 14.2)</h2>
      <div class="table-wrap"><table class="table timeline">
        <thead><tr><th>Zeit</th><th>Aktion</th><th>Kontostand</th></tr></thead>
        <tbody><tr><td>1</td><td>Überweisung T1 (+1000 €) beginnt</td><td>0 €</td></tr><tr><td>2</td><td>Überweisung T2 (+50 €) beginnt</td><td>0 €</td></tr>
        <tr><td>3</td><td>T1 fertig</td><td>1000 €</td></tr><tr class="bad"><td>4</td><td>T2 fertig – rechnet mit dem alten Stand 0 €</td><td><b>50 €</b> 😱</td></tr></tbody></table></div>
      <p>Jede Transaktion ist für sich korrekt – trotzdem fehlen 1000 €. Für Finanzdienste ist Konsistenz daher wesentlich.</p>
      <div class="vs">
        <div class="ok-box"><b>ACID</b><br><span class="small">striktes Konsistenzmodell der relationalen Datenbanken</span></div>
        <div class="bad-box neutral"><b>BASE</b><br><span class="small"><b>B</b>asically <b>A</b>vailable, <b>S</b>oft state, <b>E</b>ventually consistent – schwächer, für verteilte A–P-Systeme</span></div>
      </div>
    </section>

    <section class="card">
      <h2>5 · Was ist eine NoSQL-Datenbank? (Def. 14.4)</h2>
      <p>Ein Datenbanksystem, das <b>schemafrei</b> ist oder nur <b>schwache Schemarestriktionen</b> hat – insbesondere <b>nicht relational</b>. Oft außerdem: horizontal skalierbar (Sharding), <b>BASE</b> statt ACID, quelloffen. Nach CAP also meist <b>A–P</b> oder <b>C–P</b>.</p>
      <div class="types">
        <article class="type"><h3>🔑 Key-Value Store</h3>
          <div class="kv">${[['user:17', '"Anna"'], ['cart:17', '[4711, 0815]'], ['sess:ab3', '{…}']].map(([k, v]) => `<div><span class="k">${k}</span><span class="arr">→</span><span class="v">${esc(v)}</span></div>`).join('')}</div>
          <p class="small">Im Wesentlichen <b>assoziative Arrays</b>. Keine Suche über den Wert.<br><i>Riak, Redis, MemCacheDB</i></p></article>
        <article class="type"><h3>📄 Dokumentbasiert</h3>
          <pre class="json">{
  "name": "Anna",
  "ort": "Hagen",
  "hobbys": ["Comics", "SQL"]
}</pre>
          <p class="small">Dokumente = dynamisch strukturierte Werte, meist <b>JSON/BSON</b> oder XML.<br><i>CouchDB, MongoDB</i></p></article>
        <article class="type"><h3>📊 Spaltenorientiert</h3>
          <div class="colstore">${[['id', '1', '2', '3'], ['name', 'Peter', 'Paul', 'Mary'], ['alter', '42', '18', '36']].map((c) => `<div class="col"><b>${c[0]}</b>${c.slice(1).map((v) => `<span>${v}</span>`).join('')}</div>`).join('')}</div>
          <p class="small">„Wide Column Stores“: stark bei <b>Analyse, Aggregation, Kompression</b>; Einfügen/Löschen und Joins aufwendig.<br><i>BigTable, HBase, Cassandra, SimpleDB</i></p></article>
        <article class="type"><h3>🕸️ Graphdatenbank</h3>
          <svg viewBox="0 0 200 110" class="graph"><path d="M40 30 L110 20 L170 60 L100 90 L40 30 M110 20 L100 90" class="ge"/>
            ${[[40, 30, 'Anna'], [110, 20, 'Bob'], [170, 60, 'Cem'], [100, 90, 'Dora']].map(([x, y, n]) => `<circle cx="${x}" cy="${y}" r="14" class="gn"/><text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" class="gt">${n}</text>`).join('')}</svg>
          <p class="small">Speichert effizient <b>Knoten und Beziehungen</b>: soziale Netze, Straßennetze, Busfahrpläne. Kaum horizontal skalierbar.<br><i>Neo4j, FlockDB, Pregel</i></p></article>
      </div>
    </section>

    <section class="card">
      <h2>6 · Welche Datenbank wofür? (Entscheidungshilfe)</h2>
      <p class="small muted">Die Modulbeschreibung verlangt, „Einsatzmöglichkeiten relationaler und nichtrelationaler Datenbanken … abschätzen und beurteilen“ zu können. Tippe auf ein Szenario.</p>
      <div class="scen">${SCEN.map((s, i) => `<details class="scen-item"><summary>${esc(s.q)}</summary><p>${s.a} <span class="src">Skript ${esc(s.src)}</span></p></details>`).join('')}</div>
    </section>

    <section class="card">
      <h2>7 · MapReduce (Google 2004)</h2>
      <p>Für verteilte Daten gibt es kein SELECT mehr. MapReduce zerlegt die Arbeit in zwei Phasen – <b>map</b> (auf jedes Element anwenden) und <b>reduce</b> (zu einem Wert zusammenfassen). Beispiel aus dem Skript: Summe der Kuben 1³ + 2³ + 3³.</p>
      <div class="mr" id="mr">
        <div class="mr-row" data-row="0"><span class="mr-lbl">Liste</span>${[1, 2, 3].map((x) => `<span class="mr-cell">${x}</span>`).join('')}</div>
        <div class="mr-row" data-row="1" hidden><span class="mr-lbl">map(x → x³)</span>${[1, 8, 27].map((x) => `<span class="mr-cell m">${x}</span>`).join('')}</div>
        <div class="mr-row" data-row="2" hidden><span class="mr-lbl">reduce(+, 0)</span><span class="mr-cell r">0+1 = 1</span><span class="mr-cell r">1+8 = 9</span><span class="mr-cell r">9+27 = <b>36</b></span></div>
      </div>
      <div class="row-actions"><button class="btn btn-primary" id="mr-next">Nächster Schritt ▶</button><button class="btn btn-ghost" id="mr-reset">↺</button></div>
      <div class="mr-flow">
        ${['Eingabe in 16–64 MB-Teile', 'Master verteilt Aufgaben', 'Map-Worker erzeugen (key, value)', 'Zwischenergebnisse', 'Reduce-Worker gruppieren nach key', 'Ausgabedatei'].map((s, i) => `<div class="mr-step"><span>${i + 1}</span>${s}</div>`).join('<i>→</i>')}
      </div>
      <p class="small muted">Abb. 15.1, S. 124: map(key, value) → list&lt;key2, value2&gt;; reduce(key2, list&lt;value2&gt;) → list&lt;key3, value3&gt;.</p>
    </section>

    <section class="card">
      <h2>8 · Konsistentes Hashing</h2>
      <p>Jeder Server ist für einen <b>Bereich</b> von Hashwerten auf einem Ring zuständig (nicht für einzelne Werte). Kommt ein Server dazu, übernimmt er nur Objekte seines Nachfolgers – der Rest bleibt, wo er ist.</p>
      <div class="ring-wrap"><svg viewBox="0 0 260 260" class="ring-svg" id="ring"></svg>
        <div><p id="ring-txt" class="small"></p><button class="btn" id="ring-btn">➕ Server 5 hinzufügen</button></div></div>
    </section>

    <section class="card">
      <h2>9 · Vektoruhren (kurz)</h2>
      <p>In verteilten Systemen sagt die reine Uhrzeit nichts über <b>Ursache und Wirkung</b>. Eine <b>Lamport-Uhr</b> ist ein streng monoton steigender Zeitstempel. <b>Vektoruhren</b> hängen jeder Nachricht die <b>Absender-ID und dessen Lamport-Zähler</b> an (z.B. <code>A:2, B:1</code>) – so lässt sich auch nach gestörter Kommunikation der aktuelle Stand rekonstruieren.</p>
      <div class="vc">${[['A', 'A:1', 'a'], ['A', 'A:2', 'x (Korrektur)'], ['B', 'A:1, B:1', 'ab (veraltet)']].map(([who, clock, msg]) => `<div class="vc-msg"><b>${who}</b> sendet „${msg}“ <code>${clock}</code></div>`).join('')}
        <p class="small">C sieht: „ab“ basiert auf A:1, es gibt aber schon A:2 → „ab“ ist veraltet. (Abb. 15.7)</p></div>
    </section>

    <aside class="callout exam"><b>🎯 Typische Prüfungsfragen</b>
      <ul><li>Erkläre das CAP-Theorem und nenne für CA, CP und AP je ein Beispiel.</li><li>Warum lassen sich relationale DBs schlecht horizontal skalieren?</li><li>Was unterscheidet ACID von BASE?</li><li>Nenne die vier NoSQL-Typen mit je einem Vertreter.</li><li>Welche Datenbank würdest du für Szenario X wählen – und warum?</li></ul>
      <a class="btn btn-primary btn-sm" href="#/quiz?t=nosql&mode=smart&n=15">Jetzt abfragen lassen</a></aside>`;

  /* CAP-Dreieck */
  const info = $('#cap-info', root), defs = info.innerHTML;
  $$('.cap-edge', root).forEach((e) => {
    const act = () => {
      $$('.cap-edge', root).forEach((x) => x.classList.toggle('on', x === e));
      const c = CAP[e.dataset.cap];
      info.innerHTML = `<h3>${c.title}</h3><p>${c.text}</p><p class="small"><b>Beispiele (Abb. 14.6):</b> ${c.ex}</p><button class="link small" id="cap-back">← Begriffe</button>`;
      $('#cap-back', info).addEventListener('click', () => { info.innerHTML = defs; $$('.cap-edge', root).forEach((x) => x.classList.remove('on')); });
    };
    e.addEventListener('click', act);
    e.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); act(); } });
  });

  /* Beweis-Simulation */
  const sim = { written: false, cut: false };
  const set = (id, t) => { $('#' + id, root).textContent = t; };
  const out = $('#sim-out', root);
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sim]');
    if (!b) return;
    const a = b.dataset.sim;
    if (a === 'reset') {
      Object.assign(sim, { written: false, cut: false });
      set('s1', 'D0'); set('s2', 'D0'); set('msg', ''); set('cut', '');
      $('#link', root).classList.remove('broken'); $('#n2', root).classList.remove('off', 'stale');
      $('#sim-choice', root).hidden = true; out.innerHTML = '';
    }
    if (a === 'cut') { sim.cut = true; $('#link', root).classList.add('broken'); set('cut', '✂ Verbindung gestört'); out.innerHTML = '<p class="small">Jetzt auf N1 schreiben …</p>'; }
    if (a === 'write') {
      sim.written = true; set('s1', 'D1');
      if (!sim.cut) {
        set('msg', '— M →'); setTimeout(() => { set('s2', 'D1'); set('msg', '✓ synchron'); }, 600);
        out.innerHTML = '<p class="small">Normalfall: Nachricht M synchronisiert N2 → beide haben D1 (Abb. 14.4).</p>';
      } else {
        set('msg', 'M ✗'); $('#n2', root).classList.add('stale');
        $('#sim-choice', root).hidden = false;
        out.innerHTML = '<p class="small">N2 wurde <b>nicht</b> synchronisiert (Abb. 14.5).</p>';
      }
    }
    if (a === 'cp') { $('#n2', root).classList.add('off'); set('s2', 'offline'); out.innerHTML = '<div class="verdict info"><b>C–P:</b> Damit niemand den veralteten Stand D0 liest, nimmst du N2 vom Netz → <b>keine Verfügbarkeit</b>. (z.B. Online-Banking)</div>'; }
    if (a === 'ap') { set('s2', 'D0 (alt!)'); out.innerHTML = '<div class="verdict partial"><b>A–P:</b> N2 antwortet sofort – aber mit dem alten Stand D0 → <b>keine Konsistenz</b>. (z.B. DNS, Clouds)<br><span class="small">Und C–A? Dann darf es N2 gar nicht geben – kein verteiltes System, also nicht ausfallsicher.</span></div>'; }
  });

  /* MapReduce */
  let mr = 0;
  $('#mr-next', root).addEventListener('click', () => { mr = Math.min(2, mr + 1); $(`[data-row="${mr}"]`, root).hidden = false; });
  $('#mr-reset', root).addEventListener('click', () => { mr = 0; $$('[data-row]', root).forEach((r) => { r.hidden = r.dataset.row !== '0'; }); });

  /* Hash-Ring (Werte nach Abb. 15.2/15.3) */
  const objs = [12, 75, 110, 253, 554];
  let servers = [{ n: 'Server 1', p: 40 }, { n: 'Server 2', p: 150 }, { n: 'Server 3', p: 300 }, { n: 'Server 4', p: 600 }];
  const MAXH = 700;
  const owner = (h) => (servers.slice().sort((a, b) => a.p - b.p).find((s) => s.p >= h) || servers.slice().sort((a, b) => a.p - b.p)[0]);
  const pos = (h, r) => { const ang = (h / MAXH) * 2 * Math.PI - Math.PI / 2; return [130 + r * Math.cos(ang), 130 + r * Math.sin(ang)]; };
  function drawRing(changed = []) {
    const svg = $('#ring', root);
    svg.innerHTML = `<circle cx="130" cy="130" r="95" class="ring-c"/>` +
      servers.map((s) => { const [x, y] = pos(s.p, 95); return `<circle cx="${x}" cy="${y}" r="13" class="ring-s ${s.n === 'Server 5' ? 'new' : ''}"/><text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" class="ring-st">${s.n.slice(-1)}</text>`; }).join('') +
      objs.map((h) => { const [x, y] = pos(h, 62); const o = owner(h); return `<rect x="${x - 15}" y="${y - 10}" width="30" height="20" rx="4" class="ring-o ${changed.includes(h) ? 'moved' : ''}"/><text x="${x}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" class="ring-ot">${h}</text><title>→ ${o.n}</title>`; }).join('');
    $('#ring-txt', root).innerHTML = objs.map((h) => `Objekt ${h} → <b>${owner(h).n}</b>`).join('<br>');
  }
  drawRing();
  $('#ring-btn', root).addEventListener('click', (e) => {
    if (servers.length === 4) {
      const before = Object.fromEntries(objs.map((h) => [h, owner(h).n]));
      servers.push({ n: 'Server 5', p: 90 });
      const changed = objs.filter((h) => owner(h).n !== before[h]);
      drawRing(changed);
      $('#ring-txt', root).insertAdjacentHTML('beforeend', `<br><br>✨ Nur <b>${changed.length}</b> von ${objs.length} Objekten ist umgezogen (markiert).`);
      e.currentTarget.textContent = '➖ Server 5 entfernen';
    } else {
      servers = servers.filter((s) => s.n !== 'Server 5');
      drawRing();
      e.currentTarget.textContent = '➕ Server 5 hinzufügen';
    }
  });
};
