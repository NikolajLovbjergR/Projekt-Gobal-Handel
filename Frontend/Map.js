/** 
    import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
    import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

    const svg = d3.select('svg');

    const projection = d3.geoMercator()
      .scale(250)
      .translate([1350 / 2, 850 / 1.4]);

    const pathGenerator = d3.geoPath().projection(projection);

    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
      const countries = feature(data, data.objects.countries);
      svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', pathGenerator)
        .attr('fill', '#f9f6ee')
        .attr('stroke', '#28282B');
    });
**/

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

const svg = d3.select('#map-svg');

const projection = d3.geoMercator()
  .scale(250)
  .translate([1350 / 2, 850 / 1.55]);

const pathGenerator = d3.geoPath().projection(projection);

const targets = ['Germany', 'United States of America', 'Sweden', 'China'];

d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(data => {
  const countries = feature(data, data.objects.countries).features;
  const nameMap = new Map(data.objects.countries.geometries.map(d => [d.id, d.properties.name]));

  countries.forEach(f => {
    f.properties.name = nameMap.get(f.id);
  });

  svg.selectAll('path')
    .data(countries)
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', '#f9f6ee')
    .attr('stroke', '#28282B');

  const fromCountry = countries.find(d => d.properties.name === 'Denmark');
  const from = pathGenerator.centroid(fromCountry);
  const fromGeo = projection.invert(from);

  targets.forEach(name => {
    const toCountry = countries.find(d => d.properties.name === name);
    if (!toCountry) return;

    const to = pathGenerator.centroid(toCountry);
    const toGeo = projection.invert(to);

    const lineData = {
      type: 'LineString',
      coordinates: [fromGeo, toGeo]
    };

    const path = svg.append('path')
      .datum(lineData)
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

    function animateLine() {
      path
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
        .on('end', () => {
          // Wait 2 seconds, then reset and start again
          setTimeout(() => {
            path.attr('stroke-dashoffset', totalLength);
            animateLine(); // Repeat
          }, 2000);
        });
    }

    animateLine();
  });
});
