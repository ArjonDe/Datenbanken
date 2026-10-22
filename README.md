# 🗄️ DB-Klausurtrainer

Interaktive Lernplattform zur Klausur **Datenbanken** (FH Südwestfalen, Prof. de Vries).
Alle Inhalte stammen ausschließlich aus Vorlesungsskript, Übungsblättern 1–5, Klausur 2023 und
Probeklausur 2024 – Details und markierte Lücken siehe [ANALYSE.md](ANALYSE.md).

**Funktionen:** Lernmodus · **SQL-Labor** (46 Aufgaben mit echter Ausführung & automatischer
Auswertung, Spielwiese, bebilderte Einsteiger-Anleitung) · **ERM-Werkstatt** (8 Modellierungsaufgaben
mit gezeichneter Musterlösung, Kardinalitäten-Trainer, Ableitungsregeln) · **NoSQL** (interaktives
CAP-Theorem, Speichermodelle, MapReduce, Hash-Ring) · Quiz (189 Fragen, 5 Fragetypen, 4 Niveaus) ·
Karteikarten (81) · Klausuraufgaben mit Musterlösung (26) · Prüfungsmodus (Schnelltest & 90-min-Simulation) ·
Leitner-Spaced-Repetition · Lernanalytik · Hell/Dunkel · Mobile First · Fortschritt in `localStorage`
(Export/Import möglich).

Reines HTML/CSS/JavaScript – **kein Build.** Einzige externe Abhängigkeit: die SQL-Engine
[sql.js 1.10.3](https://github.com/sql-js/sql.js) (SQLite als WebAssembly), die das SQL-Labor bei Bedarf
von cdnjs nachlädt (Internetverbindung nötig).

## Projektstruktur

```
db-lernplattform/
├── index.html                 App-Shell (Navigation, Script-Reihenfolge)
├── .nojekyll                  GitHub Pages: Dateien unverändert ausliefern
├── README.md / ANALYSE.md
├── assets/
│   ├── css/styles.css         Design-Tokens, Light/Dark, Layout, Komponenten
│   └── img/klausur-schema.png Tabellendiagramm der Klausuren (S. 10)
└── js/
    ├── core/
    │   ├── util.js            DOM, Escaping, SQL-Highlighting, Toast, Fortschrittsring
    │   ├── store.js           localStorage-Persistenz, Export/Import, Streak
    │   ├── srs.js             Leitner-System, Themenstatistik, Smart-Auswahl
    │   ├── question.js        Fragen-Komponente (alle 5 Typen, Auswertung, Feedback)
    │   ├── task.js            Offene Aufgaben mit Checklisten-Selbstbewertung
    │   ├── sqlengine.js       sql.js laden, Abfragen ausführen, Ergebnismengen vergleichen
    │   ├── editor.js          SQL-Editor mit Live-Syntax-Highlighting
    │   └── ermsvg.js          Zeichnet ER-Diagramme (Chen-Notation) als SVG
    ├── data/
    │   ├── topics.js          Wissensbasis: 15 Lernmodule
    │   ├── questions.js       Fragenpool
    │   ├── flashcards.js      Karteikarten
    │   ├── tasks.js           Klausuraufgaben (ERM, Tabellen, SQL)
    │   ├── sqldb.js           Übungsdatenbanken (Comics aus dem Skript, Klausur-Schema mit fiktiven Daten)
    │   ├── sqlexercises.js    SQL-Aufgaben mit Musterlösung, Hinweisen, Prüfregeln
    │   └── erm.js             ERM-Aufgaben (Diagramm-Spezifikation) + Kardinalitäten-Trainer
    ├── views/                 dashboard, learn, sql, sqlguide, erm, nosql, quiz, cards, tasks, exam, stats
    └── app.js                 Hash-Router, Theme, Badges
```

## Lokal starten

Am besten mit lokalem Server (für das SQL-Labor nötig, da die SQL-Engine per Netzwerk geladen wird):

```bash
python3 -m http.server 8000
```

Dann <http://localhost:8000> öffnen.

## Deployment auf GitHub Pages

1. Auf GitHub ein neues, **öffentliches** Repository anlegen, z.B. `db-klausurtrainer` (ohne README).
2. Im Ordner `db-lernplattform` ausführen (`<USER>` ersetzen):

```bash
git init
git add .
git commit -m "DB-Klausurtrainer"
git branch -M main
git remote add origin https://github.com/<USER>/db-klausurtrainer.git
git push -u origin main
```

3. Auf GitHub: **Settings → Pages → Build and deployment → Source: „Deploy from a branch“**,
   Branch **`main`**, Ordner **`/ (root)`** → **Save**.
4. Nach ca. 1 Minute ist die Seite erreichbar unter
   `https://<USER>.github.io/db-klausurtrainer/`

Updates: Dateien ändern, dann

```bash
git add . && git commit -m "Update" && git push
```

> Hinweis: Das Repository ist öffentlich. Prüfe, ob du die Klausuraufgaben veröffentlichen darfst –
> sonst ein privates Repository nutzen (GitHub Pages für private Repos erfordert ein kostenpflichtiges
> bzw. Education-Konto) oder die App nur lokal verwenden.

## Inhalte erweitern

Neue Fragen in `js/data/questions.js` ergänzen – Format ist im Dateikopf dokumentiert:

```js
{ id: 'sel-99', t: 'select', l: 2, y: 'sc',
  q: 'Frage …', o: ['A', 'B', 'C'], a: 1,
  e: 'Erklärung …', s: 'Skript 3.4, S. 25' }
```

Der Fortschritt bleibt erhalten, solange die `id` gleich bleibt.
