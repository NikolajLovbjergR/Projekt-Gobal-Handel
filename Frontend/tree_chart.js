import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Sætter dimensioner og margener for grafen
var margin = {top: 10, right: 20, bottom: 10, left: 20},
  width = 2000 - margin.left - margin.right,
  height = 750 - margin.top - margin.bottom;

// Tilføjer SVG-objektet til siden
var svg = d3.select("#treemap")
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
  .style("background", "white")
  .style("color", "black")
  .style("padding", "5px")
  .style("border-radius", "3px");

// Læser data fra CSV-filer
Promise.all([
  d3.csv('/DB/treemap_import.csv'),
  d3.csv('/DB/treemap_export.csv')
]).then(function([importData, exportData]) {

// Behandler importdata ved at tilføje parent og konvertere indhold til tal 
  importData.forEach(function(d) {
    d.parent = "root";
    d.value = +d.INDHOLD;
    d.type = "Import";
    d.name = "Import";
  });

  // Behandler eksportdata ved at tilføje parent og konvertere indhold til tal
  exportData.forEach(function(d) {
    d.parent = "root";
    d.value = +d.INDHOLD;
    d.type = "Export";
    d.name = "Eksport";
  });

  // Samler/kombiner data i en datastruktur
  var data = [...importData, ...exportData];

  // Tilføjer rodnode
  data.push({ name: "root", parent: null, value: 0 });

  // Finder maksimumværdi til farveskalering
  var maxValue = d3.max(data, function(d) { return d.value; });

  // Definerer farveskala for import
  var importColor = d3.scaleLinear()
    .domain([0, maxValue])
    .range(["#d4e6f1", "#2e86c1"]);

  // Definerer farveskala for eksport
  var exportColor = d3.scaleLinear()
    .domain([0, maxValue])
    .range(["#fdebd0", "#e67e22"]);

  // Stratificerer data
  var root = d3.stratify()
    .id(function(d) { return d.name; })
    .parentId(function(d) { return d.parent; })
    (data);

  // Opsummerer værdierne
  root.sum(function(d) { return d.value; });

  // Beregner treemap layoutet
  d3.treemap()
    .size([width, height])
    .padding(4)(root);

     // Vælger alle rektangel-elementer og binder data til dem
svg.selectAll("rect")
    // Binder data (treemap blade) til rektangler
    .data(root.leaves())
    // Opretter nye rektangler for hver datapunkt
    .enter()
    .append("rect")
    // Angiver x-positionen for rektanglet
    .attr('x', function (d) { return d.x0; })
    // Angiver y-positionen for rektanglet
    .attr('y', function (d) { return d.y0; })
    // Angiver bredden på rektanglet
    .attr('width', function (d) { return d.x1 - d.x0; })
    // Angiver højden på rektanglet
    .attr('height', function (d) { return d.y1 - d.y0; })
    // Tilføjer sort kant til rektanglet
    .style("stroke", "black")
    // Tilføjer klik-hændelse for at vise tooltip
    .on("click", function(event, d) {
        // Viser tooltip ved klik og opdaterer indholdet
        tooltip.style("opacity", 1)
              .html("<p>Land: " + d.data.LAND + "</p><p>Indhold: " + (d.data.INDHOLD * 1000).toLocaleString('da-DK') + " kr</p>")
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
    })
      //Når musen bevæger sig væk fjernes tekstboksen
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
      })
    .style("fill", function(d) {
      // Vælger farve afhængigt af type (Import/Eksport)
      return d.data.type === "Import" ? importColor(d.data.value) : exportColor(d.data.value);
    });

  // Tilføjer tekst
  svg.selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", function(d){ return d.x0 + 10; })
    .attr("y", function(d){ return d.y0 + 20; })
    .text(function(d){ return d.data.name; })
    .attr("font-size", "12px")
    .attr("fill", "white");

  // Tilføjer SITC/kategori tekst 
  svg.selectAll(".sitc-text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", function(d){ return d.x0 + 10; })
    .attr("y", function(d){ return d.y0 + 35; })
    .text(function(d){ return d.data.SITC; })
    .attr("font-size", "12px")
    .attr("fill", "white")
    .attr("class", "sitc-label");

   // Tilføjer indhold tekst 
   svg.selectAll(".indhold")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d){ return d.x0 + 10 })
      .attr("y", function(d){ return d.y0 + 50 })
      .text(function(d){ return 'Indhold: ' + d.data.INDHOLD })
      .attr("font-size", "12px")
      .attr("fill", "white");
// Tilføjer tid tekst 
      svg.selectAll(".indhold")
      // Binder data  til rektangler
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", function(d){ return d.x0 + 10 })
      .attr("y", function(d){ return d.y0 + 65 })
      .text(function(d){ return 'Tid: ' + d.data.TID })
      .attr("font-size", "12px")
      .attr("fill", "white");

}).catch(function(error) {
  console.error("Fejl ved indlæsning af data:", error);
});