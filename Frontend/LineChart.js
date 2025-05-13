import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';  // Importerer D3.js biblioteket

d3.csv("/DB/LineChart.csv", d3.autoType).then(data => {
  const margin = { top: 60, right: 180, bottom: 50, left: 70 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("font-family", "sans-serif")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(data.map(d => d.Tid))
    .range([0, width])
    .padding(0.5);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.Eksport, d.Import, d.Netto)) * 1.1])
    .range([height, 0]);

  const colors = {
    Eksport: "#27ae60",
    Import: "#c0392b",
    Netto: "#2980b9"
  };

  // Tilføjer linjer og punkter
  ["Eksport", "Import", "Netto"].forEach(key => {
    // Linie
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colors[key])
      .attr("stroke-width", 2.5)
      .attr("d", d3.line()
        .x(d => x(d.Tid))
        .y(d => y(d[key]))
        .curve(d3.curveMonotoneX)  // Gør linjen glat og pæn
      );

    // Punktmarkører
    svg.selectAll(`.dot-${key}`)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", `dot-${key}`)
      .attr("cx", d => x(d.Tid))
      .attr("cy", d => y(d[key]))
      .attr("r", 3.5)
      .attr("fill", colors[key])
      .attr("opacity", 0.85);

    // Direkte labels ved enden af hver linje
    const last = data[data.length - 1];
    svg.append("text")
      .attr("x", x(last.Tid) + 6)
      .attr("y", y(last[key]))
      .attr("dy", "0.35em")
      .style("font-size", "13px")
      .style("fill", colors[key])
      .style("font-weight", "bold")
      .text(key);
  });

  // X-akse
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end");

  // Y-akse med tusindtals-separator
  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d.toLocaleString("da-DK")));

  // Titel
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .text("Danmarks Import, Eksport og Nettooverskud over tid");

  // Akse-label (valgfri)
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Beløb i kr.");
});
