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

---

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
