import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
// Sæt dimensionerne og margenerne for grafen
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1250 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// Tilføj en knap til at skifte data
var buttonContainer = d3.select("#treemap").append("div").attr("class", "button-container");
buttonContainer.append("button")
  .attr("id", "toggleData")
  .text("Vis Eksport");

// Opret en SVG-container
var svg = d3.select("#treemap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("display", "block")
  .style("margin", "0 auto")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var currentDataFile = '/DB/treemap_import.csv';
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Funktion til at opdatere treemappet baseret på CSV-fil
function updateTreemap(dataFile) {
  d3.csv(dataFile).then(function(data) {

    // Sørg for at INDHOLD er numerisk
    data.forEach(d => {
      d.parent = "root";
      d.INDHOLD = +d.INDHOLD;
    });

    // Tilføj rodnode
    data.push({ LAND: "root", parent: null, INDHOLD: 0 });

    var root = d3.stratify()
      .id(function(d) { return d.LAND; })
      .parentId(function(d) { return d.parent; })
      (data);

    // Skab et hierarki med summen af INDHOLD
    root.sum(function(d) { return d.INDHOLD; });

    // Anvend treemap layout
    d3.treemap()
      .size([width, height])
      .padding(4)
      (root);

    svg.selectAll("rect").remove();
    svg.selectAll("text").remove();

    svg.selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", function(d) { return colorScale(d.data.LAND); });

    svg.selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d){ return d.x0 + 10 })
      .attr("y", function(d){ return d.y0 + 20 })
      .text(function(d){ return d.data.LAND })
      .attr("font-size", "12px")
      .attr("fill", "white");

    svg.selectAll("text.indhold")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d){ return d.x0 + 10 })
      .attr("y", function(d){ return d.y0 + 35 })
      .text(function(d){ return 'Indhold: ' + d.data.INDHOLD })
      .attr("font-size", "12px")
      .attr("fill", "white");

    svg.selectAll("text.sitc")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d){ return d.x0 + 10 })
      .attr("y", function(d){ return d.y0 + 50 })
      .text(function(d){ return 'SITC: ' + d.data.SITC })
      .attr("font-size", "12px")
      .attr("fill", "white");

  }).catch(function(error) {
    console.error("Fejl ved indlæsning af data:", error);
  });
}

updateTreemap(currentDataFile);


d3.select("#toggleData").on("click", function() {
  if (currentDataFile === '/DB/treemap_import.csv') {
    currentDataFile = '/DB/treemap_export.csv';
    d3.select("#toggleData").text("Vis Import");
  } else {
    currentDataFile = '/DB/treemap_import.csv';
    d3.select("#toggleData").text("Vis Eksport");
  }

  updateTreemap(currentDataFile);
});