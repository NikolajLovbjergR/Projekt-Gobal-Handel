// Importerer D3.js biblioteket fra CDN
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

fetch("http://localhost:3001/api/linechart")
  .then(res => res.json())
  .then(data => {
    // Forbered data: konverter tekst til tal og ensret formater
    data.forEach(d => {
      d.Tid = d.Tid.toString();   // Året konverteres til string (nødvendigt for x-skala)
      d.Eksport = +d.Eksport;
      d.Import = +d.Import;
      d.Netto = +d.Netto;
    });

    // Definer margener og beregn bredde og højde på selve tegneområdet
    const margin = { top: 60, right: 180, bottom: 60, left: 70 },
          width = 1000 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Opret og konfigurer SVG-elementet
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)  // total bredde
      .attr("height", height + margin.top + margin.bottom) // total højde
      .style("background-color", "#28282B")               // mørk baggrund
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`); // flyt tegneområde ift. margener

    // X-akse: scalePoint fordi vi bruger diskrete årstal
    const x = d3.scalePoint()
      .domain(data.map(d => d.Tid)) // årstal som labels
      .range([0, width])
      .padding(0.5);

    // Y-akse: lineær skala, med lidt ekstra luft i toppen (110%)
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.Eksport, d.Import, d.Netto)) * 1.1])
      .range([height, 0]);

    // Farver til de tre datatyper
    const colors = {
      Eksport: "#27ae60",    // grøn
      Import: "#c0392b",     // rød
      Netto: "#2980b9"       // blå
    };

    // Tooltip til visning af værdi ved hover
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip-line"); // skal styles i CSS

    // Tilføj X-akse med styling
    svg.append("g")
      .attr("transform", `translate(0,${height})`) // nederst
      .call(d3.axisBottom(x))
      .selectAll("path, line, text")
      .attr("stroke", "#f9f6ee"); // lyse akser til mørk baggrund

    // Tilføj Y-akse med styling
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("path, line, text")
      .attr("stroke", "#f9f6ee");

    // Funktion der returnerer en linjefunktion for et givent datafelt
    const line = key => d3.line()
      .x(d => x(d.Tid))
      .y(d => y(d[key]));

    // For hver af de tre dataserier: tegn linje og punkter
    ["Eksport", "Import", "Netto"].forEach(key => {
      // Tegn linjen
      svg.append("path")
        .datum(data)  // én path pr. serie
        .attr("fill", "none")
        .attr("stroke", colors[key])
        .attr("stroke-width", 2)
        .attr("d", line(key)); // linjefunktion baseret på valgte felt

      // Tegn datapunkter (små cirkler)
      svg.selectAll(`circle.${key}`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", key) // f.eks. class="Eksport"
        .attr("cx", d => x(d.Tid))
        .attr("cy", d => y(d[key]))
        .attr("r", 4)
        .attr("fill", colors[key])
        .on("mouseover", (event, d) => {
          // Vis tooltip med format
          tooltip.style("display", "block")
            .html(`<strong>${key}</strong><br>${d[key].toLocaleString('da-DK')} milliarder kroner`);
        })
        .on("mousemove", event => {
          // Flyt tooltip når musen bevæger sig
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
          // Skjul tooltip når musen forlader punktet
          tooltip.style("display", "none");
        });
    });

    // Opret forklaring (legend) ude til højre
    const legend = svg.selectAll(".legend")
      .data(Object.keys(colors)) // ["Eksport", "Import", "Netto"]
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`); // placer hver række under hinanden

    // Farvede firkanter i forklaring
    legend.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => colors[d]);

    // Tekst i forklaring
    legend.append("text")
      .attr("x", 25)
      .attr("y", 15)
      .attr("fill", "#f9f6ee")
      .text(d => d);
  })
  .catch(error => {
    // Vis fejl i konsollen hvis data ikke kunne hentes
    console.error("Fejl ved hentning af linechart-data:", error);
  });
