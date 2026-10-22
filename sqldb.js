/**
 * Übungsdatenbanken für das SQL-Labor (SQLite-Dialekt).
 *
 *  comics  – Tabellen und Daten 1:1 aus dem Skript (Bsp. 2.1, 10.1/11.1, 11.2, 11.3, 11.5).
 *  klausur – Tabellenstruktur exakt nach dem Tabellendiagramm der Klausuren (S. 10).
 *            Die DATENSÄTZE sind FIKTIVE Übungsdaten (in den Unterlagen gibt es keine) –
 *            so gewählt, dass jede Klausuraufgabe ein aussagekräftiges Ergebnis liefert.
 *            Die im Diagramm verschriebene Spalte „MirtarbeiterID“ heißt hier MitarbeiterID.
 */
window.DBT = window.DBT || {};
DBT.data = DBT.data || {};

DBT.data.sqlDatabases = {
  comics: {
    title: 'Comics & Co. (Skript)',
    desc: 'Originaldaten aus dem Skript: reihen, alben, autoren, albenautoren, angestellte, dienstwagen, freunde, kollegen, full_house.',
    sql: `
CREATE TABLE reihen (id INT PRIMARY KEY, name VARCHAR(50));
INSERT INTO reihen VALUES (1,'Gespenster Geschichten'),(2,'Asterix'),(3,'Tim und Struppi'),(4,'Franka'),(5,'Prinz Eisenherz');

CREATE TABLE alben (titel VARCHAR(50) PRIMARY KEY, reihe INT REFERENCES reihen(id), band SMALLINT, preis DECIMAL(4,2), jahr SMALLINT);
INSERT INTO alben VALUES
 ('Gespenster Geschichten',1,1,1.20,1974),
 ('Asterix, der Gallier',2,1,2.80,1968),
 ('Asterix und Kleopatra',2,2,2.80,1968),
 ('Asterix als Legionär',2,10,3.00,NULL),
 ('Die Trabantenstadt',2,17,3.80,1974),
 ('Lucky Luke',NULL,1,5.00,1976),
 ('Der große Graben',2,25,5.00,1980),
 ('Der geheimnisvolle Stern',3,1,NULL,1972),
 ('Tim und der Haifischsee',3,23,NULL,1973),
 ('Das Kriminalmuseum',4,1,8.80,1985),
 ('Das Meisterwerk',4,2,8.80,1986);

CREATE TABLE autoren (id INT PRIMARY KEY, name VARCHAR(20) NOT NULL);
INSERT INTO autoren VALUES (1,'Uderzo'),(2,'Goscinny'),(3,'Hergé'),(4,'Kuijpers'),(5,'Franquin'),(6,'Morris');

CREATE TABLE albenautoren (autor INT NOT NULL REFERENCES autoren(id), titel VARCHAR(50) NOT NULL REFERENCES alben(titel), PRIMARY KEY(autor, titel));
INSERT INTO albenautoren VALUES
 (1,'Asterix und Kleopatra'),(1,'Asterix, der Gallier'),(1,'Der große Graben'),(1,'Die Trabantenstadt'),
 (2,'Asterix und Kleopatra'),(2,'Asterix, der Gallier'),(2,'Die Trabantenstadt'),
 (3,'Der geheimnisvolle Stern'),(3,'Tim und der Haifischsee'),
 (4,'Das Kriminalmuseum'),(4,'Das Meisterwerk'),(6,'Lucky Luke');

CREATE TABLE dienstwagen (id INT PRIMARY KEY, kennzeichen VARCHAR(10));
INSERT INTO dienstwagen VALUES (1,'HA-FH 1234'),(2,'HA-FH 2345'),(3,'HA-FH 3456');
CREATE TABLE angestellte (id INT PRIMARY KEY, name VARCHAR(10), dienstwagen INT REFERENCES dienstwagen(id));
INSERT INTO angestellte VALUES (1,'Anna',2),(2,'Otto',NULL),(3,'Alice',1),(4,'Bob',1);

CREATE TABLE freunde (name VARCHAR(20) PRIMARY KEY, wohnort VARCHAR(20));
INSERT INTO freunde VALUES ('Anna','Hagen'),('Bert','Iserlohn'),('Cindy','Soest'),('Dora','Meschede'),('Ernie','Lüdenscheid');
CREATE TABLE kollegen (name VARCHAR(20) PRIMARY KEY, abteilung VARCHAR(20));
INSERT INTO kollegen VALUES ('Anna','Controlling'),('Cindy','IT'),('Ernie','Vertrieb'),('Gerd','Marketing');

CREATE TABLE full_house (farbe VARCHAR(5), karte VARCHAR(5));
INSERT INTO full_house VALUES ('Kreuz','Ass'),('Pik','Ass'),('Herz','König'),('Herz','Ass'),('Karo','König');
`
  },

  klausur: {
    title: 'Klausur-Schema (fiktive Daten)',
    desc: 'Tabellen wie im Diagramm der Klausuren 2023/2024 (S. 10). Die Datensätze sind ausgedachte Übungsdaten.',
    sql: `
CREATE TABLE Kunde (KundenID INT PRIMARY KEY, Kundenbezeichnung VARCHAR(50), PLZ VARCHAR(5), Ort VARCHAR(30), Strasse VARCHAR(40), HausNr VARCHAR(5), Telefon VARCHAR(20));
INSERT INTO Kunde VALUES
 (1,'Schmidt Bau GmbH','58095','Hagen','Elberfelder Str.','12','02331-1001'),
 (2,'Bäckerei Alakaya','58636','Iserlohn','Wermingser Str.','3','02371-2002'),
 (3,'Müller AG','44135','Dortmund','Hansastr.','40','0231-3003'),
 (4,'Kanalbau Hagen','58097','Hagen','Feithstr.','8','02331-4004'),
 (5,'Meier & Sohn','59872','Meschede','Le-Puy-Str.','1','0291-5005'),
 (6,'Lampen Kraft','59494','Soest','Brüderstr.','22','02921-6006'),
 (7,'Müller AG','44135','Dortmund','Hansastr.','40','0231-3003'),
 (8,'Elektro Wolf','58636','Iserlohn','Mendener Str.','5','02371-8008');

CREATE TABLE Mitarbeiter (MitarbeiterID INT PRIMARY KEY, Vorname VARCHAR(30), Nachname VARCHAR(30), Abteilung VARCHAR(30), PLZ VARCHAR(5), Ort VARCHAR(30), Strasse VARCHAR(40), HausNr VARCHAR(5), Geburtsdatum DATE, Einstellungsdatum DATE);
INSERT INTO Mitarbeiter VALUES
 (1,'Anna','Becker','Vertrieb','58095','Hagen','Bahnhofstr.','2','1975-04-12','1995-03-01'),
 (2,'Bernd','Krüger','Vertrieb','58636','Iserlohn','Hohler Weg','9','1968-11-02','1989-07-15'),
 (3,'Clara','Yilmaz','Einkauf','44135','Dortmund','Ostwall','17','1980-01-30','2000-12-31'),
 (4,'David','Schulz','Produktion','58097','Hagen','Lange Str.','4','1985-06-17','2005-02-01'),
 (5,'Eva','Neumann','Vertrieb','59494','Soest','Markt','1','1990-09-09','2012-08-01'),
 (6,'Frank','Hoffmann','Verwaltung','58095','Hagen','Körnerstr.','30','1972-03-03','1990-01-01');

CREATE TABLE Produkt (ProduktID INT PRIMARY KEY, ProduktBezeichnung VARCHAR(50), Einheit VARCHAR(10));
INSERT INTO Produkt VALUES (1,'Feuerwerksrakete','Stk'),(2,'Böller','Stk'),(3,'Wunderkerze','Pkg'),(4,'Gartendünger','kg'),(5,'Bengalfeuer','Stk'),(6,'Rauchpatrone','Stk');

CREATE TABLE Produktpreis (ProduktPreisID INT PRIMARY KEY, ProduktID INT REFERENCES Produkt(ProduktID), Preis DECIMAL(10,2), Von DATE, Bis DATE);
INSERT INTO Produktpreis VALUES (1,1,12.50,'2020-01-01',NULL),(2,2,0.80,'2020-01-01',NULL),(3,3,3.20,'2020-01-01',NULL),(4,4,9.90,'2020-01-01',NULL),(5,5,15.00,'2021-01-01',NULL),(6,6,7.40,'2020-01-01','2022-12-31');

CREATE TABLE Material (MaterialID INT PRIMARY KEY, MaterialBezeichnung VARCHAR(50), Einheit VARCHAR(10));
INSERT INTO Material VALUES (1,'Salpeter','kg'),(2,'Schwefel','kg'),(3,'Holzkohle','kg'),(4,'Pappe','m2'),(5,'Eisenpulver','kg'),(6,'Leim','l'),(7,'Ton','kg'),(8,'Messingdraht','m');

CREATE TABLE ProduktMaterial (ProduktMaterialID INT PRIMARY KEY, ProduktID INT REFERENCES Produkt(ProduktID), MaterialID INT REFERENCES Material(MaterialID), Menge DECIMAL(10,2), Einheit VARCHAR(10));
INSERT INTO ProduktMaterial VALUES
 (1,1,1,0.20,'kg'),(2,1,2,0.05,'kg'),(3,1,3,0.05,'kg'),(4,1,4,0.10,'m2'),
 (5,2,1,0.02,'kg'),(6,2,4,0.01,'m2'),(7,2,6,0.01,'l'),
 (8,3,5,0.01,'kg'),(9,3,8,0.30,'m'),
 (10,4,1,0.50,'kg'),
 (11,5,2,0.10,'kg'),(12,5,1,0.05,'kg'),
 (13,6,4,0.05,'m2');

CREATE TABLE Haendler (HaendlerID INT PRIMARY KEY, HaendlerName VARCHAR(50), Sparte VARCHAR(30), PLZ VARCHAR(5), Ort VARCHAR(30), Strasse VARCHAR(40), HausNr VARCHAR(5), Telefon VARCHAR(20));
INSERT INTO Haendler VALUES
 (1,'Chemie Nord','Chemie','20095','Hamburg','Kai','1','040-111'),
 (2,'Papier Paul','Papier','58095','Hagen','Mittelstr.','5','02331-222'),
 (3,'Metall Meyer','Metall','44135','Dortmund','Ruhrallee','9','0231-333'),
 (4,'Kohle Krause','Brennstoffe','45127','Essen','Kettwiger Str.','2','0201-444');

CREATE TABLE MaterialLieferung (MaterialLieferungsID INT PRIMARY KEY, MaterialID INT REFERENCES Material(MaterialID), HaendlerID INT REFERENCES Haendler(HaendlerID), Lieferdatum DATE, Menge DECIMAL(10,2), Gesamtpreis DECIMAL(10,2));
INSERT INTO MaterialLieferung VALUES
 (1,1,1,'2019-11-15',100,450.00),
 (2,1,1,'2020-03-02',200,880.00),
 (3,2,1,'2020-06-20',50,210.00),
 (4,3,4,'2020-12-31',80,120.00),
 (5,4,2,'2021-01-10',500,350.00),
 (6,4,2,'2020-01-01',300,215.00),
 (7,5,3,'2021-05-05',20,96.00),
 (8,8,3,NULL,1000,140.00),
 (9,1,1,NULL,150,690.00),
 (10,6,2,'2019-08-08',40,88.00),
 (11,2,1,'2021-09-30',70,300.00),
 (12,3,4,'2019-12-31',60,90.00);

CREATE TABLE Angebot (AngebotsID INT PRIMARY KEY, MitarbeiterID INT REFERENCES Mitarbeiter(MitarbeiterID), KundenID INT REFERENCES Kunde(KundenID), Angefordert DATE, Erstellt DATE);
INSERT INTO Angebot VALUES
 (1,1,1,'2022-10-01','2022-10-04'),
 (2,1,3,'2022-11-10','2022-11-11'),
 (3,2,2,'2022-12-01','2022-12-15'),
 (4,5,4,'2023-01-05','2023-01-06'),
 (5,2,6,'2023-02-01','2023-02-20'),
 (6,1,5,'2023-03-03','2023-03-10'),
 (7,3,1,'2023-04-01','2023-04-03');

CREATE TABLE AngebotsProdukte (AngebotsID INT REFERENCES Angebot(AngebotsID), ProduktID INT REFERENCES Produkt(ProduktID), Menge INT, Preis DECIMAL(10,2), PRIMARY KEY(AngebotsID, ProduktID));
INSERT INTO AngebotsProdukte VALUES
 (1,1,500,6250.00),(1,2,1000,800.00),
 (2,5,300,4500.00),
 (3,3,200,640.00),(3,1,100,1250.00),
 (4,4,50,495.00),
 (5,1,800,10000.00),(5,6,100,740.00),
 (6,2,2000,1600.00),
 (7,5,10,150.00);

CREATE TABLE Auftrag (AuftragsID INT PRIMARY KEY, MitarbeiterID INT REFERENCES Mitarbeiter(MitarbeiterID), KundenID INT REFERENCES Kunde(KundenID), Auftragsdatum DATE, Erstellt DATE);
INSERT INTO Auftrag VALUES
 (1,1,1,'2022-01-15','2022-01-15'),
 (2,1,1,'2022-05-03','2022-05-04'),
 (3,2,2,'2022-07-21','2022-07-21'),
 (4,1,3,'2022-09-09','2022-09-10'),
 (5,5,1,'2022-11-30','2022-12-01'),
 (6,2,3,'2022-12-20','2022-12-20'),
 (7,2,2,'2023-01-12','2023-01-12'),
 (8,5,4,'2023-02-02','2023-02-03'),
 (9,1,6,'2023-03-14','2023-03-14'),
 (10,3,2,'2023-04-04','2023-04-05'),
 (11,5,5,'2022-03-08','2022-03-08'),
 (12,2,1,'2023-05-19','2023-05-19');

CREATE TABLE AuftragsProdukte (ProduktID INT REFERENCES Produkt(ProduktID), AuftragsID INT REFERENCES Auftrag(AuftragsID), Menge INT, Preis DECIMAL(10,2), Lieferdatum DATE, PRIMARY KEY(ProduktID, AuftragsID));
INSERT INTO AuftragsProdukte VALUES
 (1,1,100,12.50,'2022-01-30'),(1,2,50,12.50,'2022-05-20'),(1,3,20,12.50,'2022-08-01'),(1,5,80,12.50,'2022-12-15'),
 (1,6,40,12.50,'2023-01-05'),(1,8,60,12.50,'2023-02-20'),(1,12,10,12.50,NULL),
 (2,1,500,0.80,'2022-01-30'),(2,2,300,0.80,'2022-05-20'),(2,4,1000,0.80,'2022-09-30'),(2,6,800,0.80,'2023-01-05'),
 (2,7,200,0.80,'2023-01-31'),(2,9,600,0.80,'2023-03-31'),
 (3,3,100,3.20,'2022-08-01'),(3,11,50,3.20,'2022-03-20'),
 (4,4,20,9.90,'2022-09-30'),
 (5,5,30,15.00,'2022-12-15'),(5,9,40,15.00,'2023-03-31'),(5,10,25,15.00,'2023-04-30'),
 (6,10,15,7.40,'2023-04-30');

CREATE TABLE AuftragsAngebot (AngebotsID INT REFERENCES Angebot(AngebotsID), AuftragsID INT REFERENCES Auftrag(AuftragsID), PRIMARY KEY(AngebotsID, AuftragsID));
INSERT INTO AuftragsAngebot VALUES (1,5),(2,6),(3,7),(4,8),(5,9),(7,12);
`
  }
};
