# 📦 Hvordan handler Danmark med verden?
*Datavisualisering af Danmarks handelsrelationer*

## 📘 Projektbeskrivelse
Dette projekt undersøger Danmarks globale handelsmønstre med fokus på de vigtigste handelspartnere og varetyper. Gennem interaktive datavisualiseringer baseret på officielle handelsdata kortlægger vi, hvilke lande Danmark handler mest med, hvilke varer der dominerer import og eksport, og hvordan disse mønstre har ændret sig over tid. Formålet er at gøre kompleks handelsstatistik forståelig og visuelt engagerende for en bred målgruppe.

Projektet er udarbejdet som en del af 1. semesters tværfaglige eksamensprojekt på Professionsbachelor i It-arkitektur (ITA), forår 2025.

---

## ❓ Problemformulering
Hvordan har Danmarks handel med udlandet udviklet sig de seneste år, og hvilke lande og produkter dominerer henholdsvis import og eksport?

---

## 🔍 Underspørgsmål
- Hvilke lande er Danmarks vigtigste handelspartnere målt på import og eksport?
- Hvilke produktkategorier udgør størstedelen af Danmarks eksport og import?
- Hvilke ændringer ses i handelsmønstret efter 2020 i forbindelse med globale begivenheder?

---

## 🎯 Afgrænsning
- **Tidsperiode:** 2018–2024 (hvis data er tilgængelige)  
- **Fokus:** De 10 vigtigste lande for både import og eksport  
- **Data:** Kun varehandel (ikke tjenesteydelser), og kun officielle handelsdata fra Danmarks Statistik

---

## 🎯 Målgruppe
Samfundsinteresserede borgere, undervisere, gymnasieelever og studerende, der ønsker indsigt i Danmarks globale handelsrelationer.

---

## 🧩 User Stories

### 🗺️ User Stories #1 – Se handelsrelationer på verdenskort
**Som** bruger  
**Ønsker jeg at** se hvilke lande Danmark handler mest med  
**Ved at** interagere med et verdenskort, hvor linjer går fra Danmark til de 10 største handelspartnere  
**Fordi** jeg gerne vil forstå Danmarks vigtigste eksport- og importforbindelser visuelt  

**Acceptkriterier:**
- Visualisering med verdenskort skal være tilgængelig
- Kortet viser linjer fra Danmark til andre lande
- Linjetykkelse angiver handelsvolumen
- Hover viser eksport- og importtal
- Kortet understøtter zoom og panorering

---

### 📊 User Stories #2 – Sammenlign handelspartnere i søjlediagram
**Som** bruger  
**Ønsker jeg at** sammenligne Danmarks største import- og eksportlande  
**Ved at** se to søjlediagrammer: ét for import og ét for eksport  
**Fordi** jeg gerne vil se forskellene og prioriteterne i Danmarks udenrigshandel  

**Acceptkriterier:**
- To bar charts: ét for eksport og ét for import
- Viser top 5 lande med værdi og landnavn
- Brugeren kan vælge år
- Diagrammer opdateres automatisk ved ændring af år

---

### 🧱 User Stories #3 – Visning af produktkategorier i treemap
**Som** bruger  
**Ønsker jeg at** få overblik over hvilke typer varer Danmark handler mest med  
**Ved at** se en treemap opdelt i produktkategorier for både import og eksport  
**Fordi** jeg vil vide, hvilke varegrupper der dominerer Danmarks handel  

**Acceptkriterier:**
- Treemappen viser import og eksport fordelt på varekategorier
- Felternes størrelse angiver værdi
- Hover-effekt viser kategori og handelsværdi
- Farver og labels gør det let at aflæse information

---

### 📈 User Stories #4 – Tidslinje over udvikling i handel
**Som** bruger  
**Ønsker jeg at** følge hvordan Danmarks handel har udviklet sig over tid  
**Ved at** bruge en interaktiv linjegraf med data fra 2018–2024  
**Fordi** jeg gerne vil se, hvordan fx covid-19 og krig har påvirket handelen  

**Acceptkriterier:**
- Linjegrafer viser import og eksport over tid
- Mulighed for at vælge specifikke lande og varetyper
- Tidsvælger (slider/dropdown) er tilgængelig
- Hover viser præcise værdier
- Grafen opdateres dynamisk

---

## 🗂️ Teknologier og værktøjer
- HTML, CSS, JavaScript
- D3.js (datavisualisering)
- Node.js + Express (webserver)
- PostgreSQL (database)
- GitHub Projects + Issues (projektstyring)



