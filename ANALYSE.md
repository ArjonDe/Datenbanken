# Dokumentenanalyse & Lernkonzept

Grundlage (ausschließlich): Vorlesungsskript „Datenbanken“ (A. de Vries, Version 14.09.2026, 144 S.),
Übungsblätter 1–5, Klausur 06.02.2023, Probeklausur 19.07.2024, Modulhandbuch, Modulbeschreibung (QIS).

## 1. Prüfungsstruktur (aus beiden Klausuren identisch, 90 min)

| Aufgabe | Inhalt | Punkte |
|---|---|---|
| 1 | ER-Modell aus Textbeschreibung erstellen (Schule / Getränkemarkt) | 30 |
| 2 | Tabellen aus dem ERM ableiten (FK punktiert unterstrichen) | 15 |
| 3 | Normalisierung: für 5 Tabellen verletzte Normalform angeben | 5 |
| 4 | 8 SQL-Statements à 5 P. auf festem Tabellendiagramm (S. 10) | 40 |
| 5 | Begriffe: referenzielle Integrität (2023) bzw. 5 × Wahr/Falsch (2024) | 5 |
| 6 | Richtiges CREATE TABLE für eine Beziehung wählen | 5 |

**Folgerung:** 85 % der Punkte entfallen auf ERM, Tabellenableitung und SQL.

## 2. Themen, Kapitel, Wichtigkeit

| Thema | Skript | Relevanz | Begründung |
|---|---|---|---|
| ER-Modell | Kap. 8 | ★★★★★ | 30 P. je Klausur, laut Dozent sicher |
| Tabellen ableiten, FK, ref. Integrität | Kap. 9 | ★★★★★ | 15 + 5 + 5 P. |
| SELECT/WHERE/LIKE/ORDER BY | Kap. 3 | ★★★★★ | Großteil der SQL-Aufgaben |
| Aggregat/GROUP BY/HAVING | Kap. 6 | ★★★★★ | in beiden Klausuren mehrfach |
| Joins | Kap. 9.8, 11 | ★★★★★ | LEFT JOIN „falls vorhanden“, M:N-Joins |
| Normalisierung | Kap. 10 | ★★★★☆ | 5 P., Daumenregeln 10.2.5 |
| NULL & dreiwertige Logik | Kap. 4 | ★★★★☆ | W/F 2024, IS NOT NULL |
| Primärschlüssel | Kap. 5 | ★★★★☆ | W/F 2024, Übung 3 |
| Mengen & Unterabfragen | Kap. 7 | ★★★★☆ | „höchster Preis“ (2023, 4.7) |
| Sprachelemente/Datentypen | Kap. 2 | ★★★☆☆ | CREATE TABLE, Übung 1 |
| Rekursion/CTE | Kap. 13 | ★★★☆☆ | Modulbeschreibung, nicht in Altklausuren |
| NoSQL/CAP | Kap. 14–15 | ★★★★★ | laut Dozent sehr wahrscheinlich; Modulbeschreibung |
| Views | Kap. 12 | ★★☆☆☆ | nicht abgefragt |
| DBMS/Relationen | Kap. 1 | ★★☆☆☆ | Grundvokabular |
| Codd-Regeln | Anhang | ★☆☆☆☆ | Hintergrund |

Das Skript selbst sagt (Vorwort): Mit * markierte Abschnitte, Fußnoten und Eingeklammertes sind
nicht zum Bestehen notwendig.

## 3. Markierte Lücken / Annahmen

- **Keine offiziellen Musterlösungen** zu den Klausuren. Die handschriftlichen Einträge im PDF der Klausur 2023
  enthalten Fehler (z.B. 4.5 Join ohne Beziehungstabelle ProduktMaterial) und wurden nicht übernommen.
- **Datumsdifferenz** (Klausur 2023, 4.6) ist im Skript nicht behandelt – in der App markiert.
- **Notenskala** fehlt in den Unterlagen → die App berechnet keine Note, nur Punkte/Prozent.
- **Kardinalitätssymbole** der CREATE-TABLE-Aufgaben liegen im PDF nur als Grafik vor; Muss/Kann-Annahmen sind in
  den Erklärungen gekennzeichnet.
- **Spaltennamen der Übungstabelle „Pruefungen“** (Moodle-Excel) sind nur teilweise dokumentiert.

## 4. Lernkonzept

1. **Lernmodus** (verstehen): je Kapitel Zusammenfassung, Klausurbezug, Stichpunkte, Definitionen,
   Skript-Beispiele, typische Fehler – alles mit Seitenangaben.
2. **Quiz** (aktiv abrufen): 173 Fragen in 4 Niveaus (einfach, mittel, schwer, klausurähnlich), 5 Typen
   (Single/Multiple Choice, Wahr/Falsch, Zuordnung, Lückentext), jede mit Erklärung und Fundstelle.
3. **Karteikarten** (Langzeitgedächtnis): 73 Karten mit Flip-Animation.
4. **Klausuraufgaben** (Transfer): 26 offene Aufgaben (ERM, Tabellenableitung, SQL) mit Musterlösung und
   Bewertungs-Checkliste zur Selbstkorrektur.
5. **Prüfungsmodus** (Testeffekt unter Zeitdruck): Schnelltest oder 90-min-Simulation in Original-Struktur.
6. **Spaced Repetition** (Leitner, 5 Boxen: sofort / 1 / 3 / 7 / 14 Tage). Fehler → Box 1 → erscheint sofort wieder.
7. **Lernanalytik**: Erfolgsquote, Mastery, Themen-Ranking nach Wiederholungsbedarf
   (Fehlerquote × Lernlücke × Klausurrelevanz), Fehleranalyse, Aktivität, Prüfungsverlauf.
   Die „Smart“-Auswahl nutzt dieses Ranking automatisch.

## 5. Erweiterung (SQL-Labor, ERM-Werkstatt, NoSQL)

- **SQL-Labor:** 46 Aufgaben, alle 16 SQL-Aufgaben der beiden Klausuren eingeschlossen. Ausgeführt wird echtes SQL (SQLite).
  Ausgewertet wird über einen Vergleich der Ergebnismenge mit der Musterlösung (Zeilen und Spalten,
  bei Bedarf auch Sortierung und Spaltenüberschrift).
  - Datenbank „Comics“: Originaldaten aus dem Skript.
  - Datenbank „Klausur“: Schema aus der Klausur (S. 10) mit **fiktiven** Datensätzen, da die Unterlagen keine Daten enthalten.
- **ERM-Werkstatt:** 8 Aufgaben. Die Aufgaben „Kinocenter“ und „Zoo“ sind neu formuliert, und zwar auf Basis der Tabellen aus Aufgabe 3 der Klausuren.
- **NoSQL:** 28 Fragen und 13 Karten; interaktive Grafiken ausschließlich nach Skript Kap. 14–15.
  Die Server- und Objektpositionen am Hash-Ring sind zur Veranschaulichung gewählt.
