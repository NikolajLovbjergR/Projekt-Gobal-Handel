import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Indlæs data
d3.csv("/DB/LineChart.csv", d3.autoType).then(data => {
  const margin = { top: 50, right: 160, bottom: 40, left: 60 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint()
    .domain(data.map(d => d.Tid))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.Eksport, d.Import)) * 1.1])
    .range([height, 0]);

  const colors = { Eksport: "#2ecc71", Import: "#e74c3c", Netto: "#3498db" };

  ["Eksport", "Import", "Netto"].forEach(key => {
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colors[key])
      .attr("stroke-width", 2)
      .attr("d", d3.line()
        .x(d => x(d.Tid))
        .y(d => y(d[key]))
      );

    svg.append("text")
      .attr("transform", `translate(${x(data[data.length - 1].Tid)},${y(data[data.length - 1][key])})`)
      .attr("x", 5)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", colors[key])
      .text(key);
  });

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0));

  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d.toLocaleString("da-DK")));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Danmarks Import, Eksport og Overskud 2018-2025");
});
