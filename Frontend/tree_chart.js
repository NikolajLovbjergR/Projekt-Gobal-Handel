import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Definér marginer og dimensioner for treemappet
const margin = { top: 5, right: 25, bottom: 10, left: 0 },
      width = 1250 - margin.left - margin.right,
      height = 650 - margin.top - margin.bottom;

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
  .attr("class", "tooltip-tree");

// Henter data fra API-endpoint
// Henter data fra serverens /api/treemap-endpoint og konverterer svaret til JSON-format.
fetch("/api/treemap")
  .then(res => res.json())
  .then(data => {
    // Sikrer at værdier er numeriske og årstal er strenge
    // Konverterer 'værdi' til tal og 'year' til tekststreng for hvert element i datasættet.
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

    // Opretter et hierarkisk datasæt med en "root"-node, opdelt i "Eksport" og "Import",
    // hvor hver undergruppe indeholder produkter med tilhørende information.
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

      // Konverterer det hierarkiske datasæt til et D3-hierarki og beregner summen af 'value' for hver gren.
      const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value);

      // Definerer treemap-layoutet med størrelse og padding
      const treemapLayout = d3.treemap().size([width, height]).padding(1);
      treemapLayout(root);

      // Opretter farveskalaer for Eksport og Import
      const colorScale = {
        "Eksport": d3.scaleLinear()
        // Siger hvor små og store værdier starter og slutter.
          .domain([0, d3.max(yearData, d => d.værdi)])
          .range(['#b4e8c9', '#27ae60']),
        "Import": d3.scaleLinear()
          .domain([0, d3.max(yearData, d => d.værdi)])
          .range(['#ffcccb', '#c0392b'])
      };

      // Binder data til eksisterende treemap-grupper
      const treemapGroups = svg.selectAll("g.treemap-group")
        .data(root.leaves(), d => d.data.name + d.data.type + d.data.land);

      // Opretter nye grupper for hvert treemap-element og placerer dem i SVG'en baseret på deres position (x0, y0)
      const treemapNewGroups = treemapGroups.enter()
        .append("g")
        .attr("class", "treemap-group")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Tilføjer rektangler til hver treemap-gruppe med passende størrelse og farve.
    // Viser tooltip med information, når man holder musen over, og skjuler den igen ved musens afgang.
      treemapNewGroups.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale[d.data.type](d.data.value))
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
            .html(`<strong>${d.data.name}</strong><br>${d.data.type} <em>${d.data.land}</em>:<br>${d.data.Tid}<br>${d.data.value.toLocaleString()} kr.`);
        })
        .on("mousemove", event => {
          tooltip.style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      // Tilføjer navnet som tekst inde i hvert rektangel
      // Tilføjer tekst til hver treemap-gruppe, opdelt i flere linjer hvis navnet indeholder mellemrum.
      treemapNewGroups.append("text")
        .attr("x", 4)
        .attr("y", 14)
        .selectAll("tspan")
        .data(d => d.data.name.split(" "))
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("dy", "1em")
        .text(word => word)
        .style("font-family", "Montserrat, sans-serif")
        .style("font-size", "14px")
        .style("fill", "#28282B");

      // Opdaterer position og størrelse på eksisterende treemap-grupper med en glidende overgang på 500 ms
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
    // Logger hvis der sker fejl 
    console.error("Fejl ved hentning af treemap-data:", error); 
  });
