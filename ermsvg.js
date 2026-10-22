/**
 * Zeichnet ER-Diagramme in (modifizierter) Chen-Notation als SVG.
 *
 * Spezifikation:
 *  {
 *    w, h,                                   // Zeichenfläche (viewBox)
 *    entities: [{ id, label, x, y, attrs?: ['_pk', 'attr', …] }],   // x/y = Mittelpunkt; „_“ = PK
 *    rels: [{ a, b, verb, ea: 'CM', eb: '1', x?, y?, attrs?: [] }]
 *  }
 *
 * ea/eb sind die Kardinalitäten, die am Ende von Entität a bzw. b notiert werden
 * (1 = genau eins, C = höchstens eins, M = mindestens eins, CM = beliebig viele).
 * Wie im Skript (S. 59): Die Angabe an einem Entitätstyp beschreibt, wie viele
 * Entitäten DIESES Typs zu EINER Entität der Gegenseite gehören.
 * Max-Zahl (1 / N) steht als Text an der Linie, Min-Zahl als Strich (muss) bzw. Kreis (kann).
 */
window.DBT = window.DBT || {};

DBT.ermsvg = (() => {
  const { esc } = DBT.util;
  const EW = 150, HEAD = 34, LINE = 18;

  const parse = (code) => ({ max: code === '1' || code === 'C' ? '1' : 'N', must: code === '1' || code === 'M' });

  function entityBox(e) {
    const attrs = e.attrs || [];
    const h = HEAD + (attrs.length ? attrs.length * LINE + 8 : 0);
    return { x: e.x - EW / 2, y: e.y - h / 2, w: EW, h };
  }

  /** Schnittpunkt der Linie (Mittelpunkt → p) mit dem Rechteckrand. */
  function edgePoint(box, px, py) {
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    const dx = px - cx, dy = py - cy;
    if (!dx && !dy) return { x: cx, y: cy };
    const t = Math.min(dx ? (box.w / 2) / Math.abs(dx) : Infinity, dy ? (box.h / 2) / Math.abs(dy) : Infinity);
    return { x: cx + dx * t, y: cy + dy * t };
  }

  function endMarker(from, to, code, maxLabelOverride) {
    // from = Randpunkt an der Entität, to = Richtung Raute
    const { max, must } = parse(code);
    const len = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    const ux = (to.x - from.x) / len, uy = (to.y - from.y) / len;
    const nx = -uy, ny = ux; // Normale
    const m = { x: from.x + ux * 14, y: from.y + uy * 14 };
    const lab = { x: from.x + ux * 26 + nx * 13, y: from.y + uy * 26 + ny * 13 };
    const sym = must
      ? `<line x1="${m.x + nx * 8}" y1="${m.y + ny * 8}" x2="${m.x - nx * 8}" y2="${m.y - ny * 8}" class="erm-must"/>`
      : `<circle cx="${m.x}" cy="${m.y}" r="6" class="erm-may"/>`;
    return `${sym}<text x="${lab.x}" y="${lab.y}" class="erm-card" text-anchor="middle" dominant-baseline="central">${esc(maxLabelOverride || max)}</text>`;
  }

  function render(spec0, opts = {}) {
    // optional horizontal strecken, damit Rauten und Kardinalitäten Platz haben
    const k = opts.scale || 1;
    const spec = {
      ...spec0, w: spec0.w * k,
      entities: spec0.entities.map((e) => ({ ...e, x: e.x * k })),
      rels: spec0.rels.map((r) => ({ ...r, x: r.x !== undefined ? r.x * k : undefined }))
    };
    const byId = Object.fromEntries(spec.entities.map((e) => [e.id, e]));
    let lines = '', diamonds = '', marks = '', ents = '';

    spec.rels.forEach((r) => {
      const A = byId[r.a], B = byId[r.b];
      const rx = r.x ?? (A.x + B.x) / 2, ry = r.y ?? (A.y + B.y) / 2;
      const pa = edgePoint(entityBox(A), rx, ry), pb = edgePoint(entityBox(B), rx, ry);
      lines += `<line x1="${pa.x}" y1="${pa.y}" x2="${rx}" y2="${ry}" class="erm-line"/><line x1="${rx}" y1="${ry}" x2="${pb.x}" y2="${pb.y}" class="erm-line"/>`;
      const isMN = parse(r.ea).max === 'N' && parse(r.eb).max === 'N';
      marks += endMarker(pa, { x: rx, y: ry }, r.ea, isMN ? 'M' : null) + endMarker(pb, { x: rx, y: ry }, r.eb);
      const dw = Math.max(70, r.verb.length * 7.5 + 28), dh = 46;
      diamonds += `<g class="erm-rel"><polygon points="${rx},${ry - dh / 2} ${rx + dw / 2},${ry} ${rx},${ry + dh / 2} ${rx - dw / 2},${ry}"/>
        <text x="${rx}" y="${ry}" text-anchor="middle" dominant-baseline="central">${esc(r.verb)}</text></g>`;
      (r.attrs || []).forEach((at, i) => {
        const ax = rx + (i - (r.attrs.length - 1) / 2) * 90, ay = ry + (r.attrBelow === false ? -62 : 62);
        lines += `<line x1="${rx}" y1="${ry}" x2="${ax}" y2="${ay}" class="erm-line thin"/>`;
        diamonds += `<g class="erm-attr"><ellipse cx="${ax}" cy="${ay}" rx="40" ry="15"/><text x="${ax}" y="${ay}" text-anchor="middle" dominant-baseline="central">${esc(at)}</text></g>`;
      });
    });

    spec.entities.forEach((e) => {
      const b = entityBox(e);
      ents += `<g class="erm-ent"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="6"/>
        <text x="${e.x}" y="${b.y + HEAD / 2}" text-anchor="middle" dominant-baseline="central" class="erm-ent-t">${esc(e.label)}</text>
        ${(e.attrs || []).length ? `<line x1="${b.x}" y1="${b.y + HEAD}" x2="${b.x + b.w}" y2="${b.y + HEAD}" class="erm-sep"/>` : ''}
        ${(e.attrs || []).map((a, i) => {
          const pk = a.startsWith('_');
          return `<text x="${b.x + 10}" y="${b.y + HEAD + 13 + i * LINE}" class="erm-attr-t ${pk ? 'pk' : ''}" dominant-baseline="central">${pk ? '' : '- '}${esc(pk ? a.slice(1) : a)}</text>`;
        }).join('')}</g>`;
    });

    return `<svg class="erm-svg" viewBox="0 0 ${spec.w} ${spec.h}" role="img" aria-label="${esc(opts.label || 'ER-Diagramm')}">${lines}${diamonds}${ents}${marks}</svg>`;
  }

  /** Kurze Legende der Notation. */
  function legend() {
    const item = (code, text) => {
      const svg = `<svg viewBox="0 0 90 30" class="leg-svg"><line x1="5" y1="15" x2="85" y2="15" class="erm-line"/>${endMarker({ x: 5, y: 15 }, { x: 85, y: 15 }, code)}</svg>`;
      return `<div class="leg-item">${svg}<b>${code}</b><span>${text}</span></div>`;
    };
    return `<div class="erm-legend">${item('1', 'genau eins (muss)')}${item('C', 'höchstens eins (kann)')}${item('M', 'mindestens eins (N muss)')}${item('CM', 'beliebig viele (N kann)')}</div>`;
  }

  return { render, legend };
})();
