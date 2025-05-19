import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const margin = { top: 10, right: 20, bottom: 10, left: 20 },
      width = 2000 - margin.left - margin.right,
      height = 750 - margin.top - margin.bottom;

const svg = d3.select("#treemap")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("background", "white")
  .style("color", "black")
  .style("padding", "5px 10px")
  .style("border-radius", "4px")
  .style("box-shadow", "0 0 5px rgba(0,0,0,0.15)")
  .style("display", "none");

fetch("http://localhost:3001/api/treemap")
  .then(res => res.json())
  .then(data => {
    data.forEach(d => {
      d.værdi = +d.værdi;
      d.year = d.year.toString();
    });

    const years = [...new Set(data.map(d => d.year))].sort();

    const dropdown = d3.select("#treemap")
      .insert("div", ":first-child")
      .attr("id", "controls")
      .style("margin-bottom", "20px")
      .append("select")
      .attr("id", "yearDropdown");

    dropdown.selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .attr("value", d => d)
      .text(d => d);

    dropdown.on("change", function () {
      updateTreemap(this.value);
    });

    const legend = d3.select("#treemap")
  .append("div")
  .attr("id", "legend")
  .style("margin-top", "20px")
  .style("display", "flex")
  .style("gap", "20px")
  .style("font-family", "sans-serif");

legend.append("div").html(`
  <div style="width:20px;height:20px;background:mediumseagreen;display:inline-block;margin-right:8px;"></div>
  Eksport
`);

legend.append("div").html(`
  <div style="width:20px;height:20px;background:tomato;display:inline-block;margin-right:8px;"></div>
  Import
`);

    updateTreemap(years[0]);

    function updateTreemap(selectedYear) {
      const yearData = data.filter(d => d.year === selectedYear);

      const hierarchyData = {
        name: "root",
        children: ["Eksport", "Import"].map(type => ({
          name: type,
          children: yearData
            .filter(d => d.type === type)
            .map(d => ({
              name: d.produkt,
              value: d.værdi,
              type: d.type,
              land: d.land
            }))
        }))
      };

      const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value);

      const treemapLayout = d3.treemap()
        .size([width, height])
        .padding(1);

      treemapLayout(root);

      const colorScale = {
        "Eksport": "mediumseagreen",
        "Import": "tomato"
      };

      const nodes = svg.selectAll("g.node")
        .data(root.leaves(), d => d.data.name + d.data.type + d.data.land);

      const nodeEnter = nodes.enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

      nodeEnter.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale[d.data.type])
        .on("mouseover", (event, d) => {
          tooltip.style("display", "block")
            .html(`<strong>${d.data.name}</strong><br>${d.data.type} fra <em>${d.data.land}</em>:<br>${d.data.value.toLocaleString()} kr.`);
        })
        .on("mousemove", event => {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

      nodeEnter.append("text")
        .attr("x", 4)
        .attr("y", 14)
        .text(d => d.data.name)
        .style("font-size", "12px")
        .style("fill", "white");

      nodes.transition()
        .duration(500)
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .select("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

      nodes.exit().remove();
    }
  })
  .catch(error => {
    console.error("Fejl ved hentning af treemap-data:", error);
  });
