import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';  // Importerer D3.js biblioteket

// Margener og tegneområde
const margin = { top: 40, right: 30, bottom: 50, left: 100 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Vælger SVG og tilføjer en <g> gruppe med margin
const svg = d3.select("#bar-svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Skalaer
const x = d3.scaleLinear().range([0, width]);     // vandret skala (import/eksport)
const y = d3.scaleBand().range([0, height]).padding(0.2); // lodret skala (lande)

// Akse-elementer
const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g");

// Dropdown til at vælge årstal
const dropdown = d3.select("#yearSelect");

// Tooltip til mus-over
var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip") //giver en class
  .style("position", "absolute")
  .style("background", "white")
  .style("color", "black")
  .style("padding", "5px")
  .style("border-radius", "5px")

// Læs data fra én CSV-fil
d3.csv("/DB/BarChart.csv").then(data => {
  const years = [...new Set(data.map(d => d["År"]))].sort();  // Find årstal

  // Fyld dropdown med år
  dropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d);

  // Funktion der tegner/opdaterer grafen
  function update(year) {
    // Filtrer data for det valgte år
    const filtered = data.filter(d => d["År"] === year);

    // Konverter værdier til tal
    const parsed = filtered.map(d => ({
      land: d.LAND,
      import: -(+d.IMPORT),         // import til venstre (negativ)
      export: +d["Eksport"]         // eksport til højre (positiv)
    }));

    // Find maksimum værdi til begge sider
    const maxVal = d3.max(parsed, d => Math.max(Math.abs(d.import), Math.abs(d.export)));

    // Opdater skalaer
    x.domain([-maxVal, maxVal]);
    y.domain(parsed.map(d => d.land));

    // Opdater akser med dansk format på tal
    xAxis.transition().duration(500).call(
      d3.axisBottom(x).tickFormat(d => d.toLocaleString('da-DK'))
    );
    yAxis.transition().duration(500).call(d3.axisLeft(y));

    // Bind data til grupper
    const groups = svg.selectAll(".barGroup").data(parsed, d => d.land);

    const newGroups = groups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", d => `translate(0, ${y(d.land)})`);

    // Tilføj søjler
    newGroups.append("rect").attr("class", "bar import");
    newGroups.append("rect").attr("class", "bar export");

    // Import søjle
    groups.merge(newGroups).select(".import")
      .transition().duration(500)
      .attr("x", d => x(d.import))
      .attr("width", d => x(0) - x(d.import))
      .attr("height", y.bandwidth())
      .attr("fill", "#e74c3c");  // Rød

    // Tooltip for import
    groups.merge(newGroups).select(".import")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>Import:</strong> ${Math.abs(d.import).toLocaleString('da-DK')} milliarder kroner`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Eksport søjle
    groups.merge(newGroups).select(".export")
      .transition().duration(500)
      .attr("x", x(0))
      .attr("width", d => x(d.export) - x(0))
      .attr("height", y.bandwidth())
      .attr("fill", "#2ecc71");  // Grøn

    // Tooltip for eksport
    groups.merge(newGroups).select(".export")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>Eksport:</strong> ${d.export.toLocaleString('da-DK')} milliarder kroner`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Fjern gamle grupper
    groups.exit().remove();
  }

  // Håndter ændring i dropdown
  dropdown.on("change", function () {
    update(this.value);
  });

  // Start med første år
  update(years[0]);
});
