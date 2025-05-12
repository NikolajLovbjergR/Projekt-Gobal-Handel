// Margener og størrelser
const margin = { top: 40, right: 50, bottom: 50, left: 100 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Opret SVG
const svg = d3.select("svg")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Skalaer
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().range([0, height]).padding(0.2);

// Akse-grupper
const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g");

// Dropdown
const dropdown = d3.select("#landSelect");

// Indlæs CSV-fil (vigtigt: korrekt navn!)
d3.csv("BarChart.csv").then(data => {
  // Find årstal
  const years = [...new Set(data.map(d => d["År"]))].sort();

  // Find lande ud fra kolonnenavne
  const lande = Object.keys(data[0])
    .filter(k => k.startsWith("Import - "))
    .map(k => k.replace("Import - ", ""));

  // Tilføj dropdown-indstillinger (år + "Samlet")
  dropdown.selectAll("option")
    .data([...years, "Samlet"])
    .enter()
    .append("option")
    .text(d => d);

  // Funktion der strukturerer data
  function getData(valgtÅr) {
    return lande.map(land => {
      let importSum = 0, exportSum = 0;

      const rows = (valgtÅr === "Samlet") ? data : data.filter(d => d["År"] === valgtÅr);

      rows.forEach(row => {
        importSum += +row[`Import - ${land}`];
        exportSum += +row[`Eksport - ${land}`];
      });

      return {
        land,
        import: -importSum,  // venstre side
        export: exportSum    // højre side
      };
    });
  }

  // Opdater diagrammet
  function update(valgtÅr) {
    const bars = getData(valgtÅr);

    const maxVal = d3.max(bars, d => Math.max(Math.abs(d.import), Math.abs(d.export)));

    x.domain([-maxVal, maxVal]);
    y.domain(bars.map(d => d.land));

    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y));

    const groups = svg.selectAll(".barGroup").data(bars, d => d.land);

    const newGroups = groups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", d => `translate(0, ${y(d.land)})`);

    newGroups.append("rect").attr("class", "bar import");
    newGroups.append("rect").attr("class", "bar export");

    // IMPORT-bars
    groups.merge(newGroups).select(".import")
      .transition().duration(500)
      .attr("x", d => x(d.import))
      .attr("width", d => x(0) - x(d.import))
      .attr("height", y.bandwidth());

    // EKSPORT-bars
    groups.merge(newGroups).select(".export")
      .transition().duration(500)
      .attr("x", x(0))
      .attr("width", d => x(d.export) - x(0))
      .attr("height", y.bandwidth());

    // Fjern grupper der ikke længere bruges
    groups.exit().remove();
  }

  // Event: skift år
  dropdown.on("change", function () {
    update(this.value);
  });

  // Startvisning med første år
  update(years[0]);
});
