# Projekt-Gobal-Handel

# 🌍 Darknet Global Trade – Datavisualisering af ulovlig handel

## 🔎 Projektbeskrivelse
Dette projekt undersøger globale handelsmønstre på en darknet-markedsplads med fokus på illegale fysiske produkter. Gennem datavisualiseringer baseret på et scraped datasæt fra darknet, kortlægger vi hvordan produkter som cannabis, amfetamin og psykedelika distribueres mellem forskellige lande, samt hvilke mønstre der opstår ift. pris, oprindelse og produktkategori.

Projektet er udarbejdet som en del af 1. semesters tværfaglige eksamensprojekt på Professionsbachelor i It-arkitektur (ITA), forår 2025.

---

## 🎯 Problemformulering
Hvordan varierer udbuddet og prisfastsættelsen af illegale fysiske produkter på en darknet-markedsplads på tværs af geografiske områder, produktkategorier og sælgere?

### Underspørgsmål
1. Hvilke produktkategorier er mest udbredte på markedspladsen, og hvordan fordeler de sig geografisk?
2. Hvilke lande anvendes hyppigst som afsendelses- og modtagerlande?
3. Hvilke prisniveauer gælder for forskellige typer stoffer, og hvordan varierer disse med produktmængde og oprindelsesland?

## ✅ User Stories

Brugerhistorie #1: Interaktivt verdenskort
Opret interaktivt verdenskort med handelsruter
Som en bruger
Vil jeg gerne kunne se et interaktivt verdenskort med handelsruter
Ved at visualisere datapunkter for afsender- og modtagerlande
Fordi jeg vil forstå, hvorfra og hvortil varer sendes

Acceptkriterier

Der skal vises et verdenskort med markerede handelsruter

Hver rute skal indikere afsender- og modtagerland

Brugeren skal kunne zoome og panorere

Ruter skal være farvekodet efter fx produktkategori eller volumen

Brugerhistorie #2: Udbredte produkter
Vis mest udbredte produktkategorier
Som en samfundsinteresseret
Vil jeg gerne kunne se, hvilke typer stoffer der er mest udbredte
Ved at få vist en oversigt eller et diagram over produktkategorier
Fordi jeg vil have overblik over darknet-handlens indhold

Acceptkriterier

Der skal vises en liste eller et diagram over de mest udbredte produktkategorier

Brugeren skal kunne sortere efter antal eller procentandel

Visualiseringen skal være interaktiv

Brugerhistorie #3: Prisniveauer
Analysér prisniveauer på tværs af lande og kategorier
Som en journalist
Vil jeg gerne kunne se prisniveauer pr. land og kategori
Ved at analysere priser ud fra datasættet
Fordi jeg vil analysere handelsmønstre

Acceptkriterier

Der skal vises en tabel eller graf over priser fordelt på land og kategori

Brugeren skal kunne vælge specifikke lande eller produkter

Pris pr. enhed og pr. mængde skal være tydeligt angivet

Brugerhistorie #4: Filtrering af data
Filtrér data efter produktkategori
Som en studerende
Vil jeg gerne kunne filtrere data på produktkategori
Ved at bruge et filter eller en dropdown-menu
Fordi jeg vil fokusere på specifikke handelsområder

Acceptkriterier

Brugeren skal kunne vælge en eller flere produktkategorier

Visualiseringerne skal opdatere dynamisk baseret på valgte filtre

Det skal være tydeligt, hvilke filtre der er aktive

Brugerhistorie #5: Responsiv visualisering
Sørg for responsiv visualisering
Som en bruger på mobil eller tablet
Vil jeg gerne have en responsiv visualisering
Ved at siden tilpasser sig min skærmstørrelse
Fordi jeg vil kunne tilgå indholdet på alle enheder

Acceptkriterier

Visualiseringen skal tilpasse sig forskellige skærmstørrelser

Interaktive elementer skal være tilgængelige på touch-enheder

Ingen information må gå tabt på små skærme

## 👥 Målgruppe
Projektets primære målgruppe er samfundsinteresserede, journalister og undervisere med fokus på global handel, narkotikapolitik og cybersikkerhed. Visualiseringen skal give indsigt i den skjulte, digitale økonomi på darknet.

---

## 🛠️ Teknologier og værktøjer
- **Frontend**: HTML, CSS, JavaScript, D3.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Visualisering**: D3.js (kort, grafer, interaktive elementer)
- **Versionstyring**: Git & GitHub
- **Hosting**: GitHub Pages (frontend), Render (backend)

---

## 🧠 Projektstruktur
```plaintext
📁 /client         → HTML, CSS, JS, D3 visualisering
📁 /server         → Express server + API-ruter
📁 /data           → CSV og SQL scripts til database
📄 createDb.js     → Script til oprettelse og import af database
📄 server.js       → Webserver og API
📄 .env.example    → Eksempel på miljøvariabler
📄 README.md       → Denne dokumentation
