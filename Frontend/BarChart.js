const margin = { top: 40, right: 30, bottom: 50, left: 100 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().range([0, height]).padding(0.2);

const xAxis = svg.append("g")
  .attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g");

const dropdown = d3.select("#yearSelect");

// Tooltip container
const tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("padding", "6px 10px")
  .style("background", "#ffffff")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("pointer-events", "none")
  .style("box-shadow", "0px 2px 6px rgba(0,0,0,0.1)")
  .style("font-size", "13px")
  .style("color", "#333")
  .style("opacity", 0);

Promise.all([
  d3.csv("/DB/BarChart_import.csv"),
  d3.csv("/DB/BarChart_eksport.csv")
]).then(([importData, eksportData]) => {
  const years = [...new Set(importData.map(d => d["År"]))].sort();

  dropdown.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .text(d => d);

  function update(year) {
    const imp = importData.filter(d => d["År"] === year);
    const exp = eksportData.filter(d => d["År"] === year);

    const data = imp.map(d => {
      const match = exp.find(e => e.LAND === d.LAND);
      return {
        land: d.LAND,
        import: -(+d.IMPORT),
        export: match ? +match.EKSPORT : 0
      };
    });

    const maxVal = d3.max(data, d => Math.max(Math.abs(d.import), Math.abs(d.export)));
    x.domain([-maxVal, maxVal]);
    y.domain(data.map(d => d.land));

    xAxis.transition().duration(500).call(d3.axisBottom(x));
    yAxis.transition().duration(500).call(d3.axisLeft(y));

    const groups = svg.selectAll(".barGroup").data(data, d => d.land);

    const newGroups = groups.enter()
      .append("g")
      .attr("class", "barGroup")
      .attr("transform", d => `translate(0, ${y(d.land)})`);

    newGroups.append("rect").attr("class", "bar import");
    newGroups.append("rect").attr("class", "bar export");

    // IMPORT bars
    groups.merge(newGroups).select(".import")
      .transition().duration(500)
      .attr("x", d => x(d.import))
      .attr("width", d => x(0) - x(d.import))
      .attr("height", y.bandwidth())
      .attr("fill", "#e74c3c");

    groups.merge(newGroups).select(".import")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>Import:</strong> ${Math.abs(d.import).toLocaleString()} kr`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // EKSPORT bars
    groups.merge(newGroups).select(".export")
      .transition().duration(500)
      .attr("x", x(0))
      .attr("width", d => x(d.export) - x(0))
      .attr("height", y.bandwidth())
      .attr("fill", "#2ecc71");

    groups.merge(newGroups).select(".export")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>Eksport:</strong> ${d.export.toLocaleString()} kr`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    groups.exit().remove();
  }

  dropdown.on("change", function () {
    update(this.value);
  });

  update(years[0]);
});
