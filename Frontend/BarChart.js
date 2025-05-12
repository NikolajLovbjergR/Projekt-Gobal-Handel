// Opsætning af marginer og størrelser
const margin = { top: 40, right: 50, bottom: 50, left: 100 },
      width = 900 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Opret SVG-container
const svg = d3.select("svg")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Skalaer og akser
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().range([0, height]).padding(0.2);

const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g");

// Dropdown-elementet
const dropdown = d3.select("#landSelect");

// Indlæs CSV
d3.csv("Danmarks samlede import og eksport.csv").then(data => {
  // Find alle år i datasættet
  const years = [...new Set(data.map(d => d["År"]))].sort();

  // Find alle lande baseret på kolonnenavne
  const lande = Object.keys(data[0])
    .filter(k => k.startsWith("Import - "))
    .map(k => k.replace("Import - ", ""));

  // Tilføj år + "Samlet" til dropdown
  dropdown.selectAll("option")
    .data([...years, "Samlet"])
    .enter()
    .append("option")
    .text(d => d);

  // Funktion der samler og strukturerer data for valgt år/samlet
  function getData(year) {
    return lande.map(land => {
      let importSum = 0, exportSum = 0;

      const filtered = (year === "Samlet")
        ? data
        : data.filter(d => d["År"] === year);

      filtered.forEach(row => {
        importSum += +row[`Import - ${land}`];
        exportSum += +row[`Eksport - ${land}`];
      });

      return {
        land,
        import: -importSum,  // negativ til venstreside
        export: exportSum    // positiv til højreside
      };
    });
  }

  // Funktion der opdaterer visualiseringen
  function update(year) {
    const bars = getData(year);

    const maxVal = d3.max(bars, d => Math.max(Math.abs(d.import), Math.abs(d.export)));

    x.domain([-maxVal, maxVal]);
    y.domain(bars.map(d => d.land));

    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y).tickFormat(String));

    const groups = svg.selectAll(".barGroup").data(bars, d => d.land);

    const newGroups = groups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", d => `translate(0, ${y(d.land)})`);

    newGroups.append("rect").attr("class", "bar import");
    newGroups.append("rect").attr("class", "bar export");

    // Import-bars
    groups.merge(newGroups).select(".import")
      .transition().duration(500)
      .attr("x", d => x(d.import))
      .attr("width", d => x(0) - x(d.import))
      .attr("height", y.bandwidth());

    // Eksport-bars
    groups.merge(newGroups).select(".export")
      .transition().duration(500)
      .attr("x", x(0))
      .attr("width", d => x(d.export) - x(0))
      .attr("height", y.bandwidth());

    // Fjern grupper der ikke længere bruges
    groups.exit().remove();
  }

  // Lyt til dropdown-ændringer
  dropdown.on("change", function () {
    update(this.value);
  });

  // Start med første år valgt
  update(years[0]);
});
