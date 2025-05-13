import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
// Sæt dimensionerne og margenerne for grafen
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1350 - margin.left - margin.right,
  height = 775 - margin.top - margin.bottom;

// Tilføj en knap til at skifte data
var buttonContainer = d3.select("#treemap").append("div").attr("class", "button-container");
buttonContainer.append("button")
  .attr("id", "toggleData")
  .text("Vis Eksport")
  .style("display","block") //centrere knappen
  .style("margin","0 auto");

// Opret en SVG-container
var svg = d3.select("#treemap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("display", "block")
  .style("margin", "0 auto")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Tooltip
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip") //giver en class
  .style("position", "absolute")
  .style("background", "white")
  .style("color", "black")
  .style("padding", "5px")
  .style("border-radius", "3px")


var currentDataFile = '/DB/treemap_import.csv';
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Funktion til at opdatere treemappet baseret på CSV-fil
function updateTreemap(dataFile) {
   // Indlæs CSV-filen
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

    // Beregn størrelse for hver node
    root.sum(function(d) { return d.INDHOLD; });

    // Anvend treemap layout
    d3.treemap()
      .size([width, height]) // Sæt størrelse på treemap
      .padding(4) //afstand mellem rektanglerne 
      (root);

    svg.selectAll("rect").remove();
    svg.selectAll("text").remove();

      // Tegn rektangler baseret på data
    svg.selectAll("rect")
     // Bind data til rektanglerne
      .data(root.leaves())
      .enter()
      .append("rect")
       // Indstil x-positionen for hvert rektangel
      .attr('x', function (d) { return d.x0; })
        // Indstil y-positionen for hvert rektangel
      .attr('y', function (d) { return d.y0; })
      // Indstil bredden af hvert rektangel
      .attr('width', function (d) { return d.x1 - d.x0; })
      // Indstil højden af hvert rektangel
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", function(d) { return colorScale(d.data.LAND); })
      //hånter mus knap 
      .on("click", function(event, d) {
        // Vis tooltip ved klik
        tooltip.style("opacity", 1)
              .html("<p>Land: " + d.data.LAND + "</p><p>Indhold: " + (d.data.INDHOLD * 1000).toLocaleString('da-DK') + " kr</p>")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
      })
       .on("mouseout", function() {
        // Skjul tooltip ved mouseout
        tooltip.style("opacity", 0);
      });
       // Tilføj tekst til hvert rektangel
    svg.selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
       // Indstil x-positionen for text
      .attr("x", function(d){ return d.x0 + 10 })
        // Indstil y-positionen for text
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
       // Tekstindholdet er landets navn i dette tilfælde, som hentes fra dataobjektet
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

       svg.selectAll("text.tid")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d){ return d.x0 + 10 })
      .attr("y", function(d){ return d.y0 + 65 })
      .text(function(d){ return 'tid: ' + d.data.TID })
      .attr("font-size", "12px")
      .attr("fill", "white");
        



  }).catch(function(error) {
    console.error("Fejl ved indlæsning af data:", error);
  });
}

updateTreemap(currentDataFile);

// Event listener til knappen, der skifter data
d3.select("#toggleData").on("click", function() {
 // Skift mellem import og eksport data
  if (currentDataFile === '/DB/treemap_import.csv') {
    currentDataFile = '/DB/treemap_export.csv';
    d3.select("#toggleData").text("Vis Import");
  } else {
    currentDataFile = '/DB/treemap_import.csv';
    d3.select("#toggleData").text("Vis Eksport");
  }

  updateTreemap(currentDataFile);
});