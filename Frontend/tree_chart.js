import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// === Konfiguration af dimensioner og margener ===
const margin = { top: 10, right: 20, bottom: 60, left: 20 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// === Dropdown-menu for valg af årstal ===
d3.select("#yearDropdown")
  .selectAll("option")
  .data(["2018", "2019", "2020", "2021"])
  .enter()
  .append("option")
  .attr("value", d => d)
  .text(d => d);

// === SVG-container oprettelse ===

  const svg = d3.select("#treemap-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// === Tooltip-opsætning ===
const tooltip = d3.select("#treemap-container")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("color", "black")
  .style("padding", "5px")
  .style("border-radius", "3px")
  .style("display", "none");

// === Farveindikatorer for Import og Eksport ===
const legendY = height + 30;

// Import (Blå)
svg.append("rect")
  .attr("x", width / 2 - 100)
  .attr("y", legendY)
  .attr("width", 20)
  .attr("height", 20)
  .style("fill", "lightgreen");

svg.append("text")
  .attr("x", width / 2 - 70)
  .attr("y", legendY + 15)
  .attr("font-size", "12px")
  .attr("fill", "green")
  .style("font-weight", "bold")
  .text("Import");

// Eksport (Orange)
svg.append("rect")
  .attr("x", width / 2 + 30)
  .attr("y", legendY)
  .attr("width", 20)
  .attr("height", 20)
  .style("fill", "#ffb6c1");

svg.append("text")
  .attr("x", width / 2 + 60)
  .attr("y", legendY + 15)
  .attr("font-size", "12px")
  .attr("fill", "#ff0066")
  .style("font-weight", "bold")
  .text("Eksport");

// === Funktion: wrapText - Opdeler tekst i linjer med bindestreg ===
function wrapText(text) {
  const words = text.split(" ");
  return words.map(word => `${word}`).join("\n");
}

// === Funktion: updateTreemap - Opdaterer treemap baseret på valgt år ===
function updateTreemap(selectedYear) {
  // Henter data fra CSV-filerne
  Promise.all([
    d3.csv('/DB/treemap_import_max.csv'),
    d3.csv('/DB/treemap_export_max.csv')
  ]).then(([importData, exportData]) => {

    const data = [];

    // Filtrerer data baseret på valgt år
    importData.filter(d => d.TID === selectedYear).forEach(d => {
      data.push({
        name: `${d.LAND} Import ${d.TID}`,
        parent: "root",
        value: +d.INDHOLD,
        LAND: d.LAND,
        TID: d.TID,
        SITC: d.SITC,
        type: "Import"
      });
    });

    exportData.filter(d => d.TID === selectedYear).forEach(d => {
      data.push({
        name: `${d.LAND} Eksport ${d.TID}`,
        parent: "root",
        value: +d.INDHOLD,
        LAND: d.LAND,
        TID: d.TID,
        SITC: d.SITC,
        type: "Eksport"
      });
    });

    data.push({ name: "root", parent: null, value: 0 });

    // Maksimal værdi bruges til farveskala
    const maxValue = d3.max(data, d => d.value);

    // Farveskalaer
    const importColor = d3.scaleLinear().domain([0, maxValue]).range(["#f5b7b1", "#c0392b"]);
    const exportColor = d3.scaleLinear().domain([0, maxValue]).range(["#d4efdf", "#27ae60"]);
    // Hierarkisk struktur til treemap
    const root = d3.stratify()
      .id(d => d.name)
      .parentId(d => d.parent)(data);

    root.sum(d => d.value);

    // Tegner treemap
    d3.treemap().size([width, height]).padding(1)(root);

    // Rydder tidligere rektangler og labels
    svg.selectAll(".data-rect").remove();
    svg.selectAll(".text-label").remove();

    // Tegner rektangler
    svg.selectAll("rect.data-rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("class", "data-rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .style("fill", d => d.data.type === 'Import' ? importColor(d.data.value) : exportColor(d.data.value))
      .style("stroke", "white")
      .on("mouseover", function(event, d) {
        tooltip.style("display", "block")
               .html(`${d.data.LAND}<br>Type: ${d.data.type}<br>Value: ${d.data.value},<br>SITC: ${d.data.SITC},<br>Tid: ${d.data.TID} `)
      })
      .on("mousemove", function(event) {
        tooltip.style("left", `${event.pageX + 10}px`)
               .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
      });;

    // Tilføjer SITC tekst med bindestreg
    svg.selectAll(".text-label")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("class", "text-label")
      .attr("x", d => d.x0 + 5)
      .attr("y", d => d.y0 + 15)
      .attr("font-size", "10px")
      .attr("fill", "white")
      .style("font-weight", "bold")
      .selectAll("tspan")
      .data(d => wrapText(d.data.SITC).split("\n"))
      .enter()
      .append("tspan")
      .attr("x", function(_, i, nodes) {
        return d3.select(nodes[i].parentNode).attr("x");
      })
      .attr("dy", (d, i) => i === 0 ? 0 : 12)
      .text(d => d);

  }).catch(error => {
    console.error("Fejl ved indlæsning af data:", error);
  });
}

// Initielt kald ved første indlæsning
updateTreemap("2018");

// Event listener for dropdown-menuen
d3.select("#yearDropdown").on("change", function() {
  const selectedYear = d3.select(this).property("value");
  updateTreemap(selectedYear);
});



