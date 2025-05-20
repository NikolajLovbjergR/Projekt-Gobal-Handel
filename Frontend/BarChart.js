// Importér D3-biblioteket via CDN
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Margener og tegneområde
const margin = { top: 40, right: 30, bottom: 50, left: 120 },
      width = 1100 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Opret SVG-elementet og flyt gruppen ind med margin
const svg = d3.select("#bar-svg")
  .attr("width", width + margin.left + margin.right)   // total bredde
  .attr("height", height + margin.top + margin.bottom) // total højde
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`); // forskydning ift. margin

// Opret x- og y-skalaer
const x = d3.scaleLinear().range([0, width]); // lineær skala til både import og eksport
const y = d3.scaleBand().range([0, height]).padding(0.2); // kategorisk skala for lande

// Opret akser (placeret men ikke udfyldt endnu)
const xAxis = svg.append("g").attr("transform", `translate(0,${height})`); // nederst
const yAxis = svg.append("g"); // venstre

// Dropdown-element til valg af år
const dropdown = d3.select("#yearSelect");

// Opret tooltip (usynlig til at starte med)
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

// Hent data fra server
fetch("/api/samlede")
  .then(res => res.json())
  .then(data => {
    // Konverter værdier fra tekst til tal
    data.forEach(d => {
      d.import = +d.import;
      d.eksport = +d.eksport;
      d.tid = +d.tid;
    });

    // Find unikke år og tilføj dem til dropdown
    const years = [...new Set(data.map(d => d.tid))].sort();
    dropdown.selectAll("option")
      .data(years)
      .enter()
      .append("option")
      .text(d => d);

    // Vis første år som standard
    updateChart(years[0]);

    // Skift diagram når dropdown ændres
    dropdown.on("change", function () {
      updateChart(+this.value);
    });

    // Funktion til at opdatere diagrammet
    function updateChart(selectedYear) {
      // Filtrér data for det valgte år
      const yearData = data.filter(d => d.tid === selectedYear);

      // Sortér lande efter højeste værdi af import eller eksport
      yearData.sort((a, b) => Math.max(b.import, b.eksport) - Math.max(a.import, a.eksport));

      // Find største værdi (brugt til at sætte skalaen symmetrisk omkring nul)
      const maxValue = d3.max(yearData, d => Math.max(d.import, d.eksport));
      x.domain([-maxValue, maxValue]);
      y.domain(yearData.map(d => d.land));

      // Opdater akser med overgang
      xAxis.transition().duration(800)
      .call(d3.axisBottom(x).ticks(10))
      .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-0.8em")
          .attr("dy", "0.15em")
          .attr("transform", "rotate(-45)");
      yAxis.transition().duration(800).call(d3.axisLeft(y));

      // Data binding: find eksisterende bar-grupper
      const bars = svg.selectAll("g.bar-group")
        .data(yearData, d => d.land); // key: land

      // ENTER: nye grupper for lande
      const barsEnter = bars.enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", d => `translate(0, ${y(d.land)})`);

      // Tegn import-bar (venstre side)
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

      // Tegn eksport-bar (højre side)
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

      // UPDATE: opdater eksisterende søjler (både import og eksport)
      bars.selectAll("rect")
        .data(d => [d, d]) // to bars per land
        .transition()
        .duration(800)
        .attr("x", (d, i) => i === 0 ? x(-d.import) : x(0)) // import = venstre, eksport = højre
        .attr("width", (d, i) => i === 0 ? x(0) - x(-d.import) : x(d.eksport) - x(0))
        .attr("height", y.bandwidth())
        .attr("fill", (d, i) => i === 0 ? "tomato" : "mediumseagreen");

      // EXIT: fjern bar-grupper som ikke længere bruges
      bars.exit().remove();
    }
  })
  .catch(error => {
    // Fejlhåndtering ved problemer med at hente data
    console.error("Fejl ved hentning af data:", error);
  });
