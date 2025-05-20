import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';  // Importerer D3.js biblioteket

fetch("/api/linechart")
  .then(res => res.json())
  .then(data => {
    // Konverter tal og sortér
    data.forEach(d => {
      d.Tid = d.Tid.toString(); // for skalaen
      d.Eksport = +d.Eksport;
      d.Import = +d.Import;
      d.Netto = +d.Netto;
    });

    const margin = { top: 60, right: 180, bottom: 60, left: 70 },
          width = 1000 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background-color", "#28282B")
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

    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip-line")

    // Akser
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("path, line, text")
      .attr("stroke", "#f9f6ee")

    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("path, line, text")
      .attr("stroke", "#f9f6ee")


    // Linjefunktion
    const line = key => d3.line()
      .x(d => x(d.Tid))
      .y(d => y(d[key]));

    ["Eksport", "Import", "Netto"].forEach(key => {
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", colors[key])
        .attr("stroke-width", 2)
        .attr("d", line(key));

      svg.selectAll(`circle.${key}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", key)
        .attr("cx", d => x(d.Tid))
        .attr("cy", d => y(d[key]))
        .attr("r", 4)
        .attr("fill", colors[key])
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
          .html(`<strong>${key}</strong><br>${d[key].toLocaleString('da-DK')} milliarder kroner`);
        })
        .on("mousemove", event => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));
    });

    // Forklaring (legend)
    const legend = svg.selectAll(".legend")
      .data(Object.keys(colors))
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

    legend.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => colors[d]);

    legend.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .attr("fill", "#f9f6ee")
      .text(d => d);
  })
  .catch(error => {
    console.error("Fejl ved hentning af linechart-data:", error);
  });
