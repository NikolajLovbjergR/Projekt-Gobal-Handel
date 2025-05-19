import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Margener og tegneområde
const margin = { top: 40, right: 30, bottom: 50, left: 120 },
      width = 1000 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

const svg = d3.select("#bar-svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Skalaer
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleBand().range([0, height]).padding(0.2);

// Akser
const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g");

// Dropdown
const dropdown = d3.select("#yearSelect");

// Tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("border", "1px solid #ccc")
  .style("padding", "6px 10px")
  .style("border-radius", "4px")
  .style("box-shadow", "0 0 5px rgba(0,0,0,0.1)")
  .style("pointer-events", "none")
  .style("display", "none");

// Hent data fra server
fetch("http://localhost:3001/api/samlede")
  .then(res => res.json())
  .then(data => {
    data.forEach(d => {
      d.import = +d.import;
      d.eksport = +d.eksport;
      d.tid = +d.tid;
    });

    const years = [...new Set(data.map(d => d.tid))].sort();
    dropdown.selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(d => d);

    updateChart(years[0]);

    dropdown.on("change", function () {
      updateChart(+this.value);
    });

    function updateChart(selectedYear) {
      const yearData = data.filter(d => d.tid === selectedYear);

      // Sortering efter største værdi (import eller eksport)
      yearData.sort((a, b) => Math.max(b.import, b.eksport) - Math.max(a.import, a.eksport));

      const maxValue = d3.max(yearData, d => Math.max(d.import, d.eksport));
      x.domain([-maxValue, maxValue]);
      y.domain(yearData.map(d => d.land));

      xAxis.transition().duration(800).call(d3.axisBottom(x).ticks(10));
      yAxis.transition().duration(800).call(d3.axisLeft(y));

      const bars = svg.selectAll("g.bar-group")
        .data(yearData, d => d.land);

      const barsEnter = bars.enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0, ${y(d.land)})`);

      // Import (venstre, rød)
      barsEnter.append("rect")
        .attr("x", d => x(-d.import))
        .attr("y", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(0) - x(-d.import))
        .attr("fill", "tomato")
        .on("mouseover", function (event, d) {
          tooltip.style("display", "block")
                 .html(`<strong>Import:</strong> ${Math.abs(d.import).toLocaleString('da-DK')} milliarder kroner`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      // Eksport (højre, grøn)
      barsEnter.append("rect")
        .attr("x", x(0))
        .attr("y", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.eksport) - x(0))
        .attr("fill", "mediumseagreen")
        .on("mouseover", function (event, d) {
          tooltip.style("display", "block")
                 .html(`<strong>Eksport:</strong> ${Math.abs(d.eksport).toLocaleString('da-DK')} milliarder kroner`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      // UPDATE
      bars.selectAll("rect")
        .data(d => [d, d])
        .transition()
        .duration(800)
        .attr("x", (d, i) => i === 0 ? x(-d.import) : x(0))
        .attr("width", (d, i) => i === 0 ? x(0) - x(-d.import) : x(d.eksport) - x(0))
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) => i === 0 ? "tomato" : "mediumseagreen");

      // EXIT
      bars.exit().remove();
    }
  })
  .catch(error => {
    console.error("Fejl ved hentning af data:", error);
  });
