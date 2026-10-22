/**
 * ERM-Werkstatt: Grundlagen (bebildert), Kardinalitäten-Trainer, Modellierungsaufgaben
 * mit gezeichneter Musterlösung, Regeln für die Tabellenableitung.
 *
 * Routen: #/erm · #/erm/trainer · #/erm/aufgaben · #/erm/aufgabe/:id · #/erm/ableitung
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.erm = (root, params) => {
  const { esc, $, $$, shuffle, toast } = DBT.util;
  const R = DBT.ermsvg;
  const CODE_TEXT = { '1': 'genau eins', C: 'höchstens eins (kann auch keins)', M: 'mindestens eins (evtl. mehrere)', CM: 'beliebig viele (auch keins)' };
  const CODE_SHORT = { '1': 'genau 1', C: '0 oder 1', M: '1 bis viele', CM: '0 bis viele' };

  const tabs = (active) => `<nav class="subtabs" aria-label="ERM-Bereiche">
    ${[['', '📘 Grundlagen'], ['trainer', '🎯 Kardinalitäten-Trainer'], ['aufgaben', '✍️ Aufgaben'], ['ableitung', '🗂️ ERM → Tabellen']]
      .map(([k, l]) => `<a href="#/erm${k ? '/' + k : ''}" class="${active === k ? 'active' : ''}">${l}</a>`).join('')}
  </nav>`;
  const head = `<div class="page-head"><h1>ERM-Werkstatt 🧩</h1><p class="muted">Das ER-Modell bringt <b>30 von 100 Punkten</b> (Aufgabe 1 in beiden Klausuren) – plus 15 Punkte für die Tabellenableitung.</p></div>`;

  /** Ableitungsregel für ein Kardinalitätspaar (ea am Ende A, eb am Ende B). */
  function ruleFor(ea, eb, A, B) {
    const n = (c) => c === 'M' || c === 'CM';
    const must = (c) => c === '1' || c === 'M';
    if (!n(ea) && !n(eb)) {
      if (ea === '1' && eb === '1') return `<b>1-1 → Regel 12:</b> ${esc(A)} und ${esc(B)} werden zu <b>einer Tabelle</b> zusammengefasst.`;
      if (ea === 'C' && eb === 'C') return `<b>C-C → Regel 11:</b> <b>Beziehungstabelle</b> mit beiden Primärschlüsseln als Fremdschlüssel (NOT NULL UNIQUE, gemeinsam PK).`;
      const one = ea === '1' ? A : B, c = ea === 'C' ? A : B;
      return `<b>1-C → Regel 10:</b> Der PK von <b>${esc(one)}</b> wird Fremdschlüssel in <b>${esc(c)}</b> – mit <code>NOT NULL UNIQUE</code>.`;
    }
    if (n(ea) && n(eb)) {
      return `<b>M:N → Regel 8:</b> <b>Beziehungstabelle</b> mit den Primärschlüsseln von ${esc(A)} und ${esc(B)} als Fremdschlüssel.${ea === 'M' || eb === 'M' ? ' <span class="warn-t">⚠️ „mindestens eins“ (M) kann SQL nicht garantieren (Skript 9.6).</span>' : ''}`;
    }
    const nSide = n(ea) ? A : B, oneSide = n(ea) ? B : A, oneCode = n(ea) ? eb : ea, nCode = n(ea) ? ea : eb;
    return `<b>1:N → Regel ${oneCode === '1' ? '7' : '6'}:</b> Der PK von <b>${esc(oneSide)}</b> wird Fremdschlüssel in <b>${esc(nSide)}</b> (N-Seite)${oneCode === '1' ? ' – <code>NOT NULL</code>' : ' – darf NULL sein'}.${nCode === 'M' ? ' <span class="warn-t">⚠️ „mindestens eins“ (M) ist laut Skript 9.6 nicht sauber implementierbar.</span>' : ''}`;
  }

  const twoBox = (A, B, verb, ea, eb) => R.render({
    w: 640, h: 150,
    entities: [{ id: 'a', label: A, x: 95, y: 75 }, { id: 'b', label: B, x: 545, y: 75 }],
    rels: [{ a: 'a', b: 'b', verb, ea, eb }]
  }, { label: `${A} ${verb} ${B}` });

  const sub = params.id || '';
  if (sub === 'trainer') return trainer();
  if (sub === 'aufgaben') return taskList();
  if (sub === 'aufgabe') return taskDetail(DBT.data.ermTasks.find((t) => t.id === params.sub));
  if (sub === 'ableitung') return derivation();
  return basics();

  /* ───────── Grundlagen ───────── */
  function basics() {
    root.innerHTML = `${head}${tabs('')}
      <section class="card">
        <h2>Die drei Bausteine (Chen-Notation)</h2>
        <div class="erm-parts">
          <div class="part"><svg viewBox="0 0 120 60"><rect x="10" y="12" width="100" height="36" rx="5" class="p-ent"/><text x="60" y="31" text-anchor="middle" dominant-baseline="central" class="p-t">Projekt</text></svg>
            <b>Entitätstyp</b><span>Rechteck · Substantiv im Singular · wird zur Tabelle</span></div>
          <div class="part"><svg viewBox="0 0 120 60"><polygon points="60,6 112,30 60,54 8,30" class="p-rel"/><text x="60" y="31" text-anchor="middle" dominant-baseline="central" class="p-t">leitet</text></svg>
            <b>Beziehung</b><span>Raute mit <b>Verb</b> zwischen zwei Entitätstypen</span></div>
          <div class="part"><svg viewBox="0 0 120 60"><ellipse cx="60" cy="30" rx="50" ry="18" class="p-attr"/><text x="60" y="31" text-anchor="middle" dominant-baseline="central" class="p-t">name</text></svg>
            <b>Attribut</b><span>Ellipse – oder als Liste im Rechteck; PK unterstrichen</span></div>
        </div>
      </section>

      <section class="card">
        <h2>Kardinalitäten – das Herzstück</h2>
        <p>Jedes Linienende bekommt zwei Infos: die <b>Maximalzahl</b> (1 oder N) als Text und die <b>Mindestzahl</b> als Symbol: <b>Strich = muss</b>, <b>Kreis = kann</b>.</p>
        ${R.legend()}
        <h3>Beispiel aus dem Skript</h3>
        <div class="erm-wrap">${twoBox('Angestellter', 'Projekt', 'leitet', '1', 'CM')}</div>
        <div class="read-guide">
          <div><span class="rg-num">1</span> Ende am <b>Angestellten</b>: „1“ + Strich → <i>Ein Projekt hat <b>genau einen</b> Leiter.</i></div>
          <div><span class="rg-num">2</span> Ende am <b>Projekt</b>: „N“ + Kreis → <i>Ein Angestellter leitet <b>beliebig viele</b> Projekte (auch keins).</i></div>
          <div><span class="rg-num">3</span> Zusammen: <b>1-CM</b> („1:N muss-kann“).</div>
        </div>
        <div class="tip">🧠 <b>Lesetrick:</b> Die Angabe steht immer am <b>gegenüberliegenden</b> Entitätstyp (Skript S. 59). Frag dich: „Zu <u>einem</u> Projekt gehören wie viele Angestellte?“ → das schreibst du an den Angestellten.</div>
      </section>

      <section class="card">
        <h2>Signalwörter im Aufgabentext</h2>
        <div class="table-wrap"><table class="table signal">
          <thead><tr><th>Im Text steht …</th><th>Code</th><th>Bedeutung</th></tr></thead>
          <tbody>
            <tr><td>„jeder … genau ein“, „immer ein“, „muss … einen“</td><td><span class="code-pill c1">1</span></td><td>genau eins</td></tr>
            <tr><td>„höchstens ein“, „nicht jeder“, „kann … einen“, „es gibt auch leere …“</td><td><span class="code-pill cC">C</span></td><td>0 oder 1</td></tr>
            <tr><td>„mindestens ein“, „muss mehrere“</td><td><span class="code-pill cM">M</span></td><td>1 bis viele</td></tr>
            <tr><td>„mehrere“, „verschiedene“, „kann mehrere“, „vielleicht auch keine“</td><td><span class="code-pill cCM">CM</span></td><td>0 bis viele</td></tr>
          </tbody></table></div>
        <p class="small muted">Ableitung aus Tab. (8.1) des Skripts und den Formulierungen der beiden Klausuren.</p>
      </section>

      <section class="card">
        <h2>Das 5-Schritte-Rezept für Aufgabe 1</h2>
        <ol class="recipe big">
          <li><b>Substantive markieren</b> → Kandidaten für Entitätstypen. Kontextwörter („Schule“, „Getränkemarkt“) und Rollen („Klassenlehrer“) sind meist <i>keine</i> eigenen Entitäten.</li>
          <li><b>Attribute & Primärschlüssel</b> je Entitätstyp festlegen (im Zweifel künstliche ID).</li>
          <li><b>Verben markieren</b> → Beziehungen. Jeder Satz mit zwei Entitätstypen = eine Raute.</li>
          <li><b>Kardinalitäten</b> pro Ende bestimmen: „Zu <u>einem</u> B gehören wie viele A?“ – Max (1/N) und Min (kann/muss).</li>
          <li><b>Kontrolle:</b> Attribute, die von zwei Entitäten abhängen (z.B. Preis je Sorte UND Hersteller), gehören an die M:N-Beziehung.</li>
        </ol>
        <div class="row-actions"><a class="btn btn-primary" href="#/erm/trainer">Kardinalitäten trainieren</a><a class="btn" href="#/erm/aufgaben">Klausuraufgaben modellieren</a></div>
      </section>`;
  }

  /* ───────── Trainer ───────── */
  function trainer() {
    const items = shuffle(DBT.data.ermTrainer);
    let i = 0, score = 0;
    root.innerHTML = `${head}${tabs('trainer')}
      <div class="quiz-top"><div class="quiz-progress">${DBT.util.bar(0, 'bar-lg')}</div><span class="quiz-count"></span></div>
      <article class="card q-card" id="tr"></article>`;
    const box = $('#tr', root);

    function show() {
      if (i >= items.length) {
        DBT.store.update((s) => { s.erm = s.erm || {}; s.erm.trainerBest = Math.max(s.erm.trainerBest || 0, score); DBT.store.logActivity(); });
        box.innerHTML = `<div class="empty"><h2>${score} von ${items.length} Beziehungen komplett richtig 🎉</h2>
          <div class="row-actions" style="justify-content:center"><a class="btn btn-primary" href="#/erm/trainer?r=${Date.now()}">Nochmal</a><a class="btn" href="#/erm/aufgaben">Zu den Aufgaben</a></div></div>`;
        return;
      }
      const it = items[i];
      $('.quiz-count', root).textContent = `${i + 1} / ${items.length}`;
      $('.quiz-progress .bar span', root).style.width = `${(i / items.length) * 100}%`;
      const choice = (key, q) => `<div class="tr-q"><p>${q}</p><div class="tr-opts" data-key="${key}">
        ${['1', 'C', 'M', 'CM'].map((c) => `<button type="button" class="tr-opt" data-c="${c}"><span class="code-pill c${c}">${c}</span>${CODE_SHORT[c]}</button>`).join('')}</div></div>`;
      box.innerHTML = `
        <div class="q-meta"><span class="chip chip-topic">${esc(it.a)} – ${esc(it.b)}</span><span class="chip chip-ghost">📖 ${esc(it.src)}</span></div>
        <blockquote class="tr-text">${esc(it.text)}</blockquote>
        ${choice('ea', `Zu <b>einem</b> „${esc(it.b)}“ gehören wie viele „${esc(it.a)}“?`)}
        ${choice('eb', `Zu <b>einem</b> „${esc(it.a)}“ gehören wie viele „${esc(it.b)}“?`)}
        <div class="row-actions"><button class="btn btn-primary" id="tr-check" disabled>Prüfen</button></div>
        <div id="tr-fb"></div>`;
      const ans = {};
      $$('.tr-opts', box).forEach((grp) => grp.addEventListener('click', (e) => {
        const b = e.target.closest('.tr-opt');
        if (!b || grp.dataset.locked) return;
        ans[grp.dataset.key] = b.dataset.c;
        $$('.tr-opt', grp).forEach((x) => x.classList.toggle('sel', x === b));
        $('#tr-check', box).disabled = !(ans.ea && ans.eb);
      }));
      $('#tr-check', box).addEventListener('click', (e) => {
        if (e.currentTarget.dataset.next) { i++; show(); return; }
        const ok = ans.ea === it.ea && ans.eb === it.eb;
        if (ok) score++;
        $$('.tr-opts', box).forEach((grp) => {
          grp.dataset.locked = 1;
          const want = it[grp.dataset.key];
          $$('.tr-opt', grp).forEach((x) => { if (x.dataset.c === want) x.classList.add('ok'); else if (x.classList.contains('sel')) x.classList.add('bad'); });
        });
        $('#tr-fb', box).innerHTML = `<div class="feedback ${ok ? 'is-ok' : 'is-bad'}">
          <div class="fb-title">${ok ? '✓ Richtig!' : '✗ Nicht ganz'} – das ist eine <b>${it.ea}-${it.eb}</b>-Beziehung</div>
          <div class="erm-wrap">${twoBox(it.a, it.b, it.verb, it.ea, it.eb)}</div>
          <p>Am Ende „${esc(it.a)}“: <b>${it.ea}</b> = ${CODE_TEXT[it.ea]} · am Ende „${esc(it.b)}“: <b>${it.eb}</b> = ${CODE_TEXT[it.eb]}</p>
          <p class="small">🗂️ ${ruleFor(it.ea, it.eb, it.a, it.b)}</p></div>`;
        e.currentTarget.textContent = i + 1 < items.length ? 'Weiter →' : 'Auswertung';
        e.currentTarget.dataset.next = 1;
      });
    }
    show();
  }

  /* ───────── Aufgabenliste ───────── */
  function taskList() {
    const st = DBT.store.get().erm?.tasks || {};
    root.innerHTML = `${head}${tabs('aufgaben')}
      <aside class="callout info"><b>So übst du richtig</b><p>Lies den Text, zeichne das ERM <b>auf Papier</b> (wie in der Klausur), leite die Tabellen ab – und deck dann Schritt für Schritt die Musterlösung auf. Bewerte dich mit der Checkliste.</p></aside>
      <div class="task-list">
        ${DBT.data.ermTasks.map((t) => `<a class="task-item card" href="#/erm/aufgabe/${t.id}">
          <span class="task-kind kind-erm">ERM</span>
          <div class="task-item-body"><h3>${esc(t.title)}</h3><p class="small muted">${esc(t.src)}</p></div>
          <span class="chip lvl-${t.level}">${DBT.question.LEVEL_LABEL[t.level]}</span>
          <span class="task-pts">${st[t.id] !== undefined ? `<b>${Math.round(st[t.id])}</b> %` : ''}</span>
        </a>`).join('')}
      </div>`;
  }

  /* ───────── Einzelaufgabe ───────── */
  function taskDetail(t) {
    if (!t) { root.innerHTML = '<p>Aufgabe nicht gefunden.</p>'; return; }
    root.innerHTML = `${head}${tabs('aufgaben')}
      <article class="card">
        <div class="q-meta"><span class="chip lvl-${t.level}">${DBT.question.LEVEL_LABEL[t.level]}</span><span class="chip chip-ghost">📖 ${esc(t.src)}</span></div>
        <h2>ERM: ${esc(t.title)}</h2>
        <p>Erstellen Sie ein ERM. Folgende Sachverhalte sollen abgebildet werden:</p>
        <ul class="erm-text">${t.text.map((x) => `<li>${x}</li>`).join('')}</ul>
        <div class="reveal-steps">
          <button class="btn" data-step="1">1️⃣ Lösungsweg zeigen</button>
          <button class="btn" data-step="2">2️⃣ ER-Diagramm zeigen</button>
          <button class="btn" data-step="3">3️⃣ Tabellen zeigen</button>
          <button class="btn btn-primary" data-step="4">4️⃣ Selbst bewerten</button>
        </div>
      </article>
      <section class="card" data-panel="1" hidden><h2>Lösungsweg</h2><ol class="recipe">${t.steps.map((s) => `<li>${s}</li>`).join('')}</ol></section>
      <section class="card" data-panel="2" hidden><h2>Musterlösung als ER-Diagramm</h2>
        <div class="erm-wrap big">${R.render(t.diagram, { label: 'ER-Diagramm ' + t.title, scale: 1.3 })}</div>
        ${R.legend()}
        <p class="small muted">PK fett/unterstrichen. ${t.note ? esc(t.note) : ''}</p></section>
      <section class="card" data-panel="3" hidden><h2>Abgeleitete Tabellen</h2>
        <div class="table-wrap"><table class="table derive-t"><thead><tr><th>Tabelle</th><th>Primärschlüssel</th><th>Attribute</th></tr></thead>
        <tbody>${t.tables.map((r) => `<tr><td><b>${esc(r[0])}</b></td><td class="pkcell">${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>
        <p class="small muted"><span class="fk">punktiert unterstrichen</span> = Fremdschlüssel (wie in der Klausur verlangt).</p></section>
      <section class="card" data-panel="4" hidden><h2>Selbstbewertung</h2>
        <ul class="checklist">${t.checklist.map((c, i) => `<li><label class="check"><input type="checkbox" data-ci="${i}"><span>${esc(c)}</span></label></li>`).join('')}</ul>
        <p class="task-score">Erfüllt: <b id="pct">0</b> % (≈ <b id="pts">0</b> von ${t.points} P.)</p>
        <button class="btn btn-primary" id="save">Speichern</button></section>`;
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      const p = root.querySelector(`[data-panel="${b.dataset.step}"]`);
      p.hidden = false;
      p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    const calc = () => $$('[data-ci]:checked', root).length / t.checklist.length;
    $$('[data-ci]', root).forEach((c) => c.addEventListener('change', () => {
      $('#pct', root).textContent = Math.round(calc() * 100);
      $('#pts', root).textContent = Math.round(calc() * t.points * 10) / 10;
    }));
    $('#save', root).addEventListener('click', () => {
      DBT.store.update((s) => { s.erm = s.erm || {}; s.erm.tasks = s.erm.tasks || {}; s.erm.tasks[t.id] = Math.max(s.erm.tasks[t.id] || 0, calc() * 100); DBT.store.logActivity(); });
      toast('Gespeichert ✓');
    });
  }

  /* ───────── Ableitung ───────── */
  function derivation() {
    const cases = [
      ['Kunde', 'Auftrag', 'erteilt', 'C', 'CM', 'Regel 6'],
      ['Abteilung', 'Angestellter', 'hat', '1', 'CM', 'Regel 7'],
      ['Angestellter', 'Projekt', 'ist in', 'CM', 'CM', 'Regel 8'],
      ['Angestellter', 'Abteilung', 'leitet', '1', 'C', 'Regel 10'],
      ['Angestellter', 'Angestellter', 'verheiratet', 'C', 'C', 'Regel 11'],
      ['Angestellter', 'Dienstausweis', 'hat', '1', '1', 'Regel 12']
    ];
    root.innerHTML = `${head}${tabs('ableitung')}
      <section class="card">
        <h2>Von der Raute zur Tabelle</h2>
        <p>Jeder Entitätstyp wird eine Tabelle. Beziehungen werden mit <b>Fremdschlüsseln</b> umgesetzt – <i>wohin</i> der Fremdschlüssel kommt, hängt von den Kardinalitäten ab (Skript Kap. 9).</p>
        <div class="big-rules">
          <div class="br"><span class="br-ico">1:N</span><b>FK auf die N-Seite</b><span>„Viele zeigen auf einen.“</span></div>
          <div class="br"><span class="br-ico">M:N</span><b>Beziehungstabelle</b><span>mit beiden PKs als FK</span></div>
          <div class="br"><span class="br-ico">1:1</span><b>FK + UNIQUE</b><span>oder eine Tabelle (1-1)</span></div>
        </div>
      </section>
      ${cases.map(([A, B, v, ea, eb, rule]) => `<section class="card rule-card">
        <div class="rule-head"><span class="chip chip-topic">${rule}</span><b>${ea}-${eb}</b></div>
        <div class="erm-wrap">${twoBox(A, B, v, ea, eb)}</div>
        <p>${ruleFor(ea, eb, A, B)}</p>
      </section>`).join('')}
      <aside class="callout warn"><b>⚠️ Nicht sauber implementierbar (Skript 9.6)</b><p>C-M, 1-M, CM-M und M-M – also alles mit „<b>mindestens eins</b> (M)“ auf einer N-Seite. SQL kann das „mindestens“ nicht garantieren.</p></aside>
      <aside class="callout exam"><b>🎯 In der Klausur</b><p>Tabellenform „Tabellenname | Primärschlüssel | Attribute“, Fremdschlüssel <b>punktiert unterstrichen</b>. Eine Tabelle, die nach diesen Regeln abgeleitet ist, erfüllt automatisch die 1NF.</p></aside>`;
  }
};
