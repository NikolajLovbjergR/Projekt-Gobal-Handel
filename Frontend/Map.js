// Import D3.js (v7) and TopoJSON client using ES module syntax from a CDN
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

// Select the SVG element in your HTML with the ID 'map-svg' to render the map and lines on
const svg = d3.select('#map-svg');

// Define the map projection – this converts geographic coordinates (longitude/latitude) into screen coordinates (x, y)
const projection = d3.geoMercator()
  .scale(250) // Controls how zoomed in/out the map is
  .translate([1350 / 2, 850 / 1.55]); // Moves the map horizontally and vertically to center it in the SVG

// Create a path generator that uses the above projection
// This is used to draw country shapes and lines
const pathGenerator = d3.geoPath().projection(projection);

// Define a set of hardcoded geographic coordinates [longitude, latitude] for selected countries
// These are the origin (Denmark) and targets for animated lines
const locations = {
  Denmark: [10.4515, 56.2639],// Origin country
  Germany: [10.4515, 51.1657],
  Sweden: [15.6435, 61.1282],
  China: [104.1954, 35.8617],
  'United States of America': [-95.7129, 37.0902],
  Netherlands: [5.2913, 52.1326],
  France: [2.2137, 46.2276],
  Norway: [8.4689, 60.472],
  UK: [-3.436, 55.3781],
  Russia: [105.3188, 61.524]
};

// Load the world map using TopoJSON format from a public CDN
// This file contains all country geometries in a compact format
d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(worldData => {
  // Convert the TopoJSON geometries into GeoJSON features (usable by D3)
  const countries = feature(worldData, worldData.objects.countries).features;

  // Draw the base map (all countries)
  svg.selectAll('path')
  .data(countries)
  .enter()
  .append('path')
  .attr('class', 'country')
  .attr('d', pathGenerator)
  .attr('fill', '#f9f6ee')
  .attr('stroke', '#28282B')
  .on('click', (event, d) => {
    const infoBox = document.getElementById('info-box');

    // Get country name (fallback if not available)
    const countryName = d.properties?.name || `ID: ${d.id}`;

    // Show and populate the info box
    infoBox.style.display = 'block';
    infoBox.innerHTML = `
      <strong>${countryName}</strong><br>
      <b>Centroid:</b> ${d3.geoCentroid(d).map(c => c.toFixed(2)).join(', ')}
    `;

    // Optional: place near mouse
    // const [x, y] = d3.pointer(event);
    // infoBox.style.left = `${x + 20}px`;
    // infoBox.style.top = `${y + 20}px`;
  });
    

  // Define the origin country ("from") as Denmark using the hardcoded location
  const fromGeo = locations['Denmark']; // Still in [longitude, latitude]

  // Loop over each entry in the locations object to draw a line from Denmark to the target
  Object.entries(locations).forEach(([name, toGeo]) => {
    if (name === 'Denmark') 
      return; // Skip Denmark itself (no line to self)

    // Create a GeoJSON LineString object representing a line between Denmark and the target country
    const line = {
      type: 'LineString',
      coordinates: [fromGeo, toGeo] // From Denmark to the current target
    };

    // Append a new <path> element for the line
    const path = svg.append('path')
      .datum(line) // Bind the GeoJSON line data
      .attr('d', pathGenerator) // Project the coordinates and convert to SVG path string
      .attr('fill', 'none') // No fill – just a line
      .attr('stroke', 'black') // Line color
      .attr('stroke-width', 2) // Line thickness
      // stroke-dasharray makes the line appear as dashed or animated
      .attr('stroke-dasharray', function () {
        const length = this.getTotalLength(); // Total length of the path
        return `${length} ${length}`; // Set dash pattern equal to total length (one full dash, one full gap)
      })
      // Initially hide the stroke using a full offset (makes it invisible until animated)
      .attr('stroke-dashoffset', function () {
        return this.getTotalLength();
      });
      

    // Store the length to use for animation
    const totalLength = path.node().getTotalLength();

    // Define a function to animate the line drawing
    function animate() {
      path
        .attr('stroke-dashoffset', totalLength) // Reset to fully hidden
        .transition() // Start a transition
        .duration(800) // Animation duration in milliseconds
        .ease(d3.easeLinear) // Constant speed
        .attr('stroke-dashoffset', 0) // Draw the line by reducing dash offset to 0
        .on('end', () => {
          // After animation ends, wait 2 seconds and repeat
          setTimeout(() => {
            path.attr('stroke-dashoffset', totalLength); // Reset
            animate(); // Loop again
          }, 5000);
        });
    }

    

    // Start the animation loop
    animate();
  });
});



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