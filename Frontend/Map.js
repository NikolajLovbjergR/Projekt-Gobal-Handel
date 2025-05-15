import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

const svg = d3.select('#map-svg');

const projection = d3.geoMercator()
  .scale(250)
  .translate([1350 / 2, 850 / 1.55]);

const pathGenerator = d3.geoPath().projection(projection);

// Mapping fra dansk navn (fra databasen) til engelsk navn (fra D3)
const navnMap = {
  "Tyskland": "Germany",
  "Sverige": "Sweden",
  "Kina": "China",
  "USA": "United States of America",
  "Norge": "Norway",
  "Frankrig og Monaco": "France",
  "Storbritannien": "United Kingdom",
  "Nederlandene": "Netherlands",
  "Italien": "Italy",
  "Polen": "Poland"
};

const locations = {
  Denmark: [10.4515, 56.2639],
  Germany: [10.4515, 51.1657],
  Sweden: [15.6435, 61.1282],
  China: [104.1954, 35.8617],
  'United States of America': [-95.7129, 37.0902],
  Netherlands: [5.2913, 52.1326],
  France: [2.2137, 46.2276],
  Norway: [8.4689, 60.472],
  'United Kingdom': [-3.436, 55.3781],
  Poland: [19.1451, 51.9194],
  Italy: [12.5674, 41.8719]
};

// Handelsdata gemmes her
const handelsdata = {};

d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(worldData => {
  const countries = feature(worldData, worldData.objects.countries).features;

  svg.selectAll('path')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', '#f9f6ee')
    .attr('stroke', '#28282B');

  fetch('http://localhost:3001/api/handel')
    .then(res => res.json())
    .then(data => {
      data.forEach(entry => {
        const engelskNavn = navnMap[entry.land];
        if (engelskNavn) {
          handelsdata[engelskNavn.toLowerCase()] = {
            eksport: parseFloat(entry.total_eksport),
            import: parseFloat(entry.total_import)
          };
        }
      });
 });
      svg.selectAll('path')
        .transition()
        .duration(1000)
        .attr('fill', d => {
          const name = d.properties.name?.toLowerCase();
          const info = handelsdata[name];
          if (!info) return '#ccc';
          return info.eksport > 20000000 ? 'green' : info.eksport > 10000000 ? 'orange' : 'red';
        });

      // Tilføj klik-funktion
svg.selectAll('path')
  .on('click', (event, d) => {
    const infoBox = document.getElementById('info-box');
    const name = d.properties.name;
    const key = name.toLowerCase();
    const info = handelsdata[key];

    console.log('Klik på:', name, '→', key, '→', info); // debug

    if (infoBox) {
      if (info) {
        infoBox.innerHTML = `
          <strong>${name}</strong><br>
          <b>Eksport:</b> ${info.eksport.toLocaleString()} DKK<br>
          <b>Import:</b> ${info.import.toLocaleString()} DKK
        `;
      } else {
        infoBox.innerHTML = `<strong>${name}</strong><br>Ingen handelsdata`;
      }
      infoBox.style.display = 'block';
    }
  });


  // Tegn linjer
  const fromGeo = locations['Denmark'];
  Object.entries(locations).forEach(([name, toGeo]) => {
    if (name === 'Denmark') return;

    const line = {
      type: 'LineString',
      coordinates: [fromGeo, toGeo]
    };

    const path = svg.append('path')
      .datum(line)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', function () {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr('stroke-dashoffset', function () {
        return this.getTotalLength();
      });

    const totalLength = path.node().getTotalLength();

    function animate() {
      path
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(800)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          setTimeout(() => {
            path.attr('stroke-dashoffset', totalLength);
            animate();
          }, 5000);
        });
    }

    animate();
  });
});
