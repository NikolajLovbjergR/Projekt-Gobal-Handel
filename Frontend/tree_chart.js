import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Sætter dimensioner og margener for grafen
var margin = {top: 10, right: 20, bottom: 10, left: 20},
  width = 2000 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

// Tilføjer dropdown-menu
d3.select("body").append("div").attr("id", "controls").style("margin-bottom", "20px").append("select").attr("id", "yearDropdown").selectAll("option")
  .data(["2018", "2019", "2020", "2021"])
  .enter()
  .append("option")
  .attr("value", function(d) { return d; })
  .text(function(d) { return d; });

// Tilføjer SVG-objektet til siden
d3.select("body").append("div").attr("id", "treemap-container");

var svg = d3.select("#treemap-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Tooltip - Definerer tooltip-elementet
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("color", "black")
  .style("padding", "5px")
  .style("border-radius", "3px")
  .style("display", "none");

// Funktion til at opdatere treemap baseret på valgt år
function updateTreemap(selectedYear) {
  Promise.all([
    d3.csv('/DB/treemap_import_max.csv'),
    d3.csv('/DB/treemap_export_max.csv')
  ]).then(function([importData, exportData]) {

    var data = [];

    // Filtrerer data baseret på valgt år
    importData = importData.filter(d => d.TID === selectedYear);
    exportData = exportData.filter(d => d.TID === selectedYear);

    // Behandler importdata
    importData.forEach(function(d) {
      data.push({
        name: d.LAND + ' Import ' + d.TID,
        parent: "root",
        value: +d.INDHOLD,
        LAND: d.LAND,
        TID: d.TID,
        SITC: d.SITC,
        type: "Import"
      });
    });

    // Behandler eksportdata
    exportData.forEach(function(d) {
      data.push({
        name: d.LAND + ' Eksport ' + d.TID,
        parent: "root",
        value: +d.INDHOLD,
        LAND: d.LAND,
        TID: d.TID,
        SITC: d.SITC,
        type: "Eksport"
      });
    });

    // Tilføjer rodnode
    data.push({ name: "root", parent: null, value: 0 });

    // Finder maksimumværdi til farveskalering
    var maxValue = d3.max(data, function(d) { return d.value; });

    // Definerer farveskalaer
    var importColor = d3.scaleLinear().domain([0, maxValue]).range(["#d4e6f1", "#2e86c1"]);
    var exportColor = d3.scaleLinear().domain([0, maxValue]).range(["#fdebd0", "#e67e22"]);

    // Stratificerer data
    var root = d3.stratify()
      .id(function(d) { return d.name; })
      .parentId(function(d) { return d.parent; })
      (data);

    root.sum(function(d) { return d.value; });

    // Beregner treemap layoutet
    d3.treemap()
      .size([width, height])
      .padding(1)(root);

    // Rydder SVG før ny rendering
    svg.selectAll("*").remove();

    // Tilføjer rektangler
    svg.selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", function(d) { return d.x0; })
      .attr("y", function(d) { return d.y0; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .style("stroke", "white")
      .style("fill", function(d) { return d.data.type === 'Import' ? importColor(d.data.value) : exportColor(d.data.value); })
      .on("mouseover", function(event, d) {
        tooltip.style("display", "block")
          .html("<strong>Land:</strong> " + d.data.LAND + "<br><strong>År:</strong> " + d.data.TID + "<br><strong>SITC:</strong> " + d.data.SITC + "<br><strong>Indhold:</strong> " + d.data.value.toLocaleString('da-DK'))
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("display", "none");
      });

    // Tilføjer tekstetiketter
    svg.selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d) { return d.x0 + 10; })
      .attr("y", function(d) { return d.y0 + 20; })
      .attr("font-size", "10.60px")
      .attr("fill", "white")
      .text(function(d) { return d.data.SITC; });

      svg.selectAll("Tid")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d) { return d.x0 + 10; })
      .attr("y", function(d) { return d.y0 + 35; })
      .attr("font-size", "11px")
      .attr("fill", "white")
      .text(function(d) { return d.data.TID; });

    // Tilføjer Import/Eksport tekst
    svg.selectAll(".type")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d) { return d.x0 + 10; })
      .attr("y", function(d) { return d.y0 + 50; })
      .attr("font-size", "11px")
      .attr("fill", "white")
      .text(function(d) { return d.data.type; });

  }).catch(function(error) {
    console.error("Fejl ved indlæsning af data:", error);
  });
}

// Initial visning
updateTreemap("2018");

// Opdatering ved valg i dropdown
d3.select("#yearDropdown").on("change", function() {
  var selectedYear = d3.select(this).property("value");
  updateTreemap(selectedYear);
});