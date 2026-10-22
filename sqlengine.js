/**
 * SQL-Engine im Browser (SQLite via sql.js / WebAssembly, lazy geladen von cdnjs).
 *
 *   await DBT.sql.ready()                → lädt sql.js einmalig
 *   DBT.sql.open('klausur')              → neue In-Memory-Datenbank mit Übungsdaten
 *   DBT.sql.run(db, sql)                 → { ok, results:[{columns, values}], error, ms }
 *   DBT.sql.compare(expected, actual, ex) → { ok, msg }
 *   DBT.sql.tableHTML(result)            → HTML-Tabelle der Ergebnismenge
 *
 * Hinweis Dialekt: SQLite. Unterschiede zu MariaDB/Access sind in der Anleitung erklärt
 * (z.B. kein STDDEV, Datumsrechnung mit julianday()).
 */
window.DBT = window.DBT || {};

DBT.sql = (() => {
  const VERSION = '1.10.3';
  const CDN = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${VERSION}/`;
  let SQL = null, loading = null;
  const { esc } = DBT.util;

  function ready() {
    if (SQL) return Promise.resolve(SQL);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = CDN + 'sql-wasm.js';
      s.async = true;
      s.onload = () => {
        window.initSqlJs({ locateFile: (f) => CDN + f })
          .then((lib) => { SQL = lib; resolve(lib); })
          .catch(reject);
      };
      s.onerror = () => reject(new Error('SQL-Engine konnte nicht geladen werden. Bitte Internetverbindung prüfen.'));
      document.head.appendChild(s);
    });
    loading.catch(() => { loading = null; });
    return loading;
  }

  /** Neue Datenbank mit dem Datensatz `name` aus DBT.data.sqlDatabases. */
  function open(name) {
    const db = new SQL.Database();
    const def = DBT.data.sqlDatabases[name];
    if (def) db.run(def.sql);
    return db;
  }

  function run(db, sql) {
    const t0 = performance.now();
    try {
      const results = db.exec(sql);
      return { ok: true, results, ms: performance.now() - t0 };
    } catch (e) {
      return { ok: false, error: translateError(e.message), raw: e.message, ms: performance.now() - t0 };
    }
  }

  /** Übersetzt typische SQLite-Fehlermeldungen in einsteigerfreundliches Deutsch. */
  function translateError(msg) {
    const rules = [
      [/no such table: (\S+)/i, (m) => `Die Tabelle „${m[1]}“ gibt es nicht. Schau in der Tabellenliste nach der genauen Schreibweise.`],
      [/no such column: (\S+)/i, (m) => `Die Spalte „${m[1]}“ gibt es nicht (oder sie ist mehrdeutig/falsch geschrieben). Tipp: tabelle.spalte schreiben.`],
      [/ambiguous column name: (\S+)/i, (m) => `Die Spalte „${m[1]}“ kommt in mehreren Tabellen vor – schreibe tabelle.${m[1]} (Regel 14).`],
      [/near "(.+?)": syntax error/i, (m) => `Syntaxfehler in der Nähe von „${m[1]}“. Prüfe Kommas, Klammern, Anführungszeichen und die Reihenfolge der Klauseln.`],
      [/incomplete input/i, () => 'Die Anweisung ist unvollständig – fehlt eine Klammer oder ein Teil nach WHERE/ON?'],
      [/misuse of aggregate/i, () => 'Aggregatfunktion an falscher Stelle – Bedingungen mit COUNT/SUM/AVG … gehören in HAVING (Regel 3).'],
      [/a GROUP BY clause is required before HAVING/i, () => 'HAVING braucht ein GROUP BY davor.'],
      [/unrecognized token/i, () => 'Unbekanntes Zeichen – vermutlich ein falsches Anführungszeichen. Texte in einfache Apostrophe: \'Text\'.'],
      [/no such function: (\S+)/i, (m) => `Die Funktion „${m[1]}“ kennt SQLite nicht (Dialektunterschied).`]
    ];
    for (const [re, fn] of rules) { const m = msg.match(re); if (m) return fn(m); }
    return msg;
  }

  const lastResult = (r) => (r.results && r.results.length ? r.results[r.results.length - 1] : { columns: [], values: [] });

  const normVal = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return Math.round(v * 100) / 100;
    if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) return Math.round(parseFloat(v) * 100) / 100;
    return String(v).trim();
  };
  const rowKey = (row) => JSON.stringify(row.map(normVal));

  /**
   * Vergleicht Ergebnismengen.
   * ex.order:   Spaltenindizes, deren Reihenfolge übereinstimmen muss (für ORDER BY-Aufgaben)
   * ex.aliases: Spaltennamen, die in der Ausgabe vorkommen müssen
   */
  function compare(expRun, actRun, ex = {}) {
    if (!actRun.ok) return { ok: false, msg: '❌ Fehler beim Ausführen: ' + actRun.error };
    const exp = lastResult(expRun), act = lastResult(actRun);
    if (!act.columns.length) return { ok: false, msg: 'Deine Anweisung liefert keine Ergebnismenge. Für Abfragen brauchst du SELECT.' };
    if (exp.columns.length !== act.columns.length) {
      return { ok: false, msg: `Spaltenanzahl stimmt nicht: erwartet ${exp.columns.length} (${exp.columns.join(', ')}), du lieferst ${act.columns.length}. Lies nochmal, was ausgegeben werden soll.` };
    }
    if (exp.values.length !== act.values.length) {
      const d = act.values.length - exp.values.length;
      return { ok: false, msg: `Zeilenanzahl stimmt nicht: erwartet ${exp.values.length}, du hast ${act.values.length} (${d > 0 ? d + ' zu viel' : -d + ' zu wenig'}). ${d > 0 ? 'Fehlt ein Filter, DISTINCT oder ist der Join zu breit?' : 'Ist der Filter zu streng oder fehlt ein LEFT JOIN?'}` };
    }
    const count = new Map();
    exp.values.forEach((r) => count.set(rowKey(r), (count.get(rowKey(r)) || 0) + 1));
    for (const r of act.values) {
      const k = rowKey(r);
      if (!count.get(k)) return { ok: false, msg: `Die Werte stimmen nicht. Beispiel einer Zeile, die nicht erwartet wird: (${r.map((v) => (v === null ? 'NULL' : v)).join(', ')}). Prüfe Spaltenreihenfolge, Filter und Berechnungen.` };
      count.set(k, count.get(k) - 1);
    }
    if (ex.order && ex.order.length) {
      const seq = (rows) => rows.map((r) => JSON.stringify(ex.order.map((i) => normVal(r[i])))).join('|');
      if (seq(exp.values) !== seq(act.values)) return { ok: false, msg: 'Die richtigen Zeilen – aber die Sortierung stimmt nicht. ORDER BY … ASC/DESC prüfen.' };
    }
    if (ex.aliases && ex.aliases.length) {
      const names = act.columns.map((c) => c.toLowerCase().replace(/["`]/g, ''));
      const missing = ex.aliases.filter((a) => !names.includes(a.toLowerCase()));
      if (missing.length) return { ok: false, partial: true, msg: `Ergebnis stimmt, aber die Spaltenüberschrift „${missing.join('“, „')}“ fehlt. Mit AS vergeben!` };
    }
    return { ok: true, msg: '✅ Richtig! Deine Ergebnismenge stimmt mit der Musterlösung überein.' };
  }

  function tableHTML(res, max = 200) {
    if (!res || !res.columns || !res.columns.length) return '<p class="muted small">Keine Ergebnismenge (Anweisung ausgeführt).</p>';
    const rows = res.values.slice(0, max);
    return `<div class="rs-wrap"><table class="rs">
      <thead><tr>${res.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((v) => (v === null ? '<td class="null">NULL</td>' : `<td>${esc(typeof v === 'number' && !Number.isInteger(v) ? Math.round(v * 1000) / 1000 : v)}</td>`)).join('')}</tr>`).join('') || `<tr><td colspan="${res.columns.length}" class="muted">(leere Ergebnismenge)</td></tr>`}</tbody>
    </table></div><p class="tiny muted">${res.values.length} Zeile(n)${res.values.length > max ? `, erste ${max} angezeigt` : ''}</p>`;
  }

  /** Tabellen + Spalten einer Datenbank (für die Schema-Leiste). */
  function schema(db) {
    const t = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid");
    if (!t.length) return [];
    return t[0].values.map(([name]) => {
      const cols = db.exec(`PRAGMA table_info("${name}")`)[0].values.map((c) => ({ name: c[1], type: c[2], pk: c[5] > 0 }));
      const fks = (db.exec(`PRAGMA foreign_key_list("${name}")`)[0]?.values || []).map((f) => f[3]);
      cols.forEach((c) => { c.fk = fks.includes(c.name); });
      return { name, cols };
    });
  }

  return { ready, open, run, compare, tableHTML, schema, lastResult };
})();
