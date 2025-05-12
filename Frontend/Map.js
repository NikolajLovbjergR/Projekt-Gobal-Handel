
    import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
    import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

    const svg = d3.select('svg');

    const projection = d3.geoMercator()
      .scale(250)
      .translate([1350 / 2, 750 / 1.4]);

    const pathGenerator = d3.geoPath().projection(projection);

    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
      const countries = feature(data, data.objects.countries);
      svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .attr('fill', '#f9f6ee')
        .attr('stroke', '#28282B');
    });