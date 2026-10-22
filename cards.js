/**
 * Karteikarten mit Flip-Animation und Leitner-Bewertung („gewusst“ / „nicht gewusst“).
 * Tastatur: Leertaste = umdrehen, 1 = nicht gewusst, 2 = gewusst, ←/→ = blättern.
 */
window.DBT = window.DBT || {};
DBT.views = DBT.views || {};

DBT.views.cards = (root, params, query) => {
  const { esc, $, $$, shuffle } = DBT.util;
  const store = DBT.store.get();
  const topicFilter = query.get('t') ? query.get('t').split(',') : [];
  const onlyDue = query.get('due') === '1';

  let pool = DBT.data.flashcards.filter((c) => !topicFilter.length || topicFilter.includes(c.t));
  if (onlyDue) pool = pool.filter((c) => !store.c[c.id] || DBT.srs.isDue(store.c[c.id]));
  // fällige/neue zuerst, dann nach Box sortiert, innerhalb gleicher Box gemischt
  pool = shuffle(pool).sort((a, b) => {
    const ia = store.c[a.id], ib = store.c[b.id];
    const ka = !ia ? 1 : DBT.srs.isDue(ia) ? 0 : 2 + ia.box;
    const kb = !ib ? 1 : DBT.srs.isDue(ib) ? 0 : 2 + ib.box;
    return ka - kb;
  });

  const dueAll = DBT.srs.dueCount('c');
  root.innerHTML = `
    <div class="page-head"><h1>Karteikarten</h1><p class="muted">Tippe auf die Karte zum Umdrehen und bewerte ehrlich – das Leitner-System plant die nächste Wiederholung.</p></div>
    <div class="card filters">
      <div class="chips-scroll">
        <a class="chip-link ${!topicFilter.length ? 'active' : ''}" href="#/karten${onlyDue ? '?due=1' : ''}">Alle</a>
        ${DBT.data.topics.filter((t) => DBT.data.flashcards.some((c) => c.t === t.id)).map((t) =>
          `<a class="chip-link ${topicFilter.includes(t.id) ? 'active' : ''}" href="#/karten?t=${t.id}${onlyDue ? '&due=1' : ''}">${t.icon} ${esc(t.short)}</a>`).join('')}
      </div>
      <label class="switch"><input type="checkbox" id="only-due" ${onlyDue ? 'checked' : ''}><span>nur fällige &amp; neue (${dueAll} fällig)</span></label>
    </div>
    <div id="deck"></div>`;

  $('#only-due', root).addEventListener('change', (e) => {
    const qs = new URLSearchParams(query);
    if (e.target.checked) qs.set('due', '1'); else qs.delete('due');
    location.hash = `#/karten${qs.toString() ? '?' + qs : ''}`;
  });

  const deck = $('#deck', root);
  if (!pool.length) {
    deck.innerHTML = `<div class="card empty"><h2>🎉 Alles erledigt</h2><p class="muted">Keine fälligen Karten in dieser Auswahl.</p><a class="btn" href="#/karten">Alle Karten anzeigen</a></div>`;
    return;
  }

  let i = 0, known = 0, unknown = 0;

  function render() {
    if (i >= pool.length) {
      deck.innerHTML = `<div class="card empty"><h2>Stapel durch! 🙌</h2><p class="lead">${known} gewusst · ${unknown} nicht gewusst</p>
        <div class="row-actions"><a class="btn btn-primary" href="#/karten?${new URLSearchParams({ ...Object.fromEntries(query), r: Date.now() })}">Nochmal</a><a class="btn" href="#/quiz?mode=smart&n=10${topicFilter.length ? '&t=' + topicFilter.join(',') : ''}">Quiz zum Thema</a></div></div>`;
      return;
    }
    const c = pool[i];
    const it = DBT.store.get().c[c.id];
    deck.innerHTML = `
      <div class="deck-meta"><span class="chip chip-topic">${esc(DBT.question.topicTitle(c.t))}</span><span class="muted small">${i + 1} / ${pool.length} · Box ${it ? it.box : '–'}</span></div>
      <div class="flip" tabindex="0" role="button" aria-label="Karte umdrehen" aria-pressed="false">
        <div class="flip-inner">
          <div class="flip-face front"><span class="face-label">Frage</span><div class="face-text">${c.f}</div><span class="face-hint">Tippen zum Umdrehen</span></div>
          <div class="flip-face back"><span class="face-label">Antwort</span><div class="face-text">${c.b}</div><span class="face-src">📖 ${esc(c.s)}</span></div>
        </div>
      </div>
      <div class="deck-actions">
        <button class="btn btn-bad btn-lg" data-r="0" disabled>✗ Nicht gewusst <kbd>1</kbd></button>
        <button class="btn btn-ok btn-lg" data-r="1" disabled>✓ Gewusst <kbd>2</kbd></button>
      </div>`;
    const flip = $('.flip', deck);
    const toggle = () => {
      flip.classList.toggle('flipped');
      flip.setAttribute('aria-pressed', flip.classList.contains('flipped'));
      $$('.deck-actions .btn', deck).forEach((b) => { b.disabled = false; });
    };
    flip.addEventListener('click', toggle);
    $$('.deck-actions .btn', deck).forEach((b) => b.addEventListener('click', () => rate(b.dataset.r === '1')));
  }

  function rate(ok) {
    DBT.srs.review('c', pool[i].id, ok);
    ok ? known++ : unknown++;
    i++;
    render();
  }

  const onKey = (e) => {
    if (e.target.matches('input, select, textarea')) return;
    const flip = $('.flip', deck);
    if (!flip) return;
    if (e.key === ' ') { e.preventDefault(); flip.click(); }
    else if ((e.key === '1' || e.key === '2') && flip.classList.contains('flipped')) rate(e.key === '2');
    else if (e.key === 'ArrowRight') { i = Math.min(pool.length, i + 1); render(); }
    else if (e.key === 'ArrowLeft') { i = Math.max(0, i - 1); render(); }
  };
  document.addEventListener('keydown', onKey);
  render();
  return () => document.removeEventListener('keydown', onKey);
};
