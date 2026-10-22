/**
 * Fragen-Komponente: rendert alle Fragetypen, nimmt Antworten entgegen und wertet aus.
 * Wird vom Quiz (sofortiges Feedback) und vom Prüfungsmodus (Auswertung am Ende) genutzt.
 *
 *   const qc = DBT.question.mount(q, rootEl, { onChange });
 *   qc.isAnswered()  → boolean
 *   qc.evaluate()    → { correct: boolean, score: 0..1 }
 *   qc.reveal()      → sperrt Eingaben, markiert richtig/falsch, zeigt Erklärung
 *   qc.choose(n)     → Tastaturauswahl (1..9)
 */
window.DBT = window.DBT || {};

DBT.question = (() => {
  const { esc, shuffle, norm, $$ } = DBT.util;
  const TYPE_LABEL = { sc: 'Single Choice', mc: 'Multiple Choice', tf: 'Wahr / Falsch', match: 'Zuordnung', cloze: 'Lückentext' };
  const LEVEL_LABEL = { 1: 'einfach', 2: 'mittel', 3: 'schwer', 4: 'klausurähnlich' };

  function topicTitle(id) {
    return DBT.data.topics.find((t) => t.id === id)?.title || id;
  }

  function header(q) {
    return `<div class="q-meta">
      <span class="chip chip-topic">${esc(topicTitle(q.t))}</span>
      <span class="chip lvl-${q.l}">${LEVEL_LABEL[q.l]}</span>
      <span class="chip chip-ghost">${TYPE_LABEL[q.y]}</span>
    </div>`;
  }

  function mount(q, root, opts = {}) {
    const onChange = opts.onChange || (() => {});
    let locked = false;
    // Optionen mischen, Original-Index merken
    const order = q.o ? (q.y === 'sc' || q.y === 'mc' ? shuffle(q.o.map((_, i) => i)) : q.o.map((_, i) => i)) : [];
    const selected = new Set();
    let tfValue = null;
    const rights = q.p ? shuffle(q.p.map((p) => p[1])) : [];

    let body = '';
    if (q.y === 'sc' || q.y === 'mc') {
      body = `<div class="options" role="${q.y === 'sc' ? 'radiogroup' : 'group'}">` + order.map((oi, k) =>
        `<button type="button" class="opt" data-i="${oi}" role="${q.y === 'sc' ? 'radio' : 'checkbox'}" aria-checked="false">
           <span class="opt-key">${k + 1}</span><span class="opt-txt">${q.o[oi]}</span></button>`).join('') + '</div>' +
        (q.y === 'mc' ? '<p class="hint">Mehrere Antworten können richtig sein.</p>' : '');
    } else if (q.y === 'tf') {
      body = `<div class="options tf" role="radiogroup">
        <button type="button" class="opt" data-tf="true" role="radio" aria-checked="false"><span class="opt-key">1</span><span class="opt-txt">Wahr</span></button>
        <button type="button" class="opt" data-tf="false" role="radio" aria-checked="false"><span class="opt-key">2</span><span class="opt-txt">Falsch</span></button></div>`;
    } else if (q.y === 'match') {
      body = '<div class="match">' + q.p.map((p, i) =>
        `<label class="match-row"><span class="match-left">${esc(p[0])}</span>
          <select data-mi="${i}" aria-label="Zuordnung für ${esc(p[0])}"><option value="">– wählen –</option>
          ${rights.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select></label>`).join('') + '</div>';
    }

    let qHtml = q.q;
    if (q.y === 'cloze') {
      let n = 0;
      qHtml = q.q.replace(/___/g, () => `<input class="blank" type="text" data-bi="${n++}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Lücke ${n}">`);
    }

    root.innerHTML = `${header(q)}<div class="q-text">${qHtml}</div>${body}<div class="feedback" hidden></div>`;

    // Interaktion
    $$('.opt', root).forEach((btn) => btn.addEventListener('click', () => {
      if (locked) return;
      if (q.y === 'tf') {
        tfValue = btn.dataset.tf === 'true';
        $$('.opt', root).forEach((b) => { b.classList.toggle('sel', b === btn); b.setAttribute('aria-checked', b === btn); });
      } else {
        const i = +btn.dataset.i;
        if (q.y === 'sc') { selected.clear(); selected.add(i); }
        else selected.has(i) ? selected.delete(i) : selected.add(i);
        $$('.opt', root).forEach((b) => { const on = selected.has(+b.dataset.i); b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
      }
      onChange();
    }));
    $$('select, .blank', root).forEach((el) => el.addEventListener('input', onChange));

    function isAnswered() {
      if (q.y === 'sc' || q.y === 'mc') return selected.size > 0;
      if (q.y === 'tf') return tfValue !== null;
      if (q.y === 'match') return $$('select', root).every((s) => s.value);
      if (q.y === 'cloze') return $$('.blank', root).every((b) => b.value.trim());
      return false;
    }

    function evaluate() {
      if (q.y === 'sc') { const ok = selected.has(q.a); return { correct: ok, score: ok ? 1 : 0 }; }
      if (q.y === 'mc') {
        const want = new Set(q.a);
        const ok = want.size === selected.size && [...want].every((i) => selected.has(i));
        return { correct: ok, score: ok ? 1 : 0 };
      }
      if (q.y === 'tf') { const ok = tfValue === q.a; return { correct: ok, score: ok ? 1 : 0 }; }
      if (q.y === 'match') {
        const sels = $$('select', root);
        const hits = sels.filter((s) => s.value === q.p[+s.dataset.mi][1]).length;
        return { correct: hits === q.p.length, score: hits / q.p.length };
      }
      if (q.y === 'cloze') {
        const blanks = $$('.blank', root);
        const hits = blanks.filter((b) => q.a[+b.dataset.bi].some((alt) => norm(alt) === norm(b.value))).length;
        return { correct: hits === blanks.length, score: hits / blanks.length };
      }
      return { correct: false, score: 0 };
    }

    function solutionText() {
      if (q.y === 'sc') return q.o[q.a];
      if (q.y === 'mc') return q.a.map((i) => q.o[i]).join(' · ');
      if (q.y === 'tf') return q.a ? 'Wahr' : 'Falsch';
      if (q.y === 'match') return q.p.map((p) => `${esc(p[0])} → ${esc(p[1])}`).join('<br>');
      if (q.y === 'cloze') return q.a.map((alts, i) => `Lücke ${i + 1}: <code>${esc(alts[0])}</code>`).join(' · ');
      return '';
    }

    function reveal() {
      locked = true;
      const res = evaluate();
      if (q.y === 'sc' || q.y === 'mc') {
        const want = new Set(q.y === 'sc' ? [q.a] : q.a);
        $$('.opt', root).forEach((b) => {
          const i = +b.dataset.i;
          b.disabled = true;
          if (want.has(i)) b.classList.add('ok');
          else if (selected.has(i)) b.classList.add('bad');
        });
      } else if (q.y === 'tf') {
        $$('.opt', root).forEach((b) => {
          b.disabled = true;
          const v = b.dataset.tf === 'true';
          if (v === q.a) b.classList.add('ok'); else if (v === tfValue) b.classList.add('bad');
        });
      } else if (q.y === 'match') {
        $$('select', root).forEach((s) => { s.disabled = true; s.classList.add(s.value === q.p[+s.dataset.mi][1] ? 'ok' : 'bad'); });
      } else if (q.y === 'cloze') {
        $$('.blank', root).forEach((b) => { b.disabled = true; b.classList.add(q.a[+b.dataset.bi].some((alt) => norm(alt) === norm(b.value)) ? 'ok' : 'bad'); });
      }
      const fb = root.querySelector('.feedback');
      fb.hidden = false;
      fb.className = `feedback ${res.correct ? 'is-ok' : res.score > 0 ? 'is-partial' : 'is-bad'}`;
      fb.innerHTML = `<div class="fb-title">${res.correct ? '✓ Richtig!' : res.score > 0 ? `◐ Teilweise richtig (${Math.round(res.score * 100)} %)` : '✗ Leider falsch'}</div>
        ${res.correct ? '' : `<div class="fb-solution"><b>Lösung:</b> ${solutionText()}</div>`}
        <div class="fb-expl">${q.e}</div>
        <div class="fb-src">📖 Fundstelle: ${esc(q.s)}</div>`;
      return res;
    }

    function choose(n) {
      if (locked) return;
      const btns = $$('.opt', root);
      if (btns[n - 1]) btns[n - 1].click();
    }

    // Erste Lücke/Eingabe fokussieren (nur auf Geräten mit Maus, um mobile Tastatur nicht aufzuzwingen)
    if (q.y === 'cloze' && matchMedia('(pointer:fine)').matches) root.querySelector('.blank')?.focus();

    return { isAnswered, evaluate, reveal, choose, get locked() { return locked; } };
  }

  return { mount, LEVEL_LABEL, TYPE_LABEL, topicTitle };
})();
