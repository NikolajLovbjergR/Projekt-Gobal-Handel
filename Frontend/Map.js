import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'; // importere D3
import { feature } from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm'; // importere feature en funsktion fra TopoJSON der konvertere til geoJSON

const svg = d3.select('#map-svg'); // Vælger SVG elementet i HTML som kortet skal vises i

const projection = d3.geoMercator() // Vælger type kortprojektion i vores tilfælde 'Mercator'
  .scale(180)
  .translate([1050 / 2, 650 / 1.45]);

const pathGenerator = d3.geoPath().projection(projection); // Bruges til at konvertere GeoJSON objecter til SVG-paths baseret på projection

const handelsdata = {}; // Et tomt object der senere skal holde handelsdata per land og år

const totalHandelPerLand = {}; // Et tomt object der senere skal holde total handel per land

// Her hardcoder jeg lokationerne hvor linjerne skal ende på vores map
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

// D3 henter en verdenskort fil i TopoJSON format fra internettet. Når kortet er hentet kalder vi worldData
d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json').then(worldData => {
  const countries = feature(worldData, worldData.objects.countries).features; // Her bliver TopoJSON konveteret til geoJSON som D3 kan forstå

// Her tegner vi lande ind på kortet
  svg.selectAll('path')
    .data(countries) // For hvert land laver vi et omrids med farven #28282B hvor vi bruger pathGenerator til at beregne formen
    .enter()
    .append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('stroke', '#28282B');

  fetch('/api/handel') // Henter handelsdata fra vores backend via /api/handel
    .then(res => res.json())
    .then(data => {
data.forEach(entry => {                       // Går igennem hvert element i data-arrayet
  const country = entry.land?.toLowerCase();  // ? gør at den kun forsøger .toLowerCase hvis et land eksistere. For at undgå fejl ved undefined
  const year = entry.tid;                     // Henter år
  const imp = parseFloat(entry.total_import); // De her 2 konvertere import/eksport værdierne fra string til float så man kan regne med dem
  const exp = parseFloat(entry.total_eksport);

  if (!handelsdata[country]) handelsdata[country] = {}; // Tjekker om der findes data for et land i handelsdata og opretter et tomt objekt hvis der ikke er
  handelsdata[country][year] = {              // Gemmer imp/eksport data for bestemt land og år i handelsdata
    import: imp,
    eksport: exp
  };

  if (!totalHandelPerLand[country]) totalHandelPerLand[country] = 0; // Hvis landet ikke findes i totalHandelPerLand bliver det til 0
  totalHandelPerLand[country] += imp + exp;   // Ligger import og eksport sammen og går det til landets samlede handel
});

// Lav en sorteret liste over lande efter samlet handel og tilføj rank
const sortedLande = Object.entries(totalHandelPerLand) // Laver totalHandelPerLand om til et array
  .sort((a, b) => b[1] - a[1]) // Her sortere jeg så det land med mest handel er nummer 1
  .map(([land], index) => ({ land, rank: index + 1 })); // Mapper hvert [land, værdi] par til et nyt object med land og rank. index +1 gør at første land får nummer 1

const ranks = {};                             // Her gemmer vi rank til landene 
sortedLande.forEach(({ land, rank }) => {     // Gennemgår de sorterede lande og ligger hver land og rank ind i ranks objectet
  ranks[land] = rank;

});


svg.selectAll('path') // Ved at klikke på et land vises handelsdata i en infoboks 
  .on('click', (event, d) => {
    const infoBox = document.getElementById('info-box');
    const name = d.properties.name; // Her finder vi landenes navn og matcher det med vores data
    const key = name.toLowerCase();
    const countryData = handelsdata[key];

    if (infoBox) { // infoBox er den lille box der kommer op når man trykker på et land
      if (countryData) {  // Her viser vi handelsdata og giver beskeden 'Ingen handelsdata' hvis der ikke er nogen data
        const rank = ranks[key] ? ` #${ranks[key]}` : '';
        let html = `<strong>${name}${rank}</strong><br>`;
        const years = Object.keys(countryData).sort();
        years.forEach(year => {
          const entry = countryData[year];
          html += `
            <b>${year}</b><br>
            Eksport: ${entry.eksport.toLocaleString()} DKK<br>
            Import: ${entry.import.toLocaleString()} DKK<br><br>
          `;
        });
        infoBox.innerHTML = html;
      } else {
        infoBox.innerHTML = `<strong>${name}</strong><br>Ingen handelsdata`;
      }
      infoBox.style.display = 'block';
    }
  });

  // Her tegner og animere vi linjerne på kortet
  const fromGeo = locations['Denmark'];
  Object.entries(locations).forEach(([name, toGeo]) => {
    if (name === 'Denmark') return;

    // Fra danmark lokation til de 10 landes kordinater som er defineret længere oppe
    const line = {
      type: 'LineString',
      coordinates: [fromGeo, toGeo]
    };

    // Her animere vi linjerne så det ligner de bevæger sig 
    const path = svg.append('path')
      .datum(line)
      .attr('d', pathGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#f9f6ee')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', function () {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr('stroke-dashoffset', function () {
        return this.getTotalLength();
      });

    const totalLength = path.node().getTotalLength();

    // En function der laver selve animationen. Starter med at linjen er usyndlig, animere så den tegnes gradvist over 800ms og så holder en 5s pause før animationen starter forfra
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
});
