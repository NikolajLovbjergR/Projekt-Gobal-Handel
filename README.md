# Projekt-Gobal-Handel

# Darknet Global Trade – Datavisualisering af ulovlig handel

## Projektbeskrivelse
Dette projekt undersøger globale handelsmønstre på en darknet-markedsplads med fokus på illegale fysiske produkter. Gennem datavisualiseringer baseret på et scraped datasæt fra darknet, kortlægger vi hvordan produkter som cannabis, amfetamin og psykedelika distribueres mellem forskellige lande, samt hvilke mønstre der opstår ift. pris, oprindelse og produktkategori.

Projektet er udarbejdet som en del af 1. semesters tværfaglige eksamensprojekt på Professionsbachelor i It-arkitektur (ITA), forår 2025.

---

## Problemformulering
Hvordan varierer udbuddet og prisfastsættelsen af illegale fysiske produkter på en darknet-markedsplads på tværs af geografiske områder, produktkategorier og sælgere?

### Underspørgsmål
1. Hvilke produktkategorier er mest udbredte på markedspladsen, og hvordan fordeler de sig geografisk?
2. Hvilke lande anvendes hyppigst som afsendelses- og modtagerlande?
3. Hvilke prisniveauer gælder for forskellige typer stoffer, og hvordan varierer disse med produktmængde og oprindelsesland?

## User Stories

## Brugerhistorie #1: Interaktivt verdenskort
**Som en** bruger  
**Vil jeg gerne** kunne se et interaktivt verdenskort med handelsruter  
**Ved at** visualisere datapunkter for afsender- og modtagerlande  
**Fordi** jeg vil forstå, hvorfra og hvortil varer sendes  

** Acceptkriterier**
- Verdenskort med markerede handelsruter
- Ruter viser afsender- og modtagerland
- Zoom og panorering muligt
- Farvekoder for fx produktkategori eller volumen

---

## Brugerhistorie #2: Udbredte produkter
**Som en** samfundsinteresseret  
**Vil jeg gerne** kunne se, hvilke typer stoffer der er mest udbredte  
**Ved at** få vist en oversigt eller et diagram over produktkategorier  
**Fordi** jeg vil have overblik over darknet-handlens indhold  

** Acceptkriterier**
- Diagram/liste over mest udbredte produktkategorier
- Mulighed for sortering (antal, procent)
- Interaktiv visualisering

---

## Brugerhistorie #3: Prisniveauer
**Som en** journalist  
**Vil jeg gerne** kunne se prisniveauer pr. land og kategori  
**Ved at** analysere priser ud fra datasættet  
**Fordi** jeg vil analysere handelsmønstre  

** Acceptkriterier**
- Tabel eller graf over prisniveauer (land + kategori)
- Mulighed for at vælge specifikke lande/produkter
- Pris pr. enhed og mængde vises klart

---

## Brugerhistorie #4: Filtrering af data
**Som en** studerende  
**Vil jeg gerne** kunne filtrere data på produktkategori  
**Ved at** bruge filtre eller dropdown-menu  
**Fordi** jeg vil fokusere på specifikke handelsområder  

** Acceptkriterier**
- Filtrering på én eller flere produktkategorier
- Visualisering opdateres dynamisk
- Tydelig visning af aktive filtre

---

## Brugerhistorie #5: Responsiv visualisering
**Som en** bruger på mobil eller tablet  
**Vil jeg gerne** have en responsiv visualisering  
**Ved at** siden tilpasser sig min skærmstørrelse  
**Fordi** jeg vil kunne tilgå indholdet på alle enheder  

** Acceptkriterier**
- Layout tilpasses automatisk til skærmstørrelse
- Touch-elementer fungerer optimalt
- Ingen information går tabt på mindre skærme


## Målgruppe
Projektets primære målgruppe er samfundsinteresserede, journalister og undervisere med fokus på global handel, narkotikapolitik og cybersikkerhed. Visualiseringen skal give indsigt i den skjulte, digitale økonomi på darknet.

---

## 🛠Teknologier og værktøjer
- **Frontend**: HTML, CSS, JavaScript, D3.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Visualisering**: D3.js (kort, grafer, interaktive elementer)
- **Versionstyring**: Git & GitHub
- **Hosting**: GitHub Pages (frontend), Render (backend)
