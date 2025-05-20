import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
// Importerer D3-biblioteket fra CDN

// Definér marginer og dimensioner for treemappet
const margin = { top: 10, right: 20, bottom: 10, left: 20 },
      width = 1500 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;
// Opretter SVG-container som diagrammet skal tegnes i
const svg = d3.select("#treemap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
// Tilføjer tooltip som vises ved mouseover på rektangler
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip-tree")
// Henter data fra API-endpoint
fetch("/api/treemap")
  .then(res => res.json())
  .then(data => {
     // Sikrer at værdier er numeriske og årstal er strenge
    data.forEach(d => {
      d.værdi = +d.værdi;
      d.year = d.year.toString();
    });
 // Finder alle unikke år og sorterer dem til brug i dropdown
   const years = [...new Set(data.map(d => d.year))].sort();

const dropdown = d3.select("#yearDropdown");
// Tilføjer dropdown-muligheder for hvert år
dropdown.selectAll("option")
  .data(years)
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);
// Når brugeren vælger et år, opdateres treemappet
dropdown.on("change", function () {
  const selectedYear = this.value;
  updateTreemap(selectedYear);
});
// Tilføjer forklaringsboks (legend) med farver for eksport/import
 const legend = d3.select("#treemap")
  .append("div")
  .attr("id", "legend");

legend.append("div")
  .attr("class", "legend-item eksport")
  .text("Eksport");

legend.append("div")
  .attr("class", "legend-item import")
  .text("Import");
    // Initial visning med det første år i dropdown
    updateTreemap(years[0]);
   // Funktion til at opdatere treemap ved årsskift
    function updateTreemap(selectedYear) {
       // Filtrerer data til kun at vise det valgte år
      const yearData = data.filter(d => d.year === selectedYear);
 // Konstruerer hierarkisk datastruktur opdelt i Eksport og Import
      const hierarchyData = {
        name: "root",
        children: ["Eksport", "Import"].map(type => ({
          name: type,
          children: yearData
            .filter(d => d.type === type)
            .map(d => ({
              name: d.produkt,
              value: d.værdi,
              type: d.type,
              land: d.land,
              Tid: d.year
            }))
        }))
      };
 // Konverterer til D3-hierarki med summering af værdier
      const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value);
 // Definerer treemap-layoutet med størrelse og padding
      const treemapLayout = d3.treemap()
        .size([width, height])
        .padding(1);

      treemapLayout(root);
// Opretter farveskalaer for Eksport og Import
      const colorScale = {
        "Eksport": d3.scaleLinear()
            .domain([0, d3.max(yearData, d => d.værdi)])
            .range(['lightgreen', '#27ae60']),
        "Import": d3.scaleLinear()
            .domain([0, d3.max(yearData, d => d.værdi)])
            .range(['#ffcccb', '#c0392b'])
      };

 // Binder data til eksisterende treemap-grupper
       const treemapGroups = svg.selectAll("g.treemap-group")
        .data(root.leaves(), d => d.data.name + d.data.type + d.data.land);

      // Opretter nye grupper ved behov
      const treemapNewGroups = treemapGroups.enter()
        .append("g")
        .attr("class", "treemap-group")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
// Tegner rektangler for hver datapunkt
      treemapNewGroups.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale[d.data.type](d.data.value))
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
            .html(`<strong>${d.data.name}</strong><br>${d.data.type} fra <em>${d.data.land}</em>:<br>${d.data.Tid}<br>${d.data.value.toLocaleString()} kr.`);
        })
        .on("mousemove", event => {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      // Tilføjer navnet som tekst inde i hvert rektangel
      treemapNewGroups.append("text")
        .attr("x", 4)
        .attr("y", 14)
        .selectAll("tspan")
        .data(d => d.data.name.split(" "))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("dy", "1.2em")
        .text(word => word)
        .style("font-family", "Montserrat, sans-serif")
        .style("font-size", "14px")
        .style("fill", "#28282B");
// Opdaterer eksisterende grupper med overgang
       treemapGroups.transition()
        .duration(500)
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .select("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);
  // Fjerner ubrugte grupper
      treemapGroups.exit().remove();
    }
  })
  .catch(error => {
    //logger hvis der sker fejl 
    console.error("Fejl ved hentning af treemap-data:", error);
  });
