/**
 * Karteikarten: f = Vorderseite (Frage), b = Rückseite (Antwort, HTML erlaubt), s = Fundstelle.
 * Ausschließlich aus dem Vorlesungsskript und den Klausuren abgeleitet.
 */
window.DBT = window.DBT || {};
DBT.data = DBT.data || {};

DBT.data.flashcards = [
  // DBMS
  { id: 'fc-dbms-1', t: 'dbms', f: 'Die drei Ebenen der ANSI-SPARC-Architektur?', b: 'Externe Ebene (Benutzersichten, Views) · Logische/konzeptionelle Ebene (ER-Diagramme, Datenmodell, Normalisierung) · Interne Ebene (Speicherformate, Zugriffssteuerung)', s: 'S. 9' },
  { id: 'fc-dbms-2', t: 'dbms', f: 'Datenbank vs. DBMS?', b: 'Datenbank (Datenbasis) = Menge der gespeicherten Daten. DBMS = Menge an Programmen zum Zugriff auf die Daten.', s: 'Def. 1.1, S. 10' },
  { id: 'fc-dbms-3', t: 'dbms', f: 'Was ist eine Relation (mathematisch)?', b: 'Teilmenge des kartesischen Produkts M₁ × … × Mₙ; ihre Elemente sind n-Tupel.', s: 'S. 10' },
  { id: 'fc-dbms-4', t: 'dbms', f: 'Was ist der Relationentyp?', b: 'Name der Relation + Liste der Attribute, z.B. <code>Full House (Farbe, Karte)</code>. Auch Schema oder Tabellenstruktur.', s: 'Def. 1.4, S. 11' },
  // SQL basics
  { id: 'fc-sql-1', t: 'sqlbasics', f: 'DDL, DML, DCL – was gehört wozu?', b: 'DDL: CREATE, ALTER, DROP (Struktur)<br>DML: INSERT, SELECT, UPDATE, DELETE (Daten, CRUD)<br>DCL: GRANT, REVOKE (Rechte)', s: 'S. 15–16, 130–132' },
  { id: 'fc-sql-2', t: 'sqlbasics', f: 'Was bedeutet „SQL ist deklarativ“?', b: 'Man programmiert das <b>Was</b> (ergebnisorientiert), nicht das <b>Wie</b> (Kontrollfluss).', s: 'S. 12' },
  { id: 'fc-sql-3', t: 'sqlbasics', f: 'Syntax INSERT mit mehreren Datensätzen?', b: '<code>INSERT INTO tabelle (s1, …, sn) VALUES (w11, …, w1n), …, (wm1, …, wmn);</code><br>Reihenfolge der Spalten = Reihenfolge der Werte.', s: 'S. 16' },
  { id: 'fc-sql-4', t: 'sqlbasics', f: 'Was bedeutet decimal(4,2)?', b: 'Festkommazahl mit maximal 4 Stellen, davon 2 Nachkommastellen (z.B. 12.34).', s: 'Tab. 2.2, S. 14' },
  { id: 'fc-sql-5', t: 'sqlbasics', f: 'Wie schreibt man Strings und Kommazahlen in SQL?', b: 'Strings in Apostrophen <code>\'Abc\'</code>; Kommazahlen mit Punkt <code>21.90</code>.', s: 'S. 14' },
  // SELECT
  { id: 'fc-sel-1', t: 'select', f: 'LIKE-Platzhalter (Standard / Access)?', b: '<code>%</code> / <code>*</code> = beliebig viele Zeichen (auch keins)<br><code>_</code> / <code>?</code> = genau ein Zeichen', s: 'S. 25' },
  { id: 'fc-sel-2', t: 'select', f: 'LIKE: zweiter Buchstabe ist „e“?', b: "<code>LIKE '_e%'</code>", s: 'Klausur 2023, 4.2' },
  { id: 'fc-sel-3', t: 'select', f: 'LIKE: mindestens zweimal „a“?', b: "<code>LIKE '%a%a%'</code>", s: 'Probeklausur 2024, 4.3' },
  { id: 'fc-sel-4', t: 'select', f: 'BETWEEN – Grenzen inklusive?', b: 'Ja: <code>x BETWEEN a AND b</code> ≙ <code>x &gt;= a AND x &lt;= b</code>; a muss ≤ b sein.', s: 'S. 24–25' },
  { id: 'fc-sel-5', t: 'select', f: 'Unterschied SELECT und SELECT DISTINCT?', b: 'SELECT kann Dubletten liefern; SELECT DISTINCT liefert eine Relation ohne doppelte Zeilen (Projektion).', s: 'Bem. 3.2, S. 20' },
  { id: 'fc-sel-6', t: 'select', f: 'Darf man Spalten-Aliasse in WHERE verwenden?', b: 'Nein – Aliasse desselben SELECT sind in der WHERE-Klausel nicht erlaubt.', s: 'S. 24' },
  { id: 'fc-sel-7', t: 'select', f: 'Was ist eine Kollation?', b: 'Die genaue Sortierregel für Buchstaben/Zeichen (Groß/Klein, Umlaute …); z.B. <code>COLLATE \'utf8_general_ci\'</code>.', s: 'Bem. 3.16, S. 27' },
  // NULL
  { id: 'fc-null-1', t: 'null', f: 'Regel 1 (NULL-Vergleich)?', b: 'Jeder Vergleich eines Wertes mit NULL ist weder wahr noch falsch, sondern <b>unbekannt</b> (NULL).', s: 'S. 31' },
  { id: 'fc-null-2', t: 'null', f: 'Dreiwertige Logik: f AND u, w OR u, NOT u?', b: 'f AND u = <b>f</b> · w OR u = <b>w</b> · NOT u = <b>u</b><br>(AND = Minimum, OR = Maximum mit f=0, u=½, w=1)', s: 'S. 32' },
  { id: 'fc-null-3', t: 'null', f: 'Wie fragt man auf NULL ab?', b: '<code>IS NULL</code> bzw. <code>IS NOT NULL</code> – niemals <code>= NULL</code>.', s: 'S. 32' },
  { id: 'fc-null-4', t: 'null', f: 'NULL durch Standardwert ersetzen?', b: '<code>IFNULL(x, neu)</code> – Access: <code>Nz</code>, Oracle: <code>NVL</code>.', s: 'S. 33' },
  // Keys
  { id: 'fc-key-1', t: 'keys', f: 'Definition Primärschlüssel?', b: 'Ein nicht reduzierbarer Schlüssel, der zur Identifikation der Datensätze ausgewählt wurde. Zusammengesetzt, wenn er aus mehreren Attributen besteht.', s: 'Def. 5.1, S. 35' },
  { id: 'fc-key-2', t: 'keys', f: 'Entitätsintegrität?', b: 'Für ein Attribut eines Primärschlüssels ist NULL nicht zulässig.', s: 'Def. 5.4, S. 36' },
  { id: 'fc-key-3', t: 'keys', f: 'Anforderungen an einen guten Primärschlüssel?', b: 'Eindeutig – auch langfristig – und <b>zeitlich stabil</b> (Werte ändern sich nicht im Lebenszyklus).', s: 'S. 36' },
  { id: 'fc-key-4', t: 'keys', f: 'Künstlicher Primärschlüssel?', b: 'Surrogate Key, z.B. ID/Matrikelnummer; SQL-Datentyp <code>SERIAL</code> (Access: autoincrement) zählt automatisch hoch.', s: 'S. 37' },
  { id: 'fc-key-5', t: 'keys', f: 'Reduzierbarer Schlüssel?', b: 'Ein Schlüssel, der eindeutig bleibt, wenn ein Feld aus ihm entfernt wird.', s: 'S. 34' },
  // GROUP BY
  { id: 'fc-grp-1', t: 'groupby', f: 'Regel 2 (GROUP BY)?', b: 'Treten in der Spaltenauswahl Spalten <b>und</b> Aggregatfunktionen auf, müssen alle Spalten im GROUP BY stehen.', s: 'S. 42' },
  { id: 'fc-grp-2', t: 'groupby', f: 'Regel 3 (WHERE vs. HAVING)?', b: 'Bedingungen mit Aggregatfunktionen → HAVING. WHERE darf nur Spalten enthalten.', s: 'S. 44' },
  { id: 'fc-grp-3', t: 'groupby', f: 'Reihenfolge der SELECT-Klauseln?', b: 'SELECT – FROM – WHERE – GROUP BY – HAVING – (UNION) – ORDER BY', s: 'A.1, S. 132' },
  { id: 'fc-grp-4', t: 'groupby', f: 'Wie behandeln Aggregatfunktionen NULL?', b: 'Sie ignorieren NULL-Werte.', s: 'Bem. 6.4, S. 41' },
  { id: 'fc-grp-5', t: 'groupby', f: 'COUNT(reihe) vs. COUNT(DISTINCT reihe)?', b: 'COUNT(reihe) zählt Datensätze (ohne NULL), COUNT(DISTINCT reihe) die Anzahl verschiedener Werte.', s: 'Bsp. 6.1, S. 40' },
  { id: 'fc-grp-6', t: 'groupby', f: 'Warum WHERE vor GROUP BY statt HAVING für Spaltenfilter?', b: 'WHERE filtert zuerst die Einzelsätze, dann wird gruppiert → effizienter. HAVING gruppiert erst alles.', s: 'Bsp. 6.9, S. 44' },
  // Sets
  { id: 'fc-set-1', t: 'sets', f: 'UNION, INTERSECT, EXCEPT?', b: 'Vereinigung ∪ · Schnittmenge ∩ · Differenz \\', s: 'S. 48' },
  { id: 'fc-set-2', t: 'sets', f: 'x <= ALL(…) und x >= ANY(…)?', b: 'x ≤ Minimum · x ≥ Minimum', s: 'S. 52' },
  { id: 'fc-set-3', t: 'sets', f: 'Ältestes Album mit Unterabfrage?', b: '<code>SELECT titel, jahr FROM alben WHERE jahr = (SELECT MIN(jahr) FROM alben);</code>', s: 'Bsp. 7.3, S. 50' },
  { id: 'fc-set-4', t: 'sets', f: 'ALL bzw. ANY bei NULL in der Unterabfrage?', b: 'ALL liefert nie TRUE; ANY ignoriert NULL.', s: 'S. 52' },
  // ERM
  { id: 'fc-erm-1', t: 'erm', f: '1, C, M, CM (modifizierte Chen-Notation)?', b: '1 = genau eins (muss) · C = höchstens eins (kann) · M = mindestens eins (N muss) · CM = beliebig viele (N kann)', s: 'Tab. 8.1, S. 58' },
  { id: 'fc-erm-2', t: 'erm', f: 'Darstellung im ER-Diagramm (Chen)?', b: 'Entitätstyp = Rechteck · Beziehung = Raute mit Verb · Attribut = Ellipse · Kardinalität = 1/N über der Linie, Strich (muss) / Kreis (kann)', s: 'S. 57–58' },
  { id: 'fc-erm-3', t: 'erm', f: 'Wo wird die Kardinalität notiert?', b: 'Am <b>gegenüberliegenden</b> Entitätstyp.', s: 'S. 59' },
  { id: 'fc-erm-4', t: 'erm', f: 'Entität vs. Entitätstyp?', b: 'Entität = individuelles Objekt (Otto Meier) · Entitätstyp = Kategorie (Angestellter) → wird zur Tabelle.', s: 'S. 57' },
  { id: 'fc-erm-5', t: 'erm', f: 'Vorgehen beim ERM-Entwurf?', b: '1. Welche Daten gehören zusammen? → Entitätstypen + Attribute + PK<br>2. Alle Entitätspaare auf Beziehungen prüfen<br>3. Für jede Beziehung Maximum (1/N) und Minimum (kann/muss) beider Seiten bestimmen', s: 'Bsp. 8.4, S. 59–61' },
  { id: 'fc-erm-6', t: 'erm', f: 'Ursache von Inkonsistenz und Speicherineffizienz in einer Einzeltabelle?', b: '<b>Redundanz</b> – mehrfache Speicherung identischer Information. Lösung: Aufteilung in mehrere Tabellen.', s: 'S. 56' },
  // Derive
  { id: 'fc-der-1', t: 'derive', f: 'Fremdschlüssel (Def. 9.1)?', b: 'Schlüssel, der nur Werte enthält, die als Primärschlüssel einer anderen Tabelle vorkommen. <code>FOREIGN KEY(fs) REFERENCES t(pk)</code>', s: 'S. 62' },
  { id: 'fc-der-2', t: 'derive', f: 'Referenzielle Integrität (Def. 9.2)?', b: 'Ein FK mit Wert ≠ NULL muss auf den PK eines <b>existierenden</b> Datensatzes verweisen.', s: 'S. 63' },
  { id: 'fc-der-3', t: 'derive', f: '1:N – wohin kommt der FK?', b: 'Auf die <b>N-Seite</b> (Regel 5). C-CM: FK darf NULL sein (Regel 6). 1-CM: FK NOT NULL (Regel 7).', s: 'S. 65–66' },
  { id: 'fc-der-4', t: 'derive', f: 'M:N (CM-CM) ableiten?', b: 'Beziehungstabelle mit beiden PKs als FK (Regel 8). Bei max. einer Beziehung je Paar: FKs = PK der Beziehungstabelle. Zusatzattribute (z.B. Preis, Stunden) dort speichern.', s: 'S. 68–69' },
  { id: 'fc-der-5', t: 'derive', f: '1-C ableiten (Regel 10)?', b: 'PK der 1-Seite wird FK der C-Seite: <code>NOT NULL UNIQUE</code>.', s: 'S. 70' },
  { id: 'fc-der-6', t: 'derive', f: 'C-C ableiten (Regel 11)?', b: 'Beziehungstabelle; beide FKs NOT NULL UNIQUE, gemeinsam PK.', s: 'S. 71' },
  { id: 'fc-der-7', t: 'derive', f: '1-1 ableiten (Regel 12)?', b: 'Beide Entitätstypen zu <b>einer</b> Tabelle zusammenfassen.', s: 'S. 72' },
  { id: 'fc-der-8', t: 'derive', f: 'IS-A ableiten (Regel 13)?', b: 'PK der spezialisierenden Tabelle = FK auf PK der vererbenden Tabelle, meist <code>ON DELETE CASCADE</code>.', s: 'S. 73' },
  { id: 'fc-der-9', t: 'derive', f: 'Welche Beziehungen sind nicht sauber implementierbar?', b: 'C-M, 1-M, CM-M, M-M (alles mit „N muss“ auf einer Seite) – SQL kann keine ausreichenden Integritätsregeln garantieren.', s: '9.6, S. 72' },
  { id: 'fc-der-10', t: 'derive', f: 'ON DELETE RESTRICT / SET NULL / CASCADE / SET DEFAULT?', b: 'RESTRICT: Löschen nur bei erhaltener ref. Integrität · SET NULL: FK → NULL · CASCADE: referenzierende Sätze mitlöschen · SET DEFAULT: FK → Standardwert', s: 'Tab. 9.1, S. 64' },
  { id: 'fc-der-11', t: 'derive', f: 'Rekursive Beziehungen – welche Regeln?', b: 'Hierarchie (Chef): rekursive C-CM → Regel 6 (FK in derselben Tabelle). Graph/Netz: rekursive CM-CM → Beziehungstabelle (Kanten).', s: '9.7.2, S. 75–77' },
  // Normal
  { id: 'fc-nf-1', t: 'normal', f: '1NF?', b: 'Nur einfache Attributwerte, keine Tabellen in einer Tabelle. Verletzt typischerweise, wenn bei 1:N der FK auf der 1-Seite liegt.', s: 'S. 85; 10.2.5' },
  { id: 'fc-nf-2', t: 'normal', f: '2NF?', b: '1NF + Nichtschlüsselattribute hängen vom <b>gesamten</b> PK ab. Kann nur verletzt sein bei zusammengesetztem natürlichen PK aus FKs.', s: 'S. 86; 10.2.5' },
  { id: 'fc-nf-3', t: 'normal', f: '3NF?', b: '2NF + keine transitiven Abhängigkeiten (A → B → C). Typisch: FK-Attribut plus davon abhängiges Attribut (LagerNr + Lagerort).', s: 'S. 86' },
  { id: 'fc-nf-4', t: 'normal', f: '4NF (laut Skript)?', b: '3NF + keine aus der DB ableitbaren/berechenbaren Attribute (Bruttopreis, Größe = Breite·Tiefe, Anzahl …).', s: 'S. 87' },
  { id: 'fc-nf-5', t: 'normal', f: 'Die drei Anomalien?', b: 'Einfüge-Anomalie · Änderungsanomalie · Löschanomalie (Löschen vernichtet mehr Information als gewollt)', s: '10.1, S. 83–84' },
  // Joins
  { id: 'fc-join-1', t: 'joins', f: 'INNER vs. LEFT vs. RIGHT JOIN?', b: 'INNER: nur verknüpfte Datensätze · LEFT: alle der linken + verknüpfte rechte · RIGHT: alle der rechten + verknüpfte linke', s: '11.1–11.2' },
  { id: 'fc-join-2', t: 'joins', f: 'Datensätze ohne Partner finden?', b: '<code>FROM A LEFT JOIN B ON A.x = B.x WHERE B.x IS NULL</code>', s: 'Abb. 11.1, Bsp. 11.5' },
  { id: 'fc-join-3', t: 'joins', f: 'Regel 16?', b: 'Ein Join ist immer notwendig, wenn für eine Abfrage Information aus mehreren Tabellen benötigt wird.', s: 'S. 95' },
  { id: 'fc-join-4', t: 'joins', f: 'Signalwörter für LEFT JOIN in Klausuraufgaben?', b: '„Zeige <b>alle</b> … und <b>falls/sofern vorhanden</b> …“ → die „alle“-Tabelle steht links.', s: 'Klausur 2023 4.4; Probeklausur 2024 4.2' },
  { id: 'fc-join-5', t: 'joins', f: 'Self Join?', b: 'Tabelle mit sich selbst verknüpfen; Instanzen per Alias unterscheiden: <code>FROM alben AS a1 INNER JOIN alben AS a2 ON a1.reihe = a2.reihe</code>', s: '11.4, S. 99' },
  // Views
  { id: 'fc-view-1', t: 'views', f: 'Was ist eine View?', b: 'Gespeicherte SELECT-Anweisung = virtuelle, redundanzfreie Tabelle mit stets aktuellem Inhalt. <code>CREATE VIEW v AS (SELECT …);</code>', s: 'S. 101–102' },
  { id: 'fc-view-2', t: 'views', f: 'Sollte man Daten über Views ändern?', b: 'Nein – Änderungen wirken auf die Basistabellen, oft unklar; ein allgemeiner Prüfalgorithmus existiert nicht (Codds 6. Regel).', s: '12.4, S. 104' },
  // Recursion
  { id: 'fc-rec-1', t: 'recursion', f: 'Aufbau einer rekursiven CTE?', b: '<code>WITH RECURSIVE f(x) AS ( Basisfall UNION ALL SELECT … FROM f WHERE Bedingung ) SELECT … FROM f;</code>', s: 'S. 108' },
  { id: 'fc-rec-2', t: 'recursion', f: 'CTE vs. View?', b: 'CTE (WITH) gilt nur für eine Anweisung – ein SELECT muss folgen; View (CREATE VIEW) ist dauerhaft im Schema.', s: 'S. 105–106' },
  { id: 'fc-rec-3', t: 'recursion', f: 'Was ist der Basisfall?', b: 'Die Abbruchbedingung einer Rekursion, für die die Lösung bekannt ist (z.B. 0! = 1).', s: 'S. 107, 109' },
  // NoSQL
  { id: 'fc-nos-1', t: 'nosql', f: 'CAP-Theorem?', b: 'In einem verteilten System sind nur zwei von <b>C</b>onsistency, <b>A</b>vailability, <b>P</b>artition tolerance gleichzeitig erfüllbar.', s: 'Satz 14.3, S. 118' },
  { id: 'fc-nos-2', t: 'nosql', f: 'CA, CP, AP – Beispiele?', b: 'CA: relationale DBs · CP: Online-Banking (BigTable, HBase, MongoDB) · AP: DNS, Clouds (Cassandra, CouchDB)', s: 'Abb. 14.6, S. 119' },
  { id: 'fc-nos-3', t: 'nosql', f: 'ACID vs. BASE?', b: 'ACID: striktes Konsistenzmodell relationaler DBs. BASE: basically available, soft state, eventually consistent (verteilte DBs).', s: 'S. 119' },
  { id: 'fc-nos-4', t: 'nosql', f: 'Vier Typen von NoSQL-Datenbanken?', b: 'Spaltenorientiert · Dokumentbasiert · Key-Value Stores · Graphdatenbanken', s: '14.2' },
  { id: 'fc-nos-5', t: 'nosql', f: 'Vertikale vs. horizontale Skalierung?', b: 'Vertikal (scale-up): stärkeres System. Horizontal (scale-out): mehr Rechner → verteilte DB.', s: 'S. 115' },
  { id: 'fc-nos-6', t: 'nosql', f: 'Definition NoSQL-Datenbank (Def. 14.4)?', b: 'Schemafrei bzw. nur schwache Schemarestriktionen, insbesondere <b>nicht relational</b>. Oft: horizontal skalierbar (Sharding), BASE statt ACID, quelloffen.', s: 'S. 120' },
  { id: 'fc-nos-7', t: 'nosql', f: 'Die drei CAP-Kombinationen – was wird jeweils geopfert?', b: 'CA: Partitionstoleranz (System blockiert bei Störung)<br>CP: Verfügbarkeit (gestörte Knoten offline)<br>AP: Konsistenz (alte Daten möglich)', s: 'S. 118–119' },
  { id: 'fc-nos-8', t: 'nosql', f: 'Warum sind relationale DBs schlecht horizontal skalierbar?', b: 'Zeilenorientierte Tabellenschemata eignen sich nicht für effiziente verteilte Speicherung; Konsistenz bei parallelen Zugriffen ist zentral.', s: 'S. 116' },
  { id: 'fc-nos-9', t: 'nosql', f: 'Bsp. 14.2: Was zeigt das Konto-Beispiel?', b: 'Zwei gleichzeitige Überweisungen (+1000, +50) auf 0 € → Ergebnis 50 €. Jede Transaktion korrekt, trotzdem Dateninkonsistenz.', s: 'S. 116–117' },
  { id: 'fc-nos-10', t: 'nosql', f: 'MapReduce in einem Satz?', b: 'Googles Verfahren (2004): <b>map</b> wendet eine Funktion auf jedes Element an (Liste gleicher Größe), <b>reduce</b> fasst zu einem Wert zusammen – verteilt auf Map- und Reduce-Worker, gesteuert vom Master.', s: 'S. 122–124' },
  { id: 'fc-nos-11', t: 'nosql', f: 'Konsistentes Hashing?', b: 'Server sind für <b>Bereiche</b> von Hashwerten auf einem Ring zuständig. Neuer/entfernter Server betrifft nur die direkte Umgebung. Virtuelle Server gleichen Kapazitäten aus.', s: 'S. 124–125' },
  { id: 'fc-nos-12', t: 'nosql', f: 'Lamport-Uhr vs. Vektoruhr?', b: 'Lamport-Uhr: streng monoton steigender Zeitstempel. Vektoruhr: jede Nachricht trägt Absender-ID + dessen Lamport-Zähler → kausale Zusammenhänge rekonstruierbar.', s: 'S. 129' },
  { id: 'fc-nos-13', t: 'nosql', f: 'Welche DB für welches Szenario?', b: 'Bank → Konsistenz (C–P / relational) · Social Web → A–P, BASE · Netze/Fahrpläne → Graph · Analyse/Reporting → spaltenorientiert · JSON-Daten → dokumentbasiert', s: 'Kap. 14' },
  // Codd
  { id: 'fc-codd-1', t: 'codd', f: 'Fünf Operationen der Relationenalgebra?', b: 'Projektion, kartesisches Produkt, Vereinigung, Differenz, Selektion → SQL ist relational vollständig.', s: 'A.3, S. 136–137' }
];
