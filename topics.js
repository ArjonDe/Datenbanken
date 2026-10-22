/**
 * Wissensbasis: Themenblöcke (Lernmodule) mit Zusammenfassungen.
 *
 * Quelle ausschließlich: Vorlesungsskript „Datenbanken“ (A. de Vries, Version 14.09.2026),
 * Klausur 06.02.2023, Probeklausur 19.07.2024, Übungsblätter 1–5, Modulbeschreibung.
 * Seitenangaben beziehen sich auf die gedruckten Seitenzahlen des Skripts.
 *
 * relevance: 1 (gering) … 5 (sehr hoch) – abgeleitet aus Punkteverteilung der beiden
 * vorliegenden Klausuren und der Modulbeschreibung (siehe ANALYSE.md).
 */
window.DBT = window.DBT || {};
DBT.data = DBT.data || {};

DBT.data.topics = [
  {
    id: 'dbms',
    nr: '1',
    title: 'DBMS & Relationen',
    short: 'DBMS',
    icon: '🏛️',
    pages: 'Skript Kap. 1, S. 7–11',
    relevance: 2,
    examNote: 'In den beiden vorliegenden Klausuren nicht direkt abgefragt. Begriffe (Relation, Relationentyp, Datensatz) sind aber Grundvokabular für alle anderen Aufgaben. Die Modulbeschreibung nennt „Funktionsweise und Architektur relationaler DBMS“ und „Relationen und Relationentyp“.',
    summary: 'Datenbanken dienen der strukturierten, persistenten Speicherung großer Datenmengen für mehrere Nutzer. Das Referenzmodell ist die dreischichtige ANSI-SPARC-Architektur. Codd modellierte Daten als Relationen – mathematisch Teilmengen eines kartesischen Produkts, praktisch Tabellen.',
    points: [
      'Hierarchie der Speicherkonzepte: Binärwörter → Datentypen → Datenstrukturen → Datenbanken (Abb. 1.1, S. 8).',
      'ANSI-SPARC (1975) hat drei Ebenen: <b>externe</b> Ebene (Benutzeroberflächen, Views), <b>logische/konzeptionelle</b> Ebene (ER-Diagramme, Datenmodell, Normalisierung), <b>interne</b> Ebene (Speicherformate, Zugriffssteuerung) (S. 9).',
      'ANSI-SPARC wurde nie offizieller Standard, gilt aber als ideales Entwurfsmodell (S. 10).',
      '<b>Datenbanksystem</b> = Softwaresystem, das die drei ANSI-SPARC-Ebenen realisiert. <b>Datenbank</b> (Datenbasis) = Menge der gespeicherten Daten; <b>DBMS</b> = Menge der Programme zum Zugriff (Def. 1.1).',
      'Eine <b>Relation</b> R ⊆ M₁ × … × Mₙ ist eine Teilmenge des kartesischen Produkts; Elemente sind n-Tupel (S. 10).',
      'Jede Tabelle ist eine endliche Relation, wenn keine doppelten Zeilen zugelassen sind und Zeilenvertauschungen keine Rolle spielen (Bem. 1.3).',
      'Vokabelliste: Relation ↔ Tabelle ↔ Klasse; Attribut ↔ Spalte/Feld ↔ Attribut; Tupel ↔ Zeile/Datensatz ↔ Objekt (S. 11).',
      'Der <b>Relationentyp</b> R(M₁, …, Mₙ) ist Name + Auflistung der Attribute = Schema bzw. Tabellenstruktur (Def. 1.4).',
      'Relationale DBMS heißen RDBMS; Codd veröffentlichte das Modell 1970 (S. 11).'
    ],
    defs: [
      { term: 'Datenbanksystem', def: 'Softwaresystem zur Speicherung und Verwaltung strukturierter Daten, das die drei Ebenen der ANSI-SPARC-Architektur realisiert.', src: 'Def. 1.1, S. 10' },
      { term: 'Relation', def: 'Teilmenge des kartesischen Produkts gegebener Mengen M₁ × … × Mₙ; Elemente sind n-Tupel.', src: 'S. 10, Gl. (1.1)' },
      { term: 'Relationentyp (Schema)', def: 'Kombination des Namens R der Relation und der Auflistung der Mengen ⟨M₁, …, Mₙ⟩, geschrieben R(M₁, …, Mₙ).', src: 'Def. 1.4, S. 11' }
    ],
    code: [
      { title: 'Relationentyp aus Beispiel 1.5', sql: 'Full House (Farbe, Karte)', src: 'S. 11' }
    ],
    pitfalls: [
      'Externe vs. logische Ebene verwechseln: Views gehören zur <i>externen</i>, ER-Diagramme/Normalisierung zur <i>logischen</i> Ebene.'
    ]
  },
  {
    id: 'sqlbasics',
    nr: '2',
    title: 'Sprachelemente von SQL',
    short: 'SQL-Basics',
    icon: '🔤',
    pages: 'Skript Kap. 2, S. 12–18; Anhang A.1, S. 130–132',
    relevance: 3,
    examNote: 'Grundlage der CREATE-TABLE-Aufgabe (je 5 P. in beiden Klausuren) und von Übungsblatt 1 (CREATE TABLE / INSERT). Datentypen und Syntax von INSERT sollten sitzen.',
    summary: 'SQL ist eine deklarative Sprache (das „Was“, nicht das „Wie“). Der Befehlssatz gliedert sich in DDL (Struktur), DML (Daten, CRUD) und DCL (Rechte). Wichtige Datentypen sind varchar, int, decimal, date.',
    points: [
      'SQL erschien 1974, ANSI-Standard 1986, ISO 1987 (S. 12).',
      'SQL ist <b>deklarativ</b>: Es wird das „Was“ programmiert, nicht der Kontrollfluss (S. 12).',
      'SQL ist <b>nicht case-sensitiv</b>; Konvention im Skript: reservierte Wörter in Großbuchstaben (S. 13).',
      'Kommentare: einzeilig mit <code>--</code>, mehrzeilig mit <code>/* … */</code> (S. 13–14).',
      'Strings stehen in Apostrophen <code>\'Abc\'</code>, Kommazahlen mit <b>Punkt</b> als Dezimaltrenner (S. 14).',
      'Anweisungen werden mit Semikolon getrennt; bei der letzten darf es fehlen (S. 15).',
      '<b>DDL</b>: CREATE / ALTER / DROP + DATABASE / TABLE / USER (S. 15).',
      '<b>DML</b>: INSERT, SELECT, UPDATE, DELETE = CRUD (create, read, update, delete) (S. 16).',
      '<b>DCL</b>: GRANT und REVOKE für Zugriffsrechte (S. 132).',
      'Bei INSERT muss die Reihenfolge der Spalten der Reihenfolge der Werte entsprechen. Die Spaltenliste darf fehlen, wenn alle Spalten in Schema-Reihenfolge befüllt werden (S. 16).',
      '<code>CHECK</code> definiert Gültigkeitsregeln, z.B. <code>preis decimal(10,2) CHECK(preis &gt; 0)</code> (S. 16).',
      'Single-Row-Funktionen wirken je Datensatz: ABS, POWER, ROUND, SQRT, CONCAT, POSITION, REPLACE, SUBSTRING, TRIM (S. 17).',
      'UPDATE und DELETE ohne WHERE betreffen <b>alle</b> Datensätze (S. 132).'
    ],
    defs: [
      { term: 'varchar(n)', def: 'Text mit Maximallänge n (n Byte).', src: 'Tab. 2.2, S. 14' },
      { term: 'int / smallint / bigint', def: 'Ganzzahlen mit 4 / 2 / 8 Byte.', src: 'Tab. 2.2, S. 14' },
      { term: 'decimal(p,s)', def: 'Festkommazahl mit maximal p Stellen, davon s Nachkommastellen.', src: 'Tab. 2.2, S. 14' },
      { term: 'date', def: 'Datum, je nach RDBMS im Format \'yyyy-mm-dd\' oder #mm/dd/yyyy#.', src: 'Tab. 2.2, S. 14' },
      { term: 'CRUD', def: 'create, read, update, delete – die vier zentralen Funktionen der DML (INSERT, SELECT, UPDATE, DELETE).', src: 'S. 16' }
    ],
    code: [
      { title: 'Tabelle anlegen und befüllen (Bsp. 2.1)', sql: "CREATE TABLE full_house (\n  farbe varchar(5),\n  karte varchar(5)\n) DEFAULT CHARSET=utf8;\n\nINSERT INTO full_house (farbe, karte) VALUES\n  ('Kreuz','Ass'), ('Pik','Ass'), ('Herz','König'),\n  ('Herz','Ass'), ('Karo','König');", src: 'S. 16–17' },
      { title: 'Verschachtelte Funktionen (Zwischenfrage 2.3)', sql: "SELECT CONCAT(SUBSTRING(farbe,1,1),'-',SUBSTRING(karte,1,1))\nFROM full_house;\n-- Ergebnis: K-A, P-A, H-K, H-A, K-K", src: 'S. 18' }
    ],
    pitfalls: [
      'Dezimalkomma statt Punkt: <code>VALUES (…, 21,90)</code> erzeugt einen zusätzlichen Wert (vgl. Übungsblatt 1, Aufg. 2b).',
      'In MS Access heißt float „Single“, und Integer hat dort nur 2 Byte (S. 14).'
    ]
  },
  {
    id: 'select',
    nr: '3',
    title: 'SELECT, WHERE, LIKE, ORDER BY',
    short: 'SELECT',
    icon: '🔎',
    pages: 'Skript Kap. 3, S. 19–28',
    relevance: 5,
    examNote: 'Kern der SQL-Aufgaben (40 P. je Klausur). Beispiele aus den Klausuren: BETWEEN für Datumsbereiche, LIKE \'_e%\', LIKE \'%a%a%\', DISTINCT + ORDER BY … DESC, Alias mit AS.',
    summary: 'SELECT wählt Spalten (Projektion), WHERE filtert Zeilen, LIKE sucht Textmuster, ORDER BY sortiert, DISTINCT entfernt Dubletten, AS vergibt Aliasse.',
    points: [
      'Syntax: <code>SELECT spalte_1, …, spalte_n FROM tabelle;</code> – <code>*</code> wählt alle Spalten (S. 19).',
      'Die Ausgabe heißt <b>Ergebnismenge (result set)</b> und ist wieder eine Tabelle (S. 19–20).',
      'SELECT kann Dubletten liefern; <b>SELECT DISTINCT</b> liefert eine Relation (Projektion) (Bem. 3.2, S. 20).',
      '<b>AS</b> vergibt Aliasse für Spalten und Tabellen; AS darf entfallen, sollte aber verwendet werden (S. 22–23).',
      'Aliasse desselben SELECT dürfen in der WHERE-Klausel <b>nicht</b> verwendet werden (S. 24).',
      'Vergleichsoperatoren: <code>= &lt;&gt; != &gt; &lt; &gt;= &lt;=</code>; in MS Access funktioniert <code>!=</code> nicht (S. 23).',
      'Logische Operatoren NOT, AND, OR (S. 24).',
      '<code>x BETWEEN wert_1 AND wert_2</code> ≙ <code>x &gt;= wert_1 AND x &lt;= wert_2</code>; wert_1 muss ≤ wert_2 sein (S. 24–25).',
      'LIKE: <code>%</code> = beliebig viele Zeichen (auch keins), <code>_</code> = genau ein Zeichen. In MS Access: <code>*</code> und <code>?</code> (S. 25).',
      'Verneinung: <code>NOT LIKE</code> (S. 26).',
      'ORDER BY sortiert aufsteigend (ASC, Standard); <code>DESC</code> absteigend – je Spalte einzeln angebbar (S. 26–27).',
      'Sortierspalten müssen nicht in der SELECT-Liste stehen (S. 26).',
      'Die Sortierregel für Zeichen heißt <b>Kollation</b> (COLLATE) (Bem. 3.16).'
    ],
    defs: [
      { term: 'Ergebnismenge', def: 'Ausgabe eines SELECT; eine Tabelle aus den ausgewählten Spalten und Datensätzen.', src: 'S. 19' },
      { term: 'Projektion', def: 'SELECT DISTINCT bildet eine Relation auf eine Relation mit weniger Spalten (und ggf. weniger Zeilen) ab.', src: 'Bem. 3.2, S. 20' },
      { term: 'Prädikat', def: 'Bezeichnung der WHERE-Bedingung in der Relationenalgebra.', src: 'S. 23' },
      { term: 'Kollation', def: 'Genaue Sortierregel für Buchstaben und Zeichen in einer Datenbank.', src: 'Bem. 3.16, S. 27' }
    ],
    code: [
      { title: 'Alias und Berechnung (Bsp. 3.7)', sql: 'SELECT titel,\n       preis AS brutto,\n       ROUND(preis/1.19, 2) AS netto,\n       ROUND(0.19/1.19*preis, 2) AS mwst\nFROM alben;', src: 'S. 22' },
      { title: 'BETWEEN (Bsp. 3.12)', sql: 'SELECT titel FROM alben WHERE jahr BETWEEN 1970 AND 1980;', src: 'S. 25' },
      { title: 'LIKE-Muster (S. 25)', sql: "SELECT titel FROM alben WHERE titel LIKE 'D%';   -- beginnt mit D\nSELECT titel FROM alben WHERE titel LIKE '%n';   -- endet mit n\nSELECT titel FROM alben WHERE titel LIKE '%n%';  -- enthält n\nSELECT titel FROM alben WHERE titel LIKE '__r%'; -- 3. Buchstabe r", src: 'S. 25' },
      { title: 'Mehrstufige Sortierung (Bsp. 3.15)', sql: 'SELECT reihe, titel, jahr FROM alben\nORDER BY reihe, jahr DESC;', src: 'S. 27' }
    ],
    pitfalls: [
      'Für „zweiter Buchstabe ist E“ braucht man <b>einen</b> Unterstrich: <code>LIKE \'_e%\'</code> (Klausur 2023, 4.2).',
      '„mindestens zweimal ein a“: <code>LIKE \'%a%a%\'</code> (Probeklausur 2024, 4.3) – folgt aus der Wildcard-Regel S. 25.',
      'DESC gilt nur für die Spalte, hinter der es steht (Bsp. 3.15).'
    ]
  },
  {
    id: 'null',
    nr: '4',
    title: 'NULL & dreiwertige Logik',
    short: 'NULL',
    icon: '❓',
    pages: 'Skript Kap. 4, S. 29–33',
    relevance: 4,
    examNote: 'Wahr/Falsch-Aufgabe der Probeklausur 2024 („Jeder Vergleich eines Wertes mit NULL liefert FALSE“ → falsch). Probeklausur 4.4 verlangt IS NOT NULL. Modulbeschreibung: „Umgang mit unbekannter Information (NULL)“.',
    summary: 'NULL repräsentiert fehlende Information unabhängig vom Datentyp. Jeder Vergleich mit NULL ergibt „unbekannt“ (NULL). SQL nutzt deshalb eine dreiwertige Logik (Łukasiewicz). Auf NULL prüft man mit IS NULL / IS NOT NULL.',
    points: [
      'Def. 4.1 (Codds 3. Regel): Fehlende Information eines Attributs wird durch den speziellen Wert NULL dargestellt – unabhängig vom Datentyp (S. 29).',
      'MS Access verwendet oft abhängig vom Datentyp einen Standardwert (bei Zahlen z.B. 0) (S. 30).',
      '<code>NOT NULL</code> bei der Tabellendefinition verhindert NULL-Einträge – eine <b>Integritätsregel</b> (S. 30).',
      '<b>Regel 1</b>: Jeder Vergleich eines Wertes mit NULL ist weder wahr noch falsch, sondern unbekannt, also NULL (S. 31).',
      'Auch <code>NULL = NULL</code> ist unbekannt (S. 31).',
      'Dreiwertige Logik mit f (falsch), u (unbekannt), w (wahr) nach Łukasiewicz (1920) (Bem. 4.4).',
      'NOT u = u; f AND u = f; u AND w = u; w OR u = w; f OR u = u (Tabellen 4.1).',
      'Numerisch: f=0, u=½, w=1; NOT a = 1−a, a AND b = min(a,b), a OR b = max(a,b) (Bem. 4.5*).',
      'WHERE filtert nur Datensätze, für die die Bedingung <b>wahr</b> ist – falsch und unbekannt fallen heraus.',
      'Abfrage auf NULL: <code>IS NULL</code>, <code>IS NOT NULL</code> (S. 32).',
      '<code>IFNULL(x, neu)</code> ersetzt NULL durch einen Standardwert; Access: <code>Nz</code>, Oracle: <code>NVL</code> (S. 33).'
    ],
    defs: [
      { term: 'NULL', def: 'Einheitlicher Repräsentant für unbekannte Information, unabhängig vom Datentyp.', src: 'Def. 4.1, S. 29' },
      { term: 'Regel 1', def: 'Jeder Vergleich eines Wertes mit NULL ist weder wahr noch falsch, sondern unbekannt, also NULL.', src: 'S. 31' },
      { term: 'Integritätsregel', def: 'In der Tabellendefinition festgelegte Einschränkung, z.B. NOT NULL.', src: 'S. 30' }
    ],
    code: [
      { title: 'Das „Hamlet“-Paradoxon (Bsp. 4.3)', sql: "SELECT * FROM logik\nWHERE wahrheitswert OR NOT wahrheitswert;\n-- liefert NICHT die Zeile mit NULL!", src: 'S. 31' },
      { title: 'Auf NULL prüfen', sql: 'SELECT aussage FROM logik WHERE wahrheitswert IS NULL;\nSELECT aussage FROM logik WHERE wahrheitswert IS NOT NULL;', src: 'S. 32' },
      { title: 'Standardwert setzen (Bsp. 4.7)', sql: 'SELECT aussage, IFNULL(wahrheitswert, 0.5) AS wahrheitswert\nFROM logik;', src: 'S. 33' }
    ],
    pitfalls: [
      '<code>WHERE spalte = NULL</code> liefert nie Treffer – immer <code>IS NULL</code> verwenden.',
      'Zwischenfrage 4.6: <code>(1=1) OR (NULL=NULL)</code> → alle Zeilen; <code>(1=1) AND (NULL=NULL)</code> → leere Ergebnismenge (S. 32).'
    ]
  },
  {
    id: 'keys',
    nr: '5',
    title: 'Primärschlüssel',
    short: 'Schlüssel',
    icon: '🔑',
    pages: 'Skript Kap. 5, S. 34–38',
    relevance: 4,
    examNote: 'Wahr/Falsch Probeklausur 2024: „Der Wert eines Primärschlüssels kann unter Umständen mehrmals gleich sein“ → falsch. Übungsblatt 3: Primärschlüssel wählen, Telefonnummer als PK begründen.',
    summary: 'Ein Schlüssel ist eine eindeutige Attributkombination. Der Primärschlüssel ist ein nicht reduzierbarer Schlüssel, der zur Identifikation gewählt wurde. Er darf nicht NULL sein (Entitätsintegrität) und sollte zeitlich stabil sein. Häufig nutzt man künstliche (serielle) Schlüssel.',
    points: [
      'Eine relationale Datenbank darf keine völlig identischen Datensätze enthalten (S. 34).',
      '<b>Schlüssel</b>: Attributkombination, die für jeden Datensatz eindeutig ist (S. 34).',
      'Ein Schlüssel ist <b>reduzierbar</b>, wenn er eindeutig bleibt, nachdem ein Feld entfernt wurde (S. 34).',
      '<b>Primärschlüssel</b> (Def. 5.1): nicht reduzierbarer Schlüssel, der zur Identifikation ausgewählt wurde; zusammengesetzt, wenn er aus mehreren Attributen besteht.',
      'In der Notation des Relationentyps werden PK-Attribute <u>unterstrichen</u> (S. 35).',
      'Zwei SQL-Varianten: <code>PRIMARY KEY(spalte_x, …)</code> am Ende oder <code>spalte typ PRIMARY KEY</code> direkt (S. 35).',
      'Ein PK muss <b>zeitlich stabil</b> und langfristig eindeutig sein – der Preis ist ein schlechter PK (Bsp. 5.2).',
      'Comic-Alben: (reihe, band) ist ein sinnvoller natürlicher PK, der Titel nicht (Bsp. 5.3).',
      '<b>Entitätsintegrität</b> (Def. 5.4): Für ein Attribut eines Primärschlüssels ist NULL nicht zulässig.',
      '<b>Künstlicher Primärschlüssel</b> (surrogate key), z.B. ID, Matrikelnummer; Datentyp <code>SERIAL</code> (Access: autoincrement) zählt automatisch hoch (S. 37).',
      'Bei SERIAL wird der Wert beim INSERT weggelassen (S. 37).'
    ],
    defs: [
      { term: 'Schlüssel', def: 'Kombination von Attributen einer Tabelle, die für jeden Datensatz eine andere Wertekombination aufweist.', src: 'S. 34' },
      { term: 'Primärschlüssel', def: 'Nicht reduzierbarer Schlüssel, der zur Identifikation der Datensätze ausgewählt wurde.', src: 'Def. 5.1, S. 35' },
      { term: 'Entitätsintegrität', def: 'Für ein Attribut eines Primärschlüssels ist der Wert NULL nicht zulässig.', src: 'Def. 5.4, S. 36' },
      { term: 'Künstlicher Primärschlüssel', def: 'Neues Attribut (meist ID), das unabhängig von den realen Daten jeden Datensatz eindeutig identifiziert; seriell bei SERIAL/autoincrement.', src: 'S. 37' }
    ],
    code: [
      { title: 'Zusammengesetzter PK (Bsp. 5.3)', sql: 'CREATE TABLE alben (\n  titel varchar(50),\n  reihe varchar(50),\n  band  smallint,\n  preis decimal(4,2),\n  jahr  smallint,\n  PRIMARY KEY(reihe, band)\n);', src: 'S. 36' },
      { title: 'Serieller PK (Bsp. 5.5)', sql: 'CREATE TABLE alben (\n  id serial primary key,\n  titel varchar(50),\n  ...\n);', src: 'S. 37' }
    ],
    pitfalls: [
      'Eindeutig heute ≠ geeigneter PK: Der PK muss auch künftig eindeutig und stabil bleiben (Preis, Titel, Telefonnummer).'
    ]
  },
  {
    id: 'groupby',
    nr: '6',
    title: 'Aggregatfunktionen, GROUP BY, HAVING',
    short: 'GROUP BY',
    icon: '📊',
    pages: 'Skript Kap. 6, S. 39–46',
    relevance: 5,
    examNote: 'In beiden Klausuren mehrfach: COUNT + GROUP BY + HAVING (2023: 4.3, 4.4, 4.8; 2024: 4.6, 4.7). W/F 2024: „Jede GROUP BY Anweisung kann durch DISTINCT ersetzt werden“ → falsch. Übungsblätter 4 und 5.',
    summary: 'Aggregatfunktionen fassen Werte mehrerer Datensätze zu einem Wert zusammen. GROUP BY bildet Gruppen; HAVING filtert Gruppen mit Bedingungen, die Aggregatfunktionen enthalten. WHERE filtert vorher einzelne Datensätze.',
    points: [
      'Aggregatfunktionen: COUNT(s), COUNT(*), COUNT(DISTINCT s), MAX, MIN, SUM, AVG, STDDEV (Access: STDEV), VARIANCE (Tab. 6.1).',
      'Single-Row-Funktionen (z.B. SQRT) liefern so viele Werte wie Datensätze, AVG nur einen (Bem. 6.3).',
      '<b>NULL-Werte werden von Aggregatfunktionen ignoriert</b> (Bem. 6.4).',
      'Unterabfrage mit Aggregat: <code>WHERE preis &lt; (SELECT AVG(preis) FROM alben)</code> (Bsp. 6.5).',
      'GROUP BY fasst Zeilen mit gleichen Werten in den Gruppenspalten zu einer Gruppe zusammen (S. 41).',
      '<b>Regel 2</b>: Treten in der Spaltenauswahl Spalten und Aggregatfunktionen auf, müssen alle Spalten im GROUP BY stehen (S. 42).',
      'HAVING filtert Gruppen; falsche und unbekannte Wahrheitswerte fallen heraus (S. 42).',
      'Die Aggregatfunktion im HAVING muss nicht in der Spaltenauswahl stehen (Bsp. 6.8).',
      '<b>Regel 3</b>: Filterbedingungen mit Aggregatfunktionen müssen in die HAVING-Klausel; WHERE darf nur Spalten enthalten (S. 44).',
      'WHERE wirkt vor dem Gruppieren auf einzelne Datensätze, HAVING danach auf Gruppen. WHERE vorher filtern ist effizienter (Bsp. 6.9).',
      'In einer HAVING-Klausel kann kein Alias verwendet werden (S. 43).',
      '* OVER(PARTITION BY …) aggregiert über Partitionen, ohne Zeilen zusammenzufassen; rechenaufwändig (Kap. 6.5, nicht klausurnotwendig).'
    ],
    defs: [
      { term: 'Aggregatfunktion', def: 'Funktion (auch Gruppenfunktion), die als Argument einen Spaltennamen erhält und die Spaltenwerte mehrerer Datensätze zu einem einzigen Wert zusammenführt.', src: 'S. 39' },
      { term: 'Regel 2', def: 'Wenn in der Spaltenauswahl Spalten und Aggregatfunktionen auftreten, müssen alle Spalten in der GROUP BY-Komponente aufgelistet werden.', src: 'S. 42' },
      { term: 'Regel 3', def: 'Filterbedingungen, die Aggregatfunktionen enthalten, müssen in die HAVING-Klausel. Eine WHERE-Klausel darf nur Spalten enthalten.', src: 'S. 44' }
    ],
    code: [
      { title: 'Anzahl verschiedener Reihen (Bsp. 6.1)', sql: "SELECT COUNT(DISTINCT reihe) FROM alben WHERE reihe <> 'Asterix';", src: 'S. 40' },
      { title: 'GROUP BY (Bsp. 6.6)', sql: 'SELECT reihe, AVG(preis) FROM alben GROUP BY reihe;', src: 'S. 41' },
      { title: 'HAVING (Bsp. 6.8)', sql: 'SELECT reihe FROM alben\nGROUP BY reihe\nHAVING COUNT(band) > 3;', src: 'S. 43' },
      { title: 'Erst WHERE, dann GROUP BY (Bsp. 6.9)', sql: "SELECT reihe, COUNT(*) FROM alben\nWHERE reihe <> 'Asterix'\nGROUP BY reihe;", src: 'S. 44' }
    ],
    pitfalls: [
      '<code>WHERE COUNT(*) &gt; 2</code> ist falsch → <code>HAVING COUNT(*) &gt; 2</code>.',
      'Reihenfolge der Klauseln: SELECT – FROM – WHERE – GROUP BY – HAVING – ORDER BY (Anhang A.1, S. 132).',
      'COUNT(spalte) zählt keine NULL-Werte – wichtig beim LEFT JOIN „Anzahl, sofern vorhanden“ (Klausur 2023, 4.4).'
    ]
  },
  {
    id: 'sets',
    nr: '7',
    title: 'Mengenoperationen & Unterabfragen',
    short: 'Mengen',
    icon: '⭕',
    pages: 'Skript Kap. 7, S. 47–53',
    relevance: 4,
    examNote: 'Unterabfragen in Klausur 2023, 4.7 („Angebot mit dem höchsten Preis“). Übungsblatt 5: IN, UNION, verschachtelte SELECTs.',
    summary: 'UNION (Vereinigung), INTERSECT (Schnitt) und EXCEPT (Differenz) verknüpfen Ergebnismengen. Unterabfragen werden von innen nach außen ausgeführt: Einzelwert-Unterabfragen mit Vergleichsoperatoren, Mehrwert-Unterabfragen mit IN, EXISTS, ANY, ALL.',
    points: [
      'Mengen: A ∪ B (Vereinigung), A ∩ B (Schnitt), A \\ B (Differenz) (S. 48).',
      'SQL: <code>UNION</code>, <code>INTERSECT</code>, <code>EXCEPT</code>; zwei Datensätze gelten als gleich, wenn sie dieselben Spalteneinträge haben (S. 48).',
      '<code>spalte IN (x, y, …)</code> prüft Enthaltensein in einer Menge (S. 48–49).',
      'Unterabfrage (Subquery, innere Abfrage): Abarbeitung von innen nach außen (S. 50).',
      'Liefert die Unterabfrage genau einen Wert, können =, &lt;, &gt;, &lt;=, &gt;=, &lt;&gt; bzw. LIKE verwendet werden (7.3.1).',
      '<code>WHERE jahr = MIN(jahr)</code> ist unzulässig (Regel 3) → <code>WHERE jahr = (SELECT MIN(jahr) FROM alben)</code> (Bsp. 7.3).',
      'Mehrere Werte: EXISTS (liefert die Unterabfrage überhaupt Daten?), IN, ANY, ALL (7.3.2).',
      '<code>x &lt;= ALL(…)</code> ≙ x ≤ min; <code>x &lt;= ANY(…)</code> ≙ x ≤ max; <code>x &gt;= ALL(…)</code> ≙ x ≥ max; <code>x &gt;= ANY(…)</code> ≙ x ≥ min (S. 52).',
      'Enthält die Unterabfrage NULL, liefert ALL <b>nie</b> TRUE; ANY ignoriert NULL (S. 52).',
      '<code>= ANY</code> ist äquivalent zu IN (S. 52).'
    ],
    defs: [
      { term: 'Unterabfrage (Subquery)', def: 'Abfrage innerhalb einer WHERE-Klausel einer anderen SELECT-Anweisung; wird zuerst ausgeführt.', src: 'S. 50' },
      { term: 'EXISTS(…)', def: 'Prüft, ob die Unterabfrage überhaupt Daten liefert.', src: 'S. 51' },
      { term: 'x θ ALL(…)', def: 'Prüft, ob x θ jedem Wert der Ergebnismenge ist.', src: 'S. 51' }
    ],
    code: [
      { title: 'Älteste Alben (Bsp. 7.3)', sql: 'SELECT titel, jahr FROM alben WHERE jahr = (\n  SELECT MIN(jahr) FROM alben\n);', src: 'S. 50' },
      { title: 'IN mit Unterabfrage (Bsp. 7.6)', sql: "SELECT jahr, titel FROM alben WHERE jahr IN (\n  SELECT jahr FROM alben WHERE reihe = 'Asterix'\n);", src: 'S. 52' },
      { title: 'Mengenoperationen (Bsp. 7.2)', sql: "SELECT element FROM mengen WHERE menge = 'A'\nUNION\nSELECT element FROM mengen WHERE menge = 'B';", src: 'S. 49' }
    ],
    pitfalls: [
      'Bei mehreren Ergebnissen der Unterabfrage <code>IN</code> statt <code>=</code> verwenden (S. 80).',
      'EXCEPT funktioniert nicht in allen Systemen, insbesondere nicht in Access (S. 96).'
    ]
  },
  {
    id: 'erm',
    nr: '8',
    title: 'Entity-Relationship-Modell',
    short: 'ERM',
    icon: '🧩',
    pages: 'Skript Kap. 8, S. 54–61',
    relevance: 5,
    examNote: 'Kommt laut Dozent zu 100 % dran! Größter Einzelposten: Aufgabe 1 „Erstellen eines ERM“ – 30 Punkte (Klausur 2023: Schule; Probeklausur 2024: Getränkemarkt). Kardinalitäten (1, C, M, CM) müssen sicher aus Texten abgeleitet werden.',
    summary: 'Datenmodellierung mit Entity-Relationship-Diagrammen in Chen-Notation: Entitätstypen (Rechtecke), Beziehungen (Rauten mit Verb), Kardinalitäten (1/N bzw. M, Strich = muss, Kreis = kann). Ziel: Redundanz vermeiden durch Aufteilung in mehrere Tabellen.',
    points: [
      'Probleme einer einzigen Tabelle: Dateninkonsistenz und Speicherineffizienz – Ursache ist <b>Redundanz</b> (Bsp. 8.1, S. 56).',
      'Ziele der Datenmodellierung: Strukturierung der Anforderungen, Kommunikation Anwender↔Entwickler, effiziente Speicherung (S. 57).',
      'Die Datenmodellierung ist Grundlage des <b>logischen Datenbankentwurfs</b> (mittlere ANSI-SPARC-Ebene) (S. 57).',
      'Chen-Notation (1976): Entitätstyp, Beziehung, Kardinalität (S. 57).',
      '<b>Entität</b> = individuelles Objekt (z.B. Angestellter Otto Meier); <b>Entitätstyp</b> = Kategorie (Angestellter) → Rechteck (S. 57).',
      'Attribute: Ellipsen, Liste im Rechteck oder Tabellenform „Entitätstyp | Primärschlüssel | Attribute“ (S. 58).',
      'Entitätstypen werden zu Tabellen, Attribute zu Spalten, Entitäten zu Datensätzen (Bem. 8.2).',
      '<b>Beziehung</b>: Verb in einer Raute zwischen zwei Entitätstypen (S. 58).',
      '<b>Kardinalität</b>: Maximalzahl (1 oder N) über der Linie, Mindestzahl als Strich (muss) oder Kreis (kann) (S. 58).',
      'Modifizierte Chen-Notation: <b>1</b> = 1 „muss“, <b>C</b> = 1 „kann“, <b>M</b> = N „muss“, <b>CM</b> = N „kann“ (Tab. 8.1).',
      'Die Kardinalität für eine Entität wird am <b>gegenüberliegenden</b> Entitätstyp notiert (S. 59).',
      'Bsp. „Angestellter leitet Projekt“ 1-CM: Ein Angestellter kann mehrere Projekte leiten, ein Projekt muss genau einen Leiter haben (S. 59).',
      'Bei M:N schreibt man „M“ statt „N“, um die Unabhängigkeit beider Seiten zu betonen (S. 59).',
      'Leitfrage: Welche Daten gehören zusammen? → Entitätstypen; dann alle Entitätspaare auf Beziehungen prüfen (Bsp. 8.4).'
    ],
    defs: [
      { term: 'Entität', def: 'Individuelles Objekt der zu modellierenden Welt (real oder immateriell, z.B. Bestellung vom 1. April).', src: 'S. 57' },
      { term: 'Entitätstyp', def: 'Oberbegriff/Kategorie gleichartiger Entitäten; im ER-Diagramm ein Rechteck.', src: 'S. 57' },
      { term: 'Beziehung (relationship)', def: 'Zusammenhang zwischen zwei Entitäten; Verb in einer Raute.', src: 'S. 58' },
      { term: 'Kardinalität', def: 'Wie viele Entitäten des einen Typs mit wie vielen des anderen Typs eine Beziehung maximal haben können und mindestens haben müssen.', src: 'S. 58' },
      { term: '1 / C / M / CM', def: '1 „muss“ / 1 „kann“ / N „muss“ / N „kann“ (modifizierte Chen-Notation).', src: 'Tab. 8.1, S. 58' }
    ],
    code: [
      { title: 'ERM der Umsatzdatenbank (Bsp. 8.4)', sql: 'Artikel  —1— erzielt —N— Umsatz    → 1-CM\nKunde    —1— erzeugt —N— Umsatz    → 1-CM\nKunde    —M— kauft   —N— Artikel   → CM-CM', src: 'S. 60–61' }
    ],
    pitfalls: [
      'Kardinalität auf der falschen Seite notiert (sie steht am gegenüberliegenden Entitätstyp).',
      'Attribute einer M:N-Beziehung (z.B. Preis einer Getränkesorte je Hersteller) gehören in die Beziehung bzw. später in die Beziehungstabelle (vgl. Bsp. 9.7 „anzahl_stunden“).'
    ]
  },
  {
    id: 'derive',
    nr: '9',
    title: 'Tabellen aus dem ERM ableiten',
    short: 'Ableitung',
    icon: '🗂️',
    pages: 'Skript Kap. 9, S. 62–81',
    relevance: 5,
    examNote: 'Aufgabe 2 „Tabellen ableiten“ (15 P.), Aufgabe 6 „Welches CREATE TABLE ist richtig?“ (5 P.) und Aufgabe 5 2023 „Referenzielle Integrität“ (5 P.) – zusammen 25 Punkte pro Klausur!',
    summary: 'Beziehungen werden über Fremdschlüssel implementiert. 1:N → FK auf die N-Seite. M:N → Beziehungstabelle. 1-C → FK NOT NULL UNIQUE auf die C-Seite. C-C → Beziehungstabelle. 1-1 → eine Tabelle. Referenzielle Integrität: FK ≠ NULL muss auf existierenden PK zeigen.',
    points: [
      '<b>Fremdschlüssel</b> (Def. 9.1): Schlüssel, der nur Werte enthält, die als Primärschlüssel einer anderen Tabelle vorkommen. SQL: <code>FOREIGN KEY(fs) REFERENCES t1(pk)</code> (S. 62).',
      '<b>Referenzielle Integrität</b> (Def. 9.2): Ein FK mit Wert ≠ NULL muss auf den PK eines existierenden Datensatzes verweisen (S. 63).',
      'ON DELETE RESTRICT / SET DEFAULT / SET NULL / CASCADE regeln das Löschen referenzierter Datensätze (Tab. 9.1).',
      'Konvention: Tabellennamen im Plural (S. 64).',
      '10 mögliche Beziehungstypen: C(4,2)+4 = 10 (Bem. 9.3); nur 6 sind sauber implementierbar.',
      '<b>Regel 5</b>: Bei 1:N wird nur ein FK benötigt – auf der <b>N-Seite</b> (S. 65).',
      '<b>Regel 6</b> (C-CM): PK der 1-Seite wird FK der anderen Seite; FK <b>kann NULL</b> sein (S. 66).',
      '<b>Regel 7</b> (1-CM): wie Regel 6, aber FK <b>NOT NULL</b> (S. 66).',
      '<b>Regel 8</b> (CM-CM): Beziehungstabelle mit zwei FKs (zwei 1-CM-Beziehungen); bei höchstens einer Beziehung je Paar bilden die FKs den PK (S. 68).',
      '<b>Regel 9</b>: Gerichtete CM-CM-Beziehungen werden in zwei C-CM aufgelöst (FKs dürfen NULL sein) (S. 69).',
      '<b>Regel 10</b> (1-C): PK der 1-Seite wird FK der C-Seite, <b>NOT NULL UNIQUE</b> (S. 70).',
      '<b>Regel 11</b> (C-C): Beziehungstabelle; beide FKs NOT NULL UNIQUE und gemeinsam PK (S. 71).',
      '<b>Regel 12</b> (1-1): beide Entitätstypen werden zu einer Tabelle zusammengefasst (S. 72).',
      'Nicht sauber implementierbar: C-M, 1-M, CM-M, M-M – SQL kann keine ausreichenden Integritätsregeln garantieren (9.6).',
      '<b>Regel 13</b> (IS-A): PK der spezialisierenden Tabelle ist zugleich FK auf die vererbende Tabelle, meist ON DELETE CASCADE (S. 73).',
      'Rekursive Beziehungen: C-CM (Hierarchie, Regel 6) bzw. CM-CM (Graph, Regel 9) (9.7.2).',
      'Mehrwertige Beziehungen: Beziehungstabelle mit allen PKs als FK (9.7.3).',
      '<b>Regel 14</b>: Spaltennamen müssen eindeutig sein → ggf. <code>tabelle.spalte</code> (S. 78).'
    ],
    defs: [
      { term: 'Fremdschlüssel', def: 'Schlüssel in einer Tabelle, der nur Werte enthält, die als Primärschlüssel von mindestens einer anderen Tabelle enthalten sind.', src: 'Def. 9.1, S. 62' },
      { term: 'Referenzielle Integrität', def: 'Ein Fremdschlüssel mit einem Wert ungleich NULL muss auf den Primärschlüssel eines existierenden Datensatzes verweisen.', src: 'Def. 9.2, S. 63' },
      { term: 'Beziehungstabelle', def: 'Zusätzliche „künstliche“ Tabelle, die jedes Datensatzpaar einer M:N-Beziehung speichert; aus M:N werden zwei 1:N-Beziehungen.', src: 'S. 67' },
      { term: 'UNIQUE', def: 'Verhindert, dass zwei Datensätze den gleichen Attributwert haben (keine Dubletten).', src: 'S. 70' }
    ],
    code: [
      { title: 'Regel 7: 1-CM (Bsp. 9.6)', sql: 'CREATE TABLE abteilung (\n  name varchar(50),\n  standort varchar(50),\n  PRIMARY KEY(name)\n);\nCREATE TABLE angestellte (\n  name varchar(50) PRIMARY KEY,\n  abteilung varchar(50) NOT NULL,\n  FOREIGN KEY(abteilung) REFERENCES abteilung(name)\n);', src: 'S. 67' },
      { title: 'Regel 8: CM-CM (Bsp. 9.7)', sql: 'CREATE TABLE projektmitarbeit (\n  angestellter varchar(50),\n  projekt varchar(50),\n  anzahl_stunden int,\n  PRIMARY KEY(projekt, angestellter),\n  FOREIGN KEY(projekt) REFERENCES projekte(titel),\n  FOREIGN KEY(angestellter) REFERENCES angestellte(name)\n);', src: 'S. 69' },
      { title: 'Regel 10: 1-C', sql: 'CREATE TABLE t2 (\n  ...,\n  fs int NOT NULL UNIQUE,\n  FOREIGN KEY(fs) REFERENCES t1(id) ON DELETE RESTRICT\n);', src: 'S. 70' },
      { title: 'Regel 13: IS-A (Bsp. 9.11)', sql: 'CREATE TABLE manager (\n  angestellten_id int,\n  dienstwagen int,\n  PRIMARY KEY(angestellten_id),\n  FOREIGN KEY(angestellten_id) REFERENCES angestellte(id)\n    ON DELETE CASCADE\n);', src: 'S. 74' }
    ],
    pitfalls: [
      'FK auf die 1-Seite legen → Liste von Werten in einer Spalte → Verstoß gegen 1NF.',
      'UNIQUE vergessen bei 1:1 – ohne UNIQUE wäre es eine 1:N-Beziehung.',
      'Erst die referenzierte Tabelle anlegen, dann die referenzierende (S. 67).'
    ]
  },
  {
    id: 'normal',
    nr: '10',
    title: 'Normalisierung',
    short: 'Normalformen',
    icon: '🧹',
    pages: 'Skript Kap. 10, S. 82–89',
    relevance: 4,
    examNote: 'Aufgabe 3 in beiden Klausuren (5 P.): Für 5 Tabellen angeben, welche Normalform verletzt ist (Kinocenter 2023, Zoo 2024). Mit den Daumenregeln (10.2.5) sehr gut lösbar.',
    summary: 'Normalisierung vermeidet Redundanzen und Anomalien auf Attributebene. 1NF: keine Tabellen in Tabellen. 2NF: Nichtschlüsselattribute hängen vom ganzen PK ab. 3NF: keine transitiven Abhängigkeiten. 4NF: keine berechenbaren Attribute.',
    points: [
      '<b>Anomalie</b>: Fehlverhalten der Datenverwaltung, das zu Inkonsistenzen führt (S. 82).',
      '<b>Einfüge-Anomalie</b>: Datensatz kann nicht (konsistent) eingefügt werden, z.B. Tippfehler „Ehara“ für den Verlag (10.1.1).',
      '<b>Änderungsanomalie</b>: Bei Änderung eines Attributwertes werden nicht alle betroffenen Datensätze geändert (10.1.2).',
      '<b>Löschanomalie</b>: Durch Löschen gehen mehr Informationen verloren als gewollt (10.1.3).',
      'Ursache: zu viel Information in einem Datensatz → Aufteilung auf mehrere Tabellen (10.1.4).',
      '<b>1NF</b>: Attribute haben nur einfache Werte, keine Tabellen in einer Tabelle (S. 85).',
      '<b>2NF</b>: 1NF + Nichtschlüsselattribute hängen von <i>allen</i> PK-Attributen ab, nicht nur von Teilen (S. 86).',
      '<b>3NF</b>: 2NF + keine transitiven Abhängigkeiten; „Nichtschlüsselattribute sind unabhängig voneinander“ (S. 86).',
      '<b>4NF</b> (im Skript): 3NF + keine aus der Datenbank ableitbaren Attribute; „keine berechenbaren Kennzahlen“ (S. 87).',
      'Daumenregeln (10.2.5): 1NF kann nur verletzt sein, wenn bei 1:N der FK bei der 1 ist; 2NF nur, wenn ein natürlicher PK aus Fremdschlüsseln besteht; 3NF nur, wenn ein FK eines der Attribute ist (oder sein sollte); 4NF genau dann, wenn ein Attribut berechenbar ist.',
      'Wer Regel 6 und 7 korrekt anwendet, erfüllt automatisch 1NF (S. 86).',
      'Normalisierung erfolgt nach ER-Modellierung und Tabellenableitung (10.4).'
    ],
    defs: [
      { term: '1NF', def: 'Attribute besitzen nur einfache Werte und sind nicht wieder Tabellen.', src: 'S. 85' },
      { term: '2NF', def: '1NF und Nichtschlüsselattribute sind von allen Attributen des Primärschlüssels abhängig, nicht nur von Teilen davon.', src: 'S. 86' },
      { term: '3NF', def: '2NF und keine indirekten (transitiven) Abhängigkeiten zwischen zwei Tabellenattributen.', src: 'S. 86' },
      { term: '4NF (Skript)', def: '3NF und keine aus der Datenbank ableitbaren Attribute.', src: 'S. 87' }
    ],
    code: [
      { title: 'Beispiele aus dem Skript', sql: 'kunden(KundenNr, Firma, Ort, AuftragsNr)          → verletzt 1NF\nPositionen(ArtikelNr, AuftragsNr, Menge, Preis)  → verletzt 2NF\nArtikel(ArtikelNr, Bezeichnung, Preis, LagerNr, Lagerort) → verletzt 3NF\nRechnung(RechnungsNr, …, Nettopreis, USt-Satz, Bruttopreis) → verletzt 4NF', src: 'S. 85–87' }
    ],
    pitfalls: [
      'Immer die <b>niedrigste</b> verletzte Normalform angeben – eine Tabelle, die 1NF verletzt, ist automatisch auch nicht in 2NF/3NF/4NF.',
      'Achtung: Die Definition der 4NF im Skript („keine berechenbaren Attribute“) ist die prüfungsrelevante.'
    ]
  },
  {
    id: 'joins',
    nr: '11',
    title: 'Joins',
    short: 'Joins',
    icon: '🔗',
    pages: 'Skript Kap. 9.8 & 11, S. 78–100',
    relevance: 5,
    examNote: 'Klausur 2023: 4.4 (LEFT JOIN „sofern vorhanden“), 4.5, 4.8. Probeklausur 2024: 4.2 (LEFT JOIN „falls vorhanden“), 4.5, 4.8. W/F 2024: RIGHT JOIN durch LEFT JOIN ersetzbar.',
    summary: 'INNER JOIN zeigt nur verknüpfte Datensätze. LEFT JOIN zeigt alle Datensätze der linken Tabelle (fehlende Partner als NULL), RIGHT JOIN alle der rechten. Mit WHERE … IS NULL findet man nicht verknüpfte Datensätze. Self Joins verknüpfen eine Tabelle mit sich selbst (Aliasse nötig).',
    points: [
      'Alte Variante: Tabellen nach FROM mit Komma, Verknüpfung in WHERE (9.8); Joins trennen sauber Verknüpfungs- und Filterbedingung (S. 90).',
      'Syntax: <code>FROM links INNER JOIN rechts ON verknüpfungsbedingung WHERE filter</code> (S. 90).',
      'Typische ON-Klausel: <code>links.fremdschlüssel = rechts.id</code> (Gl. 11.1).',
      'INNER darf nach Standard entfallen, in MS Access ist es Pflicht (S. 90).',
      '<b>Regel 15</b>: Ein Inner Join zeigt nur Datensätze, die in beiden Tabellen verknüpft sind; beide Tabellen sind gleichberechtigt (S. 92).',
      '<b>Outer Join</b>: LEFT JOIN – alle Datensätze der linken Tabelle; RIGHT JOIN – alle der rechten (S. 92–94).',
      'OUTER darf man schreiben, ist aber durch LEFT/RIGHT schon eindeutig (S. 93).',
      'Nicht verknüpfte Datensätze: <code>LEFT JOIN … WHERE rechts.schlüssel IS NULL</code> (Abb. 11.1).',
      '<b>Regel 16</b>: Ein Join ist immer notwendig, wenn für eine Abfrage Information aus mehreren Tabellen benötigt wird (S. 95).',
      'Joins über mehr als zwei Tabellen: Aneinanderreihung, ER-Diagramm zur Hilfe nehmen (11.3).',
      '<b>Self Join</b>: dieselbe Tabelle zweimal mit Aliassen (t1, t2), meist INNER JOIN (11.4).'
    ],
    defs: [
      { term: 'Inner Join', def: 'Verknüpfung, die nur Datensätze anzeigt, die in beiden Tabellen miteinander verknüpft sind.', src: 'Regel 15, S. 92' },
      { term: 'Left Join', def: 'Outer Join, der alle Datensätze der linken Tabelle und die verknüpften der rechten anzeigt; fehlende Werte NULL.', src: 'S. 92–94' },
      { term: 'Self Join', def: 'Join einer Tabelle mit sich selbst; die Instanzen werden durch Aliasse unterschieden.', src: 'S. 99' },
      { term: 'Regel 16', def: 'Ein Join ist immer notwendig, wenn für eine Abfrage Information aus mehreren Tabellen benötigt wird.', src: 'S. 95' }
    ],
    code: [
      { title: 'Inner Join (Bsp. 11.1)', sql: 'SELECT alben.titel, reihen.name AS reihe\nFROM alben\nINNER JOIN reihen ON alben.reihe = reihen.id;', src: 'S. 91' },
      { title: 'Left Join (Bsp. 11.2)', sql: 'SELECT * FROM angestellte\nLEFT JOIN dienstwagen\n  ON angestellte.dienstwagen = dienstwagen.id;', src: 'S. 93' },
      { title: 'Nicht verknüpft (Bsp. 11.5)', sql: 'SELECT freunde.name FROM freunde\nLEFT JOIN kollegen ON freunde.name = kollegen.name\nWHERE kollegen.name IS NULL;', src: 'S. 95' },
      { title: 'Join über 4 Tabellen (11.3)', sql: 'SELECT DISTINCT autoren.name AS autor, reihen.name AS reihe\nFROM autoren\nINNER JOIN albenautoren ON autoren.id = albenautoren.autor\nINNER JOIN alben ON albenautoren.titel = alben.titel\nINNER JOIN reihen ON reihen.id = alben.reihe;', src: 'S. 98' },
      { title: 'Self Join (Bsp. 11.7)', sql: 'SELECT DISTINCT a2.reihe, a2.jahr, a2.preis\nFROM alben AS a1\nINNER JOIN alben AS a2 ON a1.reihe = a2.reihe\nWHERE a1.jahr < a2.jahr AND a1.preis < a2.preis\nORDER BY a2.jahr;', src: 'S. 100' }
    ],
    pitfalls: [
      '„Alle … und falls vorhanden …“ ⇒ LEFT JOIN (die „alle“-Tabelle links).',
      'M:N über eine Beziehungstabelle: Es braucht zwei Joins (z.B. Produkt – ProduktMaterial – Material).',
      'Mehrdeutige Spaltennamen immer mit Tabellennamen qualifizieren (Regel 14).'
    ]
  },
  {
    id: 'views',
    nr: '12',
    title: 'Views',
    short: 'Views',
    icon: '🪟',
    pages: 'Skript Kap. 12, S. 101–104',
    relevance: 2,
    examNote: 'In den vorliegenden Klausuren nicht abgefragt. Begriffswissen (virtuelle Tabelle, redundanzfrei, Änderungen über Views problematisch) kann in Multiple-Choice-Teilen vorkommen.',
    summary: 'Eine View ist eine gespeicherte SELECT-Anweisung – eine virtuelle, redundanzfreie Tabelle mit stets aktuellem Inhalt. Sie vereinfacht komplexe Auswertungen (API). Datenänderungen über Views sollten vermieden werden.',
    points: [
      'Syntax: <code>CREATE VIEW ansicht AS ( SELECT … );</code> – Klammern empfohlen (S. 101).',
      'Löschen: <code>DROP VIEW IF EXISTS ansicht;</code> (S. 101).',
      'Das RDBMS speichert eine View als Block von Anweisungen; jeder Aufruf ist eigentlich ein SELECT (S. 102).',
      'Views sind <b>virtuelle</b> Tabellen, <b>redundanzfrei</b> und zeigen stets aktuelle Daten (S. 102).',
      'Zweck: einfacher Zugriff auf komplexe/aggregierte Informationen, ohne die Normalisierung aufzuweichen; Programmierschnittstelle (API) (12.2).',
      'Vorteil: Abfrage wurde bereits bei Erstellung analysiert und optimiert; Nachteil: lange Laufzeiten bei großen Datenmengen (S. 104).',
      'OLAP-Systeme nahmen bewusst Redundanz in Kauf, um Performanz zu gewinnen (S. 104).',
      'INSERT/UPDATE/DELETE über Views verändern die Basistabellen und sind problematisch; ein allgemeiner Algorithmus zur Prüfung existiert nicht (Codds 6. Regel) (12.4).'
    ],
    defs: [
      { term: 'View (Ansicht)', def: 'Gespeicherte SELECT-Anweisung; virtuelle Tabelle, deren Daten nicht extra gespeichert werden.', src: 'S. 101–102' }
    ],
    code: [
      { title: 'View mit Aggregation (Bsp. 12.3)', sql: 'CREATE VIEW reiheninfo AS (\n  SELECT reihen.name AS reihe,\n         COUNT(titel) AS alben,\n         ROUND(AVG(preis),2) AS "Durchschnittspreis"\n  FROM reihen INNER JOIN alben ON reihen.id = alben.reihe\n  GROUP BY reihen.name\n);', src: 'S. 103' }
    ],
    pitfalls: [
      'Views speichern <b>keine</b> Daten – sie sind kein Snapshot.'
    ]
  },
  {
    id: 'recursion',
    nr: '13',
    title: 'CTEs & Rekursionen',
    short: 'Rekursion',
    icon: '🔁',
    pages: 'Skript Kap. 13, S. 105–114',
    relevance: 3,
    examNote: 'Nicht in den Klausuren 2023/2024, aber laut aktueller Modulbeschreibung Lerninhalt („Rekursionen mit SQL“). Aufbau einer rekursiven CTE (Basisfall – UNION ALL – Rekursionsschritt mit Bedingung) sollte bekannt sein.',
    summary: 'Eine Common Table Expression (WITH) ist eine auf eine Anweisung begrenzte View. Mit WITH RECURSIVE ruft sich eine CTE selbst auf: Basisfall UNION ALL Rekursionsschritt mit Rekursionsbedingung. Anwendungen: Zählen, Fakultät, ggT, Tiefensuche in Graphen.',
    points: [
      'CTE (Subquery Factoring), seit SQL:1999: <code>WITH name(x_1,…,x_n) AS ( SELECT … ) SELECT … FROM name;</code> (S. 105).',
      'Nach den Klammern darf kein Semikolon stehen – es ist eine einzige Anweisung (S. 106).',
      'Parameterliste muss so viele Namen haben wie Spalten; darf weggelassen werden (S. 106).',
      'Im Gegensatz zu CREATE VIEW ist WITH keine eigenständige Anweisung – es muss ein SELECT folgen; temporäre View (S. 106).',
      '<b>Rekursion</b>: Funktion ruft sich selbst auf; muss terminieren → <b>Basisfall</b>, mindestens ein Parameter muss sich ändern (S. 106–107).',
      'Syntax: <code>WITH RECURSIVE f(…) AS ( Basisfall UNION ALL SELECT … FROM f WHERE Bedingung ) SELECT … FROM f;</code> (S. 108).',
      'In MS Access und Azure SQL muss RECURSIVE weggelassen werden (S. 108).',
      'UNION statt UNION ALL ist möglich, UNION ALL aber aus Laufzeitgründen besser (S. 108).',
      'Beispiele: Hochzählen 1–10, Fakultät (12! größter int-Wert), Euklid’scher Algorithmus ggT(60,33)=3 (13.3).',
      'Tiefensuche in Graphen: <code>POSITION(kanten.nach IN suche.weg) = 0</code> verhindert Zyklen (13.4).',
      '* Mit rekursivem WITH und OVER-Partitionen ist SQL Turing-vollständig (Satz 13.5).'
    ],
    defs: [
      { term: 'Common Table Expression (CTE)', def: 'Auf eine einzelne Anweisung begrenzte View, die mit WITH einen Namen bekommt.', src: 'S. 105' },
      { term: 'Basisfall', def: 'Abbruchbedingung einer Rekursion, für die die Lösung bekannt ist.', src: 'S. 107' }
    ],
    code: [
      { title: 'Hochzählen (Bsp. 13.2)', sql: 'WITH RECURSIVE hochzaehlen(n) AS (\n  SELECT 1                      -- Basisfall\n  UNION ALL\n  SELECT n+1 FROM hochzaehlen   -- Rekursionsaufruf\n  WHERE n < 10                  -- Rekursionsbedingung\n)\nSELECT n FROM hochzaehlen;', src: 'S. 107' },
      { title: 'Fakultät (Bsp. 13.3)', sql: 'WITH RECURSIVE f(n, aggregat) AS (\n  SELECT 0, 1\n  UNION ALL\n  SELECT n+1, (n+1)*aggregat FROM f\n  WHERE n < 12\n)\nSELECT n, aggregat AS "n!" FROM f;', src: 'S. 108' }
    ],
    pitfalls: [
      'Ohne Rekursionsbedingung entsteht eine Endlosschleife (infiniter Regress).'
    ]
  },
  {
    id: 'nosql',
    nr: '14–15',
    title: 'NoSQL, CAP & verteilte Verfahren',
    short: 'NoSQL',
    icon: '🌐',
    pages: 'Skript Kap. 14–15, S. 115–129',
    relevance: 5,
    examNote: 'Laut Dozent sehr wahrscheinlich Klausurthema! Steht als Lernziel in der Modulbeschreibung („NoSQL Datenbanken und CAP Theorem“; Einsatzmöglichkeiten relationaler und nichtrelationaler DBs beurteilen). In den Klausuren 2023/2024 noch nicht enthalten – rechne mit Verständnisfragen (CAP, ACID/BASE, Typen, Szenarien). Interaktive Erklärung im Reiter „NoSQL“.',
    summary: 'Big Data erfordert horizontale Skalierung (verteilte Systeme). Das CAP-Theorem besagt: Von Konsistenz, Verfügbarkeit und Partitionstoleranz sind nur zwei gleichzeitig erfüllbar. NoSQL-Datenbanken sind schemafrei/-arm, meist verteilt, nutzen BASE statt ACID. Typen: spaltenorientiert, dokumentbasiert, Key-Value, Graph.',
    points: [
      '<b>Vertikale Skalierung</b> (scale-up): mehr Speicher/Rechenleistung; <b>horizontale Skalierung</b> (scale-out): zusätzliche Rechner → verteiltes System (S. 115).',
      'Relationale DBs sind vertikal gut aufrüstbar, horizontal aber nicht effizient skalierbar (zeilenorientierte Speicherung) (S. 116).',
      '<b>C</b>onsistency: jederzeit konsistenter Zustand; Transaktionen ganz oder gar nicht (S. 117).',
      '<b>A</b>vailability: stets schnelle, akzeptable Reaktionszeit (S. 117).',
      '<b>P</b>artition tolerance: Ausfall eines Knotens/einer Verbindung führt nicht zum Ausfall des Systems (S. 117).',
      '<b>CAP-Theorem</b> (Satz 14.3): In einem verteilten System können nur zwei der drei Eigenschaften erfüllt sein. Brewer 2000, Beweis Gilbert & Lynch 2002.',
      'Typen: relationale DBs → C–A; Online-Banking → C–P; DNS, Clouds → A–P (Abb. 14.6).',
      'ACID (relational) vs. <b>BASE</b> (basically available, soft state, eventually consistent) (S. 119).',
      '<b>NoSQL-Datenbank</b> (Def. 14.4): schemafrei bzw. schwache Schemarestriktionen, nicht relational; oft verteilt (Sharding), BASE, quelloffen.',
      'Spaltenorientiert (Wide Column Stores): BigTable, HBase, Cassandra – gut für Analyse/Aggregation/Kompression (14.2.1).',
      'Dokumentbasiert (JSON/BSON/XML): CouchDB, MongoDB (14.2.2).',
      'Key-Value Stores (assoziative Arrays): Riak, Redis, MemCacheDB (14.2.3).',
      'Graphdatenbanken: Neo4j, FlockDB, Pregel – schwer horizontal skalierbar (14.2.4).',
      'Kap. 15: MapReduce (Google 2004; map + reduce), konsistentes Hashing (Server für Bereiche von Hashwerten auf einem Ring), Vektoruhren (Lamport-Zeitstempel je Absender).'
    ],
    defs: [
      { term: 'CAP-Theorem', def: 'In einem verteilten Datenbanksystem können nur zwei der drei Eigenschaften Konsistenz (C), Verfügbarkeit (A), Partitionstoleranz (P) erfüllt sein.', src: 'Satz 14.3, S. 118' },
      { term: 'NoSQL-Datenbank', def: 'Datenbanksystem, das schemafrei ist oder nur schwache Schemarestriktionen hat; insbesondere nicht relational.', src: 'Def. 14.4, S. 120' },
      { term: 'BASE', def: 'basically available, soft state, eventually consistent – schwächeres Konsistenzmodell verteilter DBs.', src: 'S. 119' },
      { term: 'MapReduce', def: 'Von Google 2004 entwickelter Algorithmus aus einer Map- und einer Reduce-Phase zur Verarbeitung verteilter Daten.', src: 'S. 122–124' }
    ],
    code: [
      { title: 'map/reduce in JavaScript (15.1.1)', sql: 'var f = function(i) { return i*i*i; };\nvar g = function(a, x) { return x + a; };\n[1, 2, 3].map(f).reduce(g, 0); // 36', src: 'S. 123' }
    ],
    pitfalls: [
      'Relationale DBs sind laut Abb. 14.6 vom Typ C–A, nicht C–P.'
    ]
  },
  {
    id: 'codd',
    nr: 'A',
    title: 'Codd’sche Regeln & relationale Vollständigkeit',
    short: 'Codd',
    icon: '📜',
    pages: 'Skript Anhang A.2–A.3, S. 132–138',
    relevance: 1,
    examNote: 'Anhang – Hintergrundwissen. In den Klausuren nicht abgefragt.',
    summary: 'Codd formulierte 1985 zwölf Regeln (plus Axiom), mit denen man beurteilt, wie relational ein DBMS ist. SQL ist relational vollständig: Projektion, Produkt, Vereinigung, Differenz und Selektion sind ausdrückbar.',
    points: [
      'Veröffentlicht 1985 in der „Computerworld“ (S. 132).',
      'Regel 1 (Informationsregel): alle Informationen auf logischer Ebene als Werte in Tabellen (S. 133).',
      'Regel 2: Jedes Element ist über Relationsname + Primärschlüsselwert + Spaltenname erreichbar (S. 133).',
      'Regel 3: Indikatoren für fehlende Information unabhängig vom Datentyp → NULL (S. 134).',
      'Regel 6: Algorithmus für änderbare „einfache“ Views – im Allgemeinen unmöglich (S. 134–135).',
      'Regel 10: Integritätsbedingungen in der DB-Beschreibungssprache, im Systemkatalog (S. 136).',
      'Relationenalgebra: Projektion, kartesisches Produkt, Vereinigung, Differenz, Selektion (A.3).',
      'Satz A.1: SQL ist relational vollständig (S. 137).'
    ],
    defs: [
      { term: 'Relational vollständig', def: 'Eine Sprache, die die Operationen der Relationenalgebra implementiert.', src: 'S. 137' }
    ],
    code: [],
    pitfalls: []
  }
];
