/**
 * Allgemeine Hilfsfunktionen: DOM, Escaping, Zufall, Datum, SQL-Highlighting, Toasts.
 */
window.DBT = window.DBT || {};

DBT.util = (() => {
  const DAY = 24 * 60 * 60 * 1000;

  /** HTML-Sonderzeichen escapen (für Nutzereingaben). */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Fisher-Yates – gibt eine neue, gemischte Kopie zurück. */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Lokales Datum als YYYY-MM-DD (für Tages-Streak). */
  function dayKey(ts = Date.now()) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /** Beginn des lokalen Tages (Mitternacht) als Timestamp. */
  function startOfDay(ts = Date.now()) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function fmtDate(ts) {
    return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtDateTime(ts) {
    return new Date(ts).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function fmtDuration(sec) {
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const pct = (x) => `${Math.round(x * 100)} %`;

  const SQL_KEYWORDS = new Set(('SELECT FROM WHERE AND OR NOT NULL IS IN AS ON JOIN INNER LEFT RIGHT OUTER GROUP BY HAVING ORDER ASC DESC ' +
    'DISTINCT INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW DROP ALTER ADD PRIMARY FOREIGN KEY REFERENCES ' +
    'UNIQUE CHECK DEFAULT CASCADE RESTRICT UNION ALL INTERSECT EXCEPT EXISTS ANY BETWEEN LIKE WITH RECURSIVE IF ' +
    'COUNT SUM AVG MIN MAX ROUND CONCAT SUBSTRING POSITION IFNULL DATEDIFF STDDEV LIMIT CHARSET SERIAL ' +
    'INT INTEGER SMALLINT BIGINT VARCHAR DECIMAL FLOAT DOUBLE DATE TIME TIMESTAMP TEXT BOOLEAN STRING OVER PARTITION CASE WHEN THEN ELSE END').split(' '));

  /** Einfaches Syntax-Highlighting für SQL (Kommentare, Strings, Zahlen, Schlüsselwörter). */
  function highlightSQL(code) {
    const src = String(code);
    const re = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*'|"[^"\n]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      if (m[1]) out += `<span class="tk-cm">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span class="tk-str">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span class="tk-num">${esc(m[3])}</span>`;
      else if (SQL_KEYWORDS.has(m[4].toUpperCase())) out += `<span class="tk-kw">${esc(m[4])}</span>`;
      else out += esc(m[4]);
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }

  /** Code-Block mit Kopier-Button. */
  function codeBlock(code, title = '') {
    return `<figure class="code">${title ? `<figcaption>${title}</figcaption>` : ''}<div class="code-body"><button class="code-copy" type="button" aria-label="Code kopieren" data-copy>Kopieren</button><pre><code>${highlightSQL(code)}</code></pre></div></figure>`;
  }

  /** Delegierter Klick-Handler für alle Kopier-Buttons. */
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-copy]');
    if (!btn) return;
    const text = btn.parentElement.querySelector('code').innerText;
    navigator.clipboard?.writeText(text).then(() => toast('In die Zwischenablage kopiert'), () => toast('Kopieren nicht möglich'));
  });

  let toastTimer;
  function toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /** Text-Normalisierung für Lückentexte (Groß/Klein, Leerzeichen, Anführungszeichen). */
  const norm = (s) => String(s).trim().replace(/\s+/g, ' ').replace(/[‘’`´]/g, "'").toLowerCase();

  /** Kreisförmiger Fortschrittsring als SVG. */
  function ring(value, size = 120, stroke = 10, label = '') {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, value)));
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)} ${Math.round(value * 100)} Prozent">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--track)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size / 2} ${size / 2})" class="ring-fg"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" class="ring-text">${Math.round(value * 100)}%</text>
    </svg>`;
  }

  const bar = (value, cls = '') => `<div class="bar ${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value * 100)}"><span style="width:${Math.max(0, Math.min(100, value * 100))}%"></span></div>`;

  const stars = (n) => '●'.repeat(n) + '○'.repeat(5 - n);

  return { DAY, esc, $, $$, shuffle, dayKey, startOfDay, fmtDate, fmtDateTime, fmtDuration, pct, highlightSQL, codeBlock, toast, norm, ring, bar, stars };
})();
