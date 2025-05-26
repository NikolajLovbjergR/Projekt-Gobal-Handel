// Henter D3 biblioteket fra internettet
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Sætter luft (margin) rundt om diagrammet
const margin = { top: 5, right: 25, bottom: 10, left: 0 },
// Regner bredden ud på selve tegneområdet
      width = 1250 - margin.left - margin.right,
// Regner højden ud på selve tegneområdet
      height = 650 - margin.top - margin.bottom;

// Finder elementet med id "treemap" og tilføjer et SVG-felt
const svg = d3.select("#treemap")
  .append("svg") // Laver en SVG (tegneflade)
  .attr("width", width + margin.left + margin.right) // Giver den en bredde
  .attr("height", height + margin.top + margin.bottom) // Giver den en højde
  .append("g") // Laver en gruppe inden i SVG
  .attr("transform", `translate(${margin.left},${margin.top})`); // Flytter gruppen lidt ind, så der er margin

// Laver en boks som skal vises som info (tooltip) når man holder musen over
const tooltip = d3.select("body")
  .append("div") // Laver en div (boks)
  .attr("class", "tooltip-tree"); // Giver den et navn, så vi kan style den

// Henter data fra vores server
fetch("/api/treemap")
  .then(res => res.json()) // Laver svaret om til data vi kan bruge
  .then(data => { // Når data er klar, starter vi

    // Går igennem alle rækker i data
    data.forEach(d => {
      d.værdi = +d.værdi; // Gør 'værdi' til et tal
      d.year = d.year.toString(); // Gør 'year' til tekst
    });

    // Finder alle unikke år og sorterer dem
    const years = [...new Set(data.map(d => d.year))].sort();

    // Finder dropdown-menuen hvor man vælger år
    const dropdown = d3.select("#yearDropdown");

    // Laver en menu med alle år
    dropdown.selectAll("option") // Går i gang med at lave muligheder
      .data(years) // Bruger listen med år
      .enter() // For hver år
      .append("option") // Tilføjer en <option>
      .attr("value", d => d) // Giver den en værdi
      .text(d => d); // Skriver årstallet i menuen

    // Når brugeren vælger et år, sker dette
    dropdown.on("change", function () {
      updateTreemap(this.value); // Kalder funktionen der tegner treemappet
    });

    // Laver en forklaring (legend) med farver
    const legend = d3.select("#treemap").append("div").attr("id", "legend");
    legend.append("div").attr("class", "legend-item eksport").text("Eksport"); // Eksport-farve
    legend.append("div").attr("class", "legend-item import").text("Import"); // Import-farve

    // Viser treemappet med det første år
    updateTreemap(years[0]);

    // Funktion der tegner treemappet
    function updateTreemap(selectedYear) {
      const yearData = data.filter(d => d.year === selectedYear); // Vælger kun data for det år

      // Laver data klar til hierarki (som træ med grene)
      const hierarchyData = {
        name: "root", // Toppen af træet
        children: ["Eksport", "Import"].map(type => ({ // To grene: eksport og import
          name: type,
          children: yearData
            .filter(d => d.type === type) // Vælger kun eksport eller import
            .map(d => ({ // Laver ny struktur
              name: d.produkt,
              value: d.værdi,
              type: d.type,
              land: d.land,
              Tid: d.year
            }))
        }))
      };

      // Gør hierarkiet klar og lægger værdier sammen
      const root = d3.hierarchy(hierarchyData).sum(d => d.value);

      // Laver layoutet til treemappet (hvordan det skal tegnes)
      d3.treemap().size([width, height]).padding(1)(root);

      // Laver farveskala for eksport og import
      const colorScale = {
        "Eksport": d3.scaleLinear()
          .domain([0, d3.max(yearData, d => d.værdi)]) // Fra 0 til største værdi
          .range(['#b4e8c9', '#27ae60']), // Lys til mørk grøn
        "Import": d3.scaleLinear()
          .domain([0, d3.max(yearData, d => d.værdi)])
          .range(['#ffcccb', '#c0392b']) // Lys til mørk rød
      };

      // Forbinder data med grupper i SVG
      const treemapGroups = svg.selectAll("g.treemap-group")
        .data(root.leaves(), d => d.data.name + d.data.type + d.data.land);

      // Laver nye grupper hvor det mangler
      const treemapNewGroups = treemapGroups.enter()
        .append("g") // Ny gruppe
        .attr("class", "treemap-group") // Klasse-navn
        .attr("transform", d => `translate(${d.x0},${d.y0})`); // Flyt gruppen på plads

      // Tegner rektangler
      treemapNewGroups.append("rect")
        .attr("width", d => d.x1 - d.x0) // Bredde udregnet
        .attr("height", d => d.y1 - d.y0) // Højde udregnet
        .attr("fill", d => colorScale[d.data.type](d.data.value)) // Farve efter type og værdi
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block") // Vis tooltip
            .html(`<strong>${d.data.name}</strong><br>${d.data.type} <em>${d.data.land}</em>:<br>${d.data.Tid}<br>${d.data.value.toLocaleString()} kr.`);
        })
        .on("mousemove", event => {
          tooltip.style("left", (event.pageX + 10) + "px") // Flyt tooltip med musen
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none")); // Skjul tooltip igen

      // Skriv navnet på produktet inde i feltet
      treemapNewGroups.append("text")
        .attr("x", 4) // Start lidt inde fra venstre
        .attr("y", 14) // Start lidt nede
        .selectAll("tspan") // Laver flere linjer
        .data(d => d.data.name.split(" ")) // Deler navn op i ord
        .enter()
        .append("tspan")
        .attr("x", 4)
        .attr("dy", "1em") // Lidt afstand mellem linjerne
        .text(word => word) // Skriv ordet
        .style("font-family", "Montserrat, sans-serif")
        .style("font-size", "14px")
        .style("fill", "#28282B"); // Mørk tekstfarve

      // Opdaterer gamle felter så de flytter og får ny størrelse
      treemapGroups.transition()
        .duration(500) // Lav en blød animation
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .select("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

      // Fjerner felter der ikke længere bruges
      treemapGroups.exit().remove();
    }
  })
  .catch(error => {
    // Hvis noget går galt, vis en fejl i konsollen
    console.error("Fejl ved hentning af treemap-data:", error);
  });

