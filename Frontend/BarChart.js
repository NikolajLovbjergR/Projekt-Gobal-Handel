import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';  // Importerer D3.js biblioteket

// Definerer margener og beregner den samlede bredde og højde på selve diagrammet
const margin = { top: 40, right: 30, bottom: 50, left: 100 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Vælger SVG-elementet med id 'bar-svg', sætter størrelsen og tilføjer en gruppe (g), som flyttes ift. margin
const svg = d3.select("#bar-svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Skala til x-aksen, som er lineær (import/eksport værdi)
const x = d3.scaleLinear().range([0, width]);

// Skala til y-aksen, som er kategorisk (lande)
const y = d3.scaleBand().range([0, height]).padding(0.2);

// Tilføjer x-aksen nederst i diagrammet
const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height})`);

// Tilføjer y-aksen til venstre
const yAxis = svg.append("g");

// Henter dropdown-menuen (årvælger)
const dropdown = d3.select("#yearSelect");

// Opretter en tooltip (lille infoboks ved hover)
const tooltip = d3.select("body")
  .append("div")
  .style("padding", "6px 10px")
  .style("background", "#ffffff")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.1)")
  .style("font-size", "13px")
  .style("color", "#333")
  .style("opacity", 0);  // Skjult som udgangspunkt

// Indlæser begge CSV-filer (import og eksport) samtidigt
Promise.all([
  d3.csv("/DB/BarChart_import.csv"),
  d3.csv("/DB/BarChart_eksport.csv")
]).then(([importData, eksportData]) => {
  // Henter alle unikke årstal og sorterer dem
  const years = [...new Set(importData.map(d => d["År"]))].sort();

  // Udfylder dropdown med alle årstal
  dropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d);

  // Funktion der opdaterer diagrammet for et bestemt år
  function update(year) {
    // Filtrer data for det valgte år
    const imp = importData.filter(d => d["År"] === year);
    const exp = eksportData.filter(d => d["År"] === year);

    // Kombinerer import og eksport pr. land
    const data = imp.map(d => {
      const match = exp.find(e => e.LAND === d.LAND);
      return {
        land: d.LAND,
        import: -(+d.IMPORT),  // Gør import negativ (vises til venstre)
        export: match ? +match.EKSPORT : 0
      };
    });

    // Finder den største værdi (positiv eller negativ) for skalaen
    const maxVal = d3.max(data, d => Math.max(Math.abs(d.import), Math.abs(d.export)));

    // Opdaterer skalaerne
    x.domain([-maxVal, maxVal]);
    y.domain(data.map(d => d.land));

    // Opdater akser med animation
    xAxis.transition().duration(500).call(d3.axisBottom(x));
    yAxis.transition().duration(500).call(d3.axisLeft(y));

    // Binder data til grupper af bjælker (én gruppe per land)
    const groups = svg.selectAll(".barGroup").data(data, d => d.land);

    // Tilføjer nye grupper for nye lande
    const newGroups = groups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", d => `translate(0, ${y(d.land)})`);

    // Tilføjer to rektangler til hver gruppe: én for import, én for eksport
    newGroups.append("rect").attr("class", "bar import");
    newGroups.append("rect").attr("class", "bar export");

    // IMPORT: opdaterer bjælker for import
    groups.merge(newGroups).select(".import")
      .transition().duration(500)
      .attr("x", d => x(d.import))  // Starter til venstre
      .attr("width", d => x(0) - x(d.import))  // Bredden afhænger af negativ værdi
      .attr("height", y.bandwidth())
      .attr("fill", "#e74c3c");  // Rød farve

    // Tooltip for import
    groups.merge(newGroups).select(".import")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>Import:</strong> ${Math.abs(d.import).toLocaleString()} Millioner`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // EKSPORT: opdaterer bjælker for eksport
    groups.merge(newGroups).select(".export")
      .transition().duration(500)
      .attr("x", x(0))  // Starter ved midten
      .attr("width", d => x(d.export) - x(0))  // Bredden afhænger af eksport
      .attr("height", y.bandwidth())
      .attr("fill", "#2ecc71");  // Grøn farve

    // Tooltip for eksport
    groups.merge(newGroups).select(".export")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>Eksport:</strong> ${d.export.toLocaleString()} Millioner`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Fjerner grupper som ikke længere skal vises
    groups.exit().remove();
  }

  // Når brugeren vælger et nyt år fra dropdown
  dropdown.on("change", function () {
    update(this.value);
  });

  // Vis det første år som standard
  update(years[0]);
});
