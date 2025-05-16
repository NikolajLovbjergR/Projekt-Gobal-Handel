import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';  // Importerer D3.js biblioteket fra CDN

// Indlæs CSV-data og konverter tal automatisk
d3.csv("/DB/LineChart.csv", d3.autoType).then(data => {
  // Definer margener og størrelsen på tegneområdet
  const margin = { top: 60, right: 180, bottom: 60, left: 70 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  // Opretter SVG-elementet og en <g> gruppe der forskydes pga. margin
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("font-family", "sans-serif")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X-akse skala (Tid)
  const x = d3.scalePoint()
    .domain(data.map(d => d.Tid))       // Alle tidspunkter i rækkefølge
    .range([0, width])
    .padding(0.5);                      // Ekstra luft i hver ende

  // Y-akse skala (beløb i kr)
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.Eksport, d.Import, d.Netto)) * 1.1]) // Gør plads over topværdi
    .range([height, 0]);

  // Farver for de tre datatyper
  const colors = {
    Eksport: "#27ae60",
    Import: "#c0392b",
    Netto: "#2980b9"
  };

  // ✅ Tooltip er en <div>, som følger musen
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("color", "black")
    .style("padding", "5px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("opacity", 0);  // Starter skjult

  // Gennemløber hver datakategori (Eksport, Import, Netto)
  ["Eksport", "Import", "Netto"].forEach(key => {
    // Tegn en linje for hver kategori
    svg.append("path")
      .datum(data)  // Brug hele datasættet
      .attr("fill", "none")
      .attr("stroke", colors[key])
      .attr("stroke-width", 2.5)
      .attr("d", d3.line()
        .x(d => x(d.Tid))
        .y(d => y(d[key]))
        .curve(d3.curveMonotoneX)  // Gør linjen blød/glat
      );

    // Tegn prikker ved hvert datapunkt
    svg.selectAll(`.dot-${key}`)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", `dot-${key}`)
      .attr("cx", d => x(d.Tid))
      .attr("cy", d => y(d[key]))
      .attr("r", 4)
      .attr("fill", colors[key])
      .attr("opacity", 0.85)
      // Tooltip-effekter:
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`<strong>${key}</strong><br>${d[key].toLocaleString('da-DK')} kr`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);  // Skjul igen
      });

    // Tilføj tekstlabel ved slutningen af linjen
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

  // Tilføj X-akse og roter labels
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .selectAll("text")
    .attr("transform", "rotate(-35)")
    .style("text-anchor", "end");

  // Tilføj Y-akse med dansk talformat
  svg.append("g")
    .call(d3.axisLeft(y).tickFormat(d => d.toLocaleString("da-DK")));

  // Titel over grafen
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")


  // Tekst på Y-aksen
  svg.append("text")
    .attr("x", -height / 2)
    .attr("y", -50)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Beløb i kr.");
});
