
# Danmark i Verden: Visualisering af Handelsrelationer

## Projektbeskrivelse

Dette projekt undersøger Danmarks globale handelsmønstre med fokus på de vigtigste handelspartnere og varetyper. Gennem interaktive datavisualiseringer baseret på officielle handelsdata kortlægger vi, hvilke lande Danmark handler mest med, hvilke varer der dominerer import og eksport, og hvordan disse mønstre har ændret sig over tid. Formålet er at gøre kompleks handelsstatistik forståelig og visuelt engagerende for en bred målgruppe.

Projektet er udarbejdet som en del af 1. semesters tværfaglige eksamensprojekt på Professionsbachelor i It-arkitektur (ITA), forår 2025.

## Problemformulering

Hvordan kan Danmarks vigtigste handelsrelationer og varekategorier visualiseres, så det bliver let at forstå, hvem vi handler mest med, hvad vi handler med – og hvordan det har udviklet sig fra 2018 til 2024?

### Underspørgsmål
1. Hvordan fordeler Danmarks samlede import og eksport sig geografisk på de vigtigste handelspartnere?
2. Hvilke lande importerer og eksporterer Danmark mest med hvert år?
3. Hvilke varekategorier fylder mest i Danmarks import og eksport?
4. Hvordan har Danmarks samlede udenrigshandel udviklet sig over tid, særligt i forbindelse med større begivenheder som covid-19 og krig?

### Afgrænsning
- Tidsperiode: 2018–2024 (hvis data er tilgængelige)
- Fokus: De vigtigste lande for både import og eksport
- Data: Kun varehandel (ikke tjenesteydelser), og kun officielle handelsdata fra Danmarks Statistik

## Målgruppe

Samfundsinteresserede borgere, undervisere, gymnasieelever og studerende, der ønsker indsigt i Danmarks globale handelsrelationer.

## User Stories

### User Story #1 – Se handelsrelationer på verdenskort
**Som bruger** ønsker jeg at se hvilke lande Danmark handler mest med  
**Ved at** interagere med et verdenskort, hvor linjer går fra Danmark til de vigtigste handelspartnere  
**Fordi** jeg gerne vil forstå Danmarks vigtigste eksport- og importforbindelser visuelt  

**Acceptkriterier:**
- Visualisering med verdenskort skal være tilgængelig
- Kortet viser linjer fra Danmark til andre lande
- Hover viser eksport- og importtal

### User Story #2 – Sammenlign handelspartnere i søjlediagram
**Som bruger** ønsker jeg at sammenligne Danmarks største import- og eksportlande  
**Ved at** se to søjlediagrammer: ét for import og ét for eksport  
**Fordi** jeg gerne vil se forskellene og prioriteterne i Danmarks udenrigshandel  

**Acceptkriterier:**
- To bar charts: ét for eksport og ét for import
- Viser de vigtigste lande med værdi og landnavn
- Brugeren kan vælge år
- Diagrammer opdateres automatisk ved ændring af år

### User Story #3 – Visning af produktkategorier i treemap
**Som bruger** ønsker jeg at få overblik over hvilke typer varer Danmark handler mest med  
**Ved at** se en treemap opdelt i produktkategorier for både import og eksport  
**Fordi** jeg vil vide, hvilke varegrupper der dominerer Danmarks handel  

**Acceptkriterier:**
- Treemappen viser import og eksport fordelt på varekategorier
- Felternes størrelse angiver værdi
- Hover-effekt viser kategori og handelsværdi
- Farver og labels gør det let at aflæse information

### User Story #4 – Tidslinje over udvikling i handel
**Som bruger** ønsker jeg at følge hvordan Danmarks handel har udviklet sig over tid  
**Ved at** bruge en interaktiv linjegraf med data fra 2018–2024  
**Fordi** jeg gerne vil se, hvordan fx covid-19 og krig har påvirket handelen  

**Acceptkriterier:**
- Linjegrafer viser import og eksport over tid
- Hover viser præcise værdier
- Grafen opdateres dynamisk

## Teknologier og værktøjer
- HTML, CSS, JavaScript
- D3.js (datavisualisering)
- Node.js + Express (backend og API)
- PostgreSQL (database)
- GitHub Projects + Issues (SCRUM board)

## Projektplan – 6. maj til 23. maj 2025

### Fase 1 – Forståelse og opsætning (Uge 19: 6.–10. maj)
- Problemformulering, underspørgsmål
- User stories og målgruppebeskrivelse
- Hent og rens data (CSV fra Danmarks Statistik)
- Design datamodel og opret database med `createDb.js`
- Importér data til PostgreSQL
- Opsætning af GitHub-repo og `.gitignore`
- Test D3.js med dummydata og start kort-visualisering
- Statusmøde 1: Torsdag 8. maj

### Fase 2 – Funktionalitet og visualisering (Uge 20: 12.–16. maj)
- Interaktivt verdenskort (`map_chart.js`)
- Bar chart: import og eksport (`bar_chart.js`)
- Treemap: varekategorier (`tree_chart.js`)
- Tidslinje: udvikling fra 2018–2024 (`line_chart.js`)
- Filtrering: år, type, kategori
- Forbind backend (`server.js`) og frontend via fetch/AJAX
- Test på desktop og mobil
- Statusmøde 2: Torsdag 15. maj

### Fase 3 – Færdiggørelse og æstetik (Uge 21: 19.–23. maj)
- Forbedring af layout og design
- Loading states, fejlbeskeder, fallback
- Skriv README, dokumentation, og kommentér kode
- Lav slideshow til præsentation
- Host frontend og backend
- Opret afleveringslink til Canvas
- Aflevering: Fredag 23. maj kl. 12:00
- Show-off: Fredag 23. maj kl. 12:30

### Fase 4 – Præsentation og evaluering (Uge 22: 27. maj)
- Gruppefremlæggelse for undervisere
- 10 minutters oplæg + 30 min spørgsmål
- Demonstrér løsning, metode og teknologi

## SCRUM-arbejdsform
- Daglige standups: Hvad lavede jeg i går? Hvad laver jeg i dag? Blokeringer?
- Board: GitHub Projects (TO DO → DOING → DONE)
- Møder:
  - 8. maj: Koncept og skelet
  - 15. maj: Demo og funktioner
