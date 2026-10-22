/**
 * Kleiner SQL-Editor: Textarea mit darunterliegendem Syntax-Highlighting,
 * Tab-Einrückung und Strg/Cmd+Enter zum Ausführen.
 *
 *   const ed = DBT.editor.mount(el, { value, onRun, placeholder });
 *   ed.value / ed.setValue(s) / ed.insert(s) / ed.focus()
 */
window.DBT = window.DBT || {};

DBT.editor = (() => {
  function mount(el, opts = {}) {
    el.classList.add('editor');
    el.innerHTML = `<pre class="editor-hl" aria-hidden="true"><code></code></pre>
      <textarea class="editor-ta" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off"
        aria-label="SQL-Eingabe" placeholder="${DBT.util.esc(opts.placeholder || 'SELECT …')}"></textarea>`;
    const ta = el.querySelector('textarea');
    const code = el.querySelector('code');
    const pre = el.querySelector('pre');

    const paint = () => {
      // Abschließender Zeilenumbruch, damit die letzte Leerzeile mitgemessen wird
      code.innerHTML = DBT.util.highlightSQL(ta.value) + '\n';
      opts.onInput?.(ta.value);
    };
    ta.addEventListener('input', paint);
    ta.addEventListener('scroll', () => { pre.scrollTop = ta.scrollTop; pre.scrollLeft = ta.scrollLeft; });
    ta.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); opts.onRun?.(); return; }
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        insert('  ');
      }
    });

    function insert(text) {
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText(text, s, en, 'end');
      ta.focus();
      paint();
    }
    function setValue(v) { ta.value = v; paint(); }

    setValue(opts.value || '');
    return {
      get value() { return ta.value; },
      setValue, insert,
      focus: () => ta.focus()
    };
  }
  return { mount };
})();
