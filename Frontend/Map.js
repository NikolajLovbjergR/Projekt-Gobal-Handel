// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoMercator()
    .scale(140)
    .translate([width/2, height/ 1.4])


const denmarkCoords = [9.5018, 56.2639]; // [lon, lat]

// Create data: coordinates of start and end
const link = [
    {type: "LineString", coordinates: [[9.5018, 56.2639], [13.4050, 52.5200]]}, // to Germany
    {type: "LineString", coordinates: [[9.5018, 56.2639], [4.9041, 52.3676]]}, 
    {type: "LineString", coordinates: [[9.5018, 56.2639], [4.9041, 52.3676]]},
  ];
  
// A path generator
const path = d3.geoPath()
    .projection(projection)

// Load world shape
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then( function(data){

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
            .attr("fill", "#fff")
            .attr("d", path)
            .style("stroke", "#222")
            .style("stroke-width", 1)

    // Add the path
    svg.selectAll("myPath")
      .data(link)
      .join("path")
        .attr("d", function(d){ return path(d)})
        .style("fill", "none")
        .style("stroke", "orange")
        .style("stroke-width", 1)

})
